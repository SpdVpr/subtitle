import { NextRequest, NextResponse } from 'next/server'
import { AdminStatsService } from '@/lib/admin-stats'
import { requireAdmin } from '@/lib/admin-auth-server'

export async function GET(req: NextRequest) {
  try {
    const auth = await requireAdmin(req)
    if ('response' in auth) return auth.response

    // Get statistics
    const stats = await AdminStatsService.getOverallStats()

    return NextResponse.json({
      success: true,
      data: stats
    })

  } catch (error) {
    console.error('Admin stats error:', error)

    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to get admin stats'
    }, { status: 500 })
  }
}
