'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { useAuth } from '@/hooks/useAuth'
import { CreditsDisplay } from '@/components/ui/credits-display'
import { Coins, Zap, Star, Crown, ArrowRight, Check } from 'lucide-react'
import Link from 'next/link'

const CREDIT_PACKAGES = [
  {
    id: 'starter',
    name: 'Starter Pack',
    credits: 500,
    price: 5,
    pricePerCredit: 0.01,
    popular: false,
    description: 'Perfect for occasional use',
    features: [
      '~2,500 lines of translation',
      '25 premium translation jobs',
      'Context research included',
      'No expiration'
    ]
  },
  {
    id: 'popular',
    name: 'Popular Pack',
    credits: 1200,
    price: 10,
    pricePerCredit: 0.0083,
    popular: true,
    description: 'Best value for regular users',
    features: [
      '~6,000 lines of translation',
      '60 premium translation jobs',
      'Context research included',
      'No expiration',
      '20% bonus credits'
    ]
  },
  {
    id: 'professional',
    name: 'Professional Pack',
    credits: 2500,
    price: 20,
    pricePerCredit: 0.008,
    popular: false,
    description: 'For heavy users and professionals',
    features: [
      '~12,500 lines of translation',
      '125 premium translation jobs',
      'Context research included',
      'No expiration',
      '25% bonus credits'
    ]
  }
]

export default function BuyCreditsPage() {
  const { user } = useAuth()
  const [loading, setLoading] = useState<string | null>(null)

  const handlePurchase = async (packageId: string) => {
    if (!user) {
      alert('Please log in to purchase credits')
      return
    }

    setLoading(packageId)
    try {
      // TODO: Implement Stripe checkout
      console.log('Purchasing package:', packageId)
      alert('Credit purchase will be implemented with Stripe integration')
    } catch (error) {
      console.error('Purchase failed:', error)
      alert('Purchase failed. Please try again.')
    } finally {
      setLoading(null)
    }
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <CardTitle>Sign In Required</CardTitle>
            <CardDescription>
              Please sign in to purchase credits
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center">
            <Button asChild>
              <Link href="/login">Sign In</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            💰 Buy Credits
          </h1>
          <p className="text-xl text-gray-600 mb-6">
            Pay only for what you use. No monthly subscriptions.
          </p>
          
          {/* Current Balance */}
          <div className="flex justify-center mb-8">
            <div className="bg-white rounded-lg p-4 shadow-sm border">
              <div className="flex items-center space-x-4">
                <span className="text-gray-600">Current Balance:</span>
                <CreditsDisplay showBuyButton={false} />
              </div>
            </div>
          </div>
        </div>

        {/* Credit Packages */}
        <div className="grid md:grid-cols-3 gap-8 mb-12">
          {CREDIT_PACKAGES.map((pkg) => (
            <Card 
              key={pkg.id} 
              className={`relative ${pkg.popular ? 'border-blue-500 shadow-lg scale-105' : ''}`}
            >
              {pkg.popular && (
                <Badge className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-blue-500">
                  <Star className="w-3 h-3 mr-1" />
                  Most Popular
                </Badge>
              )}
              
              <CardHeader className="text-center">
                <div className="flex justify-center mb-2">
                  {pkg.id === 'starter' && <Coins className="w-8 h-8 text-green-600" />}
                  {pkg.id === 'popular' && <Zap className="w-8 h-8 text-blue-600" />}
                  {pkg.id === 'professional' && <Crown className="w-8 h-8 text-purple-600" />}
                </div>
                <CardTitle className="text-xl">{pkg.name}</CardTitle>
                <CardDescription>{pkg.description}</CardDescription>
              </CardHeader>
              
              <CardContent className="text-center space-y-4">
                <div>
                  <div className="text-4xl font-bold text-gray-900">
                    {pkg.credits}
                  </div>
                  <div className="text-sm text-gray-600">credits</div>
                </div>
                
                <div>
                  <div className="text-3xl font-bold text-blue-600">
                    ${pkg.price}
                  </div>
                  <div className="text-sm text-gray-600">
                    ${pkg.pricePerCredit.toFixed(3)} per credit
                  </div>
                </div>
                
                <ul className="space-y-2 text-sm text-left">
                  {pkg.features.map((feature, index) => (
                    <li key={index} className="flex items-center space-x-2">
                      <Check className="w-4 h-4 text-green-600 flex-shrink-0" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
                
                <Button 
                  className="w-full"
                  onClick={() => handlePurchase(pkg.id)}
                  disabled={loading === pkg.id}
                  variant={pkg.popular ? 'default' : 'outline'}
                >
                  {loading === pkg.id ? (
                    <div className="flex items-center space-x-2">
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span>Processing...</span>
                    </div>
                  ) : (
                    <div className="flex items-center space-x-2">
                      <span>Buy {pkg.credits} Credits</span>
                      <ArrowRight className="w-4 h-4" />
                    </div>
                  )}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Usage Guide */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>💡 How Credits Work</CardTitle>
            <CardDescription>
              Understanding credit usage for different translation services
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-center">
              <div className="space-y-3">
                <h4 className="font-semibold flex items-center justify-center space-x-2">
                  <Crown className="w-4 h-4 text-purple-600" />
                  <span>Premium Translation (OpenAI GPT-4)</span>
                </h4>
                <ul className="text-sm text-gray-600 space-y-1 text-left max-w-md mx-auto">
                  <li>• ~0.4 credits per 20 lines</li>
                  <li>• Context-aware translation with show research</li>
                  <li>• Natural dialogue adaptation</li>
                  <li>• Cultural context understanding</li>
                  <li>• Professional quality results</li>
                </ul>
              </div>
            </div>

            <div className="mt-6 p-4 bg-blue-50 rounded-lg">
              <p className="text-sm text-blue-800">
                <strong>Example:</strong> A 100-line subtitle file costs ~2.0 credits with Premium AI.
                Your 200 welcome credits can translate ~100 files with full context research!
              </p>
            </div>
          </CardContent>
        </Card>

        {/* FAQ */}
        <Card>
          <CardHeader>
            <CardTitle>❓ Frequently Asked Questions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h4 className="font-semibold mb-2">Do credits expire?</h4>
              <p className="text-sm text-gray-600">
                No! Your credits never expire. Use them whenever you need translation services.
              </p>
            </div>
            
            <div>
              <h4 className="font-semibold mb-2">Can I get a refund?</h4>
              <p className="text-sm text-gray-600">
                We offer refunds within 7 days of purchase if you haven't used the credits yet.
              </p>
            </div>
            
            <div>
              <h4 className="font-semibold mb-2">What payment methods do you accept?</h4>
              <p className="text-sm text-gray-600">
                We accept all major credit cards, PayPal, and other payment methods via Stripe.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
