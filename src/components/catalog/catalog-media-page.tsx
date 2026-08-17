import Link from 'next/link'
import { ArrowRight, CheckCircle2, ExternalLink, Languages, Search, ShieldCheck } from 'lucide-react'
import type { CatalogResult } from '@/lib/subtitle-catalog'
import { catalogLanguages, relatedCatalogSeeds } from '@/lib/subtitle-catalog'
import { CatalogCard } from './catalog-card'

export function CatalogMediaPage({ result, locale = 'en' }: { result: CatalogResult; locale?: 'en' | 'cs' }) {
  const isCs = locale === 'cs'
  const prefix = isCs ? '/cs' : ''
  const { media, subtitles } = result
  const baseUrl = (process.env.NEXT_PUBLIC_APP_URL || 'https://www.subtitlebot.com').replace(/\/$/, '')
  const url = `${baseUrl}${prefix}/subtitles/${media.type}/${media.slug}`
  const sorted = [...subtitles].sort((a, b) => Number(b.trusted) - Number(a.trusted) || b.downloadCount - a.downloadCount).slice(0, 30)
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

  return (
    <main className="py-10 sm:py-14">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema).replace(/</g, '\\u003c') }} />
      <div className="container mx-auto px-4 max-w-6xl">
        <nav className="text-sm text-muted-foreground mb-8"><Link href={`${prefix}/subtitles/${media.type === 'movie' ? 'movies' : 'tv'}`} className="hover:text-foreground">{isCs ? 'Katalog titulků' : 'Subtitle catalog'}</Link> / {media.title}</nav>
        <header className="max-w-4xl mb-10">
          <div className="flex flex-wrap gap-2 mb-4"><span className="rounded-full bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-300 px-3 py-1 text-sm font-semibold">{media.type === 'movie' ? (isCs ? 'Film' : 'Movie') : (isCs ? 'Seriál' : 'TV series')}</span><span className="rounded-full bg-muted px-3 py-1 text-sm font-semibold">{media.year}</span></div>
          <h1 className="text-4xl sm:text-5xl font-bold tracking-tight mb-5">{media.title} {isCs ? 'titulky' : 'subtitles'}</h1>
          <p className="text-lg text-muted-foreground leading-relaxed">{media.description} {isCs ? 'Porovnejte dostupné jazyky a release varianty a otevřete vybraný výsledek u zdroje.' : 'Compare available languages and release variants, then open the selected result at its source.'}</p>
        </header>

        <section className="grid gap-4 sm:grid-cols-3 mb-12" aria-label={isCs ? 'Souhrn dostupnosti' : 'Availability summary'}>
          <div className="rounded-xl border p-5"><Search className="h-5 w-5 text-primary mb-3" /><div className="text-2xl font-bold">{result.fetched ? result.total.toLocaleString() : '—'}</div><div className="text-sm text-muted-foreground">{isCs ? 'výsledků hlášených zdrojem' : 'results reported by source'}</div></div>
          <div className="rounded-xl border p-5"><Languages className="h-5 w-5 text-primary mb-3" /><div className="text-2xl font-bold">{Object.keys(result.languageCounts).length}</div><div className="text-sm text-muted-foreground">{isCs ? 'jazyků v aktuálním vzorku' : 'languages in current sample'}</div></div>
          <div className="rounded-xl border p-5"><ShieldCheck className="h-5 w-5 text-primary mb-3" /><div className="text-2xl font-bold">{subtitles.filter((subtitle) => subtitle.trusted).length}</div><div className="text-sm text-muted-foreground">{isCs ? 'důvěryhodných výsledků ve vzorku' : 'trusted results in sample'}</div></div>
        </section>

        {result.fetched && subtitles.length ? (
          <>
            <section className="mb-12" aria-labelledby="available-languages">
              <h2 id="available-languages" className="text-2xl font-bold mb-5">{isCs ? 'Dostupné jazyky' : 'Available subtitle languages'}</h2>
              <div className="flex flex-wrap gap-3">{catalogLanguages.filter((language) => result.languageCounts[language.code]).map((language) => <Link key={language.code} href={`${prefix}/subtitles/${language.slug}`} className="rounded-full border px-4 py-2 text-sm font-semibold hover:border-primary">{language.name} <span className="text-muted-foreground">({result.languageCounts[language.code]})</span></Link>)}</div>
            </section>
            <section aria-labelledby="release-list">
              <div className="flex items-end justify-between gap-5 mb-5"><div><h2 id="release-list" className="text-2xl font-bold">{isCs ? 'Release varianty titulků' : 'Subtitle release matches'}</h2><p className="text-sm text-muted-foreground mt-2">{isCs ? 'Zobrazuje se omezený aktuální vzorek. Úplnou dostupnost ověřte u zdroje.' : 'A limited current sample is shown. Verify complete availability at the source.'}</p></div></div>
              <div className="overflow-x-auto rounded-xl border"><table className="w-full text-sm"><thead className="bg-muted"><tr><th className="p-3 text-left">{isCs ? 'Jazyk' : 'Language'}</th><th className="p-3 text-left">Release</th><th className="p-3 text-right">FPS</th><th className="p-3 text-center">{isCs ? 'Vlastnosti' : 'Signals'}</th><th className="p-3 text-right">{isCs ? 'Zdroj' : 'Source'}</th></tr></thead><tbody>{sorted.map((subtitle) => <tr key={subtitle.id} className="border-t"><td className="p-3 font-semibold uppercase">{subtitle.language}</td><td className="p-3 min-w-[260px] break-all">{subtitle.release}</td><td className="p-3 text-right">{subtitle.fps || '—'}</td><td className="p-3"><div className="flex flex-wrap justify-center gap-1">{subtitle.trusted && <span className="text-xs bg-green-100 text-green-800 dark:bg-green-950 dark:text-green-300 rounded px-2 py-1">trusted</span>}{subtitle.hearingImpaired && <span className="text-xs bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300 rounded px-2 py-1">HI</span>}{(subtitle.aiTranslated || subtitle.machineTranslated) && <span className="text-xs bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 rounded px-2 py-1">machine</span>}</div></td><td className="p-3 text-right"><a href={subtitle.sourceUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-primary font-semibold hover:underline">OpenSubtitles <ExternalLink className="h-3.5 w-3.5" /></a></td></tr>)}</tbody></table></div>
            </section>
          </>
        ) : (
          <section className="rounded-xl border border-amber-200 bg-amber-50 dark:bg-amber-950/20 p-6"><h2 className="font-bold mb-2">{isCs ? 'Dostupnost se právě nepodařilo načíst' : 'Availability could not be loaded right now'}</h2><p className="text-sm text-muted-foreground">{isCs ? 'Použijte živý vyhledávač nebo stránku zkuste později. Tato URL se nebude indexovat, dokud nebude mít ověřená data.' : 'Use the live finder or try again later. This URL will remain noindex until verified data is available.'}</p></section>
        )}

        <section className="mt-14 grid gap-6 md:grid-cols-2">
          <div className="rounded-xl border p-6"><h2 className="text-xl font-bold mb-4">{isCs ? 'Jak vybrat správný soubor' : 'How to choose the right file'}</h2><ul className="space-y-3 text-sm text-muted-foreground">{(isCs ? ['Porovnejte release s názvem videa.', 'Ověřte střih, rozlišení a release skupinu.', 'U driftu zkontrolujte FPS.', 'Důvěryhodný výsledek stále před použitím ověřte.'] : ['Match the release label to the video filename.', 'Check the cut, source, and release group.', 'Verify FPS when timing gradually drifts.', 'Preview even trusted results before publishing.']).map((text) => <li key={text} className="flex gap-2"><CheckCircle2 className="h-4 w-4 text-green-600 shrink-0 mt-0.5" />{text}</li>)}</ul></div>
          <div className="rounded-xl bg-primary/5 border border-primary/15 p-6"><h2 className="text-xl font-bold mb-3">{isCs ? 'Chybí požadovaný jazyk?' : 'Missing the language you need?'}</h2><p className="text-sm text-foreground/75 mb-5">{isCs ? 'Najděte titulky odpovídající release a přeložte je se zachováním časování.' : 'Find a subtitle matching the release, then translate it while preserving timing.'}</p><Link href={`${prefix}/translate`} className="inline-flex items-center gap-2 text-primary font-semibold">{isCs ? 'Přeložit titulky' : 'Translate subtitles'} <ArrowRight className="h-4 w-4" /></Link></div>
        </section>

        <div className="mt-7"><Link href={`${prefix}/subtitles-search?q=${encodeURIComponent(media.title)}`} className="inline-flex items-center gap-2 font-semibold text-primary hover:underline">{isCs ? 'Prohledat úplnou databázi pro tento titul' : 'Search the full database for this title'} <ArrowRight className="h-4 w-4" /></Link></div>

        <p className="mt-10 text-xs text-muted-foreground">{isCs ? 'Metadata o dostupnosti poskytuje OpenSubtitles.com. SubtitleBot subtitle soubory nehostuje; dostupnost, licence a podmínky stažení určuje zdroj.' : 'Availability metadata is provided by OpenSubtitles.com. SubtitleBot does not host subtitle files; availability, licensing, and download terms are controlled by the source.'}</p>

        <section className="mt-16"><h2 className="text-2xl font-bold mb-6">{isCs ? 'Související tituly' : 'Related titles'}</h2><div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">{relatedCatalogSeeds(media).map((related) => <CatalogCard key={related.slug} media={related} locale={locale} />)}</div></section>
      </div>
    </main>
  )
}
