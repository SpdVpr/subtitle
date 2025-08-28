'use client'

import { useState, useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import {
  FileText,
  Zap,
  Calendar,
  TrendingUp,
  CheckCircle,
  X,
  Coins,
  ArrowRight,
  Loader2
} from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'
import { CreditsCard } from '@/components/ui/credits-display'
import { HistoryTabs } from '@/components/dashboard/history-tabs'
import { AnalyticsDashboard } from '@/components/analytics/analytics-dashboard'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { BarChart3 } from 'lucide-react'
import Link from 'next/link'

export default function DashboardPage() {
  const { user } = useAuth()
  const [showSuccessAlert, setShowSuccessAlert] = useState(false)
  const [dashboardStats, setDashboardStats] = useState({
    totalTranslations: 0,
    creditsUsed: 0,
    loading: true
  })
  const searchParams = useSearchParams()

  // Load dashboard statistics
  useEffect(() => {
    const loadDashboardStats = async () => {
      if (!user) return

      try {
        // Fetch analytics data which now includes creditsUsed
        const analyticsResponse = await fetch(`/api/analytics?userId=${user.uid}&period=month`)

        let totalTranslations = 0
        let creditsUsed = 0

        if (analyticsResponse.ok) {
          const result = await analyticsResponse.json()
          totalTranslations = result.data.totalTranslations || 0
          creditsUsed = result.data.creditsUsed || 0
          console.log('📊 Dashboard analytics loaded:', { totalTranslations, creditsUsed })
        }

        setDashboardStats({
          totalTranslations,
          creditsUsed,
          loading: false
        })
      } catch (error) {
        console.error('Failed to load dashboard stats:', error)
        setDashboardStats({
          totalTranslations: 0,
          creditsUsed: 0,
          loading: false
        })
      }
    }

    loadDashboardStats()
  }, [user])

  useEffect(() => {
    const success = searchParams.get('success')
    const credits = searchParams.get('credits')

    if (success && credits) {
      setShowSuccessAlert(true)
      // Auto-hide after 10 seconds
      const timer = setTimeout(() => {
        setShowSuccessAlert(false)
      }, 10000)

      return () => clearTimeout(timer)
    }
  }, [searchParams])

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading your dashboard...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-3 sm:px-4 py-4 sm:py-6 lg:py-8 max-w-7xl">
        {/* Success Alert */}
        {showSuccessAlert && (
          <Alert className="mb-6 border-primary/20 bg-primary/5">
            <CheckCircle className="h-4 w-4 text-primary" />
            <AlertDescription className="text-foreground">
              <div className="flex items-center justify-between">
                <span>
                  🎉 Credits purchased successfully! You can now use premium translation features.
                </span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowSuccessAlert(false)}
                  className="text-primary hover:text-primary/80"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </AlertDescription>
          </Alert>
        )}

        {/* Header */}
        <div className="mb-6 sm:mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-foreground mb-2">
            Welcome back, {user.displayName || user.email}!
          </h1>
          <p className="text-sm sm:text-base text-muted-foreground">
            Here's your account overview and translation activity.
          </p>
        </div>

        {/* Dashboard Tabs */}
        <Tabs defaultValue="overview" className="w-full">
          <TabsList className="grid w-full grid-cols-2 max-w-md mx-auto mb-6 sm:mb-8">
            <TabsTrigger value="overview" className="flex items-center space-x-1 sm:space-x-2 text-xs sm:text-sm">
              <Zap className="w-3 h-3 sm:w-4 sm:h-4" />
              <span className="hidden xs:inline">Overview</span>
              <span className="xs:hidden">Stats</span>
            </TabsTrigger>
            <TabsTrigger value="analytics" className="flex items-center space-x-1 sm:space-x-2 text-xs sm:text-sm">
              <BarChart3 className="w-3 h-3 sm:w-4 sm:h-4" />
              <span className="hidden xs:inline">Analytics</span>
              <span className="xs:hidden">Charts</span>
            </TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview">
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
          {/* Left Column - Credits & Quick Actions */}
          <div className="xl:col-span-1 space-y-4 sm:space-y-6">
            {/* Credits Card */}
            <CreditsCard />

            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Zap className="w-5 h-5 text-primary" />
                  <span>Quick Actions</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button asChild className="w-full justify-between">
                  <Link href="/translate">
                    <span>Translate Subtitles</span>
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                </Button>
                <Button variant="outline" asChild className="w-full justify-between">
                  <Link href="/subtitles-search">
                    <span>Find Subtitles</span>
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                </Button>
                <Button variant="outline" asChild className="w-full justify-between">
                  <Link href="/batch">
                    <span>Batch Processing</span>
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Stats & Activity */}
          <div className="xl:col-span-2 space-y-4 sm:space-y-6">
            {/* Usage Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center space-x-2">
                    <FileText className="w-5 h-5 text-primary" />
                    <span>Translations</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-primary mb-2">
                    {dashboardStats.loading ? (
                      <Loader2 className="h-8 w-8 animate-spin" />
                    ) : (
                      dashboardStats.totalTranslations
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Files translated this month
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center space-x-2">
                    <TrendingUp className="w-5 h-5 text-purple-600" />
                    <span>Credits Used</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-purple-600 mb-2">
                    {dashboardStats.loading ? (
                      <Loader2 className="h-8 w-8 animate-spin" />
                    ) : (
                      Math.round(dashboardStats.creditsUsed)
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Credits spent this month
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* History Tabs - Translation & Credit History */}
            <HistoryTabs />

            {/* Getting Started Guide */}
            <Card className="border-primary/20 bg-primary/5">
              <CardHeader>
                <CardTitle className="text-foreground">🚀 Getting Started</CardTitle>
                <CardDescription className="text-muted-foreground">
                  Make the most of your credits with these tips
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-start space-x-3">
                  <div className="w-6 h-6 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-xs font-bold text-primary">1</span>
                  </div>
                  <div>
                    <p className="font-medium text-foreground">Upload your SRT file</p>
                    <p className="text-sm text-muted-foreground">Support for various subtitle formats</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="w-6 h-6 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-xs font-bold text-primary">2</span>
                  </div>
                  <div>
                    <p className="font-medium text-foreground">Choose your AI service</p>
                    <p className="text-sm text-muted-foreground">Standard (~0.1 credits) or Premium (~0.2 credits) per 20 lines</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="w-6 h-6 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-xs font-bold text-primary">3</span>
                  </div>
                  <div>
                    <p className="font-medium text-foreground">Download your translation</p>
                    <p className="text-sm text-muted-foreground">Get professional-quality results in seconds</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            </div>
          </div>
          </TabsContent>

          {/* Analytics Tab */}
          <TabsContent value="analytics">
            <AnalyticsDashboard />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
