import { NextRequest, NextResponse } from 'next/server'
import { cookieConsentLogger } from '@/lib/cookie-consent-logger'
import { requireAdmin } from '@/lib/admin-auth-server'

export async function GET(req: NextRequest) {
  try {
    // Verify admin via signed Firebase ID token
    const auth = await requireAdmin(req)
    if ('response' in auth) return auth.response
    const adminEmail = auth.ctx.email

    const { searchParams } = new URL(req.url)
    const days = parseInt(searchParams.get('days') || '30')

    // Get consent statistics
    const stats = await cookieConsentLogger.getConsentStats(days)

    return NextResponse.json({
      success: true,
      stats,
      period: `${days} days`
    })

  } catch (error: any) {
    console.error('Cookie consent stats API error:', error)
    return NextResponse.json({
      success: false,
      error: 'Failed to retrieve cookie consent statistics',
      details: error.message
    }, { status: 500 })
  }
}
