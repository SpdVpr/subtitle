import Link from 'next/link'
import { ChevronRight, Home } from 'lucide-react'
import Script from 'next/script'

interface BreadcrumbItem {
  label: string
  href: string
  current?: boolean
}

interface BreadcrumbsProps {
  items: BreadcrumbItem[]
  locale?: 'en' | 'cs'
}

export function Breadcrumbs({ items, locale = 'en' }: BreadcrumbsProps) {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://subtitle-ai.vercel.app'
  const isCs = locale === 'cs'
  const homeLabel = isCs ? 'Domů' : 'Home'
  const homeHref = isCs ? '/cs' : '/'

  // Add home as first item if not already present
  const allItems = [
    { label: homeLabel, href: homeHref },
    ...items
  ]

  // Generate structured data for breadcrumbs
  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": allItems.map((item, index) => ({
      "@type": "ListItem",
      "position": index + 1,
      "name": item.label,
      "item": `${baseUrl}${item.href}`
    }))
  }

  return (
    <>
      <Script
        id="breadcrumb-schema"
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(breadcrumbSchema)
        }}
      />
      
      <nav aria-label={isCs ? "Navigační cesta" : "Breadcrumb navigation"} className="mb-6">
        <ol className="flex items-center space-x-2 text-sm text-muted-foreground">
          {allItems.map((item, index) => (
            <li key={item.href} className="flex items-center">
              {index > 0 && (
                <ChevronRight className="h-4 w-4 mx-2 text-muted-foreground/50" />
              )}
              
              {index === 0 && (
                <Home className="h-4 w-4 mr-2" />
              )}
              
              {item.current || index === allItems.length - 1 ? (
                <span className="font-medium text-foreground" aria-current="page">
                  {item.label}
                </span>
              ) : (
                <Link 
                  href={item.href}
                  className="hover:text-foreground transition-colors"
                >
                  {item.label}
                </Link>
              )}
            </li>
          ))}
        </ol>
      </nav>
    </>
  )
}

// Predefined breadcrumb configurations
export const breadcrumbConfigs = {
  en: {
    translate: [
      { label: 'Translate Subtitles', href: '/translate', current: true }
    ],
    'subtitles-search': [
      { label: 'Search Subtitles', href: '/subtitles-search', current: true }
    ],
    'subtitle-editor': [
      { label: 'Subtitle Editor', href: '/subtitle-editor', current: true }
    ],
    'video-tools': [
      { label: 'Video Tools', href: '/video-tools', current: true }
    ],
    pricing: [
      { label: 'Pricing', href: '/pricing', current: true }
    ],
    about: [
      { label: 'About', href: '/about', current: true }
    ],
    contact: [
      { label: 'Contact', href: '/contact', current: true }
    ],
    dashboard: [
      { label: 'Dashboard', href: '/dashboard', current: true }
    ]
  },
  cs: {
    translate: [
      { label: 'Překlad Titulků', href: '/cs/translate', current: true }
    ],
    'subtitles-search': [
      { label: 'Hledat Titulky', href: '/cs/subtitles-search', current: true }
    ],
    'subtitle-editor': [
      { label: 'Editor Titulků', href: '/cs/subtitle-editor', current: true }
    ],
    'video-tools': [
      { label: 'Video Nástroje', href: '/cs/video-tools', current: true }
    ],
    pricing: [
      { label: 'Ceník', href: '/cs/pricing', current: true }
    ],
    about: [
      { label: 'O Nás', href: '/cs/about', current: true }
    ],
    contact: [
      { label: 'Kontakt', href: '/cs/contact', current: true }
    ],
    dashboard: [
      { label: 'Nástěnka', href: '/cs/dashboard', current: true }
    ]
  }
}
