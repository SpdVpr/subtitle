import { NextRequest, NextResponse } from 'next/server'
import { getAdminDb } from '@/lib/firebase-admin'
import { TRACKING_CONFIG } from '@/lib/registration-tracking'
import { requireAdmin } from '@/lib/admin-auth-server'

export async function GET(request: NextRequest) {
  try {
    const auth = await requireAdmin(request)
    if ('response' in auth) return auth.response

    const days = Math.min(365, Math.max(1, Number(new URL(request.url).searchParams.get('days') || 30)))
    const cutoff = new Date(Date.now() - days * 86400000)
    const snapshot = await getAdminDb().collection('registration_tracking')
      .where('createdAt', '>=', cutoff)
      .select(
        'userId', 'email', 'createdAt', 'suspiciousScore', 'duplicateIpCount',
        'duplicateFingerprintCount', 'registrationMethod', 'creditsAwarded', 'creditsReduced'
      )
      .get()

    const all = snapshot.docs.map((doc) => {
      const data = doc.data()
      return {
        id: doc.id,
        ...data,
        createdAt: data.createdAt?.toDate?.()?.toISOString() || null,
      }
    })
    const suspiciousRows = all
      .filter((row: any) => Number(row.suspiciousScore || 0) >= TRACKING_CONFIG.SUSPICIOUS_THRESHOLD)
      .sort((a: any, b: any) => Number(b.suspiciousScore || 0) - Number(a.suspiciousScore || 0))
    const suspicious = suspiciousRows.length
    const totalScore = all.reduce((sum: number, row: any) => sum + Number(row.suspiciousScore || 0), 0)

    return NextResponse.json({
      success: true,
      periodDays: days,
      registrations: suspiciousRows.slice(0, 100),
      stats: {
        total: all.length,
        suspicious,
        creditsAwarded: all.length - suspicious, // legacy field: eligible free trials
        creditsSaved: suspicious, // legacy field: restricted free trials
        averageSuspiciousScore: all.length ? totalScore / all.length : 0,
      },
    })
  } catch (error) {
    console.error('Error fetching registration monitoring data:', error)
    return NextResponse.json({ error: 'Failed to fetch registration monitoring data', success: false }, { status: 500 })
  }
}
