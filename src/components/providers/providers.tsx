"use client"

import { AuthProvider } from "./auth-provider"
import { SubscriptionProvider } from "./subscription-provider"
import { BatchProvider } from "./batch-provider"
import { ThemeProvider } from "@/contexts/theme-context"
import { CreditsProvider } from "@/contexts/credits-context"

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider>
      <AuthProvider>
        <CreditsProvider>
          <SubscriptionProvider>
            <BatchProvider>
              {children}
            </BatchProvider>
          </SubscriptionProvider>
        </CreditsProvider>
      </AuthProvider>
    </ThemeProvider>
  )
}

