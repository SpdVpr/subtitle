'use client'

import { useEffect, useState } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { useAuth } from '@/hooks/useAuth'
import { useCredits } from '@/contexts/credits-context'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { CheckCircle, ArrowRight, Sparkles, Coins, Zap } from 'lucide-react'
import Link from 'next/link'

export default function SuccessPage() {
  const { user } = useAuth()
  const { refreshCredits } = useCredits()
  const searchParams = useSearchParams()
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(true)

  const credits = searchParams.get('credits')
  const amount = searchParams.get('amount')
  const sessionId = searchParams.get('session_id')
  const success = searchParams.get('success')
  const payment = searchParams.get('payment')
  const chargeId = searchParams.get('charge_id') || searchParams.get('invoice_id')

  // Parse amount - handle both numeric and placeholder values
  const parsedAmount = amount && amount !== '{CHECKOUT_SESSION_TOTAL_AMOUNT}'
    ? parseInt(amount) / 100
    : credits ? parseInt(credits) * 0.01 : null

  useEffect(() => {
    let mounted = true

    const handleBitcoinPayment = async () => {
      if (payment === 'bitcoin' && chargeId && user && credits) {
        console.log('🟠 Bitcoin payment detected, checking status:', chargeId)

        try {
          // Check charge status and manually add credits if needed
          const response = await fetch(`/api/opennode/create-invoice?chargeId=${chargeId}`)
          const data = await response.json()

          if (data.success && data.charge.status === 'paid') {
            console.log('🟠 Bitcoin charge is paid, ensuring credits are added')

            // Try to add credits manually as fallback
            const addCreditsResponse = await fetch('/api/debug/add-credits', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                userId: user.uid,
                credits: parseInt(credits),
                description: `Bitcoin Lightning payment - Charge ${chargeId}`
              })
            })

            if (addCreditsResponse.ok) {
              console.log('✅ Credits added manually for Bitcoin payment')
              refreshCredits()
            }
          }
        } catch (error) {
          console.error('🚨 Failed to check Bitcoin payment status:', error)
        }
      }
    }

    // Refresh credits when page loads
    if (user && mounted) {
      refreshCredits()

      // Handle Bitcoin payment fallback
      if (payment === 'bitcoin') {
        handleBitcoinPayment()
      }
    }

    // Simulate loading for better UX
    const timer = setTimeout(() => {
      if (mounted) {
        setIsLoading(false)
      }
    }, 3000) // Increased to 3 seconds to allow webhook processing

    return () => {
      mounted = false
      clearTimeout(timer)
    }
  }, [user, payment, chargeId, credits]) // Added dependencies

  if (!success) {
    router.push('/buy-credits')
    return null
  }

  const handleContinue = () => {
    router.push('/translate')
  }

  const handleRefreshCredits = async () => {
    if (user) {
      await refreshCredits()
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="p-8 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
            <h2 className="text-xl font-semibold mb-2">Processing your purchase...</h2>
            <p className="text-gray-600">Please wait while we add credits to your account.</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 dark:from-background dark:to-card flex items-center justify-center p-4">
      <Card className="w-full max-w-lg">
        <CardHeader className="text-center pb-4">
          <div className="mx-auto mb-4 p-3 bg-green-100 dark:bg-green-900/30 rounded-full w-fit">
            <CheckCircle className="h-8 w-8 text-green-600 dark:text-green-400" />
          </div>
          <CardTitle className="text-2xl font-bold text-gray-900 dark:text-foreground">
            🎉 Credits Added Successfully!
          </CardTitle>
        </CardHeader>

        <CardContent className="space-y-6">
          <div className="text-center">
            <div className="flex items-center justify-center space-x-2 mb-4">
              <Coins className="h-8 w-8 text-yellow-500" />
              <span className="text-3xl font-bold text-green-600">
                {credits ? `+${parseInt(credits).toLocaleString()}` : '+500'}
              </span>
              <span className="text-lg text-muted-foreground">credits</span>
            </div>
            {parsedAmount && (
              <p className="text-sm text-muted-foreground mb-4">
                Payment of ${parsedAmount.toFixed(2)} processed successfully
              </p>
            )}
            {sessionId && (
              <p className="text-xs text-muted-foreground mb-4">
                Session ID: {sessionId}
              </p>
            )}
            <h3 className="text-lg font-semibold mb-2">Payment Successful!</h3>
            <p className="text-gray-600 dark:text-muted-foreground mb-4">
              Your credits have been added to your account. You can now:
            </p>
          </div>

          <div className="space-y-3">
            <div className="flex items-center space-x-3">
              <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0" />
              <span className="text-sm text-gray-700 dark:text-foreground">Translate subtitle files with AI</span>
            </div>
            <div className="flex items-center space-x-3">
              <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0" />
              <span className="text-sm text-gray-700 dark:text-foreground">Use Premium Context AI features</span>
            </div>
            <div className="flex items-center space-x-3">
              <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0" />
              <span className="text-sm text-gray-700 dark:text-foreground">Process multiple files in batch</span>
            </div>
            <div className="flex items-center space-x-3">
              <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0" />
              <span className="text-sm text-gray-700 dark:text-foreground">Credits never expire</span>
            </div>
          </div>

          <div className="bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800/30 rounded-lg p-4">
            <h4 className="font-semibold text-blue-900 dark:text-blue-300 mb-2 flex items-center gap-2">
              <Zap className="h-4 w-4" />
              Ready to Start Translating?
            </h4>
            <ul className="text-sm text-blue-800 dark:text-blue-300 space-y-1">
              <li>• Upload your subtitle files (.srt, .vtt, .ass)</li>
              <li>• Choose your target language</li>
              <li>• Let our AI do the translation magic</li>
              <li>• Download your translated subtitles</li>
            </ul>
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <Button
              onClick={handleContinue}
              className="flex-1 flex items-center justify-center space-x-2"
            >
              <Zap className="h-4 w-4" />
              <span>Start Translating</span>
              <ArrowRight className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              asChild
              className="flex-1"
            >
              <Link href="/dashboard">
                View Dashboard
              </Link>
            </Button>
          </div>



          <div className="text-center">
            <p className="text-xs text-gray-500 dark:text-muted-foreground">
              Need help? Contact our support team at{' '}
              <a href="mailto:support@subtitlebot.com" className="text-blue-600 dark:text-blue-400 hover:underline">
                support@subtitlebot.com
              </a>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
