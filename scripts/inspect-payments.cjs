/**
 * READ-ONLY inspection: cross-reference Stripe paid checkout sessions with Firestore.
 * Finds customers who paid but did not receive credits.
 *
 * Run: node scripts/inspect-payments.cjs
 */
const path = require('path')
const { loadEnvConfig } = require('@next/env')
loadEnvConfig(process.cwd())

const admin = require('firebase-admin')
const Stripe = require('stripe')

function initFirebase() {
  if (admin.apps.length) return admin.app()
  const projectId =
    process.env.FIREBASE_ADMIN_PROJECT_ID || process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID
  const clientEmail = process.env.FIREBASE_ADMIN_CLIENT_EMAIL
  let privateKey = process.env.FIREBASE_ADMIN_PRIVATE_KEY
  if (!projectId || !clientEmail || !privateKey) {
    throw new Error('Missing Firebase admin env vars (PROJECT_ID/CLIENT_EMAIL/PRIVATE_KEY)')
  }
  privateKey = privateKey.replace(/\\n/g, '\n')
  return admin.initializeApp({
    credential: admin.credential.cert({ projectId, clientEmail, privateKey }),
  })
}

// Map amount (in cents) -> credits, as a fallback when success_url has no ?credits=
const PRICE_TO_CREDITS = { 100: 100, 500: 500, 1000: 1200, 2000: 2500 }

function creditsFromSession(session) {
  // 1) success_url ?credits=N
  if (session.success_url) {
    try {
      const c = parseInt(new URL(session.success_url).searchParams.get('credits') || '0', 10)
      if (c > 0) return { credits: c, source: 'success_url' }
    } catch (_) {}
  }
  // 2) metadata.credits
  if (session.metadata && session.metadata.credits) {
    const c = parseInt(session.metadata.credits, 10)
    if (c > 0) return { credits: c, source: 'metadata' }
  }
  // 3) amount fallback
  if (session.amount_total && PRICE_TO_CREDITS[session.amount_total]) {
    return { credits: PRICE_TO_CREDITS[session.amount_total], source: 'amount' }
  }
  return { credits: 0, source: 'unknown' }
}

async function main() {
  initFirebase()
  const db = admin.firestore()
  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, { apiVersion: '2025-07-30.basil' })

  console.log('Stripe key mode:', process.env.STRIPE_SECRET_KEY?.startsWith('sk_live') ? 'LIVE' : 'TEST/other')
  console.log('Firebase project:', process.env.FIREBASE_ADMIN_PROJECT_ID || process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID)
  console.log('')

  // --- Firestore current state ---
  const [paymentsSnap, txSnap, usersSnap] = await Promise.all([
    db.collection('payments').get(),
    db.collection('creditTransactions').get(),
    db.collection('users').get(),
  ])
  console.log('=== FIRESTORE TOTALS ===')
  console.log('users:', usersSnap.size)
  console.log('payments docs:', paymentsSnap.size)
  console.log('creditTransactions docs:', txSnap.size)
  const txBySource = {}
  const creditedSessionIds = new Set()
  txSnap.forEach((d) => {
    const t = d.data()
    txBySource[t.source || 'n/a'] = (txBySource[t.source || 'n/a'] || 0) + 1
    if (t.stripeSessionId) creditedSessionIds.add(t.stripeSessionId)
  })
  console.log('creditTransactions by source:', JSON.stringify(txBySource))
  console.log('distinct stripeSessionIds already credited:', creditedSessionIds.size)
  console.log('')

  // Build email -> user map for fallback matching
  const usersByEmail = new Map()
  const usersById = new Map()
  usersSnap.forEach((d) => {
    const u = d.data()
    usersById.set(d.id, u)
    if (u.email) usersByEmail.set(String(u.email).toLowerCase(), { id: d.id, ...u })
  })

  // --- Stripe paid checkout sessions ---
  console.log('=== STRIPE: fetching checkout sessions... ===')
  const sessions = await stripe.checkout.sessions.list({ limit: 100 }).autoPagingToArray({ limit: 1000 })
  const paid = sessions.filter((s) => s.status === 'complete' && s.payment_status === 'paid')
  console.log(`total sessions fetched: ${sessions.length}, paid+complete: ${paid.length}`)
  console.log('')

  const missing = []
  const ok = []
  const problems = []

  for (const s of paid) {
    const email = s.customer_details?.email || s.customer_email || (s.metadata && s.metadata.user_email) || null
    const { credits, source } = creditsFromSession(s)
    const userId = s.client_reference_id || null
    const alreadyCredited = creditedSessionIds.has(s.id)

    // resolve user
    let resolvedUserId = userId
    let userDoc = userId ? usersById.get(userId) : null
    if (!userDoc && email && usersByEmail.has(email.toLowerCase())) {
      const u = usersByEmail.get(email.toLowerCase())
      resolvedUserId = u.id
      userDoc = u
    }

    const row = {
      session: s.id,
      date: new Date(s.created * 1000).toISOString().slice(0, 10),
      email,
      amount: (s.amount_total || 0) / 100,
      currency: s.currency,
      credits,
      creditsSource: source,
      clientRefId: userId,
      resolvedUserId,
      userExists: !!userDoc,
      currentBalance: userDoc ? (userDoc.creditsBalance || 0) : null,
      alreadyCredited,
    }

    if (alreadyCredited) {
      ok.push(row)
    } else if (!resolvedUserId || !userDoc || credits <= 0) {
      problems.push(row)
    } else {
      missing.push(row)
    }
  }

  const fmt = (r) =>
    `${r.date}  ${String(r.email || '—').padEnd(32)} $${String(r.amount).padEnd(5)} ${String(r.credits).padStart(4)}cr (${r.creditsSource})  ref=${r.clientRefId ? 'yes' : 'NO '}  user=${r.userExists ? 'yes' : 'NO '}  bal=${r.currentBalance}  ${r.session}`

  console.log(`=== ALREADY CREDITED (${ok.length}) ===`)
  ok.forEach((r) => console.log('  ' + fmt(r)))
  console.log('')
  console.log(`=== PAID BUT NOT CREDITED — fixable (${missing.length}) ===`)
  missing.forEach((r) => console.log('  ' + fmt(r)))
  console.log('')
  console.log(`=== NEEDS ATTENTION (no user / no credits resolvable) (${problems.length}) ===`)
  problems.forEach((r) => console.log('  ' + fmt(r)))
  console.log('')
  const totalMissingCredits = missing.reduce((a, r) => a + r.credits, 0)
  console.log(`SUMMARY: ${missing.length} sessions to backfill = ${totalMissingCredits} credits across ${new Set(missing.map((r) => r.resolvedUserId)).size} users`)

  // Write the fixable list to a file for the backfill step
  const fs = require('fs')
  fs.writeFileSync(
    path.join(process.cwd(), 'scripts', 'backfill-list.json'),
    JSON.stringify({ missing, problems }, null, 2)
  )
  console.log('Wrote scripts/backfill-list.json')
}

main().then(() => process.exit(0)).catch((e) => {
  console.error('FATAL:', e)
  process.exit(1)
})
