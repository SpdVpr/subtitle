import { getFirestore, type Firestore } from 'firebase/firestore'
import { app } from './firebase'

// Firestore is only needed by signed-in features (profiles, jobs, credits).
// Importing this module pulls in the Firestore SDK, so keep it out of code
// that runs on every marketing page.
export const db: Firestore | null = app ? getFirestore(app) : null
