import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
  deleteDoc,
  collection,
  query,
  where,
  orderBy,
  limit,
  getDocs,
  addDoc,
  Timestamp,
  serverTimestamp,
  increment
} from 'firebase/firestore'
import { db } from './firebase'
import {
  UserProfile,
  TranslationJob,
  BatchJob,
  AnalyticsEntry,
  StoredFile,
  Subscription,
  ErrorLog
} from '@/types/database'

// Collection names
const COLLECTIONS = {
  USERS: 'users',
  TRANSLATION_JOBS: 'translationJobs',
  BATCH_JOBS: 'batchJobs',
  ANALYTICS: 'analytics',
  FILES: 'files',
  SUBSCRIPTIONS: 'subscriptions',
  CREDIT_TRANSACTIONS: 'creditTransactions',
  ERROR_LOGS: 'errorLogs'
} as const

// User Profile Operations
export class UserService {
  static async createUser(uid: string, email: string, displayName?: string): Promise<void> {
    if (!db) throw new Error('Firestore not initialized')

    const userProfile: UserProfile = {
      uid,
      email,
      displayName,
      createdAt: serverTimestamp() as Timestamp,
      updatedAt: serverTimestamp() as Timestamp,
      emailVerified: false,
      usage: {
        translationsUsed: 0,
        translationsLimit: 10, // Free plan limit
        storageUsed: 0,
        storageLimit: 100 * 1024 * 1024, // 100MB
        batchJobsUsed: 0,
        batchJobsLimit: 0, // No batch for free
        resetDate: serverTimestamp() as Timestamp
      },
      creditsBalance: 0,
      creditsTotalPurchased: 0,
      preferences: {
        defaultAiService: 'google',
        emailNotifications: true,
        theme: 'system'
      }
    }

    await setDoc(doc(db, COLLECTIONS.USERS, uid), userProfile)
  }

  static async getUser(uid: string): Promise<UserProfile | null> {
    if (!db) throw new Error('Firestore not initialized')

    const userDoc = await getDoc(doc(db, COLLECTIONS.USERS, uid))
    return userDoc.exists() ? userDoc.data() as UserProfile : null
  }

  static async updateUser(uid: string, updates: Partial<UserProfile>): Promise<void> {
    if (!db) throw new Error('Firestore not initialized')

    await updateDoc(doc(db, COLLECTIONS.USERS, uid), {
      ...updates,
      updatedAt: serverTimestamp()
    })
  }

  static async updateUsage(uid: string, usage: Partial<UserProfile['usage']>): Promise<void> {
    if (!db) throw new Error('Firestore not initialized')

    const updates: any = { updatedAt: serverTimestamp() }

    // Use increment for numeric fields
    if (usage.translationsUsed !== undefined) {
      updates['usage.translationsUsed'] = increment(usage.translationsUsed)
    }
    if (usage.storageUsed !== undefined) {
      updates['usage.storageUsed'] = increment(usage.storageUsed)
    }
    if (usage.batchJobsUsed !== undefined) {
      updates['usage.batchJobsUsed'] = increment(usage.batchJobsUsed)
    }

    await updateDoc(doc(db, COLLECTIONS.USERS, uid), updates)
  }

  static async getAllUsers(): Promise<UserProfile[]> {
    if (!db) throw new Error('Firestore not initialized')

    try {
      const usersQuery = query(
        collection(db, COLLECTIONS.USERS),
        orderBy('createdAt', 'desc')
      )

      const snapshot = await getDocs(usersQuery)

      return snapshot.docs.map(doc => ({
        ...doc.data(),
        uid: doc.id
      } as UserProfile))
    } catch (error) {
      console.error('Failed to get all users:', error)
      // Do not return mock data in admin; propagate error to show proper message
      throw error
    }
  }

  // Create or update user with merge
  static async createOrUpdateUser(uid: string, data: Partial<UserProfile>): Promise<void> {
    if (!db) throw new Error('Firestore not initialized')

    // Always set uid and updatedAt; merge to avoid overwriting existing fields
    await setDoc(doc(db, COLLECTIONS.USERS, uid), {
      uid,
      creditsBalance: 0,
      creditsTotalPurchased: 0,
      ...data,
      updatedAt: serverTimestamp()
    } as any, { merge: true })
  }

  static async adjustCredits(uid: string, deltaCredits: number, description?: string, relatedJobId?: string, batchNumber?: number, amountUSD?: number): Promise<void> {
    if (!db) throw new Error('Firestore not initialized')

    const userRef = doc(db, COLLECTIONS.USERS, uid)
    await updateDoc(userRef, {
      creditsBalance: increment(deltaCredits),
      updatedAt: serverTimestamp()
    })

    await addDoc(collection(db, COLLECTIONS.CREDIT_TRANSACTIONS), {
      userId: uid,
      type: deltaCredits >= 0 ? 'topup' : 'debit',
      credits: Math.abs(deltaCredits),
      amountUSD: amountUSD,
      description,
      relatedJobId,
      batchNumber,
      createdAt: serverTimestamp()
    })
  }
}

// Translation Job Operations
export class TranslationJobService {
  static async createJob(job: Omit<TranslationJob, 'id' | 'createdAt'>): Promise<string> {
    if (!db) throw new Error('Firestore not initialized')

    const jobData = {
      ...job,
      createdAt: serverTimestamp()
    }

    const docRef = await addDoc(collection(db, COLLECTIONS.TRANSLATION_JOBS), jobData)
    return docRef.id
  }

  static async getJob(jobId: string): Promise<TranslationJob | null> {
    if (!db) throw new Error('Firestore not initialized')

    const jobDoc = await getDoc(doc(db, COLLECTIONS.TRANSLATION_JOBS, jobId))
    return jobDoc.exists() ? { id: jobDoc.id, ...jobDoc.data() } as TranslationJob : null
  }

  static async updateJob(jobId: string, updates: Partial<TranslationJob>): Promise<void> {
    if (!db) throw new Error('Firestore not initialized')

    await updateDoc(doc(db, COLLECTIONS.TRANSLATION_JOBS, jobId), updates)
  }

  static async getUserJobs(userId: string, limitCount = 50): Promise<TranslationJob[]> {
    if (!db) throw new Error('Firestore not initialized')

    const q = query(
      collection(db, COLLECTIONS.TRANSLATION_JOBS),
      where('userId', '==', userId),
      orderBy('createdAt', 'desc'),
      limit(limitCount)
    )

    const snapshot = await getDocs(q)
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as TranslationJob))
  }
  static async adjustCredits(uid: string, deltaCredits: number, description?: string, relatedJobId?: string, batchNumber?: number): Promise<void> {
    if (!db) throw new Error('Firestore not initialized')

    const userRef = doc(db, COLLECTIONS.USERS, uid)
    await updateDoc(userRef, {
      creditsBalance: increment(deltaCredits),
      updatedAt: serverTimestamp()
    })

    // Record transaction
    await addDoc(collection(db, COLLECTIONS.CREDIT_TRANSACTIONS), {
      userId: uid,
      type: deltaCredits >= 0 ? 'topup' : 'debit',
      credits: Math.abs(deltaCredits),
      description,
      relatedJobId,
      batchNumber,
      createdAt: serverTimestamp()
    })
  }
}

// Batch Job Operations
export class BatchJobService {
  static async createJob(job: Omit<BatchJob, 'id' | 'createdAt'>): Promise<string> {
    if (!db) throw new Error('Firestore not initialized')

    const jobData = {
      ...job,
      createdAt: serverTimestamp()
    }

    const docRef = await addDoc(collection(db, COLLECTIONS.BATCH_JOBS), jobData)
    return docRef.id
  }

  static async getJob(jobId: string): Promise<BatchJob | null> {
    if (!db) throw new Error('Firestore not initialized')

    const jobDoc = await getDoc(doc(db, COLLECTIONS.BATCH_JOBS, jobId))
    return jobDoc.exists() ? { id: jobDoc.id, ...jobDoc.data() } as BatchJob : null
  }

  static async updateJob(jobId: string, updates: Partial<BatchJob>): Promise<void> {
    if (!db) throw new Error('Firestore not initialized')

    await updateDoc(doc(db, COLLECTIONS.BATCH_JOBS, jobId), updates)
  }

  static async getUserJobs(userId: string, limitCount = 20): Promise<BatchJob[]> {
    if (!db) throw new Error('Firestore not initialized')

    const q = query(
      collection(db, COLLECTIONS.BATCH_JOBS),
      where('userId', '==', userId),
      orderBy('createdAt', 'desc'),
      limit(limitCount)
    )

    const snapshot = await getDocs(q)
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as BatchJob))
  }
}

// File Storage Operations
export class FileService {
  static async createFile(file: Omit<StoredFile, 'id' | 'createdAt' | 'downloadCount'>): Promise<string> {
    if (!db) throw new Error('Firestore not initialized')

    const fileData = {
      ...file,
      createdAt: serverTimestamp(),
      downloadCount: 0
    }

    const docRef = await addDoc(collection(db, COLLECTIONS.FILES), fileData)
    return docRef.id
  }

  static async getFile(fileId: string): Promise<StoredFile | null> {
    if (!db) throw new Error('Firestore not initialized')

    const fileDoc = await getDoc(doc(db, COLLECTIONS.FILES, fileId))
    return fileDoc.exists() ? { id: fileDoc.id, ...fileDoc.data() } as StoredFile : null
  }

  static async incrementDownloadCount(fileId: string): Promise<void> {
    if (!db) throw new Error('Firestore not initialized')

    await updateDoc(doc(db, COLLECTIONS.FILES, fileId), {
      downloadCount: increment(1),
      lastDownloadAt: serverTimestamp()
    })
  }

  static async getUserFiles(userId: string, limitCount = 100): Promise<StoredFile[]> {
    if (!db) throw new Error('Firestore not initialized')

    const q = query(
      collection(db, COLLECTIONS.FILES),
      where('userId', '==', userId),
      orderBy('createdAt', 'desc'),
      limit(limitCount)
    )

    const snapshot = await getDocs(q)
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as StoredFile))
  }
}

// Analytics Operations
export class AnalyticsService {
  static async recordDailyUsage(userId: string, date: string, metrics: Partial<AnalyticsEntry>): Promise<void> {
    if (!db) throw new Error('Firestore not initialized')

    const entryId = `${userId}_${date}`
    const entryRef = doc(db, COLLECTIONS.ANALYTICS, entryId)

    // Get existing entry or create new one
    const existingEntry = await getDoc(entryRef)

    if (existingEntry.exists()) {
      // Update existing entry
      const updates: any = { updatedAt: serverTimestamp() }

      if (metrics.translationsCount) {
        updates.translationsCount = increment(metrics.translationsCount)
      }
      if (metrics.filesProcessed) {
        updates.filesProcessed = increment(metrics.filesProcessed)
      }
      if (metrics.charactersTranslated) {
        updates.charactersTranslated = increment(metrics.charactersTranslated)
      }
      if (metrics.processingTimeMs) {
        updates.processingTimeMs = increment(metrics.processingTimeMs)
      }

      await updateDoc(entryRef, updates)
    } else {
      // Create new entry
      const newEntry: AnalyticsEntry = {
        id: entryId,
        userId,
        date,
        translationsCount: metrics.translationsCount || 0,
        filesProcessed: metrics.filesProcessed || 0,
        charactersTranslated: metrics.charactersTranslated || 0,
        processingTimeMs: metrics.processingTimeMs || 0,
        languagePairs: metrics.languagePairs || {},
        serviceUsage: metrics.serviceUsage || {},
        averageConfidence: metrics.averageConfidence || 0,
        errorCount: metrics.errorCount || 0,
        createdAt: serverTimestamp() as Timestamp,
        updatedAt: serverTimestamp() as Timestamp
      }

      await setDoc(entryRef, newEntry)
    }
  }

  static async getUserAnalytics(userId: string, startDate: string, endDate: string): Promise<AnalyticsEntry[]> {
    if (!db) throw new Error('Firestore not initialized')

    const q = query(
      collection(db, COLLECTIONS.ANALYTICS),
      where('userId', '==', userId),
      where('date', '>=', startDate),
      where('date', '<=', endDate),
      orderBy('date', 'desc')
    )

    const snapshot = await getDocs(q)
    return snapshot.docs.map(doc => doc.data() as AnalyticsEntry)
  }
}

// Error Logging
export class ErrorLogService {
  static async logError(error: Omit<ErrorLog, 'id' | 'timestamp' | 'resolved'>): Promise<void> {
    if (!db) throw new Error('Firestore not initialized')

    const errorData = {
      ...error,
      timestamp: serverTimestamp(),
      resolved: false
    }

    await addDoc(collection(db, COLLECTIONS.ERROR_LOGS), errorData)
  }
}
