import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const { userId, amount, description } = await request.json()

    if (!userId || !amount) {
      return NextResponse.json({ error: 'userId and amount are required' }, { status: 400 })
    }

    console.log(`🧪 DEBUG: Testing credit deduction for user ${userId}, amount: ${amount}`)

    // Import and test the exact same code path as translate-stream
    const { UserService } = await import('@/lib/database-admin')
    
    // Get current balance
    const user = await UserService.getUser(userId)
    const currentBalance = user?.creditsBalance || 0
    console.log(`🧪 DEBUG: Current balance: ${currentBalance}`)

    if (currentBalance < Math.abs(amount)) {
      return NextResponse.json({ 
        error: `Insufficient credits. Required: ${Math.abs(amount)}, Available: ${currentBalance}` 
      }, { status: 402 })
    }

    // Test credit deduction
    await UserService.adjustCredits(userId, -Math.abs(amount), description || `Test deduction: ${amount} credits`)
    console.log(`🧪 DEBUG: Successfully deducted ${amount} credits`)

    // Get new balance
    const updatedUser = await UserService.getUser(userId)
    const newBalance = updatedUser?.creditsBalance || 0
    console.log(`🧪 DEBUG: New balance: ${newBalance}`)

    return NextResponse.json({
      success: true,
      message: `Successfully deducted ${amount} credits`,
      balanceBefore: currentBalance,
      balanceAfter: newBalance,
      deduction: amount
    })

  } catch (error) {
    console.error('🧪 DEBUG: Credit deduction test failed:', error)
    console.error('🧪 DEBUG: Error details:', error instanceof Error ? error.message : String(error))
    console.error('🧪 DEBUG: Error stack:', error instanceof Error ? error.stack : 'No stack')
    
    return NextResponse.json(
      { 
        error: 'Credit deduction test failed', 
        details: error instanceof Error ? error.message : String(error) 
      },
      { status: 500 }
    )
  }
}
