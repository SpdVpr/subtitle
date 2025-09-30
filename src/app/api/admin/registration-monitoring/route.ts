import { NextRequest, NextResponse } from 'next/server'
import { getAdminDb } from '@/lib/firebase-admin'
import { TRACKING_CONFIG } from '@/lib/registration-tracking'

/**
 * API endpoint for admin to view registration monitoring data
 *
 * GET /api/admin/registration-monitoring
 */
export async function GET(request: NextRequest) {
  try {
    // TODO: Add proper admin authentication check
    // For now, we'll rely on Firestore security rules

    const db = getAdminDb()

    // Get suspicious registrations (score >= 50)
    const suspiciousQuery = await db.collection('registration_tracking')
      .where('suspiciousScore', '>=', TRACKING_CONFIG.SUSPICIOUS_THRESHOLD)
      .orderBy('suspiciousScore', 'desc')
      .limit(100)
      .get()

    const registrations = suspiciousQuery.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }))

    // Get all registrations for stats
    const allQuery = await db.collection('registration_tracking').get()

    let total = 0
    let suspicious = 0
    let creditsAwarded = 0
    let creditsSaved = 0
    let totalSuspiciousScore = 0

    allQuery.forEach(doc => {
      const data = doc.data()
      total++
      creditsAwarded += data.creditsAwarded || 0

      if (data.creditsReduced) {
        suspicious++
        creditsSaved += (TRACKING_CONFIG.DEFAULT_CREDITS - (data.creditsAwarded || 0))
      }

      totalSuspiciousScore += data.suspiciousScore || 0
    })

    const stats = {
      total,
      suspicious,
      creditsAwarded,
      creditsSaved,
      averageSuspiciousScore: total > 0 ? totalSuspiciousScore / total : 0
    }

    return NextResponse.json({
      success: true,
      registrations,
      stats
    })
  } catch (error) {
    console.error('Error fetching registration monitoring data:', error)
    return NextResponse.json(
      {
        error: 'Failed to fetch registration monitoring data',
        success: false,
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}

