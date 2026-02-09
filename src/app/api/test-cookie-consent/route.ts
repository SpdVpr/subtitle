import { NextRequest, NextResponse } from 'next/server'
import { cookieConsentLogger } from '@/lib/cookie-consent-logger'

export async function POST(req: NextRequest) {
  try {
    // Test data without undefined values
    const testRecord = {
      sessionId: 'test_session_123',
      ipAddress: '127.0.0.1',
      userAgent: 'Test Browser',
      preferences: {
        necessary: true,
        analytics: true,
        marketing: false,
        functional: true
      },
      consentMethod: 'banner_accept_all' as const,
      language: 'en' as const,
      pageUrl: 'https://test.com'
    }

    console.log('🧪 Testing cookie consent logging with data:', testRecord)

    await cookieConsentLogger.logConsent(testRecord)

    return NextResponse.json({
      success: true,
      message: 'Test cookie consent logged successfully'
    })

  } catch (error: any) {
    console.error('🧪 Test cookie consent error:', error)
    return NextResponse.json({
      success: false,
      error: error.message
    }, { status: 500 })
  }
}
