'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useSubscription } from '@/hooks/useSubscription'
import { useAuth } from '@/hooks/useAuth'
import { 
  BarChart3, 
  TrendingUp, 
  Clock, 
  FileText, 
  Languages, 
  Zap,
  Download,
  Calendar,
  Target,
  Award,
  Activity
} from 'lucide-react'

interface AnalyticsData {
  totalTranslations: number
  totalFiles: number
  totalSubtitles: number
  averageProcessingTime: number
  storageUsed: number
  successRate: number
  
  translationsByLanguage: Record<string, number>
  translationsByService: Record<string, number>
  dailyUsage: Array<{
    date: string
    translations: number
    files: number
    processingTime: number
  }>
  
  topLanguages: Array<{
    language: string
    count: number
    percentage: number
  }>
  
  recentActivity: Array<{
    id: string
    type: 'translation' | 'batch' | 'edit'
    description: string
    timestamp: Date
    status: 'success' | 'failed' | 'processing'
  }>
}

export function AnalyticsDashboard() {
  const { user } = useAuth()
  const { subscription } = useSubscription()
  const [period, setPeriod] = useState<'week' | 'month' | 'year'>('month')
  const [loading, setLoading] = useState(true)
  const [data, setData] = useState<AnalyticsData | null>(null)

  useEffect(() => {
    loadAnalytics()
  }, [period, user])

  const loadAnalytics = async () => {
    if (!user) return

    setLoading(true)

    try {
      // Fetch real analytics data from API
      const response = await fetch(`/api/analytics?userId=${user.uid}&period=${period}`)
      if (!response.ok) {
        throw new Error('Failed to fetch analytics data')
      }

      const result = await response.json()
      setData(result.data)
    } catch (error) {
      console.error('Failed to load analytics:', error)

      // Fallback to mock data if API fails
      const mockData: AnalyticsData = {
        totalTranslations: 0,
        totalFiles: 0,
        totalSubtitles: 0,
        averageProcessingTime: 0,
        storageUsed: 0,
        successRate: 0,
      
      translationsByLanguage: {},
      translationsByService: {},
      dailyUsage: [],
      topLanguages: [],
      recentActivity: []
    }

    setData(mockData)
    }

    setLoading(false)
  }

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'translation':
        return <Languages className="h-4 w-4 text-blue-500" />
      case 'batch':
        return <Zap className="h-4 w-4 text-purple-500" />
      case 'edit':
        return <FileText className="h-4 w-4 text-green-500" />
      default:
        return <Activity className="h-4 w-4 text-gray-500" />
    }
  }

  const getStatusBadge = (status: string) => {
    const variants = {
      success: 'default',
      failed: 'destructive',
      processing: 'secondary'
    } as const

    return (
      <Badge variant={variants[status as keyof typeof variants] || 'outline'} className="text-xs">
        {status}
      </Badge>
    )
  }

  if (!user) {
    return (
      <div className="text-center py-8">
        <h2 className="text-xl font-semibold mb-4">Please log in to view analytics</h2>
        <Button onClick={() => window.location.href = '/login'}>
          Log In
        </Button>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="space-y-6">
        {Array.from({ length: 6 }).map((_, i) => (
          <Card key={i}>
            <CardContent className="p-6">
              <div className="animate-pulse space-y-4">
                <div className="h-4 bg-gray-200 dark:bg-muted rounded w-1/4"></div>
                <div className="h-8 bg-gray-200 dark:bg-muted rounded w-1/2"></div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  if (!data) {
    return (
      <div className="text-center py-8">
        <h2 className="text-xl font-semibold mb-4">No analytics data available</h2>
        <p className="text-gray-600">Start using the translation features to see your analytics.</p>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-3 sm:px-4 lg:px-6 xl:px-8 max-w-7xl">
      <div className="space-y-4 sm:space-y-6 lg:space-y-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
          <div className="text-center sm:text-left">
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-foreground">Analytics Dashboard</h1>
            <p className="text-sm sm:text-base text-gray-600 dark:text-muted-foreground mt-2">Track your translation usage and performance</p>
          </div>
          <div className="flex items-center justify-center sm:justify-end space-x-2 sm:space-x-4 w-full sm:w-auto">
            <Select value={period} onValueChange={(value: 'week' | 'month' | 'year') => setPeriod(value)}>
              <SelectTrigger className="w-32 sm:w-36 text-xs sm:text-sm">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="week">Last Week</SelectItem>
                <SelectItem value="month">Last Month</SelectItem>
                <SelectItem value="year">Last Year</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline" size="sm" className="text-xs sm:text-sm">
              <Download className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
              <span className="hidden xs:inline">Export</span>
              <span className="xs:hidden">📊</span>
            </Button>
          </div>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-6">
          <Card className="text-center">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600 dark:text-muted-foreground">Total Translations</CardTitle>
              <Languages className="h-4 w-4 text-blue-500 dark:text-blue-400" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-gray-900 dark:text-foreground">{data.totalTranslations}</div>
              <p className="text-xs text-green-600 dark:text-green-400 mt-1">
                +12% from last {period}
              </p>
            </CardContent>
          </Card>

          <Card className="text-center">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600 dark:text-muted-foreground">Files Processed</CardTitle>
              <FileText className="h-4 w-4 text-green-500 dark:text-green-400" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-gray-900 dark:text-foreground">{data.totalFiles}</div>
              <p className="text-xs text-gray-500 dark:text-muted-foreground mt-1">
                {data.totalSubtitles.toLocaleString()} subtitles
              </p>
            </CardContent>
          </Card>

          <Card className="text-center">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Avg. Processing Time</CardTitle>
              <Clock className="h-4 w-4 text-orange-500" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-gray-900">{data.averageProcessingTime.toFixed(2)}s</div>
              <p className="text-xs text-green-600 mt-1">
                -0.3s from last {period}
              </p>
            </CardContent>
          </Card>

          <Card className="text-center">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600 dark:text-muted-foreground">Success Rate</CardTitle>
              <Award className="h-4 w-4 text-purple-500 dark:text-purple-400" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-gray-900 dark:text-foreground">{data.successRate}%</div>
              <p className="text-xs text-green-600 dark:text-green-400 mt-1">
                +0.2% from last {period}
              </p>
            </CardContent>
          </Card>
        </div>

      {/* Charts and Details */}
      <Tabs defaultValue="languages" className="space-y-3 sm:space-y-4">
        <TabsList className="grid w-full grid-cols-3 max-w-md mx-auto">
          <TabsTrigger value="languages" className="text-xs sm:text-sm">Languages</TabsTrigger>
          <TabsTrigger value="services" className="text-xs sm:text-sm">Services</TabsTrigger>
          <TabsTrigger value="activity" className="text-xs sm:text-sm">Activity</TabsTrigger>
        </TabsList>

        <TabsContent value="languages" className="space-y-3 sm:space-y-4">
          <Card>
            <CardHeader className="pb-3 sm:pb-6">
              <CardTitle className="text-lg sm:text-xl">Top Translation Languages</CardTitle>
              <CardDescription className="text-sm">
                Most frequently translated languages this {period}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 sm:space-y-4">
                {data.topLanguages.map((lang, index) => (
                  <div key={lang.language} className="flex items-center justify-between gap-2 sm:gap-4">
                    <div className="flex items-center space-x-2 sm:space-x-3 flex-1 min-w-0">
                      <div className="w-6 h-6 sm:w-8 sm:h-8 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center flex-shrink-0">
                        <span className="text-xs sm:text-sm font-medium text-blue-600 dark:text-blue-400">#{index + 1}</span>
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="font-medium text-sm sm:text-base truncate">{lang.language}</p>
                        <p className="text-xs sm:text-sm text-gray-600 dark:text-muted-foreground">{lang.count} translations</p>
                      </div>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <p className="font-medium text-sm sm:text-base">{lang.percentage}%</p>
                      <div className="w-16 sm:w-20 h-2 bg-gray-200 dark:bg-muted rounded-full">
                        <div
                          className="h-2 bg-blue-500 dark:bg-primary rounded-full"
                          style={{ width: `${lang.percentage}%` }}
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="services" className="space-y-3 sm:space-y-4">
          <Card>
            <CardHeader className="pb-3 sm:pb-6">
              <CardTitle className="text-lg sm:text-xl">AI Service Usage</CardTitle>
              <CardDescription className="text-sm">
                Translation service breakdown this {period}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 sm:space-y-4">
                {Object.entries(data.translationsByService).map(([service, count]) => (
                  <div key={service} className="flex items-center justify-between gap-2 sm:gap-4">
                    <div className="flex items-center space-x-2 sm:space-x-3 flex-1 min-w-0">
                      <Zap className="h-4 w-4 sm:h-5 sm:w-5 text-purple-500 flex-shrink-0" />
                      <div className="min-w-0 flex-1">
                        <p className="font-medium text-sm sm:text-base truncate">{service}</p>
                        <p className="text-xs sm:text-sm text-gray-600 dark:text-muted-foreground">{count} translations</p>
                      </div>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <p className="font-medium text-sm sm:text-base">
                        {Math.round((count / data.totalTranslations) * 100)}%
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="activity" className="space-y-3 sm:space-y-4">
          <Card>
            <CardHeader className="pb-3 sm:pb-6">
              <CardTitle className="text-lg sm:text-xl">Recent Activity</CardTitle>
              <CardDescription className="text-sm">
                Your latest translation activities
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 sm:space-y-4">
                {data.recentActivity.map((activity) => (
                  <div key={activity.id} className="flex items-center justify-between p-2 sm:p-3 border rounded-lg gap-2 sm:gap-4">
                    <div className="flex items-center space-x-2 sm:space-x-3 flex-1 min-w-0">
                      <div className="flex-shrink-0">
                        {getActivityIcon(activity.type)}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="font-medium text-xs sm:text-sm truncate">{activity.description}</p>
                        <p className="text-xs text-gray-600 dark:text-muted-foreground">
                          {(() => {
                            const date = typeof activity.timestamp === 'string'
                              ? new Date(activity.timestamp)
                              : activity.timestamp
                            return `${date.toLocaleDateString()} at ${date.toLocaleTimeString()}`
                          })()}
                        </p>
                      </div>
                    </div>
                    <div className="flex-shrink-0">
                      {getStatusBadge(activity.status)}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
      </div>
    </div>
  )
}
