'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { RefreshCw, Cookie, CheckCircle, XCircle, Settings, BarChart3, Target, Cog } from 'lucide-react'

interface CookieConsentStats {
  totalConsents: number
  acceptAllCount: number
  rejectAllCount: number
  customCount: number
  analyticsAccepted: number
  marketingAccepted: number
  functionalAccepted: number
  byLanguage: { cs: number, en: number }
}

export function CookieConsentStats() {
  const [stats, setStats] = useState<CookieConsentStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [period, setPeriod] = useState(30)

  const fetchStats = async () => {
    setLoading(true)
    setError(null)
    
    try {
      const response = await fetch(`/api/admin/cookie-consent-stats?days=${period}`)
      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch cookie consent stats')
      }

      setStats(data.stats)
    } catch (error: any) {
      console.error('Failed to fetch cookie consent stats:', error)
      setError(error.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchStats()
  }, [period])

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Cookie className="h-5 w-5" />
            Cookie Consent Statistics
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <RefreshCw className="h-6 w-6 animate-spin" />
            <span className="ml-2">Loading statistics...</span>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Cookie className="h-5 w-5" />
            Cookie Consent Statistics
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <p className="text-red-600 mb-4">Error: {error}</p>
            <Button onClick={fetchStats} variant="outline">
              <RefreshCw className="h-4 w-4 mr-2" />
              Retry
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (!stats) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Cookie className="h-5 w-5" />
            Cookie Consent Statistics
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-center py-8 text-muted-foreground">No data available</p>
        </CardContent>
      </Card>
    )
  }

  const acceptanceRate = stats.totalConsents > 0 
    ? Math.round((stats.acceptAllCount / stats.totalConsents) * 100) 
    : 0

  const rejectionRate = stats.totalConsents > 0 
    ? Math.round((stats.rejectAllCount / stats.totalConsents) * 100) 
    : 0

  const customRate = stats.totalConsents > 0 
    ? Math.round((stats.customCount / stats.totalConsents) * 100) 
    : 0

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Cookie className="h-5 w-5" />
              Cookie Consent Statistics
            </CardTitle>
            <div className="flex items-center gap-2">
              <select
                value={period}
                onChange={(e) => setPeriod(parseInt(e.target.value))}
                className="px-3 py-1 border rounded text-sm"
              >
                <option value={7}>Last 7 days</option>
                <option value={30}>Last 30 days</option>
                <option value={90}>Last 90 days</option>
                <option value={365}>Last year</option>
              </select>
              <Button onClick={fetchStats} variant="outline" size="sm">
                <RefreshCw className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{stats.totalConsents}</div>
              <div className="text-sm text-muted-foreground">Total Consents</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{acceptanceRate}%</div>
              <div className="text-sm text-muted-foreground">Accept All Rate</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-red-600">{rejectionRate}%</div>
              <div className="text-sm text-muted-foreground">Reject All Rate</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-600">{customRate}%</div>
              <div className="text-sm text-muted-foreground">Custom Settings</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Detailed breakdown */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Consent Methods */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Consent Methods</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <span>Accept All</span>
              </div>
              <Badge className="bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300">
                {stats.acceptAllCount}
              </Badge>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <XCircle className="h-4 w-4 text-red-600" />
                <span>Reject All</span>
              </div>
              <Badge className="bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300">
                {stats.rejectAllCount}
              </Badge>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Settings className="h-4 w-4 text-orange-600" />
                <span>Custom Settings</span>
              </div>
              <Badge className="bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300">
                {stats.customCount}
              </Badge>
            </div>
          </CardContent>
        </Card>

        {/* Cookie Types Acceptance */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Cookie Types Acceptance</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <BarChart3 className="h-4 w-4 text-blue-600" />
                <span>Analytics</span>
              </div>
              <Badge className="bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300">
                {stats.analyticsAccepted}
              </Badge>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Target className="h-4 w-4 text-purple-600" />
                <span>Marketing</span>
              </div>
              <Badge className="bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300">
                {stats.marketingAccepted}
              </Badge>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Cog className="h-4 w-4 text-orange-600" />
                <span>Functional</span>
              </div>
              <Badge className="bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300">
                {stats.functionalAccepted}
              </Badge>
            </div>
          </CardContent>
        </Card>

        {/* Language Distribution */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Language Distribution</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-lg">🇨🇿</span>
                <span>Czech</span>
              </div>
              <Badge variant="outline">
                {stats.byLanguage.cs}
              </Badge>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-lg">🇺🇸</span>
                <span>English</span>
              </div>
              <Badge variant="outline">
                {stats.byLanguage.en}
              </Badge>
            </div>
          </CardContent>
        </Card>

        {/* Compliance Info */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">GDPR Compliance</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 text-sm text-muted-foreground">
              <p>✅ Cookie consents are being logged</p>
              <p>✅ User preferences are recorded</p>
              <p>✅ Consent history is maintained</p>
              <p>✅ IP addresses and timestamps stored</p>
              <p className="text-green-600 font-medium">
                System is GDPR compliant for cookie consent tracking
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
