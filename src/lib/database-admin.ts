// Server-side database operations using Firebase Admin with client SDK fallback
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

// Helper function to get database instance
async function getDatabase() {
  const db = getAdminDb()
  return { db, isAdmin: true }
}

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
      const { db, isAdmin } = await getDatabase()

      // Admin SDK
      const userDoc = await db.collection(COLLECTIONS.USERS).doc(uid).get()

      if (!userDoc.exists) {
        return null
      }

      return userDoc.data() as UserProfile
    } catch (error) {
      console.error('❌ Error getting user:', error)
      throw error
    }
  }

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
    try {
      console.log('👤 Creating new user in Firestore:', uid, email)

      const creditsBalance = options?.creditsBalance ?? 100
      const creditsTotalPurchased = options?.creditsBalance ?? 100

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
        creditsBalance,
        creditsTotalPurchased,
        registrationTracking: options?.registrationTracking,
        preferences: {
          defaultAiService: 'google',
          emailNotifications: true,
          theme: 'system'
        }
      }

      const db = getAdminDb()
      await db.collection(COLLECTIONS.USERS).doc(uid).set(userProfile)
      console.log('✅ User created successfully in Firestore', {
        creditsBalance,
        suspiciousScore: options?.registrationTracking?.suspiciousScore
      })
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

  static async updateUsage(uid: string, usage: { translationsUsed?: number; lastActive?: Date; storageUsed?: number; batchJobsUsed?: number }): Promise<void> {
    try {
      console.log('📊 Updating user usage:', uid, usage)
      const db = getAdminDb()

      // Get current user data to increment properly
      const userDoc = await db.collection(COLLECTIONS.USERS).doc(uid).get()
      if (!userDoc.exists) {
        console.warn('⚠️ User not found for usage update:', uid)
        return
      }

      const userData = userDoc.data()
      const currentUsage = userData.usage || {}

      const updatedUsage = {
        ...currentUsage,
        translationsUsed: (currentUsage.translationsUsed || 0) + (usage.translationsUsed || 0),
        storageUsed: (currentUsage.storageUsed || 0) + (usage.storageUsed || 0),
        batchJobsUsed: (currentUsage.batchJobsUsed || 0) + (usage.batchJobsUsed || 0),
        lastActive: usage.lastActive || currentUsage.lastActive || new Date()
      }

      await db.collection(COLLECTIONS.USERS).doc(uid).update({
        usage: updatedUsage,
        updatedAt: new Date()
      })

      console.log('✅ User usage updated successfully:', updatedUsage)
    } catch (error) {
      console.error('❌ Failed to update user usage:', error)
      throw error
    }
  }

  static async adjustCredits(uid: string, deltaCredits: number, description?: string, relatedJobId?: string, batchNumber?: number, amountUSD?: number): Promise<void> {
    console.log(`🔧 ADJUST_CREDITS: Called with uid=${uid}, deltaCredits=${deltaCredits}, description="${description}"`)
    try {
      const { db, isAdmin } = await getDatabase()
      console.log(`🔧 ADJUST_CREDITS: Got database connection, isAdmin=${isAdmin}`)

      // Admin SDK
      console.log(`🔧 ADJUST_CREDITS: Getting user document for ${uid}`)
      const userDoc = await db.collection(COLLECTIONS.USERS).doc(uid).get()
      if (!userDoc.exists) {
        console.error(`🔧 ADJUST_CREDITS: User ${uid} not found`)
        throw new Error(`User ${uid} not found`)
      }
      const userData = userDoc.data() as UserProfile
      console.log(`🔧 ADJUST_CREDITS: User found, current balance: ${userData.creditsBalance || 0}`)

      const currentBalance = userData.creditsBalance || 0
      const newBalance = currentBalance + deltaCredits
      console.log(`🔧 ADJUST_CREDITS: Balance change: ${currentBalance} → ${newBalance} (${deltaCredits >= 0 ? '+' : ''}${deltaCredits})`)

      // Record transaction data
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

      // Admin SDK
      await db.collection(COLLECTIONS.USERS).doc(uid).update({
        creditsBalance: newBalance,
        updatedAt: new Date()
      })
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
      const { db, isAdmin } = await getDatabase()

      // Admin SDK
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

  static async getAllJobs(limitCount = 1000): Promise<TranslationJob[]> {
    try {
      const db = getAdminDb()

      const snapshot = await db.collection(COLLECTIONS.TRANSLATION_JOBS)
        .orderBy('createdAt', 'desc')
        .limit(limitCount)
        .get()

      return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as TranslationJob))
    } catch (error) {
      console.error('❌ Error getting all jobs:', error)
      throw error
    }
  }

  static async getRecentTranslations(limitCount = 20, offset = 0): Promise<{
    translations: (TranslationJob & { userEmail?: string, userDisplayName?: string })[]
    totalCount: number
    hasMore: boolean
  }> {
    try {
      const db = getAdminDb()

      // First get total count of completed translations
      const totalCountSnapshot = await db.collection(COLLECTIONS.TRANSLATION_JOBS)
        .where('status', '==', 'completed')
        .get()
      const totalCount = totalCountSnapshot.size

      // First try with the optimized query (requires index)
      try {
        // For pagination, we need to get all results and slice them
        // This is not ideal but Firebase doesn't support offset directly
        const allJobsSnapshot = await db.collection(COLLECTIONS.TRANSLATION_JOBS)
          .where('status', '==', 'completed')
          .orderBy('completedAt', 'desc')
          .limit(Math.min(1000, offset + limitCount)) // Limit to reasonable number
          .get()

        const allJobs = allJobsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as TranslationJob))
        const jobs = allJobs.slice(offset, offset + limitCount)

        // Get user information for each job
        const jobsWithUserInfo = await Promise.all(
          jobs.map(async (job) => {
            try {
              const userDoc = await db.collection(COLLECTIONS.USERS).doc(job.userId).get()
              const userData = userDoc.exists ? userDoc.data() : null

              return {
                ...job,
                userEmail: userData?.email || 'Unknown',
                userDisplayName: userData?.displayName || null
              }
            } catch (error) {
              console.error('❌ Error getting user data for job:', job.id, error)
              return {
                ...job,
                userEmail: 'Unknown',
                userDisplayName: null
              }
            }
          })
        )

        return {
          translations: jobsWithUserInfo,
          totalCount,
          hasMore: offset + limitCount < totalCount
        }
      } catch (indexError) {
        console.log('⚠️ Index not available, falling back to less efficient query')

        // Fallback: Get all completed jobs and sort in memory
        const jobsSnapshot = await db.collection(COLLECTIONS.TRANSLATION_JOBS)
          .where('status', '==', 'completed')
          .limit(Math.min(1000, offset + limitCount + 100)) // Get more to sort and paginate in memory
          .get()

        let jobs = jobsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as TranslationJob))

        // Sort by completedAt in memory and paginate
        jobs = jobs
          .filter(job => job.completedAt) // Only jobs with completedAt
          .sort((a, b) => {
            const aTime = a.completedAt?.seconds || a.completedAt?.getTime?.() || 0
            const bTime = b.completedAt?.seconds || b.completedAt?.getTime?.() || 0
            return bTime - aTime // Descending order
          })
          .slice(offset, offset + limitCount)

        // Get user information for each job
        const jobsWithUserInfo = await Promise.all(
          jobs.map(async (job) => {
            try {
              const userDoc = await db.collection(COLLECTIONS.USERS).doc(job.userId).get()
              const userData = userDoc.exists ? userDoc.data() : null

              return {
                ...job,
                userEmail: userData?.email || 'Unknown',
                userDisplayName: userData?.displayName || null
              }
            } catch (error) {
              console.error('❌ Error getting user data for job:', job.id, error)
              return {
                ...job,
                userEmail: 'Unknown',
                userDisplayName: null
              }
            }
          })
        )

        return {
          translations: jobsWithUserInfo,
          totalCount,
          hasMore: offset + limitCount < totalCount
        }
      }
    } catch (error) {
      console.error('❌ Error getting recent translations:', error)
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

  static async recordDailyUsage(userId: string, date: string, metrics: Partial<AnalyticsEntry>): Promise<void> {
    try {
      const db = getAdminDb()
      const entryId = `${userId}_${date}`
      const entryRef = db.collection(COLLECTIONS.ANALYTICS).doc(entryId)

      // Get existing entry or create new one
      const existingEntry = await entryRef.get()

      if (existingEntry.exists) {
        // Update existing entry
        const currentData = existingEntry.data() as AnalyticsEntry
        await entryRef.update({
          translationsCount: (currentData.translationsCount || 0) + (metrics.translationsCount || 0),
          filesProcessed: (currentData.filesProcessed || 0) + (metrics.filesProcessed || 0),
          charactersTranslated: (currentData.charactersTranslated || 0) + (metrics.charactersTranslated || 0),
          processingTimeMs: (currentData.processingTimeMs || 0) + (metrics.processingTimeMs || 0),
          languagePairs: { ...currentData.languagePairs, ...metrics.languagePairs },
          serviceUsage: { ...currentData.serviceUsage, ...metrics.serviceUsage },
          averageConfidence: metrics.averageConfidence || currentData.averageConfidence || 0,
          errorCount: (currentData.errorCount || 0) + (metrics.errorCount || 0),
          updatedAt: new Date()
        })
      } else {
        // Create new entry
        await entryRef.set({
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
          createdAt: new Date(),
          updatedAt: new Date()
        })
      }
    } catch (error) {
      console.error('❌ Error recording daily usage:', error)
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
