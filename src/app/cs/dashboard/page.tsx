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
  Loader2,
  BarChart3,
  MessageSquare
} from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'
import { EmailVerificationGuard } from '@/components/auth/email-verification-guard'
import { CreditsCard } from '@/components/ui/credits-display'
import { HistoryTabs } from '@/components/dashboard/history-tabs'
import { AnalyticsDashboard } from '@/components/analytics/analytics-dashboard'
import { FeedbackWidget } from '@/components/dashboard/feedback-widget'
import { FavoriteLanguagesManager } from '@/components/translation/favorite-languages-manager'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Settings } from 'lucide-react'
import Link from 'next/link'

export default function CzechDashboardPage() {
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
          <p className="text-muted-foreground">Načítání vašeho dashboardu...</p>
        </div>
      </div>
    )
  }

  return (
    <EmailVerificationGuard locale="cs">
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Success Alert */}
        {showSuccessAlert && (
          <Alert className="mb-6 border-primary/20 bg-primary/5">
            <CheckCircle className="h-4 w-4 text-primary" />
            <AlertDescription className="text-foreground">
              <div className="flex items-center justify-between">
                <span>
                  🎉 Kredity úspěšně zakoupeny! Nyní můžete používat prémiové překladové funkce.
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
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">
            Vítejte zpět, {user.displayName || user.email}!
          </h1>
          <p className="text-muted-foreground">
            Zde je přehled vašeho účtu a překladové aktivity.
          </p>
        </div>

        {/* Dashboard Tabs */}
        <Tabs defaultValue="overview" className="w-full">
          <TabsList className="grid w-full grid-cols-3 max-w-lg mx-auto mb-8">
            <TabsTrigger value="overview" className="flex items-center space-x-2">
              <Zap className="w-4 h-4" />
              <span>Přehled</span>
            </TabsTrigger>
            <TabsTrigger value="analytics" className="flex items-center space-x-2">
              <BarChart3 className="w-4 h-4" />
              <span>Analýzy</span>
            </TabsTrigger>
            <TabsTrigger value="settings" className="flex items-center space-x-2">
              <Settings className="w-4 h-4" />
              <span>Nastavení</span>
            </TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview">
            <div className="grid lg:grid-cols-3 gap-8">
              {/* Left Column - Credits & Quick Actions */}
              <div className="lg:col-span-1 space-y-6">
                {/* Credits Card */}
                <CreditsCard />

                {/* Quick Actions */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <Zap className="w-5 h-5 text-primary" />
                      <span>Rychlé Akce</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <Button asChild className="w-full justify-between">
                      <Link href="/cs/translate">
                        <span>Překládat Titulky</span>
                        <ArrowRight className="w-4 h-4" />
                      </Link>
                    </Button>
                    <Button variant="outline" asChild className="w-full justify-between">
                      <Link href="/cs/subtitles-search">
                        <span>Hledat Titulky</span>
                        <ArrowRight className="w-4 h-4" />
                      </Link>
                    </Button>
                    <Button variant="outline" asChild className="w-full justify-between">
                      <Link href="/cs/batch">
                        <span>Dávkové Zpracování</span>
                        <ArrowRight className="w-4 h-4" />
                      </Link>
                    </Button>
                    <Button variant="outline" asChild className="w-full justify-between bg-gradient-to-r from-blue-50 to-purple-50 hover:from-blue-100 hover:to-purple-100 border-blue-200 text-blue-700 hover:text-blue-800 dark:from-blue-950 dark:to-purple-950 dark:border-blue-800 dark:text-blue-300 dark:hover:text-blue-200">
                      <Link href="/cs/feedback">
                        <span className="flex items-center gap-2">
                          <MessageSquare className="w-4 h-4" />
                          Sdílet Zpětnou Vazbu
                        </span>
                        <ArrowRight className="w-4 h-4" />
                      </Link>
                    </Button>
                    <Button variant="outline" asChild className="w-full justify-between">
                      <Link href="/cs/my-feedback">
                        <span className="flex items-center gap-2">
                          <MessageSquare className="w-4 h-4" />
                          Moje Zpětná Vazba
                        </span>
                        <ArrowRight className="w-4 h-4" />
                      </Link>
                    </Button>
                  </CardContent>
                </Card>
              </div>

              {/* Right Column - Stats & Activity */}
              <div className="lg:col-span-2 space-y-6">
                {/* Usage Stats */}
                <div className="grid md:grid-cols-2 gap-6">
                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="flex items-center space-x-2">
                        <FileText className="w-5 h-5 text-primary" />
                        <span>Překlady</span>
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
                        Souborů přeloženo tento měsíc
                      </p>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="flex items-center space-x-2">
                        <TrendingUp className="w-5 h-5 text-purple-600" />
                        <span>Použité Kredity</span>
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
                        Kreditů utraceno tento měsíc
                      </p>
                    </CardContent>
                  </Card>
                </div>

                {/* History Tabs - Translation & Credit History */}
                <HistoryTabs />

                {/* Feedback Widget */}
                <FeedbackWidget locale="cs" />

                {/* Getting Started Guide */}
                <Card className="border-primary/20 bg-primary/5">
                  <CardHeader>
                    <CardTitle className="text-foreground">🚀 Začínáme</CardTitle>
                    <CardDescription className="text-muted-foreground">
                      Využijte své kredity naplno s těmito tipy
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex items-start space-x-3">
                      <div className="w-6 h-6 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                        <span className="text-xs font-bold text-primary">1</span>
                      </div>
                      <div>
                        <p className="font-medium text-foreground">Nahrajte váš SRT soubor</p>
                        <p className="text-sm text-muted-foreground">Podpora různých formátů titulků</p>
                      </div>
                    </div>
                    <div className="flex items-start space-x-3">
                      <div className="w-6 h-6 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                        <span className="text-xs font-bold text-primary">2</span>
                      </div>
                      <div>
                        <p className="font-medium text-foreground">Vyberte si AI službu</p>
                        <p className="text-sm text-muted-foreground">Standardní (~0,1 kreditů) nebo Prémiový (~0,2 kreditů) za 20 řádků</p>
                      </div>
                    </div>
                    <div className="flex items-start space-x-3">
                      <div className="w-6 h-6 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                        <span className="text-xs font-bold text-primary">3</span>
                      </div>
                      <div>
                        <p className="font-medium text-foreground">Stáhněte si váš překlad</p>
                        <p className="text-sm text-muted-foreground">Získejte profesionální kvalitu za sekundy</p>
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

          {/* Settings Tab */}
          <TabsContent value="settings">
            <div className="space-y-6">
              <FavoriteLanguagesManager locale="cs" />
            </div>
          </TabsContent>
        </Tabs>
        </div>
      </div>
    </EmailVerificationGuard>
  )
}
