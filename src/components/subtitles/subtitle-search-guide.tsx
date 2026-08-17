import Link from 'next/link'
import { CheckCircle2, Download, Languages, Search } from 'lucide-react'

export function SubtitleSearchGuide({ locale = 'en' }: { locale?: 'en' | 'cs' }) {
  const isCs = locale === 'cs'

  const steps = isCs
    ? [
        ['1. Zadejte přesný název', 'Použijte originální název filmu, seriálu nebo anime. U podobných titulů přidejte rok vydání.'],
        ['2. Vyberte správnou verzi', 'Porovnejte jazyk, rok, řadu, epizodu, vydání a hodnocení zdroje. Správná release verze obvykle lépe sedí na časování.'],
        ['3. Stáhněte nebo přeložte', 'Otevřete výsledek u poskytovatele. Pokud požadovaný jazyk chybí, stažený soubor můžete přeložit v SubtitleBot.'],
      ]
    : [
        ['1. Search the exact title', 'Use the original movie, TV show, or anime title. Add the release year when different productions share a name.'],
        ['2. Match the right release', 'Compare language, year, season, episode, release name, and source rating. A matching release is more likely to have correct timing.'],
        ['3. Download or translate', 'Open the result at its source. If your language is unavailable, bring the downloaded subtitle file to SubtitleBot for translation.'],
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
    <div className="mt-16 space-y-16">
      <section aria-labelledby="how-to-find-subtitles">
        <div className="max-w-3xl mb-8">
          <h2 id="how-to-find-subtitles" className="text-2xl sm:text-3xl font-bold mb-3">
            {isCs ? 'Jak najít správné titulky' : 'How to find the right subtitles'}
          </h2>
          <p className="text-muted-foreground leading-relaxed">
            {isCs
              ? 'SubtitleBot spojuje vyhledávání filmů a seriálů přes OpenSubtitles s vyhledáváním anime přes Jimaku. Nehostujeme katalog souborů; výsledky odkazují na příslušný zdroj, kde platí jeho dostupnost a pravidla.'
              : 'SubtitleBot combines movie and TV search through OpenSubtitles with anime search through Jimaku. We do not host a subtitle catalog; results lead to the relevant source, whose availability and terms apply.'}
          </p>
        </div>
        <ol className="grid gap-5 md:grid-cols-3">
          {steps.map(([title, description], index) => {
            const Icon = index === 0 ? Search : index === 1 ? CheckCircle2 : Download
            return (
              <li key={title} className="rounded-xl border bg-card p-6">
                <Icon className="h-6 w-6 text-primary mb-4" aria-hidden="true" />
                <h3 className="font-semibold mb-2">{title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{description}</p>
              </li>
            )
          })}
        </ol>
      </section>

      <section className="grid gap-8 lg:grid-cols-[1.2fr_0.8fr]" aria-labelledby="search-tips">
        <div>
          <h2 id="search-tips" className="text-2xl font-bold mb-4">
            {isCs ? 'Tipy pro přesnější výsledky' : 'Tips for more accurate results'}
          </h2>
          <ul className="space-y-3 text-muted-foreground">
            {(isCs
              ? [
                  'Začněte originálním názvem; lokalizovaný název zkuste až jako druhou variantu.',
                  'U remaků a stejně pojmenovaných filmů vyplňte rok vydání.',
                  'U seriálů zkontrolujte číslo řady a epizody i označení jako S02E05.',
                  'Volba „důvěryhodné zdroje“ omezí výsledky, ale může zlepšit jejich kvalitu.',
                  'AI nebo strojové překlady zahrňte, jen pokud není dostupná ověřená lidská verze.',
                ]
              : [
                  'Start with the original title; try the localized title as a second option.',
                  'Add the release year for remakes and productions that share a title.',
                  'For TV, verify both the season and episode number, including labels such as S02E05.',
                  'The trusted-source filter narrows the result set but may improve reliability.',
                  'Include AI or machine translations when a verified human subtitle is unavailable.',
                ]).map((tip) => (
              <li key={tip} className="flex gap-3">
                <CheckCircle2 className="h-5 w-5 text-green-600 shrink-0 mt-0.5" aria-hidden="true" />
                <span>{tip}</span>
              </li>
            ))}
          </ul>
        </div>
        <aside className="rounded-xl bg-primary/5 border border-primary/15 p-6">
          <Languages className="h-7 w-7 text-primary mb-4" aria-hidden="true" />
          <h2 className="text-xl font-bold mb-3">
            {isCs ? 'Nenašli jste svůj jazyk?' : 'Can’t find your language?'}
          </h2>
          <p className="text-sm text-foreground/75 leading-relaxed mb-5">
            {isCs
              ? 'Najděte kvalitní titulky v dostupném jazyce a přeložte je při zachování časování. Překladač podporuje SRT, VTT, ASS, SSA, SUB, SBV a TXT.'
              : 'Find a reliable subtitle in an available language, then translate it while preserving timing. The translator supports SRT, VTT, ASS, SSA, SUB, SBV, and TXT.'}
          </p>
          <Link href={isCs ? '/cs/translate' : '/translate'} className="font-semibold text-primary hover:underline">
            {isCs ? 'Přeložit soubor titulků →' : 'Translate a subtitle file →'}
          </Link>
        </aside>
      </section>

      <section aria-labelledby="subtitle-faq">
        <h2 id="subtitle-faq" className="text-2xl font-bold mb-6">
          {isCs ? 'Časté otázky k titulkům' : 'Subtitle finder FAQ'}
        </h2>
        <dl className="grid gap-6 md:grid-cols-2">
          {faqs.map(([question, answer]) => (
            <div key={question} className="border-t pt-5">
              <dt className="font-semibold mb-2">{question}</dt>
              <dd className="text-sm text-muted-foreground leading-relaxed">{answer}</dd>
            </div>
          ))}
        </dl>
      </section>

      <nav aria-label={isCs ? 'Související nástroje' : 'Related subtitle tools'} className="rounded-xl border p-6">
        <h2 className="text-xl font-bold mb-4">{isCs ? 'Související nástroje' : 'Related subtitle tools'}</h2>
        <div className="flex flex-wrap gap-x-6 gap-y-3 text-sm font-medium">
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
