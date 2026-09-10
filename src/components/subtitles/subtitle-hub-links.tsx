import Link from 'next/link'
import { catalogLanguages } from '@/lib/subtitle-catalog'

/**
 * Server-rendered links from the finder (the site's strongest URL) to the
 * indexable catalog hubs and language pages, using the phrases people
 * actually search for ("movie subtitles", "English subtitles", ...).
 */
export function SubtitleHubLinks({ locale = 'en' }: { locale?: 'en' | 'cs' }) {
  const isCs = locale === 'cs'
  const prefix = isCs ? '/cs' : ''

  const hubs = isCs
    ? [
        ['Filmové titulky', '/subtitles/movies'],
        ['Seriálové titulky', '/subtitles/tv'],
        ['Nejhledanější titulky', '/subtitles/popular'],
        ['Nejnovější titulky', '/subtitles/latest'],
      ]
    : [
        ['Movie subtitles', '/subtitles/movies'],
        ['TV series subtitles', '/subtitles/tv'],
        ['Popular subtitles', '/subtitles/popular'],
        ['Latest subtitles', '/subtitles/latest'],
      ]

  // Tagalog has no indexable hub yet (see sitemap.ts)
  const languages = catalogLanguages.filter((language) => language.code !== 'tl')

  return (
    <nav
      aria-label={isCs ? 'Katalog titulků' : 'Subtitle catalog'}
      className="mt-10 sm:mt-12 rounded-xl border bg-card px-4 py-3.5 text-sm"
    >
      <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
        <span className="font-semibold text-muted-foreground">{isCs ? 'Procházet katalog:' : 'Browse the catalog:'}</span>
        {hubs.map(([label, path]) => (
          <Link key={path} className="font-medium text-primary hover:underline" href={`${prefix}${path}`}>
            {label}
          </Link>
        ))}
      </div>
      <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-2">
        <span className="font-semibold text-muted-foreground">{isCs ? 'Titulky podle jazyka:' : 'Subtitles by language:'}</span>
        {languages.map((language) => (
          <Link key={language.code} className="font-medium text-primary hover:underline" href={`${prefix}/subtitles/${language.slug}`}>
            {isCs ? `Titulky v ${language.csName}` : `${language.name} subtitles`}
          </Link>
        ))}
      </div>
    </nav>
  )
}
