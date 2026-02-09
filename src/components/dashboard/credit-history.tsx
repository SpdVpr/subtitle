'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { 
  TrendingUp, 
  TrendingDown, 
  Gift, 
  CreditCard, 
  Settings, 
  Zap,
  RefreshCw,
  Calendar,
  Loader2
} from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'
import { formatDistanceToNow } from 'date-fns'

interface CreditTransaction {
  id: string
  type: 'topup' | 'deduction' | 'purchase' | 'adjustment'
  amount: number
  balanceBefore: number
  balanceAfter: number
  reason: string
  source?: string | null
  createdAt: Date
  voucherDetails?: {
    voucherCode: string
    campaignName: string
    voucherDescription?: string
  } | null
  adminEmail?: string | null
  relatedJobId?: string | null
  batchNumber?: number | null
}

interface CreditHistoryProps {
  showHeader?: boolean
}

export function CreditHistory({ showHeader = true }: CreditHistoryProps) {
  const { user } = useAuth()
  const [transactions, setTransactions] = useState<CreditTransaction[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const loadCreditHistory = async () => {
    if (!user) return

    try {
      setLoading(true)
      setError(null)

      const response = await fetch(`/api/user/credit-history?userId=${user.uid}&limit=50`)
      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to load credit history')
      }

      // Convert date strings back to Date objects
      const processedTransactions = data.transactions.map((tx: any) => ({
        ...tx,
        createdAt: new Date(tx.createdAt)
      }))

      setTransactions(processedTransactions)
    } catch (err) {
      console.error('Failed to load credit history:', err)
      setError(err instanceof Error ? err.message : 'Failed to load credit history')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadCreditHistory()
  }, [user])

  const getTransactionIcon = (transaction: CreditTransaction) => {
    if (transaction.source === 'voucher') return <Gift className="w-4 h-4" />
    if (transaction.source === 'purchase') return <CreditCard className="w-4 h-4" />
    if (transaction.adminEmail) return <Settings className="w-4 h-4" />
    if (transaction.type === 'deduction') return <Zap className="w-4 h-4" />
    return <TrendingUp className="w-4 h-4" />
  }

  const getTransactionColor = (transaction: CreditTransaction) => {
    if (transaction.type === 'topup') return 'text-green-600'
    if (transaction.type === 'deduction') return 'text-red-600'
    return 'text-blue-600'
  }

  const getTransactionBadgeVariant = (transaction: CreditTransaction) => {
    if (transaction.source === 'voucher') return 'secondary'
    if (transaction.source === 'purchase') return 'default'
    if (transaction.adminEmail) return 'outline'
    if (transaction.type === 'deduction') return 'destructive'
    return 'default'
  }

  const formatAmount = (amount: number, type: string) => {
    const sign = type === 'deduction' ? '-' : '+'
    return `${sign}${Math.abs(amount)}`
  }

  if (loading) {
    const content = (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )

    if (!showHeader) {
      return <div>{content}</div>
    }

    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <TrendingUp className="w-5 h-5 text-primary" />
            <span>Credit History</span>
          </CardTitle>
          <CardDescription>
            Track your credit transactions and usage
          </CardDescription>
        </CardHeader>
        <CardContent>
          {content}
        </CardContent>
      </Card>
    )
  }

  if (error) {
    const content = (
      <div className="text-center py-8">
        <p className="text-muted-foreground mb-4">{error}</p>
        <Button onClick={loadCreditHistory} variant="outline">
          <RefreshCw className="w-4 h-4 mr-2" />
          Try Again
        </Button>
      </div>
    )

    if (!showHeader) {
      return <div>{content}</div>
    }

    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <TrendingUp className="w-5 h-5 text-primary" />
            <span>Credit History</span>
          </CardTitle>
          <CardDescription>
            Track your credit transactions and usage
          </CardDescription>
        </CardHeader>
        <CardContent>
          {content}
        </CardContent>
      </Card>
    )
  }

  const content = (
    <>
      {transactions.length === 0 ? (
          <div className="text-center py-8">
            <Calendar className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">No credit transactions yet</p>
            <p className="text-sm text-muted-foreground mt-2">
              Your credit purchases, voucher redemptions, and usage will appear here
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {transactions.map((transaction) => (
              <div
                key={transaction.id}
                className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
              >
                <div className="flex items-center space-x-3">
                  <div className={`p-2 rounded-full bg-muted ${getTransactionColor(transaction)}`}>
                    {getTransactionIcon(transaction)}
                  </div>
                  <div>
                    <div className="flex items-center space-x-2">
                      <p className="font-medium">{transaction.reason}</p>
                      {transaction.source && (
                        <Badge variant={getTransactionBadgeVariant(transaction)} className="text-xs">
                          {transaction.source}
                        </Badge>
                      )}
                    </div>
                    <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                      <span>{formatDistanceToNow(transaction.createdAt, { addSuffix: true })}</span>
                      {transaction.voucherDetails && (
                        <span>• Voucher: {transaction.voucherDetails.voucherCode}</span>
                      )}
                      {transaction.adminEmail && (
                        <span>• Admin adjustment</span>
                      )}
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className={`font-bold ${getTransactionColor(transaction)}`}>
                    {formatAmount(transaction.amount, transaction.type)} credits
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Balance: {transaction.balanceAfter}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
    </>
  )

  if (!showHeader) {
    return <div>{content}</div>
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center space-x-2">
              <TrendingUp className="w-5 h-5 text-primary" />
              <span>Credit History</span>
            </CardTitle>
            <CardDescription>
              Track your credit transactions and usage
            </CardDescription>
          </div>
          <Button onClick={loadCreditHistory} variant="outline" size="sm">
            <RefreshCw className="w-4 h-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {content}
      </CardContent>
    </Card>
  )
}
