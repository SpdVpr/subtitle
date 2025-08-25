'use client'

import { useState } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { useCredits } from '@/contexts/credits-context'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Coins, Zap, CheckCircle, AlertCircle, Loader2 } from 'lucide-react'
import Link from 'next/link'

export default function DebugPaymentPage() {
  const { user } = useAuth()
  const { credits, refreshCredits } = useCredits()
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<any>(null)
  const [testCredits, setTestCredits] = useState(100)

  const simulatePayment = async () => {
    if (!user) {
      alert('Please log in first')
      return
    }

    setLoading(true)
    setResult(null)

    try {
      const response = await fetch('/api/debug/simulate-payment', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: user.uid,
          credits: testCredits,
          amount: testCredits // 1 credit = 1 cent for test
        })
      })

      const data = await response.json()
      setResult(data)

      if (data.success) {
        // Refresh credits display
        await refreshCredits()
      }
    } catch (error) {
      console.error('Simulate payment error:', error)
      setResult({
        success: false,
        error: 'Failed to simulate payment'
      })
    } finally {
      setLoading(false)
    }
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Debug Payment</CardTitle>
            <CardDescription>Please log in to test payment simulation</CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild className="w-full">
              <Link href="/login">
                Log In
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="container mx-auto max-w-2xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">Payment Debug Tool</h1>
          <p className="text-muted-foreground">
            Test payment simulation while webhook is being set up
          </p>
        </div>

        {/* Current Credits */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Coins className="h-5 w-5 text-primary" />
              Current Credits
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-primary">
              {credits?.toLocaleString() || 0}
            </div>
            <p className="text-sm text-muted-foreground mt-1">
              User ID: {user.uid}
            </p>
          </CardContent>
        </Card>

        {/* Simulate Payment */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Zap className="h-5 w-5 text-primary" />
              Simulate Payment
            </CardTitle>
            <CardDescription>
              This will add credits to your account as if you made a successful payment
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label htmlFor="credits" className="text-sm font-medium">
                Credits to add:
              </label>
              <Input
                id="credits"
                type="number"
                value={testCredits}
                onChange={(e) => setTestCredits(parseInt(e.target.value) || 100)}
                min="1"
                max="10000"
                className="mt-1"
              />
            </div>

            <Button
              onClick={simulatePayment}
              disabled={loading}
              className="w-full"
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Simulating Payment...
                </>
              ) : (
                <>
                  <Zap className="h-4 w-4 mr-2" />
                  Simulate Payment (+{testCredits} credits)
                </>
              )}
            </Button>
          </CardContent>
        </Card>

        {/* Result */}
        {result && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                {result.success ? (
                  <CheckCircle className="h-5 w-5 text-green-500" />
                ) : (
                  <AlertCircle className="h-5 w-5 text-red-500" />
                )}
                Result
              </CardTitle>
            </CardHeader>
            <CardContent>
              {result.success ? (
                <Alert className="border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-950/30">
                  <CheckCircle className="h-4 w-4 text-green-600 dark:text-green-400" />
                  <AlertDescription className="text-green-800 dark:text-green-200">
                    ✅ Success! Added {result.data?.credits} credits to your account.
                  </AlertDescription>
                </Alert>
              ) : (
                <Alert className="border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-950/30">
                  <AlertCircle className="h-4 w-4 text-red-600 dark:text-red-400" />
                  <AlertDescription className="text-red-800 dark:text-red-200">
                    ❌ Error: {result.error}
                  </AlertDescription>
                </Alert>
              )}
              
              <details className="mt-4">
                <summary className="cursor-pointer text-sm font-medium">
                  View Details
                </summary>
                <pre className="mt-2 text-xs bg-muted p-2 rounded overflow-auto">
                  {JSON.stringify(result, null, 2)}
                </pre>
              </details>
            </CardContent>
          </Card>
        )}

        {/* Instructions */}
        <Card>
          <CardHeader>
            <CardTitle>Next Steps</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="text-sm">
              <h4 className="font-medium mb-2">To fix the real payment system:</h4>
              <ol className="list-decimal list-inside space-y-1 text-muted-foreground">
                <li>Set up webhook in Stripe Dashboard</li>
                <li>Update Payment Links with Success URLs</li>
                <li>Test with real $1 payment</li>
                <li>Remove this debug tool</li>
              </ol>
            </div>
            
            <div className="flex gap-2">
              <Button variant="outline" asChild>
                <Link href="/buy-credits">
                  Try Real Payment
                </Link>
              </Button>
              <Button variant="outline" asChild>
                <Link href="/dashboard">
                  View Dashboard
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}


