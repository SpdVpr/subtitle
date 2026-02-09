// Client-side database operations using Firebase SDK
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
  TRANSLATION_JOBS: 'translation_jobs',
  BATCH_JOBS: 'batch_jobs',
  ANALYTICS: 'analytics',
  FILES: 'files',
  SUBSCRIPTIONS: 'subscriptions',
  ERROR_LOGS: 'error_logs',
  CREDIT_TRANSACTIONS: 'credit_transactions'
}

// User Profile Operations
export class UserService {
  static async createUser(
    uid: string,
    email: string,
    displayName?: string,
    options?: {
      creditsBalance?: number
      registrationTracking?: {
        ipAddress?: string
        browserFingerprint?: string
        userAgent?: string
        suspiciousScore?: number
        duplicateDetected?: boolean
        registrationMethod?: 'email' | 'google'
      }
    }
  ): Promise<void> {
    if (!db) throw new Error('Firestore not initialized')

    console.log('👤 Creating new user in Firestore:', uid, email)

    const creditsBalance = options?.creditsBalance ?? 100
    const creditsTotalPurchased = options?.creditsBalance ?? 100

    const userProfile: UserProfile = {
      uid,
      email,
      displayName: displayName || null, // Convert undefined to null for Firestore
      createdAt: serverTimestamp() as Timestamp,
      updatedAt: serverTimestamp() as Timestamp,
      emailVerified: false, // Always start as false for new users requiring verification
      usage: {
        translationsUsed: 0,
        translationsLimit: -1, // Unlimited with credits
        storageUsed: 0,
        storageLimit: 100 * 1024 * 1024, // 100MB
        batchJobsUsed: 0,
        batchJobsLimit: -1, // Unlimited with credits
        resetDate: serverTimestamp() as Timestamp
      },
      creditsBalance,
      creditsTotalPurchased,
      registrationTracking: options?.registrationTracking,
      preferences: {
        defaultAiService: 'google',
        emailNotifications: true,
        theme: 'system'
      }
    }

    await setDoc(doc(db, COLLECTIONS.USERS, uid), userProfile)
    console.log('✅ User created successfully in Firestore', {
      creditsBalance,
      suspiciousScore: options?.registrationTracking?.suspiciousScore
    })
  }

  static async getUser(uid: string): Promise<UserProfile | null> {
    if (!db) throw new Error('Firestore not initialized')

    const userDoc = await getDoc(doc(db, COLLECTIONS.USERS, uid))
    return userDoc.exists() ? userDoc.data() as UserProfile : null
  }

  static async updateUser(uid: string, updates: Partial<UserProfile>): Promise<void> {
    if (!db) throw new Error('Firestore not initialized')

    const updateData = {
      ...updates,
      updatedAt: serverTimestamp()
    }

    await setDoc(doc(db, COLLECTIONS.USERS, uid), updateData, { merge: true })
    console.log('✅ User createOrUpdate completed')
  }

  static async adjustCredits(uid: string, deltaCredits: number, description?: string, relatedJobId?: string, batchNumber?: number, amountUSD?: number): Promise<void> {
    if (!db) throw new Error('Firestore not initialized')

    const userRef = doc(db, COLLECTIONS.USERS, uid)
    await updateDoc(userRef, {
      creditsBalance: increment(deltaCredits),
      updatedAt: serverTimestamp()
    })

    // Record transaction (filter out undefined values)
    const transactionData: any = {
      userId: uid,
      type: deltaCredits >= 0 ? 'topup' : 'debit',
      credits: Math.abs(deltaCredits),
      createdAt: serverTimestamp()
    }

    // Only add fields that are not undefined
    if (amountUSD !== undefined) transactionData.amountUSD = amountUSD
    if (description !== undefined) transactionData.description = description
    if (relatedJobId !== undefined) transactionData.relatedJobId = relatedJobId
    if (batchNumber !== undefined) transactionData.batchNumber = batchNumber

    await addDoc(collection(db, COLLECTIONS.CREDIT_TRANSACTIONS), transactionData)
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
}

// Analytics Operations
export class AnalyticsService {
  static async recordEvent(userId: string, event: string, properties: Record<string, any> = {}): Promise<void> {
    if (!db) throw new Error('Firestore not initialized')

    const today = new Date().toISOString().split('T')[0]
    const entryId = `${userId}_${today}_${event}`
    const entryRef = doc(db, COLLECTIONS.ANALYTICS, entryId)

    const existingEntry = await getDoc(entryRef)
    if (existingEntry.exists()) {
      await updateDoc(entryRef, {
        count: increment(1),
        properties: { ...existingEntry.data().properties, ...properties },
        updatedAt: serverTimestamp()
      })
    } else {
      const newEntry: AnalyticsEntry = {
        id: entryId,
        userId,
        date: today,
        event,
        properties,
        count: 1,
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
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as AnalyticsEntry))
  }
}

// Batch Job Operations
export class BatchJobService {
  static async createJob(job: Omit<any, 'id' | 'createdAt'>): Promise<string> {
    if (!db) throw new Error('Firestore not initialized')

    const jobData = {
      ...job,
      createdAt: serverTimestamp()
    }

    const docRef = await addDoc(collection(db, COLLECTIONS.BATCH_JOBS), jobData)
    return docRef.id
  }

  static async getJob(jobId: string): Promise<any | null> {
    if (!db) throw new Error('Firestore not initialized')

    const jobDoc = await getDoc(doc(db, COLLECTIONS.BATCH_JOBS, jobId))
    return jobDoc.exists() ? { id: jobDoc.id, ...jobDoc.data() } : null
  }

  static async updateJob(jobId: string, updates: any): Promise<void> {
    if (!db) throw new Error('Firestore not initialized')

    await updateDoc(doc(db, COLLECTIONS.BATCH_JOBS, jobId), updates)
  }
}

// File Service
export class FileService {
  static async createFile(file: any): Promise<string> {
    if (!db) throw new Error('Firestore not initialized')

    const docRef = await addDoc(collection(db, COLLECTIONS.FILES), {
      ...file,
      createdAt: serverTimestamp()
    })
    return docRef.id
  }

  static async getFile(fileId: string): Promise<any | null> {
    if (!db) throw new Error('Firestore not initialized')

    const fileDoc = await getDoc(doc(db, COLLECTIONS.FILES, fileId))
    return fileDoc.exists() ? { id: fileDoc.id, ...fileDoc.data() } : null
  }
}

// Error Logging Service
export class ErrorLogService {
  static async createLog(log: any): Promise<string> {
    if (!db) throw new Error('Firestore not initialized')

    const docRef = await addDoc(collection(db, COLLECTIONS.ERROR_LOGS), {
      ...log,
      createdAt: serverTimestamp()
    })
    return docRef.id
  }
}

// Error Logging
export class ErrorTracker {
  static async logError(error: Error, context: string, userId?: string): Promise<void> {
    if (!db) return // Don't throw on client side

    try {
      await addDoc(collection(db, COLLECTIONS.ERROR_LOGS), {
        message: error.message,
        stack: error.stack,
        context,
        userId,
        timestamp: serverTimestamp(),
        userAgent: typeof window !== 'undefined' ? window.navigator.userAgent : 'unknown'
      })
    } catch (logError) {
      console.error('Failed to log error:', logError)
    }
  }

  static async logApiError(error: Error, endpoint: string, method: string, userId?: string): Promise<void> {
    return this.logError(error, `API ${method} ${endpoint}`, userId)
  }

  static addBreadcrumb(message: string, category: string, level: 'info' | 'warning' | 'error' = 'info', data?: any): void {
    console.log(`[${level.toUpperCase()}] ${category}: ${message}`, data || '')
  }
}
