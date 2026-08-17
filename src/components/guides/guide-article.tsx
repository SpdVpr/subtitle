import Link from 'next/link'
import { ArrowLeft, CheckCircle2, Clock, Wrench } from 'lucide-react'
import type { Guide } from '@/content/guides'

export function GuideArticle({ guide }: { guide: Guide }) {
  const isCs = guide.locale === 'cs'
  const prefix = isCs ? '/cs' : ''
  const baseUrl = (process.env.NEXT_PUBLIC_APP_URL || 'https://www.subtitlebot.com').replace(/\/$/, '')
  const url = `${baseUrl}${prefix}/guides/${guide.slug}`
  const schema = {
    '@context': 'https://schema.org',
    '@graph': [
      { '@type': 'Organization', '@id': `${baseUrl}/#organization`, name: 'SubtitleBot', url: baseUrl, logo: `${baseUrl}/logo-sub.png` },
      {
        '@type': 'Article', '@id': `${url}#article`, headline: guide.title, description: guide.description,
        datePublished: guide.updated, dateModified: guide.updated, inLanguage: isCs ? 'cs-CZ' : 'en-US',
        mainEntityOfPage: { '@id': `${url}#webpage` },
        author: { '@type': 'Organization', name: 'SubtitleBot', url: baseUrl },
        publisher: { '@id': `${baseUrl}/#organization` },
      },
      {
        '@type': 'WebPage', '@id': `${url}#webpage`, url, name: guide.title,
        breadcrumb: { '@id': `${url}#breadcrumb` },
      },
      {
        '@type': 'BreadcrumbList', '@id': `${url}#breadcrumb`, itemListElement: [
          { '@type': 'ListItem', position: 1, name: isCs ? 'Domů' : 'Home', item: `${baseUrl}${prefix || '/'}` },
          { '@type': 'ListItem', position: 2, name: isCs ? 'Návody' : 'Guides', item: `${baseUrl}${prefix}/guides` },
          { '@type': 'ListItem', position: 3, name: guide.title, item: url },
        ],
      },
      {
        '@type': 'FAQPage', mainEntity: guide.faq.map((item) => ({
          '@type': 'Question', name: item.question,
          acceptedAnswer: { '@type': 'Answer', text: item.answer },
        })),
      },
    ],
  }

  return (
    <main className="py-10 sm:py-14">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema).replace(/</g, '\\u003c') }} />
      <article className="container mx-auto px-4 max-w-4xl">
        <Link href={`${prefix}/guides`} className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-8">
          <ArrowLeft className="h-4 w-4" /> {isCs ? 'Všechny návody' : 'All guides'}
        </Link>
        <header className="mb-12">
          <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground mb-5">
            <span className="rounded-full bg-primary/10 text-primary px-3 py-1 font-medium">{guide.category}</span>
            <span className="inline-flex items-center gap-1.5"><Clock className="h-4 w-4" />{guide.readTime}</span>
            <span>{isCs ? 'Aktualizováno' : 'Updated'} {new Intl.DateTimeFormat(isCs ? 'cs-CZ' : 'en-US', { dateStyle: 'medium', timeZone: 'UTC' }).format(new Date(guide.updated))}</span>
          </div>
          <p className="text-sm text-muted-foreground mb-5">{isCs ? 'Připravil SubtitleBot · technické příklady ověřeny pomocí vestavěných nástrojů' : 'Prepared by SubtitleBot · technical examples verified with the built-in tools'}</p>
          <h1 className="text-4xl sm:text-5xl font-bold tracking-tight mb-6">{guide.title}</h1>
          <p className="text-xl text-muted-foreground leading-relaxed">{guide.description}</p>
        </header>

        <div className="space-y-14">
          {guide.sections.map((section) => (
            <section key={section.heading} className="scroll-mt-24">
              <h2 className="text-2xl sm:text-3xl font-bold mb-5">{section.heading}</h2>
              <div className="space-y-4 text-[1.05rem] leading-8 text-foreground/85">
                {section.paragraphs.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}
              </div>
              {section.bullets && (
                <ul className="mt-6 space-y-3">
                  {section.bullets.map((bullet) => <li key={bullet} className="flex gap-3"><CheckCircle2 className="h-5 w-5 text-green-600 shrink-0 mt-0.5" /><span>{bullet}</span></li>)}
                </ul>
              )}
              {section.example && (
                <div className="mt-6 rounded-xl border bg-muted/40 overflow-hidden">
                  <div className="border-b px-4 py-2 text-sm font-semibold">{section.example.label}</div>
                  <pre className="p-4 text-sm whitespace-pre-wrap overflow-x-auto font-mono">{section.example.content}</pre>
                </div>
              )}
            </section>
          ))}
        </div>

        <section className="mt-16 pt-10 border-t" aria-labelledby="guide-faq">
          <h2 id="guide-faq" className="text-3xl font-bold mb-7">{isCs ? 'Časté otázky' : 'Frequently asked questions'}</h2>
          <dl className="space-y-7">
            {guide.faq.map((item) => <div key={item.question}><dt className="font-bold text-lg mb-2">{item.question}</dt><dd className="text-muted-foreground leading-relaxed">{item.answer}</dd></div>)}
          </dl>
        </section>

        {guide.category === 'formats' && <section className="mt-12 pt-8 border-t"><h2 className="text-xl font-bold mb-3">{isCs ? 'Technický zdroj' : 'Technical source'}</h2><a href="https://www.w3.org/TR/webvtt1/" target="_blank" rel="noopener noreferrer" className="text-primary font-semibold hover:underline">W3C WebVTT specification</a></section>}

        <aside className="mt-16 rounded-2xl border bg-primary/5 p-7 sm:p-9">
          <Wrench className="h-7 w-7 text-primary mb-4" />
          <h2 className="text-2xl font-bold mb-3">{isCs ? 'Použijte bezplatný subtitle nástroj' : 'Use a free subtitle tool'}</h2>
          <p className="text-muted-foreground mb-5">{isCs ? 'Opravte časování, převeďte FPS, zkontrolujte strukturu nebo čitelnost přímo v prohlížeči.' : 'Repair timing, convert FPS, validate structure, or check readability directly in your browser.'}</p>
          <Link href={`${prefix}/tools`} className="font-semibold text-primary hover:underline">{isCs ? 'Otevřít nástroje →' : 'Open tools →'}</Link>
        </aside>
      </article>
    </main>
  )
}
