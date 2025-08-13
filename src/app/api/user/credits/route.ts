import { NextRequest, NextResponse } from 'next/server'
import { UserService } from '@/lib/database-admin'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')

    if (!userId) {
      return NextResponse.json({
        error: 'Missing userId parameter'
      }, { status: 400 })
    }

    console.log('💳 Getting credits for user:', userId)

    const user = await UserService.getUser(userId)
    
    if (!user) {
      // Graceful fallback for demo/unknown users
      return NextResponse.json({
        success: true,
        credits: 0,
        totalPurchased: 0,
        user: { uid: userId, email: null, displayName: null }
      })
    }

    return NextResponse.json({
      success: true,
      credits: user.creditsBalance || 0,
      totalPurchased: user.creditsTotalPurchased || 0,
      user: {
        uid: user.uid,
        email: user.email,
        displayName: user.displayName
      }
    })

  } catch (error) {
    console.error('❌ Error getting user credits:', error)
    return NextResponse.json({
      error: 'Failed to get user credits',
      details: error instanceof Error ? error.message : String(error)
    }, { status: 500 })
  }
}
