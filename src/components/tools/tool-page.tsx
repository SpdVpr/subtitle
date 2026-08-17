import Link from 'next/link'
import { ArrowLeft, LockKeyhole } from 'lucide-react'
import type { ToolDefinition } from '@/content/tools'
import { SubtitleWorkbench } from './subtitle-workbench'

const guideByMode = { sync: 'fix-subtitles-out-of-sync', validator: 'srt-vs-vtt-vs-ass', 'reading-speed': 'translate-subtitles-with-ai', converter: 'srt-vs-vtt-vs-ass', encoding: 'add-subtitles-vlc-plex-kodi' }

export function ToolPage({ tool }: { tool: ToolDefinition }) {
  const isCs = tool.locale === 'cs'
  const prefix = isCs ? '/cs' : ''
  const baseUrl = (process.env.NEXT_PUBLIC_APP_URL || 'https://www.subtitlebot.com').replace(/\/$/, '')
  const url = `${baseUrl}${prefix}/tools/${tool.slug}`
  const schema = { '@context': 'https://schema.org', '@graph': [
    { '@type': 'WebApplication', '@id': `${url}#app`, name: tool.title, description: tool.description, url, applicationCategory: 'UtilitiesApplication', operatingSystem: 'Any', browserRequirements: 'Modern browser with JavaScript', isAccessibleForFree: true, offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' }, featureList: tool.steps },
    { '@type': 'HowTo', name: tool.title, description: tool.description, step: tool.steps.map((text, index) => ({ '@type': 'HowToStep', position: index + 1, text })) },
    { '@type': 'FAQPage', mainEntity: tool.faq.map((item) => ({ '@type': 'Question', name: item.question, acceptedAnswer: { '@type': 'Answer', text: item.answer } })) },
    { '@type': 'BreadcrumbList', itemListElement: [
      { '@type': 'ListItem', position: 1, name: isCs ? 'Domů' : 'Home', item: `${baseUrl}${prefix || '/'}` },
      { '@type': 'ListItem', position: 2, name: isCs ? 'Nástroje' : 'Tools', item: `${baseUrl}${prefix}/tools` },
      { '@type': 'ListItem', position: 3, name: tool.title, item: url },
    ] },
  ] }

  return (
    <main className="py-10 sm:py-14">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema).replace(/</g, '\\u003c') }} />
      <div className="container mx-auto px-4 max-w-5xl">
        <Link href={`${prefix}/tools`} className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-8"><ArrowLeft className="h-4 w-4" />{isCs ? 'Všechny nástroje' : 'All tools'}</Link>
        <header className="max-w-3xl mb-9">
          <h1 className="text-4xl sm:text-5xl font-bold tracking-tight mb-5">{tool.title}</h1>
          <p className="text-lg text-muted-foreground leading-relaxed">{tool.description}</p>
          <div className="inline-flex items-center gap-2 text-sm text-green-700 dark:text-green-400 font-medium mt-5"><LockKeyhole className="h-4 w-4" />{isCs ? 'Lokální zpracování — soubor se neodesílá na server' : 'Local processing — your file is not sent to a server'}</div>
        </header>
        <section className="rounded-2xl border bg-card p-5 sm:p-8 shadow-sm"><SubtitleWorkbench tool={tool} /></section>
        <section className="mt-14 grid gap-10 md:grid-cols-2">
          <div><h2 className="text-2xl font-bold mb-5">{isCs ? 'Jak nástroj použít' : 'How to use this tool'}</h2><ol className="space-y-4">{tool.steps.map((step, index) => <li key={step} className="flex gap-4"><span className="w-8 h-8 shrink-0 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold">{index + 1}</span><span className="pt-1">{step}</span></li>)}</ol></div>
          <div><h2 className="text-2xl font-bold mb-5">{isCs ? 'Časté otázky' : 'Frequently asked questions'}</h2><dl className="space-y-5">{tool.faq.map((item) => <div key={item.question}><dt className="font-bold mb-1">{item.question}</dt><dd className="text-sm text-muted-foreground leading-relaxed">{item.answer}</dd></div>)}</dl></div>
        </section>
        <aside className="mt-14 rounded-xl bg-muted/40 border p-6"><h2 className="font-bold text-lg mb-2">{isCs ? 'Pochopte příčinu problému' : 'Understand the cause'}</h2><Link href={`${prefix}/guides/${guideByMode[tool.mode]}`} className="text-primary font-semibold hover:underline">{isCs ? 'Přečíst související návod →' : 'Read the related guide →'}</Link></aside>
      </div>
    </main>
  )
}
