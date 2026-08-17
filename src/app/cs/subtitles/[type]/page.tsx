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
    return { title: `Titulky v ${language.csName} pro filmy a seriály`, description: `Procházejte ověřenou dostupnost titulků v ${language.csName}, porovnejte release a otevřete výsledek u zdroje.`, robots: { index: available >= 3, follow: true }, alternates: { canonical: `/cs/subtitles/${category}`, languages: { en: `/subtitles/${category}`, cs: `/cs/subtitles/${category}`, 'x-default': `/subtitles/${category}` } }, openGraph: { title: `${language.name} titulky | SubtitleBot`, description: `Aktuální dostupnost titulků v ${language.csName}.`, url: `/cs/subtitles/${category}`, images: ['/og-image-cs.png'] } }
  }
  const metadata: Record<string, [string, string]> = {
    movies: ['Filmové titulky: katalog populárních filmů', 'Procházejte filmové subtitle stránky s aktuálním vzorkem jazyků a release z OpenSubtitles.'],
    tv: ['Seriálové titulky: katalog populárních seriálů', 'Procházejte seriálové subtitle stránky a porovnejte vzorek epizod, release a jazyků.'],
    popular: ['Populární filmové a seriálové titulky', 'Procházejte populární filmy a seriály s vlastní stránkou dostupnosti titulků.'],
    latest: ['Nejnovější tituly v katalogu titulků', 'Procházejte novější filmy a seriály v ověřovaném výchozím katalogu SubtitleBot.'],
  }
  if (!metadata[category]) return {}
  return { title: metadata[category][0], description: metadata[category][1], alternates: { canonical: `/cs/subtitles/${category}`, languages: { en: `/subtitles/${category}`, cs: `/cs/subtitles/${category}`, 'x-default': `/subtitles/${category}` } }, openGraph: { title: metadata[category][0], description: metadata[category][1], url: `/cs/subtitles/${category}`, images: ['/og-image-cs.png'] } }
}

export default async function CzechSubtitleCategoryPage({ params }: { params: Promise<{ type: string }> }) {
  const { type: category } = await params
  if (catalogLanguages.some((item) => item.slug === category)) return <LanguageCatalogPage slug={category} locale="cs" />
  if (category === 'movies') return <CatalogHub locale="cs" type="movie" />
  if (category === 'tv') return <CatalogHub locale="cs" type="tv" />
  if (category === 'popular' || category === 'latest') return <CatalogHub locale="cs" view={category} />
  notFound()
}
