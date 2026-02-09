'use client'

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

  return (
    <div className="relative flex min-h-screen flex-col bg-background">
      <Header />
      <main className="flex-1 bg-background">{children}</main>
      <Footer locale={locale} />
      <FloatingFeedbackButton />
    </div>
  )
}
