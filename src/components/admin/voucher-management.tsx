'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { useAuth } from '@/hooks/useAuth'
import { 
  Search, 
  Filter, 
  Trash2, 
  Ban, 
  RefreshCw,
  CheckCircle,
  XCircle,
  Clock,
  Gift,
  TrendingUp,
  Users,
  DollarSign,
  Percent
} from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'

interface VoucherStats {
  overview: {
    totalVouchers: number
    activeVouchers: number
    expiredVouchers: number
    usedVouchers: number
    totalCreditsGenerated: number
    totalCreditsRedeemed: number
    redemptionRate: number
  }
  campaigns: Array<{
    name: string
    totalVouchers: number
    activeVouchers: number
    usedVouchers: number
    expiredVouchers: number
    totalCredits: number
    redeemedCredits: number
    redemptionRate: number
    createdBy: string
    createdAt: Date
  }>
  topCampaigns: Array<{
    name: string
    totalCredits: number
    redemptionRate: number
  }>
}

interface Voucher {
  id: string
  code: string
  creditAmount: number
  campaignName: string
  description: string
  createdAt: Date
  expiresAt: Date | null
  usageLimit: number
  usedCount: number
  isActive: boolean
  isExpired: boolean
  isUsed: boolean
  createdBy: string
  usedBy: string[]
  lastUsedAt?: Date
}

export function VoucherManagement() {
  const { user } = useAuth()
  const [stats, setStats] = useState<VoucherStats | null>(null)
  const [vouchers, setVouchers] = useState<Voucher[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [selectedVouchers, setSelectedVouchers] = useState<string[]>([])
  const [filters, setFilters] = useState({
    campaign: '',
    status: 'all', // 'all', 'active', 'expired', 'used'
    search: ''
  })

  const loadData = async () => {
    if (!user?.email) return

    setLoading(true)
    setError(null)

    try {
      // Load statistics
      const statsResponse = await fetch('/api/admin/vouchers/stats', {
        headers: { 'x-admin-email': user.email }
      })
      
      if (statsResponse.ok) {
        const statsResult = await statsResponse.json()
        setStats(statsResult.stats)
      }

      // Load vouchers
      const vouchersResponse = await fetch(`/api/admin/vouchers?status=${filters.status}&campaign=${filters.campaign}&limit=100`, {
        headers: { 'x-admin-email': user.email }
      })

      if (!vouchersResponse.ok) {
        throw new Error('Failed to load vouchers')
      }

      const vouchersResult = await vouchersResponse.json()
      setVouchers(vouchersResult.vouchers || [])

    } catch (error: any) {
      console.error('Failed to load voucher data:', error)
      setError(error.message || 'Failed to load voucher data')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [user, filters.status, filters.campaign])

  const handleVoucherAction = async (action: 'deactivate' | 'delete') => {
    if (!user?.email || selectedVouchers.length === 0) return

    const confirmMessage = action === 'delete' 
      ? `Are you sure you want to permanently delete ${selectedVouchers.length} voucher(s)?`
      : `Are you sure you want to deactivate ${selectedVouchers.length} voucher(s)?`

    if (!confirm(confirmMessage)) return

    try {
      const response = await fetch('/api/admin/vouchers', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'x-admin-email': user.email
        },
        body: JSON.stringify({
          voucherCodes: selectedVouchers,
          action
        })
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || `Failed to ${action} vouchers`)
      }

      setSuccess(`Successfully ${action}d ${result.summary.successful} voucher(s)`)
      setSelectedVouchers([])
      loadData()

    } catch (error: any) {
      setError(error.message || `Failed to ${action} vouchers`)
    }
  }

  const filteredVouchers = vouchers.filter(voucher => {
    if (filters.search && !voucher.code.toLowerCase().includes(filters.search.toLowerCase()) &&
        !voucher.campaignName.toLowerCase().includes(filters.search.toLowerCase())) {
      return false
    }
    return true
  })

  const getStatusBadge = (voucher: Voucher) => {
    if (!voucher.isActive) {
      return <Badge variant="secondary">Deactivated</Badge>
    }
    if (voucher.isExpired) {
      return <Badge variant="destructive">Expired</Badge>
    }
    if (voucher.isUsed) {
      return <Badge variant="outline">Used</Badge>
    }
    return <Badge variant="default">Active</Badge>
  }

  if (loading && !stats) {
    return (
      <div className="space-y-6">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <Card key={i}>
              <CardHeader className="space-y-0 pb-2">
                <div className="h-4 bg-muted rounded animate-pulse" />
              </CardHeader>
              <CardContent>
                <div className="h-8 bg-muted rounded animate-pulse mb-2" />
                <div className="h-3 bg-muted rounded animate-pulse w-2/3" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Statistics Cards */}
      {stats && (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Vouchers</CardTitle>
              <Gift className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.overview.totalVouchers}</div>
              <p className="text-xs text-muted-foreground">
                {stats.overview.activeVouchers} active
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Credits Generated</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.overview.totalCreditsGenerated.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">
                {stats.overview.totalCreditsRedeemed.toLocaleString()} redeemed
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Redemption Rate</CardTitle>
              <Percent className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.overview.redemptionRate.toFixed(1)}%</div>
              <p className="text-xs text-muted-foreground">
                {stats.overview.usedVouchers} of {stats.overview.totalVouchers} used
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Campaigns</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.campaigns.length}</div>
              <p className="text-xs text-muted-foreground">
                Active campaigns
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Filters and Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Voucher Management</CardTitle>
          <CardDescription>
            Manage and monitor voucher codes across all campaigns
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <Input
                placeholder="Search vouchers or campaigns..."
                value={filters.search}
                onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
                className="w-full"
              />
            </div>
            <select
              value={filters.status}
              onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value }))}
              className="px-3 py-2 border rounded-md"
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="expired">Expired</option>
              <option value="used">Used</option>
            </select>
            <Button variant="outline" onClick={loadData} disabled={loading}>
              <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
          </div>

          {selectedVouchers.length > 0 && (
            <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
              <span className="text-sm">
                {selectedVouchers.length} voucher(s) selected
              </span>
              <div className="flex space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleVoucherAction('deactivate')}
                >
                  <Ban className="w-4 h-4 mr-2" />
                  Deactivate
                </Button>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => handleVoucherAction('delete')}
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Delete
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Error Alert */}
      {error && (
        <Alert variant="destructive">
          <XCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Success Alert */}
      {success && (
        <Alert>
          <CheckCircle className="h-4 w-4" />
          <AlertDescription>{success}</AlertDescription>
        </Alert>
      )}

      {/* Vouchers Table */}
      <Card>
        <CardHeader>
          <CardTitle>Vouchers ({filteredVouchers.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {filteredVouchers.map((voucher) => (
              <div
                key={voucher.id}
                className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50"
              >
                <div className="flex items-center space-x-3">
                  <input
                    type="checkbox"
                    checked={selectedVouchers.includes(voucher.code)}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setSelectedVouchers(prev => [...prev, voucher.code])
                      } else {
                        setSelectedVouchers(prev => prev.filter(code => code !== voucher.code))
                      }
                    }}
                    className="rounded"
                  />
                  <div>
                    <div className="font-mono text-sm font-medium">{voucher.code}</div>
                    <div className="text-xs text-muted-foreground">
                      {voucher.campaignName} • Created {formatDistanceToNow(voucher.createdAt)} ago
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center space-x-3">
                  <div className="text-right text-sm">
                    <div className="font-medium">{voucher.creditAmount} credits</div>
                    <div className="text-muted-foreground">
                      {voucher.usedCount}/{voucher.usageLimit} used
                    </div>
                  </div>
                  {getStatusBadge(voucher)}
                </div>
              </div>
            ))}
            
            {filteredVouchers.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                No vouchers found matching your criteria
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
