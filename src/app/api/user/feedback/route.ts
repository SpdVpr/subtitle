import { NextRequest, NextResponse } from 'next/server'
import { getAdminDb } from '@/lib/firebase-admin'

/**
 * API endpoint for users to view their feedback and admin replies
 * 
 * GET /api/user/feedback?userId=xxx
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')

    if (!userId) {
      return NextResponse.json({
        error: 'User ID is required'
      }, { status: 400 })
    }

    // Get Firestore instance
    const db = getAdminDb()
    if (!db) {
      return NextResponse.json({
        success: true,
        feedback: [],
        message: 'Database unavailable'
      })
    }

    // Get user's feedback
    const feedbackRef = db.collection('feedback')
      .where('userId', '==', userId)
      .orderBy('timestamp', 'desc')
      .limit(50)

    const snapshot = await feedbackRef.get()
    const feedback: any[] = []

    snapshot.forEach((doc) => {
      const data = doc.data()
      feedback.push({
        id: doc.id,
        feedback: data.feedback,
        timestamp: data.timestamp,
        submittedAt: data.submittedAt,
        locale: data.locale || 'en',
        url: data.url,
        status: data.status || 'new',
        priority: data.priority || 'normal',
        // Admin response - New format
        adminReply: data.adminReply || null,
        adminId: data.adminId || null,
        adminName: data.adminName || null,
        // Admin response - Old format (backward compatibility)
        adminResponse: data.adminResponse || null,
        repliedAt: data.repliedAt || null,
        updatedAt: data.updatedAt || null
      })
    })

    return NextResponse.json({
      success: true,
      feedback,
      total: feedback.length
    })

  } catch (error) {
    console.error('User feedback API error:', error)
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to get feedback'
    }, { status: 500 })
  }
}

