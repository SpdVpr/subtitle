'use client'

import React, { createContext, useContext, useState, useEffect } from 'react'
import { useAuth } from '@/hooks/useAuth'

interface CreditsContextType {
  credits: number | null
  loading: boolean
  refreshCredits: () => Promise<void>
}

const CreditsContext = createContext<CreditsContextType | undefined>(undefined)

export function CreditsProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth()
  const [credits, setCredits] = useState<number | null>(null)
  const [loading, setLoading] = useState(true)

  const fetchCredits = async () => {
    if (!user) {
      setCredits(null)
      setLoading(false)
      return
    }

    try {
      const response = await fetch(`/api/user/credits?userId=${user.uid}`)
      if (response.ok) {
        const data = await response.json()
        setCredits(data.credits || 0)
      } else {
        console.error('Failed to fetch credits:', response.status)
        setCredits(0)
      }
    } catch (error) {
      console.error('Failed to fetch credits:', error)
      setCredits(0)
    } finally {
      setLoading(false)
    }
  }

  const refreshCredits = async () => {
    setLoading(true)
    await fetchCredits()
  }

  // Load credits when user changes
  useEffect(() => {
    fetchCredits()
  }, [user])

  // Listen for global credit refresh events
  useEffect(() => {
    const handleRefreshCredits = () => {
      console.log('🔄 Global credits refresh triggered')
      refreshCredits()
    }

    // Listen for custom events
    window.addEventListener('refreshCredits', handleRefreshCredits)
    
    return () => {
      window.removeEventListener('refreshCredits', handleRefreshCredits)
    }
  }, [])

  return (
    <CreditsContext.Provider value={{ credits, loading, refreshCredits }}>
      {children}
    </CreditsContext.Provider>
  )
}

export function useCredits() {
  const context = useContext(CreditsContext)
  if (context === undefined) {
    throw new Error('useCredits must be used within a CreditsProvider')
  }
  return context
}

// Global function to trigger credit refresh
export function triggerCreditsRefresh() {
  console.log('🔄 Triggering global credits refresh')
  window.dispatchEvent(new CustomEvent('refreshCredits'))
}
