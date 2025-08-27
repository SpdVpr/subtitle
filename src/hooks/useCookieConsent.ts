'use client'

import { useState, useEffect } from 'react'
import {
  CookiePreferences,
  applyCookiePreferences,
  logCookieConsent,
  createConsentData
} from '@/lib/cookie-consent-client'

const DEFAULT_PREFERENCES: CookiePreferences = {
  necessary: true,
  analytics: false,
  marketing: false,
  functional: false
}

export function useCookieConsent() {
  const [preferences, setPreferences] = useState<CookiePreferences>(DEFAULT_PREFERENCES)
  const [hasConsent, setHasConsent] = useState<boolean | null>(null)

  useEffect(() => {
    // Check if running in browser
    if (typeof window === 'undefined') return

    const savedConsent = localStorage.getItem('cookie-consent')
    if (savedConsent) {
      try {
        const parsed = JSON.parse(savedConsent)
        setPreferences(parsed)
        setHasConsent(true)
      } catch (error) {
        console.error('Error parsing cookie consent:', error)
        setHasConsent(false)
      }
    } else {
      setHasConsent(false)
    }
  }, [])

  const updatePreferences = async (newPreferences: CookiePreferences) => {
    const previousPrefs = JSON.parse(localStorage.getItem('cookie-consent') || 'null')
    setPreferences(newPreferences)
    localStorage.setItem('cookie-consent', JSON.stringify(newPreferences))
    setHasConsent(true)

    // Apply the preferences
    applyCookiePreferences(newPreferences)

    // Log the consent change
    const consentData = createConsentData(newPreferences, 'settings_page', 'en', undefined, previousPrefs)
    await logCookieConsent(consentData)
  }

  const acceptAll = async () => {
    const allAccepted: CookiePreferences = {
      necessary: true,
      analytics: true,
      marketing: true,
      functional: true
    }
    await updatePreferences(allAccepted)
  }

  const rejectAll = async () => {
    const onlyNecessary: CookiePreferences = {
      necessary: true,
      analytics: false,
      marketing: false,
      functional: false
    }
    await updatePreferences(onlyNecessary)
  }

  const resetConsent = () => {
    localStorage.removeItem('cookie-consent')
    setPreferences(DEFAULT_PREFERENCES)
    setHasConsent(false)
  }

  return {
    preferences,
    hasConsent,
    updatePreferences,
    acceptAll,
    rejectAll,
    resetConsent
  }
}

// Re-export helper functions from client module
export { isCookieAllowed, loadConditionalScript } from '@/lib/cookie-consent-client'
