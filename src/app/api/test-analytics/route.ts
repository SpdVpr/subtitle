import { NextRequest, NextResponse } from 'next/server'

export async function GET(req: NextRequest) {
  const results = {
    timestamp: new Date().toISOString(),
    tests: [] as any[],
    summary: {
      passed: 0,
      failed: 0,
      total: 0
    }
  }

  const addTest = (name: string, success: boolean, data?: any, error?: any) => {
    results.tests.push({
      name,
      success,
      data,
      error: error?.message || error,
      timestamp: new Date().toISOString()
    })
    if (success) results.summary.passed++
    else results.summary.failed++
    results.summary.total++
  }

  try {
    const { searchParams } = new URL(req.url)
    const userId = searchParams.get('userId') || '06qbus30g5eFf3QlN6TQouOYF6s2'

    console.log('🧪 Starting analytics diagnostics for user:', userId)

    // Test 1: Check if database-admin imports work
    try {
      const { TranslationJobService, UserService } = await import('@/lib/database-admin')
      addTest('Import database-admin', true, { TranslationJobService: !!TranslationJobService, UserService: !!UserService })
    } catch (error) {
      addTest('Import database-admin', false, null, error)
      return NextResponse.json(results)
    }

    // Test 2: Check if user exists
    try {
      const { UserService } = await import('@/lib/database-admin')
      const user = await UserService.getUser(userId)
      addTest('Get user', true, { 
        userExists: !!user, 
        userId: user?.uid,
        email: user?.email,
        hasUsage: !!user?.usage
      })
    } catch (error) {
      addTest('Get user', false, null, error)
    }

    // Test 3: Check translation jobs
    try {
      const { TranslationJobService } = await import('@/lib/database-admin')
      const jobs = await TranslationJobService.getUserJobs(userId, 10)
      addTest('Get translation jobs', true, {
        jobCount: jobs.length,
        firstJob: jobs[0] ? {
          id: jobs[0].id,
          fileName: jobs[0].originalFileName,
          status: jobs[0].status,
          createdAt: jobs[0].createdAt,
          targetLanguage: jobs[0].targetLanguage
        } : null
      })
    } catch (error) {
      addTest('Get translation jobs', false, null, error)
    }

    // Test 4: Test date range calculation
    try {
      const now = new Date()
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
      const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0)
      
      addTest('Date range calculation', true, {
        now: now.toISOString(),
        startOfMonth: startOfMonth.toISOString(),
        endOfMonth: endOfMonth.toISOString(),
        startDateStr: startOfMonth.toISOString().split('T')[0],
        endDateStr: endOfMonth.toISOString().split('T')[0]
      })
    } catch (error) {
      addTest('Date range calculation', false, null, error)
    }

    // Test 5: Test analytics aggregation with mock data
    try {
      const mockJobs = [
        {
          id: 'test1',
          originalFileName: 'test1.srt',
          targetLanguage: 'Spanish',
          status: 'completed',
          createdAt: new Date(),
          subtitleCount: 50,
          processingTimeMs: 2000,
          aiService: 'premium'
        },
        {
          id: 'test2',
          originalFileName: 'test2.srt',
          targetLanguage: 'French',
          status: 'completed',
          createdAt: new Date(),
          subtitleCount: 30,
          processingTimeMs: 1500,
          aiService: 'google'
        }
      ]

      const totalTranslations = mockJobs.length
      const totalSubtitles = mockJobs.reduce((sum, job) => sum + (job.subtitleCount || 30), 0)
      const languageMap = new Map()
      mockJobs.forEach(job => {
        if (job.targetLanguage) {
          const current = languageMap.get(job.targetLanguage) || 0
          languageMap.set(job.targetLanguage, current + 1)
        }
      })

      addTest('Analytics aggregation', true, {
        totalTranslations,
        totalSubtitles,
        languageDistribution: Object.fromEntries(languageMap),
        mockJobsCount: mockJobs.length
      })
    } catch (error) {
      addTest('Analytics aggregation', false, null, error)
    }

    // Test 6: Test full analytics API call
    try {
      const analyticsUrl = new URL('/api/analytics', req.url)
      analyticsUrl.searchParams.set('userId', userId)
      analyticsUrl.searchParams.set('period', 'month')
      
      const response = await fetch(analyticsUrl.toString())
      const responseText = await response.text()
      
      let responseData = null
      try {
        responseData = JSON.parse(responseText)
      } catch (e) {
        responseData = { rawResponse: responseText }
      }

      addTest('Analytics API call', response.ok, {
        status: response.status,
        statusText: response.statusText,
        responseData: response.ok ? responseData : { error: responseText }
      })
    } catch (error) {
      addTest('Analytics API call', false, null, error)
    }

    console.log('🧪 Diagnostics completed:', results.summary)
    return NextResponse.json(results)

  } catch (error) {
    console.error('❌ Diagnostics failed:', error)
    addTest('Overall diagnostics', false, null, error)
    return NextResponse.json(results, { status: 500 })
  }
}
