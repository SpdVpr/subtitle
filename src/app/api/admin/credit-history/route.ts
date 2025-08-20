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

export async function GET(request: NextRequest) {
  try {
    // Check admin authentication using same system as other admin APIs
    const adminEmail = request.headers.get('x-admin-email')
    console.log('🔍 Credit History API request from:', adminEmail)

    if (!adminEmail || !isAdminEmail(adminEmail)) {
      console.log('❌ Admin access denied for credit history:', adminEmail)
      return NextResponse.json({
        error: 'Admin access required',
        debug: {
          receivedEmail: adminEmail,
          isValidAdmin: adminEmail ? isAdminEmail(adminEmail) : false
        }
      }, { status: 403 })
    }

    console.log('📊 Loading credit history for admin dashboard')

    // Get Firestore instance
    const db = await getServerFirestore()
    if (!db) {
      return NextResponse.json({
        error: 'Database not available'
      }, { status: 500 })
    }

    // Get credit transactions from the last 30 days
    const thirtyDaysAgo = new Date()
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

    let snapshot: any

    // Check if we're using Firebase Admin SDK or client SDK
    if (db.collection && typeof db.collection === 'function') {
      // Firebase Admin SDK
      console.log('📡 Using Firebase Admin SDK for credit history')
      snapshot = await db.collection('creditTransactions')
        .orderBy('createdAt', 'desc')
        .limit(100)
        .get()
    } else {
      // Client SDK fallback
      console.log('📡 Using Firebase Client SDK for credit history')
      const { collection, query, orderBy, limit, getDocs } = await import('firebase/firestore')
      const transactionsRef = collection(db, 'creditTransactions')
      const q = query(
        transactionsRef,
        orderBy('createdAt', 'desc'),
        limit(100)
      )
      snapshot = await getDocs(q)
    }
    const transactions = []
    const docs = snapshot.docs || (snapshot.size ? Array.from(snapshot.docs) : [])

    for (const doc of docs) {
      const data = doc.data()

      // Get user email for display
      let userEmail = 'Unknown User'
      if (data.userId) {
        try {
          if (db.collection && typeof db.collection === 'function') {
            // Admin SDK
            const userSnapshot = await db.collection('users')
              .where('userId', '==', data.userId)
              .limit(1)
              .get()

            if (!userSnapshot.empty) {
              const userData = userSnapshot.docs[0].data()
              userEmail = userData.email || `User ${data.userId.substring(0, 8)}...`
            }
          } else {
            // Client SDK
            const { collection, query, where, limit, getDocs } = await import('firebase/firestore')
            const usersRef = collection(db, 'users')
            const userQuery = query(usersRef, where('userId', '==', data.userId), limit(1))
            const userSnapshot = await getDocs(userQuery)

            if (!userSnapshot.empty) {
              const userData = userSnapshot.docs[0].data()
              userEmail = userData.email || `User ${data.userId.substring(0, 8)}...`
            }
          }
        } catch (userError) {
          console.warn('Failed to get user email for transaction:', data.userId, userError)
        }
      }

      // Get admin email if available
      let adminEmailFromDb = data.adminEmail || undefined
      if (data.adminId && !adminEmailFromDb) {
        try {
          if (db.collection && typeof db.collection === 'function') {
            // Admin SDK
            const adminSnapshot = await db.collection('users')
              .where('userId', '==', data.adminId)
              .limit(1)
              .get()

            if (!adminSnapshot.empty) {
              const adminData = adminSnapshot.docs[0].data()
              adminEmailFromDb = adminData.email || `Admin ${data.adminId.substring(0, 8)}...`
            }
          } else {
            // Client SDK
            const { collection, query, where, limit, getDocs } = await import('firebase/firestore')
            const usersRef = collection(db, 'users')
            const adminQuery = query(usersRef, where('userId', '==', data.adminId), limit(1))
            const adminSnapshot = await getDocs(adminQuery)

            if (!adminSnapshot.empty) {
              const adminData = adminSnapshot.docs[0].data()
              adminEmailFromDb = adminData.email || `Admin ${data.adminId.substring(0, 8)}...`
            }
          }
        } catch (adminError) {
          console.warn('Failed to get admin email for transaction:', data.adminId, adminError)
        }
      }

      transactions.push({
        id: doc.id,
        userId: data.userId,
        userEmail,
        type: data.type || 'unknown',
        amount: Number(data.amount || data.credits) || 0,
        balanceBefore: Number(data.balanceBefore) || 0,
        balanceAfter: Number(data.balanceAfter) || 0,
        reason: data.reason || data.description || 'No reason provided',
        createdAt: data.createdAt?.toDate?.() || new Date(data.createdAt) || new Date(),
        adminId: data.adminId,
        adminEmail: adminEmailFromDb
      })
    }

    console.log(`📊 Loaded ${transactions.length} credit transactions`)

    return NextResponse.json({
      success: true,
      transactions,
      total: transactions.length
    })

  } catch (error) {
    console.error('❌ Error loading credit history:', error)
    return NextResponse.json({
      error: 'Failed to load credit history',
      details: error instanceof Error ? error.message : String(error)
    }, { status: 500 })
  }
}
