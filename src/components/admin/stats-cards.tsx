'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { AdminStats } from '@/lib/admin-stats'
import { Users, DollarSign, FileText, TrendingUp, Activity, Zap } from 'lucide-react'

interface StatsCardsProps {
  stats: AdminStats
}

export function StatsCards({ stats }: StatsCardsProps) {
  const cards = [
    {
      title: 'Total Users',
      value: stats.totalUsers.toLocaleString(),
      change: `+${stats.newUsersToday} today`,
      icon: Users,
      color: 'text-blue-600 dark:text-blue-400'
    },
    {
      title: 'Active Users',
      value: stats.activeUsers.toLocaleString(),
      change: `${((stats.activeUsers / stats.totalUsers) * 100).toFixed(1)}% of total`,
      icon: Activity,
      color: 'text-green-600 dark:text-green-400'
    },
    {
      title: 'Monthly Revenue',
      value: `$${stats.monthlyRevenue.toLocaleString()}`,
      change: `$${stats.totalRevenue.toLocaleString()} total`,
      icon: DollarSign,
      color: 'text-emerald-600 dark:text-emerald-400'
    },
    {
      title: 'Files Translated',
      value: stats.totalTranslations.toLocaleString(),
      change: `+${stats.translationsToday} today`,
      icon: FileText,
      color: 'text-purple-600 dark:text-purple-400'
    },
    {
      title: 'Success Rate',
      value: `${stats.successRate}%`,
      change: `${stats.errorRate}% error rate`,
      icon: TrendingUp,
      color: 'text-orange-600 dark:text-orange-400'
    },
    {
      title: 'Avg. Speed',
      value: `${stats.averageTranslationTime}s`,
      change: 'per translation',
      icon: Zap,
      color: 'text-yellow-600 dark:text-yellow-400'
    }
  ]

  return (
    <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
      {cards.map((card, index) => {
        const Icon = card.icon
        return (
          <Card key={index} className="hover:shadow-md transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-700 dark:text-foreground">
                {card.title}
              </CardTitle>
              <Icon className={`h-4 w-4 ${card.color}`} />
            </CardHeader>
            <CardContent>
              <div className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-foreground">{card.value}</div>
              <p className="text-xs text-gray-500 dark:text-muted-foreground mt-1">
                {card.change}
              </p>
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}
