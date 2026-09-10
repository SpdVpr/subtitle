import type { Metadata } from 'next'

/**
 * Shared metadata helpers so every public page declares its own canonical URL,
 * EN/CS hreflang pair and social card. Without this, pages without metadata
 * inherited the root layout canonical (the homepage) and were deduplicated
 * into it by search engines.
 */
export type SiteLocale = 'en' | 'cs'

export const SITE_URL = (process.env.NEXT_PUBLIC_APP_URL || 'https://www.subtitlebot.com').replace(/\/$/, '')
export const SITE_NAME = 'SubtitleBot'

/** `path` is the English path without locale prefix ('' for the homepage). */
export function localizedAlternates(path: string, locale: SiteLocale): NonNullable<Metadata['alternates']> {
  const en = path || '/'
  const cs = `/cs${path}`
  return {
    canonical: locale === 'cs' ? cs : en,
    languages: { en, cs, 'x-default': en },
  }
}

interface PageMetadataInput {
  locale: SiteLocale
  /** English path without locale prefix, e.g. '/pricing' ('' for home). */
  path: string
  title: string
  description: string
  /** Use the title as-is instead of appending "| SubtitleBot". */
  absoluteTitle?: boolean
  keywords?: string[]
  ogTitle?: string
  ogDescription?: string
  noindex?: boolean
}

export function pageMetadata({
  locale,
  path,
  title,
  description,
  absoluteTitle,
  keywords,
  ogTitle,
  ogDescription,
  noindex,
}: PageMetadataInput): Metadata {
  const isCs = locale === 'cs'
  const url = isCs ? `/cs${path}` : path || '/'
  const image = isCs ? '/og-image-cs.png' : '/og-image-en.png'
  const socialTitle = ogTitle ?? (absoluteTitle ? title : `${title} | ${SITE_NAME}`)
  const socialDescription = ogDescription ?? description

  return {
    title: absoluteTitle ? { absolute: title } : title,
    description,
    ...(keywords ? { keywords } : {}),
    alternates: localizedAlternates(path, locale),
    openGraph: {
      title: socialTitle,
      description: socialDescription,
      url,
      siteName: SITE_NAME,
      locale: isCs ? 'cs_CZ' : 'en_US',
      type: 'website',
      images: [{ url: image, width: 1200, height: 630, alt: socialTitle }],
    },
    twitter: {
      card: 'summary_large_image',
      title: socialTitle,
      description: socialDescription,
      images: [image],
    },
    ...(noindex ? { robots: { index: false, follow: false } } : {}),
  }
}
