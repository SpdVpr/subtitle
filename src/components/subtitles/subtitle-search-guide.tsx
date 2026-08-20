import Link from 'next/link'
import { CheckCircle2, Download, Search, ChevronDown } from 'lucide-react'

/**
 * Compact guide under the subtitle search: three one-line steps, then tips
 * and FAQ folded into native <details> accordions (content stays in the DOM
 * for SEO), and the related-tools links. The translation upsell lives in the
 * TranslatePromo banner above this component.
 */
export function SubtitleSearchGuide({ locale = 'en' }: { locale?: 'en' | 'cs' }) {
  const isCs = locale === 'cs'

  const steps = isCs
    ? [
        ['1. Zadejte název', 'Originální název; u remaků přidejte rok.'],
        ['2. Vyberte verzi', 'Sedící release = správné časování.'],
        ['3. Stáhněte / přeložte', 'Chybí váš jazyk? Přeložíme ho výše.'],
      ]
    : [
        ['1. Search the title', 'Original title; add the year for remakes.'],
        ['2. Match the release', 'A matching release means correct timing.'],
        ['3. Download / translate', 'Language missing? Translate it above.'],
      ]

  const tips = isCs
    ? [
        'Začněte originálním názvem; lokalizovaný zkuste jako druhý.',
        'U remaků a stejně pojmenovaných filmů vyplňte rok vydání.',
        'U seriálů zkontrolujte řadu a epizodu (např. S02E05).',
        'Volba „důvěryhodné zdroje“ zúží výsledky, ale zvýší kvalitu.',
        'AI překlady zahrňte, jen když chybí ověřená lidská verze.',
      ]
    : [
        'Start with the original title; try the localized one second.',
        'Add the release year for remakes and shared titles.',
        'For TV, verify season and episode (e.g. S02E05).',
        'The trusted-source filter narrows results but improves quality.',
        'Include AI translations only when no verified human one exists.',
      ]

  const faqs = isCs
    ? [
        ['Je vyhledávání titulků zdarma?', 'Ano. Vyhledávání nevyžaduje placené kredity. Dostupnost souboru a podmínky stažení určuje zdrojová databáze.'],
        ['Kde hledat anglické titulky?', 'Pro filmy a seriály nastavte ve vyhledávání jazyk English. Pro anime můžete samostatně prohledat databázi Jimaku.'],
        ['Proč titulky nesedí na video?', 'Nejčastější příčinou je jiná verze filmu, snímková frekvence nebo střih. Hledejte shodu názvu release; konstantní posun lze opravit v editoru titulků.'],
        ['Mohu nalezené titulky přeložit?', 'Ano. Stáhněte podporovaný soubor a otevřete AI překladač. SubtitleBot zachová časové značky a formát souboru.'],
      ]
    : [
        ['Is the subtitle finder free?', 'Yes. Searching does not use paid credits. File availability and download terms are controlled by the source database.'],
        ['How do I find English subtitles?', 'Choose English in the language filter for movies and TV shows. Anime titles can also be searched separately through Jimaku.'],
        ['Why are downloaded subtitles out of sync?', 'The usual cause is a different video cut, frame rate, or release. Match the release name when possible; a constant offset can be corrected in the subtitle editor.'],
        ['Can I translate a subtitle I find here?', 'Yes. Download a supported subtitle file and open the AI translator. SubtitleBot preserves the timestamps and file structure.'],
      ]

  return (
    <div className="mt-10 space-y-8">
      {/* Three compact steps */}
      <section aria-labelledby="how-to-find-subtitles">
        <h2 id="how-to-find-subtitles" className="text-xl sm:text-2xl font-bold mb-4">
          {isCs ? 'Jak najít správné titulky' : 'How to find the right subtitles'}
        </h2>
        <ol className="grid gap-3 md:grid-cols-3">
          {steps.map(([title, description], index) => {
            const Icon = index === 0 ? Search : index === 1 ? CheckCircle2 : Download
            return (
              <li key={title} className="rounded-xl border bg-card px-4 py-3.5 flex items-start gap-3">
                <Icon className="h-5 w-5 text-primary shrink-0 mt-0.5" aria-hidden="true" />
                <div>
                  <h3 className="font-semibold text-sm">{title}</h3>
                  <p className="text-xs text-muted-foreground leading-relaxed">{description}</p>
                </div>
              </li>
            )
          })}
        </ol>
      </section>

      {/* Tips + FAQ folded into accordions */}
      <section className="grid gap-3 md:grid-cols-2" aria-label={isCs ? 'Tipy a časté otázky' : 'Tips and FAQ'}>
        <details className="group rounded-xl border bg-card px-4 py-3">
          <summary className="flex items-center justify-between cursor-pointer font-semibold text-sm list-none [&::-webkit-details-marker]:hidden">
            {isCs ? '💡 Tipy pro přesnější výsledky' : '💡 Tips for more accurate results'}
            <ChevronDown className="h-4 w-4 text-muted-foreground transition-transform group-open:rotate-180" aria-hidden="true" />
          </summary>
          <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
            {tips.map((tip) => (
              <li key={tip} className="flex gap-2">
                <CheckCircle2 className="h-4 w-4 text-green-600 shrink-0 mt-0.5" aria-hidden="true" />
                <span>{tip}</span>
              </li>
            ))}
          </ul>
        </details>

        <details className="group rounded-xl border bg-card px-4 py-3">
          <summary className="flex items-center justify-between cursor-pointer font-semibold text-sm list-none [&::-webkit-details-marker]:hidden">
            {isCs ? '❓ Časté otázky k titulkům' : '❓ Subtitle finder FAQ'}
            <ChevronDown className="h-4 w-4 text-muted-foreground transition-transform group-open:rotate-180" aria-hidden="true" />
          </summary>
          <dl className="mt-3 space-y-3">
            {faqs.map(([question, answer]) => (
              <div key={question}>
                <dt className="font-medium text-sm">{question}</dt>
                <dd className="text-sm text-muted-foreground leading-relaxed">{answer}</dd>
              </div>
            ))}
          </dl>
        </details>
      </section>

      {/* Related tools (SEO internal links) */}
      <nav aria-label={isCs ? 'Související nástroje' : 'Related subtitle tools'} className="rounded-xl border px-4 py-3.5">
        <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-sm font-medium">
          <span className="text-muted-foreground font-semibold">
            {isCs ? 'Související nástroje:' : 'Related tools:'}
          </span>
          <Link className="text-primary hover:underline" href={isCs ? '/cs/translate' : '/translate'}>{isCs ? 'AI překladač titulků' : 'AI subtitle translator'}</Link>
          <Link className="text-primary hover:underline" href={isCs ? '/cs/subtitle-editor' : '/subtitle-editor'}>{isCs ? 'Editor a synchronizace' : 'Subtitle editor and sync'}</Link>
          <Link className="text-primary hover:underline" href={isCs ? '/cs/video-tools' : '/video-tools'}>{isCs ? 'Video přehrávač s titulky' : 'Video player with subtitles'}</Link>
          <Link className="text-primary hover:underline" href={isCs ? '/cs/subtitles/movies' : '/subtitles/movies'}>{isCs ? 'Katalog filmových titulků' : 'Movie subtitle catalog'}</Link>
          <Link className="text-primary hover:underline" href={isCs ? '/cs/guides' : '/guides'}>{isCs ? 'Návody pro titulky' : 'Subtitle guides'}</Link>
        </div>
      </nav>
    </div>
  )
}
