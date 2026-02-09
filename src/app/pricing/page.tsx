'use client'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Check, Star, Zap, Crown, Coins, Bitcoin, ExternalLink } from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'
import Link from 'next/link'
import { STRIPE_PAYMENT_LINKS, getPricePerCredit } from '@/lib/stripe-payment-links'

// Enhanced credit packages with current Stripe Payment Links (excluding $1 packages)
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
  // Average cost: (0.8 + 2.0) / 2 = 1.4 credits per 20 lines
  const avgCostPer20Lines = 1.4
  const features = [
    `${credits.toLocaleString()} credits`,
    `~${Math.floor(credits / avgCostPer20Lines * 20).toLocaleString()} lines of translation (avg)`,
    'No expiration',
    'Standard & Premium AI translation',
    'All language pairs supported',
    'Download translated files',
    'Translation history'
  ]

  // Add bonus credits info for larger packages
  if (credits === 1200) {
    features.unshift('🎁 +200 BONUS credits (1000 + 200)')
  } else if (credits === 2500) {
    features.unshift('🎁 +500 BONUS credits (2000 + 500)')
  }

  // Add extra features for larger packages
  if (credits >= 500) {
    features.push('Batch processing')
  }

  return features
}

export default function PricingPage() {
  const { user } = useAuth()

  const getPackageIcon = (credits: number) => {
    if (credits <= 100) return <Coins className="w-8 h-8 text-blue-500" />
    if (credits <= 500) return <Coins className="w-8 h-8 text-primary" />
    if (credits <= 1200) return <Zap className="w-8 h-8 text-primary" />
    return <Crown className="w-8 h-8 text-primary" />
  }

  return (
    <div className="py-4 sm:py-6 md:py-8">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4">
            Simple, Transparent Pricing
          </h1>
          <p className="text-xl text-muted-foreground mb-6 max-w-3xl mx-auto">
            Choose the perfect credit package for your subtitle translation needs.
            No subscriptions, no hidden fees - just pay for what you use.
          </p>
          <div className="flex items-center justify-center gap-4 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <Check className="w-4 h-4 text-green-600" />
              <span>Credits never expire</span>
            </div>
            <div className="flex items-center gap-2">
              <Check className="w-4 h-4 text-green-600" />
              <span>All languages supported</span>
            </div>
            <div className="flex items-center gap-2">
              <Check className="w-4 h-4 text-green-600" />
              <span>Premium AI translation</span>
            </div>
          </div>
        </div>

        {/* Pricing Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12 max-w-5xl mx-auto">
          {CREDIT_PACKAGES.map((pkg) => (
            <Card
              key={pkg.id}
              className={`relative transition-all duration-200 hover:shadow-lg ${pkg.popular ? 'border-primary shadow-md scale-105' : ''
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
                  {getPackageIcon(pkg.credits)}
                </div>
                <CardTitle className="text-xl">{pkg.name}</CardTitle>
                <CardDescription>{pkg.description}</CardDescription>
              </CardHeader>

              <CardContent className="text-center space-y-4">
                <div>
                  <div className="text-4xl font-bold text-green-600 dark:text-green-400">
                    {pkg.credits.toLocaleString()}
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
                  <Button
                    className="w-full"
                    asChild
                    variant={pkg.popular ? 'default' : 'outline'}
                  >
                    <Link href={user ? '/buy-credits' : '/login?redirect=/buy-credits'}>
                      {user ? 'Buy Now' : 'Sign In to Purchase'}
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Payment Methods */}
        <div className="text-center mb-12">
          <h2 className="text-2xl font-bold mb-4">Multiple Payment Options</h2>
          <div className="flex items-center justify-center gap-8 text-muted-foreground">
            <div className="flex items-center gap-2">
              <ExternalLink className="w-5 h-5" />
              <span>Credit/Debit Cards</span>
            </div>
            <div className="flex items-center gap-2">
              <Bitcoin className="w-5 h-5 text-orange-500" />
              <span>Bitcoin Lightning ⚡</span>
            </div>
          </div>
          <p className="text-sm text-muted-foreground mt-2">
            Secure payments powered by Stripe and OpenNode
          </p>
        </div>

        {/* FAQ Section */}
        <div className="max-w-3xl mx-auto">
          <h2 className="text-2xl font-bold text-center mb-8">Frequently Asked Questions</h2>
          <div className="space-y-6">
            <div>
              <h3 className="font-semibold mb-2">How do credits work?</h3>
              <p className="text-muted-foreground">
                Standard translation costs 0.5 credits per 20 lines, Premium costs 1.5 credits per 20 lines.
                Credits are deducted based on the actual number of lines processed and the model you choose.
              </p>
            </div>
            <div>
              <h3 className="font-semibold mb-2">Do credits expire?</h3>
              <p className="text-muted-foreground">
                No! Your credits never expire. Use them whenever you need subtitle translation services.
              </p>
            </div>
            <div>
              <h3 className="font-semibold mb-2">What languages are supported?</h3>
              <p className="text-muted-foreground">
                We support 100+ languages including all major world languages.
                Our AI provides context-aware translations for accurate results.
              </p>
            </div>
            <div>
              <h3 className="font-semibold mb-2">Can I get a refund?</h3>
              <p className="text-muted-foreground">
                We offer refunds within 7 days of purchase if you haven't used any credits.
                Contact our support team for assistance.
              </p>
            </div>
          </div>
        </div>

        {/* CTA Section */}
        <div className="text-center mt-12 p-8 bg-muted rounded-lg">
          <h2 className="text-2xl font-bold mb-4">Ready to get started?</h2>
          <p className="text-muted-foreground mb-6">
            Join thousands of content creators who trust SubtitleBot for their translation needs.
          </p>
          <Button size="lg" asChild>
            <Link href={user ? '/buy-credits' : '/login?redirect=/buy-credits'}>
              {user ? 'Buy Credits Now' : 'Sign Up & Buy Credits'}
            </Link>
          </Button>
        </div>
      </div>
    </div>
  )
}
