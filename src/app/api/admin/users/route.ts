import { NextRequest, NextResponse } from 'next/server'
import { isAdminEmail } from '@/lib/admin-auth-email'

// Force Node.js runtime for Firebase Admin SDK
export const runtime = 'nodejs'

// Server-side Firebase Admin (bypasses client security rules)
async function getServerFirestore() {
  try {
    const { getAdminDb } = await import('@/lib/firebase-admin')
    return getAdminDb()
  } catch (error) {
    console.warn('⚠️ Admin SDK not configured, using demo mode:', error)
    return null
  }
}

export async function GET(req: NextRequest) {
  try {
    // Check admin permissions
    const adminEmail = req.headers.get('x-admin-email')
    console.log('🔍 Admin API request from:', adminEmail)

    if (!adminEmail || !isAdminEmail(adminEmail)) {
      console.log('❌ Admin access denied for:', adminEmail)
      return NextResponse.json({
        error: 'Admin access required',
        debug: {
          receivedEmail: adminEmail,
          isValidAdmin: adminEmail ? isAdminEmail(adminEmail) : false,
          allowedEmails: [
            'premium@test.com',
            'pro@test.com',
            'admin@subtitle-ai.com',
            'ceo@subtitle-ai.com',
            'manager@subtitle-ai.com'
          ]
        }
      }, { status: 403 })
    }

    console.log('🔑 Admin API access granted for:', adminEmail)

    // Get Firestore instance
    const db = await getServerFirestore()
    const isDemoMode = !db

    if (isDemoMode) {
      return getDemoUsers()
    }

    console.log('🔍 Admin API: Querying all users from server-side...')

    let snapshot: any
    let users: any[]

    try {
      // Check if we're using Firebase Admin SDK or client SDK
      if (db.collection && typeof db.collection === 'function') {
        // Firebase Admin SDK
        console.log('📡 Using Firebase Admin SDK')
        snapshot = await db.collection('users')
          .orderBy('createdAt', 'desc')
          .get()
        console.log('📄 Admin API: Found', snapshot.size, 'users (Admin SDK)')

        users = snapshot.docs.map((doc: any) => ({
          uid: doc.id,
          ...doc.data(),
        }))
      } else {
        // Client SDK fallback
        console.log('📡 Using Firebase Client SDK')
        const { collection, getDocs, query, orderBy } = await import('firebase/firestore')
        const usersQuery = query(
          collection(db, 'users'),
          orderBy('createdAt', 'desc')
        )
        snapshot = await getDocs(usersQuery)
        console.log('📄 Admin API: Found', snapshot.size, 'users (Client SDK)')

        users = snapshot.docs.map((doc: any) => ({
          uid: doc.id,
          ...doc.data(),
        }))
      }
    } catch (firestoreError: any) {
      console.error('❌ Firestore query failed:', firestoreError)
      throw new Error(`Firestore query failed: ${firestoreError.message}`)
    }

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
        createdAt: user.createdAt,
        isBlocked: user.isBlocked || false,
        blockReason: user.blockReason,
        blockedAt: user.blockedAt,
        blockedBy: user.blockedBy,
        subscriptionPlan: user.subscriptionPlan || 'free'
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

// Demo mode users
function getDemoUsers() {
  console.log('🧪 Demo mode: Returning sample users')

  const demoUsers = [
    {
      userId: 'demo-user-1',
      email: 'demo@test.com',
      displayName: 'Demo User',
      plan: 'credits',
      lastActive: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
      translationsCount: 15,
      creditsBalance: 850,
      createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // 7 days ago
      isBlocked: false,
      subscriptionPlan: 'free'
    },
    {
      userId: 'premium-user-demo',
      email: 'premium@test.com',
      displayName: 'Premium Demo User',
      plan: 'credits',
      lastActive: new Date(Date.now() - 30 * 60 * 1000), // 30 minutes ago
      translationsCount: 42,
      creditsBalance: 1200,
      createdAt: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000), // 14 days ago
      isBlocked: false,
      subscriptionPlan: 'premium'
    },
    {
      userId: 'demo-user-2',
      email: 'user2@demo.com',
      displayName: 'Another Demo User',
      plan: 'free',
      lastActive: new Date(Date.now() - 24 * 60 * 60 * 1000), // 1 day ago
      translationsCount: 3,
      creditsBalance: 50,
      createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), // 3 days ago
      isBlocked: false,
      subscriptionPlan: 'free'
    }
  ]

  return NextResponse.json({
    success: true,
    demoMode: true,
    count: demoUsers.length,
    users: demoUsers,
    message: 'Demo mode: Sample users (Database not connected)'
  })
}
