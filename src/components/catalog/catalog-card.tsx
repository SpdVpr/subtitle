import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import type { CatalogSeed } from '@/lib/subtitle-catalog'

export function CatalogCard({ media, locale = 'en', count, language }: { media: CatalogSeed; locale?: 'en' | 'cs'; count?: number; language?: string }) {
  const prefix = locale === 'cs' ? '/cs' : ''
  return (
    <Link
      href={`${prefix}/subtitles/${media.type}/${media.slug}`}
      className="group block rounded-xl border bg-card p-5 transition-all hover:border-primary/40 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
    >
      <article>
        <div className="flex items-center justify-between gap-3 text-xs uppercase tracking-wide text-muted-foreground mb-3"><span>{media.type === 'movie' ? (locale === 'cs' ? 'Film' : 'Movie') : (locale === 'cs' ? 'Seriál' : 'TV series')}</span><span>{media.year}</span></div>
        <h3 className="font-bold text-lg mb-2 transition-colors group-hover:text-primary">{media.title}</h3>
        <p className="text-sm text-muted-foreground leading-relaxed line-clamp-2">{media.description}</p>
        {typeof count === 'number' && <p className="mt-3 text-sm font-semibold text-primary">{count} {locale === 'cs' ? `výsledků v jazyce ${language}` : `${language} results in the current API sample`}</p>}
        <span className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-primary">{locale === 'cs' ? 'Zobrazit titulky' : 'View subtitles'} <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" /></span>
      </article>
    </Link>
  )
}
