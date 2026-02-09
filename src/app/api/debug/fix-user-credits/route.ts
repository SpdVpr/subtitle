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
    
    // Get user document
    const userDoc = await adminDb.collection('users').doc(userId).get()
    
    if (!userDoc.exists) {
      return NextResponse.json({
        success: false,
        error: 'User not found'
      }, { status: 404 })
    }
    
    const userData = userDoc.data()
    const oldCredits = userData?.credits || 0
    const currentCreditsBalance = userData?.creditsBalance || 0
    
    // If user has credits in old field but not in creditsBalance, migrate them
    if (oldCredits > 0 && currentCreditsBalance === 0) {
      await adminDb.collection('users').doc(userId).update({
        creditsBalance: oldCredits,
        creditsTotalPurchased: oldCredits,
        updatedAt: FieldValue.serverTimestamp(),
      })
      
      return NextResponse.json({
        success: true,
        message: `Migrated ${oldCredits} credits from 'credits' field to 'creditsBalance' field`,
        data: {
          userId,
          oldCredits,
          newCreditsBalance: oldCredits
        }
      })
    }
    
    return NextResponse.json({
      success: true,
      message: 'No migration needed',
      data: {
        userId,
        creditsBalance: currentCreditsBalance,
        oldCredits: oldCredits
      }
    })
  } catch (error) {
    console.error('Fix user credits error:', error)
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}

export async function GET() {
  return NextResponse.json({
    success: true,
    message: 'POST to this endpoint with { "userId": "your-user-id" } to migrate credits from old field to new field',
    example: {
      method: 'POST',
      body: {
        userId: 'your-firebase-user-id'
      }
    }
  })
}
