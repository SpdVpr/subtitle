'use client'

import { useRouter } from 'next/navigation'

export function TranslationInterface() {
  const router = useRouter()
  console.log('TranslationInterface rendering - TESTING WITH useRouter')
  
  return (
    <div className="p-8 border-2 border-blue-500 rounded-lg">
      <h2 className="text-xl font-bold mb-4">Minimal TranslationInterface</h2>
      <p className="text-gray-600 mb-4">
        Testing navigation with absolutely minimal component
      </p>
      <p className="text-sm text-gray-500">
        If navigation works now, the problem is in the component logic/state/imports
      </p>
    </div>
  )
}
