import Head from 'next/head'
import { HreflangTags } from './hreflang-tags'

interface SEOHeadProps {
  title: string
  description: string
  keywords?: string[]
  currentPath: string
  locale?: 'en' | 'cs'
  ogImage?: string
  noIndex?: boolean
  canonical?: string
}

export function SEOHead({
  title,
  description,
  keywords = [],
  currentPath,
  locale = 'en',
  ogImage,
  noIndex = false,
  canonical
}: SEOHeadProps) {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://subtitle-ai.vercel.app'
  const fullUrl = `${baseUrl}${currentPath}`
  const defaultOgImage = locale === 'cs' ? '/og-image-cs.png' : '/og-image-en.png'
  const imageUrl = ogImage || defaultOgImage

  return (
    <Head>
      {/* Basic Meta Tags */}
      <title>{title}</title>
      <meta name="description" content={description} />
      {keywords.length > 0 && <meta name="keywords" content={keywords.join(', ')} />}
      
      {/* Robots */}
      <meta name="robots" content={noIndex ? 'noindex,nofollow' : 'index,follow'} />
      <meta name="googlebot" content={noIndex ? 'noindex,nofollow' : 'index,follow,max-snippet:-1,max-image-preview:large,max-video-preview:-1'} />
      
      {/* Canonical URL */}
      <link rel="canonical" href={canonical || fullUrl} />
      
      {/* Hreflang Tags */}
      <HreflangTags currentPath={currentPath} />
      
      {/* Open Graph */}
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:url" content={fullUrl} />
      <meta property="og:type" content="website" />
      <meta property="og:image" content={`${baseUrl}${imageUrl}`} />
      <meta property="og:image:width" content="1200" />
      <meta property="og:image:height" content="630" />
      <meta property="og:image:alt" content={title} />
      <meta property="og:site_name" content="SubtitleBot" />
      <meta property="og:locale" content={locale === 'cs' ? 'cs_CZ' : 'en_US'} />
      
      {/* Twitter Card */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={`${baseUrl}${imageUrl}`} />
      <meta name="twitter:creator" content="@SubtitleBot" />
      <meta name="twitter:site" content="@SubtitleBot" />
      
      {/* Additional Meta Tags */}
      <meta name="author" content="SubtitleBot Team" />
      <meta name="creator" content="SubtitleBot" />
      <meta name="publisher" content="SubtitleBot" />
      <meta name="format-detection" content="telephone=no,email=no,address=no" />
      
      {/* Language */}
      <meta httpEquiv="content-language" content={locale === 'cs' ? 'cs-CZ' : 'en-US'} />
      
      {/* Viewport and Mobile */}
      <meta name="viewport" content="width=device-width, initial-scale=1, shrink-to-fit=no" />
      <meta name="mobile-web-app-capable" content="yes" />
      <meta name="apple-mobile-web-app-capable" content="yes" />
      <meta name="apple-mobile-web-app-status-bar-style" content="default" />
      
      {/* Theme Color */}
      <meta name="theme-color" content="#3b82f6" />
      <meta name="msapplication-TileColor" content="#3b82f6" />
      
      {/* Preconnect to external domains */}
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      <link rel="dns-prefetch" href="https://api.openai.com" />
      <link rel="dns-prefetch" href="https://www.googletagmanager.com" />
    </Head>
  )
}
