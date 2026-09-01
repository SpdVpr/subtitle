import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/admin-auth-server'
import { getAdminDb } from '@/lib/firebase-admin'

const asDate = (value: any): Date | null => {
  if (!value) return null
  if (typeof value.toDate === 'function') return value.toDate()
  const parsed = new Date(value)
  return Number.isNaN(parsed.getTime()) ? null : parsed
}

function packageRevenue(credits: number): number {
  if (credits === 100) return 1
  if (credits === 500) return 5
  if (credits === 1200) return 10
  if (credits === 2500) return 20
  return 0
}

export async function GET(req: NextRequest) {
  try {
    const auth = await requireAdmin(req)
    if ('response' in auth) return auth.response

    const db = getAdminDb()
    const [usersSnap, jobsSnap, purchasesSnap] = await Promise.all([
      db.collection('users').select('createdAt', 'usage').get(),
      db.collection('translation_jobs')
        .select('status', 'completedAt', 'createdAt', 'processingTimeMs', 'aiService')
        .get(),
      db.collection('creditTransactions')
        .select('userId', 'createdAt', 'credits', 'description', 'amountPaid', 'currency')
        .get(),
    ])

    const now = new Date()
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
    const weekAgo = new Date(now.getTime() - 7 * 86400000)
    const monthAgo = new Date(now.getTime() - 30 * 86400000)
    const users = usersSnap.docs.map((doc) => doc.data())
    const jobs = jobsSnap.docs.map((doc) => doc.data())
    const completedJobs = jobs.filter((job) => job.status === 'completed')
    const failedJobs = jobs.filter((job) => job.status === 'failed')
    const purchaseTransactions = purchasesSnap.docs
      .map((doc) => doc.data())
      .filter((purchase) => /^Purchased \d+ credits - /.test(purchase.description || '') && !/simulated/i.test(purchase.description || ''))

    const revenueOf = (purchase: any) => {
      if (Number(purchase.amountPaid) > 0 && String(purchase.currency || 'usd').toLowerCase() === 'usd') {
        return Number(purchase.amountPaid) / 100
      }
      return packageRevenue(Number(purchase.credits || 0))
    }

    const buyerCounts = new Map<string, number>()
    purchaseTransactions.forEach((purchase) => {
      if (purchase.userId) buyerCounts.set(purchase.userId, (buyerCounts.get(purchase.userId) || 0) + 1)
    })
    const buyers = buyerCounts.size
    const repeatBuyers = [...buyerCounts.values()].filter((count) => count > 1).length

    const completedAt = (job: any) => asDate(job.completedAt) || asDate(job.createdAt)
    const processingTimes = completedJobs
      .map((job) => Number(job.processingTimeMs || 0))
      .filter((value) => value > 0)
    const averageTranslationTime = processingTimes.length
      ? Math.round(processingTimes.reduce((sum, value) => sum + value, 0) / processingTimes.length / 100) / 10
      : 0
    const attempted = completedJobs.length + failedJobs.length

    const googleJobs = completedJobs.filter((job) => ['google', 'gemini'].includes(job.aiService)).length
    const legacyJobs = completedJobs.filter((job) => job.aiService === 'openai').length
    const premiumJobs = completedJobs.filter((job) => job.aiService === 'premium').length

    const data = {
      totalUsers: users.length,
      activeUsers: users.filter((user) => {
        const lastActive = asDate(user.usage?.lastActive)
        return lastActive && lastActive >= weekAgo
      }).length,
      newUsersToday: users.filter((user) => (asDate(user.createdAt)?.getTime() || 0) >= today.getTime()).length,
      newUsersThisWeek: users.filter((user) => (asDate(user.createdAt)?.getTime() || 0) >= weekAgo.getTime()).length,
      newUsersThisMonth: users.filter((user) => (asDate(user.createdAt)?.getTime() || 0) >= monthAgo.getTime()).length,
      freeUsers: Math.max(0, users.length - buyers),
      premiumUsers: buyers,
      proUsers: repeatBuyers,
      totalRevenue: Math.round(purchaseTransactions.reduce((sum, purchase) => sum + revenueOf(purchase), 0) * 100) / 100,
      monthlyRevenue: Math.round(purchaseTransactions
        .filter((purchase) => (asDate(purchase.createdAt)?.getTime() || 0) >= monthAgo.getTime())
        .reduce((sum, purchase) => sum + revenueOf(purchase), 0) * 100) / 100,
      totalTranslations: completedJobs.length,
      translationsToday: completedJobs.filter((job) => (completedAt(job)?.getTime() || 0) >= today.getTime()).length,
      translationsThisWeek: completedJobs.filter((job) => (completedAt(job)?.getTime() || 0) >= weekAgo.getTime()).length,
      translationsThisMonth: completedJobs.filter((job) => (completedAt(job)?.getTime() || 0) >= monthAgo.getTime()).length,
      googleTranslateUsage: googleJobs,
      openaiUsage: legacyJobs,
      premiumAiUsage: premiumJobs,
      averageTranslationTime,
      successRate: attempted ? Math.round(completedJobs.length / attempted * 1000) / 10 : 0,
      errorRate: attempted ? Math.round(failedJobs.length / attempted * 1000) / 10 : 0,
    }

    return NextResponse.json({ success: true, data })
  } catch (error) {
    console.error('Admin stats error:', error)
    return NextResponse.json({ success: false, error: 'Failed to get admin stats' }, { status: 500 })
  }
}
