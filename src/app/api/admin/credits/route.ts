import { NextRequest, NextResponse } from 'next/server'
import { UserService } from '@/lib/database'
import { isAdminEmail } from '@/lib/admin-auth-email'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { userId, deltaCredits, description, relatedJobId, batchNumber, adminEmail } = body || {}

    if (!userId || typeof deltaCredits !== 'number') {
      return NextResponse.json({ error: 'userId and deltaCredits are required' }, { status: 400 })
    }

    // Basic admin check: either header or body adminEmail must be in allowed list
    const headerEmail = req.headers.get('x-admin-email') || adminEmail
    if (!headerEmail || !isAdminEmail(headerEmail)) {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 })
    }

    console.log('🔧 Admin Credits Adjustment:', { userId, deltaCredits, description, adminEmail: headerEmail })

    // Get user before adjustment to show previous balance
    const userBefore = await UserService.getUser(userId)
    const previousCredits = userBefore?.creditsBalance || 0

    await UserService.adjustCredits(userId, deltaCredits, description || 'Admin adjustment', relatedJobId, batchNumber)
    const userAfter = await UserService.getUser(userId)
    const newCredits = userAfter?.creditsBalance || 0

    return NextResponse.json({
      success: true,
      userId,
      deltaCredits,
      previousCredits,
      creditsBalance: newCredits,
      description,
      adminEmail: headerEmail
    })
  } catch (e: any) {
    console.error('Admin credits adjustment error:', e)
    return NextResponse.json({ error: e?.message || 'Failed to adjust credits' }, { status: 500 })
  }
}

