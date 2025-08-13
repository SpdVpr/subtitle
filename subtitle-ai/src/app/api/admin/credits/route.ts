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

    await UserService.adjustCredits(userId, deltaCredits, description, relatedJobId, batchNumber)
    const user = await UserService.getUser(userId)

    return NextResponse.json({ success: true, creditsBalance: user?.creditsBalance ?? 0 })
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || 'Failed to adjust credits' }, { status: 500 })
  }
}

