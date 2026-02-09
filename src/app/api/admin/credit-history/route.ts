import { NextRequest, NextResponse } from 'next/server'
import { isAdminEmail } from '@/lib/admin-auth-email'

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
    const isDemoMode = !db

    if (isDemoMode) {
      return getDemoCreditHistory()
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
      console.log(`🔍 Looking up user for transaction ${doc.id}, userId: ${data.userId}`)
      if (data.userId) {
        try {
          if (db.collection && typeof db.collection === 'function') {
            // Admin SDK - get user document directly by ID
            const userDoc = await db.collection('users').doc(data.userId).get()

            if (userDoc.exists) {
              const userData = userDoc.data()
              userEmail = userData.email || userData.displayName || `User ${data.userId.substring(0, 8)}...`
              console.log(`✅ Found user: ${userEmail}`)
            } else {
              console.log(`❌ User document not found for userId: ${data.userId}`)
            }
          } else {
            // Client SDK - get user document directly by ID
            const { doc, getDoc } = await import('firebase/firestore')
            const userDocRef = doc(db, 'users', data.userId)
            const userDoc = await getDoc(userDocRef)

            if (userDoc.exists()) {
              const userData = userDoc.data()
              userEmail = userData.email || userData.displayName || `User ${data.userId.substring(0, 8)}...`
              console.log(`✅ Found user (client SDK): ${userEmail}`)
            } else {
              console.log(`❌ User document not found (client SDK) for userId: ${data.userId}`)
            }
          }
        } catch (userError) {
          console.warn(`❌ Failed to get user email for transaction userId ${data.userId}:`, userError)
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

      const transaction = {
        id: doc.id,
        userId: data.userId,
        userEmail,
        type: data.type || 'unknown',
        amount: Number(data.credits || data.amount) || 0, // FIXED: credits first, then amount
        balanceBefore: Number(data.balanceBefore) || 0,
        balanceAfter: Number(data.balanceAfter) || 0,
        reason: data.reason || data.description || 'No reason provided',
        createdAt: data.createdAt?.toDate?.() || new Date(data.createdAt) || new Date(),
        adminId: data.adminId,
        adminEmail: adminEmailFromDb
      }

      console.log(`📝 Final transaction: ${transaction.type} ${transaction.amount} for ${userEmail}`)
      transactions.push(transaction)
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

// Demo mode credit history
function getDemoCreditHistory() {
  console.log('🧪 Demo mode: Returning sample credit history')

  const demoTransactions = [
    {
      id: 'demo-tx-1',
      userId: 'demo-user-1',
      userEmail: 'demo@test.com',
      type: 'topup',
      amount: 100, // Purchased 100 credits
      balanceBefore: 0,
      balanceAfter: 100,
      reason: 'Purchased 100 credits - Trial Pack (Bitcoin Lightning)',
      createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
      source: 'purchase'
    },
    {
      id: 'demo-tx-2',
      userId: 'premium-user-demo',
      userEmail: 'premium@test.com',
      type: 'topup',
      amount: 1200, // Purchased 1200 credits
      balanceBefore: 0,
      balanceAfter: 1200,
      reason: 'Purchased 1200 credits - Popular Pack',
      createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000), // 1 day ago
      adminEmail: 'admin@demo.com'
    },
    {
      id: 'demo-tx-3',
      userId: 'demo-user-1',
      userEmail: 'demo@test.com',
      type: 'deduction',
      amount: -25,
      balanceBefore: 775,
      balanceAfter: 750,
      reason: 'Subtitle generation usage',
      createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000) // 3 days ago
    },
    {
      id: 'demo-tx-4',
      userId: 'demo-user-2',
      userEmail: 'user2@demo.com',
      type: 'topup',
      amount: 50,
      balanceBefore: 0,
      balanceAfter: 50,
      reason: 'Welcome bonus',
      createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) // 7 days ago
    }
  ]

  return NextResponse.json({
    success: true,
    demoMode: true,
    transactions: demoTransactions,
    total: demoTransactions.length,
    message: 'Demo mode: Sample credit history (Database not connected)'
  })
}
