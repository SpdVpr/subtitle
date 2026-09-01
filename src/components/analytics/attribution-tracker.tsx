'use client'

import { useEffect } from 'react'

const UTM_KEYS = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_content', 'utm_term'] as const

export function AttributionTracker() {
  useEffect(() => {
    try {
      if (localStorage.getItem('subtitlebot_attribution')) return
      const params = new URLSearchParams(window.location.search)
      const attribution: Record<string, string> = {
        landing_page: `${window.location.pathname}${window.location.search}`,
        referrer: document.referrer || 'direct',
        captured_at: new Date().toISOString(),
      }
      for (const key of UTM_KEYS) {
        const value = params.get(key)
        if (value) attribution[key] = value.slice(0, 150)
      }
      localStorage.setItem('subtitlebot_attribution', JSON.stringify(attribution))
    } catch {
      // Attribution must never interfere with the product.
    }
  }, [])

  return null
}

export function getStoredAttribution(): Record<string, string> {
  if (typeof window === 'undefined') return {}
  try {
    return JSON.parse(localStorage.getItem('subtitlebot_attribution') || '{}')
  } catch {
    return {}
  }
}
