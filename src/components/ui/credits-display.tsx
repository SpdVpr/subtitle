'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Coins, Plus, Info } from 'lucide-react'
import Link from 'next/link'

interface CreditsDisplayProps {
  showBuyButton?: boolean
  className?: string
  onRefresh?: (refreshFn: () => void) => void
}

export function CreditsDisplay({ showBuyButton = true, className = '', onRefresh }: CreditsDisplayProps) {
  const { user } = useAuth()
  const [credits, setCredits] = useState<number | null>(null)
  const [loading, setLoading] = useState(true)

  const fetchCredits = async () => {
    if (!user) {
      setLoading(false)
      return
    }

    try {
      const response = await fetch(`/api/user/credits?userId=${user.uid}`)
      if (response.ok) {
        const data = await response.json()
        setCredits(data.credits || 0)
      } else {
        console.error('Failed to fetch credits:', response.status)
        setCredits(0)
      }
    } catch (error) {
      console.error('Failed to fetch credits:', error)
      setCredits(0)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    // Only fetch credits if user exists and we don't already have credits
    if (user && credits === null) {
      fetchCredits()
    }
  }, [user, credits])

  // Expose refresh function to parent
  useEffect(() => {
    if (onRefresh) {
      onRefresh(fetchCredits)
    }
  }, [onRefresh])

  // Listen for global credit refresh events
  useEffect(() => {
    const handleRefreshCredits = () => {
      console.log('🔄 Credits refresh triggered in CreditsDisplay')
      fetchCredits()
    }

    window.addEventListener('refreshCredits', handleRefreshCredits)

    return () => {
      window.removeEventListener('refreshCredits', handleRefreshCredits)
    }
  }, [])

  if (!user || loading) {
    return (
      <div className={`flex items-center space-x-2 ${className}`}>
        <div className="w-4 h-4 bg-gray-200 dark:bg-muted rounded animate-pulse" />
        <div className="w-16 h-4 bg-gray-200 dark:bg-muted rounded animate-pulse" />
      </div>
    )
  }

  const creditsValue = Number(credits) || 0
  const isLowCredits = creditsValue < 5

  return (
    <div className={`flex items-center space-x-2 ${className}`}>
      <div className={`flex items-center space-x-1 px-2 py-1 rounded-full text-sm font-medium ${isLowCredits
          ? 'bg-destructive/10 text-destructive'
          : 'bg-primary/10 text-primary'
        }`}>
        <Coins className="w-4 h-4" />
        <span>{creditsValue.toFixed(1)}</span>
      </div>

      {showBuyButton && (
        <Button size="sm" variant="outline" asChild>
          <Link href="/buy-credits">
            <Plus className="w-3 h-3 mr-1" />
            Buy
          </Link>
        </Button>
      )}
    </div>
  )
}

export function CreditsCard() {
  const { user } = useAuth()
  const [credits, setCredits] = useState<number | null>(null)
  const [totalPurchased, setTotalPurchased] = useState<number>(0)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchCredits = async () => {
      if (!user) {
        setLoading(false)
        return
      }

      try {
        const response = await fetch(`/api/user/credits?userId=${user.uid}`)
        if (response.ok) {
          const data = await response.json()
          setCredits(data.credits || 0)
          setTotalPurchased(data.totalPurchased || 0)
        } else {
          console.error('Failed to fetch credits:', response.status)
          setCredits(0)
        }
      } catch (error) {
        console.error('Failed to fetch credits:', error)
        setCredits(0)
      } finally {
        setLoading(false)
      }
    }

    fetchCredits()
  }, [user])

  if (!user) return null

  const creditsValue = credits || 0
  const isLowCredits = creditsValue < 5

  return (
    <Card className="w-full">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center space-x-2">
          <Coins className="w-5 h-5 text-blue-600 dark:text-primary" />
          <span>Credits Balance</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {loading ? (
          <div className="space-y-2">
            <div className="w-24 h-8 bg-gray-200 dark:bg-muted rounded animate-pulse" />
            <div className="w-32 h-4 bg-gray-200 dark:bg-muted rounded animate-pulse" />
          </div>
        ) : (
          <>
            <div className="flex items-baseline space-x-2">
              <span className={`text-3xl font-bold ${isLowCredits ? 'text-red-600 dark:text-red-400' : 'text-blue-600 dark:text-primary'}`}>
                {creditsValue.toFixed(1)}
              </span>
              <span className="text-gray-500 dark:text-muted-foreground">credits</span>
            </div>

            {isLowCredits && (
              <div className="flex items-center space-x-2 text-destructive bg-destructive/10 p-2 rounded">
                <Info className="w-4 h-4" />
                <span className="text-sm">Low credits - consider buying more</span>
              </div>
            )}

            <div className="text-sm text-muted-foreground">
              Total purchased: {totalPurchased.toFixed(1)} credits
            </div>

            <div className="space-y-2">
              <Button asChild className="w-full">
                <Link href="/buy-credits">
                  <Plus className="w-4 h-4 mr-2" />
                  Buy More Credits
                </Link>
              </Button>

              <div className="text-xs text-muted-foreground space-y-1">
                <div>• Standard: 0.5 credits per 20 lines</div>
                <div>• Premium: 1.5 credits per 20 lines</div>
                <div>• Includes context research & cultural adaptation</div>
                <div>• 1 USD = 100 credits</div>
              </div>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  )
}
