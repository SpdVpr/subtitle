import { getStorage, type FirebaseStorage } from 'firebase/storage'
import { app } from './firebase'

export const storage: FirebaseStorage | null = app ? getStorage(app) : null
