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
    name: 'Začátečnický Balíček',
    credits: 100,
    price: 9.99,
    pricePerCredit: 0.10,
    popular: false,
    description: 'Perfektní pro vyzkoušení naší služby',
    features: [
      '100 překladových kreditů',
      'Přeložte ~2,500 titulků',
      'Prémiový AI překlad',
      'Všechny jazykové páry',
      'Stažení přeložených souborů',
      'Historie překladů'
    ]
  },
  {
    id: 'professional',
    name: 'Profesionální Balíček',
    credits: 500,
    price: 39.99,
    pricePerCredit: 0.08,
    popular: true,
    description: 'Nejlepší hodnota pro pravidelné uživatele',
    features: [
      '500 překladových kreditů',
      'Přeložte ~12,500 titulků',
      'Prémiový AI překlad',
      'Všechny jazykové páry',
      'Dávkové zpracování',
      'Prioritní podpora',
      'Analytický dashboard',
      'Stažení přeložených souborů'
    ]
  },
  {
    id: 'enterprise',
    name: 'Podnikový Balíček',
    credits: 2000,
    price: 149.99,
    pricePerCredit: 0.075,
    popular: false,
    description: 'Pro vysokoobjemové překládání',
    features: [
      '2,000 překladových kreditů',
      'Přeložte ~50,000 titulků',
      'Prémiový AI překlad',
      'Všechny jazykové páry',
      'Dávkové zpracování',
      'Prioritní podpora',
      'Pokročilé analýzy',
      'API přístup',
      'Vlastní integrace'
    ]
  }
]



export default function CzechPricingPage() {
  const { user } = useAuth()
  const [selectedPackage, setSelectedPackage] = useState<string | null>(null)

  const handlePurchase = (packageId: string) => {
    setSelectedPackage(packageId)
    // Redirect to buy-credits with package selection
    window.location.href = `/buy-credits?package=${packageId}`
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-16">
        {/* Header */}
        <div className="text-center mb-16">
          <Badge className="mb-4 bg-gradient-to-r from-blue-500 to-purple-500 text-white">
            <Zap className="h-4 w-4 mr-2" />
            Jednoduché Ceny
          </Badge>
          <h1 className="text-4xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Vyberte si Váš Balíček Kreditů
          </h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Žádné předplatné. Žádné skryté poplatky. Plaťte jen za to, co použijete.
            Kredity nikdy nevyprší a můžete je použít kdykoli.
          </p>
        </div>

        {/* Pricing Calculator */}
        <div className="bg-card rounded-2xl p-6 mb-12 max-w-2xl mx-auto border shadow-lg">
          <div className="text-center mb-6">
            <Calculator className="h-8 w-8 text-primary mx-auto mb-2" />
            <h3 className="text-xl font-semibold">Kalkulačka Cen</h3>
            <p className="text-muted-foreground">Zjistěte, kolik kreditů potřebujete</p>
          </div>
          
          <div className="grid md:grid-cols-2 gap-6 text-center">
            <div className="bg-primary/5 rounded-lg p-4">
              <FileText className="h-6 w-6 text-primary mx-auto mb-2" />
              <div className="text-2xl font-bold text-primary">0.4</div>
              <div className="text-sm text-muted-foreground">kreditů za 20 titulků</div>
            </div>
            <div className="bg-secondary/50 rounded-lg p-4">
              <Languages className="h-6 w-6 text-primary mx-auto mb-2" />
              <div className="text-2xl font-bold text-primary">100+</div>
              <div className="text-sm text-muted-foreground">podporovaných jazyků</div>
            </div>
          </div>

          <div className="mt-6 p-4 bg-muted/50 rounded-lg">
            <div className="text-sm text-muted-foreground text-center">
              <strong>Příklad:</strong> Film s 1,000 titulky = 20 kreditů (~$2.00)
            </div>
          </div>
        </div>

        {/* Credit Packages */}
        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto mb-16">
          {CREDIT_PACKAGES.map((pkg) => (
            <Card key={pkg.id} className={`relative ${pkg.popular ? 'border-primary shadow-xl scale-105' : 'border-border'}`}>
              {pkg.popular && (
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                  <Badge className="bg-gradient-to-r from-primary to-primary/80 text-primary-foreground px-4 py-1">
                    <Star className="h-4 w-4 mr-1" />
                    Nejpopulárnější
                  </Badge>
                </div>
              )}
              
              <CardHeader className="text-center pb-4">
                <div className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 ${
                  pkg.id === 'starter' ? 'bg-blue-100 dark:bg-accent' :
                  pkg.id === 'professional' ? 'bg-primary/10' :
                  'bg-purple-100 dark:bg-accent'
                }`}>
                  {pkg.id === 'starter' && <Zap className="h-8 w-8 text-blue-600 dark:text-primary" />}
                  {pkg.id === 'professional' && <Star className="h-8 w-8 text-primary" />}
                  {pkg.id === 'enterprise' && <Crown className="h-8 w-8 text-purple-600 dark:text-primary" />}
                </div>
                <CardTitle className="text-2xl">{pkg.name}</CardTitle>
                <CardDescription className="text-base">{pkg.description}</CardDescription>
              </CardHeader>
              
              <CardContent className="text-center pb-6">
                <div className="mb-6">
                  <div className="text-4xl font-bold text-primary mb-2">${pkg.price}</div>
                  <div className="text-lg font-semibold text-muted-foreground mb-1">{pkg.credits} kreditů</div>
                  <div className="text-sm text-muted-foreground">${pkg.pricePerCredit.toFixed(3)} za kredit</div>
                </div>
                
                <ul className="space-y-3 mb-8">
                  {pkg.features.map((feature, index) => (
                    <li key={index} className="flex items-center text-sm">
                      <Check className="h-4 w-4 text-green-500 mr-3 flex-shrink-0" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
                
                <Button 
                  className={`w-full ${pkg.popular ? 'bg-primary hover:bg-primary/90' : ''}`}
                  variant={pkg.popular ? 'default' : 'outline'}
                  onClick={() => handlePurchase(pkg.id)}
                  disabled={selectedPackage === pkg.id}
                >
                  {selectedPackage === pkg.id ? 'Zpracovává se...' : 'Koupit Nyní'}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Additional Info */}
        <div className="text-center space-y-6">
          <div className="bg-muted/50 rounded-lg p-6 max-w-4xl mx-auto">
            <h3 className="text-xl font-semibold mb-4">💡 Důležité Informace</h3>
            <div className="grid md:grid-cols-2 gap-6 text-sm text-muted-foreground">
              <div>
                <strong className="text-foreground">Kredity nikdy nevyprší</strong><br />
                Kupte si kredity jednou a používejte je, kdykoli potřebujete
              </div>
              <div>
                <strong className="text-foreground">Žádné skryté poplatky</strong><br />
                Transparentní ceny - platíte jen za kredity, které koupíte
              </div>
              <div>
                <strong className="text-foreground">Okamžité zpracování</strong><br />
                Kredity jsou k dispozici ihned po úspěšné platbě
              </div>
              <div>
                <strong className="text-foreground">Bezpečné platby</strong><br />
                Všechny platby jsou zpracovány bezpečně přes Stripe
              </div>
            </div>
          </div>

          <div className="text-muted-foreground">
            Potřebujete více kreditů? <a href="/contact" className="text-primary hover:underline">Kontaktujte nás</a> pro vlastní balíček.
          </div>
        </div>
      </div>
    </div>
  )
}
