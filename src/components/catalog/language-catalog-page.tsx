import Link from 'next/link'
import { notFound } from 'next/navigation'
import { CatalogCard } from './catalog-card'
import { catalogLanguages, catalogSeeds, fetchCatalogResult } from '@/lib/subtitle-catalog'

const notes: Record<string, { en: string; cs: string }> = {
  english: { en: 'English subtitles are widely used both for accessibility and for understanding dialogue, accents, and quiet speech.', cs: 'Anglické titulky se používají pro přístupnost i lepší porozumění dialogu, přízvukům a tiché řeči.' },
  spanish: { en: 'Spanish subtitle releases may distinguish European and Latin American wording. Check the language label and release notes at the source.', cs: 'Španělské titulky mohou rozlišovat evropskou a latinskoamerickou variantu. Ověřte jazykové označení a poznámky.' },
  indonesian: { en: 'Indonesian subtitle files are commonly labeled with the ISO code id. UTF-8 prevents broken characters across modern players.', cs: 'Indonéské titulky se běžně označují kódem id. UTF-8 omezuje problémy se znaky v moderních přehrávačích.' },
  tagalog: { en: 'Tagalog subtitle metadata commonly uses the code tl. Availability varies by title and release.', cs: 'Tagalog se v metadatech titulků běžně označuje kódem tl. Dostupnost závisí na titulu a release.' },
  hindi: { en: 'Hindi subtitles should use Unicode-compatible encoding such as UTF-8 so Devanagari text displays correctly.', cs: 'Hindi titulky by měly používat Unicode kódování, například UTF-8, aby se dévanágarí zobrazilo správně.' },
  czech: { en: 'Czech subtitle files require correct handling of diacritics. UTF-8 is the safest choice for current players.', cs: 'České titulky vyžadují správné zobrazení diakritiky. UTF-8 je nejbezpečnější volba pro současné přehrávače.' },
}

export async function LanguageCatalogPage({ slug, locale = 'en' }: { slug: string; locale?: 'en' | 'cs' }) {
  const language = catalogLanguages.find((item) => item.slug === slug)
  if (!language) notFound()
  const isCs = locale === 'cs'
  const prefix = isCs ? '/cs' : ''
  const featured = [...catalogSeeds].sort((a, b) => b.popularity - a.popularity).slice(0, 12)
  const results = await Promise.all(featured.map(fetchCatalogResult))
  const available = results.filter((result) => result.languageCounts[language.code] > 0)
  const baseUrl = (process.env.NEXT_PUBLIC_APP_URL || 'https://www.subtitlebot.com').replace(/\/$/, '')
  const schema = { '@context': 'https://schema.org', '@type': 'ItemList', name: `${language.name} subtitles`, url: `${baseUrl}${prefix}/subtitles/${slug}`, numberOfItems: available.length, itemListElement: available.map((result, index) => ({ '@type': 'ListItem', position: index + 1, name: result.media.title, url: `${baseUrl}${prefix}/subtitles/${result.media.type}/${result.media.slug}` })) }
  return <main className="py-12 sm:py-16"><script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema).replace(/</g, '\\u003c') }} /><div className="container mx-auto px-4 max-w-6xl">
    <header className="max-w-3xl mb-10"><h1 className="text-4xl sm:text-5xl font-bold tracking-tight mb-5">{language.name} {isCs ? 'titulky pro filmy a seriály' : 'subtitles for movies and TV shows'}</h1><p className="text-lg text-muted-foreground leading-relaxed mb-4">{notes[slug][locale]}</p><p className="text-sm text-muted-foreground">{isCs ? 'Níže jsou pouze tituly, u kterých aktuální API vzorek obsahuje daný jazyk. Úplnou dostupnost ověřte na detailu a u zdroje.' : 'Only titles whose current API sample contains this language are listed below. Verify complete availability on the detail page and at the source.'}</p></header>
    {available.length ? <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">{available.map((result) => <CatalogCard key={`${result.media.type}-${result.media.slug}`} media={result.media} locale={locale} count={result.languageCounts[language.code]} language={language.name} />)}</div> : <div className="rounded-xl border border-amber-200 bg-amber-50 dark:bg-amber-950/20 p-6"><h2 className="font-bold mb-2">{isCs ? 'Aktuální vzorek neobsahuje ověřený výsledek' : 'No verified result is present in the current sample'}</h2><p className="text-sm text-muted-foreground mb-4">{isCs ? 'Použijte živý finder; tato stránka zůstane noindex, dokud nebude mít dostatek skutečných položek.' : 'Use the live finder; this page remains noindex until it has enough real items.'}</p><Link className="font-semibold text-primary" href={`${prefix}/subtitles-search`}>{isCs ? 'Hledat titulky →' : 'Search subtitles →'}</Link></div>}
    <section className="mt-14 rounded-2xl border p-7"><h2 className="text-2xl font-bold mb-3">{isCs ? 'Jazyk chybí u vašeho release?' : 'Is this language missing for your release?'}</h2><p className="text-muted-foreground mb-5">{isCs ? 'Najděte správně synchronizovaný soubor v dostupném jazyce a přeložte ho při zachování časových značek.' : 'Find a correctly synchronized file in an available language and translate it while preserving timestamps.'}</p><Link href={`${prefix}/translate`} className="font-semibold text-primary hover:underline">{isCs ? 'Přeložit titulky →' : 'Translate subtitles →'}</Link></section>
  </div></main>
}
