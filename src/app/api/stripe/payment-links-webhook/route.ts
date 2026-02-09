import { NextRequest, NextResponse } from 'next/server'
import { headers } from 'next/headers'
import Stripe from 'stripe'
import { getAdminDb } from '@/lib/firebase-admin'
import { FieldValue } from 'firebase-admin/firestore'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-12-18.acacia',
})

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!

function getPackageName(credits: number): string {
  if (credits <= 100) return 'Trial Pack'
  if (credits <= 500) return 'Starter Pack'
  if (credits <= 1200) return 'Popular Pack'
  if (credits <= 2500) return 'Professional Pack'
  return 'Enterprise Pack'
}

export async function GET(request: NextRequest) {
  return NextResponse.json({
    status: 'Webhook endpoint is working',
    timestamp: new Date().toISOString(),
    url: request.url
  })
}

export async function POST(request: NextRequest) {
  const timestamp = new Date().toISOString()
  console.log('🔗 WEBHOOK RECEIVED AT:', timestamp)
  console.log('🔗 REQUEST URL:', request.url)
  console.log('🔗 REQUEST METHOD:', request.method)

  try {
    const body = await request.text()
    const headersList = headers()
    const signature = headersList.get('stripe-signature')

    console.log('📝 WEBHOOK DETAILS:', {
      timestamp,
      hasSignature: !!signature,
      bodyLength: body.length,
      bodyPreview: body.substring(0, 200) + '...',
      headers: Object.fromEntries(headersList.entries()),
      webhookSecretConfigured: !!webhookSecret
    })

    if (!signature) {
      console.error('Missing Stripe signature')
      return NextResponse.json({ error: 'Missing signature' }, { status: 400 })
    }

    let event: Stripe.Event

    try {
      event = stripe.webhooks.constructEvent(body, signature, webhookSecret)
    } catch (err) {
      console.error('Webhook signature verification failed:', err)
      return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
    }

    console.log('Received Stripe webhook event:', event.type)

    // Handle successful payment from Payment Links
    if (event.type === 'checkout.session.completed') {
      const session = event.data.object as Stripe.Checkout.Session

      console.log('🔍 FULL SESSION DEBUG:', {
        sessionId: session.id,
        clientReferenceId: session.client_reference_id,
        amountTotal: session.amount_total,
        currency: session.currency,
        metadata: session.metadata,
        customerEmail: session.customer_details?.email,
        successUrl: session.success_url,
        mode: session.mode,
        paymentStatus: session.payment_status,
        fullSession: JSON.stringify(session, null, 2)
      })

      // Extract user ID from client_reference_id (Payment Links automatically set this)
      const userId = session.client_reference_id

      if (!userId) {
        console.error('❌ No client_reference_id found in session')
        return NextResponse.json({
          error: 'No user ID found',
          debug: {
            hasClientReferenceId: !!session.client_reference_id,
            sessionKeys: Object.keys(session)
          }
        }, { status: 400 })
      }

      // Extract credits from success_url (Payment Links don't use metadata)
      let creditsToAdd = 0

      if (session.success_url) {
        try {
          const url = new URL(session.success_url)
          creditsToAdd = parseInt(url.searchParams.get('credits') || '0')
          console.log('🔍 Extracted credits from success_url:', creditsToAdd)
        } catch (error) {
          console.error('❌ Failed to parse success_url:', error)
        }
      }

      // Fallback: try metadata (for other payment methods)
      if (!creditsToAdd) {
        creditsToAdd = parseInt(session.metadata?.credits || '0')
        console.log('🔍 Fallback: credits from metadata:', creditsToAdd)
      }

      if (!creditsToAdd) {
        console.error('❌ No credits found in success_url or metadata')
        return NextResponse.json({
          error: 'No credits found',
          debug: {
            metadata: session.metadata,
            successUrl: session.success_url,
            amountTotal: session.amount_total
          }
        }, { status: 400 })
      }

      try {
        // Determine package name based on credits
        const packageName = getPackageName(creditsToAdd)

        // Add credits to user account
        await addCreditsToUser(userId, creditsToAdd, {
          sessionId: session.id,
          amountPaid: session.amount_total || 0,
          currency: session.currency || 'usd',
          packageName,
          paymentMethod: 'stripe_payment_link',
        })

        console.log(`Successfully added ${creditsToAdd} credits to user ${userId}`)
        
        return NextResponse.json({ 
          success: true, 
          message: `Added ${creditsToAdd} credits to user ${userId}` 
        })
      } catch (error) {
        console.error('Failed to add credits to user:', error)
        return NextResponse.json({ error: 'Failed to add credits' }, { status: 500 })
      }
    }

    // Handle other webhook events if needed
    console.log(`Unhandled webhook event type: ${event.type}`)
    return NextResponse.json({ success: true, message: 'Event received but not processed' })

  } catch (error) {
    console.error('Webhook processing error:', error)
    return NextResponse.json({ error: 'Webhook processing failed' }, { status: 500 })
  }
}

async function addCreditsToUser(
  userId: string,
  credits: number,
  paymentDetails: {
    sessionId: string
    amountPaid: number
    currency: string
    packageName: string
    paymentMethod: string
  }
) {
  const adminDb = getAdminDb()
  const batch = adminDb.batch()

  // Update user credits (using correct field names)
  const userRef = adminDb.collection('users').doc(userId)
  batch.update(userRef, {
    creditsBalance: FieldValue.increment(credits),
    creditsTotalPurchased: FieldValue.increment(credits),
    updatedAt: FieldValue.serverTimestamp(),
  })

  // Add credit transaction record
  const transactionRef = adminDb.collection('creditTransactions').doc()
  batch.set(transactionRef, {
    userId,
    type: 'credit',
    credits,
    description: `Purchased ${credits} credits - ${paymentDetails.packageName}`,
    source: 'stripe_payment_link',
    stripeSessionId: paymentDetails.sessionId,
    amountPaid: paymentDetails.amountPaid,
    currency: paymentDetails.currency,
    paymentMethod: paymentDetails.paymentMethod,
    createdAt: FieldValue.serverTimestamp(),
    date: new Date().toISOString().split('T')[0], // YYYY-MM-DD format
  })

  // Add payment record for admin tracking
  const paymentRef = adminDb.collection('payments').doc()
  batch.set(paymentRef, {
    userId,
    stripeSessionId: paymentDetails.sessionId,
    amount: paymentDetails.amountPaid,
    currency: paymentDetails.currency,
    credits,
    packageName: paymentDetails.packageName,
    paymentMethod: paymentDetails.paymentMethod,
    status: 'completed',
    createdAt: FieldValue.serverTimestamp(),
  })

  await batch.commit()
}
