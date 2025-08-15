import { NextRequest, NextResponse } from 'next/server'
import { TranslationJobService } from '@/lib/database-admin'

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const userId = searchParams.get('userId')
    const limit = parseInt(searchParams.get('limit') || '20')

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      )
    }

    console.log('📋 Loading translation history for user:', userId)

    // Get user's translation jobs
    const jobs = await TranslationJobService.getUserJobs(userId, limit)
    
    console.log('✅ Loaded', jobs.length, 'translation jobs')

    return NextResponse.json({
      success: true,
      jobs
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
