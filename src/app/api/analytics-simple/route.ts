import { NextRequest, NextResponse } from 'next/server'

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const userId = searchParams.get('userId')
    const period = searchParams.get('period') || 'month'

    console.log('📊 Simple Analytics API called:', { userId, period })

    if (!userId) {
      return NextResponse.json(
        { error: 'Missing userId' },
        { status: 400 }
      )
    }

    // For now, return working mock data to test the frontend
    const mockData = {
      period,
      startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      endDate: new Date().toISOString().split('T')[0],
      data: {
        totalTranslations: 8,
        totalFiles: 8,
        totalSubtitles: 240,
        averageProcessingTime: 3.2,
        storageUsed: 2048000, // 2MB
        successRate: 87.5,
        
        translationsByLanguage: {
          'Spanish': 3,
          'French': 2,
          'German': 2,
          'Italian': 1
        },
        
        translationsByService: {
          'Premium AI': 6,
          'Google Translate': 2
        },
        
        dailyUsage: [
          { date: new Date(Date.now() - 6*24*60*60*1000).toISOString().split('T')[0], translations: 1, files: 1, processingTime: 2.1 },
          { date: new Date(Date.now() - 5*24*60*60*1000).toISOString().split('T')[0], translations: 2, files: 2, processingTime: 3.5 },
          { date: new Date(Date.now() - 4*24*60*60*1000).toISOString().split('T')[0], translations: 0, files: 0, processingTime: 0 },
          { date: new Date(Date.now() - 3*24*60*60*1000).toISOString().split('T')[0], translations: 1, files: 1, processingTime: 2.8 },
          { date: new Date(Date.now() - 2*24*60*60*1000).toISOString().split('T')[0], translations: 3, files: 3, processingTime: 4.2 },
          { date: new Date(Date.now() - 1*24*60*60*1000).toISOString().split('T')[0], translations: 1, files: 1, processingTime: 1.9 },
          { date: new Date().toISOString().split('T')[0], translations: 0, files: 0, processingTime: 0 }
        ],
        
        topLanguages: [
          { language: 'Spanish', count: 3, percentage: 37.5 },
          { language: 'French', count: 2, percentage: 25 },
          { language: 'German', count: 2, percentage: 25 },
          { language: 'Italian', count: 1, percentage: 12.5 }
        ],
        
        recentActivity: [
          {
            id: '1',
            type: 'translation',
            description: 'Translated "movie_scene_01.srt" to Spanish',
            timestamp: new Date(Date.now() - 3 * 60 * 60 * 1000),
            status: 'success'
          },
          {
            id: '2',
            type: 'translation',
            description: 'Translated "documentary_part2.srt" to French',
            timestamp: new Date(Date.now() - 8 * 60 * 60 * 1000),
            status: 'success'
          },
          {
            id: '3',
            type: 'translation',
            description: 'Translated "interview_final.srt" to German',
            timestamp: new Date(Date.now() - 12 * 60 * 60 * 1000),
            status: 'failed'
          },
          {
            id: '4',
            type: 'translation',
            description: 'Translated "tutorial_intro.srt" to Spanish',
            timestamp: new Date(Date.now() - 18 * 60 * 60 * 1000),
            status: 'success'
          },
          {
            id: '5',
            type: 'translation',
            description: 'Translated "news_report.srt" to Italian',
            timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000),
            status: 'success'
          }
        ]
      }
    }

    console.log('📊 Returning mock analytics data')
    return NextResponse.json(mockData)

  } catch (error) {
    console.error('❌ Simple Analytics API Error:', error)
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    )
  }
}
