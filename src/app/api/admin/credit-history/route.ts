import { NextRequest, NextResponse } from 'next/server'
import { isAdmin } from '@/lib/admin-auth'
import { db } from '@/lib/firebase-admin'
import { collection, query, orderBy, limit, getDocs, where } from 'firebase/firestore'

export async function GET(request: NextRequest) {
  try {
    // Check admin authentication
    const adminCheck = await isAdmin(request)
    if (!adminCheck.isAdmin) {
      return NextResponse.json({
        error: 'Unauthorized - Admin access required'
      }, { status: 403 })
    }

    console.log('📊 Loading credit history for admin dashboard')

    if (!db) {
      return NextResponse.json({
        error: 'Database not available'
      }, { status: 500 })
    }

    // Get credit transactions from the last 30 days
    const thirtyDaysAgo = new Date()
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

    const transactionsRef = collection(db, 'creditTransactions')
    const q = query(
      transactionsRef,
      orderBy('createdAt', 'desc'),
      limit(100) // Limit to last 100 transactions
    )

    const snapshot = await getDocs(q)
    const transactions = []

    for (const doc of snapshot.docs) {
      const data = doc.data()
      
      // Get user email for display
      let userEmail = 'Unknown User'
      if (data.userId) {
        try {
          const usersRef = collection(db, 'users')
          const userQuery = query(usersRef, where('userId', '==', data.userId), limit(1))
          const userSnapshot = await getDocs(userQuery)
          
          if (!userSnapshot.empty) {
            const userData = userSnapshot.docs[0].data()
            userEmail = userData.email || `User ${data.userId.substring(0, 8)}...`
          }
        } catch (userError) {
          console.warn('Failed to get user email for transaction:', data.userId, userError)
        }
      }

      // Get admin email if available
      let adminEmail = undefined
      if (data.adminId) {
        try {
          const usersRef = collection(db, 'users')
          const adminQuery = query(usersRef, where('userId', '==', data.adminId), limit(1))
          const adminSnapshot = await getDocs(adminQuery)
          
          if (!adminSnapshot.empty) {
            const adminData = adminSnapshot.docs[0].data()
            adminEmail = adminData.email || `Admin ${data.adminId.substring(0, 8)}...`
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
        amount: Number(data.amount) || 0,
        balanceBefore: Number(data.balanceBefore) || 0,
        balanceAfter: Number(data.balanceAfter) || 0,
        reason: data.reason || data.description || 'No reason provided',
        createdAt: data.createdAt?.toDate?.() || new Date(data.createdAt) || new Date(),
        adminId: data.adminId,
        adminEmail
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
