import { NextRequest, NextResponse } from 'next/server'
import { getAdminDb } from '@/lib/firebase-admin'
import { FieldValue } from 'firebase-admin/firestore'

export async function POST(request: NextRequest) {
  try {
    const { userId, credits = 100, amount = 100 } = await request.json()
    
    if (!userId) {
      return NextResponse.json({
        success: false,
        error: 'userId is required'
      }, { status: 400 })
    }
    
    const adminDb = getAdminDb()
    const batch = adminDb.batch()
    
    const sessionId = `sim_${Date.now()}`
    const packageName = `${credits} Credits Package`

    // Update user credits (using correct field name)
    const userRef = adminDb.collection('users').doc(userId)
    batch.update(userRef, {
      creditsBalance: FieldValue.increment(credits),
      creditsTotalPurchased: FieldValue.increment(credits),
      updatedAt: FieldValue.serverTimestamp(),
    })

    // Add credit transaction record
    const transactionRef = adminDb.collection('creditTransactions').doc()
    batch.set(transactionRef, {
      userId,
      type: 'credit',
      credits,
      description: `Simulated payment - ${packageName}`,
      source: 'simulated_payment',
      stripeSessionId: sessionId,
      amountPaid: amount,
      currency: 'usd',
      paymentMethod: 'simulated',
      createdAt: FieldValue.serverTimestamp(),
      date: new Date().toISOString().split('T')[0],
    })

    // Add payment record for admin tracking
    const paymentRef = adminDb.collection('payments').doc()
    batch.set(paymentRef, {
      userId,
      stripeSessionId: sessionId,
      amount: amount,
      currency: 'usd',
      credits,
      packageName,
      paymentMethod: 'simulated',
      status: 'completed',
      createdAt: FieldValue.serverTimestamp(),
    })

    await batch.commit()
    
    console.log(`✅ Simulated payment: ${credits} credits added to user ${userId}`)
    
    return NextResponse.json({
      success: true,
      message: `Successfully simulated payment: ${credits} credits added to user ${userId}`,
      data: {
        userId,
        credits,
        amount,
        sessionId,
        packageName
      }
    })
  } catch (error) {
    console.error('Simulate payment error:', error)
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}

export async function GET() {
  return NextResponse.json({
    success: true,
    message: 'POST to this endpoint to simulate a successful payment',
    example: {
      method: 'POST',
      body: {
        userId: 'your-firebase-user-id',
        credits: 100,
        amount: 100 // amount in cents
      }
    },
    instructions: [
      '1. Get your user ID from browser console (F12)',
      '2. POST to this endpoint with userId and credits',
      '3. Credits will be added to your account immediately',
      '4. Check your dashboard to verify credits were added'
    ]
  })
}
