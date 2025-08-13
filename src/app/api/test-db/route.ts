import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')

    if (!userId) {
      return NextResponse.json({
        error: 'Missing userId parameter',
        usage: 'GET /api/test-db?userId=YOUR_USER_ID'
      }, { status: 400 })
    }

    console.log('🧪 Testing database connection for user:', userId)

    // Test database import
    try {
      const { UserService } = await import('@/lib/database')
      console.log('✅ Database module imported successfully')

      // Test getting user
      console.log('🔍 Getting user data...')
      const user = await UserService.getUser(userId)
      
      if (!user) {
        return NextResponse.json({
          success: false,
          error: 'User not found',
          userId,
          timestamp: new Date().toISOString()
        })
      }

      console.log('✅ User found:', { 
        uid: user.uid, 
        email: user.email, 
        creditsBalance: user.creditsBalance 
      })

      // Test credit adjustment (small amount)
      console.log('💰 Testing credit adjustment...')
      const testAmount = 0.01
      await UserService.adjustCredits(userId, testAmount, 'Database test - small credit adjustment')
      console.log('✅ Credit adjustment successful')

      // Get updated user data
      const updatedUser = await UserService.getUser(userId)
      
      return NextResponse.json({
        success: true,
        message: 'Database connection and operations working correctly',
        user: {
          uid: user.uid,
          email: user.email,
          originalBalance: user.creditsBalance,
          updatedBalance: updatedUser?.creditsBalance,
          testAdjustment: testAmount
        },
        timestamp: new Date().toISOString()
      })

    } catch (dbError) {
      console.error('❌ Database error:', dbError)
      return NextResponse.json({
        success: false,
        error: 'Database operation failed',
        details: dbError instanceof Error ? dbError.message : String(dbError),
        stack: dbError instanceof Error ? dbError.stack : undefined,
        timestamp: new Date().toISOString()
      }, { status: 500 })
    }

  } catch (error) {
    console.error('❌ Test endpoint error:', error)
    return NextResponse.json({
      success: false,
      error: 'Test endpoint failed',
      details: error instanceof Error ? error.message : String(error),
      timestamp: new Date().toISOString()
    }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { userId, testCredits = 1.0 } = body

    if (!userId) {
      return NextResponse.json({
        error: 'Missing userId in request body'
      }, { status: 400 })
    }

    console.log('🧪 Testing credit operations for user:', userId)

    const { UserService } = await import('@/lib/database')

    // Get initial balance
    const user = await UserService.getUser(userId)
    if (!user) {
      return NextResponse.json({
        error: 'User not found'
      }, { status: 404 })
    }

    const initialBalance = user.creditsBalance || 0
    console.log('💳 Initial balance:', initialBalance)

    // Test deduction
    await UserService.adjustCredits(userId, -testCredits, 'Test deduction')
    console.log('✅ Test deduction completed')

    // Get balance after deduction
    const userAfterDeduction = await UserService.getUser(userId)
    const balanceAfterDeduction = userAfterDeduction?.creditsBalance || 0
    console.log('💳 Balance after deduction:', balanceAfterDeduction)

    // Test refund
    await UserService.adjustCredits(userId, testCredits, 'Test refund')
    console.log('✅ Test refund completed')

    // Get final balance
    const userAfterRefund = await UserService.getUser(userId)
    const finalBalance = userAfterRefund?.creditsBalance || 0
    console.log('💳 Final balance:', finalBalance)

    return NextResponse.json({
      success: true,
      message: 'Credit operations test completed',
      test: {
        userId,
        testAmount: testCredits,
        initialBalance,
        balanceAfterDeduction,
        finalBalance,
        deductionWorked: (balanceAfterDeduction === initialBalance - testCredits),
        refundWorked: (finalBalance === initialBalance)
      },
      timestamp: new Date().toISOString()
    })

  } catch (error) {
    console.error('❌ Credit test error:', error)
    return NextResponse.json({
      success: false,
      error: 'Credit test failed',
      details: error instanceof Error ? error.message : String(error),
      timestamp: new Date().toISOString()
    }, { status: 500 })
  }
}
