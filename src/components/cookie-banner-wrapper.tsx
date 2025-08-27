'use client'

import { usePathname } from 'next/navigation'
import { CookieBannerCZ } from './cookie-banner'
import { CookieBannerEN } from './cookie-banner-en'

export function CookieBannerWrapper() {
  const pathname = usePathname()
  
  // Determine if we're on Czech pages
  const isCzechPage = pathname.startsWith('/cs')
  
  // Show Czech banner for /cs/* pages, English for everything else
  return isCzechPage ? <CookieBannerCZ /> : <CookieBannerEN />
}
