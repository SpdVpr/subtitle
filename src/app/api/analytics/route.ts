import { NextRequest, NextResponse } from 'next/server'
import { TranslationJobService, UserService } from '@/lib/database-admin'
import { ErrorTracker } from '@/lib/error-tracking'

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const userId = searchParams.get('userId')
    const period = searchParams.get('period') || 'month'
    const startDate = searchParams.get('startDate')
    const endDate = searchParams.get('endDate')

    console.log('📊 Analytics API called:', { userId, period, startDate, endDate })

    if (!userId) {
      return NextResponse.json(
        { error: 'Missing userId' },
        { status: 400 }
      )
    }

    // Check if user exists and has analytics access
    let user = null
    try {
      user = await UserService.getUser(userId)
      console.log('👤 User found:', user ? 'Yes' : 'No')
      console.log('🔍 DEBUG: Analytics called for userId:', userId)
    } catch (error) {
      console.error('❌ Error fetching user:', error)
      // Continue with null user for demo handling
    }

    if (!user) {
      // For demo users in development, create a mock user
      if (process.env.NODE_ENV === 'development' && (userId.includes('demo') || userId === 'premium-user-demo')) {
        console.log('🧪 Creating mock user for demo analytics')
        user = {
          uid: userId,
          email: 'demo@test.com',
          displayName: 'Demo User',
          usage: { storageUsed: 0 }
        } as any
      } else {
        return NextResponse.json(
          { error: 'User not found' },
          { status: 404 }
        )
      }
    }

    // Allow all users to access analytics
    // Analytics is now available for everyone

    // Calculate date range
    const endDateObj = endDate ? new Date(endDate) : new Date()
    let startDateObj: Date

    if (startDate) {
      startDateObj = new Date(startDate)
    } else {
      // Calculate start date based on period
      startDateObj = new Date(endDateObj)
      switch (period) {
        case 'week':
          startDateObj.setDate(startDateObj.getDate() - 7)
          break
        case 'month':
          startDateObj.setMonth(startDateObj.getMonth() - 1)
          break
        case 'year':
          startDateObj.setFullYear(startDateObj.getFullYear() - 1)
          break
        default:
          startDateObj.setMonth(startDateObj.getMonth() - 1)
      }
    }

    const startDateStr = startDateObj.toISOString().split('T')[0]
    const endDateStr = endDateObj.toISOString().split('T')[0]

    console.log('📅 Date range:', { startDateStr, endDateStr })

    // Get real data from translation jobs
    console.log('📊 Fetching translation jobs for user:', userId)
    let translationJobs = []

    try {
      translationJobs = await TranslationJobService.getUserJobs(userId, 200)
      console.log('📊 Total translation jobs found:', translationJobs.length)

      if (translationJobs.length === 0) {
        console.log('⚠️ No translation jobs found for user:', userId)
        // Return empty data structure instead of error
        return NextResponse.json({
          period,
          startDate: startDateStr,
          endDate: endDateStr,
          data: {
            totalTranslations: 0,
            totalFiles: 0,
            totalSubtitles: 0,
            averageProcessingTime: 0,
            storageUsed: 0,
            successRate: 0,
            translationsByLanguage: {},
            translationsByService: {},
            dailyUsage: [],
            topLanguages: [],
            recentActivity: []
          }
        })
      }

      // Filter jobs by date range
      const startTime = startDateObj.getTime()
      const endTime = endDateObj.getTime()

      const filteredJobs = translationJobs.filter(job => {
        const jobDate = job.createdAt instanceof Date ? job.createdAt : new Date(job.createdAt)
        const jobTime = jobDate.getTime()
        return jobTime >= startTime && jobTime <= endTime
      })

      console.log('📊 Jobs in date range:', filteredJobs.length)
      console.log('📊 Date range:', { startDateStr, endDateStr })

      // Use all jobs if no jobs in date range (for demo purposes)
      translationJobs = filteredJobs.length > 0 ? filteredJobs : translationJobs.slice(0, 20)
      console.log('📊 Using jobs for analytics:', translationJobs.length)

    } catch (error) {
      console.error('❌ Error fetching translation jobs:', error)
      return NextResponse.json(
        { error: 'Failed to fetch translation data', details: error instanceof Error ? error.message : String(error) },
        { status: 500 }
      )
    }

    // Aggregate data from translation jobs
    console.log('📊 Aggregating data from', translationJobs.length, 'jobs')

    const totalTranslations = translationJobs.length
    const totalFiles = translationJobs.length
    const totalSubtitles = translationJobs.reduce((sum, job) => sum + (job.subtitleCount || 30), 0) // Default 30 if not set
    const completedJobs = translationJobs.filter(job => job.status === 'completed')
    const failedJobs = translationJobs.filter(job => job.status === 'failed')
    const successRate = totalTranslations > 0 ? (completedJobs.length / totalTranslations) * 100 : 0

    // Calculate average processing time
    const totalProcessingTime = translationJobs.reduce((sum, job) => sum + (job.processingTimeMs || 2000), 0)
    const averageProcessingTime = totalTranslations > 0 ? totalProcessingTime / totalTranslations / 1000 : 0

    // Aggregate by language
    const languageMap = new Map<string, number>()
    translationJobs.forEach(job => {
      if (job.targetLanguage) {
        const current = languageMap.get(job.targetLanguage) || 0
        languageMap.set(job.targetLanguage, current + 1)
      }
    })

    // Aggregate by service
    const serviceMap = new Map<string, number>()
    translationJobs.forEach(job => {
      const service = job.aiService === 'premium' ? 'Premium AI' : 'Google Translate'
      const current = serviceMap.get(service) || 0
      serviceMap.set(service, current + 1)
    })

    console.log('📊 Language distribution:', Object.fromEntries(languageMap))
    console.log('📊 Service distribution:', Object.fromEntries(serviceMap))

    // Daily usage aggregation with safe date handling
    const dailyUsageMap = new Map<string, { translations: number, files: number, processingTime: number }>()
    translationJobs.forEach(job => {
      let jobDate
      try {
        if (job.createdAt instanceof Date) {
          jobDate = job.createdAt
        } else if (job.createdAt && job.createdAt.toDate) {
          // Firestore Timestamp
          jobDate = job.createdAt.toDate()
        } else if (job.createdAt) {
          // String or other format
          jobDate = new Date(job.createdAt)
        } else {
          // Fallback to current date
          jobDate = new Date()
        }

        // Validate the date
        if (isNaN(jobDate.getTime())) {
          console.warn('Invalid date for job:', job.id, job.createdAt)
          jobDate = new Date() // Use current date as fallback
        }

        const dateStr = jobDate.toISOString().split('T')[0]

        const existing = dailyUsageMap.get(dateStr) || { translations: 0, files: 0, processingTime: 0 }
        existing.translations += 1
        existing.files += 1
        existing.processingTime += (job.processingTimeMs || 2000) / 1000 // Default 2 seconds
        dailyUsageMap.set(dateStr, existing)
      } catch (error) {
        console.error('Error processing job date:', job.id, job.createdAt, error)
        // Skip this job's daily usage if date is completely invalid
      }
    })

    // Convert to arrays and sort
    const dailyUsage = Array.from(dailyUsageMap.entries())
      .map(([date, data]) => ({ date, ...data }))
      .sort((a, b) => a.date.localeCompare(b.date))

    const topLanguages = Array.from(languageMap.entries())
      .map(([language, count]) => ({
        language,
        count,
        percentage: Math.round((count / totalTranslations) * 100)
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5)

    // Recent activity from latest jobs with safe date handling
    const recentActivity = translationJobs
      .slice(0, 10)
      .map(job => {
        let timestamp
        try {
          if (job.createdAt instanceof Date) {
            timestamp = job.createdAt
          } else if (job.createdAt && job.createdAt.toDate) {
            // Firestore Timestamp
            timestamp = job.createdAt.toDate()
          } else if (job.createdAt) {
            // String or other format
            timestamp = new Date(job.createdAt)
          } else {
            // Fallback to current date
            timestamp = new Date()
          }

          // Validate the date
          if (isNaN(timestamp.getTime())) {
            console.warn('Invalid timestamp for job:', job.id, job.createdAt)
            timestamp = new Date() // Use current date as fallback
          }
        } catch (error) {
          console.error('Error processing job timestamp:', job.id, job.createdAt, error)
          timestamp = new Date() // Use current date as fallback
        }

        return {
          id: job.id || 'unknown',
          type: 'translation' as const,
          description: `Translated "${job.originalFileName || 'unknown file'}" to ${job.targetLanguage || 'unknown language'}`,
          timestamp,
          status: job.status === 'completed' ? 'success' as const :
                  job.status === 'failed' ? 'failed' as const : 'processing' as const
        }
      })

    // Calculate credits used from credit transactions in the date range
    let creditsUsed = 0
    try {
      const { getAdminDb } = await import('@/lib/firebase-admin')
      const adminDb = await getAdminDb()

      console.log('💳 Fetching credit transactions for period:', { startDateStr, endDateStr })
      console.log('💳 DEBUG: Looking for transactions for userId:', userId)

      // Get credit transactions (deductions) for this user in the date range
      const creditTransactionsSnapshot = await adminDb.collection('credit_transactions')
        .where('userId', '==', userId)
        .get()

      console.log('💳 DEBUG: Found', creditTransactionsSnapshot.size, 'total transactions for user')

      creditTransactionsSnapshot.forEach(doc => {
        const transaction = doc.data()
        const transactionDate = transaction.createdAt?.toDate?.() || new Date(transaction.createdAt)

        console.log('💳 Checking transaction:', {
          id: doc.id,
          type: transaction.type,
          credits: transaction.credits || transaction.amount,
          date: transactionDate.toISOString().split('T')[0],
          inDateRange: transactionDate >= startDateObj && transactionDate <= endDateObj,
          startDate: startDateObj.toISOString().split('T')[0],
          endDate: endDateObj.toISOString().split('T')[0],
          description: transaction.description || transaction.reason,
          relatedJobId: transaction.relatedJobId
        })

        // Check if transaction is in date range and is a deduction
        if (transactionDate >= startDateObj && transactionDate <= endDateObj) {
          // For debit transactions, the credits field contains positive value but represents a deduction
          if (transaction.type === 'deduction' || transaction.type === 'debit' || transaction.type === 'admin_debit') {
            // For debit transactions, credits field is positive but represents usage
            const credits = Math.abs(transaction.credits || transaction.amount || 0)
            creditsUsed += credits
            console.log('💳 ✅ Found credit deduction:', {
              id: doc.id,
              type: transaction.type,
              credits,
              date: transactionDate.toISOString().split('T')[0],
              reason: transaction.reason || transaction.description
            })
          } else if ((transaction.credits && transaction.credits < 0) || (transaction.amount && transaction.amount < 0)) {
            // Handle negative values (old format)
            const credits = Math.abs(transaction.credits || transaction.amount || 0)
            creditsUsed += credits
            console.log('💳 ✅ Found credit deduction (negative value):', {
              id: doc.id,
              type: transaction.type,
              credits,
              date: transactionDate.toISOString().split('T')[0],
              reason: transaction.reason || transaction.description
            })
          } else {
            console.log('💳 ❌ Skipped transaction (not a deduction):', {
              id: doc.id,
              type: transaction.type,
              credits: transaction.credits || transaction.amount
            })
          }
        }
      })

      console.log('💳 Total credits used in period:', creditsUsed)
    } catch (error) {
      console.error('❌ Error calculating credits used:', error)
      // Continue with creditsUsed = 0
    }

    console.log('📊 Final aggregated data:', {
      totalTranslations,
      totalFiles,
      totalSubtitles,
      creditsUsed,
      successRate: Math.round(successRate),
      languageCount: languageMap.size,
      serviceCount: serviceMap.size,
      dailyUsageCount: dailyUsage.length,
      recentActivityCount: recentActivity.length
    })

    // Return the final aggregated data
    const finalData = {
      totalTranslations,
      totalFiles,
      totalSubtitles,
      creditsUsed: Math.round(creditsUsed * 10) / 10, // Round to 1 decimal
      averageProcessingTime: Math.round(averageProcessingTime * 100) / 100, // Round to 2 decimals
      storageUsed: user?.usage?.storageUsed || 0,
      successRate: Math.round(successRate),

      translationsByLanguage: Object.fromEntries(languageMap),
      translationsByService: Object.fromEntries(serviceMap),
      dailyUsage,
      topLanguages,
      recentActivity
    }

    console.log('📊 Returning analytics data:', finalData)

    return NextResponse.json({
      period,
      startDate: startDateStr,
      endDate: endDateStr,
      data: finalData
    })

  } catch (error) {
    console.error('❌ Analytics API Error:', error)

    try {
      await ErrorTracker.logApiError(
        error instanceof Error ? error : new Error(String(error)),
        '/api/analytics',
        'GET'
      )
    } catch (logError) {
      console.error('❌ Error logging failed:', logError)
    }

    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    )
  }
}

// POST endpoint to record custom analytics events
export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { userId, event, properties } = body

    if (!userId || !event) {
      return NextResponse.json(
        { error: 'Missing userId or event' },
        { status: 400 }
      )
    }

    // Record custom event (this could be expanded based on needs)
    const today = new Date().toISOString().split('T')[0]
    
    // For now, we'll just log it as a breadcrumb
    ErrorTracker.addBreadcrumb(
      `Custom event: ${event}`,
      'analytics',
      'info',
      { userId, ...properties }
    )

    return NextResponse.json({ success: true })

  } catch (error) {
    await ErrorTracker.logApiError(
      error instanceof Error ? error : new Error(String(error)),
      '/api/analytics',
      'POST'
    )

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
