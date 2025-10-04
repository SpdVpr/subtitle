import { NextRequest, NextResponse } from 'next/server'
import { getAdminDb } from '@/lib/firebase-admin'
import { TRACKING_CONFIG } from '@/lib/registration-tracking'
import rateLimiter, { RATE_LIMITS, createRateLimitResponse } from '@/lib/rate-limiter'

/**
 * API endpoint to check if a registration should be allowed
 * and calculate suspicious score
 *
 * POST /api/registration/check
 * Body: { browserFingerprint: string }
 */
export async function POST(request: NextRequest) {
  try {
    // Get client IP address
    const ipAddress = getClientIP(request)

    // Apply rate limiting
    const isLimited = rateLimiter.isRateLimited(
      `registration:${ipAddress}`,
      RATE_LIMITS.REGISTRATION.maxRequests,
      RATE_LIMITS.REGISTRATION.windowMs
    )

    if (isLimited) {
      const resetTime = rateLimiter.getResetTime(`registration:${ipAddress}`)
      return NextResponse.json(
        createRateLimitResponse(resetTime),
        {
          status: 429,
          headers: {
            'Retry-After': resetTime ? Math.ceil((resetTime - Date.now()) / 1000).toString() : '3600'
          }
        }
      )
    }

    const body = await request.json()
    const { browserFingerprint } = body

    if (!browserFingerprint) {
      return NextResponse.json(
        { error: 'Browser fingerprint is required' },
        { status: 400 }
      )
    }

    // Get admin database
    const db = getAdminDb()

    const reasons: string[] = []
    let suspiciousScore = 0

    // Check for duplicate IPs
    const ipQuery = await db.collection('registration_tracking')
      .where('ipAddress', '==', ipAddress)
      .get()
    const duplicateIpCount = ipQuery.size

    if (duplicateIpCount > 0) {
      const ipScore = Math.min(40, duplicateIpCount * 15)
      suspiciousScore += ipScore
      reasons.push(`${duplicateIpCount} previous registration(s) from this IP`)
    }

    // Check for duplicate fingerprints
    const fingerprintQuery = await db.collection('registration_tracking')
      .where('browserFingerprint', '==', browserFingerprint)
      .get()
    const duplicateFingerprintCount = fingerprintQuery.size

    if (duplicateFingerprintCount > 0) {
      const fingerprintScore = Math.min(50, duplicateFingerprintCount * 25)
      suspiciousScore += fingerprintScore
      reasons.push(`${duplicateFingerprintCount} previous registration(s) from this browser`)
    }

    // Check if both IP and fingerprint match (very suspicious)
    if (duplicateIpCount > 0 && duplicateFingerprintCount > 0) {
      suspiciousScore += 20
      reasons.push('Both IP and browser fingerprint match previous registrations')
    }

    // Cap suspicious score at 100
    suspiciousScore = Math.min(100, suspiciousScore)

    // Determine credits to award
    let creditsToAward = TRACKING_CONFIG.DEFAULT_CREDITS
    if (suspiciousScore >= TRACKING_CONFIG.VERY_HIGH_THRESHOLD) {
      creditsToAward = TRACKING_CONFIG.VERY_HIGH_SUSPICIOUS_CREDITS
      reasons.push(`Credits reduced to ${creditsToAward} due to very high suspicious activity (score: ${suspiciousScore})`)
    } else if (suspiciousScore >= TRACKING_CONFIG.SUSPICIOUS_THRESHOLD) {
      creditsToAward = TRACKING_CONFIG.SUSPICIOUS_CREDITS
      reasons.push(`Credits reduced to ${creditsToAward} due to suspicious activity (score: ${suspiciousScore})`)
    }

    // Determine if registration should be blocked (future feature)
    const isAllowed = suspiciousScore < TRACKING_CONFIG.BLOCK_THRESHOLD

    return NextResponse.json({
      success: true,
      isAllowed,
      suspiciousScore,
      creditsToAward,
      duplicateIpCount,
      duplicateFingerprintCount,
      reasons
    })
  } catch (error) {
    console.error('Error checking registration:', error)
    return NextResponse.json(
      {
        error: 'Failed to check registration',
        success: false
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

