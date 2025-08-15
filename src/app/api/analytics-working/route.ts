import { NextRequest, NextResponse } from 'next/server'

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const userId = searchParams.get('userId')
    const period = searchParams.get('period') || 'month'

    console.log('📊 Working Analytics API called:', { userId, period })

    if (!userId) {
      return NextResponse.json(
        { error: 'Missing userId' },
        { status: 400 }
      )
    }

    // Step 1: Try to get real data
    let realJobs = []
    let hasRealData = false
    
    try {
      console.log('🔍 Attempting to load real translation jobs...')
      const { TranslationJobService } = await import('@/lib/database-admin')
      realJobs = await TranslationJobService.getUserJobs(userId, 50)
      hasRealData = realJobs.length > 0
      console.log('📊 Real jobs found:', realJobs.length)
    } catch (error) {
      console.error('❌ Failed to load real jobs:', error)
      hasRealData = false
    }

    // Step 2: If we have real data, use it; otherwise use working mock data
    let finalData
    
    if (hasRealData) {
      console.log('✅ Using real data from', realJobs.length, 'jobs')
      
      // Calculate real statistics
      const totalTranslations = realJobs.length
      const totalFiles = realJobs.length
      const totalSubtitles = realJobs.reduce((sum, job) => sum + (job.subtitleCount || 30), 0)
      const completedJobs = realJobs.filter(job => job.status === 'completed')
      const successRate = totalTranslations > 0 ? (completedJobs.length / totalTranslations) * 100 : 0
      
      // Language distribution
      const languageMap = new Map()
      realJobs.forEach(job => {
        if (job.targetLanguage) {
          const current = languageMap.get(job.targetLanguage) || 0
          languageMap.set(job.targetLanguage, current + 1)
        }
      })
      
      // Service distribution
      const serviceMap = new Map()
      realJobs.forEach(job => {
        const service = job.aiService === 'premium' ? 'Premium AI' : 'Google Translate'
        const current = serviceMap.get(service) || 0
        serviceMap.set(service, current + 1)
      })
      
      // Daily usage
      const dailyUsageMap = new Map()
      realJobs.forEach(job => {
        const jobDate = job.createdAt instanceof Date ? job.createdAt : new Date(job.createdAt)
        const dateStr = jobDate.toISOString().split('T')[0]
        
        const existing = dailyUsageMap.get(dateStr) || { translations: 0, files: 0, processingTime: 0 }
        existing.translations += 1
        existing.files += 1
        existing.processingTime += (job.processingTimeMs || 2000) / 1000
        dailyUsageMap.set(dateStr, existing)
      })
      
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
      
      const recentActivity = realJobs
        .slice(0, 10)
        .map(job => ({
          id: job.id || 'unknown',
          type: 'translation' as const,
          description: `Translated "${job.originalFileName}" to ${job.targetLanguage}`,
          timestamp: job.createdAt instanceof Date ? job.createdAt : new Date(job.createdAt),
          status: job.status === 'completed' ? 'success' as const : 
                  job.status === 'failed' ? 'failed' as const : 'processing' as const
        }))
      
      finalData = {
        totalTranslations,
        totalFiles,
        totalSubtitles,
        averageProcessingTime: totalTranslations > 0 ? 
          realJobs.reduce((sum, job) => sum + (job.processingTimeMs || 2000), 0) / totalTranslations / 1000 : 0,
        storageUsed: totalFiles * 50000, // Estimate 50KB per file
        successRate: Math.round(successRate),
        translationsByLanguage: Object.fromEntries(languageMap),
        translationsByService: Object.fromEntries(serviceMap),
        dailyUsage,
        topLanguages,
        recentActivity
      }
      
    } else {
      console.log('⚠️ No real data found, using working mock data')
      
      finalData = {
        totalTranslations: 12,
        totalFiles: 12,
        totalSubtitles: 360,
        averageProcessingTime: 2.8,
        storageUsed: 600000, // 600KB
        successRate: 92,
        
        translationsByLanguage: {
          'Spanish': 4,
          'French': 3,
          'German': 3,
          'Italian': 2
        },
        
        translationsByService: {
          'Premium AI': 8,
          'Google Translate': 4
        },
        
        dailyUsage: [
          { date: new Date(Date.now() - 6*24*60*60*1000).toISOString().split('T')[0], translations: 2, files: 2, processingTime: 4.2 },
          { date: new Date(Date.now() - 5*24*60*60*1000).toISOString().split('T')[0], translations: 1, files: 1, processingTime: 2.1 },
          { date: new Date(Date.now() - 4*24*60*60*1000).toISOString().split('T')[0], translations: 3, files: 3, processingTime: 6.8 },
          { date: new Date(Date.now() - 3*24*60*60*1000).toISOString().split('T')[0], translations: 0, files: 0, processingTime: 0 },
          { date: new Date(Date.now() - 2*24*60*60*1000).toISOString().split('T')[0], translations: 4, files: 4, processingTime: 8.9 },
          { date: new Date(Date.now() - 1*24*60*60*1000).toISOString().split('T')[0], translations: 2, files: 2, processingTime: 4.5 },
          { date: new Date().toISOString().split('T')[0], translations: 0, files: 0, processingTime: 0 }
        ],
        
        topLanguages: [
          { language: 'Spanish', count: 4, percentage: 33 },
          { language: 'French', count: 3, percentage: 25 },
          { language: 'German', count: 3, percentage: 25 },
          { language: 'Italian', count: 2, percentage: 17 }
        ],
        
        recentActivity: [
          {
            id: '1',
            type: 'translation' as const,
            description: 'Translated "movie_trailer.srt" to Spanish',
            timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
            status: 'success' as const
          },
          {
            id: '2',
            type: 'translation' as const,
            description: 'Translated "documentary_ep1.srt" to French',
            timestamp: new Date(Date.now() - 6 * 60 * 60 * 1000),
            status: 'success' as const
          },
          {
            id: '3',
            type: 'translation' as const,
            description: 'Translated "tutorial_basics.srt" to German',
            timestamp: new Date(Date.now() - 10 * 60 * 60 * 1000),
            status: 'failed' as const
          },
          {
            id: '4',
            type: 'translation' as const,
            description: 'Translated "interview_ceo.srt" to Italian',
            timestamp: new Date(Date.now() - 18 * 60 * 60 * 1000),
            status: 'success' as const
          }
        ]
      }
    }

    const response = {
      period,
      startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      endDate: new Date().toISOString().split('T')[0],
      dataSource: hasRealData ? 'real' : 'mock',
      data: finalData
    }

    console.log('📊 Returning analytics data:', {
      dataSource: response.dataSource,
      totalTranslations: finalData.totalTranslations,
      languageCount: Object.keys(finalData.translationsByLanguage).length
    })

    return NextResponse.json(response)

  } catch (error) {
    console.error('❌ Working Analytics API Error:', error)
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    )
  }
}
