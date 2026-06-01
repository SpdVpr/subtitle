import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import { getAdminDb } from '@/lib/firebase-admin'
import { FieldValue } from 'firebase-admin/firestore'
import { STRIPE_PAYMENT_LINKS } from '@/lib/stripe-payment-links'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-07-30.basil',
})

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!

function getPackageName(credits: number): string {
  if (credits <= 100) return 'Trial Pack'
  if (credits <= 500) return 'Starter Pack'
  if (credits <= 1200) return 'Popular Pack'
  if (credits <= 2500) return 'Professional Pack'
  return 'Enterprise Pack'
}

// Last-resort fallback: derive credits from the amount paid (in cents)
// by matching against the configured payment-link packages.
function creditsFromAmount(amountTotal: number | null | undefined): number {
  if (!amountTotal) return 0
  const match = STRIPE_PAYMENT_LINKS.find(
    (pkg) => Math.round(pkg.price * 100) === amountTotal
  )
  return match?.credits ?? 0
}

export async function GET(request: NextRequest) {
  return NextResponse.json({
    status: 'Webhook endpoint is working',
    timestamp: new Date().toISOString(),
    url: request.url,
  })
}

export async function POST(request: NextRequest) {
  const timestamp = new Date().toISOString()

  // 1) Read the raw body + signature.
  //    IMPORTANT: use request.headers (sync Web Headers), NOT next/headers' headers()
  //    which is async in Next.js 16 and would throw "headersList.get is not a function".
  let body: string
  let signature: string | null
  try {
    body = await request.text()
    signature = request.headers.get('stripe-signature')
  } catch (err) {
    console.error('❌ Failed to read webhook request body:', err)
    return NextResponse.json({ error: 'Failed to read body' }, { status: 400 })
  }

  if (!signature) {
    console.error('❌ Missing Stripe signature header')
    return NextResponse.json({ error: 'Missing signature' }, { status: 400 })
  }

  if (!webhookSecret) {
    // Misconfiguration — return 500 so the failure is visible (Stripe will retry).
    console.error('❌ STRIPE_WEBHOOK_SECRET is not configured')
    return NextResponse.json({ error: 'Webhook secret not configured' }, { status: 500 })
  }

  // 2) Verify the signature.
  let event: Stripe.Event
  try {
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret)
  } catch (err) {
    console.error(
      '❌ Webhook signature verification failed:',
      err instanceof Error ? err.message : err
    )
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
  }

  console.log(`🔗 Stripe webhook received: ${event.type} (${event.id}) at ${timestamp}`)

  // 3) Only checkout.session.completed grants credits. Acknowledge everything else.
  if (event.type !== 'checkout.session.completed') {
    console.log(`ℹ️ Ignoring event type: ${event.type}`)
    return NextResponse.json({ received: true, ignored: event.type })
  }

  const session = event.data.object as Stripe.Checkout.Session

  // Only fulfil paid sessions (e.g. async payment_status === 'paid').
  if (session.payment_status && session.payment_status !== 'paid') {
    console.log(
      `ℹ️ Session ${session.id} not paid (status: ${session.payment_status}) - skipping`
    )
    return NextResponse.json({ received: true, skipped: 'unpaid' })
  }

  // 4) Resolve the user.
  const userId = session.client_reference_id
  if (!userId) {
    console.error('❌ No client_reference_id found in session', session.id)
    return NextResponse.json({ error: 'No user ID found in session' }, { status: 400 })
  }

  // 5) Resolve credits: success_url (?credits=N) → metadata → amount fallback.
  let creditsToAdd = 0
  if (session.success_url) {
    try {
      creditsToAdd = parseInt(
        new URL(session.success_url).searchParams.get('credits') || '0',
        10
      )
    } catch (error) {
      console.error('❌ Failed to parse success_url:', error)
    }
  }
  if (!creditsToAdd && session.metadata?.credits) {
    creditsToAdd = parseInt(session.metadata.credits, 10)
    console.log('🔍 Credits resolved from metadata:', creditsToAdd)
  }
  if (!creditsToAdd) {
    creditsToAdd = creditsFromAmount(session.amount_total)
    if (creditsToAdd) {
      console.log('🔍 Credits resolved from amount fallback:', creditsToAdd)
    }
  }

  if (!Number.isFinite(creditsToAdd) || creditsToAdd <= 0) {
    // Real payment we cannot map to credits — fail loudly so Stripe retries and we get alerted.
    console.error('❌ Could not resolve credits for paid session', session.id, {
      successUrl: session.success_url,
      metadata: session.metadata,
      amountTotal: session.amount_total,
    })
    return NextResponse.json({ error: 'Could not resolve credits' }, { status: 400 })
  }

  // 6) Grant credits idempotently.
  try {
    const result = await grantCredits(userId, creditsToAdd, {
      sessionId: session.id,
      amountPaid: session.amount_total || 0,
      currency: session.currency || 'usd',
      packageName: getPackageName(creditsToAdd),
      paymentMethod: 'stripe_payment_link',
      customerEmail:
        session.customer_details?.email || session.metadata?.user_email || null,
    })

    if (result.alreadyProcessed) {
      console.log(`✅ Session ${session.id} already processed - skipping (idempotent)`)
      return NextResponse.json({ received: true, idempotent: true })
    }

    console.log(`✅ Added ${creditsToAdd} credits to user ${userId} (session ${session.id})`)
    return NextResponse.json({ received: true, creditsAdded: creditsToAdd, userId })
  } catch (error) {
    // 500 → Stripe will retry the delivery.
    console.error('❌ Failed to grant credits:', error)
    return NextResponse.json({ error: 'Failed to grant credits' }, { status: 500 })
  }
}

async function grantCredits(
  userId: string,
  credits: number,
  details: {
    sessionId: string
    amountPaid: number
    currency: string
    packageName: string
    paymentMethod: string
    customerEmail: string | null
  }
): Promise<{ alreadyProcessed: boolean }> {
  const adminDb = getAdminDb()
  const txCol = adminDb.collection('creditTransactions')
  // Deterministic doc id keyed on the Stripe session → natural idempotency key.
  const dedupeRef = txCol.doc(details.sessionId)

  return adminDb.runTransaction(async (tx) => {
    // --- All reads first (Firestore requirement) ---
    const dedupeSnap = await tx.get(dedupeRef)
    if (dedupeSnap.exists) {
      return { alreadyProcessed: true }
    }
    // Also catch transactions created by manual recovery tooling (auto-id docs
    // that carry stripeSessionId), so we never double-credit a session.
    const existingBySession = await tx.get(
      txCol.where('stripeSessionId', '==', details.sessionId).limit(1)
    )
    if (!existingBySession.empty) {
      return { alreadyProcessed: true }
    }

    // --- Then writes ---
    // set+merge creates the user doc if it doesn't exist yet (avoids update() throwing).
    const userRef = adminDb.collection('users').doc(userId)
    tx.set(
      userRef,
      {
        creditsBalance: FieldValue.increment(credits),
        creditsTotalPurchased: FieldValue.increment(credits),
        updatedAt: FieldValue.serverTimestamp(),
      },
      { merge: true }
    )

    tx.set(dedupeRef, {
      userId,
      type: 'credit',
      credits,
      description: `Purchased ${credits} credits - ${details.packageName}`,
      source: 'stripe_payment_link',
      stripeSessionId: details.sessionId,
      amountPaid: details.amountPaid,
      currency: details.currency,
      paymentMethod: details.paymentMethod,
      customerEmail: details.customerEmail,
      createdAt: FieldValue.serverTimestamp(),
      date: new Date().toISOString().split('T')[0], // YYYY-MM-DD
    })

    const paymentRef = adminDb.collection('payments').doc(details.sessionId)
    tx.set(
      paymentRef,
      {
        userId,
        stripeSessionId: details.sessionId,
        amount: details.amountPaid,
        currency: details.currency,
        credits,
        packageName: details.packageName,
        paymentMethod: details.paymentMethod,
        customerEmail: details.customerEmail,
        status: 'completed',
        createdAt: FieldValue.serverTimestamp(),
      },
      { merge: true }
    )

    return { alreadyProcessed: false }
  })
}
