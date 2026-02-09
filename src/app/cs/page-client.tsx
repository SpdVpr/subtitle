'use client'

import { useAuth } from "@/hooks/useAuth";

interface CzechHomeClientProps {
  children: React.ReactNode
}

export function CzechHomeClient({ children }: CzechHomeClientProps) {
  const { loading } = useAuth()

  // Show loading state while checking auth
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Načítání...</p>
        </div>
      </div>
    )
  }

  return <>{children}</>
}

