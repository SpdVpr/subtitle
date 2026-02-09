import { NextRequest, NextResponse } from 'next/server'
import { UserService } from '@/lib/database'

export async function GET(req: NextRequest) {
  try {
    // Simple debug endpoint - in production you'd want proper auth
    const users = await UserService.getAllUsers()
    
    return NextResponse.json({
      success: true,
      count: users.length,
      users: users.map(user => ({
        uid: user.uid,
        email: user.email,
        displayName: user.displayName,
        createdAt: user.createdAt,
        subscriptionPlan: user.subscriptionPlan,
        creditsBalance: (user as any).creditsBalance
      }))
    })
  } catch (error: any) {
    return NextResponse.json({
      success: false,
      error: error.message,
      stack: error.stack
    }, { status: 500 })
  }
}
