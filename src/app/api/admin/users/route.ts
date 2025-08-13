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
    console.warn('⚠️ Falling back to client Firestore. Admin SDK not configured:', error)
    const { db } = await import('@/lib/firebase')
    return db
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
    if (!db) {
      console.log('❌ Firestore not available')
      throw new Error('Firestore not available')
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
