import Link from 'next/link'
import { ArrowRight, Film, Tv, Languages } from 'lucide-react'
import { CatalogCard } from './catalog-card'
import { catalogLanguages, catalogSeeds, getCatalogByType, type CatalogMediaType } from '@/lib/subtitle-catalog'

export function CatalogHub({ locale = 'en', type, view }: { locale?: 'en' | 'cs'; type?: CatalogMediaType; view?: 'popular' | 'latest' }) {
  const isCs = locale === 'cs'
  const prefix = isCs ? '/cs' : ''
  let items = type ? getCatalogByType(type) : [...catalogSeeds]
  if (view === 'latest') items.sort((a, b) => b.year - a.year || b.popularity - a.popularity)
  else items.sort((a, b) => b.popularity - a.popularity)
  const heading = view === 'latest' ? (isCs ? 'Nejnovější tituly v subtitle katalogu' : 'Latest titles in the subtitle catalog') : view === 'popular' ? (isCs ? 'Populární filmové a seriálové titulky' : 'Popular movie and TV subtitles') : type === 'movie' ? (isCs ? 'Filmové titulky' : 'Movie subtitles') : (isCs ? 'Seriálové titulky' : 'TV series subtitles')
  const baseUrl = (process.env.NEXT_PUBLIC_APP_URL || 'https://www.subtitlebot.com').replace(/\/$/, '')
  const path = view ? `/subtitles/${view}` : `/subtitles/${type === 'movie' ? 'movies' : 'tv'}`
  const pageUrl = `${baseUrl}${prefix}${path}`
  const schema = { '@context': 'https://schema.org', '@type': 'ItemList', name: heading, url: pageUrl, numberOfItems: items.length, itemListElement: items.map((media, index) => ({ '@type': 'ListItem', position: index + 1, name: media.title, url: `${baseUrl}${prefix}/subtitles/${media.type}/${media.slug}` })) }
  return (
    <main className="py-12 sm:py-16"><script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema).replace(/</g, '\\u003c') }} /><div className="container mx-auto px-4 max-w-6xl">
      <header className="max-w-3xl mb-10"><div className="inline-flex items-center gap-2 text-primary font-semibold mb-4">{type === 'tv' ? <Tv className="h-5 w-5" /> : <Film className="h-5 w-5" />}{isCs ? 'Ověřovaný výchozí katalog' : 'Verified starter catalog'}</div><h1 className="text-4xl sm:text-5xl font-bold tracking-tight mb-5">{heading}</h1><p className="text-lg text-muted-foreground leading-relaxed">{isCs ? 'Otevřete konkrétní titul a porovnejte aktuální vzorek jazyků a release variant z OpenSubtitles. Katalog začíná omezenou sadou kvalitních URL a bude se rozšiřovat podle skutečné poptávky.' : 'Open a title to compare a current sample of languages and release variants from OpenSubtitles. The catalog starts with a controlled set of useful URLs and expands according to real demand.'}</p></header>
      <nav className="flex flex-wrap gap-3 mb-10"><Link href={`${prefix}/subtitles/movies`} className="rounded-full border px-4 py-2 font-semibold hover:border-primary">{isCs ? 'Filmy' : 'Movies'}</Link><Link href={`${prefix}/subtitles/tv`} className="rounded-full border px-4 py-2 font-semibold hover:border-primary">{isCs ? 'Seriály' : 'TV series'}</Link><Link href={`${prefix}/subtitles/popular`} className="rounded-full border px-4 py-2 font-semibold hover:border-primary">{isCs ? 'Populární' : 'Popular'}</Link><Link href={`${prefix}/subtitles/latest`} className="rounded-full border px-4 py-2 font-semibold hover:border-primary">{isCs ? 'Nejnovější' : 'Latest'}</Link></nav>
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">{items.map((media) => <CatalogCard key={`${media.type}-${media.slug}`} media={media} locale={locale} />)}</div>
      <section className="mt-14 rounded-2xl border p-7"><Languages className="h-6 w-6 text-primary mb-4" /><h2 className="text-2xl font-bold mb-4">{isCs ? 'Procházet podle jazyka' : 'Browse by subtitle language'}</h2><div className="flex flex-wrap gap-3">{catalogLanguages.map((language) => <Link key={language.code} href={`${prefix}/subtitles/${language.slug}`} className="inline-flex items-center gap-2 text-primary font-semibold hover:underline">{language.name}<ArrowRight className="h-3.5 w-3.5" /></Link>)}</div></section>
      <section className="mt-8 rounded-2xl bg-primary/5 border border-primary/15 p-7"><h2 className="text-xl font-bold mb-2">{isCs ? 'Potřebujete jiný titul?' : 'Need another title?'}</h2><p className="text-muted-foreground mb-4">{isCs ? 'Živý finder prohledá širší databázi podle názvu, roku, typu a jazyka.' : 'The live finder searches the broader database by title, year, type, and language.'}</p><Link href={`${prefix}/subtitles-search`} className="font-semibold text-primary hover:underline">{isCs ? 'Otevřít vyhledávač titulků →' : 'Open subtitle finder →'}</Link></section>
    </div></main>
  )
}
