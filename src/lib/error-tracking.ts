import * as Sentry from '@sentry/nextjs'
import { ErrorLogService } from './database'

// Initialize Sentry (this would typically be done in a separate config file)
if (process.env.NEXT_PUBLIC_SENTRY_DSN) {
  Sentry.init({
    dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
    environment: process.env.NODE_ENV,
    tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0,
    debug: process.env.NODE_ENV === 'development',
    
    beforeSend(event) {
      // Filter out certain errors in development
      if (process.env.NODE_ENV === 'development') {
        // Skip hydration errors and other development-only issues
        if (event.exception?.values?.[0]?.value?.includes('Hydration')) {
          return null
        }
      }
      return event
    }
  })
}

export interface ErrorContext {
  userId?: string
  jobId?: string
  component?: string
  action?: string
  metadata?: Record<string, any>
}

export class ErrorTracker {
  /**
   * Log error to both Sentry and Firestore
   */
  static async logError(
    error: Error | string,
    context?: ErrorContext,
    level: 'error' | 'warning' | 'info' = 'error'
  ): Promise<void> {
    const errorMessage = typeof error === 'string' ? error : error.message
    const errorStack = typeof error === 'string' ? undefined : error.stack

    try {
      // Log to Sentry
      if (process.env.NEXT_PUBLIC_SENTRY_DSN) {
        Sentry.withScope((scope) => {
          scope.setLevel(level)
          
          if (context?.userId) {
            scope.setUser({ id: context.userId })
          }
          
          if (context?.component) {
            scope.setTag('component', context.component)
          }
          
          if (context?.action) {
            scope.setTag('action', context.action)
          }
          
          if (context?.jobId) {
            scope.setContext('job', { jobId: context.jobId })
          }
          
          if (context?.metadata) {
            scope.setContext('metadata', context.metadata)
          }
          
          if (typeof error === 'string') {
            Sentry.captureMessage(error, level)
          } else {
            Sentry.captureException(error)
          }
        })
      }

      // Log to Firestore for our own tracking
      await ErrorLogService.logError({
        userId: context?.userId,
        jobId: context?.jobId,
        error: errorMessage,
        stack: errorStack,
        context: {
          component: context?.component,
          action: context?.action,
          ...context?.metadata,
          userAgent: typeof window !== 'undefined' ? window.navigator.userAgent : undefined,
          url: typeof window !== 'undefined' ? window.location.href : undefined
        }
      })

    } catch (logError) {
      // Fallback to console if logging fails
      console.error('Failed to log error:', logError)
      console.error('Original error:', error)
    }
  }

  /**
   * Log translation error
   */
  static async logTranslationError(
    error: Error | string,
    userId: string,
    jobId?: string,
    metadata?: {
      sourceLanguage?: string
      targetLanguage?: string
      aiService?: string
      fileSize?: number
      subtitleCount?: number
    }
  ): Promise<void> {
    await this.logError(error, {
      userId,
      jobId,
      component: 'translation',
      action: 'translate',
      metadata
    })
  }

  /**
   * Log batch processing error
   */
  static async logBatchError(
    error: Error | string,
    userId: string,
    batchJobId: string,
    metadata?: {
      totalFiles?: number
      processedFiles?: number
      currentFile?: string
    }
  ): Promise<void> {
    await this.logError(error, {
      userId,
      jobId: batchJobId,
      component: 'batch',
      action: 'process',
      metadata
    })
  }

  /**
   * Log authentication error
   */
  static async logAuthError(
    error: Error | string,
    action: 'login' | 'register' | 'logout' | 'verify',
    metadata?: {
      email?: string
      provider?: string
    }
  ): Promise<void> {
    await this.logError(error, {
      component: 'auth',
      action,
      metadata
    })
  }

  /**
   * Log payment error
   */
  static async logPaymentError(
    error: Error | string,
    userId: string,
    metadata?: {
      plan?: string
      amount?: number
      currency?: string
      paymentMethod?: string
    }
  ): Promise<void> {
    await this.logError(error, {
      userId,
      component: 'payment',
      action: 'process',
      metadata
    })
  }

  /**
   * Log file upload error
   */
  static async logUploadError(
    error: Error | string,
    userId: string,
    metadata?: {
      fileName?: string
      fileSize?: number
      fileType?: string
    }
  ): Promise<void> {
    await this.logError(error, {
      userId,
      component: 'upload',
      action: 'upload',
      metadata
    })
  }

  /**
   * Log API error
   */
  static async logApiError(
    error: Error | string,
    endpoint: string,
    method: string,
    userId?: string,
    metadata?: {
      statusCode?: number
      requestBody?: any
      responseBody?: any
    }
  ): Promise<void> {
    await this.logError(error, {
      userId,
      component: 'api',
      action: `${method} ${endpoint}`,
      metadata
    })
  }

  /**
   * Set user context for error tracking
   */
  static setUser(userId: string, email?: string): void {
    if (process.env.NEXT_PUBLIC_SENTRY_DSN) {
      Sentry.setUser({
        id: userId,
        email
      })
    }
  }

  /**
   * Clear user context
   */
  static clearUser(): void {
    if (process.env.NEXT_PUBLIC_SENTRY_DSN) {
      Sentry.setUser(null)
    }
  }

  /**
   * Add breadcrumb for debugging
   */
  static addBreadcrumb(
    message: string,
    category: string,
    level: 'info' | 'warning' | 'error' = 'info',
    data?: Record<string, any>
  ): void {
    if (process.env.NEXT_PUBLIC_SENTRY_DSN) {
      Sentry.addBreadcrumb({
        message,
        category,
        level,
        data,
        timestamp: Date.now() / 1000
      })
    }
  }

  /**
   * Measure performance
   */
  static startTransaction(name: string, operation: string) {
    if (process.env.NEXT_PUBLIC_SENTRY_DSN) {
      // Use startNewTrace for newer Sentry versions
      if (typeof Sentry.startNewTrace === 'function') {
        return Sentry.startNewTrace({ name, op: operation }, () => {})
      }

      // Fallback for older versions
      if (typeof (Sentry as any).startTransaction === 'function') {
        return (Sentry as any).startTransaction({ name, op: operation })
      }
    }

    // Mock transaction if not available
    return {
      setTag: () => {},
      setData: () => {},
      finish: () => {},
    }
  }

  /**
   * Capture performance metric
   */
  static captureMetric(
    name: string,
    value: number,
    unit: string = 'millisecond',
    tags?: Record<string, string>
  ): void {
    if (process.env.NEXT_PUBLIC_SENTRY_DSN) {
      // Sentry metrics (if available in your plan)
      console.log(`Metric: ${name} = ${value}${unit}`, tags)
    }
  }
}

// Global error handler for unhandled errors
if (typeof window !== 'undefined') {
  window.addEventListener('unhandledrejection', (event) => {
    ErrorTracker.logError(
      event.reason instanceof Error ? event.reason : new Error(String(event.reason)),
      { component: 'global', action: 'unhandledRejection' }
    )
  })

  window.addEventListener('error', (event) => {
    ErrorTracker.logError(
      event.error || new Error(event.message),
      { 
        component: 'global', 
        action: 'uncaughtError',
        metadata: {
          filename: event.filename,
          lineno: event.lineno,
          colno: event.colno
        }
      }
    )
  })
}
