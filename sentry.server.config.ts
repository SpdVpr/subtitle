import * as Sentry from '@sentry/nextjs'

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  
  // Set tracesSampleRate to 1.0 to capture 100% of the transactions for performance monitoring.
  // We recommend adjusting this value in production
  tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0,
  
  // Debug mode
  debug: process.env.NODE_ENV === 'development',
  
  // Environment
  environment: process.env.NODE_ENV,
  
  // Release tracking
  release: process.env.NEXT_PUBLIC_APP_VERSION,
  
  beforeSend(event, hint) {
    // Filter out certain server-side errors
    if (process.env.NODE_ENV === 'development') {
      console.log('Sentry server event (dev):', event)
      // Skip certain development errors
      if (event.exception?.values?.[0]?.value?.includes('ECONNREFUSED')) {
        return null
      }

      // Skip Firebase connection errors in development
      if (event.exception?.values?.[0]?.value?.includes('Firebase')) {
        return null
      }

      // Skip Stripe test mode errors
      if (event.exception?.values?.[0]?.value?.includes('test mode')) {
        return null
      }
    }

    // Add additional context for production errors
    if (process.env.NODE_ENV === 'production') {
      event.tags = {
        ...event.tags,
        component: 'server',
        version: process.env.NEXT_PUBLIC_APP_VERSION || '1.0.0'
      }
    }

    return event
  },
})
