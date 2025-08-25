import { NextRequest, NextResponse } from 'next/server'
import { getAdminDb } from '@/lib/firebase-admin'
import { FieldValue } from 'firebase-admin/firestore'

export async function POST(request: NextRequest) {
  try {
    const { userId } = await request.json()
    
    if (!userId) {
      return NextResponse.json({
        success: false,
        error: 'userId is required'
      }, { status: 400 })
    }
    
    const adminDb = getAdminDb()
    
    // Get all payments for this user that don't have corresponding credit transactions
    const paymentsSnapshot = await adminDb
      .collection('payments')
      .where('userId', '==', userId)
      .get()
    
    const payments = paymentsSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }))
    
    // Get all credit transactions for this user
    const transactionsSnapshot = await adminDb
      .collection('creditTransactions')
      .where('userId', '==', userId)
      .get()
    
    const transactions = transactionsSnapshot.docs.map(doc => doc.data())
    const processedSessionIds = new Set(
      transactions
        .filter(tx => tx.stripeSessionId)
        .map(tx => tx.stripeSessionId)
    )
    
    // Find payments that haven't been processed into credit transactions
    const unprocessedPayments = payments.filter(payment => 
      payment.stripeSessionId && !processedSessionIds.has(payment.stripeSessionId)
    )
    
    if (unprocessedPayments.length === 0) {
      return NextResponse.json({
        success: true,
        message: 'No unprocessed payments found',
        data: {
          totalPayments: payments.length,
          processedPayments: payments.length - unprocessedPayments.length,
          unprocessedPayments: 0
        }
      })
    }
    
    // Process unprocessed payments
    const batch = adminDb.batch()
    let totalCreditsToAdd = 0
    
    for (const payment of unprocessedPayments) {
      const credits = payment.credits || 100 // Default to 100 if not specified
      totalCreditsToAdd += credits
      
      // Add credit transaction
      const transactionRef = adminDb.collection('creditTransactions').doc()
      batch.set(transactionRef, {
        userId,
        type: 'credit',
        credits,
        description: `Processed pending payment - ${payment.packageName || 'Unknown Package'}`,
        source: 'pending_payment_processing',
        stripeSessionId: payment.stripeSessionId,
        amountPaid: payment.amount || 0,
        currency: payment.currency || 'usd',
        paymentMethod: payment.paymentMethod || 'stripe',
        createdAt: FieldValue.serverTimestamp(),
        date: new Date().toISOString().split('T')[0],
        originalPaymentId: payment.id
      })
    }
    
    // Update user credits
    if (totalCreditsToAdd > 0) {
      const userRef = adminDb.collection('users').doc(userId)
      batch.update(userRef, {
        creditsBalance: FieldValue.increment(totalCreditsToAdd),
        creditsTotalPurchased: FieldValue.increment(totalCreditsToAdd),
        updatedAt: FieldValue.serverTimestamp(),
      })
    }
    
    await batch.commit()
    
    return NextResponse.json({
      success: true,
      message: `Processed ${unprocessedPayments.length} pending payments, added ${totalCreditsToAdd} credits`,
      data: {
        processedPayments: unprocessedPayments.length,
        creditsAdded: totalCreditsToAdd,
        payments: unprocessedPayments.map(p => ({
          id: p.id,
          sessionId: p.stripeSessionId,
          credits: p.credits,
          amount: p.amount
        }))
      }
    })
  } catch (error) {
    console.error('Process pending payments error:', error)
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}

export async function GET() {
  return NextResponse.json({
    success: true,
    message: 'POST to this endpoint with { "userId": "your-user-id" } to process pending payments',
    example: {
      method: 'POST',
      body: {
        userId: 'your-firebase-user-id'
      }
    }
  })
}
