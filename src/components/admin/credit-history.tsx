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
  type: 'topup' | 'deduction' | 'refund' | 'bonus' | 'credit'
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
        return <Plus className="h-4 w-4 text-green-600 dark:text-green-400" />
      case 'credit':
        return <Plus className="h-4 w-4 text-green-600 dark:text-green-400" />
      case 'deduction':
        return <Minus className="h-4 w-4 text-red-600 dark:text-red-400" />
      case 'refund':
        return <TrendingUp className="h-4 w-4 text-blue-600 dark:text-blue-400" />
      case 'bonus':
        return <DollarSign className="h-4 w-4 text-purple-600 dark:text-purple-400" />
      default:
        return <TrendingUp className="h-4 w-4 text-gray-600 dark:text-gray-400" />
    }
  }

  const getTransactionBadge = (type: string) => {
    switch (type) {
      case 'topup':
        return <Badge className="bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300 border-green-200 dark:border-green-800/30">Top Up</Badge>
      case 'credit':
        return <Badge className="bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300 border-green-200 dark:border-green-800/30">Credit</Badge>
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
    // Pro topup, credit, refund a bonus zobrazujeme kladné číslo bez znaménka
    // Pro deduction zobrazujeme záporné číslo
    if (type === 'topup' || type === 'credit' || type === 'refund' || type === 'bonus') {
      return `+${Math.abs(amount).toFixed(2)}`
    } else {
      return `-${Math.abs(amount).toFixed(2)}`
    }
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
      <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4 pb-3 sm:pb-6">
        <CardTitle className="flex items-center space-x-2 text-lg sm:text-xl">
          <TrendingUp className="w-4 w-4 sm:w-5 sm:h-5 text-blue-600 dark:text-blue-400 flex-shrink-0" />
          <span>Credit History</span>
        </CardTitle>
        <Button
          onClick={() => {
            loadCreditHistory()
            onRefresh?.()
          }}
          variant="outline"
          size="sm"
          className="self-end sm:self-auto"
        >
          <RefreshCw className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
          <span className="hidden xs:inline">Refresh</span>
          <span className="xs:hidden">🔄</span>
        </Button>
      </CardHeader>
      <CardContent>
        {transactions.length === 0 ? (
          <div className="text-center py-8 text-gray-500 dark:text-muted-foreground">
            No credit transactions found
          </div>
        ) : (
          <div className="space-y-3 sm:space-y-4 max-h-80 sm:max-h-96 overflow-y-auto">
            {transactions.map((transaction) => (
              <div
                key={transaction.id}
                className="flex items-center justify-between p-3 sm:p-4 border border-gray-200 dark:border-border rounded-lg hover:bg-gray-50 dark:hover:bg-card gap-2 sm:gap-4"
              >
                <div className="flex items-center space-x-2 sm:space-x-4 flex-1 min-w-0">
                  <div className="flex-shrink-0">
                    {getTransactionIcon(transaction.type)}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center space-x-1 sm:space-x-2 mb-1">
                      <span className="font-medium text-gray-900 dark:text-foreground text-sm sm:text-base truncate">
                        {transaction.userEmail}
                      </span>
                      <div className="flex-shrink-0">
                        {getTransactionBadge(transaction.type)}
                      </div>
                    </div>
                    <div className="text-xs sm:text-sm text-gray-600 dark:text-muted-foreground">
                      {transaction.type === 'topup' || transaction.type === 'credit' ? (
                        <div>
                          <div className="font-medium text-green-700 dark:text-green-300 text-xs sm:text-sm">
                            💳 Credit Purchase: {Math.abs(transaction.amount).toFixed(2)} credits
                          </div>
                          <div className="text-xs mt-1 truncate">
                            Account: {transaction.userEmail}
                          </div>
                          {transaction.reason && transaction.reason !== 'Credit purchase' && (
                            <div className="text-xs mt-1 truncate">
                              {transaction.reason}
                            </div>
                          )}
                        </div>
                      ) : (
                        <div className="truncate">
                          {transaction.reason}
                          {transaction.type === 'deduction' && (
                            <div className="text-xs mt-1">
                              Used by: {transaction.userEmail}
                            </div>
                          )}
                        </div>
                      )}
                      {transaction.voucherDetails && (
                        <div className="text-xs text-blue-600 dark:text-blue-400 mt-1">
                          🎫 Voucher: {transaction.voucherDetails.voucherCode}
                          ({transaction.voucherDetails.campaignName})
                        </div>
                      )}
                    </div>
                    <div className="text-xs text-gray-500 dark:text-muted-foreground mt-1">
                      <span className="block sm:inline">
                        {formatDistanceToNow(new Date(transaction.createdAt), { addSuffix: true })}
                      </span>
                      {transaction.adminEmail && (
                        <span className="block sm:inline sm:ml-2">by {transaction.adminEmail}</span>
                      )}
                    </div>
                  </div>
                </div>
                <div className="text-right flex-shrink-0">
                  <div className={`text-sm sm:text-lg font-bold ${
                    transaction.type === 'topup' || transaction.type === 'credit' || transaction.type === 'refund' || transaction.type === 'bonus'
                      ? 'text-green-600 dark:text-green-400'
                      : 'text-red-600 dark:text-red-400'
                  }`}>
                    <span className="hidden sm:inline">{formatAmount(transaction.amount, transaction.type)} credits</span>
                    <span className="sm:hidden">{formatAmount(transaction.amount, transaction.type)}</span>
                  </div>
                  <div className="text-xs text-gray-500 dark:text-muted-foreground">
                    <span className="hidden sm:inline">Balance: {transaction.balanceAfter.toFixed(2)} credits</span>
                    <span className="sm:hidden">{transaction.balanceAfter.toFixed(2)}</span>
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
