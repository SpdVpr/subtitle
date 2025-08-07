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
  totalSpent: number
}

export interface RevenueData {
  date: string
  amount: number
  plan: string
  userId: string
}

export class AdminStatsService {
  
  static async getOverallStats(): Promise<AdminStats> {
    try {
      // Get all users
      const users = await UserService.getAllUsers()
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
      
      return {
        totalUsers,
        activeUsers,
        newUsersToday,
        newUsersThisWeek,
        newUsersThisMonth,
        freeUsers,
        premiumUsers,
        proUsers,
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
    } catch (error) {
      console.error('Failed to get admin stats:', error)
      throw error
    }
  }
  
  static async getUserActivity(): Promise<UserActivity[]> {
    try {
      const users = await UserService.getAllUsers()
      
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
          totalSpent: plan === 'premium' ? 9.99 : plan === 'pro' ? 19.99 : 0
        }
      }).sort((a, b) => b.lastActive.getTime() - a.lastActive.getTime())
    } catch (error) {
      console.error('Failed to get user activity:', error)
      throw error
    }
  }
  
  static async getRevenueData(): Promise<RevenueData[]> {
    try {
      const users = await UserService.getAllUsers()
      const revenueData: RevenueData[] = []
      
      // Generate mock revenue data for the last 30 days
      const now = new Date()
      for (let i = 29; i >= 0; i--) {
        const date = new Date(now.getTime() - i * 24 * 60 * 60 * 1000)
        const dateStr = date.toISOString().split('T')[0]
        
        // Mock daily revenue
        const dailyPremium = Math.floor(Math.random() * 5) // 0-4 premium subscriptions
        const dailyPro = Math.floor(Math.random() * 3) // 0-2 pro subscriptions
        
        if (dailyPremium > 0) {
          revenueData.push({
            date: dateStr,
            amount: dailyPremium * 9.99,
            plan: 'premium',
            userId: 'mock-user-' + i
          })
        }
        
        if (dailyPro > 0) {
          revenueData.push({
            date: dateStr,
            amount: dailyPro * 19.99,
            plan: 'pro',
            userId: 'mock-user-' + i
          })
        }
      }
      
      return revenueData
    } catch (error) {
      console.error('Failed to get revenue data:', error)
      throw error
    }
  }
}
