'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Loader2, CheckCircle, XCircle, CreditCard } from 'lucide-react'

export default function TestStripePage() {
  const [result, setResult] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [testUserId] = useState('test-user-123')
  const [testEmail] = useState('test@example.com')
  const [selectedPlan, setSelectedPlan] = useState('premium')

  const testStripeConfig = async () => {
    setLoading(true)
    setError('')
    setResult(null)

    try {
      const response = await fetch('/api/test-stripe')
      const data = await response.json()
      
      if (response.ok) {
        setResult(data)
      } else {
        setError(data.error || 'Stripe test failed')
      }
    } catch (err) {
      setError('Failed to test Stripe configuration')
    } finally {
      setLoading(false)
    }
  }

  const testCheckout = async () => {
    setLoading(true)
    setError('')
    setResult(null)

    const priceId = selectedPlan === 'premium' 
      ? process.env.NEXT_PUBLIC_STRIPE_PREMIUM_PRICE_ID || 'price_premium_test'
      : process.env.NEXT_PUBLIC_STRIPE_PRO_PRICE_ID || 'price_pro_test'

    try {
      const response = await fetch('/api/test-stripe', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          priceId,
          userId: testUserId,
          userEmail: testEmail
        })
      })

      const data = await response.json()
      
      if (response.ok) {
        setResult(data)
        // In real app, redirect to checkout
        if (data.url) {
          window.open(data.url, '_blank')
        }
      } else {
        setError(data.error || 'Checkout creation failed')
      }
    } catch (err) {
      setError('Failed to create checkout session')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="container mx-auto py-8 px-4 max-w-4xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Stripe Integration Test</h1>
        <p className="text-gray-600">
          Test your Stripe configuration and payment functionality.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Configuration Test */}
        <Card>
          <CardHeader>
            <CardTitle>Configuration Test</CardTitle>
            <CardDescription>
              Test if Stripe API keys are properly configured
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button 
              onClick={testStripeConfig} 
              disabled={loading}
              className="w-full"
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Testing...
                </>
              ) : (
                'Test Stripe Configuration'
              )}
            </Button>
          </CardContent>
        </Card>

        {/* Checkout Test */}
        <Card>
          <CardHeader>
            <CardTitle>Checkout Test</CardTitle>
            <CardDescription>
              Test creating a checkout session
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium mb-2 block">
                Test Plan:
              </label>
              <Select value={selectedPlan} onValueChange={setSelectedPlan}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="premium">Premium Plan ($9.99/month)</SelectItem>
                  <SelectItem value="pro">Pro Plan ($19.99/month)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">
                Test User ID:
              </label>
              <Input value={testUserId} disabled />
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">
                Test Email:
              </label>
              <Input value={testEmail} disabled />
            </div>

            <Button 
              onClick={testCheckout} 
              disabled={loading}
              className="w-full"
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Creating...
                </>
              ) : (
                <>
                  <CreditCard className="h-4 w-4 mr-2" />
                  Test Checkout
                </>
              )}
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Results */}
      {(result || error) && (
        <Card className="mt-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              {error ? (
                <>
                  <XCircle className="h-5 w-5 text-red-500" />
                  Error
                </>
              ) : (
                <>
                  <CheckCircle className="h-5 w-5 text-green-500" />
                  Result
                </>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {error ? (
              <div className="text-red-600 bg-red-50 p-4 rounded-md">
                <p className="font-medium">Error:</p>
                <p>{error}</p>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="bg-green-50 p-4 rounded-md">
                  <p className="font-medium text-green-800 mb-2">
                    ✅ {result.message || 'Test successful!'}
                  </p>
                  
                  {result.account && (
                    <div className="text-sm text-green-700">
                      <p><strong>Account ID:</strong> {result.account.id}</p>
                      <p><strong>Country:</strong> {result.account.country}</p>
                      <p><strong>Email:</strong> {result.account.email}</p>
                      <p><strong>Charges Enabled:</strong> {result.account.charges_enabled ? 'Yes' : 'No'}</p>
                    </div>
                  )}

                  {result.keys && (
                    <div className="text-sm text-green-700 mt-2">
                      <p><strong>Configuration Status:</strong></p>
                      <ul className="list-disc list-inside ml-2">
                        <li>Secret Key: {result.keys.secret_key_configured ? '✅' : '❌'}</li>
                        <li>Publishable Key: {result.keys.publishable_key_configured ? '✅' : '❌'}</li>
                        <li>Webhook Secret: {result.keys.webhook_secret_configured ? '✅' : '❌'}</li>
                        <li>Premium Price ID: {result.keys.premium_price_id_configured ? '✅' : '❌'}</li>
                        <li>Pro Price ID: {result.keys.pro_price_id_configured ? '✅' : '❌'}</li>
                      </ul>
                    </div>
                  )}

                  {result.sessionId && (
                    <div className="text-sm text-green-700 mt-2">
                      <p><strong>Checkout Session:</strong> {result.sessionId}</p>
                      {result.url && (
                        <p><strong>Checkout URL:</strong> <a href={result.url} target="_blank" className="underline">Open Checkout</a></p>
                      )}
                    </div>
                  )}
                </div>

                <details className="text-xs">
                  <summary className="cursor-pointer text-gray-600 hover:text-gray-800">
                    Show raw response
                  </summary>
                  <pre className="mt-2 bg-gray-100 p-2 rounded text-xs overflow-auto">
                    {JSON.stringify(result, null, 2)}
                  </pre>
                </details>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Instructions */}
      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Setup Instructions</CardTitle>
        </CardHeader>
        <CardContent className="text-sm space-y-2">
          <p><strong>1.</strong> Create Stripe account at stripe.com</p>
          <p><strong>2.</strong> Get API keys from Developers → API keys</p>
          <p><strong>3.</strong> Create products and get Price IDs</p>
          <p><strong>4.</strong> Add keys to .env.local:</p>
          <ul className="list-disc list-inside ml-4 text-xs">
            <li><code>STRIPE_SECRET_KEY=sk_test_...</code></li>
            <li><code>NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...</code></li>
            <li><code>STRIPE_PREMIUM_PRICE_ID=price_...</code></li>
            <li><code>STRIPE_PRO_PRICE_ID=price_...</code></li>
          </ul>
          <p><strong>5.</strong> Restart development server</p>
        </CardContent>
      </Card>
    </div>
  )
}
