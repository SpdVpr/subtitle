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
    description: getPackageDescription(link.credits),
    paymentLink: link.link,
    features: getPackageFeatures(link.credits)
  }))

function getPackageName(credits: number): string {
  if (credits <= 100) return 'Zkušební balíček'
  if (credits <= 500) return 'Startovní balíček'
  if (credits <= 1200) return 'Populární balíček'
  if (credits <= 2500) return 'Profesionální balíček'
  return 'Podnikový balíček'
}

function getPackageDescription(credits: number): string {
  if (credits <= 100) return 'Ideální pro vyzkoušení služby'
  if (credits <= 500) return 'Pro občasné použití'
  if (credits <= 1200) return 'Nejlepší poměr cena/výkon'
  if (credits <= 2500) return 'Pro pravidelné uživatele'
  return 'Pro firmy a náročné uživatele'
}

function getPackageFeatures(credits: number): string[] {
  const features = [
    `${credits.toLocaleString()} kreditů`,
    `~${Math.floor(credits / 0.7 * 20).toLocaleString()} řádků překladu`,
    'Kredity nevyprší',
    'Prémiový AI překlad',
    'Všechny jazykové páry',
    'Stažení přeložených souborů',
    'Historie překladů'
  ]

  // Add bonus credits info for larger packages
  if (credits === 1200) {
    features.unshift('🎁 +200 BONUS kreditů (1000 + 200)')
  } else if (credits === 2500) {
    features.unshift('🎁 +500 BONUS kreditů (2000 + 500)')
  }

  // Add extra features for larger packages
  if (credits >= 500) {
    features.push('Dávkové zpracování')
  }

  return features
}

export default function PricingPageCZ() {
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
            Jednoduché, transparentní ceny
          </h1>
          <p className="text-xl text-muted-foreground mb-6 max-w-3xl mx-auto">
            Vyberte si perfektní balíček kreditů pro překlad titulků. 
            Žádné předplatné, žádné skryté poplatky - plaťte jen za to, co použijete.
          </p>
          <div className="flex items-center justify-center gap-4 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <Check className="w-4 h-4 text-green-600" />
              <span>Kredity nikdy nevyprší</span>
            </div>
            <div className="flex items-center gap-2">
              <Check className="w-4 h-4 text-green-600" />
              <span>Všechny jazyky podporovány</span>
            </div>
            <div className="flex items-center gap-2">
              <Check className="w-4 h-4 text-green-600" />
              <span>Prémiový AI překlad</span>
            </div>
          </div>
        </div>

        {/* Pricing Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12 max-w-5xl mx-auto">
          {CREDIT_PACKAGES.map((pkg) => (
            <Card 
              key={pkg.id} 
              className={`relative transition-all duration-200 hover:shadow-lg ${
                pkg.popular ? 'border-primary shadow-md scale-105' : ''
              }`}
            >
              {pkg.popular && (
                <Badge className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-blue-500 dark:bg-primary">
                  <Star className="w-3 h-3 mr-1" />
                  Nejpopulárnější
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
                  <div className="text-sm text-gray-600">kreditů</div>
                </div>
                
                <div>
                  <div className="text-3xl font-bold text-blue-600">
                    ${pkg.price}
                  </div>
                  <div className="text-sm text-gray-600">
                    ${pkg.pricePerCredit.toFixed(3)} za kredit
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
                    <Link href={user ? '/cs/buy-credits' : '/cs/login?redirect=/cs/buy-credits'}>
                      {user ? 'Koupit nyní' : 'Přihlásit se a koupit'}
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Payment Methods */}
        <div className="text-center mb-12">
          <h2 className="text-2xl font-bold mb-4">Více možností platby</h2>
          <div className="flex items-center justify-center gap-8 text-muted-foreground">
            <div className="flex items-center gap-2">
              <ExternalLink className="w-5 h-5" />
              <span>Kreditní/debetní karty</span>
            </div>
            <div className="flex items-center gap-2">
              <Bitcoin className="w-5 h-5 text-orange-500" />
              <span>Bitcoin Lightning ⚡</span>
            </div>
          </div>
          <p className="text-sm text-muted-foreground mt-2">
            Bezpečné platby zajišťují Stripe a OpenNode
          </p>
        </div>

        {/* FAQ Section */}
        <div className="max-w-3xl mx-auto">
          <h2 className="text-2xl font-bold text-center mb-8">Často kladené otázky</h2>
          <div className="space-y-6">
            <div>
              <h3 className="font-semibold mb-2">Jak fungují kredity?</h3>
              <p className="text-muted-foreground">
                Každý kredit umožňuje přeložit přibližně 5 řádků titulků. 
                Kredity se odečítají podle skutečného počtu zpracovaných řádků.
              </p>
            </div>
            <div>
              <h3 className="font-semibold mb-2">Vyprší kredity?</h3>
              <p className="text-muted-foreground">
                Ne! Vaše kredity nikdy nevyprší. Použijte je kdykoli potřebujete služby překladu titulků.
              </p>
            </div>
            <div>
              <h3 className="font-semibold mb-2">Jaké jazyky jsou podporovány?</h3>
              <p className="text-muted-foreground">
                Podporujeme 100+ jazyků včetně všech hlavních světových jazyků. 
                Naše AI poskytuje kontextově přesné překlady pro přesné výsledky.
              </p>
            </div>
            <div>
              <h3 className="font-semibold mb-2">Mohu získat refundaci?</h3>
              <p className="text-muted-foreground">
                Nabízíme refundaci do 7 dnů od nákupu, pokud jste nepoužili žádné kredity. 
                Kontaktujte náš tým podpory pro pomoc.
              </p>
            </div>
          </div>
        </div>

        {/* CTA Section */}
        <div className="text-center mt-12 p-8 bg-muted rounded-lg">
          <h2 className="text-2xl font-bold mb-4">Připraveni začít?</h2>
          <p className="text-muted-foreground mb-6">
            Připojte se k tisícům tvůrců obsahu, kteří důvěřují SubtitleBot pro své potřeby překladu.
          </p>
          <Button size="lg" asChild>
            <Link href={user ? '/cs/buy-credits' : '/cs/login?redirect=/cs/buy-credits'}>
              {user ? 'Koupit kredity nyní' : 'Registrovat se a koupit kredity'}
            </Link>
          </Button>
        </div>
      </div>
    </div>
  )
}
