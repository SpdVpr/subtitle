'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { useRouter } from 'next/navigation'
import { isAdmin } from '@/lib/admin-auth'
import { AdminStats, UserActivity, RevenueData, AdminStatsService } from '@/lib/admin-stats'
import { StatsCards } from '@/components/admin/stats-cards'
import { UserActivityTable } from '@/components/admin/user-activity-table'
import { RevenueChart } from '@/components/admin/revenue-chart'
import { SecurityDashboard } from '@/components/admin/security-dashboard'
import { AdminSetup } from '@/components/admin/admin-setup'
import { CreditHistory } from '@/components/admin/credit-history'
import { VoucherGenerator } from '@/components/admin/voucher-generator'
import { VoucherManagement } from '@/components/admin/voucher-management'
import { FeedbackManagement } from '@/components/admin/feedback-management'
import { RecentTranslations } from '@/components/admin/recent-translations'
import { RegistrationMonitoring } from '@/components/admin/registration-monitoring'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { RefreshCw, Shield, AlertTriangle, Gift, UserCheck } from 'lucide-react'
import { Alert, AlertDescription } from '@/components/ui/alert'

export default function AdminDashboard() {
  const { user, loading } = useAuth()
  const router = useRouter()
  const [stats, setStats] = useState<AdminStats | null>(null)
  const [userActivity, setUserActivity] = useState<UserActivity[]>([])
  const [revenueData, setRevenueData] = useState<RevenueData[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState<'overview' | 'security' | 'vouchers' | 'voucher-generator' | 'feedback' | 'recent-translations' | 'registration-monitoring'>('overview')

  // Check admin access
  useEffect(() => {
    if (!loading && (!user || !isAdmin(user))) {
      router.push('/dashboard')
      return
    }
  }, [user, loading, router])

  // Load admin data
  const loadAdminData = async () => {
    if (!user || !isAdmin(user)) return

    setIsLoading(true)
    setError(null)

    try {
      // Load all admin data
      const [statsData, activityData, revenueDataResult] = await Promise.all([
        AdminStatsService.getOverallStats(),
        AdminStatsService.getUserActivity(),
        AdminStatsService.getRevenueData()
      ])

      setStats(statsData)
      setUserActivity(activityData)
      setRevenueData(revenueDataResult)
    } catch (error) {
      console.error('Failed to load admin data:', error)
      setError(error instanceof Error ? error.message : 'Failed to load admin data')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    if (user && isAdmin(user)) {
      loadAdminData()
    }
  }, [user])

  // Show loading or access denied
  if (loading || !user || !isAdmin(user)) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <Shield className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h1 className="text-xl font-semibold text-foreground mb-2">
            {loading ? 'Loading...' : 'Access Denied'}
          </h1>
          <p className="text-muted-foreground">
            {loading ? 'Checking permissions...' : 'Admin access required'}
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Container with proper margins and max-width */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="space-y-6">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-foreground">Admin Dashboard</h1>
              <p className="text-muted-foreground mt-1">
                Comprehensive overview of platform statistics and performance
              </p>
            </div>
            <Button
              onClick={loadAdminData}
              disabled={isLoading}
              variant="outline"
              className="w-full sm:w-auto"
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
          </div>

          {/* Tab Navigation */}
          <div className="border-b border-gray-200 dark:border-border">
            <nav className="-mb-px flex space-x-8 overflow-x-auto">
              <button
                onClick={() => setActiveTab('overview')}
                className={`py-2 px-1 border-b-2 font-medium text-sm whitespace-nowrap ${
                  activeTab === 'overview'
                    ? 'border-primary text-primary'
                    : 'border-transparent text-muted-foreground hover:text-foreground hover:border-border'
                }`}
              >
                📊 Overview
              </button>
              <button
                onClick={() => setActiveTab('recent-translations')}
                className={`py-2 px-1 border-b-2 font-medium text-sm whitespace-nowrap ${
                  activeTab === 'recent-translations'
                    ? 'border-primary text-primary'
                    : 'border-transparent text-muted-foreground hover:text-foreground hover:border-border'
                }`}
              >
                📄 Poslední překlady
              </button>
              <button
                onClick={() => setActiveTab('voucher-generator')}
                className={`py-2 px-1 border-b-2 font-medium text-sm whitespace-nowrap ${
                  activeTab === 'voucher-generator'
                    ? 'border-primary text-primary'
                    : 'border-transparent text-muted-foreground hover:text-foreground hover:border-border'
                }`}
              >
                🎫 Generate Vouchers
              </button>
              <button
                onClick={() => setActiveTab('vouchers')}
                className={`py-2 px-1 border-b-2 font-medium text-sm whitespace-nowrap ${
                  activeTab === 'vouchers'
                    ? 'border-primary text-primary'
                    : 'border-transparent text-muted-foreground hover:text-foreground hover:border-border'
                }`}
              >
                🎟️ Manage Vouchers
              </button>
              <button
                onClick={() => setActiveTab('security')}
                className={`py-2 px-1 border-b-2 font-medium text-sm whitespace-nowrap ${
                  activeTab === 'security'
                    ? 'border-primary text-primary'
                    : 'border-transparent text-muted-foreground hover:text-foreground hover:border-border'
                }`}
              >
                🔐 Security
              </button>
              <button
                onClick={() => setActiveTab('registration-monitoring')}
                className={`py-2 px-1 border-b-2 font-medium text-sm whitespace-nowrap ${
                  activeTab === 'registration-monitoring'
                    ? 'border-primary text-primary'
                    : 'border-transparent text-muted-foreground hover:text-foreground hover:border-border'
                }`}
              >
                🛡️ Anti-Abuse
              </button>
              <button
                onClick={() => setActiveTab('feedback')}
                className={`py-2 px-1 border-b-2 font-medium text-sm whitespace-nowrap ${
                  activeTab === 'feedback'
                    ? 'border-primary text-primary'
                    : 'border-transparent text-muted-foreground hover:text-foreground hover:border-border'
                }`}
              >
                💬 Feedback
              </button>
            </nav>
          </div>

          {/* Admin Setup */}
          <AdminSetup />

          {/* Error Alert */}
          {error && (
            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {/* Loading State */}
          {isLoading && !stats && (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {[...Array(6)].map((_, i) => (
                <Card key={i}>
                  <CardHeader className="space-y-0 pb-2">
                    <div className="h-4 bg-gray-200 dark:bg-muted rounded animate-pulse" />
                  </CardHeader>
                  <CardContent>
                    <div className="h-8 bg-gray-200 dark:bg-muted rounded animate-pulse mb-2" />
                    <div className="h-3 bg-gray-200 dark:bg-muted rounded animate-pulse w-2/3" />
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {/* Tab Content */}
          {activeTab === 'overview' && (
            <>
              {/* Stats Cards */}
              {stats && <StatsCards stats={stats} />}

              {/* Charts */}
              {stats && revenueData.length > 0 && (
                <RevenueChart revenueData={revenueData} stats={stats} />
              )}

              {/* User Activity Table */}
              <UserActivityTable users={userActivity} onRefresh={loadAdminData} />

              {/* Credit History */}
              <CreditHistory onRefresh={loadAdminData} />
            </>
          )}

          {activeTab === 'voucher-generator' && (
            <VoucherGenerator />
          )}

          {activeTab === 'vouchers' && (
            <VoucherManagement />
          )}

          {activeTab === 'security' && (
            <SecurityDashboard />
          )}

          {activeTab === 'feedback' && (
            <FeedbackManagement />
          )}

          {activeTab === 'recent-translations' && (
            <RecentTranslations onRefresh={loadAdminData} />
          )}

          {activeTab === 'registration-monitoring' && (
            <RegistrationMonitoring />
          )}

          {/* System Status */}
          <Card>
            <CardHeader>
              <CardTitle>System Status</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 sm:grid-cols-1 md:grid-cols-3">
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-green-500 rounded-full" />
                  <span className="text-sm">Translation Services</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-green-500 rounded-full" />
                  <span className="text-sm">Database</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-green-500 rounded-full" />
                  <span className="text-sm">Payment Processing</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
