'use client'

import { useEffect } from 'react'
import { TranslationInterface } from '@/components/translation/translation-interface'

export default function TranslatePage() {
  // Force clear any potential navigation blockers
  useEffect(() => {
    // Remove any potential beforeunload listeners that might be blocking navigation
    const clearNavigationBlockers = () => {
      // Clear all beforeunload listeners
      window.onbeforeunload = null

      // Force override any extension interference
      if (window.addEventListener) {
        const originalAddEventListener = window.addEventListener
        window.addEventListener = function(type, listener, options) {
          if (type === 'beforeunload' || type === 'unload') {
            console.log('Blocked beforeunload/unload listener from being added')
            return
          }
          return originalAddEventListener.call(this, type, listener, options)
        }
      }

      console.log('Navigation blockers cleared on translate page')
    }

    clearNavigationBlockers()

    // Also clear on component unmount
    return () => {
      console.log('Translate page unmounting - clearing blockers')
      window.onbeforeunload = null
    }
  }, [])
  return (
    <div className="py-8">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-4xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">AI Subtitle Translation</h1>
          <p className="text-gray-600">
            Upload your SRT subtitle file and translate it to any language using AI
          </p>
        </div>

        <TranslationInterface />
      </div>
    </div>
  )
}

export const metadata = {
  title: 'Translate Subtitles - SubtitleAI',
  description: 'Translate your subtitle files using AI-powered translation services',
}
