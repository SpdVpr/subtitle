import { initializeApp, getApps, type FirebaseApp } from 'firebase/app'
import {
  initializeAuth,
  getAuth,
  browserLocalPersistence,
  indexedDBLocalPersistence,
  GoogleAuthProvider,
  type Auth,
} from 'firebase/auth'

// Client-side Firebase entry point. Deliberately auth-only: Firestore and
// Storage live in ./firebase-db and ./firebase-storage so that pages which
// only need to know "is someone signed in?" do not ship the Firestore SDK.

// Check if Firebase is properly configured
export const isFirebaseConfigured = Boolean(
  process.env.NEXT_PUBLIC_FIREBASE_API_KEY &&
  process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID &&
  typeof window !== 'undefined' // Only initialize on client side
)

let app: FirebaseApp | null = null
let auth: Auth | null = null

// Initialize Firebase only on client side and when properly configured
if (isFirebaseConfigured) {
  const firebaseConfig = {
    apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY!,
    authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN!,
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID!,
    storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET!,
    messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID!,
    appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID!,
  }

  // Initialize Firebase (avoid duplicate initialization)
  app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0]

  try {
    // No popupRedirectResolver here on purpose: the default getAuth() eagerly
    // loads the Google auth iframe + gapi (~200 KB of third-party JS) on every
    // page load. Sign-in flows pass browserPopupRedirectResolver explicitly.
    auth = initializeAuth(app, {
      persistence: [indexedDBLocalPersistence, browserLocalPersistence],
    })
  } catch {
    // Already initialized for this app (e.g. hot reload in development)
    auth = getAuth(app)
  }
}

// Google Auth Provider
export const googleProvider = new GoogleAuthProvider()
googleProvider.addScope('email')
googleProvider.addScope('profile')

export { app, auth }
