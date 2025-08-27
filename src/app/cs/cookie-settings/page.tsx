'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { useCookieConsent } from '@/hooks/useCookieConsent'
import { Cookie, Shield, BarChart3, Target, Settings } from 'lucide-react'
import Link from 'next/link'

export default function CookieSettingsPageCZ() {
  const { preferences, hasConsent, updatePreferences, acceptAll, rejectAll } = useCookieConsent()
  const [localPreferences, setLocalPreferences] = useState(preferences)

  const updateLocalPreference = (key: keyof typeof preferences, value: boolean) => {
    if (key === 'necessary') return // Can't disable necessary cookies
    setLocalPreferences(prev => ({ ...prev, [key]: value }))
  }

  const savePreferences = () => {
    updatePreferences(localPreferences)
  }

  const cookieTypes = [
    {
      key: 'necessary' as const,
      title: 'Nezbytné cookies',
      description: 'Tyto cookies jsou nutné pro správné fungování webu a nelze je vypnout. Zahrnují cookies pro autentifikaci, bezpečnost a základní funkce webu.',
      icon: Shield,
      color: 'text-green-600',
      bgColor: 'bg-green-50 dark:bg-green-900/20',
      examples: ['Přihlášení uživatele', 'Bezpečnostní tokeny', 'Nastavení jazyka', 'Košík'],
      required: true
    },
    {
      key: 'analytics' as const,
      title: 'Analytické cookies',
      description: 'Pomáhají nám pochopit, jak návštěvníci používají web, které stránky jsou nejpopulárnější a jak se návštěvníci pohybují po webu.',
      icon: BarChart3,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50 dark:bg-blue-900/20',
      examples: ['Google Analytics', 'Počet návštěv', 'Doba na stránce', 'Zdroje návštěvnosti'],
      required: false
    },
    {
      key: 'marketing' as const,
      title: 'Marketingové cookies',
      description: 'Používají se pro zobrazování relevantních reklam a měření efektivity reklamních kampaní. Mohou sledovat vaše aktivity napříč weby.',
      icon: Target,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50 dark:bg-purple-900/20',
      examples: ['Facebook Pixel', 'Google Ads', 'Retargeting', 'Personalizované reklamy'],
      required: false
    },
    {
      key: 'functional' as const,
      title: 'Funkční cookies',
      description: 'Umožňují pokročilé funkce a personalizaci webu. Bez nich nemusí některé funkce správně fungovat.',
      icon: Settings,
      color: 'text-orange-600',
      bgColor: 'bg-orange-50 dark:bg-orange-900/20',
      examples: ['Chat widget', 'Uložené preference', 'Jazykové nastavení', 'Témata'],
      required: false
    }
  ]

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <Cookie className="h-8 w-8 text-blue-600" />
            <h1 className="text-3xl font-bold">Nastavení cookies</h1>
          </div>
          <p className="text-muted-foreground text-lg">
            Spravujte své preference ohledně cookies a ochrany soukromí. 
            Můžete kdykoli změnit svá nastavení.
          </p>
        </div>

        {/* Current status */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Aktuální stav
            </CardTitle>
          </CardHeader>
          <CardContent>
            {hasConsent === null ? (
              <Badge variant="secondary">Načítání...</Badge>
            ) : hasConsent ? (
              <div className="flex items-center gap-2">
                <Badge className="bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300">
                  Souhlas udělen
                </Badge>
                <span className="text-sm text-muted-foreground">
                  Vaše preference byly uloženy
                </span>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Badge variant="destructive">Souhlas neudělen</Badge>
                <span className="text-sm text-muted-foreground">
                  Používáme pouze nezbytné cookies
                </span>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Cookie types */}
        <div className="space-y-6 mb-8">
          {cookieTypes.map((cookieType) => {
            const Icon = cookieType.icon
            const isEnabled = localPreferences[cookieType.key]
            
            return (
              <Card key={cookieType.key} className="overflow-hidden">
                <CardHeader className={`${cookieType.bgColor} border-b`}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Icon className={`h-6 w-6 ${cookieType.color}`} />
                      <div>
                        <CardTitle className="text-lg">{cookieType.title}</CardTitle>
                        {cookieType.required && (
                          <Badge className="mt-1 bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300">
                            Vždy aktivní
                          </Badge>
                        )}
                      </div>
                    </div>
                    
                    {!cookieType.required && (
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={isEnabled}
                          onChange={(e) => updateLocalPreference(cookieType.key, e.target.checked)}
                          className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
                      </label>
                    )}
                  </div>
                </CardHeader>
                
                <CardContent className="pt-4">
                  <p className="text-muted-foreground mb-4">
                    {cookieType.description}
                  </p>
                  
                  <div>
                    <h4 className="font-medium mb-2">Příklady použití:</h4>
                    <div className="flex flex-wrap gap-2">
                      {cookieType.examples.map((example, index) => (
                        <Badge key={index} variant="outline" className="text-xs">
                          {example}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>

        {/* Action buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button
            variant="outline"
            onClick={rejectAll}
            className="flex-1 sm:flex-none"
          >
            Odmítnout vše
          </Button>
          <Button
            variant="outline"
            onClick={savePreferences}
            className="flex-1 sm:flex-none"
          >
            Uložit nastavení
          </Button>
          <Button
            onClick={acceptAll}
            className="flex-1 sm:flex-none bg-blue-600 hover:bg-blue-700"
          >
            Přijmout vše
          </Button>
        </div>

        {/* Additional info */}
        <div className="mt-8 p-4 bg-muted rounded-lg">
          <h3 className="font-medium mb-2">Další informace</h3>
          <p className="text-sm text-muted-foreground mb-2">
            Podrobné informace o tom, jak používáme cookies, najdete v našich zásadách:
          </p>
          <div className="flex flex-wrap gap-4 text-sm">
            <Link href="/cs/cookie-policy" className="text-blue-600 hover:underline">
              Cookie Policy
            </Link>
            <Link href="/cs/privacy-policy" className="text-blue-600 hover:underline">
              Zásady ochrany osobních údajů
            </Link>
            <Link href="/cs/terms" className="text-blue-600 hover:underline">
              Obchodní podmínky
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
