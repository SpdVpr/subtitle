'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { useAuth } from '@/hooks/useAuth'
import { useCredits } from '@/contexts/credits-context'
import { CreditsDisplay } from '@/components/ui/credits-display'
import { VoucherRedemption } from '@/components/ui/voucher-redemption'
import { Coins, Zap, Star, Crown, ArrowRight, Check, ExternalLink } from 'lucide-react'
import Link from 'next/link'
import { STRIPE_PAYMENT_LINKS, createPaymentUrl, formatPrice, getPricePerCredit } from '@/lib/stripe-payment-links'

// Enhanced credit packages with Stripe Payment Links
const CREDIT_PACKAGES = STRIPE_PAYMENT_LINKS.map((link, index) => ({
  id: `package-${index}`,
  name: getPackageName(link.credits),
  credits: link.credits,
  price: link.price,
  pricePerCredit: getPricePerCredit(link),
  popular: link.popular || false,
  description: link.description,
  paymentLink: link.link,
  features: getPackageFeatures(link.credits)
}))

function getPackageName(credits: number): string {
  if (credits <= 100) return 'Trial Pack'
  if (credits <= 500) return 'Starter Pack'
  if (credits <= 1200) return 'Popular Pack'
  if (credits <= 2500) return 'Professional Pack'
  return 'Enterprise Pack'
}

function getPackageFeatures(credits: number): string[] {
  const baseFeatures = [
    `${credits.toLocaleString()} credits`,
    `~${(credits * 5).toLocaleString()} lines of translation`,
    `${Math.floor(credits / 20)} premium translation jobs`,
    'Context research included',
    'No expiration'
  ]

  if (credits >= 500) {
    baseFeatures.push('Priority support')
  }

  if (credits >= 1000) {
    baseFeatures.push('Batch processing')
  }

  if (credits >= 2500) {
    baseFeatures.push('API access')
    baseFeatures.push('Custom integrations')
  }

  return baseFeatures
}

export default function BuyCreditsPage() {
  const { user } = useAuth()
  const { refreshCredits } = useCredits()
  const [loading, setLoading] = useState<string | null>(null)

  const handlePurchase = async (packageId: string) => {
    if (!user) {
      alert('Please log in to purchase credits')
      return
    }

    setLoading(packageId)
    try {
      // Find the package
      const pkg = CREDIT_PACKAGES.find(p => p.id === packageId)
      if (!pkg) {
        throw new Error('Package not found')
      }

      // Create payment URL with user metadata
      const paymentUrl = createPaymentUrl(
        {
          credits: pkg.credits,
          price: pkg.price,
          currency: 'USD',
          link: pkg.paymentLink,
          description: pkg.description
        },
        user.uid,
        {
          credits: pkg.credits.toString(),
          package_name: pkg.name,
          user_email: user.email || '',
        }
      )

      // Redirect to Stripe Payment Link
      window.location.href = paymentUrl
    } catch (error) {
      console.error('Purchase failed:', error)
      alert('Purchase failed. Please try again.')
      setLoading(null)
    }
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
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
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-foreground mb-4">
            💰 Buy Credits
          </h1>
          <p className="text-xl text-muted-foreground mb-6">
            Pay only for what you use. No monthly subscriptions.
          </p>

          {/* Current Balance */}
          <div className="flex justify-center mb-8">
            <div className="bg-card rounded-lg p-4 shadow-sm border">
              <div className="flex items-center space-x-4">
                <span className="text-muted-foreground">Current Balance:</span>
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
              className={`relative ${
                pkg.popular ? 'border-blue-500 shadow-lg scale-105' : ''
              }`}
            >
              {pkg.popular && (
                <Badge className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-blue-500 dark:bg-primary">
                  <Star className="w-3 h-3 mr-1" />
                  Most Popular
                </Badge>
              )}

              <CardHeader className="text-center">
                <div className="flex justify-center mb-2">
                  {pkg.credits <= 100 && <Coins className="w-8 h-8 text-blue-500" />}
                  {pkg.credits > 100 && pkg.credits <= 500 && <Coins className="w-8 h-8 text-primary" />}
                  {pkg.credits > 500 && pkg.credits <= 1200 && <Zap className="w-8 h-8 text-primary" />}
                  {pkg.credits > 1200 && <Crown className="w-8 h-8 text-primary" />}
                </div>
                <CardTitle className="text-xl">{pkg.name}</CardTitle>
                <CardDescription>{pkg.description}</CardDescription>
              </CardHeader>
              
              <CardContent className="text-center space-y-4">
                <div>
                  <div className="text-4xl font-bold text-green-600 dark:text-green-400">
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
                      <span>Buy {pkg.credits.toLocaleString()} Credits</span>
                      <ExternalLink className="w-4 h-4" />
                    </div>
                  )}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Voucher Redemption */}
        <div className="mb-12">
          <VoucherRedemption
            onRedemptionSuccess={(creditsAdded, newBalance) => {
              // Refresh credits without reloading the page
              refreshCredits()
            }}
          />
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
                  <Crown className="w-4 h-4 text-primary" />
                  <span>Premium Translation (OpenAI GPT-4)</span>
                </h4>
                <ul className="text-sm text-muted-foreground space-y-1 text-left max-w-md mx-auto">
                  <li>• ~0.4 credits per 20 lines</li>
                  <li>• Context-aware translation with show research</li>
                  <li>• Natural dialogue adaptation</li>
                  <li>• Cultural context understanding</li>
                  <li>• Professional quality results</li>
                </ul>
              </div>
            </div>

            <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-950/30 rounded-lg">
              <p className="text-sm text-blue-800 dark:text-blue-300">
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
