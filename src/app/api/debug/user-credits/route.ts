import { NextRequest, NextResponse } from 'next/server'
import { getAdminDb } from '@/lib/firebase-admin'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')
    
    if (!userId) {
      return NextResponse.json({
        success: false,
        error: 'userId parameter is required'
      }, { status: 400 })
    }
    
    const adminDb = getAdminDb()
    
    // Get user document
    const userDoc = await adminDb.collection('users').doc(userId).get()
    
    if (!userDoc.exists) {
      return NextResponse.json({
        success: false,
        error: 'User not found'
      }, { status: 404 })
    }
    
    const userData = userDoc.data()
    
    // Get user's credit transactions
    const transactionsSnapshot = await adminDb
      .collection('creditTransactions')
      .where('userId', '==', userId)
      .orderBy('createdAt', 'desc')
      .limit(10)
      .get()
    
    const transactions = transactionsSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt?.toDate?.()?.toISOString() || 'No timestamp'
    }))
    
    // Get user's payments
    const paymentsSnapshot = await adminDb
      .collection('payments')
      .where('userId', '==', userId)
      .orderBy('createdAt', 'desc')
      .limit(10)
      .get()
    
    const payments = paymentsSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt?.toDate?.()?.toISOString() || 'No timestamp'
    }))
    
    return NextResponse.json({
      success: true,
      data: {
        userId,
        userCredits: userData?.credits || 0,
        userEmail: userData?.email || 'No email',
        userCreatedAt: userData?.createdAt?.toDate?.()?.toISOString() || 'No timestamp',
        userUpdatedAt: userData?.updatedAt?.toDate?.()?.toISOString() || 'No timestamp',
        recentTransactions: transactions,
        recentPayments: payments,
        totalTransactions: transactionsSnapshot.size,
        totalPayments: paymentsSnapshot.size
      }
    })
  } catch (error) {
    console.error('Debug user credits error:', error)
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}
