import { NextRequest, NextResponse } from 'next/server'
import { cookieConsentLogger } from '@/lib/cookie-consent-logger'
import { isAdminEmail } from '@/lib/admin-auth-email'

export async function GET(req: NextRequest) {
  try {
    // Verify admin authentication
    const adminEmail = req.headers.get('x-admin-email')
    if (!adminEmail || !isAdminEmail(adminEmail)) {
      return NextResponse.json({
        success: false,
        error: 'Unauthorized'
      }, { status: 401 })
    }

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
