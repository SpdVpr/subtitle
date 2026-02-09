import { getAdminDb } from './firebase-admin'

export interface CookieConsentRecord {
  id?: string
  userId?: string // Pokud je uživatel přihlášený
  sessionId: string // Unikátní ID pro nepřihlášené uživatele
  ipAddress: string
  userAgent: string
  timestamp: Date
  preferences: {
    necessary: boolean
    analytics: boolean
    marketing: boolean
    functional: boolean
  }
  consentMethod: 'banner_accept_all' | 'banner_reject_all' | 'banner_custom' | 'settings_page'
  language: 'cs' | 'en'
  pageUrl: string
  previousConsent?: CookieConsentRecord['preferences'] // Pro změny souhlasu
}

class CookieConsentLogger {
  private static instance: CookieConsentLogger
  private db: any = null
  private initialized = false

  private constructor() {}

  static getInstance(): CookieConsentLogger {
    if (!CookieConsentLogger.instance) {
      CookieConsentLogger.instance = new CookieConsentLogger()
    }
    return CookieConsentLogger.instance
  }

  private async initialize() {
    if (this.initialized) return

    try {
      this.db = getAdminDb()
      this.initialized = true
      console.log('🍪 Cookie Consent Logger initialized')
    } catch (error) {
      console.warn('🍪 Cookie Consent Logger: Firebase not available')
      this.initialized = true
    }
  }

  async logConsent(record: Omit<CookieConsentRecord, 'id' | 'timestamp'>): Promise<void> {
    await this.initialize()

    // Remove undefined values to avoid Firestore errors
    const consentRecord: any = {
      ...record,
      timestamp: new Date()
    }

    // Only include userId if it's defined
    if (!record.userId) {
      delete consentRecord.userId
    }

    // Only include previousConsent if it's defined
    if (!record.previousConsent) {
      delete consentRecord.previousConsent
    }

    // Always log to console for debugging
    console.log('🍪 Cookie Consent Logged:', {
      sessionId: record.sessionId,
      method: record.consentMethod,
      preferences: record.preferences,
      language: record.language
    })

    // Try to save to Firestore
    if (this.db) {
      try {
        await this.db.collection('cookie_consents').add(consentRecord)
        console.log('🍪 Cookie consent saved to Firestore')
      } catch (error) {
        console.error('🍪 Failed to save cookie consent to Firestore:', error)
      }
    }
  }

  async getConsentHistory(sessionId: string, limit: number = 10): Promise<CookieConsentRecord[]> {
    await this.initialize()

    if (!this.db) {
      console.warn('🍪 Cannot retrieve consent history: Firebase not available')
      return []
    }

    try {
      const snapshot = await this.db
        .collection('cookie_consents')
        .where('sessionId', '==', sessionId)
        .orderBy('timestamp', 'desc')
        .limit(limit)
        .get()

      const records: CookieConsentRecord[] = []
      snapshot.forEach((doc: any) => {
        const data = doc.data()
        records.push({
          id: doc.id,
          ...data,
          timestamp: data.timestamp?.toDate() || new Date(data.timestamp)
        })
      })

      return records
    } catch (error) {
      console.error('🍪 Failed to retrieve consent history:', error)
      return []
    }
  }

  async getUserConsents(userId: string, limit: number = 10): Promise<CookieConsentRecord[]> {
    await this.initialize()

    if (!this.db) {
      console.warn('🍪 Cannot retrieve user consents: Firebase not available')
      return []
    }

    try {
      const snapshot = await this.db
        .collection('cookie_consents')
        .where('userId', '==', userId)
        .orderBy('timestamp', 'desc')
        .limit(limit)
        .get()

      const records: CookieConsentRecord[] = []
      snapshot.forEach((doc: any) => {
        const data = doc.data()
        records.push({
          id: doc.id,
          ...data,
          timestamp: data.timestamp?.toDate() || new Date(data.timestamp)
        })
      })

      return records
    } catch (error) {
      console.error('🍪 Failed to retrieve user consents:', error)
      return []
    }
  }

  // Pro admin dashboard - statistiky souhlasů
  async getConsentStats(days: number = 30): Promise<{
    totalConsents: number
    acceptAllCount: number
    rejectAllCount: number
    customCount: number
    analyticsAccepted: number
    marketingAccepted: number
    functionalAccepted: number
    byLanguage: { cs: number, en: number }
  }> {
    await this.initialize()

    if (!this.db) {
      return {
        totalConsents: 0,
        acceptAllCount: 0,
        rejectAllCount: 0,
        customCount: 0,
        analyticsAccepted: 0,
        marketingAccepted: 0,
        functionalAccepted: 0,
        byLanguage: { cs: 0, en: 0 }
      }
    }

    try {
      const since = new Date()
      since.setDate(since.getDate() - days)

      const snapshot = await this.db
        .collection('cookie_consents')
        .where('timestamp', '>=', since)
        .get()

      let totalConsents = 0
      let acceptAllCount = 0
      let rejectAllCount = 0
      let customCount = 0
      let analyticsAccepted = 0
      let marketingAccepted = 0
      let functionalAccepted = 0
      let csCount = 0
      let enCount = 0

      snapshot.forEach((doc: any) => {
        const data = doc.data()
        totalConsents++

        // Count by method
        if (data.consentMethod === 'banner_accept_all') acceptAllCount++
        else if (data.consentMethod === 'banner_reject_all') rejectAllCount++
        else customCount++

        // Count by preferences
        if (data.preferences?.analytics) analyticsAccepted++
        if (data.preferences?.marketing) marketingAccepted++
        if (data.preferences?.functional) functionalAccepted++

        // Count by language
        if (data.language === 'cs') csCount++
        else enCount++
      })

      return {
        totalConsents,
        acceptAllCount,
        rejectAllCount,
        customCount,
        analyticsAccepted,
        marketingAccepted,
        functionalAccepted,
        byLanguage: { cs: csCount, en: enCount }
      }
    } catch (error) {
      console.error('🍪 Failed to get consent stats:', error)
      return {
        totalConsents: 0,
        acceptAllCount: 0,
        rejectAllCount: 0,
        customCount: 0,
        analyticsAccepted: 0,
        marketingAccepted: 0,
        functionalAccepted: 0,
        byLanguage: { cs: 0, en: 0 }
      }
    }
  }
}

export const cookieConsentLogger = CookieConsentLogger.getInstance()

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

// Helper funkce pro získání IP adresy (na serveru)
export function getClientIP(request?: Request): string {
  if (typeof window !== 'undefined') return 'client-side'
  
  if (!request) return 'unknown'
  
  const headers = [
    'x-forwarded-for',
    'x-real-ip',
    'x-client-ip',
    'cf-connecting-ip'
  ]

  for (const header of headers) {
    const value = (request.headers as any).get?.(header)
    if (value) {
      const ip = value.split(',')[0].trim()
      if (ip && ip !== 'unknown') {
        return ip
      }
    }
  }

  return 'unknown'
}
