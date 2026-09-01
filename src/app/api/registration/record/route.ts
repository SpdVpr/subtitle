import { NextRequest, NextResponse } from 'next/server'
import { getAdminDb } from '@/lib/firebase-admin'
import { verifyUser } from '@/lib/user-auth-server'
import { isDisposableEmail } from '@/lib/disposable-email'

/**
 * API endpoint to record a registration in the tracking system
 *
 * POST /api/registration/record
 * Body: {
 *   userId: string
 *   email: string
 *   browserFingerprint: string
 *   registrationMethod: 'email' | 'google'
 *   creditsAwarded: number
 *   suspiciousScore: number
 * }
 */
export async function POST(request: NextRequest) {
  try {
    const authUser = await verifyUser(request)
    if (!authUser) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const body = await request.json()
    const {
      userId,
      email,
      browserFingerprint,
      registrationMethod,
      acquisition
    } = body

    // Validate required fields
    if (!userId || !email || !browserFingerprint || !registrationMethod) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }
    if (userId !== authUser.uid) {
      return NextResponse.json({ error: 'User mismatch' }, { status: 403 })
    }

    // Get client IP address
    const ipAddress = getClientIP(request)
    const userAgent = request.headers.get('user-agent') || 'unknown'

    // Get admin database
    const db = getAdminDb()

    // Count existing registrations with same IP
    const ipQuery = await db.collection('registration_tracking')
      .where('ipAddress', '==', ipAddress)
      .get()
    const duplicateIpCount = ipQuery.size

    // Count existing registrations with same fingerprint
    const fingerprintQuery = await db.collection('registration_tracking')
      .where('browserFingerprint', '==', browserFingerprint)
      .get()
    const duplicateFingerprintCount = fingerprintQuery.size

    let suspiciousScore = 0
    if (duplicateIpCount > 0) suspiciousScore += Math.min(40, duplicateIpCount * 15)
    if (duplicateFingerprintCount > 0) suspiciousScore += Math.min(50, duplicateFingerprintCount * 25)
    if (duplicateIpCount > 0 && duplicateFingerprintCount > 0) suspiciousScore += 20
    if (isDisposableEmail(email)) suspiciousScore = 100
    suspiciousScore = Math.min(100, suspiciousScore)
    const creditsAwarded = 0

    // Record the registration using Admin SDK
    const trackingData = {
      userId,
      email,
      ipAddress,
      browserFingerprint,
      userAgent,
      suspiciousScore,
      duplicateIpCount,
      duplicateFingerprintCount,
      creditsAwarded,
      creditsReduced: false,
      registrationMethod,
      emailVerified: false,
      acquisition: typeof acquisition === 'string' ? acquisition.slice(0, 2000) : null,
      createdAt: new Date()
    }

    await db.collection('registration_tracking').add(trackingData)

    console.log('✅ Registration tracked successfully:', {
      userId,
      email,
      suspiciousScore,
      creditsAwarded,
      duplicateIpCount,
      duplicateFingerprintCount
    })

    return NextResponse.json({
      success: true,
      message: 'Registration recorded successfully'
    })
  } catch (error) {
    console.error('❌ Error recording registration:', error)
    return NextResponse.json(
      {
        error: 'Failed to record registration',
        success: false,
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}

/**
 * Extract client IP address from request headers
 */
function getClientIP(request: NextRequest): string {
  // Try various headers that might contain the real IP
  const forwarded = request.headers.get('x-forwarded-for')
  if (forwarded) {
    return forwarded.split(',')[0].trim()
  }

  const realIP = request.headers.get('x-real-ip')
  if (realIP) {
    return realIP
  }

  const cfConnectingIP = request.headers.get('cf-connecting-ip')
  if (cfConnectingIP) {
    return cfConnectingIP
  }

  // Fallback
  return request.ip || 'unknown'
}
