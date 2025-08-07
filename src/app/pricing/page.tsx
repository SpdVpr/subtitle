'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Check, Star, Zap, Crown } from 'lucide-react'
import { SUBSCRIPTION_PLANS, formatPrice } from '@/lib/stripe'
import { useSubscription } from '@/hooks/useSubscription'
import { useAuth } from '@/hooks/useAuth'

export default function PricingPage() {
  const { user } = useAuth()
  const { subscription, createCheckoutSession } = useSubscription()
  const [loading, setLoading] = useState<string | null>(null)

  const handleUpgrade = async (planId: string) => {
    if (!user) {
      // Redirect to login
      window.location.href = '/login?redirect=/pricing'
      return
    }

    if (planId === 'free') {
      // Free plan doesn't need checkout
      return
    }

    try {
      setLoading(planId)

      const response = await fetch('/api/stripe/checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          plan: planId,
          userId: user.uid,
          userEmail: user.email,
        }),
      })

      const data = await response.json()

      if (data.success && data.url) {
        window.location.href = data.url
      } else {
        throw new Error(data.error || 'Failed to create checkout session')
      }
    } catch (error) {
      console.error('Checkout error:', error)
      alert('Failed to start checkout process. Please try again.')
    } finally {
      setLoading(null)
    }
  }

  const getPlanIcon = (planId: string) => {
    switch (planId) {
      case 'free':
        return <Star className="h-6 w-6" />
      case 'premium':
        return <Zap className="h-6 w-6" />
      case 'pro':
        return <Crown className="h-6 w-6" />
      default:
        return <Star className="h-6 w-6" />
    }
  }

  const isCurrentPlan = (planId: string) => {
    return subscription?.plan === planId
  }

  return (
    <div className="py-8">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-6xl">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4">Choose Your Plan</h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Unlock the full potential of AI-powered subtitle translation with our flexible pricing plans
          </p>
        </div>

        {/* Pricing Cards */}
        <div className="grid md:grid-cols-3 gap-8 mb-12 max-w-5xl mx-auto">
          {Object.entries(SUBSCRIPTION_PLANS).map(([planId, plan]) => (
            <Card 
              key={planId} 
              className={`relative ${planId === 'premium' ? 'border-blue-500 shadow-lg scale-105' : ''}`}
            >
              {planId === 'premium' && (
                <Badge className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-blue-500">
                  Most Popular
                </Badge>
              )}
              
              <CardHeader className="text-center">
                <div className="flex justify-center mb-4">
                  {getPlanIcon(planId)}
                </div>
                <CardTitle className="text-2xl">{plan.name}</CardTitle>
                <div className="text-center">
                  <div className="text-3xl font-bold mt-2">
                    {plan.price === 0 ? 'Free' : formatPrice(plan.price)}
                    {plan.price > 0 && <span className="text-sm font-normal">/month</span>}
                  </div>
                </div>
              </CardHeader>

              <CardContent>
                <ul className="space-y-3 mb-6">
                  {plan.features.map((feature, index) => (
                    <li key={index} className="flex items-start">
                      <Check className="h-5 w-5 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                      <span className="text-sm">{feature}</span>
                    </li>
                  ))}
                </ul>

                <Button
                  className="w-full"
                  variant={planId === 'premium' ? 'default' : 'outline'}
                  disabled={loading === planId || isCurrentPlan(planId)}
                  onClick={() => {
                    if (planId === 'free') {
                      // Free plan - no checkout needed
                      alert('You are already on the free plan!')
                    } else {
                      handleUpgrade(planId)
                    }
                  }}
                >
                  {loading === planId ? (
                    'Processing...'
                  ) : isCurrentPlan(planId) ? (
                    'Current Plan'
                  ) : planId === 'free' ? (
                    'Get Started'
                  ) : (
                    'Upgrade Now'
                  )}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* FAQ Section */}
        <div className="max-w-3xl mx-auto">
          <h2 className="text-2xl font-bold text-center mb-8">Frequently Asked Questions</h2>
          
          <div className="space-y-6">
            <div>
              <h3 className="font-semibold mb-2">Can I change my plan anytime?</h3>
              <p className="text-gray-600">
                Yes, you can upgrade or downgrade your plan at any time. Changes will be reflected in your next billing cycle.
              </p>
            </div>

            <div>
              <h3 className="font-semibold mb-2">What payment methods do you accept?</h3>
              <p className="text-gray-600">
                We accept all major credit cards (Visa, MasterCard, American Express) and PayPal through Stripe.
              </p>
            </div>

            <div>
              <h3 className="font-semibold mb-2">Is there a free trial?</h3>
              <p className="text-gray-600">
                Our free plan gives you 5 translations per month to try our service. No credit card required.
              </p>
            </div>

            <div>
              <h3 className="font-semibold mb-2">What languages are supported?</h3>
              <p className="text-gray-600">
                We support 20+ languages with intelligent timing adjustment for each language's characteristics.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}


