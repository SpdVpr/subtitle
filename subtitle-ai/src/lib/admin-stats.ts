import { UserService } from './database'

export interface AdminStats {
  // User Statistics
  totalUsers: number
  activeUsers: number
  newUsersToday: number
  newUsersThisWeek: number
  newUsersThisMonth: number
  
  // Subscription Statistics
  freeUsers: number
  premiumUsers: number
  proUsers: number
  totalRevenue: number
  monthlyRevenue: number
  
  // Translation Statistics
  totalTranslations: number
  translationsToday: number
  translationsThisWeek: number
  translationsThisMonth: number
  
  // Service Usage
  googleTranslateUsage: number
  openaiUsage: number
  premiumAiUsage: number
  
  // Performance Metrics
  averageTranslationTime: number
  successRate: number
  errorRate: number
}

export interface UserActivity {
  userId: string
  email: string
  plan: string
  lastActive: Date
  translationsCount: number
  creditsBalance?: number
}

export interface RevenueData {
  date: string
  amount: number
  plan: string
  userId: string
}

import { db } from './firebase'
import { collection, getDocs, query, where, orderBy, Timestamp } from 'firebase/firestore'

export class AdminStatsService {

  static async getOverallStats(): Promise<AdminStats> {
    try {
      // Try to get users via server-side API first
      let users: any[] = []

      try {
        const adminEmail = typeof window !== 'undefined' ? localStorage.getItem('adminEmail') || '' : ''
        const response = await fetch('/api/admin/users', {
          headers: { 'x-admin-email': adminEmail }
        })

        if (response.ok) {
          const data = await response.json()
          users = data.users || []
          console.log('📊 Admin Stats - Got users from API:', users.length)
        } else {
          throw new Error('API failed, falling back to direct query')
        }
      } catch (apiError) {
        console.log('⚠️ API failed, trying direct Firestore query...')
        // Fallback to direct query
        const directUsers = await UserService.getAllUsers()
        users = directUsers.map(u => ({
          userId: u.uid,
          email: u.email,
          plan: u.subscriptionPlan || 'free',
          translationsCount: u.usage?.translationsUsed || 0,
          creditsBalance: (u as any).creditsBalance || 0,
          lastActive: u.updatedAt || u.createdAt
        }))
        console.log('📊 Admin Stats - Found users via direct query:', users.length)
      }

      // If no users exist, create demo users for testing
      if (users.length === 0) {
        console.log('👥 No users found, creating demo users...')
        await AdminStatsService.createDemoUsers()
        // Re-fetch users after creating demo data
        const updatedUsers = await UserService.getAllUsers()
        console.log('👥 After creating demo users:', updatedUsers.length)
        return AdminStatsService.calculateStatsFromUsers(updatedUsers.map(u => ({
          userId: u.uid,
          email: u.email,
          plan: u.subscriptionPlan || 'free',
          translationsCount: u.usage?.translationsUsed || 0,
          creditsBalance: (u as any).creditsBalance || 0,
          lastActive: u.updatedAt || u.createdAt
        })))
      }
      const now = new Date()
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
      const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000)
      const monthAgo = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000)
      
      // Calculate user statistics
      const totalUsers = users.length
      const activeUsers = users.filter(user => {
        const lastActive = (user as any).lastLoginAt || user.createdAt
        const lastActiveDate = lastActive?.toDate ? lastActive.toDate() : lastActive
        return lastActiveDate && (now.getTime() - lastActiveDate.getTime()) < 7 * 24 * 60 * 60 * 1000
      }).length
      
      const newUsersToday = users.filter(user => {
        const createdAt = user.createdAt?.toDate ? user.createdAt.toDate() : user.createdAt
        return createdAt && createdAt >= today
      }).length

      const newUsersThisWeek = users.filter(user => {
        const createdAt = user.createdAt?.toDate ? user.createdAt.toDate() : user.createdAt
        return createdAt && createdAt >= weekAgo
      }).length

      const newUsersThisMonth = users.filter(user => {
        const createdAt = user.createdAt?.toDate ? user.createdAt.toDate() : user.createdAt
        return createdAt && createdAt >= monthAgo
      }).length
      
      // Calculate subscription statistics
      const freeUsers = users.filter(user => (user.subscriptionPlan || 'free') === 'free').length
      const premiumUsers = users.filter(user => user.subscriptionPlan === 'premium').length
      const proUsers = users.filter(user => user.subscriptionPlan === 'pro').length
      
      // Calculate revenue (mock data for now)
      const totalRevenue = premiumUsers * 9.99 + proUsers * 19.99
      const monthlyRevenue = totalRevenue // Simplified for demo
      
      // Calculate translation statistics
      const totalTranslations = users.reduce((sum, user) => sum + (user.usage?.translationsUsed || 0), 0)
      const translationsToday = Math.floor(totalTranslations * 0.1) // 10% today
      const translationsThisWeek = Math.floor(totalTranslations * 0.3) // 30% this week
      const translationsThisMonth = Math.floor(totalTranslations * 0.7) // 70% this month
      
      // Service usage (mock data)
      const googleTranslateUsage = Math.floor(totalTranslations * 0.6) // 60% Google
      const openaiUsage = Math.floor(totalTranslations * 0.25) // 25% OpenAI
      const premiumAiUsage = Math.floor(totalTranslations * 0.15) // 15% Premium
      
      return AdminStatsService.calculateStatsFromUsers(users)
    } catch (error) {
      console.error('Failed to get admin stats:', error)
      throw error
    }
  }

  private static calculateStatsFromUsers(users: any[]): AdminStats {
    const now = new Date()
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
    const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000)
    const monthAgo = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000)

    // Calculate user statistics
    const totalUsers = users.length
    const activeUsers = users.filter(user => {
      const lastActive = (user as any).lastLoginAt || user.createdAt
      const lastActiveDate = lastActive?.toDate ? lastActive.toDate() : lastActive
      return lastActiveDate && (now.getTime() - lastActiveDate.getTime()) < 7 * 24 * 60 * 60 * 1000
    }).length

    const newUsersToday = users.filter(user => {
      const createdAt = user.createdAt?.toDate ? user.createdAt.toDate() : user.createdAt
      return createdAt && createdAt >= today
    }).length

    const newUsersThisWeek = users.filter(user => {
      const createdAt = user.createdAt?.toDate ? user.createdAt.toDate() : user.createdAt
      return createdAt && createdAt >= weekAgo
    }).length

    const newUsersThisMonth = users.filter(user => {
      const createdAt = user.createdAt?.toDate ? user.createdAt.toDate() : user.createdAt
      return createdAt && createdAt >= monthAgo
    }).length

    // Calculate user statistics by credits
    const usersWithCredits = users.filter(user => (user as any).creditsBalance > 0).length
    const usersWithoutCredits = users.filter(user => ((user as any).creditsBalance || 0) === 0).length
    const totalCreditsInSystem = users.reduce((sum, user) => sum + ((user as any).creditsBalance || 0), 0)

    // Calculate revenue from credit purchases (simplified)
    const totalRevenue = users.reduce((sum, user) => sum + (((user as any).creditsTotalPurchased || 0) / 100), 0)
    const monthlyRevenue = totalRevenue * 0.3 // Assume 30% was this month

    // Calculate translation statistics
    const totalTranslations = users.reduce((sum, user) => sum + (user.usage?.translationsUsed || 0), 0)
    const translationsToday = Math.floor(totalTranslations * 0.1) // 10% today
    const translationsThisWeek = Math.floor(totalTranslations * 0.3) // 30% this week
    const translationsThisMonth = Math.floor(totalTranslations * 0.7) // 70% this month

    // Service usage (mock data)
    const googleTranslateUsage = Math.floor(totalTranslations * 0.6) // 60% Google
    const openaiUsage = Math.floor(totalTranslations * 0.25) // 25% OpenAI
    const premiumAiUsage = Math.floor(totalTranslations * 0.15) // 15% Premium

    return {
      totalUsers,
      activeUsers,
      newUsersToday,
      newUsersThisWeek,
      newUsersThisMonth,
      freeUsers: usersWithoutCredits,
      premiumUsers: usersWithCredits,
      proUsers: Math.floor(usersWithCredits * 0.3), // Estimate heavy users
      totalRevenue,
      monthlyRevenue,
      totalTranslations,
      translationsToday,
      translationsThisWeek,
      translationsThisMonth,
      googleTranslateUsage,
      openaiUsage,
      premiumAiUsage,
      averageTranslationTime: 8.5, // seconds
      successRate: 98.2, // percentage
      errorRate: 1.8 // percentage
    }
  }

  private static async createDemoUsers(): Promise<void> {
    try {
      const demoUsers = [
        {
          uid: 'active-user-demo',
          email: 'active@test.com',
          displayName: 'Active User',
          creditsBalance: 150.0,
          creditsTotalPurchased: 500.0,
          usage: { translationsUsed: 25, translationsLimit: -1, storageUsed: 1024, storageLimit: 100 * 1024 * 1024, batchJobsUsed: 5, batchJobsLimit: -1, resetDate: new Date() }
        },
        {
          uid: 'power-user-demo',
          email: 'power@test.com',
          displayName: 'Power User',
          creditsBalance: 75.0,
          creditsTotalPurchased: 1000.0,
          usage: { translationsUsed: 50, translationsLimit: -1, storageUsed: 2048, storageLimit: 100 * 1024 * 1024, batchJobsUsed: 10, batchJobsLimit: -1, resetDate: new Date() }
        },
        {
          uid: 'new-user-demo',
          email: 'newbie@test.com',
          displayName: 'New User',
          creditsBalance: 200.0,
          creditsTotalPurchased: 200.0,
          usage: { translationsUsed: 3, translationsLimit: -1, storageUsed: 512, storageLimit: 100 * 1024 * 1024, batchJobsUsed: 0, batchJobsLimit: -1, resetDate: new Date() }
        }
      ]

      for (const user of demoUsers) {
        await UserService.createOrUpdateUser(user.uid, user as any)
      }
    } catch (error) {
      console.error('Failed to create demo users:', error)
    }
  }
  
  static async getUserActivity(): Promise<UserActivity[]> {
    try {
      // Try to get users via server-side API first
      try {
        const adminEmail = typeof window !== 'undefined' ? localStorage.getItem('adminEmail') || '' : ''
        const response = await fetch('/api/admin/users', {
          headers: { 'x-admin-email': adminEmail }
        })

        if (response.ok) {
          const data = await response.json()
          const users = data.users || []
          console.log('👥 User Activity - Got users from API:', users.length)

          return users.map((user: any) => ({
            userId: user.userId,
            email: user.email,
            plan: user.plan,
            lastActive: user.lastActive?.toDate ? user.lastActive.toDate() : new Date(user.lastActive || Date.now()),
            translationsCount: user.translationsCount,
            creditsBalance: user.creditsBalance
          })).sort((a: any, b: any) => b.lastActive.getTime() - a.lastActive.getTime())
        } else {
          throw new Error('API failed, falling back to direct query')
        }
      } catch (apiError) {
        console.log('⚠️ User Activity API failed, trying direct query...')
        // Fallback to direct query
        const users = await UserService.getAllUsers()
        console.log('👥 User Activity - Found users via direct query:', users.length)

        return users.map(user => {
          const lastActive = (user as any).lastLoginAt || user.createdAt
          const lastActiveDate = lastActive?.toDate ? lastActive.toDate() : lastActive || new Date()
          const plan = user.subscriptionPlan || 'free'

          return {
            userId: user.uid,
            email: user.email || 'Unknown',
            plan,
            lastActive: lastActiveDate,
            translationsCount: user.usage?.translationsUsed || 0,
            creditsBalance: (user as any).creditsBalance || 0
          }
        }).sort((a, b) => b.lastActive.getTime() - a.lastActive.getTime())
      }
    } catch (error) {
      console.error('Failed to get user activity:', error)
      throw error
    }
  }

  static async getRevenueData(): Promise<RevenueData[]> {
    try {
      if (!db) return []
      const now = new Date()
      const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
      const qRef = query(
        collection(db, 'creditTransactions'),
        where('type', '==', 'topup'),
        orderBy('createdAt', 'desc')
      )
      const snapshot = await getDocs(qRef)
      const revenueMap = new Map<string, number>()
      const data: RevenueData[] = []
      snapshot.forEach(docSnap => {
        const d: any = docSnap.data()
        const createdAt = d.createdAt?.toDate ? d.createdAt.toDate() : new Date()
        if (createdAt < thirtyDaysAgo) return
        const dateStr = createdAt.toISOString().split('T')[0]
        const amount = typeof d.amountUSD === 'number' ? d.amountUSD : (d.credits ? d.credits / 100 : 0)
        revenueMap.set(dateStr, (revenueMap.get(dateStr) || 0) + amount)
        data.push({ date: dateStr, amount, plan: 'topup', userId: d.userId })
      })
      return data
    } catch (error) {
      console.error('Failed to get revenue data:', error)
      return []
    }
  }
}
