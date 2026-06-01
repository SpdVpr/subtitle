import { NextRequest, NextResponse } from 'next/server'
import { TranslationJobService } from '@/lib/database-admin'
import { verifyUser } from '@/lib/user-auth-server'

export async function GET(req: NextRequest) {
  try {
    const authUser = await verifyUser(req)
    if (!authUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    const userId = authUser.uid
    const { searchParams } = new URL(req.url)
    const limit = parseInt(searchParams.get('limit') || '20')

    console.log('📋 Loading translation history for user:', userId)

    // Get user's translation jobs
    const jobs = await TranslationJobService.getUserJobs(userId, limit)

    // Convert Firestore Timestamps to regular Date objects for JSON serialization
    const serializedJobs = jobs.map(job => ({
      ...job,
      createdAt: job.createdAt ? new Date(job.createdAt.seconds * 1000) : null,
      completedAt: job.completedAt ? new Date(job.completedAt.seconds * 1000) : null,
      updatedAt: job.updatedAt ? new Date(job.updatedAt.seconds * 1000) : null
    }))

    console.log('✅ Loaded', jobs.length, 'translation jobs')

    return NextResponse.json({
      success: true,
      jobs: serializedJobs
    })

  } catch (error) {
    console.error('❌ Failed to load translation history:', error)
    return NextResponse.json(
      { 
        error: 'Failed to load translation history',
        details: error instanceof Error ? error.message : String(error)
      },
      { status: 500 }
    )
  }
}
