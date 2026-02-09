import { db } from './firebase'
import { collection, addDoc, query, where, getDocs, serverTimestamp, Timestamp } from 'firebase/firestore'
import { RegistrationTracking } from '@/types/database'

/**
 * Registration Tracking Service
 * Detects and prevents abuse of registration credits
 */

export const COLLECTIONS = {
  REGISTRATION_TRACKING: 'registration_tracking'
}

// Configuration
export const TRACKING_CONFIG = {
  // Credits
  DEFAULT_CREDITS: 100,
  SUSPICIOUS_CREDITS: 20, // Reduced credits for suspicious registrations
  VERY_HIGH_SUSPICIOUS_CREDITS: 0, // No credits for very high suspicious registrations

  // Thresholds for suspicion scoring
  MAX_ACCOUNTS_PER_IP: 3,
  MAX_ACCOUNTS_PER_FINGERPRINT: 2,

  // Time windows (in days)
  IP_CHECK_WINDOW_DAYS: 30,
  FINGERPRINT_CHECK_WINDOW_DAYS: 90,

  // Suspicious score thresholds
  SUSPICIOUS_THRESHOLD: 50, // Above this = reduce credits to 20
  VERY_HIGH_THRESHOLD: 80, // Above this = reduce credits to 0
  BLOCK_THRESHOLD: 100, // Above this = block registration (future feature)
}

export interface RegistrationCheckResult {
  isAllowed: boolean
  suspiciousScore: number
  creditsToAward: number
  duplicateIpCount: number
  duplicateFingerprintCount: number
  reasons: string[]
}

/**
 * Check if registration should be allowed and calculate suspicious score
 */
export async function checkRegistration(
  ipAddress: string,
  browserFingerprint: string
): Promise<RegistrationCheckResult> {
  if (!db) {
    console.warn('Firestore not initialized, allowing registration')
    return {
      isAllowed: true,
      suspiciousScore: 0,
      creditsToAward: TRACKING_CONFIG.DEFAULT_CREDITS,
      duplicateIpCount: 0,
      duplicateFingerprintCount: 0,
      reasons: []
    }
  }

  const reasons: string[] = []
  let suspiciousScore = 0

  // Calculate time windows
  const ipCheckDate = new Date()
  ipCheckDate.setDate(ipCheckDate.getDate() - TRACKING_CONFIG.IP_CHECK_WINDOW_DAYS)
  
  const fingerprintCheckDate = new Date()
  fingerprintCheckDate.setDate(fingerprintCheckDate.getDate() - TRACKING_CONFIG.FINGERPRINT_CHECK_WINDOW_DAYS)

  try {
    // Check for duplicate IPs
    const ipQuery = query(
      collection(db, COLLECTIONS.REGISTRATION_TRACKING),
      where('ipAddress', '==', ipAddress)
    )
    const ipSnapshot = await getDocs(ipQuery)
    const duplicateIpCount = ipSnapshot.size

    if (duplicateIpCount > 0) {
      const ipScore = Math.min(40, duplicateIpCount * 15)
      suspiciousScore += ipScore
      reasons.push(`${duplicateIpCount} previous registration(s) from this IP`)
    }

    // Check for duplicate fingerprints
    const fingerprintQuery = query(
      collection(db, COLLECTIONS.REGISTRATION_TRACKING),
      where('browserFingerprint', '==', browserFingerprint)
    )
    const fingerprintSnapshot = await getDocs(fingerprintQuery)
    const duplicateFingerprintCount = fingerprintSnapshot.size

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

    return {
      isAllowed,
      suspiciousScore,
      creditsToAward,
      duplicateIpCount,
      duplicateFingerprintCount,
      reasons
    }
  } catch (error) {
    console.error('Error checking registration:', error)
    // On error, allow registration with default credits
    return {
      isAllowed: true,
      suspiciousScore: 0,
      creditsToAward: TRACKING_CONFIG.DEFAULT_CREDITS,
      duplicateIpCount: 0,
      duplicateFingerprintCount: 0,
      reasons: ['Error during check, allowing registration']
    }
  }
}

/**
 * Record a registration in the tracking system
 */
export async function recordRegistration(
  userId: string,
  email: string,
  ipAddress: string,
  browserFingerprint: string,
  userAgent: string,
  registrationMethod: 'email' | 'google',
  checkResult: RegistrationCheckResult
): Promise<void> {
  if (!db) {
    console.warn('Firestore not initialized, skipping registration tracking')
    return
  }

  try {
    const trackingData: Omit<RegistrationTracking, 'id'> = {
      userId,
      email,
      ipAddress,
      browserFingerprint,
      userAgent,
      suspiciousScore: checkResult.suspiciousScore,
      duplicateIpCount: checkResult.duplicateIpCount,
      duplicateFingerprintCount: checkResult.duplicateFingerprintCount,
      creditsAwarded: checkResult.creditsToAward,
      creditsReduced: checkResult.creditsToAward < TRACKING_CONFIG.DEFAULT_CREDITS,
      registrationMethod,
      emailVerified: false,
      createdAt: serverTimestamp() as Timestamp
    }

    await addDoc(collection(db, COLLECTIONS.REGISTRATION_TRACKING), trackingData)
    
    console.log('✅ Registration tracked:', {
      userId,
      email,
      suspiciousScore: checkResult.suspiciousScore,
      creditsAwarded: checkResult.creditsToAward
    })
  } catch (error) {
    console.error('Error recording registration:', error)
    // Don't throw - registration should succeed even if tracking fails
  }
}

/**
 * Get registration statistics for admin dashboard
 */
export async function getRegistrationStats(days: number = 30): Promise<{
  total: number
  suspicious: number
  creditsAwarded: number
  creditsSaved: number
  averageSuspiciousScore: number
}> {
  if (!db) {
    return {
      total: 0,
      suspicious: 0,
      creditsAwarded: 0,
      creditsSaved: 0,
      averageSuspiciousScore: 0
    }
  }

  try {
    const checkDate = new Date()
    checkDate.setDate(checkDate.getDate() - days)

    const q = query(collection(db, COLLECTIONS.REGISTRATION_TRACKING))
    const snapshot = await getDocs(q)

    let total = 0
    let suspicious = 0
    let creditsAwarded = 0
    let creditsSaved = 0
    let totalSuspiciousScore = 0

    snapshot.forEach((doc) => {
      const data = doc.data() as RegistrationTracking
      total++
      creditsAwarded += data.creditsAwarded
      
      if (data.creditsReduced) {
        suspicious++
        creditsSaved += (TRACKING_CONFIG.DEFAULT_CREDITS - data.creditsAwarded)
      }
      
      totalSuspiciousScore += data.suspiciousScore
    })

    return {
      total,
      suspicious,
      creditsAwarded,
      creditsSaved,
      averageSuspiciousScore: total > 0 ? totalSuspiciousScore / total : 0
    }
  } catch (error) {
    console.error('Error getting registration stats:', error)
    return {
      total: 0,
      suspicious: 0,
      creditsAwarded: 0,
      creditsSaved: 0,
      averageSuspiciousScore: 0
    }
  }
}

/**
 * Get suspicious registrations for admin review
 */
export async function getSuspiciousRegistrations(limit: number = 50): Promise<RegistrationTracking[]> {
  if (!db) {
    return []
  }

  try {
    const q = query(
      collection(db, COLLECTIONS.REGISTRATION_TRACKING),
      where('suspiciousScore', '>=', TRACKING_CONFIG.SUSPICIOUS_THRESHOLD)
    )
    const snapshot = await getDocs(q)

    const registrations: RegistrationTracking[] = []
    snapshot.forEach((doc) => {
      registrations.push({
        id: doc.id,
        ...doc.data()
      } as RegistrationTracking)
    })

    // Sort by suspicious score (highest first)
    registrations.sort((a, b) => b.suspiciousScore - a.suspiciousScore)

    return registrations.slice(0, limit)
  } catch (error) {
    console.error('Error getting suspicious registrations:', error)
    return []
  }
}

