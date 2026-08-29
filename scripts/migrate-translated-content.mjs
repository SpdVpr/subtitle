/**
 * Moves translated SRT files out of `translation_jobs` documents and into
 * Cloud Storage.
 *
 * Why: Firestore bills whole documents. `translatedContent` averages ~50 KB and
 * is 91% of a job document's weight, so every query over the collection paid
 * for subtitle files it never looked at. On 2026-08-28 that turned ~7,300
 * requests into 336 GiB of egress. Storage has no practical size ceiling, so
 * long subtitles are not capped by this move.
 *
 * Run in two passes, on purpose:
 *
 *   node --env-file=.env.local scripts/migrate-translated-content.mjs
 *       Copies content to Storage. Additive and idempotent - documents are not
 *       touched, so the app keeps working whichever pass you stop after.
 *
 *   node --env-file=.env.local scripts/migrate-translated-content.mjs --strip
 *       Deletes the inline field, but only for jobs whose Storage object exists
 *       and whose byte length matches. This pass is destructive.
 *
 * Add --dry-run to either pass to see what it would do. --limit=N bounds the
 * number of documents processed, for a cautious first run.
 */
import admin from 'firebase-admin'

const args = process.argv.slice(2)
const STRIP = args.includes('--strip')
const DRY_RUN = args.includes('--dry-run')
const LIMIT = Number((args.find(a => a.startsWith('--limit=')) || '').split('=')[1]) || Infinity
const CONCURRENCY = 10
const PAGE_SIZE = 200
const CONTENT_PREFIX = 'translations'

const projectId = process.env.FIREBASE_ADMIN_PROJECT_ID || process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID
const storageBucket = process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || `${projectId}.firebasestorage.app`

admin.initializeApp({
  credential: admin.credential.cert({
    projectId,
    clientEmail: process.env.FIREBASE_ADMIN_CLIENT_EMAIL,
    privateKey: (process.env.FIREBASE_ADMIN_PRIVATE_KEY || '').replace(/\\n/g, '\n'),
  }),
  storageBucket,
})

const db = admin.firestore()
const bucket = admin.storage().bucket()
const contentFile = jobId => bucket.file(`${CONTENT_PREFIX}/${jobId}.srt`)

const stats = { scanned: 0, copied: 0, alreadyThere: 0, stripped: 0, skipped: 0, failed: 0 }

async function copyOne(doc) {
  const content = doc.get('translatedContent')
  if (typeof content !== 'string' || content.length === 0) {
    stats.skipped++
    return
  }

  const file = contentFile(doc.id)
  const [exists] = await file.exists()
  if (exists) {
    stats.alreadyThere++
    return
  }

  if (DRY_RUN) {
    stats.copied++
    return
  }

  await file.save(content, { contentType: 'text/plain; charset=utf-8', resumable: false })
  stats.copied++
}

async function stripOne(doc) {
  const content = doc.get('translatedContent')
  if (typeof content !== 'string' || content.length === 0) {
    stats.skipped++
    return
  }

  // Never delete without confirming the copy is there and complete.
  const file = contentFile(doc.id)
  const [exists] = await file.exists()
  if (!exists) {
    console.warn(`  no Storage copy for ${doc.id}, leaving the document alone`)
    stats.skipped++
    return
  }

  const [meta] = await file.getMetadata()
  const expected = Buffer.byteLength(content, 'utf8')
  if (Number(meta.size) !== expected) {
    console.warn(`  size mismatch for ${doc.id}: Storage ${meta.size} vs document ${expected}, leaving it alone`)
    stats.skipped++
    return
  }

  if (DRY_RUN) {
    stats.stripped++
    return
  }

  await doc.ref.update({ translatedContent: admin.firestore.FieldValue.delete() })
  stats.stripped++
}

async function run() {
  const action = STRIP ? stripOne : copyOne
  console.log(`bucket   : ${storageBucket}`)
  console.log(`pass     : ${STRIP ? 'STRIP (destructive)' : 'COPY (additive)'}${DRY_RUN ? ' [dry run]' : ''}`)
  if (LIMIT !== Infinity) console.log(`limit    : ${LIMIT} documents`)
  console.log('')

  let cursor = null
  while (stats.scanned < LIMIT) {
    let query = db.collection('translation_jobs').orderBy('__name__').limit(PAGE_SIZE)
    if (cursor) query = query.startAfter(cursor)

    const page = await query.get()
    if (page.empty) break

    const docs = page.docs.slice(0, LIMIT - stats.scanned)
    for (let i = 0; i < docs.length; i += CONCURRENCY) {
      const slice = docs.slice(i, i + CONCURRENCY)
      const results = await Promise.allSettled(slice.map(action))
      for (const [n, r] of results.entries()) {
        if (r.status === 'rejected') {
          stats.failed++
          console.error(`  failed on ${slice[n].id}:`, r.reason?.message || r.reason)
        }
      }
      stats.scanned += slice.length
    }

    process.stdout.write(`\r  scanned ${stats.scanned}...`)
    cursor = page.docs[page.docs.length - 1]
    if (page.size < PAGE_SIZE) break
  }

  console.log('\n')
  console.log('scanned        :', stats.scanned)
  if (STRIP) {
    console.log('field removed  :', stats.stripped)
  } else {
    console.log('copied         :', stats.copied)
    console.log('already there  :', stats.alreadyThere)
  }
  console.log('skipped        :', stats.skipped)
  console.log('failed         :', stats.failed)

  process.exit(stats.failed > 0 ? 1 : 0)
}

run().catch(err => {
  console.error(err)
  process.exit(1)
})
