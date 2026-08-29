import { NextRequest, NextResponse } from 'next/server'
import { getAdminDb } from '@/lib/firebase-admin'
import { AggregateField } from 'firebase-admin/firestore'
import { TRACKING_CONFIG } from '@/lib/registration-tracking'
import { requireAdmin } from '@/lib/admin-auth-server'

/**
 * API endpoint for admin to view registration monitoring data
 *
 * GET /api/admin/registration-monitoring
 */
export async function GET(request: NextRequest) {
  try {
    // Verify admin via signed Firebase ID token
    const auth = await requireAdmin(request)
    if ('response' in auth) return auth.response

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

    // Stats used to be summed by reading every registration - a billed read
    // per row, for five numbers. Aggregation queries do it in a handful of
    // reads. Firestore refuses to combine two sums in one aggregate without a
    // composite index, so each aggregate asks for a single value, and the whole
    // path falls back to a projected scan if any of them is unindexed.
    const tracking = db.collection('registration_tracking')

    let total = 0
    let suspicious = 0
    let creditsAwarded = 0
    let totalSuspiciousScore = 0
    let creditsAwardedToSuspicious = 0

    try {
      const suspiciousQ = tracking.where('creditsReduced', '==', true)
      const [totalAgg, awardedAgg, scoreAgg, suspiciousAgg, suspiciousAwardedAgg] = await Promise.all([
        tracking.count().get(),
        tracking.aggregate({ value: AggregateField.sum('creditsAwarded') }).get(),
        tracking.aggregate({ value: AggregateField.sum('suspiciousScore') }).get(),
        suspiciousQ.count().get(),
        suspiciousQ.aggregate({ value: AggregateField.sum('creditsAwarded') }).get()
      ])

      total = totalAgg.data().count
      creditsAwarded = awardedAgg.data().value
      totalSuspiciousScore = scoreAgg.data().value
      suspicious = suspiciousAgg.data().count
      creditsAwardedToSuspicious = suspiciousAwardedAgg.data().value
    } catch (indexError) {
      // firestore.indexes.json carries the missing index; until it is deployed,
      // read the three fields the stats need rather than whole documents.
      console.log('Aggregation unavailable, falling back to a projected scan')
      total = 0; suspicious = 0; creditsAwarded = 0
      totalSuspiciousScore = 0; creditsAwardedToSuspicious = 0

      const projected = await tracking
        .select('creditsAwarded', 'suspiciousScore', 'creditsReduced')
        .get()

      projected.forEach(doc => {
        const awarded = doc.get('creditsAwarded') || 0
        total++
        creditsAwarded += awarded
        totalSuspiciousScore += doc.get('suspiciousScore') || 0
        if (doc.get('creditsReduced')) {
          suspicious++
          creditsAwardedToSuspicious += awarded
        }
      })
    }

    // Same arithmetic as the old per-document loop: sum(DEFAULT - awarded)
    // across the reduced set.
    const creditsSaved =
      suspicious * TRACKING_CONFIG.DEFAULT_CREDITS - creditsAwardedToSuspicious

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

