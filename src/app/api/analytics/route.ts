import { NextRequest, NextResponse } from 'next/server'
import { AnalyticsService, UserService } from '@/lib/database-admin'
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

    // Get real data from translation jobs instead of analytics collection
    let translationJobs = []
    try {
      const { TranslationJobService } = await import('@/lib/database-admin')
      translationJobs = await TranslationJobService.getUserJobs(userId, 100)
      console.log('📊 Translation jobs found:', translationJobs.length)

      // Filter jobs by date range
      const startTime = startDateObj.getTime()
      const endTime = endDateObj.getTime()

      translationJobs = translationJobs.filter(job => {
        const jobDate = job.createdAt instanceof Date ? job.createdAt : new Date(job.createdAt)
        const jobTime = jobDate.getTime()
        return jobTime >= startTime && jobTime <= endTime
      })

      console.log('📊 Jobs in date range:', translationJobs.length)
    } catch (error) {
      console.error('❌ Error fetching translation jobs:', error)
      // Continue with empty array for graceful fallback
    }

    // Aggregate data from translation jobs
    const aggregatedData = {
      totalTranslations: translationJobs.length,
      totalFiles: translationJobs.length,
      totalSubtitles: translationJobs.reduce((sum, job) => sum + (job.subtitleCount || 0), 0),
      averageProcessingTime: 0,
      storageUsed: user?.usage?.storageUsed || 0,
      successRate: 0,

      translationsByLanguage: {} as Record<string, number>,
      translationsByService: {} as Record<string, number>,
      dailyUsage: [] as Array<{
        date: string
        translations: number
        files: number
        processingTime: number
      }>,

      topLanguages: [] as Array<{
        language: string
        count: number
        percentage: number
      }>,

      recentActivity: [] as Array<{
        id: string
        type: 'translation' | 'batch' | 'edit'
        description: string
        timestamp: Date
        status: 'success' | 'failed' | 'processing'
      }>
    }

    let totalProcessingTime = 0
    let totalErrors = 0
    let totalOperations = translationJobs.length
    const dailyUsageMap = new Map<string, { translations: number, files: number, processingTime: number }>()

    // Process translation jobs
    translationJobs.forEach(job => {
      totalProcessingTime += job.processingTimeMs || 0

      if (job.status === 'failed') {
        totalErrors += 1
      }

      // Aggregate by target language
      if (job.targetLanguage) {
        aggregatedData.translationsByLanguage[job.targetLanguage] =
          (aggregatedData.translationsByLanguage[job.targetLanguage] || 0) + 1
      }

      // Aggregate by service
      const service = job.aiService === 'premium' ? 'Premium AI' : 'Google Translate'
      aggregatedData.translationsByService[service] =
        (aggregatedData.translationsByService[service] || 0) + 1

      // Daily usage
      const jobDate = job.createdAt instanceof Date ? job.createdAt : new Date(job.createdAt)
      const dateStr = jobDate.toISOString().split('T')[0]

      const existing = dailyUsageMap.get(dateStr) || { translations: 0, files: 0, processingTime: 0 }
      existing.translations += 1
      existing.files += 1
      existing.processingTime += (job.processingTimeMs || 0) / 1000
      dailyUsageMap.set(dateStr, existing)
    })

    // Convert daily usage map to array
    aggregatedData.dailyUsage = Array.from(dailyUsageMap.entries()).map(([date, data]) => ({
      date,
      ...data
    }))

    // Calculate averages and percentages
    if (aggregatedData.totalTranslations > 0) {
      aggregatedData.averageProcessingTime = totalProcessingTime / aggregatedData.totalTranslations / 1000 // Convert to seconds
    }

    if (totalOperations > 0) {
      aggregatedData.successRate = ((totalOperations - totalErrors) / totalOperations) * 100
    }

    // Calculate top languages
    const languageEntries = Object.entries(aggregatedData.translationsByLanguage)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 5)

    aggregatedData.topLanguages = languageEntries.map(([language, count]) => ({
      language,
      count,
      percentage: Math.round((count / aggregatedData.totalTranslations) * 100)
    }))

    // Sort daily usage by date
    aggregatedData.dailyUsage.sort((a, b) => a.date.localeCompare(b.date))

    // Recent activity from translation jobs
    aggregatedData.recentActivity = translationJobs
      .slice(0, 10) // Get latest 10 jobs
      .map(job => ({
        id: job.id || 'unknown',
        type: 'translation' as const,
        description: `Translated "${job.originalFileName}" to ${job.targetLanguage}`,
        timestamp: job.createdAt instanceof Date ? job.createdAt : new Date(job.createdAt),
        status: job.status === 'completed' ? 'success' as const :
                job.status === 'failed' ? 'failed' as const : 'processing' as const
      }))

    return NextResponse.json({
      period,
      startDate: startDateStr,
      endDate: endDateStr,
      data: aggregatedData
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
