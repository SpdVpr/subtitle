import { NextRequest, NextResponse } from 'next/server'
import { AnalyticsService, UserService } from '@/lib/database'
import { ErrorTracker } from '@/lib/error-tracking'

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const userId = searchParams.get('userId')
    const period = searchParams.get('period') || 'month'
    const startDate = searchParams.get('startDate')
    const endDate = searchParams.get('endDate')

    if (!userId) {
      return NextResponse.json(
        { error: 'Missing userId' },
        { status: 400 }
      )
    }

    // Check if user exists and has analytics access
    const user = await UserService.getUser(userId)
    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    // Check if user has analytics access (Premium/Pro only)
    if (user.subscriptionPlan === 'free') {
      return NextResponse.json(
        { error: 'Analytics access requires Premium or Pro subscription' },
        { status: 403 }
      )
    }

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

    // Get analytics data
    const analyticsEntries = await AnalyticsService.getUserAnalytics(
      userId,
      startDateStr,
      endDateStr
    )

    // Aggregate data
    const aggregatedData = {
      totalTranslations: 0,
      totalFiles: 0,
      totalSubtitles: 0,
      averageProcessingTime: 0,
      storageUsed: user.usage.storageUsed,
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
    let totalOperations = 0

    // Process analytics entries
    analyticsEntries.forEach(entry => {
      aggregatedData.totalTranslations += entry.translationsCount
      aggregatedData.totalFiles += entry.filesProcessed
      aggregatedData.totalSubtitles += entry.charactersTranslated // Approximate
      totalProcessingTime += entry.processingTimeMs
      totalErrors += entry.errorCount
      totalOperations += entry.translationsCount

      // Aggregate language pairs
      Object.entries(entry.languagePairs).forEach(([pair, count]) => {
        const targetLang = pair.split('-')[1]
        aggregatedData.translationsByLanguage[targetLang] = 
          (aggregatedData.translationsByLanguage[targetLang] || 0) + count
      })

      // Aggregate service usage
      Object.entries(entry.serviceUsage).forEach(([service, count]) => {
        aggregatedData.translationsByService[service] = 
          (aggregatedData.translationsByService[service] || 0) + count
      })

      // Add to daily usage
      aggregatedData.dailyUsage.push({
        date: entry.date,
        translations: entry.translationsCount,
        files: entry.filesProcessed,
        processingTime: entry.processingTimeMs
      })
    })

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

    // Mock recent activity (in a real app, this would come from a separate activity log)
    aggregatedData.recentActivity = [
      {
        id: '1',
        type: 'translation',
        description: 'Translated "movie_subtitles.srt" to Spanish',
        timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
        status: 'success'
      },
      {
        id: '2',
        type: 'batch',
        description: `Batch job completed (${Math.min(aggregatedData.totalFiles, 12)} files)`,
        timestamp: new Date(Date.now() - 5 * 60 * 60 * 1000),
        status: 'success'
      }
    ]

    return NextResponse.json({
      period,
      startDate: startDateStr,
      endDate: endDateStr,
      data: aggregatedData
    })

  } catch (error) {
    await ErrorTracker.logApiError(
      error instanceof Error ? error : new Error(String(error)),
      '/api/analytics',
      'GET'
    )

    return NextResponse.json(
      { error: 'Internal server error' },
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
