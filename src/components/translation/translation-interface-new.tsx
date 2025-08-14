'use client'

import { useRouter } from 'next/navigation'
import { useAuth } from '@/hooks/useAuth'

export function TranslationInterface() {
  const router = useRouter()
  const { user } = useAuth()
  console.log('TranslationInterface rendering - TESTING WITH useRouter + useAuth')
  
  return (
    <div className="p-8 border-2 border-blue-500 rounded-lg">
      <h2 className="text-xl font-bold mb-4">Testing with useRouter + useAuth</h2>
      <p className="text-gray-600 mb-4">
        User: {user ? user.email : 'Not logged in'}
      </p>
      <p className="text-sm text-gray-500">
        If navigation still works, useAuth is not the problem
      </p>
    </div>
  )
}
