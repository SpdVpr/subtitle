import { NextRequest, NextResponse } from 'next/server'
import { getFirestore } from 'firebase-admin/firestore'
import { getAdminApp } from '@/lib/firebase-admin'
import { encodeContentDisposition } from '@/lib/filename-encoder'

export async function POST(request: NextRequest) {
  try {
    // Get the job ID and user ID from the request body
    const { jobId, userId } = await request.json()
    if (!jobId || !userId) {
      return NextResponse.json({ error: 'Job ID and User ID are required' }, { status: 400 })
    }

    console.log('Download request:', { jobId, userId })

    // Get the translation job from Firestore using Admin SDK
    const adminApp = getAdminApp()
    const db = getFirestore(adminApp)
    const jobDoc = await db.collection('translation_jobs').doc(jobId).get()

    if (!jobDoc.exists) {
      console.log('Job not found:', jobId)
      return NextResponse.json({ error: 'Translation job not found' }, { status: 404 })
    }

    const job = jobDoc.data()
    console.log('Job found:', { id: jobId, userId: job?.userId, hasContent: !!job?.translatedContent })

    // Verify the job belongs to the user
    if (job?.userId !== userId) {
      console.log('Unauthorized access:', { jobUserId: job?.userId, requestUserId: userId })
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
    }

    // Check if we have the translated content
    if (!job.translatedContent) {
      console.log('No translated content available for job:', jobId)
      return NextResponse.json({ error: 'Translated content not available' }, { status: 404 })
    }

    console.log('Serving download for job:', jobId)

    // Encode filename for Content-Disposition header to support non-ASCII characters
    // This fixes issues with Vietnamese, Czech, Chinese, and other non-ASCII filenames
    const fileName = job.translatedFileName || 'translation.srt'
    const contentDisposition = encodeContentDisposition(fileName)

    // Return the file as a download with proper encoding
    return new NextResponse(job.translatedContent, {
      status: 200,
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
        'Content-Disposition': contentDisposition,
      },
    })

  } catch (error) {
    console.error('Download error:', error)
    return NextResponse.json(
      { error: `Failed to download file: ${error instanceof Error ? error.message : 'Unknown error'}` },
      { status: 500 }
    )
  }
}
