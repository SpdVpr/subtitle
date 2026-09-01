import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { CatalogMediaPage } from '@/components/catalog/catalog-media-page'
import { fetchCatalogResult, getCatalogSeed, type CatalogMediaType } from '@/lib/subtitle-catalog'

export const revalidate = 21_600
export const dynamicParams = true
export function generateStaticParams() { return [] }

export async function generateMetadata({ params }: { params: Promise<{ type: string; slug: string }> }): Promise<Metadata> {
  const { type, slug } = await params
  if (type !== 'movie' && type !== 'tv') return {}
  const media = getCatalogSeed(type, slug)
  if (!media) return {}
  const result = await fetchCatalogResult(media)
  const title = `${media.title} (${media.year}) Subtitles`
  const description = `Download ${media.title} (${media.year}) subtitles from OpenSubtitles in 30+ languages, or translate the English file into your language in minutes. First file free.`
  return { title, description, robots: { index: result.fetched && result.subtitles.length >= 2, follow: true }, alternates: { canonical: `/subtitles/${type}/${slug}`, languages: { en: `/subtitles/${type}/${slug}`, cs: `/cs/subtitles/${type}/${slug}`, 'x-default': `/subtitles/${type}/${slug}` } }, openGraph: { title: `${title} | SubtitleBot`, description, url: `/subtitles/${type}/${slug}`, images: ['/og-image-en.png'] } }
}

export default async function CatalogDetailRoute({ params }: { params: Promise<{ type: string; slug: string }> }) {
  const { type, slug } = await params
  if (type !== 'movie' && type !== 'tv') notFound()
  const media = getCatalogSeed(type as CatalogMediaType, slug)
  if (!media) notFound()
  return <CatalogMediaPage result={await fetchCatalogResult(media)} locale="en" />
}
