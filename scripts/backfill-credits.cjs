/**
 * Backfill credits for Stripe-paid checkout sessions that never got credited
 * (webhook was returning HTTP 500 after the Next.js 16 upgrade).
 *
 * Reads scripts/backfill-list.json (produced by inspect-payments.cjs).
 * Idempotent: keys creditTransactions/payments docs by the Stripe session id and
 * also checks for any existing transaction with that stripeSessionId, so re-runs
 * (and a later real webhook delivery) never double-credit.
 *
 * Dry-run by default. Pass --apply to write. Pass --include-owner to also credit
 * the owner's own old test sessions (michalvesecky@gmail.com).
 *
 * Run: node scripts/backfill-credits.cjs            (dry-run)
 *      node scripts/backfill-credits.cjs --apply     (write)
 */
const path = require('path')
const fs = require('fs')
const { loadEnvConfig } = require('@next/env')
loadEnvConfig(process.cwd())

const admin = require('firebase-admin')
const Stripe = require('stripe')

const APPLY = process.argv.includes('--apply')
const INCLUDE_OWNER = process.argv.includes('--include-owner')
const OWNER_EMAIL = 'michalvesecky@gmail.com'

function initFirebase() {
  if (admin.apps.length) return admin.app()
  const projectId =
    process.env.FIREBASE_ADMIN_PROJECT_ID || process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID
  const clientEmail = process.env.FIREBASE_ADMIN_CLIENT_EMAIL
  let privateKey = process.env.FIREBASE_ADMIN_PRIVATE_KEY
  privateKey = privateKey.replace(/\\n/g, '\n')
  return admin.initializeApp({
    credential: admin.credential.cert({ projectId, clientEmail, privateKey }),
  })
}

function getPackageName(credits) {
  if (credits <= 100) return 'Trial Pack'
  if (credits <= 500) return 'Starter Pack'
  if (credits <= 1200) return 'Popular Pack'
  if (credits <= 2500) return 'Professional Pack'
  return 'Enterprise Pack'
}

async function grantCredits(db, userId, credits, details) {
  const txCol = db.collection('creditTransactions')
  const dedupeRef = txCol.doc(details.sessionId)
  const { FieldValue } = admin.firestore

  return db.runTransaction(async (tx) => {
    const dedupeSnap = await tx.get(dedupeRef)
    if (dedupeSnap.exists) return { alreadyProcessed: true }
    const existing = await tx.get(txCol.where('stripeSessionId', '==', details.sessionId).limit(1))
    if (!existing.empty) return { alreadyProcessed: true }

    const userRef = db.collection('users').doc(userId)
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
      description: `Purchased ${credits} credits - ${details.packageName} (backfill)`,
      source: 'stripe_payment_link_backfill',
      stripeSessionId: details.sessionId,
      amountPaid: details.amountPaid,
      currency: details.currency,
      paymentMethod: 'stripe_payment_link',
      customerEmail: details.customerEmail,
      createdAt: FieldValue.serverTimestamp(),
      date: new Date().toISOString().split('T')[0],
    })
    const paymentRef = db.collection('payments').doc(details.sessionId)
    tx.set(
      paymentRef,
      {
        userId,
        stripeSessionId: details.sessionId,
        amount: details.amountPaid,
        currency: details.currency,
        credits,
        packageName: details.packageName,
        paymentMethod: 'stripe_payment_link',
        customerEmail: details.customerEmail,
        status: 'completed',
        createdAt: FieldValue.serverTimestamp(),
      },
      { merge: true }
    )
    return { alreadyProcessed: false }
  })
}

async function main() {
  initFirebase()
  const db = admin.firestore()
  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, { apiVersion: '2025-07-30.basil' })

  const listPath = path.join(process.cwd(), 'scripts', 'backfill-list.json')
  const { missing } = JSON.parse(fs.readFileSync(listPath, 'utf8'))

  console.log(`MODE: ${APPLY ? '🔴 APPLY (writing to Firestore)' : '🟢 DRY-RUN (no writes)'}`)
  console.log(`Include owner test sessions (${OWNER_EMAIL}): ${INCLUDE_OWNER}`)
  console.log(`Candidates from list: ${missing.length}`)
  console.log('')

  let granted = 0
  let skippedAlready = 0
  let skippedRefund = 0
  let skippedOwner = 0
  let totalCredits = 0

  for (const r of missing) {
    if (!INCLUDE_OWNER && r.email && r.email.toLowerCase() === OWNER_EMAIL) {
      console.log(`  SKIP (owner test): ${r.date} ${r.email} ${r.credits}cr ${r.session}`)
      skippedOwner++
      continue
    }
    if (!r.resolvedUserId || !r.userExists || !(r.credits > 0)) {
      console.log(`  SKIP (no user/credits): ${r.date} ${r.email} ${r.session}`)
      continue
    }

    // Re-verify against Stripe: still paid, not refunded.
    let session
    try {
      session = await stripe.checkout.sessions.retrieve(r.session, { expand: ['payment_intent'] })
    } catch (e) {
      console.log(`  SKIP (stripe retrieve failed): ${r.session} ${e.message}`)
      continue
    }
    if (session.payment_status !== 'paid' || session.status !== 'complete') {
      console.log(`  SKIP (not paid/complete): ${r.session} status=${session.status} pay=${session.payment_status}`)
      continue
    }
    const pi = session.payment_intent
    const refunded =
      pi && typeof pi === 'object' && (pi.amount_refunded > 0 || pi.status === 'canceled')
    if (refunded) {
      console.log(`  SKIP (refunded/canceled): ${r.email} ${r.session}`)
      skippedRefund++
      continue
    }

    const details = {
      sessionId: r.session,
      amountPaid: session.amount_total || Math.round(r.amount * 100),
      currency: session.currency || r.currency || 'usd',
      packageName: getPackageName(r.credits),
      customerEmail: r.email || null,
    }

    if (!APPLY) {
      console.log(`  WOULD CREDIT: ${r.date} ${String(r.email).padEnd(32)} +${r.credits}cr (bal ${r.currentBalance} -> ${(r.currentBalance || 0) + r.credits})  user=${r.resolvedUserId}`)
      totalCredits += r.credits
      granted++
      continue
    }

    const res = await grantCredits(db, r.resolvedUserId, r.credits, details)
    if (res.alreadyProcessed) {
      console.log(`  ALREADY (idempotent skip): ${r.email} ${r.session}`)
      skippedAlready++
    } else {
      console.log(`  ✅ CREDITED: ${r.date} ${String(r.email).padEnd(32)} +${r.credits}cr -> user ${r.resolvedUserId}`)
      granted++
      totalCredits += r.credits
    }
  }

  console.log('')
  console.log('=== RESULT ===')
  console.log(`${APPLY ? 'credited' : 'would credit'}: ${granted} sessions, ${totalCredits} credits`)
  console.log(`skipped (already credited): ${skippedAlready}`)
  console.log(`skipped (refunded): ${skippedRefund}`)
  console.log(`skipped (owner tests): ${skippedOwner}`)
  if (!APPLY) console.log('\nRe-run with --apply to write these changes.')
}

main().then(() => process.exit(0)).catch((e) => {
  console.error('FATAL:', e)
  process.exit(1)
})
