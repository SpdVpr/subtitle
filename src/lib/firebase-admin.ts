import admin from 'firebase-admin'

let adminApp: admin.app.App | null = null

function getAdminApp(): admin.app.App {
  if (adminApp) return adminApp

  if (!admin.apps.length) {
    const projectId = process.env.FIREBASE_ADMIN_PROJECT_ID
    const clientEmail = process.env.FIREBASE_ADMIN_CLIENT_EMAIL
    let privateKey = process.env.FIREBASE_ADMIN_PRIVATE_KEY

    if (!projectId || !clientEmail || !privateKey) {
      throw new Error('Missing Firebase Admin credentials. Please set FIREBASE_ADMIN_PROJECT_ID, FIREBASE_ADMIN_CLIENT_EMAIL, FIREBASE_ADMIN_PRIVATE_KEY environment variables.')
    }

    // Vercel stores newlines as \n
    privateKey = privateKey.replace(/\\n/g, '\n')

    adminApp = admin.initializeApp({
      credential: admin.credential.cert({
        projectId,
        clientEmail,
        privateKey,
      }),
    })
  } else {
    adminApp = admin.app()
  }

  return adminApp!
}

export function getAdminDb() {
  const app = getAdminApp()
  return admin.firestore(app)
}

export { admin, getAdminApp }

