'use client'

import { useState, useEffect, createContext, useContext } from 'react'
import { useAuth } from './useAuth'
import { 
  UserSubscription, 
  UsageStats, 
  SubscriptionContextType 
} from '@/types/subscription'
import { SubscriptionPlan, canPerformAction as checkPlanAction } from '@/lib/stripe'

const SubscriptionContext = createContext<SubscriptionContextType | null>(null)

export function useSubscription() {
  const context = useContext(SubscriptionContext)
  if (!context) {
    throw new Error('useSubscription must be used within a SubscriptionProvider')
  }
  return context
}

export function useSubscriptionProvider(): SubscriptionContextType {
  const { user } = useAuth()
  const [subscription, setSubscription] = useState<UserSubscription | null>(null)
  const [usage, setUsage] = useState<UsageStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (user) {
      loadSubscriptionData()
    } else {
      // Reset state when user logs out
      setSubscription(null)
      setUsage(null)
      setLoading(false)
    }
  }, [user])

  const loadSubscriptionData = async () => {
    try {
      setLoading(true)
      setError(null)

      // Determine plan based on user email for demo
      let planType: 'free' | 'premium' | 'pro' = 'free'
      let translationsUsed = 2

      if (user?.email === 'pro@test.com') {
        planType = 'pro'
        translationsUsed = 47 // Show some usage for pro user
      } else if (user?.email === 'premium@test.com') {
        planType = 'premium'
        translationsUsed = 23 // Show some usage for premium user
      } else if (user?.email === 'free@test.com') {
        planType = 'free'
        translationsUsed = 2 // Close to limit for free user
      }

      // Mock subscription data for demo
      const mockSubscription: UserSubscription = {
        id: 'sub_demo_' + user?.uid,
        userId: user?.uid || '',
        plan: planType,
        status: 'active',
        currentPeriodStart: new Date(),
        currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
        cancelAtPeriodEnd: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      }

      const mockUsage: UsageStats = {
        userId: user?.uid || '',
        month: new Date().toISOString().slice(0, 7), // YYYY-MM
        translationsUsed: translationsUsed,
        storageUsed: planType === 'pro' ? 1024 * 1024 * 15 : planType === 'premium' ? 1024 * 1024 * 3 : 1024 * 512, // 15MB/3MB/512KB
        apiCallsUsed: planType === 'pro' ? 156 : 0,
        lastUpdated: new Date(),
      }

      setSubscription(mockSubscription)
      setUsage(mockUsage)

      // In production, you would fetch real data:
      /*
      const [subscriptionData, usageData] = await Promise.all([
        fetch('/api/subscription').then(res => res.json()),
        fetch('/api/usage').then(res => res.json())
      ])
      
      setSubscription(subscriptionData)
      setUsage(usageData)
      */

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load subscription data')
    } finally {
      setLoading(false)
    }
  }

  const createCheckoutSession = async (priceId: string): Promise<{ url: string }> => {
    try {
      const response = await fetch('/api/stripe/checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          priceId,
          successUrl: `${window.location.origin}/dashboard?success=true`,
          cancelUrl: `${window.location.origin}/pricing?canceled=true`,
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to create checkout session')
      }

      const { url } = await response.json()
      return { url }
    } catch (err) {
      throw new Error(err instanceof Error ? err.message : 'Checkout failed')
    }
  }

  const createPortalSession = async (): Promise<{ url: string }> => {
    try {
      const response = await fetch('/api/stripe/portal', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          returnUrl: `${window.location.origin}/dashboard`,
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to create portal session')
      }

      const { url } = await response.json()
      return { url }
    } catch (err) {
      throw new Error(err instanceof Error ? err.message : 'Portal access failed')
    }
  }

  const cancelSubscription = async (): Promise<void> => {
    // Mock cancellation for demo
    if (subscription) {
      setSubscription({
        ...subscription,
        cancelAtPeriodEnd: true,
        updatedAt: new Date(),
      })
    }
  }

  const resumeSubscription = async (): Promise<void> => {
    // Mock resumption for demo
    if (subscription) {
      setSubscription({
        ...subscription,
        cancelAtPeriodEnd: false,
        updatedAt: new Date(),
      })
    }
  }

  const updatePaymentMethod = async (paymentMethodId: string): Promise<void> => {
    // Mock payment method update
    console.log('Payment method updated:', paymentMethodId)
  }

  const refreshSubscription = async (): Promise<void> => {
    await loadSubscriptionData()
  }

  const incrementUsage = async (type: 'translation' | 'api_call', amount: number = 1): Promise<void> => {
    if (!usage) return

    const updatedUsage = { ...usage }
    
    if (type === 'translation') {
      updatedUsage.translationsUsed += amount
    } else if (type === 'api_call') {
      updatedUsage.apiCallsUsed += amount
    }
    
    updatedUsage.lastUpdated = new Date()
    setUsage(updatedUsage)

    // In production, you would update the backend:
    /*
    await fetch('/api/usage', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ type, amount })
    })
    */
  }

  const canPerformAction = (action: string): { allowed: boolean; reason?: string } => {
    if (!subscription || !usage) {
      return { allowed: false, reason: 'Subscription data not loaded' }
    }

    return checkPlanAction(
      subscription.plan,
      action as any,
      { translationsThisMonth: usage.translationsUsed }
    )
  }

  return {
    subscription,
    usage,
    loading,
    error,
    createCheckoutSession,
    createPortalSession,
    cancelSubscription,
    resumeSubscription,
    updatePaymentMethod,
    refreshSubscription,
    incrementUsage,
    canPerformAction,
  }
}

export { SubscriptionContext }
