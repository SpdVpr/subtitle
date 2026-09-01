import Link from 'next/link'
import { Languages, Clock, FileText, ArrowRight } from 'lucide-react'

/**
 * Prominent CTA for the paid AI translation service — the conversion goal
 * of the subtitle search funnel: found subtitles in the wrong language?
 * Translate them here.
 */
export function TranslatePromo({ locale = 'en' }: { locale?: 'en' | 'cs' }) {
  const isCs = locale === 'cs'
  const langPrefix = isCs ? '/cs' : ''

  const features = isCs
    ? [
        [Languages, '100+ jazykových kombinací'],
        [Clock, 'Časování zůstane přesně zachované'],
        [FileText, 'SRT, VTT, ASS, SSA, SUB, SBV i TXT'],
      ]
    : [
        [Languages, '100+ language pairs supported'],
        [Clock, 'Timing stays perfectly preserved'],
        [FileText, 'SRT, VTT, ASS, SSA, SUB, SBV & TXT'],
      ]

  return (
    <div className="mt-10 sm:mt-12">
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary via-primary to-blue-700 dark:from-blue-600 dark:via-blue-700 dark:to-blue-900 p-6 sm:p-8 text-white shadow-xl shadow-primary/20">
        <div className="absolute -top-12 -right-12 w-56 h-56 rounded-full bg-white/10 blur-2xl" />
        <div className="absolute -bottom-16 -left-10 w-48 h-48 rounded-full bg-blue-300/10 blur-2xl" />

        <div className="relative grid lg:grid-cols-[1.3fr_0.7fr] gap-6 items-center">
          <div>
            <h2 className="text-xl sm:text-2xl md:text-3xl font-bold leading-tight mb-2">
              {isCs
                ? 'Titulky jen ve špatném jazyce? Přeložíme je za vás.'
                : 'Subtitles in the wrong language? We’ll translate them.'}
            </h2>
            <p className="text-sm sm:text-base text-white/85 leading-relaxed mb-4">
              {isCs
                ? 'Stáhněte titulky výše a nahrajte je do AI překladače. První kompletní soubor je zdarma a bez platební karty.'
                : 'Download a subtitle above and drop it into our AI translator. Your first complete file is free with no card required.'}
            </p>
            <ul className="flex flex-wrap gap-x-5 gap-y-2 text-xs sm:text-sm text-white/90">
              {features.map(([Icon, label]) => (
                <li key={label as string} className="inline-flex items-center gap-1.5">
                  <Icon className="h-4 w-4 text-blue-200" aria-hidden="true" />
                  {label as string}
                </li>
              ))}
            </ul>
          </div>

          <div className="flex lg:justify-end">
            <Link
              href={`${langPrefix}/translate?from=subtitle-search`}
              className="inline-flex items-center gap-2 rounded-xl bg-white px-6 py-3.5 text-sm sm:text-base font-bold text-primary shadow-lg hover:bg-blue-50 transition-colors"
            >
              {isCs ? 'Přeložit první soubor zdarma' : 'Translate first file free'}
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
