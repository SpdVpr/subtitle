import { NextRequest, NextResponse } from 'next/server'
import { cookieConsentLogger, getClientIP, CookieConsentRecord } from '@/lib/cookie-consent-logger'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const {
      sessionId,
      userId,
      preferences,
      consentMethod,
      language,
      pageUrl,
      previousConsent
    } = body

    // Validation
    if (!sessionId || !preferences || !consentMethod || !language) {
      return NextResponse.json({
        success: false,
        error: 'Missing required fields'
      }, { status: 400 })
    }

    // Get client info
    const ipAddress = getClientIP(req)
    const userAgent = req.headers.get('user-agent') || 'unknown'

    // Create consent record (only include defined values)
    const consentRecord: any = {
      sessionId,
      ipAddress,
      userAgent,
      preferences,
      consentMethod,
      language,
      pageUrl
    }

    // Only add userId if it exists
    if (userId) {
      consentRecord.userId = userId
    }

    // Only add previousConsent if it exists
    if (previousConsent) {
      consentRecord.previousConsent = previousConsent
    }

    // Log the consent
    await cookieConsentLogger.logConsent(consentRecord)

    return NextResponse.json({
      success: true,
      message: 'Cookie consent logged successfully'
    })

  } catch (error: any) {
    console.error('Cookie consent API error:', error)
    return NextResponse.json({
      success: false,
      error: 'Failed to log cookie consent',
      details: error.message
    }, { status: 500 })
  }
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const sessionId = searchParams.get('sessionId')
    const userId = searchParams.get('userId')
    const limit = parseInt(searchParams.get('limit') || '10')

    if (sessionId) {
      const history = await cookieConsentLogger.getConsentHistory(sessionId, limit)
      return NextResponse.json({
        success: true,
        consents: history
      })
    }

    if (userId) {
      const consents = await cookieConsentLogger.getUserConsents(userId, limit)
      return NextResponse.json({
        success: true,
        consents: consents
      })
    }

    return NextResponse.json({
      success: false,
      error: 'sessionId or userId parameter required'
    }, { status: 400 })

  } catch (error: any) {
    console.error('Cookie consent GET API error:', error)
    return NextResponse.json({
      success: false,
      error: 'Failed to retrieve cookie consents',
      details: error.message
    }, { status: 500 })
  }
}
