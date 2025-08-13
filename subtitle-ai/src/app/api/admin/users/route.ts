import { NextRequest, NextResponse } from 'next/server'
import { isAdminEmail } from '@/lib/admin-auth-email'

// Server-side Firebase Admin (bypasses client security rules)
async function getServerFirestore() {
  try {
    const { getAdminDb } = await import('@/lib/firebase-admin')
    return getAdminDb()
  } catch (error) {
    console.warn('⚠️ Falling back to client Firestore. Admin SDK not configured:', error)
    const { db } = await import('@/lib/firebase')
    return db
  }
}

export async function GET(req: NextRequest) {
  try {
    // Check admin permissions
    const adminEmail = req.headers.get('x-admin-email')
    if (!adminEmail || !isAdminEmail(adminEmail)) {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 })
    }

    console.log('🔑 Admin API access granted for:', adminEmail)

    // Get Firestore instance
    const db = await getServerFirestore()
    if (!db) {
      throw new Error('Firestore not available')
    }

    // Import Firestore functions
    const { collection, getDocs, query, orderBy } = await import('firebase/firestore')
    
    console.log('🔍 Admin API: Querying all users from server-side...')
    
    // Query all users (server-side bypasses security rules)
    const usersQuery = query(
      collection(db, 'users'),
      orderBy('createdAt', 'desc')
    )

    const snapshot = await getDocs(usersQuery)
    console.log('📄 Admin API: Found', snapshot.size, 'users')

    const users = snapshot.docs.map(doc => ({
      uid: doc.id,
      ...doc.data(),
    }))

    return NextResponse.json({
      success: true,
      count: users.length,
      users: users.map(user => ({
        userId: user.uid,
        email: user.email || 'Unknown',
        displayName: user.displayName,
        plan: (user.creditsBalance || 0) > 0 ? 'credits' : 'free',
        lastActive: user.updatedAt || user.createdAt,
        translationsCount: user.usage?.translationsUsed || 0,
        creditsBalance: user.creditsBalance || 0,
        createdAt: user.createdAt
      }))
    })

  } catch (error: any) {
    console.error('Admin API error:', error)
    return NextResponse.json({
      success: false,
      error: error.message,
      details: 'Check server logs for more information'
    }, { status: 500 })
  }
}
