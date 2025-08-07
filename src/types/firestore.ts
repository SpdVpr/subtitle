import { Timestamp } from 'firebase/firestore'

export interface UserProfile {
  uid: string
  email: string
  displayName?: string
  subscriptionTier: 'free' | 'premium'
  subscriptionId?: string
  stripeCustomerId?: string
  translationsUsed: number
  translationsLimit: number
  createdAt: Timestamp
  lastLoginAt: Timestamp
  updatedAt: Timestamp
}

export interface Translation {
  id: string
  userId: string
  originalFileName: string
  targetLanguage: string
  sourceLanguage: string
  aiService: 'google' | 'openai'
  status: 'processing' | 'completed' | 'failed'
  originalFileSize: number
  originalFileUrl?: string
  translatedFileUrl?: string
  processingTimeMs?: number
  subtitleCount?: number
  createdAt: Timestamp
  completedAt?: Timestamp
  errorMessage?: string
  metadata?: {
    userAgent?: string
    ipAddress?: string
  }
}

export interface Subscription {
  userId: string
  stripeSubscriptionId: string
  status: 'active' | 'canceled' | 'past_due' | 'unpaid'
  currentPeriodStart: Timestamp
  currentPeriodEnd: Timestamp
  planId: string
  priceId: string
  createdAt: Timestamp
  updatedAt: Timestamp
}
