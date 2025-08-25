import { NextRequest, NextResponse } from 'next/server'
import { getAdminDb } from '@/lib/firebase-admin'
import { FieldValue } from 'firebase-admin/firestore'

export async function POST(request: NextRequest) {
  try {
    const { userId, credits, description } = await request.json()
    
    if (!userId || !credits) {
      return NextResponse.json({ 
        error: 'Missing userId or credits' 
      }, { status: 400 })
    }

    console.log(`🔧 DEBUG: Adding ${credits} credits to user ${userId}`)

    const adminDb = getAdminDb()
    const batch = adminDb.batch()

    // Update user credits
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
      description: description || `Debug: Manual credit addition`,
      source: 'debug_manual',
      createdAt: FieldValue.serverTimestamp(),
      date: new Date().toISOString().split('T')[0],
    })

    // Add payment record
    const paymentRef = adminDb.collection('payments').doc()
    batch.set(paymentRef, {
      userId,
      amount: 100, // $1 in cents
      currency: 'usd',
      credits,
      packageName: 'Debug Manual Addition',
      paymentMethod: 'debug',
      status: 'completed',
      createdAt: FieldValue.serverTimestamp(),
    })

    await batch.commit()

    console.log(`✅ DEBUG: Successfully added ${credits} credits to user ${userId}`)

    return NextResponse.json({ 
      success: true,
      message: `Added ${credits} credits to user ${userId}`,
      userId,
      credits
    })

  } catch (error) {
    console.error('🚨 DEBUG: Failed to add credits:', error)
    return NextResponse.json({ 
      error: 'Failed to add credits',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  return NextResponse.json({
    message: 'Debug endpoint for manually adding credits',
    usage: 'POST with { userId, credits, description }',
    example: {
      userId: '22EQGc6TOwMLACH80fohwwEB19q1',
      credits: 100,
      description: 'Manual test credit addition'
    }
  })
}
