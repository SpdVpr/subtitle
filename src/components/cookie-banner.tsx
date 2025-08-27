'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { X, Settings, Cookie } from 'lucide-react'
import Link from 'next/link'
import {
  getSessionId,
  logCookieConsent,
  createConsentData,
  applyCookiePreferences as applyPreferences
} from '@/lib/cookie-consent-client'

interface CookiePreferences {
  necessary: boolean
  analytics: boolean
  marketing: boolean
  functional: boolean
}

export function CookieBannerCZ() {
  const [showBanner, setShowBanner] = useState(false)
  const [showSettings, setShowSettings] = useState(false)
  const [preferences, setPreferences] = useState<CookiePreferences>({
    necessary: true, // Always true, can't be disabled
    analytics: false,
    marketing: false,
    functional: false
  })

  useEffect(() => {
    // Check if user has already made a choice
    const cookieConsent = localStorage.getItem('cookie-consent')
    if (!cookieConsent) {
      // Show banner after a short delay
      const timer = setTimeout(() => setShowBanner(true), 1000)
      return () => clearTimeout(timer)
    } else {
      // Load saved preferences
      try {
        const savedPreferences = JSON.parse(cookieConsent)
        setPreferences(savedPreferences)
        // Apply preferences (e.g., load analytics scripts)
        applyPreferences(savedPreferences)
      } catch (error) {
        console.error('Error parsing cookie preferences:', error)
      }
    }
  }, [])

  const logConsent = async (prefs: CookiePreferences, method: any, previousPrefs?: CookiePreferences) => {
    const consentData = createConsentData(prefs, method, 'cs', undefined, previousPrefs)
    await logCookieConsent(consentData)
  }

  const acceptAll = async () => {
    const previousPrefs = JSON.parse(localStorage.getItem('cookie-consent') || 'null')
    const allAccepted = {
      necessary: true,
      analytics: true,
      marketing: true,
      functional: true
    }
    setPreferences(allAccepted)
    localStorage.setItem('cookie-consent', JSON.stringify(allAccepted))
    applyPreferences(allAccepted)
    await logConsent(allAccepted, 'banner_accept_all', previousPrefs)
    setShowBanner(false)
    setShowSettings(false)
  }

  const acceptSelected = async () => {
    const previousPrefs = JSON.parse(localStorage.getItem('cookie-consent') || 'null')
    localStorage.setItem('cookie-consent', JSON.stringify(preferences))
    applyPreferences(preferences)
    await logConsent(preferences, 'banner_custom', previousPrefs)
    setShowBanner(false)
    setShowSettings(false)
  }

  const rejectAll = async () => {
    const previousPrefs = JSON.parse(localStorage.getItem('cookie-consent') || 'null')
    const onlyNecessary = {
      necessary: true,
      analytics: false,
      marketing: false,
      functional: false
    }
    setPreferences(onlyNecessary)
    localStorage.setItem('cookie-consent', JSON.stringify(onlyNecessary))
    applyPreferences(onlyNecessary)
    await logConsent(onlyNecessary, 'banner_reject_all', previousPrefs)
    setShowBanner(false)
    setShowSettings(false)
  }

  const updatePreference = (key: keyof CookiePreferences, value: boolean) => {
    if (key === 'necessary') return // Can't disable necessary cookies
    setPreferences(prev => ({ ...prev, [key]: value }))
  }

  if (!showBanner) return null

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center p-4 pointer-events-none">
      <Card className="w-full max-w-2xl pointer-events-auto shadow-2xl border-2">
        <CardContent className="p-6">
          {!showSettings ? (
            // Simple banner
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <Cookie className="h-6 w-6 text-blue-600 mt-1 flex-shrink-0" />
                <div className="flex-1">
                  <h3 className="font-semibold text-lg mb-2">
                    Používáme cookies 🍪
                  </h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Používáme cookies k zajištění správného fungování webu, analýze návštěvnosti 
                    a zlepšení vašeho zážitku. Kliknutím na "Přijmout vše" souhlasíte s používáním 
                    všech cookies.
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Více informací najdete v naší{' '}
                    <Link href="/cookie-policy" className="text-blue-600 hover:underline">
                      Cookie Policy
                    </Link>
                    {' '}a{' '}
                    <Link href="/privacy-policy" className="text-blue-600 hover:underline">
                      Zásadách ochrany osobních údajů
                    </Link>
                    .
                  </p>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-2 justify-end">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowSettings(true)}
                  className="flex items-center gap-2"
                >
                  <Settings className="h-4 w-4" />
                  Nastavení
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={rejectAll}
                >
                  Odmítnout vše
                </Button>
                <Button
                  size="sm"
                  onClick={acceptAll}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  Přijmout vše
                </Button>
              </div>
            </div>
          ) : (
            // Detailed settings
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-lg">Nastavení cookies</h3>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowSettings(false)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>

              <div className="space-y-4">
                {/* Necessary cookies */}
                <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded">
                  <div className="flex-1">
                    <h4 className="font-medium">Nezbytné cookies</h4>
                    <p className="text-sm text-muted-foreground">
                      Tyto cookies jsou nutné pro správné fungování webu a nelze je vypnout.
                    </p>
                  </div>
                  <div className="text-sm font-medium text-green-600">
                    Vždy aktivní
                  </div>
                </div>

                {/* Analytics cookies */}
                <div className="flex items-center justify-between p-3 border rounded">
                  <div className="flex-1">
                    <h4 className="font-medium">Analytické cookies</h4>
                    <p className="text-sm text-muted-foreground">
                      Pomáhají nám pochopit, jak návštěvníci používají web.
                    </p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={preferences.analytics}
                      onChange={(e) => updatePreference('analytics', e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
                  </label>
                </div>

                {/* Marketing cookies */}
                <div className="flex items-center justify-between p-3 border rounded">
                  <div className="flex-1">
                    <h4 className="font-medium">Marketingové cookies</h4>
                    <p className="text-sm text-muted-foreground">
                      Používají se pro zobrazování relevantních reklam.
                    </p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={preferences.marketing}
                      onChange={(e) => updatePreference('marketing', e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
                  </label>
                </div>

                {/* Functional cookies */}
                <div className="flex items-center justify-between p-3 border rounded">
                  <div className="flex-1">
                    <h4 className="font-medium">Funkční cookies</h4>
                    <p className="text-sm text-muted-foreground">
                      Umožňují pokročilé funkce jako chat nebo uložení preferencí.
                    </p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={preferences.functional}
                      onChange={(e) => updatePreference('functional', e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
                  </label>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-2 justify-end pt-4 border-t">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={rejectAll}
                >
                  Odmítnout vše
                </Button>
                <Button
                  size="sm"
                  onClick={acceptSelected}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  Uložit nastavení
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
