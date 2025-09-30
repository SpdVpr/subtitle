import { NextRequest, NextResponse } from 'next/server'
import { getAdminDb } from '@/lib/firebase-admin'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')
    
    if (!userId) {
      return NextResponse.json(
        { error: 'userId is required' },
        { status: 400 }
      )
    }
    
    console.log('🔔 Getting notifications for user:', userId)
    
    const db = getAdminDb()
    const notificationsRef = db.collection('notifications')
      .where('userId', '==', userId)
      .orderBy('createdAt', 'desc')
      .limit(50)
    
    const snapshot = await notificationsRef.get()
    const notifications: any[] = []
    
    snapshot.forEach((doc) => {
      notifications.push({
        id: doc.id,
        ...doc.data(),
      })
    })
    
    console.log('✅ Found', notifications.length, 'notifications')
    
    return NextResponse.json({ notifications }, { status: 200 })
  } catch (error) {
    console.error('Notifications API error:', error)
    return NextResponse.json(
      { error: 'Failed to load notifications' },
      { status: 500 }
    )
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json()
    const { notificationId, read } = body
    
    if (!notificationId) {
      return NextResponse.json(
        { error: 'notificationId is required' },
        { status: 400 }
      )
    }
    
    console.log('🔔 Marking notification as read:', notificationId)
    
    const db = getAdminDb()
    const notificationRef = db.collection('notifications').doc(notificationId)
    
    await notificationRef.update({
      read: read !== undefined ? read : true,
      readAt: new Date().toISOString(),
    })
    
    console.log('✅ Notification marked as read')
    
    return NextResponse.json({ success: true }, { status: 200 })
  } catch (error) {
    console.error('Notification update API error:', error)
    return NextResponse.json(
      { error: 'Failed to update notification' },
      { status: 500 }
    )
  }
}

