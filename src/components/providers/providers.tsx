"use client"

import { AuthProvider } from "./auth-provider"
import { SubscriptionProvider } from "./subscription-provider"
import { BatchProvider } from "./batch-provider"
import { ThemeProvider } from "@/contexts/theme-context"

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider>
      <AuthProvider>
        <SubscriptionProvider>
          <BatchProvider>
            {children}
          </BatchProvider>
        </SubscriptionProvider>
      </AuthProvider>
    </ThemeProvider>
  )
}

