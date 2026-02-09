'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { useAuth } from '@/hooks/useAuth'
import { useCredits } from '@/contexts/credits-context'
import { CreditsDisplay } from '@/components/ui/credits-display'
import { VoucherRedemption } from '@/components/ui/voucher-redemption'
import { Coins, Zap, Star, Crown, ArrowRight, Check, ExternalLink, Bitcoin } from 'lucide-react'
import Link from 'next/link'
import { toast } from 'sonner'
import { STRIPE_PAYMENT_LINKS, createPaymentUrl, formatPrice, getPricePerCredit } from '@/lib/stripe-payment-links'

// Enhanced credit packages with Stripe Payment Links (excluding $1 packages)
const CREDIT_PACKAGES = STRIPE_PAYMENT_LINKS
  .filter(link => link.price > 1) // Hide $1 packages
  .map((link, index) => ({
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
  const features = [
    `${credits.toLocaleString()} credits`,
    `~${(credits * 5).toLocaleString()} lines of translation`,
    'No expiration'
  ]

  // Zdůrazni bonus kredity jen u dražších balíčků
  if (credits === 1200) {
    features.unshift('🎁 +200 BONUS credits (1000 + 200)')
  } else if (credits === 2500) {
    features.unshift('🎁 +500 BONUS credits (2000 + 500)')
  }

  return features
}

export default function BuyCreditsPage() {
  const { user } = useAuth()
  const { refreshCredits } = useCredits()
  const [loading, setLoading] = useState<string | null>(null)

  const handlePurchase = async (packageId: string) => {
    if (!user) {
      // Redirect to login instead of showing error
      window.location.href = '/login?redirect=/buy-credits'
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
      toast.error('Purchase failed. Please try again.')
    } finally {
      setLoading(null)
    }
  }

  const handleBitcoinPurchase = async (packageId: string) => {
    if (!user) {
      // Redirect to login instead of showing error
      window.location.href = '/login?redirect=/buy-credits'
      return
    }

    setLoading(packageId)
    try {
      // Find the package
      const pkg = CREDIT_PACKAGES.find(p => p.id === packageId)
      if (!pkg) {
        throw new Error('Package not found')
      }

      console.log(`🟠 Creating Bitcoin invoice for ${pkg.credits} credits`)
      toast.loading('Creating Bitcoin Lightning invoice...', { id: 'bitcoin-invoice' })

      const response = await fetch('/api/opennode/create-invoice', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: user.uid,
          credits: pkg.credits
        })
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create Bitcoin invoice')
      }

      console.log('✅ Bitcoin charge created:', data.charge)

      // Dismiss loading toast
      toast.dismiss('bitcoin-invoice')

      // Open OpenNode hosted checkout in new window (with Lightning default)
      window.open(data.charge.checkoutUrl, '_blank')

      toast.success(`Bitcoin Lightning payment ready!

Amount: $${data.charge.priceUSD} USD
Package: ${data.charge.packageName}
Credits: ${data.charge.credits}

Complete payment in the new window.`, {
        duration: 8000
      })

    } catch (error) {
      console.error('🚨 Bitcoin purchase error:', error)
      toast.dismiss('bitcoin-invoice')
      toast.error(`Bitcoin payment failed: ${error instanceof Error ? error.message : 'Unknown error'}. Please try again or use card payment.`, {
        duration: 6000
      })
    } finally {
      setLoading(null)
    }
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
            Simple pay-per-use credits. Each credit = 1 line of translation. No subscriptions, no expiration.
          </p>

          {/* Current Balance - only for logged in users */}
          {user && (
            <div className="flex justify-center mb-8">
              <div className="bg-card rounded-lg p-4 shadow-sm border">
                <div className="flex items-center space-x-4">
                  <span className="text-muted-foreground">Current Balance:</span>
                  <CreditsDisplay showBuyButton={false} />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Credit Packages */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12 max-w-5xl mx-auto">
          {CREDIT_PACKAGES.map((pkg) => (
            <Card
              key={pkg.id}
              className={`relative ${pkg.popular ? 'border-blue-500 shadow-lg scale-105' : ''
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

                <div className="space-y-2">
                  {user ? (
                    <>
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
                            <span>Pay with Card - ${pkg.price}</span>
                            <ExternalLink className="w-4 h-4" />
                          </div>
                        )}
                      </Button>

                      <Button
                        onClick={() => handleBitcoinPurchase(pkg.id)}
                        className="w-full bg-orange-500 hover:bg-orange-600 text-white border-orange-500"
                        disabled={loading === pkg.id}
                        variant="outline"
                      >
                        {loading === pkg.id ? (
                          <div className="flex items-center space-x-2">
                            <div className="w-4 h-4 border-2 border-orange-300 border-t-transparent rounded-full animate-spin" />
                            <span>Processing...</span>
                          </div>
                        ) : (
                          <div className="flex items-center space-x-2">
                            <Bitcoin className="w-4 h-4" />
                            <span>Pay with Bitcoin ⚡</span>
                          </div>
                        )}
                      </Button>
                    </>
                  ) : (
                    <Button className="w-full" asChild variant={pkg.popular ? 'default' : 'outline'}>
                      <Link href="/login?redirect=/buy-credits">
                        Sign In to Purchase
                      </Link>
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Voucher Redemption - only for logged in users */}
        {user && (
          <div className="mb-12">
            <VoucherRedemption
              onRedemptionSuccess={(creditsAdded, newBalance) => {
                // Refresh credits without reloading the page
                refreshCredits()
              }}
            />
          </div>
        )}

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
              <div className="space-y-6">
                {/* Standard Translation */}
                <div className="space-y-3">
                  <h4 className="font-semibold flex items-center justify-center space-x-2">
                    <Zap className="w-4 h-4 text-blue-600" />
                    <span>Standard Translation (Gemini Flash)</span>
                  </h4>
                  <ul className="text-sm text-muted-foreground space-y-1 text-left max-w-md mx-auto">
                    <li>• 0.5 credits per 20 lines</li>
                    <li>• Fast, reliable translation</li>
                    <li>• Context-aware with show research</li>
                    <li>• Natural dialogue adaptation</li>
                    <li>• Great quality results</li>
                  </ul>
                </div>

                {/* Premium Translation */}
                <div className="space-y-3 p-4 border-2 border-yellow-300 rounded-lg bg-gradient-to-r from-amber-50 to-yellow-50 dark:from-amber-950/20 dark:to-yellow-950/20">
                  <h4 className="font-semibold flex items-center justify-center space-x-2">
                    <span className="text-yellow-600">👑</span>
                    <span>Premium Translation (Gemini Pro)</span>
                  </h4>
                  <ul className="text-sm text-muted-foreground space-y-1 text-left max-w-md mx-auto">
                    <li>• 1.5 credits per 20 lines</li>
                    <li>• Best quality translation</li>
                    <li>• Advanced context research</li>
                    <li>• Superior dialogue adaptation</li>
                    <li>• Professional-grade results</li>
                  </ul>
                </div>
              </div>
            </div>

            <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-950/30 rounded-lg">
              <p className="text-sm text-blue-800 dark:text-blue-300">
                <strong>Example:</strong> A 100-line subtitle file costs 4.0 credits (Standard) or 10.0 credits (Premium).
                Your 200 welcome credits can translate ~125 files (Standard) or ~20 files (Premium) with full context research!
              </p>
            </div>
          </CardContent>
        </Card>


      </div>
    </div>
  )
}
