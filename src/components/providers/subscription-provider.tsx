'use client'

import { ReactNode } from 'react'
import { SubscriptionContext, useSubscriptionProvider } from '@/hooks/useSubscription'

interface SubscriptionProviderProps {
  children: ReactNode
}

export function SubscriptionProvider({ children }: SubscriptionProviderProps) {
  const subscription = useSubscriptionProvider()

  return (
    <SubscriptionContext.Provider value={subscription}>
      {children}
    </SubscriptionContext.Provider>
  )
}
