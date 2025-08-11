import { NextRequest, NextResponse } from 'next/server'
import { AdminStatsService } from '@/lib/admin-stats'

export async function GET(req: NextRequest) {
  try {
    // For demo purposes, we'll skip authentication
    // In production, you would verify admin access here

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
