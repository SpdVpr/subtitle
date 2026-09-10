'use client'

import { useEffect } from 'react'
import { usePathname } from 'next/navigation'
import { Header } from './header'
import { Footer } from './footer'
import { FloatingFeedbackButton } from '@/components/ui/floating-feedback-button'

interface LocaleAwareLayoutProps {
  children: React.ReactNode
}

export function LocaleAwareLayout({ children }: LocaleAwareLayoutProps) {
  const pathname = usePathname()
  
  // Detect if we're on Czech pages
  const isCzech = pathname.startsWith('/cs')
  const locale = isCzech ? 'cs' : 'en'

  // The root layout is shared by both languages, so keep <html lang> in sync
  // with the route for assistive tech and language-aware browser features.
  useEffect(() => {
    document.documentElement.lang = locale
  }, [locale])

  return (
    <div className="relative flex min-h-screen flex-col bg-background">
      <Header />
      <main className="flex-1 bg-background">{children}</main>
      <Footer locale={locale} />
      <FloatingFeedbackButton />
    </div>
  )
}
