'use client'

import { useEffect, useState } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { useAuth } from '@/hooks/useAuth'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { CheckCircle, ArrowRight, Sparkles } from 'lucide-react'
import { SUBSCRIPTION_PLANS } from '@/lib/stripe'

export default function SuccessPage() {
  const { user } = useAuth()
  const searchParams = useSearchParams()
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(true)

  const plan = searchParams.get('plan')
  const demo = searchParams.get('demo')
  const success = searchParams.get('success')

  useEffect(() => {
    // Simulate loading for demo
    const timer = setTimeout(() => {
      setIsLoading(false)
    }, 2000)

    return () => clearTimeout(timer)
  }, [])

  if (!success || !plan) {
    router.push('/pricing')
    return null
  }

  const planConfig = SUBSCRIPTION_PLANS[plan as keyof typeof SUBSCRIPTION_PLANS]

  if (!planConfig) {
    router.push('/pricing')
    return null
  }

  const handleContinue = () => {
    router.push('/dashboard')
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="p-8 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <h2 className="text-xl font-semibold mb-2">Processing your subscription...</h2>
            <p className="text-gray-600">Please wait while we set up your account.</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <Card className="w-full max-w-lg">
        <CardHeader className="text-center pb-4">
          <div className="mx-auto mb-4 p-3 bg-green-100 rounded-full w-fit">
            <CheckCircle className="h-8 w-8 text-green-600" />
          </div>
          <CardTitle className="text-2xl font-bold text-gray-900">
            🎉 Welcome to {planConfig.name}!
          </CardTitle>
        </CardHeader>
        
        <CardContent className="space-y-6">
          {demo && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <div className="flex items-center space-x-2">
                <Sparkles className="h-5 w-5 text-yellow-600" />
                <span className="text-sm font-medium text-yellow-800">Demo Mode</span>
              </div>
              <p className="text-sm text-yellow-700 mt-1">
                This is a demo subscription. No actual payment was processed.
              </p>
            </div>
          )}

          <div className="text-center">
            <h3 className="text-lg font-semibold mb-2">Subscription Activated!</h3>
            <p className="text-gray-600 mb-4">
              Your {planConfig.name} plan is now active. You now have access to:
            </p>
          </div>

          <div className="space-y-3">
            {planConfig.features.map((feature, index) => (
              <div key={index} className="flex items-center space-x-3">
                <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0" />
                <span className="text-sm text-gray-700">{feature}</span>
              </div>
            ))}
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h4 className="font-semibold text-blue-900 mb-2">What's Next?</h4>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>• Start translating your subtitle files</li>
              <li>• Explore our Premium Context AI features</li>
              <li>• Access your subscription settings in dashboard</li>
              {plan === 'pro' && <li>• Try batch translation for multiple files</li>}
            </ul>
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <Button 
              onClick={handleContinue}
              className="flex-1 flex items-center justify-center space-x-2"
            >
              <span>Go to Dashboard</span>
              <ArrowRight className="h-4 w-4" />
            </Button>
            <Button 
              variant="outline"
              onClick={() => router.push('/translate')}
              className="flex-1"
            >
              Start Translating
            </Button>
          </div>

          <div className="text-center">
            <p className="text-xs text-gray-500">
              Need help? Contact our support team at{' '}
              <a href="mailto:support@subtitle-ai.com" className="text-blue-600 hover:underline">
                support@subtitle-ai.com
              </a>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
