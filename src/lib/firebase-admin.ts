import admin from 'firebase-admin'

let adminApp: admin.app.App | null = null

function getAdminApp(): admin.app.App {
  if (adminApp) return adminApp

  if (!admin.apps.length) {
    const projectId = process.env.FIREBASE_ADMIN_PROJECT_ID || process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID
    const clientEmail = process.env.FIREBASE_ADMIN_CLIENT_EMAIL
    let privateKey = process.env.FIREBASE_ADMIN_PRIVATE_KEY
    // Needed so admin.storage() resolves a bucket: translated subtitles are
    // stored as files, not as Firestore fields.
    const storageBucket =
      process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || `${projectId}.firebasestorage.app`

    if (!projectId) {
      throw new Error('Missing Firebase project ID. Please set FIREBASE_ADMIN_PROJECT_ID or NEXT_PUBLIC_FIREBASE_PROJECT_ID environment variable.')
    }

    // For production, use proper service account credentials
    if (clientEmail && privateKey) {
      privateKey = privateKey.replace(/\\n/g, '\n')

      adminApp = admin.initializeApp({
        credential: admin.credential.cert({
          projectId,
          clientEmail,
          privateKey,
        }),
        storageBucket,
      })
      console.log('🔧 Firebase Admin: Using service account credentials')
    } else {
      // Try application default credentials (for local development with gcloud auth)
      try {
        adminApp = admin.initializeApp({
          projectId,
          storageBucket,
        })
        console.log('🔧 Firebase Admin: Using application default credentials for project:', projectId)
      } catch (error) {
        console.error('❌ Failed to initialize Firebase Admin:', error)
        throw new Error('Firebase Admin SDK not configured. Please set FIREBASE_ADMIN_CLIENT_EMAIL and FIREBASE_ADMIN_PRIVATE_KEY environment variables or run "gcloud auth application-default login".')
      }
    }
  } else {
    adminApp = admin.app()
  }

  return adminApp!
}

export function getAdminStorage() {
  return admin.storage(getAdminApp())
}

export function getAdminDb() {
  const app = getAdminApp()
  return admin.firestore(app)
}

export { admin, getAdminApp }

