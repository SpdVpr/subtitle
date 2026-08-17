import Link from 'next/link'
import { BookOpen, Clock, ArrowRight } from 'lucide-react'
import { getGuides, GuideLocale } from '@/content/guides'

export function GuideHub({ locale }: { locale: GuideLocale }) {
  const isCs = locale === 'cs'
  const prefix = isCs ? '/cs' : ''
  const guides = getGuides(locale)

  return (
    <main className="py-12 sm:py-16">
      <div className="container mx-auto px-4 max-w-6xl">
        <header className="max-w-3xl mb-12">
          <div className="inline-flex items-center gap-2 text-primary font-semibold mb-4">
            <BookOpen className="h-5 w-5" />
            {isCs ? 'Praktická znalostní báze' : 'Practical knowledge base'}
          </div>
          <h1 className="text-4xl sm:text-5xl font-bold tracking-tight mb-5">
            {isCs ? 'Návody pro titulky, které řeší skutečné problémy' : 'Subtitle guides for real playback and translation problems'}
          </h1>
          <p className="text-lg text-muted-foreground leading-relaxed">
            {isCs
              ? 'Najděte správný release, opravte synchronizaci a FPS, vyberte vhodný formát a připravte čitelné překlady bez poškození časování.'
              : 'Match the right release, repair sync and FPS errors, choose a compatible format, and create readable translations without damaging timing.'}
          </p>
        </header>

        <div className="grid gap-6 md:grid-cols-2">
          {guides.map((guide) => (
            <article key={guide.slug} className="group rounded-2xl border bg-card p-6 sm:p-7 hover:border-primary/40 hover:shadow-lg transition-all">
              <div className="flex items-center justify-between gap-4 text-xs uppercase tracking-wide text-muted-foreground mb-4">
                <span>{guide.category}</span>
                <span className="inline-flex items-center gap-1.5 normal-case tracking-normal"><Clock className="h-3.5 w-3.5" />{guide.readTime}</span>
              </div>
              <h2 className="text-xl sm:text-2xl font-bold mb-3 group-hover:text-primary transition-colors">
                <Link href={`${prefix}/guides/${guide.slug}`}>{guide.title}</Link>
              </h2>
              <p className="text-muted-foreground leading-relaxed mb-5">{guide.description}</p>
              <Link href={`${prefix}/guides/${guide.slug}`} className="inline-flex items-center gap-2 font-semibold text-primary">
                {isCs ? 'Přečíst návod' : 'Read the guide'} <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
              </Link>
            </article>
          ))}
        </div>

        <section className="mt-14 rounded-2xl bg-primary/5 border border-primary/15 p-7 sm:p-10">
          <h2 className="text-2xl font-bold mb-3">{isCs ? 'Potřebujete titulky rovnou opravit?' : 'Need to repair a subtitle now?'}</h2>
          <p className="text-muted-foreground mb-6 max-w-3xl">
            {isCs ? 'Bezplatné nástroje zpracují soubor lokálně v prohlížeči. Posuňte časování, převeďte FPS, zkontrolujte SRT nebo změňte formát.' : 'The free tools process files locally in your browser. Shift timing, convert FPS, validate SRT, or change formats.'}
          </p>
          <Link href={`${prefix}/tools`} className="inline-flex items-center gap-2 rounded-md bg-primary text-primary-foreground px-5 py-3 font-semibold">
            {isCs ? 'Otevřít nástroje' : 'Open subtitle tools'} <ArrowRight className="h-4 w-4" />
          </Link>
        </section>
      </div>
    </main>
  )
}
