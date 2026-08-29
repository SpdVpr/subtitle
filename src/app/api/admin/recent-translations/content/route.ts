import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/admin-auth-server'
import { TranslationJobService } from '@/lib/database-admin'

// Force Node.js runtime for Firebase Admin SDK
export const runtime = 'nodejs'

/**
 * Serves one translated SRT to the admin table on demand.
 *
 * The listing used to ship every row's subtitle file with the page, which meant
 * ~1 MB of Firestore egress per admin page view for content nobody had asked
 * for yet. Fetching a single job's content on click keeps the table cheap.
 */
export async function GET(req: NextRequest) {
  try {
    const auth = await requireAdmin(req)
    if ('response' in auth) return auth.response

    const jobId = new URL(req.url).searchParams.get('jobId')
    if (!jobId) {
      return NextResponse.json({ error: 'jobId is required' }, { status: 400 })
    }

    const content = await TranslationJobService.getTranslatedContent(jobId)
    if (!content) {
      return NextResponse.json({ error: 'Translated content not available' }, { status: 404 })
    }

    return new NextResponse(content, {
      status: 200,
      headers: { 'Content-Type': 'text/plain; charset=utf-8' }
    })
  } catch (error) {
    console.error('Admin translation content error:', error)
    return NextResponse.json({ error: 'Failed to load translated content' }, { status: 500 })
  }
}
