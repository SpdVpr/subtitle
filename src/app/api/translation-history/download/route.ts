import { NextRequest, NextResponse } from 'next/server'
import { TranslationJobService } from '@/lib/database'

export async function POST(request: NextRequest) {
  try {
    // Get the job ID and user ID from the request body
    const { jobId, userId } = await request.json()
    if (!jobId || !userId) {
      return NextResponse.json({ error: 'Job ID and User ID are required' }, { status: 400 })
    }

    // Get the translation job from Firestore
    const job = await TranslationJobService.getJob(jobId)

    if (!job) {
      return NextResponse.json({ error: 'Translation job not found' }, { status: 404 })
    }

    // Verify the job belongs to the user
    if (job.userId !== userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
    }

    // Check if we have the translated content
    if (!job.translatedContent) {
      return NextResponse.json({ error: 'Translated content not available' }, { status: 404 })
    }

    // Return the file as a download
    return new NextResponse(job.translatedContent, {
      status: 200,
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
        'Content-Disposition': `attachment; filename="${job.translatedFileName || 'translation.srt'}"`,
      },
    })

  } catch (error) {
    console.error('Download error:', error)
    return NextResponse.json(
      { error: 'Failed to download file' },
      { status: 500 }
    )
  }
}
