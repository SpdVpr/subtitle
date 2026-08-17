'use client'

import { useEffect } from 'react'
import { usePathname, useSearchParams } from 'next/navigation'
import { initGA, trackPageView } from '@/lib/analytics'

function analyticsAllowed() {
  try {
    const saved = localStorage.getItem('cookie-consent')
    return saved ? Boolean(JSON.parse(saved).analytics) : false
  } catch {
    return false
  }
}

export function GoogleAnalytics() {
  const pathname = usePathname()
  const searchParams = useSearchParams()

  useEffect(() => {
    const enableWhenAllowed = () => {
      if (analyticsAllowed()) initGA()
    }

    enableWhenAllowed()
    window.addEventListener('cookie-consent-changed', enableWhenAllowed)
    return () => window.removeEventListener('cookie-consent-changed', enableWhenAllowed)
  }, [])

  useEffect(() => {
    if (!pathname || !analyticsAllowed()) return
    const query = searchParams?.toString()
    trackPageView(pathname + (query ? `?${query}` : ''))
  }, [pathname, searchParams])

  return null
}
