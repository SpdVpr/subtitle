// Server-side database operations using Firebase Admin with client SDK fallback
import { getAdminDb, getAdminStorage } from './firebase-admin'
import {
  UserProfile,
  TranslationJob,
  BatchJob,
  AnalyticsEntry,
  StoredFile,
  Subscription,
  ErrorLog
} from '@/types/database'

// Fields the public statistics endpoint aggregates. Kept deliberately narrow so
// the heavy `translatedContent` SRT payload never leaves Firestore.
export type StatisticsJob = Pick<
  TranslationJob,
  'status' | 'originalFileName' | 'targetLanguage' | 'createdAt' | 'completedAt'
>

// Fields the per-user analytics endpoints aggregate. Same reason as above: the
// analytics pages only count and group jobs, so the SRT payload must not be read.
export type UserAnalyticsJob = Pick<
  TranslationJob,
  'id' | 'status' | 'originalFileName' | 'targetLanguage' | 'aiService'
  | 'createdAt' | 'processingTimeMs' | 'subtitleCount'
>

// Fields the translation-history list renders. `translatedContent` is absent on
// purpose -- callers that need the SRT itself fetch the single job they opened
// through /api/translation-history/download.
export type HistoryJob = Pick<
  TranslationJob,
  'id' | 'status' | 'originalFileName' | 'translatedFileName' | 'sourceLanguage'
  | 'targetLanguage' | 'aiService' | 'createdAt' | 'completedAt' | 'subtitleCount'
> & { updatedAt?: TranslationJob['createdAt'] }

// The translated SRT is a blob, not a field. Firestore bills whole documents,
// so keeping a subtitle file beside the job metadata taxed every query over
// translation_jobs - that is what moved 336 GiB of egress on 2026-08-28.
// Cloud Storage has no practical size ceiling, so long subtitles stay uncapped.
const TRANSLATION_CONTENT_PREFIX = 'translations'

function translationContentFile(jobId: string) {
  return getAdminStorage().bucket().file(`${TRANSLATION_CONTENT_PREFIX}/${jobId}.srt`)
}

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

      const creditsBalance = options?.creditsBalance ?? 0
      const creditsTotalPurchased = 0

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
        freeTranslationUsed: false,
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
      const { translatedContent, ...metadata } = job

      const docRef = await db.collection(COLLECTIONS.TRANSLATION_JOBS).add({
        ...metadata,
        createdAt: new Date()
      })

      if (translatedContent) {
        await TranslationJobService.saveTranslatedContent(docRef.id, translatedContent)
      }
      return docRef.id
    } catch (error) {
      console.error('❌ Error creating translation job:', error)
      throw error
    }
  }

  /**
   * Stores the translated SRT as a file. Falls back to the legacy inline field
   * if Storage is unreachable - losing a finished translation is worse than
   * paying to keep it in Firestore.
   */
  static async saveTranslatedContent(jobId: string, content: string): Promise<void> {
    try {
      await translationContentFile(jobId).save(content, {
        contentType: 'text/plain; charset=utf-8',
        resumable: false
      })
    } catch (error) {
      console.error('Storage write failed, keeping content on the job document:', error)
      await getAdminDb().collection(COLLECTIONS.TRANSLATION_JOBS).doc(jobId)
        .set({ translatedContent: content }, { merge: true })
    }
  }

  /**
   * Reads the translated SRT. Jobs created before the migration still carry it
   * inline, so the document is the fallback, not the primary source.
   */
  static async getTranslatedContent(jobId: string): Promise<string | null> {
    try {
      const file = translationContentFile(jobId)
      const [exists] = await file.exists()
      if (exists) {
        const [buffer] = await file.download()
        return buffer.toString('utf8')
      }
    } catch (error) {
      console.error('Storage read failed for job', jobId, error)
    }

    const doc = await getAdminDb().collection(COLLECTIONS.TRANSLATION_JOBS).doc(jobId).get()
    const legacy = doc.get('translatedContent')
    return typeof legacy === 'string' && legacy.length > 0 ? legacy : null
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
      const { translatedContent, ...metadata } = updates

      if (translatedContent !== undefined) {
        await TranslationJobService.saveTranslatedContent(jobId, translatedContent)
      }
      // update() rejects an empty payload, and a content-only update leaves none.
      if (Object.keys(metadata).length > 0) {
        await getAdminDb().collection(COLLECTIONS.TRANSLATION_JOBS).doc(jobId).update(metadata)
      }
    } catch (error) {
      console.error('❌ Error updating translation job:', error)
      throw error
    }
  }

  /**
   * Aggregate-only view of one user's recent jobs, for the analytics endpoints.
   *
   * The projection is the point, exactly as in getJobsForStatistics: a
   * TranslationJob carries the whole translated SRT in `translatedContent`
   * (~68 KB per document), so reading 200 full documents moved ~13 MB out of
   * Firestore on every /api/analytics call just to compute a handful of counts.
   */
  static async getUserJobsForAnalytics(userId: string, limitCount = 50): Promise<UserAnalyticsJob[]> {
    try {
      const db = getAdminDb()

      const snapshot = await db.collection(COLLECTIONS.TRANSLATION_JOBS)
        .where('userId', '==', userId)
        .orderBy('createdAt', 'desc')
        .limit(limitCount)
        .select('status', 'originalFileName', 'targetLanguage', 'aiService', 'createdAt', 'processingTimeMs', 'subtitleCount')
        .get()

      return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as UserAnalyticsJob))
    } catch (error) {
      console.error('Error getting user jobs for analytics:', error)
      throw error
    }
  }

  /**
   * List view of one user's recent jobs, for /api/translation-history.
   *
   * Same projection rationale: the history list only renders file names,
   * languages, counts and timestamps, but a 20-job page of full documents was
   * ~1.4 MB of egress because every job embeds its translated SRT.
   */
  static async getUserJobsForHistory(userId: string, limitCount = 50): Promise<HistoryJob[]> {
    try {
      const db = getAdminDb()

      const snapshot = await db.collection(COLLECTIONS.TRANSLATION_JOBS)
        .where('userId', '==', userId)
        .orderBy('createdAt', 'desc')
        .limit(limitCount)
        .select('status', 'originalFileName', 'translatedFileName', 'sourceLanguage', 'targetLanguage', 'aiService', 'createdAt', 'completedAt', 'updatedAt', 'subtitleCount')
        .get()

      return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as HistoryJob))
    } catch (error) {
      console.error('Error getting user jobs for history:', error)
      throw error
    }
  }

  /**
   * Aggregate-only view of recent jobs for the public statistics endpoint.
   *
   * The projection is the point: a TranslationJob carries the whole translated
   * SRT in `translatedContent` (~48 KB per document), so fetching full
   * documents moved ~49 MB out of Firestore on every request. Only the fields
   * the statistics actually aggregate are read.
   */
  static async getJobsForStatistics(limitCount = 1000): Promise<StatisticsJob[]> {
    try {
      const db = getAdminDb()

      const snapshot = await db.collection(COLLECTIONS.TRANSLATION_JOBS)
        .orderBy('createdAt', 'desc')
        .limit(limitCount)
        .select('status', 'originalFileName', 'targetLanguage', 'createdAt', 'completedAt')
        .get()

      return snapshot.docs.map(doc => doc.data() as StatisticsJob)
    } catch (error) {
      console.error('Error getting jobs for statistics:', error)
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
        .count()
        .get()
      const totalCount = totalCountSnapshot.data().count

      // First try with the optimized query (requires index)
      try {
        // For pagination, we need to get all results and slice them
        // This is not ideal but Firebase doesn't support offset directly
        const allJobsSnapshot = await db.collection(COLLECTIONS.TRANSLATION_JOBS)
          .where('status', '==', 'completed')
          .orderBy('completedAt', 'desc')
          .limit(Math.min(1000, offset + limitCount)) // Limit to reasonable number
        .select('originalFileName', 'translatedFileName', 'sourceLanguage', 'targetLanguage', 'userId', 'status', 'aiService', 'subtitleCount', 'characterCount', 'processingTimeMs', 'createdAt', 'completedAt', 'confidence')
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
        .select('originalFileName', 'translatedFileName', 'sourceLanguage', 'targetLanguage', 'userId', 'status', 'aiService', 'subtitleCount', 'characterCount', 'processingTimeMs', 'createdAt', 'completedAt', 'confidence')
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
