'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Check, Star, Zap, Crown, Calculator, FileText, Languages, BarChart3 } from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'

// Credit packages
const CREDIT_PACKAGES = [
  {
    id: 'starter',
    name: 'Starter Pack',
    credits: 100,
    price: 9.99,
    pricePerCredit: 0.10,
    popular: false,
    description: 'Perfect for trying out our service',
    features: [
      '100 translation credits',
      'Translate ~2,500 subtitles',
      'Premium AI translation',
      'All language pairs',
      'Download translated files',
      'Translation history'
    ]
  },
  {
    id: 'professional',
    name: 'Professional Pack',
    credits: 500,
    price: 39.99,
    pricePerCredit: 0.08,
    popular: true,
    description: 'Best value for regular users',
    features: [
      '500 translation credits',
      'Translate ~12,500 subtitles',
      'Premium AI translation',
      'All language pairs',
      'Batch processing',
      'Priority support',
      'Analytics dashboard',
      'Download translated files'
    ]
  },
  {
    id: 'enterprise',
    name: 'Enterprise Pack',
    credits: 2000,
    price: 129.99,
    pricePerCredit: 0.065,
    popular: false,
    description: 'For heavy users and businesses',
    features: [
      '2,000 translation credits',
      'Translate ~50,000 subtitles',
      'Premium AI translation',
      'All language pairs',
      'Batch processing',
      'Priority support',
      'Advanced analytics',
      'API access (coming soon)',
      'Custom integrations'
    ]
  }
]

export default function PricingPage() {
  const { user } = useAuth()
  const [loading, setLoading] = useState<string | null>(null)

  const handleBuyCredits = async (packageId: string) => {
    if (!user) {
      // Redirect to login
      window.location.href = '/login?redirect=/pricing'
      return
    }

    try {
      setLoading(packageId)

      // Redirect to buy-credits page with selected package
      window.location.href = `/buy-credits?package=${packageId}`
    } catch (error) {
      console.error('Buy credits error:', error)
      alert('Failed to start purchase process. Please try again.')
    } finally {
      setLoading(null)
    }
  }

  const getPackageIcon = (packageId: string) => {
    switch (packageId) {
      case 'starter':
        return <Star className="h-6 w-6" />
      case 'professional':
        return <Zap className="h-6 w-6" />
      case 'enterprise':
        return <Crown className="h-6 w-6" />
      default:
        return <Star className="h-6 w-6" />
    }
  }

  return (
    <div className="py-8">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-6xl">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4">Buy Translation Credits</h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Pay only for what you use. No subscriptions, no monthly fees. Just simple, transparent credit-based pricing.
          </p>
        </div>

        {/* How it works */}
        <div className="bg-blue-50 rounded-lg p-6 mb-12 max-w-4xl mx-auto">
          <h2 className="text-2xl font-bold text-center mb-6">How Credits Work</h2>
          <div className="grid md:grid-cols-4 gap-6">
            <div className="text-center">
              <Calculator className="h-8 w-8 text-blue-600 mx-auto mb-2" />
              <h3 className="font-semibold mb-2">Simple Pricing</h3>
              <p className="text-sm text-gray-600">0.4 credits per 20 subtitles</p>
            </div>
            <div className="text-center">
              <FileText className="h-8 w-8 text-blue-600 mx-auto mb-2" />
              <h3 className="font-semibold mb-2">Upload & Translate</h3>
              <p className="text-sm text-gray-600">Upload SRT files and translate instantly</p>
            </div>
            <div className="text-center">
              <Languages className="h-8 w-8 text-blue-600 mx-auto mb-2" />
              <h3 className="font-semibold mb-2">All Languages</h3>
              <p className="text-sm text-gray-600">Support for 100+ language pairs</p>
            </div>
            <div className="text-center">
              <BarChart3 className="h-8 w-8 text-blue-600 mx-auto mb-2" />
              <h3 className="font-semibold mb-2">Track Usage</h3>
              <p className="text-sm text-gray-600">Monitor your credits and analytics</p>
            </div>
          </div>
        </div>

        {/* Pricing Cards */}
        <div className="grid md:grid-cols-3 gap-8 mb-12 max-w-5xl mx-auto">
          {CREDIT_PACKAGES.map((pkg) => (
            <Card
              key={pkg.id}
              className={`relative ${pkg.popular ? 'border-blue-500 shadow-lg scale-105' : ''}`}
            >
              {pkg.popular && (
                <Badge className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-blue-500">
                  Best Value
                </Badge>
              )}

              <CardHeader className="text-center">
                <div className="flex justify-center mb-4">
                  {getPackageIcon(pkg.id)}
                </div>
                <CardTitle className="text-2xl">{pkg.name}</CardTitle>
                <CardDescription className="text-sm text-gray-600 mt-2">
                  {pkg.description}
                </CardDescription>
                <div className="text-center mt-4">
                  <div className="text-4xl font-bold text-blue-600">
                    ${pkg.price}
                  </div>
                  <div className="text-sm text-gray-500 mt-1">
                    {pkg.credits} credits • ${pkg.pricePerCredit.toFixed(3)} per credit
                  </div>
                </div>
              </CardHeader>

              <CardContent>
                <ul className="space-y-3 mb-6">
                  {pkg.features.map((feature, index) => (
                    <li key={index} className="flex items-start">
                      <Check className="h-5 w-5 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                      <span className="text-sm">{feature}</span>
                    </li>
                  ))}
                </ul>

                <Button
                  className="w-full"
                  variant={pkg.popular ? 'default' : 'outline'}
                  disabled={loading === pkg.id}
                >
                  {loading === pkg.id ? 'Processing...' : 'Buy Credits'}
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
              <h3 className="font-semibold mb-2">How do credits work?</h3>
              <p className="text-gray-600">
                Credits are used to translate subtitles. Each batch of 20 subtitles costs 0.4 credits.
                For example, a 100-subtitle file would cost 2 credits to translate.
              </p>
            </div>

            <div>
              <h3 className="font-semibold mb-2">Do credits expire?</h3>
              <p className="text-gray-600">
                No! Your credits never expire. Buy once and use them whenever you need to translate subtitles.
              </p>
            </div>

            <div>
              <h3 className="font-semibold mb-2">What payment methods do you accept?</h3>
              <p className="text-gray-600">
                We accept all major credit cards (Visa, MasterCard, American Express) and PayPal through Stripe.
              </p>
            </div>

            <div>
              <h3 className="font-semibold mb-2">Can I get a refund?</h3>
              <p className="text-gray-600">
                We offer refunds for unused credits within 30 days of purchase. Contact support for assistance.
              </p>
            </div>

            <div>
              <h3 className="font-semibold mb-2">What languages are supported?</h3>
              <p className="text-gray-600">
                We support 100+ language pairs with premium AI translation including Spanish, French, German, Italian, Portuguese, Japanese, Chinese, and many more.
              </p>
            </div>

            <div>
              <h3 className="font-semibold mb-2">Is there a free option?</h3>
              <p className="text-gray-600">
                Yes! New users get free credits to try our service. You can also earn additional credits through referrals.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}


