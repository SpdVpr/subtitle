'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { RefreshCw, TrendingUp, TrendingDown, Plus, Minus, DollarSign } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'

interface CreditTransaction {
  id: string
  userId: string
  userEmail: string
  type: 'topup' | 'deduction' | 'refund' | 'bonus'
  amount: number
  balanceBefore: number
  balanceAfter: number
  reason: string
  createdAt: Date
  adminId?: string
  adminEmail?: string
  source?: string
  voucherDetails?: {
    voucherCode: string
    campaignName: string
    voucherDescription: string
  }
}

interface CreditHistoryProps {
  onRefresh?: () => void
}

export function CreditHistory({ onRefresh }: CreditHistoryProps) {
  const [transactions, setTransactions] = useState<CreditTransaction[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const loadCreditHistory = async () => {
    try {
      setLoading(true)
      setError(null)

      // Get admin email from localStorage (same as other admin components)
      let adminEmail = ''
      if (typeof window !== 'undefined') {
        adminEmail = localStorage.getItem('adminEmail') || ''
      }

      // Fallback to demo admin email if not set
      if (!adminEmail) {
        adminEmail = 'premium@test.com'
        if (typeof window !== 'undefined') {
          localStorage.setItem('adminEmail', adminEmail)
        }
      }

      console.log('🔑 Credit History - Loading with email:', adminEmail)

      const response = await fetch('/api/admin/credit-history', {
        headers: { 'x-admin-email': adminEmail }
      })

      if (!response.ok) {
        const errorText = await response.text()
        console.error('❌ Credit History API failed:', response.status, errorText)
        throw new Error(`Failed to load credit history: ${response.status}`)
      }

      const data = await response.json()
      setTransactions(data.transactions || [])
    } catch (err) {
      console.error('Failed to load credit history:', err)
      setError(err instanceof Error ? err.message : 'Failed to load credit history')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadCreditHistory()
  }, [])

  const getTransactionIcon = (type: string) => {
    switch (type) {
      case 'topup':
        return <Plus className="h-4 w-4 text-green-600" />
      case 'deduction':
        return <Minus className="h-4 w-4 text-red-600" />
      case 'refund':
        return <TrendingUp className="h-4 w-4 text-blue-600" />
      case 'bonus':
        return <DollarSign className="h-4 w-4 text-purple-600" />
      default:
        return <TrendingUp className="h-4 w-4 text-gray-600" />
    }
  }

  const getTransactionBadge = (type: string) => {
    switch (type) {
      case 'topup':
        return <Badge className="bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300 border-green-200 dark:border-green-800/30">Top Up</Badge>
      case 'deduction':
        return <Badge className="bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300 border-red-200 dark:border-red-800/30">Deduction</Badge>
      case 'refund':
        return <Badge className="bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 border-blue-200 dark:border-blue-800/30">Refund</Badge>
      case 'bonus':
        return <Badge className="bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-300 border-purple-200 dark:border-purple-800/30">Bonus</Badge>
      default:
        return <Badge variant="secondary">{type}</Badge>
    }
  }

  const formatAmount = (amount: number, type: string) => {
    const sign = type === 'topup' || type === 'refund' || type === 'bonus' ? '+' : '-'
    return `${sign}${Math.abs(amount).toFixed(2)}`
  }

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <TrendingUp className="w-5 h-5 text-blue-600" />
            <span>Credit History</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <RefreshCw className="h-6 w-6 animate-spin text-gray-400 dark:text-muted-foreground" />
            <span className="ml-2 text-gray-600 dark:text-muted-foreground">Loading credit history...</span>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <TrendingUp className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            <span>Credit History</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <p className="text-red-600 dark:text-red-400 mb-4">{error}</p>
            <Button onClick={loadCreditHistory} variant="outline">
              <RefreshCw className="h-4 w-4 mr-2" />
              Retry
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="flex items-center space-x-2">
          <TrendingUp className="w-5 h-5 text-blue-600 dark:text-blue-400" />
          <span>Credit History</span>
        </CardTitle>
        <Button
          onClick={() => {
            loadCreditHistory()
            onRefresh?.()
          }}
          variant="outline"
          size="sm"
        >
          <RefreshCw className="h-4 w-4 mr-2" />
          Refresh
        </Button>
      </CardHeader>
      <CardContent>
        {transactions.length === 0 ? (
          <div className="text-center py-8 text-gray-500 dark:text-muted-foreground">
            No credit transactions found
          </div>
        ) : (
          <div className="space-y-4 max-h-96 overflow-y-auto">
            {transactions.map((transaction) => (
              <div
                key={transaction.id}
                className="flex items-center justify-between p-4 border border-gray-200 dark:border-border rounded-lg hover:bg-gray-50 dark:hover:bg-card"
              >
                <div className="flex items-center space-x-4">
                  <div className="flex-shrink-0">
                    {getTransactionIcon(transaction.type)}
                  </div>
                  <div>
                    <div className="flex items-center space-x-2 mb-1">
                      <span className="font-medium text-gray-900 dark:text-foreground">
                        {transaction.userEmail}
                      </span>
                      {getTransactionBadge(transaction.type)}
                    </div>
                    <div className="text-sm text-gray-600 dark:text-muted-foreground">
                      {transaction.reason}
                      {transaction.voucherDetails && (
                        <div className="text-xs text-blue-600 dark:text-blue-400 mt-1">
                          🎫 Voucher: {transaction.voucherDetails.voucherCode}
                          ({transaction.voucherDetails.campaignName})
                        </div>
                      )}
                    </div>
                    <div className="text-xs text-gray-500 dark:text-muted-foreground mt-1">
                      {formatDistanceToNow(new Date(transaction.createdAt), { addSuffix: true })}
                      {transaction.adminEmail && (
                        <span className="ml-2">by {transaction.adminEmail}</span>
                      )}
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className={`text-lg font-bold ${
                    transaction.type === 'topup' || transaction.type === 'refund' || transaction.type === 'bonus'
                      ? 'text-green-600'
                      : 'text-red-600'
                  }`}>
                    {formatAmount(transaction.amount, transaction.type)}
                  </div>
                  <div className="text-xs text-gray-500 dark:text-muted-foreground">
                    Balance: {transaction.balanceAfter.toFixed(2)}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
