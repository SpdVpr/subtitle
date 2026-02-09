'use client'

import { useState } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Coins, CheckCircle, AlertCircle, Loader2, CreditCard } from 'lucide-react'

export default function DebugProcessPaymentsPage() {
  const { user } = useAuth()
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<any>(null)

  const processPayments = async () => {
    if (!user) {
      alert('Please log in first')
      return
    }

    setLoading(true)
    setResult(null)

    try {
      const response = await fetch('/api/debug/process-pending-payments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: user.uid
        })
      })

      const data = await response.json()
      setResult(data)
    } catch (error) {
      console.error('Process payments error:', error)
      setResult({
        success: false,
        error: 'Failed to process payments'
      })
    } finally {
      setLoading(false)
    }
  }

  const checkPayments = async () => {
    if (!user) {
      alert('Please log in first')
      return
    }

    try {
      const response = await fetch(`/api/debug/check-payment?userId=${user.uid}`)
      const data = await response.json()
      setResult(data)
    } catch (error) {
      console.error('Check payments error:', error)
      setResult({
        success: false,
        error: 'Failed to check payments'
      })
    }
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Debug Process Payments</CardTitle>
            <CardDescription>Please log in to process pending payments</CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild className="w-full">
              <a href="/login">Log In</a>
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
          <h1 className="text-3xl font-bold text-foreground mb-2">Process Pending Payments</h1>
          <p className="text-muted-foreground">
            Check for payments that were recorded but credits weren't added
          </p>
        </div>

        {/* Actions */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CreditCard className="h-5 w-5 text-primary" />
              Payment Processing
            </CardTitle>
            <CardDescription>
              User ID: {user.uid}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-4">
              <Button
                onClick={checkPayments}
                variant="outline"
                className="flex-1"
              >
                Check Payments
              </Button>
              
              <Button
                onClick={processPayments}
                disabled={loading}
                className="flex-1"
              >
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    <Coins className="h-4 w-4 mr-2" />
                    Process Pending
                  </>
                )}
              </Button>
            </div>
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
                    ✅ {result.message}
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
                <pre className="mt-2 text-xs bg-muted p-2 rounded overflow-auto max-h-96">
                  {JSON.stringify(result, null, 2)}
                </pre>
              </details>
            </CardContent>
          </Card>
        )}

        {/* Instructions */}
        <Card>
          <CardHeader>
            <CardTitle>How it works</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="text-sm">
              <h4 className="font-medium mb-2">This tool will:</h4>
              <ol className="list-decimal list-inside space-y-1 text-muted-foreground">
                <li>Find payments in Firestore that were recorded</li>
                <li>Check if corresponding credit transactions exist</li>
                <li>Process any payments that didn't add credits</li>
                <li>Add the missing credits to your account</li>
              </ol>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
