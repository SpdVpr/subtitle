"use client"

import { AuthProvider } from "./auth-provider"
import { ThemeProvider } from "@/contexts/theme-context"

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider>
      <AuthProvider>
        {children}
      </AuthProvider>
    </ThemeProvider>
  )
}
