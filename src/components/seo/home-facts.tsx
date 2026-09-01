import Link from 'next/link'

export function HomeFacts({ locale = 'en' }: { locale?: 'en' | 'cs' }) {
  const isCs = locale === 'cs'
  const facts = isCs
    ? [
        ['Vyhledávání', 'Filmové a seriálové titulky přes OpenSubtitles; anime titulky přes Jimaku.'],
        ['Překlad', 'AI překlad ve více než 100 jazykových párech se zachováním časových značek.'],
        ['Formáty', 'SRT, VTT, ASS, SSA, SUB, SBV a TXT.'],
        ['Úpravy', 'Online editace textu, posun časování, hledání a nahrazování.'],
        ['Cena', 'První kompletní soubor titulků zdarma; potom kredity bez předplatného.'],
      ]
    : [
        ['Find', 'Movie and TV subtitles through OpenSubtitles; anime subtitles through Jimaku.'],
        ['Translate', 'AI translation across 100+ language pairs while preserving timestamps.'],
        ['Formats', 'SRT, VTT, ASS, SSA, SUB, SBV, and TXT.'],
        ['Edit', 'Online text editing, timing shifts, search, and replacement.'],
        ['Pricing', 'First complete subtitle file free; then pay-as-you-go credits.'],
      ]

  return (
    <section className="py-20 bg-muted/30" aria-labelledby="subtitlebot-at-a-glance">
      <div className="container px-4 mx-auto max-w-5xl">
        <div className="max-w-3xl mb-10">
          <h2 id="subtitlebot-at-a-glance" className="text-3xl sm:text-4xl font-bold mb-4">
            {isCs ? 'SubtitleBot v kostce' : 'SubtitleBot at a glance'}
          </h2>
          <p className="text-muted-foreground leading-relaxed">
            {isCs
              ? 'SubtitleBot je webová sada nástrojů pro nalezení, překlad, úpravu, synchronizaci a zobrazení titulků. Funguje přímo v moderním prohlížeči.'
              : 'SubtitleBot is a browser-based toolkit for finding, translating, editing, synchronizing, and displaying subtitles. It works in a modern web browser.'}
          </p>
        </div>
        <dl className="grid gap-px overflow-hidden rounded-xl border bg-border sm:grid-cols-2 lg:grid-cols-5">
          {facts.map(([term, description]) => (
            <div key={term} className="bg-background p-5">
              <dt className="font-semibold mb-2">{term}</dt>
              <dd className="text-sm text-muted-foreground leading-relaxed">{description}</dd>
            </div>
          ))}
        </dl>
        <div className="mt-8 flex flex-wrap gap-5 text-sm font-semibold">
          <Link className="text-primary hover:underline" href={isCs ? '/cs/subtitles-search' : '/subtitles-search'}>
            {isCs ? 'Najít titulky →' : 'Find subtitles →'}
          </Link>
          <Link className="text-primary hover:underline" href={isCs ? '/cs/translate' : '/translate'}>
            {isCs ? 'Přeložit titulky →' : 'Translate subtitles →'}
          </Link>
          <Link className="text-primary hover:underline" href={isCs ? '/cs/about' : '/about'}>
            {isCs ? 'Jak SubtitleBot funguje →' : 'How SubtitleBot works →'}
          </Link>
          <Link className="text-primary hover:underline" href={isCs ? '/cs/tools' : '/tools'}>
            {isCs ? 'Opravit titulky →' : 'Fix subtitles →'}
          </Link>
          <Link className="text-primary hover:underline" href={isCs ? '/cs/guides' : '/guides'}>
            {isCs ? 'Praktické návody →' : 'Subtitle guides →'}
          </Link>
        </div>
      </div>
    </section>
  )
}
