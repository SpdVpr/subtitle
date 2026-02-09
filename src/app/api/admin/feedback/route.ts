import { NextRequest, NextResponse } from 'next/server'
import { getAdminDb } from '@/lib/firebase-admin'
import { isAdminEmail } from '@/lib/admin-auth-email'

export interface FeedbackItem {
  id: string
  feedback: string
  timestamp: any
  submittedAt: string
  locale: string
  url?: string
  ipHash: string
  userAgent?: string
  status: 'new' | 'read' | 'resolved' | 'replied'
  priority: 'low' | 'normal' | 'high'

  // User identification (if logged in)
  userId?: string
  userEmail?: string
  userName?: string

  // Admin response - New format
  adminReply?: string
  adminId?: string
  adminName?: string

  // Admin response - Old format (backward compatibility)
  adminResponse?: {
    message: string
    respondedBy: string
    respondedAt: any
    notificationSent: boolean
  }

  // Metadata
  updatedAt?: any
  readAt?: any
  resolvedAt?: any
  repliedAt?: string
}

export async function GET(request: NextRequest) {
  try {
    // Check admin authentication
    const adminEmail = request.headers.get('x-admin-email')
    if (!adminEmail || !isAdminEmail(adminEmail)) {
      return NextResponse.json({
        error: 'Admin access required',
        debug: {
          receivedEmail: adminEmail,
          isValidAdmin: adminEmail ? isAdminEmail(adminEmail) : false
        }
      }, { status: 403 })
    }

    const { searchParams } = new URL(request.url)
    const limitParam = parseInt(searchParams.get('limit') || '50')
    const statusFilter = searchParams.get('status') // 'new', 'read', 'resolved', or null for all

    // Get Firestore instance
    const db = getAdminDb()
    if (!db) {
      // Return demo data if Firestore unavailable
      return NextResponse.json({
        success: true,
        feedback: [
          {
            id: 'demo-1',
            feedback: 'The translation quality is amazing! Could you add support for more video formats?',
            timestamp: new Date(),
            submittedAt: new Date().toISOString(),
            locale: 'en',
            url: '/translate',
            ipHash: 'demo-ip-1',
            userAgent: 'Mozilla/5.0 (Demo Browser)',
            status: 'new',
            priority: 'normal'
          },
          {
            id: 'demo-2',
            feedback: 'Skvělá aplikace! Bylo by možné přidat podporu pro .ass soubory?',
            timestamp: new Date(),
            submittedAt: new Date().toISOString(),
            locale: 'cs',
            url: '/cs/translate',
            ipHash: 'demo-ip-2',
            userAgent: 'Mozilla/5.0 (Demo Browser)',
            status: 'read',
            priority: 'high'
          }
        ],
        total: 2
      })
    }

    // Build query using Firebase Admin SDK
    let feedbackRef = db.collection('feedback')
      .orderBy('timestamp', 'desc')
      .limit(limitParam)

    // Add status filter if specified
    if (statusFilter && ['new', 'read', 'resolved', 'replied'].includes(statusFilter)) {
      feedbackRef = db.collection('feedback')
        .where('status', '==', statusFilter)
        .orderBy('timestamp', 'desc')
        .limit(limitParam)
    }

    const snapshot = await feedbackRef.get()
    const feedback: FeedbackItem[] = []

    snapshot.forEach((doc) => {
      const data = doc.data()
      feedback.push({
        id: doc.id,
        feedback: data.feedback,
        timestamp: data.timestamp,
        submittedAt: data.submittedAt,
        locale: data.locale || 'en',
        url: data.url,
        ipHash: data.ipHash,
        userAgent: data.userAgent,
        status: data.status || 'new',
        priority: data.priority || 'normal',
        // User identification
        userId: data.userId,
        userEmail: data.userEmail,
        userName: data.userName,
        // Admin response - New format
        adminReply: data.adminReply,
        adminId: data.adminId,
        adminName: data.adminName,
        // Admin response - Old format
        adminResponse: data.adminResponse,
        // Metadata
        updatedAt: data.updatedAt,
        readAt: data.readAt,
        resolvedAt: data.resolvedAt,
        repliedAt: data.repliedAt
      })
    })

    return NextResponse.json({
      success: true,
      feedback,
      total: feedback.length
    })

  } catch (error) {
    console.error('Admin feedback API error:', error)
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to get feedback'
    }, { status: 500 })
  }
}

export async function PATCH(request: NextRequest) {
  try {
    // Check admin authentication
    const adminEmail = request.headers.get('x-admin-email')
    if (!adminEmail || !isAdminEmail(adminEmail)) {
      return NextResponse.json({
        error: 'Admin access required'
      }, { status: 403 })
    }

    const body = await request.json()
    const { feedbackId, status, priority } = body

    if (!feedbackId) {
      return NextResponse.json({
        error: 'Feedback ID is required'
      }, { status: 400 })
    }

    // Get Firestore instance
    const db = getAdminDb()
    if (!db) {
      return NextResponse.json({
        error: 'Database unavailable'
      }, { status: 503 })
    }

    // Update feedback status/priority using Firebase Admin SDK
    const feedbackRef = db.collection('feedback').doc(feedbackId)
    const updateData: any = {}

    if (status && ['new', 'read', 'resolved'].includes(status)) {
      updateData.status = status
    }

    if (priority && ['low', 'normal', 'high'].includes(priority)) {
      updateData.priority = priority
    }

    if (Object.keys(updateData).length > 0) {
      updateData.updatedAt = new Date()
      await feedbackRef.update(updateData)
    }

    return NextResponse.json({
      success: true,
      message: 'Feedback updated successfully'
    })

  } catch (error) {
    console.error('Admin feedback update error:', error)
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to update feedback'
    }, { status: 500 })
  }
}
