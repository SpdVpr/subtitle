import { NextRequest, NextResponse } from 'next/server'
import { getAdminDb } from '@/lib/firebase-admin'
import { FieldValue } from 'firebase-admin/firestore'

export async function POST(request: NextRequest) {
  try {
    const { userId, credits = 100 } = await request.json()
    
    if (!userId) {
      return NextResponse.json({
        success: false,
        error: 'userId is required'
      }, { status: 400 })
    }
    
    const adminDb = getAdminDb()
    const batch = adminDb.batch()

    // Update user credits
    const userRef = adminDb.collection('users').doc(userId)
    batch.update(userRef, {
      credits: FieldValue.increment(credits),
      updatedAt: FieldValue.serverTimestamp(),
    })

    // Add credit transaction record
    const transactionRef = adminDb.collection('creditTransactions').doc()
    batch.set(transactionRef, {
      userId,
      type: 'credit',
      credits,
      description: `Manual test credit addition - ${credits} credits`,
      source: 'manual_test',
      createdAt: FieldValue.serverTimestamp(),
      date: new Date().toISOString().split('T')[0],
    })

    await batch.commit()
    
    return NextResponse.json({
      success: true,
      message: `Successfully added ${credits} credits to user ${userId}`,
      credits,
      userId
    })
  } catch (error) {
    console.error('Add test credits error:', error)
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}

export async function GET() {
  return NextResponse.json({
    success: true,
    message: 'POST to this endpoint with { "userId": "your-user-id", "credits": 100 } to add test credits',
    example: {
      method: 'POST',
      body: {
        userId: 'your-firebase-user-id',
        credits: 100
      }
    }
  })
}
