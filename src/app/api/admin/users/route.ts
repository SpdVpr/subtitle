import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/admin-auth-server'

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
    // Verify admin via signed Firebase ID token
    const auth = await requireAdmin(req)
    if ('response' in auth) return auth.response
    const adminEmail = auth.ctx.email

    // Try to get Firestore instance - use alternative method if main fails
    let db = await getServerFirestore()

    if (!db) {
      console.log('⚠️ Main Firebase Admin failed, trying alternative method...')
      return await getClientSideUsers()
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

        users = snapshot.docs.map((doc: any) => {
          const data = doc.data()
          return {
            uid: doc.id,
            ...data,
            // Convert Firestore timestamps to dates
            createdAt: data.createdAt?.toDate?.() || new Date(data.createdAt),
            updatedAt: data.updatedAt?.toDate?.() || new Date(data.updatedAt),
            usage: {
              ...data.usage,
              lastActive: data.usage?.lastActive?.toDate?.() || new Date(data.usage?.lastActive || data.updatedAt),
              resetDate: data.usage?.resetDate?.toDate?.() || new Date(data.usage?.resetDate)
            }
          }
        })
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

    const mappedUsers = users.map(user => ({
      userId: user.uid,
      email: user.email || 'Unknown',
      displayName: user.displayName,
      plan: (user.creditsBalance || 0) > 0 ? 'credits' : 'free',
      lastActive: user.usage?.lastActive || user.updatedAt || user.createdAt,
      translationsCount: user.usage?.translationsUsed || 0,
      creditsBalance: user.creditsBalance || 0,
      createdAt: user.createdAt,
      isBlocked: user.isBlocked || false,
      blockReason: user.blockReason,
      blockedAt: user.blockedAt,
      blockedBy: user.blockedBy,
      subscriptionPlan: user.subscriptionPlan || 'free'
    }))

    // Debug log to see actual translation counts and lastActive
    console.log('📊 Users with translation data:')
    mappedUsers.forEach(user => {
      if (user.translationsCount > 0) {
        console.log(`  - ${user.email}: ${user.translationsCount} translations, lastActive: ${user.lastActive}`)
      }
    })

    // Debug log for all users' lastActive
    console.log('🕒 All users lastActive:')
    mappedUsers.slice(0, 5).forEach(user => {
      console.log(`  - ${user.email}: ${user.lastActive} (${typeof user.lastActive})`)
    })

    return NextResponse.json({
      success: true,
      count: users.length,
      users: mappedUsers,
      source: 'firebase_admin'
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

async function getClientSideUsers() {
  try {
    console.log('🔄 Attempting to load users via alternative method...')

    // Try to initialize Firebase Admin with environment variables
    const projectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID
    if (!projectId) {
      console.log('❌ No Firebase project ID found, using demo data')
      return getDemoUsers()
    }

    // Try to use Firebase Admin SDK with application default credentials
    try {
      const admin = await import('firebase-admin')

      // Initialize if not already initialized
      if (!admin.default.apps.length) {
        admin.default.initializeApp({
          projectId: projectId
        })
        console.log('🔧 Firebase Admin initialized with project ID:', projectId)
      }

      const db = admin.default.firestore()
      const snapshot = await db.collection('users')
        .orderBy('createdAt', 'desc')
        .get()

      console.log('📄 Alternative method: Found', snapshot.size, 'users')

      const users = snapshot.docs.map((doc: any) => {
        const data = doc.data()
        return {
          uid: doc.id,
          ...data,
          // Convert Firestore timestamps to dates
          createdAt: data.createdAt?.toDate?.() || new Date(data.createdAt),
          updatedAt: data.updatedAt?.toDate?.() || new Date(data.updatedAt),
          usage: {
            ...data.usage,
            lastActive: data.usage?.lastActive?.toDate?.() || new Date(data.usage?.lastActive || data.updatedAt),
            resetDate: data.usage?.resetDate?.toDate?.() || new Date(data.usage?.resetDate)
          }
        }
      })

      const mappedUsers = users.map(user => ({
        userId: user.uid,
        email: user.email || 'Unknown',
        displayName: user.displayName,
        plan: (user.creditsBalance || 0) > 0 ? 'credits' : 'free',
        lastActive: user.usage?.lastActive || user.updatedAt || user.createdAt,
        translationsCount: user.usage?.translationsUsed || 0,
        creditsBalance: user.creditsBalance || 0,
        createdAt: user.createdAt,
        isBlocked: user.isBlocked || false,
        blockReason: user.blockReason,
        blockedAt: user.blockedAt,
        blockedBy: user.blockedBy,
        subscriptionPlan: user.subscriptionPlan || 'free'
      }))

      // Debug log to see actual translation counts and lastActive
      console.log('📊 Alternative method - Users with translation data:')
      mappedUsers.forEach(user => {
        if (user.translationsCount > 0) {
          console.log(`  - ${user.email}: ${user.translationsCount} translations, lastActive: ${user.lastActive}`)
        }
      })

      // Debug log for all users' lastActive
      console.log('🕒 Alternative method - All users lastActive:')
      mappedUsers.slice(0, 5).forEach(user => {
        console.log(`  - ${user.email}: ${user.lastActive} (${typeof user.lastActive})`)
      })

      return NextResponse.json({
        success: true,
        count: users.length,
        users: mappedUsers,
        source: 'firebase_alternative'
      })

    } catch (adminError: any) {
      console.error('❌ Firebase Admin failed:', adminError.message)
      return getDemoUsers()
    }

  } catch (error: any) {
    console.error('❌ Alternative method failed, falling back to demo data:', error)
    return getDemoUsers()
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
      userId: 'admin-user-demo',
      email: 'admin@subtitlebot.com',
      displayName: 'Admin User',
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
