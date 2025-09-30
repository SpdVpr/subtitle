import { NextRequest, NextResponse } from 'next/server'
import { getAdminDb } from '@/lib/firebase-admin'
import { isAdminEmail } from '@/lib/admin-auth-email'

/**
 * API endpoint for admin to reply to feedback
 * 
 * POST /api/admin/feedback/reply
 * Body: {
 *   feedbackId: string
 *   message: string
 * }
 */
export async function POST(request: NextRequest) {
  try {
    // Check admin authentication
    const adminEmail = request.headers.get('x-admin-email')
    if (!adminEmail || !isAdminEmail(adminEmail)) {
      return NextResponse.json({
        error: 'Admin access required'
      }, { status: 403 })
    }

    const body = await request.json()
    const { feedbackId, message } = body

    // Validate required fields
    if (!feedbackId || !message) {
      return NextResponse.json({
        error: 'Missing required fields: feedbackId and message'
      }, { status: 400 })
    }

    if (message.trim().length < 10) {
      return NextResponse.json({
        error: 'Reply message must be at least 10 characters'
      }, { status: 400 })
    }

    if (message.length > 2000) {
      return NextResponse.json({
        error: 'Reply message must be less than 2000 characters'
      }, { status: 400 })
    }

    // Get Firestore instance
    const db = getAdminDb()
    if (!db) {
      return NextResponse.json({
        error: 'Database unavailable'
      }, { status: 503 })
    }

    // Get feedback document
    const feedbackRef = db.collection('feedback').doc(feedbackId)
    const feedbackDoc = await feedbackRef.get()

    if (!feedbackDoc.exists) {
      return NextResponse.json({
        error: 'Feedback not found'
      }, { status: 404 })
    }

    const feedbackData = feedbackDoc.data()

    // Check if feedback has user identification
    if (!feedbackData?.userId && !feedbackData?.userEmail) {
      return NextResponse.json({
        error: 'Cannot reply to anonymous feedback'
      }, { status: 400 })
    }

    // Update feedback with admin response
    const updateData = {
      status: 'replied',
      adminResponse: {
        message: message.trim(),
        respondedBy: adminEmail,
        respondedAt: new Date(),
        notificationSent: false
      },
      repliedAt: new Date(),
      updatedAt: new Date()
    }

    await feedbackRef.update(updateData)

    console.log('✅ Admin replied to feedback:', {
      feedbackId,
      adminEmail,
      userId: feedbackData.userId,
      messageLength: message.length
    })

    return NextResponse.json({
      success: true,
      message: 'Reply sent successfully'
    })

  } catch (error) {
    console.error('❌ Admin feedback reply error:', error)
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to send reply'
    }, { status: 500 })
  }
}

