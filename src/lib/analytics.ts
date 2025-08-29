'use client'

// Google Analytics 4 implementation
declare global {
  interface Window {
    gtag: (...args: any[]) => void
    dataLayer: any[]
  }
}

export const GA_TRACKING_ID = process.env.NEXT_PUBLIC_GA_TRACKING_ID || 'G-N2JMW8FGB1'

// Initialize Google Analytics
export const initGA = () => {
  // Only run on client side and in production
  if (typeof window === 'undefined') return
  
  // Load gtag script
  const script1 = document.createElement('script')
  script1.async = true
  script1.src = `https://www.googletagmanager.com/gtag/js?id=${GA_TRACKING_ID}`
  document.head.appendChild(script1)

  // Initialize dataLayer and gtag
  window.dataLayer = window.dataLayer || []
  window.gtag = function gtag() {
    window.dataLayer.push(arguments)
  }
  
  window.gtag('js', new Date())
  window.gtag('config', GA_TRACKING_ID, {
    page_title: document.title,
    page_location: window.location.href,
  })
}

// Track page views
export const trackPageView = (url: string, title?: string) => {
  if (typeof window === 'undefined' || !window.gtag) return
  
  window.gtag('config', GA_TRACKING_ID, {
    page_path: url,
    page_title: title || document.title,
  })
}

// Track custom events
export const trackEvent = (
  action: string,
  category: string = 'general',
  label?: string,
  value?: number,
  customParameters?: Record<string, any>
) => {
  if (typeof window === 'undefined' || !window.gtag) return
  
  window.gtag('event', action, {
    event_category: category,
    event_label: label,
    value: value,
    ...customParameters
  })
}

// Specific tracking functions for subtitle app
export const analytics = {
  // Translation events
  translationStarted: (sourceLanguage: string, targetLanguage: string, fileSize: number) => {
    trackEvent('translation_started', 'translation', `${sourceLanguage}_to_${targetLanguage}`, fileSize)
  },
  
  translationCompleted: (sourceLanguage: string, targetLanguage: string, duration: number, subtitleCount: number) => {
    trackEvent('translation_completed', 'translation', `${sourceLanguage}_to_${targetLanguage}`, duration, {
      subtitle_count: subtitleCount,
      processing_time: duration
    })
  },
  
  translationFailed: (sourceLanguage: string, targetLanguage: string, error: string) => {
    trackEvent('translation_failed', 'translation', `${sourceLanguage}_to_${targetLanguage}`, undefined, {
      error_message: error
    })
  },

  // File events
  fileUploaded: (fileType: string, fileSize: number) => {
    trackEvent('file_uploaded', 'file', fileType, fileSize)
  },
  
  fileDownloaded: (fileType: string, language: string) => {
    trackEvent('file_downloaded', 'file', `${fileType}_${language}`)
  },

  // User events
  userRegistered: (method: string) => {
    trackEvent('sign_up', 'user', method)
  },
  
  userLoggedIn: (method: string) => {
    trackEvent('login', 'user', method)
  },

  // Feature usage
  favoriteLanguageAdded: (language: string) => {
    trackEvent('favorite_language_added', 'feature', language)
  },
  
  favoriteLanguageRemoved: (language: string) => {
    trackEvent('favorite_language_removed', 'feature', language)
  },
  
  batchTranslationStarted: (fileCount: number, targetLanguage: string) => {
    trackEvent('batch_translation_started', 'batch', targetLanguage, fileCount)
  },

  // Video tools
  videoToolsUsed: (tool: string) => {
    trackEvent('video_tools_used', 'video', tool)
  },
  
  pipOverlayOpened: () => {
    trackEvent('pip_overlay_opened', 'video', 'picture_in_picture')
  },

  // Premium features
  premiumFeatureUsed: (feature: string) => {
    trackEvent('premium_feature_used', 'premium', feature)
  },

  creditsUsed: (amount: number, feature: string) => {
    trackEvent('credits_used', 'premium', feature, amount)
  },

  // Feedback events
  feedbackSubmitted: (locale: string, feedbackLength: number) => {
    trackEvent('feedback_submitted', 'feedback', locale, feedbackLength)
  },

  feedbackPageVisited: (locale: string) => {
    trackEvent('feedback_page_visited', 'feedback', locale)
  }
}

// Enhanced ecommerce tracking for premium features
export const trackPurchase = (transactionId: string, value: number, currency: string = 'USD') => {
  if (typeof window === 'undefined' || !window.gtag) return
  
  window.gtag('event', 'purchase', {
    transaction_id: transactionId,
    value: value,
    currency: currency,
    items: [{
      item_id: 'premium_credits',
      item_name: 'Premium Translation Credits',
      category: 'subscription',
      quantity: 1,
      price: value
    }]
  })
}

// Consent management for GDPR compliance
export const updateConsentMode = (analyticsConsent: boolean, adConsent: boolean) => {
  if (typeof window === 'undefined' || !window.gtag) return
  
  window.gtag('consent', 'update', {
    analytics_storage: analyticsConsent ? 'granted' : 'denied',
    ad_storage: adConsent ? 'granted' : 'denied',
    ad_user_data: adConsent ? 'granted' : 'denied',
    ad_personalization: adConsent ? 'granted' : 'denied'
  })
}
