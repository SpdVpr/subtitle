'use client'

import { ReactNode } from 'react'
import { BatchContext, useBatchProvider } from '@/hooks/useBatch'

interface BatchProviderProps {
  children: ReactNode
}

export function BatchProvider({ children }: BatchProviderProps) {
  const batch = useBatchProvider()

  return (
    <BatchContext.Provider value={batch}>
      {children}
    </BatchContext.Provider>
  )
}
