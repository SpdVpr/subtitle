'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { RevenueData } from '@/lib/admin-stats'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts'

interface RevenueChartProps {
  revenueData: RevenueData[]
  stats: any
}

export function RevenueChart({ revenueData, stats }: RevenueChartProps) {
  // Aggregate daily revenue
  const dailyRevenue = revenueData.reduce((acc, item) => {
    const date = item.date
    if (!acc[date]) {
      acc[date] = 0
    }
    acc[date] += item.amount
    return acc
  }, {} as Record<string, number>)

  const chartData = Object.entries(dailyRevenue)
    .map(([date, amount]) => ({
      date: new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      amount: Math.round(amount * 100) / 100
    }))
    .slice(-14) // Last 14 days

  // Subscription distribution data
  const subscriptionData = [
    { name: 'Free', value: stats.freeUsers, color: '#94a3b8' },
    { name: 'Premium', value: stats.premiumUsers, color: '#3b82f6' },
    { name: 'Pro', value: stats.proUsers, color: '#8b5cf6' }
  ]

  // Service usage data
  const serviceData = [
    { name: 'Google Translate', value: stats.googleTranslateUsage, color: '#10b981' },
    { name: 'Google Gemini', value: stats.openaiUsage, color: '#f59e0b' },
    { name: 'Premium AI', value: stats.premiumAiUsage, color: '#8b5cf6' }
  ]

  return (
    <div className="grid gap-3 sm:gap-4 grid-cols-1 lg:grid-cols-2">
      {/* Daily Revenue Chart */}
      <Card className="lg:col-span-2">
        <CardHeader className="pb-3 sm:pb-6">
          <CardTitle className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-foreground">Daily Revenue (Last 14 Days)</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[250px] sm:h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 10, right: 15, left: 10, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
                <XAxis
                  dataKey="date"
                  tick={{ fontSize: 10 }}
                  stroke="#6b7280"
                  className="text-xs sm:text-sm"
                />
                <YAxis
                  tick={{ fontSize: 10 }}
                  stroke="#6b7280"
                  className="text-xs sm:text-sm"
                />
                <Tooltip
                  formatter={(value) => [`$${value}`, 'Revenue']}
                  labelStyle={{ color: '#374151', fontSize: '12px' }}
                  contentStyle={{
                    backgroundColor: '#ffffff',
                    border: '1px solid #e5e7eb',
                    borderRadius: '8px',
                    fontSize: '12px'
                  }}
                />
                <Bar dataKey="amount" fill="#3b82f6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Subscription Distribution */}
      <Card className="hover:shadow-md transition-shadow">
        <CardHeader className="pb-3 sm:pb-6">
          <CardTitle className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-foreground">User Distribution</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[200px] sm:h-[250px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={subscriptionData}
                  cx="50%"
                  cy="50%"
                  innerRadius={30}
                  outerRadius={60}
                  paddingAngle={3}
                  dataKey="value"
                >
                  {subscriptionData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(value) => [value, 'Users']}
                  contentStyle={{
                    backgroundColor: '#ffffff',
                    border: '1px solid #e5e7eb',
                    borderRadius: '8px',
                    fontSize: '12px'
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="flex flex-wrap justify-center gap-2 sm:gap-3 mt-3 sm:mt-4">
            {subscriptionData.map((item, index) => (
              <div key={index} className="flex items-center space-x-1 sm:space-x-2">
                <div
                  className="w-2 h-2 sm:w-3 sm:h-3 rounded-full flex-shrink-0"
                  style={{ backgroundColor: item.color }}
                />
                <span className="text-xs sm:text-sm text-gray-600 dark:text-muted-foreground">
                  {item.name} ({item.value})
                </span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Service Usage */}
      <Card className="hover:shadow-md transition-shadow">
        <CardHeader className="pb-3 sm:pb-6">
          <CardTitle className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-foreground">Service Usage</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[200px] sm:h-[250px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={serviceData}
                  cx="50%"
                  cy="50%"
                  innerRadius={30}
                  outerRadius={60}
                  paddingAngle={3}
                  dataKey="value"
                >
                  {serviceData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(value) => [value, 'Translations']}
                  contentStyle={{
                    backgroundColor: '#ffffff',
                    border: '1px solid #e5e7eb',
                    borderRadius: '8px',
                    fontSize: '12px'
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="flex flex-wrap justify-center gap-2 sm:gap-3 mt-3 sm:mt-4">
            {serviceData.map((item, index) => (
              <div key={index} className="flex items-center space-x-1 sm:space-x-2">
                <div
                  className="w-2 h-2 sm:w-3 sm:h-3 rounded-full flex-shrink-0"
                  style={{ backgroundColor: item.color }}
                />
                <span className="text-xs sm:text-sm text-gray-600 dark:text-muted-foreground">
                  {item.name} ({item.value})
                </span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
