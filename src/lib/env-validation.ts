/**
 * Environment variables validation and type safety
 */

// Server-side environment variables (never exposed to client)
export const serverEnv = {
  // Firebase Admin
  FIREBASE_ADMIN_PROJECT_ID: process.env.FIREBASE_ADMIN_PROJECT_ID,
  FIREBASE_ADMIN_CLIENT_EMAIL: process.env.FIREBASE_ADMIN_CLIENT_EMAIL,
  FIREBASE_ADMIN_PRIVATE_KEY: process.env.FIREBASE_ADMIN_PRIVATE_KEY?.replace(/\\n/g, '\n'),
  
  // API Keys (server-only)
  OPENAI_API_KEY: process.env.OPENAI_API_KEY,
  GOOGLE_TRANSLATE_API_KEY: process.env.GOOGLE_TRANSLATE_API_KEY,
  JIMAKU_API_KEY: process.env.JIMAKU_API_KEY,
  OPENSUBTITLES_API_KEY: process.env.OPENSUBTITLES_API_KEY,
  
  // Stripe (server-only)
  STRIPE_SECRET_KEY: process.env.STRIPE_SECRET_KEY,
  STRIPE_WEBHOOK_SECRET: process.env.STRIPE_WEBHOOK_SECRET,
  
  // Sentry
  SENTRY_DSN: process.env.SENTRY_DSN,
  SENTRY_ORG: process.env.SENTRY_ORG,
  SENTRY_PROJECT: process.env.SENTRY_PROJECT,
  SENTRY_AUTH_TOKEN: process.env.SENTRY_AUTH_TOKEN,
  
  // Database
  DATABASE_URL: process.env.DATABASE_URL,
  
  // App
  NODE_ENV: process.env.NODE_ENV,
  NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET,
  NEXTAUTH_URL: process.env.NEXTAUTH_URL,
} as const

// Client-side environment variables (safe to expose)
export const clientEnv = {
  // Firebase (client-safe)
  NEXT_PUBLIC_FIREBASE_API_KEY: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  NEXT_PUBLIC_FIREBASE_PROJECT_ID: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  NEXT_PUBLIC_FIREBASE_APP_ID: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  
  // Stripe (client-safe)
  NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY: process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY,
  
  // Sentry (client-safe)
  NEXT_PUBLIC_SENTRY_DSN: process.env.NEXT_PUBLIC_SENTRY_DSN,
  
  // App
  NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL,
  NEXT_PUBLIC_APP_VERSION: process.env.NEXT_PUBLIC_APP_VERSION,
} as const

/**
 * Validate required environment variables
 */
export function validateEnv() {
  const errors: string[] = []
  
  // Required server-side variables
  const requiredServerVars = [
    'FIREBASE_ADMIN_PROJECT_ID',
    'FIREBASE_ADMIN_CLIENT_EMAIL', 
    'FIREBASE_ADMIN_PRIVATE_KEY',
    'OPENAI_API_KEY',
    'STRIPE_SECRET_KEY'
  ] as const
  
  for (const varName of requiredServerVars) {
    if (!serverEnv[varName]) {
      errors.push(`Missing required server environment variable: ${varName}`)
    }
  }
  
  // Required client-side variables
  const requiredClientVars = [
    'NEXT_PUBLIC_FIREBASE_API_KEY',
    'NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN',
    'NEXT_PUBLIC_FIREBASE_PROJECT_ID',
    'NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY'
  ] as const
  
  for (const varName of requiredClientVars) {
    if (!clientEnv[varName]) {
      errors.push(`Missing required client environment variable: ${varName}`)
    }
  }
  
  // Validate API key formats
  if (serverEnv.OPENAI_API_KEY && !serverEnv.OPENAI_API_KEY.startsWith('sk-')) {
    errors.push('OPENAI_API_KEY must start with "sk-"')
  }
  
  if (serverEnv.STRIPE_SECRET_KEY && !serverEnv.STRIPE_SECRET_KEY.startsWith('sk_')) {
    errors.push('STRIPE_SECRET_KEY must start with "sk_"')
  }
  
  if (clientEnv.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY && 
      !clientEnv.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY.startsWith('pk_')) {
    errors.push('NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY must start with "pk_"')
  }
  
  // Check for accidentally exposed secrets
  const dangerousClientVars = Object.entries(clientEnv).filter(([key, value]) => {
    if (!value) return false
    
    // Check for secret-like patterns
    return (
      value.includes('sk_') ||
      value.includes('secret') ||
      value.includes('private') ||
      (key.includes('API_KEY') && !key.includes('PUBLISHABLE'))
    )
  })
  
  for (const [key, value] of dangerousClientVars) {
    errors.push(`Potentially dangerous value in client environment variable: ${key}`)
  }
  
  if (errors.length > 0) {
    console.error('Environment validation errors:')
    errors.forEach(error => console.error(`  - ${error}`))
    
    if (process.env.NODE_ENV === 'production') {
      throw new Error('Environment validation failed. Check server logs.')
    }
  }
  
  return {
    isValid: errors.length === 0,
    errors
  }
}

/**
 * Get safe environment variables for client-side use
 */
export function getClientEnv() {
  return clientEnv
}

/**
 * Get server environment variables (server-side only)
 */
export function getServerEnv() {
  if (typeof window !== 'undefined') {
    throw new Error('Server environment variables cannot be accessed on client-side')
  }
  return serverEnv
}

// Validate environment on module load
if (process.env.NODE_ENV !== 'test') {
  validateEnv()
}
