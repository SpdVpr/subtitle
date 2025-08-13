// Server-side database operations using Firebase Admin
import { getAdminDb } from './firebase-admin'
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

// User Operations
export class UserService {
  static async getUser(uid: string): Promise<UserProfile | null> {
    try {
      const db = getAdminDb()
      const userDoc = await db.collection(COLLECTIONS.USERS).doc(uid).get()
      return userDoc.exists ? userDoc.data() as UserProfile : null
    } catch (error) {
      console.error('❌ Error getting user:', error)
      throw error
    }
  }

  static async createUser(uid: string, email: string, displayName?: string): Promise<void> {
    try {
      console.log('👤 Creating new user in Firestore:', uid, email)

      const userProfile: UserProfile = {
        uid,
        email,
        displayName: displayName || null,
        createdAt: new Date(),
        updatedAt: new Date(),
        emailVerified: false,
        usage: {
          translationsUsed: 0,
          translationsLimit: -1, // Unlimited with credits
          storageUsed: 0,
          storageLimit: 100 * 1024 * 1024, // 100MB
          batchJobsUsed: 0,
          batchJobsLimit: -1, // Unlimited with credits
          resetDate: new Date()
        },
        creditsBalance: 200, // Welcome credits for new users
        creditsTotalPurchased: 200,
        preferences: {
          defaultAiService: 'google',
          emailNotifications: true,
          theme: 'system'
        }
      }

      const db = getAdminDb()
      await db.collection(COLLECTIONS.USERS).doc(uid).set(userProfile)
      console.log('✅ User created successfully in Firestore')
    } catch (error) {
      console.error('❌ Error creating user:', error)
      throw error
    }
  }

  static async updateUser(uid: string, updates: Partial<UserProfile>): Promise<void> {
    try {
      const db = getAdminDb()
      const updateData = {
        ...updates,
        updatedAt: new Date()
      }

      await db.collection(COLLECTIONS.USERS).doc(uid).update(updateData)
      console.log('✅ User update completed')
    } catch (error) {
      console.error('❌ Error updating user:', error)
      throw error
    }
  }

  static async adjustCredits(uid: string, deltaCredits: number, description?: string, relatedJobId?: string, batchNumber?: number, amountUSD?: number): Promise<void> {
    try {
      const db = getAdminDb()
      
      // Get current user data
      const userDoc = await db.collection(COLLECTIONS.USERS).doc(uid).get()
      if (!userDoc.exists) {
        throw new Error(`User ${uid} not found`)
      }

      const userData = userDoc.data() as UserProfile
      const currentBalance = userData.creditsBalance || 0
      const newBalance = currentBalance + deltaCredits

      // Update user balance
      await db.collection(COLLECTIONS.USERS).doc(uid).update({
        creditsBalance: newBalance,
        updatedAt: new Date()
      })

      // Record transaction (filter out undefined values)
      const transactionData: any = {
        userId: uid,
        type: deltaCredits >= 0 ? 'topup' : 'debit',
        credits: Math.abs(deltaCredits),
        createdAt: new Date()
      }

      // Only add fields that are not undefined
      if (amountUSD !== undefined) transactionData.amountUSD = amountUSD
      if (description !== undefined) transactionData.description = description
      if (relatedJobId !== undefined) transactionData.relatedJobId = relatedJobId
      if (batchNumber !== undefined) transactionData.batchNumber = batchNumber

      await db.collection(COLLECTIONS.CREDIT_TRANSACTIONS).add(transactionData)

      console.log(`✅ Credits adjusted: ${currentBalance} → ${newBalance} (${deltaCredits >= 0 ? '+' : ''}${deltaCredits})`)
    } catch (error) {
      console.error('❌ Error adjusting credits:', error)
      throw error
    }
  }
}

// Translation Job Operations
export class TranslationJobService {
  static async createJob(job: Omit<TranslationJob, 'id' | 'createdAt'>): Promise<string> {
    try {
      const db = getAdminDb()
      const jobData = {
        ...job,
        createdAt: new Date()
      }

      const docRef = await db.collection(COLLECTIONS.TRANSLATION_JOBS).add(jobData)
      return docRef.id
    } catch (error) {
      console.error('❌ Error creating translation job:', error)
      throw error
    }
  }

  static async getJob(jobId: string): Promise<TranslationJob | null> {
    try {
      const db = getAdminDb()
      const jobDoc = await db.collection(COLLECTIONS.TRANSLATION_JOBS).doc(jobId).get()
      return jobDoc.exists ? { id: jobDoc.id, ...jobDoc.data() } as TranslationJob : null
    } catch (error) {
      console.error('❌ Error getting translation job:', error)
      throw error
    }
  }

  static async updateJob(jobId: string, updates: Partial<TranslationJob>): Promise<void> {
    try {
      const db = getAdminDb()
      await db.collection(COLLECTIONS.TRANSLATION_JOBS).doc(jobId).update(updates)
    } catch (error) {
      console.error('❌ Error updating translation job:', error)
      throw error
    }
  }

  static async getUserJobs(userId: string, limitCount = 50): Promise<TranslationJob[]> {
    try {
      const db = getAdminDb()
      const snapshot = await db.collection(COLLECTIONS.TRANSLATION_JOBS)
        .where('userId', '==', userId)
        .orderBy('createdAt', 'desc')
        .limit(limitCount)
        .get()

      return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as TranslationJob))
    } catch (error) {
      console.error('❌ Error getting user jobs:', error)
      throw error
    }
  }
}

// Analytics Operations
export class AnalyticsService {
  static async recordEvent(userId: string, event: string, properties: Record<string, any> = {}): Promise<void> {
    try {
      const db = getAdminDb()
      const today = new Date().toISOString().split('T')[0]
      const entryId = `${userId}_${today}_${event}`

      await db.collection(COLLECTIONS.ANALYTICS).doc(entryId).set({
        userId,
        date: today,
        event,
        properties,
        count: 1,
        createdAt: new Date(),
        updatedAt: new Date()
      }, { merge: true })
    } catch (error) {
      console.error('❌ Error recording analytics event:', error)
      // Don't throw - analytics shouldn't break the main flow
    }
  }

  static async getUserAnalytics(userId: string, startDate: string, endDate: string): Promise<AnalyticsEntry[]> {
    try {
      const db = getAdminDb()
      const snapshot = await db.collection(COLLECTIONS.ANALYTICS)
        .where('userId', '==', userId)
        .where('date', '>=', startDate)
        .where('date', '<=', endDate)
        .orderBy('date', 'desc')
        .get()

      return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as AnalyticsEntry))
    } catch (error) {
      console.error('❌ Error getting user analytics:', error)
      throw error
    }
  }
}

// Error Logging
export class ErrorTracker {
  static async logError(error: Error, context: string, userId?: string): Promise<void> {
    try {
      const db = getAdminDb()
      await db.collection(COLLECTIONS.ERROR_LOGS).add({
        message: error.message,
        stack: error.stack,
        context,
        userId,
        timestamp: new Date(),
        userAgent: typeof window !== 'undefined' ? window.navigator.userAgent : 'server'
      })
    } catch (logError) {
      console.error('❌ Failed to log error:', logError)
      // Don't throw - error logging shouldn't break the main flow
    }
  }

  static async logApiError(error: Error, endpoint: string, method: string, userId?: string): Promise<void> {
    return this.logError(error, `API ${method} ${endpoint}`, userId)
  }

  static addBreadcrumb(message: string, category: string, level: 'info' | 'warning' | 'error' = 'info', data?: any): void {
    // For now, just log to console
    console.log(`[${level.toUpperCase()}] ${category}: ${message}`, data || '')
  }
}
