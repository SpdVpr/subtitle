import { loadStripe, Stripe } from '@stripe/stripe-js'

// Server-side Stripe instance (only import on server)
let stripe: any = null
if (typeof window === 'undefined') {
  // Only import Stripe on server-side
  const StripeServer = require('stripe')
  stripe = new StripeServer(process.env.STRIPE_SECRET_KEY!, {
    apiVersion: '2025-07-30.basil',
  })
}

export { stripe }

// Client-side Stripe instance
let stripePromise: Promise<Stripe | null>

export const getStripe = () => {
  if (!stripePromise) {
    stripePromise = loadStripe(
      process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || 'pk_test_demo_key'
    )
  }
  return stripePromise
}

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
      'Advanced export options',
      '10MB file limit',
      'Intelligent timing adjustment',
      'Batch processing',
      'Priority support'
    ],
    limits: {
      translationsPerMonth: -1, // unlimited
      maxFileSize: 10 * 1024 * 1024, // 10MB
      aiServices: ['google', 'openai'],
      batchProcessing: true,
      prioritySupport: true
    }
  },
  pro: {
    id: 'pro',
    name: 'Professional',
    price: 2999, // $29.99 in cents
    currency: 'usd',
    interval: 'month',
    stripePriceId: process.env.STRIPE_PRO_PRICE_ID || 'price_demo_pro',
    features: [
      'Everything in Premium',
      'API access',
      'Custom AI models',
      '100MB file limit',
      'White-label solution',
      'Dedicated support'
    ],
    limits: {
      translationsPerMonth: -1, // unlimited
      maxFileSize: 100 * 1024 * 1024, // 100MB
      aiServices: ['google', 'openai', 'custom'],
      batchProcessing: true,
      prioritySupport: true,
      apiAccess: true,
      whiteLabel: true
    }
  }
} as const

export type SubscriptionPlan = keyof typeof SUBSCRIPTION_PLANS
export type PlanConfig = typeof SUBSCRIPTION_PLANS[SubscriptionPlan]

export function getPlanConfig(planId: SubscriptionPlan): PlanConfig {
  return SUBSCRIPTION_PLANS[planId]
}

export function formatPrice(price: number, currency: string = 'usd'): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency.toUpperCase(),
  }).format(price / 100)
}

// Check if user can perform action based on their plan
export function canPerformAction(
  userPlan: SubscriptionPlan,
  action: 'translate' | 'batch' | 'api' | 'whiteLabel',
  currentUsage?: { translationsThisMonth: number }
): { allowed: boolean; reason?: string } {
  const plan = getPlanConfig(userPlan)

  switch (action) {
    case 'translate':
      if (plan.limits.translationsPerMonth === -1) {
        return { allowed: true }
      }
      if (currentUsage && currentUsage.translationsThisMonth >= plan.limits.translationsPerMonth) {
        return { 
          allowed: false, 
          reason: `Monthly limit of ${plan.limits.translationsPerMonth} translations reached` 
        }
      }
      return { allowed: true }

    case 'batch':
      return { 
        allowed: plan.limits.batchProcessing,
        reason: plan.limits.batchProcessing ? undefined : 'Batch processing requires Premium plan'
      }

    case 'api':
      return { 
        allowed: plan.limits.apiAccess || false,
        reason: plan.limits.apiAccess ? undefined : 'API access requires Professional plan'
      }

    case 'whiteLabel':
      return { 
        allowed: plan.limits.whiteLabel || false,
        reason: plan.limits.whiteLabel ? undefined : 'White-label solution requires Professional plan'
      }

    default:
      return { allowed: false, reason: 'Unknown action' }
  }
}
