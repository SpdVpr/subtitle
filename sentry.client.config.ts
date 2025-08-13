import * as Sentry from '@sentry/nextjs'

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  
  // Set tracesSampleRate to 1.0 to capture 100% of the transactions for performance monitoring.
  // We recommend adjusting this value in production
  tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0,
  
  // Capture Replay for 10% of all sessions,
  // plus for 100% of sessions with an error
  replaysSessionSampleRate: 0.1,
  replaysOnErrorSampleRate: 1.0,
  
  // Debug mode
  debug: process.env.NODE_ENV === 'development',
  
  // Environment
  environment: process.env.NODE_ENV,
  
  // Release tracking
  release: process.env.NEXT_PUBLIC_APP_VERSION,
  
  beforeSend(event, hint) {
    // Filter out certain errors in development
    if (process.env.NODE_ENV === 'development') {
      console.log('Sentry event (dev):', event)
      // Skip hydration errors and other development-only issues
      if (event.exception?.values?.[0]?.value?.includes('Hydration')) {
        return null
      }

      // Skip ResizeObserver errors (common in development)
      if (event.exception?.values?.[0]?.value?.includes('ResizeObserver')) {
        return null
      }

      // Skip Stripe errors in development
      if (event.exception?.values?.[0]?.value?.includes('Stripe')) {
        return null
      }
    }

    // Filter out network errors that are not actionable
    if (event.exception?.values?.[0]?.value?.includes('NetworkError')) {
      return null
    }

    // Filter out translation service errors (handled gracefully)
    if (event.exception?.values?.[0]?.value?.includes('Translation failed')) {
      return null
    }

    return event
  },
  
  integrations: [
    // Replay integration removed - not available in this Sentry version
  ],
})
