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
    
    // Mock analytics data
    const mockData: AnalyticsData = {
      totalTranslations: subscription?.plan === 'pro' ? 247 : subscription?.plan === 'premium' ? 89 : 12,
      totalFiles: subscription?.plan === 'pro' ? 156 : subscription?.plan === 'premium' ? 67 : 8,
      totalSubtitles: subscription?.plan === 'pro' ? 12450 : subscription?.plan === 'premium' ? 4230 : 456,
      averageProcessingTime: 2.3,
      storageUsed: subscription?.plan === 'pro' ? 45.2 : subscription?.plan === 'premium' ? 12.8 : 2.1,
      successRate: 98.5,
      
      translationsByLanguage: {
        'Spanish': subscription?.plan === 'pro' ? 67 : subscription?.plan === 'premium' ? 23 : 4,
        'French': subscription?.plan === 'pro' ? 45 : subscription?.plan === 'premium' ? 18 : 3,
        'German': subscription?.plan === 'pro' ? 38 : subscription?.plan === 'premium' ? 15 : 2,
        'Italian': subscription?.plan === 'pro' ? 32 : subscription?.plan === 'premium' ? 12 : 2,
        'Portuguese': subscription?.plan === 'pro' ? 28 : subscription?.plan === 'premium' ? 10 : 1,
        'Japanese': subscription?.plan === 'pro' ? 22 : subscription?.plan === 'premium' ? 8 : 0,
        'Chinese': subscription?.plan === 'pro' ? 15 : subscription?.plan === 'premium' ? 3 : 0,
      },
      
      translationsByService: {
        'Google Translate': subscription?.plan === 'pro' ? 145 : subscription?.plan === 'premium' ? 45 : 12,
        'OpenAI GPT': subscription?.plan === 'pro' ? 102 : subscription?.plan === 'premium' ? 44 : 0,
      },
      
      dailyUsage: Array.from({ length: 30 }, (_, i) => ({
        date: new Date(Date.now() - i * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        translations: Math.floor(Math.random() * 10) + 1,
        files: Math.floor(Math.random() * 5) + 1,
        processingTime: Math.random() * 5 + 1
      })).reverse(),
      
      topLanguages: [
        { language: 'Spanish', count: subscription?.plan === 'pro' ? 67 : 23, percentage: 27 },
        { language: 'French', count: subscription?.plan === 'pro' ? 45 : 18, percentage: 18 },
        { language: 'German', count: subscription?.plan === 'pro' ? 38 : 15, percentage: 15 },
        { language: 'Italian', count: subscription?.plan === 'pro' ? 32 : 12, percentage: 13 },
        { language: 'Portuguese', count: subscription?.plan === 'pro' ? 28 : 10, percentage: 11 },
      ],
      
      recentActivity: [
        {
          id: '1',
          type: 'translation',
          description: 'Translated "movie_subtitles.srt" to Spanish',
          timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
          status: 'success'
        },
        {
          id: '2',
          type: 'batch',
          description: 'Batch job "TV Series S01" completed (12 files)',
          timestamp: new Date(Date.now() - 5 * 60 * 60 * 1000),
          status: 'success'
        },
        {
          id: '3',
          type: 'edit',
          description: 'Edited subtitles for "documentary.srt"',
          timestamp: new Date(Date.now() - 8 * 60 * 60 * 1000),
          status: 'success'
        },
        {
          id: '4',
          type: 'translation',
          description: 'Translated "interview.srt" to French',
          timestamp: new Date(Date.now() - 12 * 60 * 60 * 1000),
          status: 'success'
        },
      ]
    }
    
    setData(mockData)
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
                <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                <div className="h-8 bg-gray-200 rounded w-1/2"></div>
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
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
      <div className="space-y-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="text-center sm:text-left">
            <h1 className="text-3xl font-bold text-gray-900">Analytics Dashboard</h1>
            <p className="text-gray-600 mt-2">Track your translation usage and performance</p>
          </div>
          <div className="flex items-center justify-center sm:justify-end space-x-4">
            <Select value={period} onValueChange={(value: 'week' | 'month' | 'year') => setPeriod(value)}>
              <SelectTrigger className="w-36">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="week">Last Week</SelectItem>
                <SelectItem value="month">Last Month</SelectItem>
                <SelectItem value="year">Last Year</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline" size="sm">
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
          </div>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="text-center">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Total Translations</CardTitle>
              <Languages className="h-4 w-4 text-blue-500" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-gray-900">{data.totalTranslations}</div>
              <p className="text-xs text-green-600 mt-1">
                +12% from last {period}
              </p>
            </CardContent>
          </Card>

          <Card className="text-center">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Files Processed</CardTitle>
              <FileText className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-gray-900">{data.totalFiles}</div>
              <p className="text-xs text-gray-500 mt-1">
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
              <div className="text-3xl font-bold text-gray-900">{data.averageProcessingTime}s</div>
              <p className="text-xs text-green-600 mt-1">
                -0.3s from last {period}
              </p>
            </CardContent>
          </Card>

          <Card className="text-center">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Success Rate</CardTitle>
              <Award className="h-4 w-4 text-purple-500" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-gray-900">{data.successRate}%</div>
              <p className="text-xs text-green-600 mt-1">
                +0.2% from last {period}
              </p>
            </CardContent>
          </Card>
        </div>

      {/* Charts and Details */}
      <Tabs defaultValue="languages" className="space-y-4">
        <TabsList>
          <TabsTrigger value="languages">Languages</TabsTrigger>
          <TabsTrigger value="services">AI Services</TabsTrigger>
          <TabsTrigger value="activity">Recent Activity</TabsTrigger>
        </TabsList>

        <TabsContent value="languages" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Top Translation Languages</CardTitle>
              <CardDescription>
                Most frequently translated languages this {period}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {data.topLanguages.map((lang, index) => (
                  <div key={lang.language} className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                        <span className="text-sm font-medium text-blue-600">#{index + 1}</span>
                      </div>
                      <div>
                        <p className="font-medium">{lang.language}</p>
                        <p className="text-sm text-gray-600">{lang.count} translations</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-medium">{lang.percentage}%</p>
                      <div className="w-20 h-2 bg-gray-200 rounded-full">
                        <div 
                          className="h-2 bg-blue-500 rounded-full" 
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

        <TabsContent value="services" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>AI Service Usage</CardTitle>
              <CardDescription>
                Translation service breakdown this {period}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {Object.entries(data.translationsByService).map(([service, count]) => (
                  <div key={service} className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <Zap className="h-5 w-5 text-purple-500" />
                      <div>
                        <p className="font-medium">{service}</p>
                        <p className="text-sm text-gray-600">{count} translations</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-medium">
                        {Math.round((count / data.totalTranslations) * 100)}%
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="activity" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
              <CardDescription>
                Your latest translation activities
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {data.recentActivity.map((activity) => (
                  <div key={activity.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center space-x-3">
                      {getActivityIcon(activity.type)}
                      <div>
                        <p className="font-medium text-sm">{activity.description}</p>
                        <p className="text-xs text-gray-600">
                          {activity.timestamp.toLocaleDateString()} at {activity.timestamp.toLocaleTimeString()}
                        </p>
                      </div>
                    </div>
                    {getStatusBadge(activity.status)}
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
