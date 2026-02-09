import { NextRequest, NextResponse } from 'next/server'
import { getAdminDb } from '@/lib/firebase-admin'

export async function GET() {
  try {
    const adminDb = getAdminDb()
    
    // Get recent payments
    const paymentsSnapshot = await adminDb
      .collection('payments')
      .orderBy('createdAt', 'desc')
      .limit(10)
      .get()
    
    const payments = paymentsSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt?.toDate?.()?.toISOString() || 'No timestamp'
    }))
    
    // Get recent credit transactions
    const transactionsSnapshot = await adminDb
      .collection('creditTransactions')
      .orderBy('createdAt', 'desc')
      .limit(10)
      .get()
    
    const transactions = transactionsSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt?.toDate?.()?.toISOString() || 'No timestamp'
    }))
    
    return NextResponse.json({
      success: true,
      data: {
        recentPayments: payments,
        recentTransactions: transactions,
        timestamp: new Date().toISOString()
      }
    })
  } catch (error) {
    console.error('Debug stripe events error:', error)
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}
