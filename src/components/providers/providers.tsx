"use client"

import { AuthProvider } from "./auth-provider"
import { SubscriptionProvider } from "./subscription-provider"
import { BatchProvider } from "./batch-provider"

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <SubscriptionProvider>
        <BatchProvider>
          {children}
        </BatchProvider>
      </SubscriptionProvider>
    </AuthProvider>
  )
}

