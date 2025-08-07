import Stripe from 'stripe'

// Server-side only Stripe instance
export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-12-18.acacia',
})

// Subscription plans configuration
export const SUBSCRIPTION_PLANS = {
  free: {
    id: 'free',
    name: 'Free',
    price: 0,
    currency: 'usd',
    interval: 'month',
    features: [
      '5 translations per month',
      'Google Translate AI',
      'Basic SRT export',
      '1MB file limit',
      'Standard timing adjustment'
    ],
    limits: {
      translationsPerMonth: 5,
      maxFileSize: 1024 * 1024, // 1MB
      aiServices: ['google'],
      batchProcessing: false,
      prioritySupport: false
    }
  },
  premium: {
    id: 'premium',
    name: 'Premium',
    price: 999, // $9.99 in cents
    currency: 'usd',
    interval: 'month',
    stripePriceId: process.env.STRIPE_PREMIUM_PRICE_ID || 'price_demo_premium',
    features: [
      'Unlimited translations',
      'OpenAI GPT-4 AI',
      '🎬 Premium Context AI',
      'Advanced export options',
      '10MB file limit',
      'Intelligent timing adjustment',
      'Priority support'
    ],
    limits: {
      translationsPerMonth: -1, // Unlimited
      maxFileSize: 10 * 1024 * 1024, // 10MB
      aiServices: ['google', 'openai', 'premium'],
      batchProcessing: false,
      prioritySupport: true
    }
  },
  pro: {
    id: 'pro',
    name: 'Pro',
    price: 1999, // $19.99 in cents
    currency: 'usd',
    interval: 'month',
    stripePriceId: process.env.STRIPE_PRO_PRICE_ID || 'price_demo_pro',
    features: [
      'Everything in Premium',
      'Batch translations',
      'API access',
      'Custom integrations',
      '100MB file limit',
      'Advanced analytics',
      'Dedicated support'
    ],
    limits: {
      translationsPerMonth: -1, // Unlimited
      maxFileSize: 100 * 1024 * 1024, // 100MB
      aiServices: ['google', 'openai', 'premium'],
      batchProcessing: true,
      prioritySupport: true
    }
  }
} as const

export type SubscriptionPlan = keyof typeof SUBSCRIPTION_PLANS

// Helper functions
export function getPlanConfig(plan: SubscriptionPlan) {
  return SUBSCRIPTION_PLANS[plan]
}

export function formatPrice(price: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(price / 100) // Convert from cents
}

export function isValidPlan(plan: string): plan is SubscriptionPlan {
  return plan in SUBSCRIPTION_PLANS
}
