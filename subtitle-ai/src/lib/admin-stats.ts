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
          creditsBalance: (user as any).creditsBalance || 0
        }
      }).sort((a, b) => b.lastActive.getTime() - a.lastActive.getTime())
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
