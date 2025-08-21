import { NextRequest, NextResponse } from 'next/server'
import { isAdminEmail } from '@/lib/admin-auth-email'

// Force Node.js runtime for Firebase Admin SDK
export const runtime = 'nodejs'

// Server-side Firebase Admin (bypasses client security rules)
async function getServerFirestore() {
  try {
    const { getAdminDb } = await import('@/lib/firebase-admin')
    return getAdminDb()
  } catch (error) {
    console.warn('⚠️ Admin SDK not configured, using demo mode:', error)
    return null
  }
}

export async function GET(req: NextRequest) {
  try {
    // Check admin authentication
    const adminEmail = req.headers.get('x-admin-email')
    if (!adminEmail || !isAdminEmail(adminEmail)) {
      return NextResponse.json({ 
        error: 'Admin access required',
        debug: { receivedEmail: adminEmail, isValidAdmin: adminEmail ? isAdminEmail(adminEmail) : false }
      }, { status: 403 })
    }

    console.log('📊 Getting voucher statistics:', { adminEmail })

    // Get Firestore instance
    const db = await getServerFirestore()
    const isDemoMode = !db

    if (isDemoMode) {
      return getDemoStats()
    }

    const stats = {
      overview: {
        totalVouchers: 0,
        activeVouchers: 0,
        expiredVouchers: 0,
        usedVouchers: 0,
        totalCreditsGenerated: 0,
        totalCreditsRedeemed: 0,
        redemptionRate: 0
      },
      campaigns: [] as any[],
      recentActivity: [] as any[],
      topCampaigns: [] as any[]
    }

    if (db.collection) {
      // Admin SDK
      // Get all vouchers
      const vouchersSnapshot = await db.collection('vouchers').get()
      const now = new Date()
      const campaignStats = new Map()

      vouchersSnapshot.forEach((doc: any) => {
        const data = doc.data()
        const isExpired = data.expiresAt && now > data.expiresAt.toDate()
        const isUsed = data.usedCount >= data.usageLimit
        
        stats.overview.totalVouchers++
        stats.overview.totalCreditsGenerated += data.creditAmount
        stats.overview.totalCreditsRedeemed += data.usedCount * data.creditAmount
        
        if (data.isActive && !isExpired && !isUsed) {
          stats.overview.activeVouchers++
        }
        if (isExpired) {
          stats.overview.expiredVouchers++
        }
        if (isUsed) {
          stats.overview.usedVouchers++
        }

        // Campaign statistics
        const campaign = data.campaignName
        if (!campaignStats.has(campaign)) {
          campaignStats.set(campaign, {
            name: campaign,
            totalVouchers: 0,
            activeVouchers: 0,
            usedVouchers: 0,
            expiredVouchers: 0,
            totalCredits: 0,
            redeemedCredits: 0,
            redemptionRate: 0,
            createdBy: data.createdBy,
            createdAt: data.createdAt?.toDate?.() || data.createdAt
          })
        }
        
        const campaignStat = campaignStats.get(campaign)
        campaignStat.totalVouchers++
        campaignStat.totalCredits += data.creditAmount
        campaignStat.redeemedCredits += data.usedCount * data.creditAmount
        
        if (data.isActive && !isExpired && !isUsed) campaignStat.activeVouchers++
        if (isExpired) campaignStat.expiredVouchers++
        if (isUsed) campaignStat.usedVouchers++
      })

      // Calculate redemption rates
      stats.overview.redemptionRate = stats.overview.totalVouchers > 0 
        ? (stats.overview.usedVouchers / stats.overview.totalVouchers) * 100 
        : 0

      // Process campaign stats
      stats.campaigns = Array.from(campaignStats.values()).map(campaign => ({
        ...campaign,
        redemptionRate: campaign.totalVouchers > 0 
          ? (campaign.usedVouchers / campaign.totalVouchers) * 100 
          : 0
      }))

      // Sort campaigns by total credits generated
      stats.topCampaigns = [...stats.campaigns]
        .sort((a, b) => b.totalCredits - a.totalCredits)
        .slice(0, 10)

      // Get recent voucher activity
      const activitySnapshot = await db.collection('voucherActivity')
        .orderBy('timestamp', 'desc')
        .limit(20)
        .get()

      activitySnapshot.forEach((doc: any) => {
        const data = doc.data()
        stats.recentActivity.push({
          id: doc.id,
          ...data,
          timestamp: data.timestamp?.toDate?.() || data.timestamp
        })
      })

    } else {
      // Client SDK fallback
      const { collection, getDocs, query, orderBy, limit } = await import('firebase/firestore')
      const { db: clientDb } = await import('@/lib/firebase')
      
      // Get all vouchers
      const vouchersSnapshot = await getDocs(collection(clientDb, 'vouchers'))
      const now = new Date()
      const campaignStats = new Map()

      vouchersSnapshot.forEach((doc) => {
        const data = doc.data()
        const isExpired = data.expiresAt && now > data.expiresAt.toDate()
        const isUsed = data.usedCount >= data.usageLimit
        
        stats.overview.totalVouchers++
        stats.overview.totalCreditsGenerated += data.creditAmount
        stats.overview.totalCreditsRedeemed += data.usedCount * data.creditAmount
        
        if (data.isActive && !isExpired && !isUsed) {
          stats.overview.activeVouchers++
        }
        if (isExpired) {
          stats.overview.expiredVouchers++
        }
        if (isUsed) {
          stats.overview.usedVouchers++
        }

        // Campaign statistics
        const campaign = data.campaignName
        if (!campaignStats.has(campaign)) {
          campaignStats.set(campaign, {
            name: campaign,
            totalVouchers: 0,
            activeVouchers: 0,
            usedVouchers: 0,
            expiredVouchers: 0,
            totalCredits: 0,
            redeemedCredits: 0,
            redemptionRate: 0,
            createdBy: data.createdBy,
            createdAt: data.createdAt?.toDate?.() || data.createdAt
          })
        }
        
        const campaignStat = campaignStats.get(campaign)
        campaignStat.totalVouchers++
        campaignStat.totalCredits += data.creditAmount
        campaignStat.redeemedCredits += data.usedCount * data.creditAmount
        
        if (data.isActive && !isExpired && !isUsed) campaignStat.activeVouchers++
        if (isExpired) campaignStat.expiredVouchers++
        if (isUsed) campaignStat.usedVouchers++
      })

      // Calculate redemption rates
      stats.overview.redemptionRate = stats.overview.totalVouchers > 0 
        ? (stats.overview.usedVouchers / stats.overview.totalVouchers) * 100 
        : 0

      // Process campaign stats
      stats.campaigns = Array.from(campaignStats.values()).map(campaign => ({
        ...campaign,
        redemptionRate: campaign.totalVouchers > 0 
          ? (campaign.usedVouchers / campaign.totalVouchers) * 100 
          : 0
      }))

      // Sort campaigns by total credits generated
      stats.topCampaigns = [...stats.campaigns]
        .sort((a, b) => b.totalCredits - a.totalCredits)
        .slice(0, 10)

      // Get recent voucher activity
      const activityQuery = query(
        collection(clientDb, 'voucherActivity'),
        orderBy('timestamp', 'desc'),
        limit(20)
      )
      const activitySnapshot = await getDocs(activityQuery)

      activitySnapshot.forEach((doc) => {
        const data = doc.data()
        stats.recentActivity.push({
          id: doc.id,
          ...data,
          timestamp: data.timestamp?.toDate?.() || data.timestamp
        })
      })
    }

    return NextResponse.json({
      success: true,
      stats
    })

  } catch (error: any) {
    console.error('Voucher statistics error:', error)
    return NextResponse.json({
      error: error?.message || 'Failed to get voucher statistics'
    }, { status: 500 })
  }
}

// Demo mode statistics
function getDemoStats() {
  console.log('🧪 Demo mode: Returning sample statistics')

  const demoStats = {
    overview: {
      totalVouchers: 3,
      activeVouchers: 2,
      expiredVouchers: 0,
      usedVouchers: 1,
      totalCreditsGenerated: 400,
      totalCreditsRedeemed: 50,
      redemptionRate: 33.3
    },
    campaigns: [
      {
        name: 'Demo Campaign',
        totalVouchers: 1,
        activeVouchers: 1,
        usedVouchers: 0,
        expiredVouchers: 0,
        totalCredits: 100,
        redeemedCredits: 0,
        redemptionRate: 0,
        createdBy: 'demo@admin.com',
        createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000)
      },
      {
        name: 'Used Demo',
        totalVouchers: 1,
        activeVouchers: 0,
        usedVouchers: 1,
        expiredVouchers: 0,
        totalCredits: 50,
        redeemedCredits: 50,
        redemptionRate: 100,
        createdBy: 'demo@admin.com',
        createdAt: new Date(Date.now() - 48 * 60 * 60 * 1000)
      },
      {
        name: 'Welcome Bonus',
        totalVouchers: 1,
        activeVouchers: 1,
        usedVouchers: 0,
        expiredVouchers: 0,
        totalCredits: 250,
        redeemedCredits: 0,
        redemptionRate: 0,
        createdBy: 'demo@admin.com',
        createdAt: new Date(Date.now() - 72 * 60 * 60 * 1000)
      }
    ],
    recentActivity: [
      {
        id: 'demo-activity-1',
        type: 'redemption',
        voucherCode: 'DEMO-USED-CODE',
        userId: 'demo-user-1',
        creditAmount: 50,
        campaignName: 'Used Demo',
        timestamp: new Date(Date.now() - 12 * 60 * 60 * 1000)
      },
      {
        id: 'demo-activity-2',
        type: 'generation',
        campaignName: 'Welcome Bonus',
        quantity: 1,
        creditAmount: 250,
        totalCreditsGenerated: 250,
        timestamp: new Date(Date.now() - 72 * 60 * 60 * 1000)
      }
    ],
    topCampaigns: [
      {
        name: 'Welcome Bonus',
        totalCredits: 250,
        redemptionRate: 0
      },
      {
        name: 'Demo Campaign',
        totalCredits: 100,
        redemptionRate: 0
      },
      {
        name: 'Used Demo',
        totalCredits: 50,
        redemptionRate: 100
      }
    ]
  }

  return NextResponse.json({
    success: true,
    demoMode: true,
    stats: demoStats,
    message: 'Demo mode: Sample statistics (Database not connected)'
  })
}
