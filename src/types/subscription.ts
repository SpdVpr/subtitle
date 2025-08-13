import { SubscriptionPlan } from '@/lib/stripe'

export interface UserSubscription {
  id: string
  userId: string
  plan: SubscriptionPlan
  status: 'active' | 'canceled' | 'past_due' | 'unpaid' | 'incomplete'
  stripeCustomerId?: string
  stripeSubscriptionId?: string
  stripePriceId?: string
  currentPeriodStart: Date
  currentPeriodEnd: Date
  cancelAtPeriodEnd: boolean
  createdAt: Date
  updatedAt: Date
}

export interface UsageStats {
  userId: string
  month: string // YYYY-MM format
  translationsUsed: number
  storageUsed: number // in bytes
  apiCallsUsed: number
  lastUpdated: Date
}

export interface PaymentMethod {
  id: string
  userId: string
  stripePaymentMethodId: string
  type: 'card' | 'bank_account'
  last4: string
  brand?: string
  expiryMonth?: number
  expiryYear?: number
  isDefault: boolean
  createdAt: Date
}

export interface Invoice {
  id: string
  userId: string
  stripeInvoiceId: string
  amount: number
  currency: string
  status: 'draft' | 'open' | 'paid' | 'uncollectible' | 'void'
  invoiceUrl?: string
  pdfUrl?: string
  dueDate?: Date
  paidAt?: Date
  createdAt: Date
}

export interface SubscriptionContextType {
  subscription: UserSubscription | null
  usage: UsageStats | null
  loading: boolean
  error: string | null
  
  // Actions
  createCheckoutSession: (priceId: string) => Promise<{ url: string }>
  createPortalSession: () => Promise<{ url: string }>
  cancelSubscription: () => Promise<void>
  resumeSubscription: () => Promise<void>
  updatePaymentMethod: (paymentMethodId: string) => Promise<void>
  refreshSubscription: () => Promise<void>
  
  // Usage tracking
  incrementUsage: (type: 'translation' | 'api_call', amount?: number) => Promise<void>
  canPerformAction: (action: string) => { allowed: boolean; reason?: string }
}

export interface CheckoutSessionRequest {
  priceId: string
  successUrl?: string
  cancelUrl?: string
  metadata?: Record<string, string>
}

export interface PortalSessionRequest {
  returnUrl?: string
}

export interface WebhookEvent {
  id: string
  type: string
  data: {
    object: any
  }
  created: number
}
