import Link from 'next/link'
import { ArrowRight, CheckCircle2, ExternalLink, Sparkles } from 'lucide-react'
import { Button } from '@/components/ui/button'
import type { CatalogResult } from '@/lib/subtitle-catalog'
import { pickBestSubtitle, relatedCatalogSeeds } from '@/lib/subtitle-catalog'
import { fromOpenSubtitlesLanguageCode } from '@/lib/subtitle-catalog-languages'
import { SUPPORTED_LANGUAGES } from '@/types/subtitle'
import { CatalogCard } from './catalog-card'
import { CatalogLanguageFinder } from './catalog-language-finder'

const languageNames = new Map(SUPPORTED_LANGUAGES.map((language) => [language.code, language.name]))

function languageLabel(osCode: string) {
  const { code, variant } = fromOpenSubtitlesLanguageCode(osCode)
  const name = languageNames.get(code) || osCode.toUpperCase()
  return variant ? `${name} (${variant})` : name
}

export function CatalogMediaPage({ result, locale = 'en' }: { result: CatalogResult; locale?: 'en' | 'cs' }) {
  const isCs = locale === 'cs'
  const prefix = isCs ? '/cs' : ''
  const { media, subtitles } = result
  const baseUrl = (process.env.NEXT_PUBLIC_APP_URL || 'https://www.subtitlebot.com').replace(/\/$/, '')
  const url = `${baseUrl}${prefix}/subtitles/${media.type}/${media.slug}`
  const titleWithYear = `${media.title} (${media.year})`
  const sorted = [...subtitles].sort((a, b) => Number(b.trusted) - Number(a.trusted) || b.downloadCount - a.downloadCount).slice(0, 30)
  const bestEnglish = media.type === 'movie' ? pickBestSubtitle(subtitles.filter((subtitle) => subtitle.language === 'en')) : null
  const translateHref = (from: string, sourceLanguage = 'en') => `${prefix}/translate?from=${from}&sourceLanguage=${encodeURIComponent(sourceLanguage)}&title=${encodeURIComponent(titleWithYear)}`

  const schema = { '@context': 'https://schema.org', '@graph': [
    { '@type': media.type === 'movie' ? 'Movie' : 'TVSeries', '@id': `${url}#media`, name: media.title, dateCreated: `${media.year}-01-01`, description: media.description, sameAs: `https://www.imdb.com/title/tt${String(media.imdbId).padStart(7, '0')}/` },
    { '@type': 'WebPage', '@id': `${url}#webpage`, url, name: `${media.title} subtitles`, about: { '@id': `${url}#media` }, inLanguage: isCs ? 'cs-CZ' : 'en-US' },
    { '@type': 'BreadcrumbList', itemListElement: [
      { '@type': 'ListItem', position: 1, name: isCs ? 'Domů' : 'Home', item: `${baseUrl}${prefix || '/'}` },
      { '@type': 'ListItem', position: 2, name: isCs ? (media.type === 'movie' ? 'Filmové titulky' : 'Seriálové titulky') : (media.type === 'movie' ? 'Movie subtitles' : 'TV subtitles'), item: `${baseUrl}${prefix}/subtitles/${media.type === 'movie' ? 'movies' : 'tv'}` },
      { '@type': 'ListItem', position: 3, name: media.title, item: url },
    ] },
    ...(sorted.length ? [{ '@type': 'ItemList', '@id': `${url}#releases`, name: `${media.title} subtitle release sample`, numberOfItems: sorted.length, itemListElement: sorted.slice(0, 20).map((subtitle, index) => ({ '@type': 'ListItem', position: index + 1, name: `${subtitle.language.toUpperCase()} – ${subtitle.release}`, url: subtitle.sourceUrl })) }] : []),
  ] }

  const tips = isCs
    ? ['Název release musí odpovídat názvu vašeho videosouboru.', 'Zkontrolujte střih, zdroj (BluRay, WEB) a release skupinu.', 'Když titulky postupně ujíždějí, porovnejte FPS.', 'Před použitím soubor vždy krátce zkontrolujte v přehrávači.']
    : ['Match the release name to your video filename.', 'Check the cut, source (BluRay, WEB) and release group.', 'If timing drifts gradually, compare the FPS.', 'Preview the file in your player before relying on it.']

  return (
    <main className="py-8 sm:py-12">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema).replace(/</g, '\\u003c') }} />
      <div className="container mx-auto px-4 max-w-6xl">
        <nav className="text-sm text-muted-foreground mb-6"><Link href={`${prefix}/subtitles/${media.type === 'movie' ? 'movies' : 'tv'}`} className="hover:text-foreground">{isCs ? 'Katalog titulků' : 'Subtitle catalog'}</Link> / {media.title}</nav>

        <header className="max-w-4xl mb-8">
          <div className="flex flex-wrap gap-2 mb-4">
            <span className="rounded-full bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-300 px-3 py-1 text-sm font-semibold">{media.type === 'movie' ? (isCs ? 'Film' : 'Movie') : (isCs ? 'Seriál' : 'TV series')}</span>
            <span className="rounded-full bg-muted px-3 py-1 text-sm font-semibold">{media.year}</span>
            {result.fetched && result.total > 0 && <span className="rounded-full bg-muted px-3 py-1 text-sm font-semibold">{result.total.toLocaleString(isCs ? 'cs-CZ' : 'en-US')} {isCs ? 'souborů na OpenSubtitles' : 'files on OpenSubtitles'}</span>}
          </div>
          <h1 className="text-4xl sm:text-5xl font-bold tracking-tight mb-4">{media.title} {isCs ? 'titulky' : 'subtitles'}</h1>
          <p className="text-lg text-muted-foreground leading-relaxed">{media.description} {isCs ? 'Stáhněte titulky z OpenSubtitles, nebo si anglický soubor přeložte do svého jazyka.' : 'Download subtitles from OpenSubtitles, or translate the English file into your own language.'}</p>
        </header>

        <CatalogLanguageFinder
          media={{ type: media.type, slug: media.slug, title: media.title, year: media.year }}
          locale={locale}
          englishSourceUrl={bestEnglish?.sourceUrl ?? null}
          sampledLanguages={result.sampledLanguages}
        />

        {result.fetched && subtitles.length ? (
          <section className="mt-12" aria-labelledby="release-list">
            <div className="mb-5">
              <h2 id="release-list" className="text-2xl font-bold">{isCs ? 'Soubory titulků na OpenSubtitles' : 'Subtitle files on OpenSubtitles'}</h2>
              <p className="text-sm text-muted-foreground mt-2">{isCs ? 'Seřazeno podle důvěryhodnosti a stažení. Každý soubor můžete otevřít u zdroje, nebo ho rovnou přeložit do jiného jazyka.' : 'Sorted by trust and downloads. Open any file at the source, or translate it straight into another language.'}</p>
            </div>
            <div className="overflow-x-auto rounded-xl border">
              <table className="w-full text-sm">
                <thead className="bg-muted"><tr><th className="p-3 text-left">{isCs ? 'Jazyk' : 'Language'}</th><th className="p-3 text-left">Release</th><th className="p-3 text-right">FPS</th><th className="p-3 text-center">{isCs ? 'Vlastnosti' : 'Signals'}</th><th className="p-3 text-right">{isCs ? 'Akce' : 'Actions'}</th></tr></thead>
                <tbody>
                  {sorted.map((subtitle) => (
                    <tr key={subtitle.id} className="border-t">
                      <td className="p-3 font-semibold whitespace-nowrap">{languageLabel(subtitle.language)}</td>
                      <td className="p-3 min-w-[260px] break-all">{subtitle.release}</td>
                      <td className="p-3 text-right">{subtitle.fps || '—'}</td>
                      <td className="p-3"><div className="flex flex-wrap justify-center gap-1">{subtitle.trusted && <span className="text-xs bg-green-100 text-green-800 dark:bg-green-950 dark:text-green-300 rounded px-2 py-1">trusted</span>}{subtitle.hearingImpaired && <span className="text-xs bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300 rounded px-2 py-1">HI</span>}{(subtitle.aiTranslated || subtitle.machineTranslated) && <span className="text-xs bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 rounded px-2 py-1">machine</span>}</div></td>
                      <td className="p-3 text-right whitespace-nowrap">
                        <a href={subtitle.sourceUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-primary font-semibold hover:underline">OpenSubtitles <ExternalLink className="h-3.5 w-3.5" /></a>
                        <span className="text-muted-foreground mx-2">·</span>
                        <Link href={translateHref('subtitle-catalog-table', subtitle.language)} className="font-semibold hover:underline">{isCs ? 'Přeložit' : 'Translate'}</Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="mt-4"><Link href={`${prefix}/subtitles-search?q=${encodeURIComponent(media.title)}`} className="inline-flex items-center gap-2 text-sm font-semibold text-primary hover:underline">{isCs ? 'Prohledat úplnou databázi pro tento titul' : 'Search the full database for this title'} <ArrowRight className="h-4 w-4" /></Link></div>
          </section>
        ) : (
          <section className="mt-12 rounded-xl border border-amber-200 bg-amber-50 dark:bg-amber-950/20 p-6"><h2 className="font-bold mb-2">{isCs ? 'Dostupnost se právě nepodařilo načíst' : 'Availability could not be loaded right now'}</h2><p className="text-sm text-muted-foreground">{isCs ? 'Použijte živý vyhledávač nebo stránku zkuste později.' : 'Use the live finder or try again later.'}</p><Link href={`${prefix}/subtitles-search?q=${encodeURIComponent(media.title)}`} className="mt-3 inline-flex items-center gap-2 text-sm font-semibold text-primary hover:underline">{isCs ? 'Otevřít vyhledávač titulků' : 'Open the subtitle finder'} <ArrowRight className="h-4 w-4" /></Link></section>
        )}

        <section className="mt-12 grid gap-6 md:grid-cols-2">
          <div className="rounded-xl border p-6"><h2 className="text-xl font-bold mb-4">{isCs ? 'Jak vybrat správný soubor' : 'How to choose the right file'}</h2><ul className="space-y-3 text-sm text-muted-foreground">{tips.map((text) => <li key={text} className="flex gap-2"><CheckCircle2 className="h-4 w-4 text-green-600 shrink-0 mt-0.5" />{text}</li>)}</ul></div>
          <div className="rounded-xl bg-primary/5 border border-primary/15 p-6">
            <Sparkles className="h-5 w-5 text-primary mb-3" />
            <h2 className="text-xl font-bold mb-2">{isCs ? `Chybí vám ${media.title} ve vašem jazyce?` : `Need ${media.title} in another language?`}</h2>
            <p className="text-sm text-foreground/75 mb-5">{isCs ? 'Stáhněte anglický soubor a přeložte ho se zachováním časování. První kompletní soubor je zdarma, bez karty.' : 'Grab the English file and translate it with the timing intact. Your first complete file is free, no card needed.'}</p>
            <Button asChild><Link href={translateHref('subtitle-catalog-bottom')}>{isCs ? 'Přeložit první soubor zdarma' : 'Translate your first file free'} <ArrowRight className="h-4 w-4" /></Link></Button>
          </div>
        </section>

        <p className="mt-8 text-xs text-muted-foreground">{isCs ? 'Metadata o dostupnosti poskytuje OpenSubtitles.com. SubtitleBot soubory titulků nehostuje; dostupnost, licence a podmínky stažení určuje zdroj.' : 'Availability metadata is provided by OpenSubtitles.com. SubtitleBot does not host subtitle files; availability, licensing, and download terms are controlled by the source.'}</p>

        <section className="mt-14"><h2 className="text-2xl font-bold mb-6">{isCs ? 'Související tituly' : 'Related titles'}</h2><div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">{relatedCatalogSeeds(media).map((related) => <CatalogCard key={related.slug} media={related} locale={locale} />)}</div></section>
      </div>
    </main>
  )
}
