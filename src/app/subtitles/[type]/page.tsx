import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { CatalogHub } from '@/components/catalog/catalog-hub'
import { LanguageCatalogPage } from '@/components/catalog/language-catalog-page'
import { catalogLanguages, catalogSeeds, fetchCatalogResult } from '@/lib/subtitle-catalog'

const fixed = ['movies', 'tv', 'popular', 'latest']
export const revalidate = 21_600
export const dynamicParams = true
export function generateStaticParams() { return fixed.map((type) => ({ type })) }

export async function generateMetadata({ params }: { params: Promise<{ type: string }> }): Promise<Metadata> {
  const { type: category } = await params
  const language = catalogLanguages.find((item) => item.slug === category)
  if (language) {
    const samples = await Promise.all([...catalogSeeds].sort((a, b) => b.popularity - a.popularity).slice(0, 12).map(fetchCatalogResult))
    const available = samples.filter((result) => result.languageCounts[language.code] > 0).length
    return { title: `${language.name} Subtitles for Movies and TV Shows`, description: `Browse verified ${language.name} subtitle availability for popular movies and TV shows, compare releases, and open results at the source.`, robots: { index: available >= 3, follow: true }, alternates: { canonical: `/subtitles/${category}`, languages: { en: `/subtitles/${category}`, cs: `/cs/subtitles/${category}`, 'x-default': `/subtitles/${category}` } }, openGraph: { title: `${language.name} Subtitles | SubtitleBot`, description: `Browse current ${language.name} subtitle availability.`, url: `/subtitles/${category}`, images: ['/og-image-en.png'] } }
  }
  const metadata: Record<string, [string, string]> = {
    movies: ['Movie Subtitles: Browse Popular Films', 'Browse a controlled catalog of movie subtitle pages with current language and release samples from OpenSubtitles.'],
    tv: ['TV Series Subtitles: Browse Popular Shows', 'Browse TV subtitle pages and compare current episode release and language samples from OpenSubtitles.'],
    popular: ['Popular Movie and TV Subtitles', 'Browse popular movies and TV shows with dedicated subtitle availability pages.'],
    latest: ['Latest Titles in the Subtitle Catalog', 'Browse recently released movies and TV shows in the verified SubtitleBot starter catalog.'],
  }
  if (!metadata[category]) return {}
  return { title: metadata[category][0], description: metadata[category][1], alternates: { canonical: `/subtitles/${category}`, languages: { en: `/subtitles/${category}`, cs: `/cs/subtitles/${category}`, 'x-default': `/subtitles/${category}` } }, openGraph: { title: metadata[category][0], description: metadata[category][1], url: `/subtitles/${category}`, images: ['/og-image-en.png'] } }
}

export default async function SubtitleCategoryPage({ params }: { params: Promise<{ type: string }> }) {
  const { type: category } = await params
  if (catalogLanguages.some((item) => item.slug === category)) return <LanguageCatalogPage slug={category} locale="en" />
  if (category === 'movies') return <CatalogHub locale="en" type="movie" />
  if (category === 'tv') return <CatalogHub locale="en" type="tv" />
  if (category === 'popular' || category === 'latest') return <CatalogHub locale="en" view={category} />
  notFound()
}
