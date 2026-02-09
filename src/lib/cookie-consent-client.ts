// Client-side cookie consent utilities (no Firebase Admin SDK)

export interface CookiePreferences {
  necessary: boolean
  analytics: boolean
  marketing: boolean
  functional: boolean
}

export interface CookieConsentData {
  sessionId: string
  userId?: string
  preferences: CookiePreferences
  consentMethod: 'banner_accept_all' | 'banner_reject_all' | 'banner_custom' | 'settings_page'
  language: 'cs' | 'en'
  pageUrl: string
  previousConsent?: CookiePreferences
}

// Helper funkce pro získání session ID
export function getSessionId(): string {
  if (typeof window === 'undefined') return 'server-side'
  
  let sessionId = sessionStorage.getItem('session-id')
  if (!sessionId) {
    sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    sessionStorage.setItem('session-id', sessionId)
  }
  return sessionId
}

// Client-side funkce pro logování cookie souhlasu
export async function logCookieConsent(data: CookieConsentData): Promise<boolean> {
  try {
    const response = await fetch('/api/cookie-consent', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data)
    })

    if (!response.ok) {
      console.warn('Failed to log cookie consent:', response.statusText)
      return false
    }

    console.log('🍪 Cookie consent logged successfully')
    return true
  } catch (error) {
    console.warn('Error logging cookie consent:', error)
    return false
  }
}

// Helper funkce pro vytvoření consent data
export function createConsentData(
  preferences: CookiePreferences,
  method: CookieConsentData['consentMethod'],
  language: 'cs' | 'en',
  userId?: string,
  previousConsent?: CookiePreferences
): CookieConsentData {
  const data: any = {
    sessionId: getSessionId(),
    preferences,
    consentMethod: method,
    language,
    pageUrl: typeof window !== 'undefined' ? window.location.href : ''
  }

  // Only include userId if it exists
  if (userId) {
    data.userId = userId
  }

  // Only include previousConsent if it exists
  if (previousConsent) {
    data.previousConsent = previousConsent
  }

  return data
}

// Aplikování cookie preferencí (client-side)
export function applyCookiePreferences(preferences: CookiePreferences): void {
  // Analytics cookies
  if (preferences.analytics) {
    console.log('🍪 Analytics cookies enabled')
    // Enable Google Analytics
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('consent', 'update', {
        analytics_storage: 'granted'
      })
    }
  } else {
    console.log('🍪 Analytics cookies disabled')
    // Disable Google Analytics
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('consent', 'update', {
        analytics_storage: 'denied'
      })
    }
  }

  // Marketing cookies
  if (preferences.marketing) {
    console.log('🍪 Marketing cookies enabled')
    // Enable marketing tracking
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('consent', 'update', {
        ad_storage: 'granted',
        ad_user_data: 'granted',
        ad_personalization: 'granted'
      })
    }
  } else {
    console.log('🍪 Marketing cookies disabled')
    // Disable marketing tracking
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('consent', 'update', {
        ad_storage: 'denied',
        ad_user_data: 'denied',
        ad_personalization: 'denied'
      })
    }
  }

  // Functional cookies
  if (preferences.functional) {
    console.log('🍪 Functional cookies enabled')
    // Example: Enable chat widgets, preference storage
  } else {
    console.log('🍪 Functional cookies disabled')
  }
}

// Helper funkce pro kontrolu, zda je určitý typ cookies povolen
export function isCookieAllowed(type: keyof CookiePreferences): boolean {
  if (typeof window === 'undefined') return false
  
  const savedConsent = localStorage.getItem('cookie-consent')
  if (!savedConsent) return false

  try {
    const preferences = JSON.parse(savedConsent)
    return preferences[type] === true
  } catch {
    return false
  }
}

// Helper funkce pro načtení skriptů podmíněně na základě cookie souhlasu
export function loadConditionalScript(
  type: keyof CookiePreferences,
  scriptSrc: string,
  onLoad?: () => void
): void {
  if (!isCookieAllowed(type)) return

  const script = document.createElement('script')
  script.src = scriptSrc
  script.async = true
  if (onLoad) script.onload = onLoad
  document.head.appendChild(script)
}
