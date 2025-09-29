'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { MessageSquare, X, Heart } from 'lucide-react'

export function FloatingFeedbackButton() {
  const [isVisible, setIsVisible] = useState(true)
  const pathname = usePathname()
  
  // Don't show on feedback pages or admin pages
  if (pathname.includes('/feedback') || pathname.includes('/admin')) {
    return null
  }

  // Don't show if user dismissed it
  if (!isVisible) {
    return null
  }

  const isCzech = pathname.startsWith('/cs')
  const feedbackUrl = isCzech ? '/cs/feedback' : '/feedback'
  const buttonText = isCzech ? 'Zpětná vazba' : 'Feedback'

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-2">
      {/* Dismiss button */}
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setIsVisible(false)}
        className="h-6 w-6 p-0 bg-white/80 hover:bg-white/90 dark:bg-gray-800/80 dark:hover:bg-gray-800/90 shadow-sm"
      >
        <X className="h-3 w-3" />
      </Button>
      
      {/* Main feedback button */}
      <Button
        asChild
        className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg hover:shadow-xl transition-all duration-300 rounded-full px-4 py-2 group"
      >
        <Link href={feedbackUrl} className="flex items-center gap-2">
          <div className="relative">
            <MessageSquare className="h-5 w-5" />
            <div className="absolute -top-1 -right-1 bg-red-500 w-3 h-3 rounded-full flex items-center justify-center animate-pulse">
              <Heart className="h-1.5 w-1.5 text-white" />
            </div>
          </div>
          <span className="font-medium">{buttonText}</span>
        </Link>
      </Button>
      
      {/* Tooltip */}
      <div className="absolute bottom-full right-0 mb-2 px-3 py-1 bg-gray-900 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap pointer-events-none">
        {isCzech ? 'Pomozte nám se zlepšovat!' : 'Help us improve!'}
        <div className="absolute top-full right-4 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900"></div>
      </div>
    </div>
  )
}
