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
    const userData = userDoc.exists ? userDoc.data() : null
    
    // Get all payments for this user (without ordering to avoid index issues)
    const paymentsSnapshot = await adminDb
      .collection('payments')
      .where('userId', '==', userId)
      .get()
    
    const payments = paymentsSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt?.toDate?.()?.toISOString() || 'No timestamp'
    }))
    
    // Get all credit transactions for this user
    const transactionsSnapshot = await adminDb
      .collection('creditTransactions')
      .where('userId', '==', userId)
      .get()
    
    const transactions = transactionsSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt?.toDate?.()?.toISOString() || 'No timestamp'
    }))
    
    // Calculate total credits from transactions
    const totalCreditsFromTransactions = transactions.reduce((sum, tx) => {
      return sum + (tx.credits || 0)
    }, 0)
    
    return NextResponse.json({
      success: true,
      data: {
        userId,
        userExists: userDoc.exists,
        userCredits: userData?.credits || 0,
        userCreditsBalance: userData?.creditsBalance || 0,
        creditsTotalPurchased: userData?.creditsTotalPurchased || 0,
        userEmail: userData?.email || 'No email',
        userUpdatedAt: userData?.updatedAt?.toDate?.()?.toISOString() || 'No timestamp',
        
        // Payment analysis
        totalPayments: payments.length,
        totalPaymentAmount: payments.reduce((sum, p) => sum + (p.amount || 0), 0),
        payments: payments.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()),
        
        // Transaction analysis
        totalTransactions: transactions.length,
        totalCreditsFromTransactions,
        transactions: transactions.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()),
        
        // Analysis
        creditsDiscrepancy: (userData?.creditsBalance || 0) - totalCreditsFromTransactions,
        lastCheck: new Date().toISOString()
      }
    })
  } catch (error) {
    console.error('Check payment error:', error)
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}
