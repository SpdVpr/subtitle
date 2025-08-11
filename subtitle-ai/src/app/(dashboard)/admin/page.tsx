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
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { RefreshCw, Shield, AlertTriangle } from 'lucide-react'
import { Alert, AlertDescription } from '@/components/ui/alert'

export default function AdminDashboard() {
  const { user, loading } = useAuth()
  const router = useRouter()
  const [stats, setStats] = useState<AdminStats | null>(null)
  const [userActivity, setUserActivity] = useState<UserActivity[]>([])
  const [revenueData, setRevenueData] = useState<RevenueData[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState<'overview' | 'security'>('overview')

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
          <Shield className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h1 className="text-xl font-semibold text-gray-900 mb-2">
            {loading ? 'Loading...' : 'Access Denied'}
          </h1>
          <p className="text-gray-600">
            {loading ? 'Checking permissions...' : 'Admin access required'}
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Container with proper margins and max-width */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="space-y-6">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Admin Dashboard</h1>
              <p className="text-gray-600 mt-1">
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
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8">
              <button
                onClick={() => setActiveTab('overview')}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'overview'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                📊 Overview
              </button>
              <button
                onClick={() => setActiveTab('security')}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'security'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                🔐 Security
              </button>
            </nav>
          </div>

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
                    <div className="h-4 bg-gray-200 rounded animate-pulse" />
                  </CardHeader>
                  <CardContent>
                    <div className="h-8 bg-gray-200 rounded animate-pulse mb-2" />
                    <div className="h-3 bg-gray-200 rounded animate-pulse w-2/3" />
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
              {userActivity.length > 0 && (
                <UserActivityTable users={userActivity} />
              )}
            </>
          )}

          {activeTab === 'security' && (
            <SecurityDashboard />
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
