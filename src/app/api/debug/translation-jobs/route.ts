import { NextRequest, NextResponse } from 'next/server'
import { TranslationJobService } from '@/lib/database-admin'

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const userId = searchParams.get('userId')

    if (!userId) {
      return NextResponse.json({
        error: 'Missing userId parameter',
        usage: 'GET /api/debug/translation-jobs?userId=YOUR_USER_ID'
      }, { status: 400 })
    }

    console.log('🔍 Debug: Fetching translation jobs for user:', userId)

    // Get all translation jobs for user
    const jobs = await TranslationJobService.getUserJobs(userId, 100)
    
    console.log('🔍 Debug: Found jobs:', jobs.length)
    
    // Get jobs from last 30 days
    const thirtyDaysAgo = new Date()
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)
    
    const recentJobs = jobs.filter(job => {
      const jobDate = job.createdAt instanceof Date ? job.createdAt : new Date(job.createdAt)
      return jobDate >= thirtyDaysAgo
    })

    console.log('🔍 Debug: Recent jobs (30 days):', recentJobs.length)

    return NextResponse.json({
      success: true,
      userId,
      totalJobs: jobs.length,
      recentJobs: recentJobs.length,
      jobs: jobs.slice(0, 10).map(job => ({
        id: job.id,
        originalFileName: job.originalFileName,
        targetLanguage: job.targetLanguage,
        status: job.status,
        createdAt: job.createdAt,
        subtitleCount: job.subtitleCount,
        processingTimeMs: job.processingTimeMs,
        aiService: job.aiService
      })),
      dateRange: {
        oldest: jobs.length > 0 ? jobs[jobs.length - 1]?.createdAt : null,
        newest: jobs.length > 0 ? jobs[0]?.createdAt : null
      }
    })

  } catch (error) {
    console.error('❌ Debug endpoint error:', error)
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined
    }, { status: 500 })
  }
}
