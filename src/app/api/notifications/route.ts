import { NextRequest, NextResponse } from 'next/server'
import { getAdminDb } from '@/lib/firebase-admin'
import { verifyUser } from '@/lib/user-auth-server'

export async function GET(request: NextRequest) {
  try {
    const user = await verifyUser(request)
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    const snapshot = await getAdminDb().collection('notifications')
      .where('userId', '==', user.uid)
      .get()
    const notifications = snapshot.docs
      .map((doc) => ({ id: doc.id, ...doc.data() } as any))
      .sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime())
      .slice(0, 50)
    return NextResponse.json({ notifications })
  } catch (error) {
    console.error('Notifications API error:', error)
    return NextResponse.json({ error: 'Failed to load notifications' }, { status: 500 })
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const user = await verifyUser(request)
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    const { notificationId, read } = await request.json()
    if (!notificationId) return NextResponse.json({ error: 'notificationId is required' }, { status: 400 })

    const ref = getAdminDb().collection('notifications').doc(notificationId)
    const snapshot = await ref.get()
    if (!snapshot.exists || snapshot.get('userId') !== user.uid) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 })
    }
    await ref.update({ read: read !== undefined ? read : true, readAt: new Date().toISOString() })
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Notification update API error:', error)
    return NextResponse.json({ error: 'Failed to update notification' }, { status: 500 })
  }
}
