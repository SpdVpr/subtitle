'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import Link from 'next/link'
import { ArrowRight, Check, CheckCircle2, Download, ExternalLink, Languages, Loader2, Search, TriangleAlert, Wand2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { SUPPORTED_LANGUAGES } from '@/types/subtitle'
import { POPULAR_TARGET_LANGUAGES, detectPreferredLanguage, fromOpenSubtitlesLanguageCode } from '@/lib/subtitle-catalog-languages'
import { analytics } from '@/lib/analytics'

const STORAGE_KEY = 'subtitlebot.catalog.language'
const LANGUAGE_BY_CODE = new Map(SUPPORTED_LANGUAGES.map((language) => [language.code, language]))
const SUPPORTED_CODES = new Set(LANGUAGE_BY_CODE.keys())

export interface CatalogFinderMedia {
  type: 'movie' | 'tv'
  slug: string
  title: string
  year: number
}

interface Availability {
  listed: boolean
  fetched: boolean
  total: number
  machineOnly: boolean
  best: { sourceUrl: string; release: string } | null
}

type Status = 'idle' | 'loading' | 'available' | 'machine-only' | 'missing' | 'unlisted' | 'error'

const FAILED: Availability = { listed: true, fetched: false, total: 0, machineOnly: false, best: null }

function statusOf(availability: Availability): Status {
  if (!availability.fetched) return 'error'
  if (!availability.listed) return 'unlisted'
  if (availability.total === 0) return 'missing'
  if (availability.machineOnly) return 'machine-only'
  return 'available'
}

function csFiles(count: number) {
  if (count === 1) return '1 soubor'
  if (count >= 2 && count <= 4) return `${count} soubory`
  return `${count.toLocaleString('cs-CZ')} souborů`
}

export function CatalogLanguageFinder({ media, locale, englishSourceUrl, sampledLanguages }: {
  media: CatalogFinderMedia
  locale: 'en' | 'cs'
  englishSourceUrl: string | null
  sampledLanguages: string[]
}) {
  const isCs = locale === 'cs'
  const prefix = isCs ? '/cs' : ''
  const [language, setLanguage] = useState('')
  const [status, setStatus] = useState<Status>('idle')
  const [availability, setAvailability] = useState<Availability | null>(null)
  const [englishOpened, setEnglishOpened] = useState(false)
  const abortRef = useRef<AbortController | null>(null)

  // Preselect the visitor's language: last choice, then the page locale, then the browser language.
  useEffect(() => {
    let initial = ''
    try {
      initial = window.localStorage.getItem(STORAGE_KEY) || ''
    } catch {}
    if (!SUPPORTED_CODES.has(initial)) {
      initial = (isCs ? 'cs' : '') || detectPreferredLanguage(navigator.languages || [navigator.language], SUPPORTED_CODES) || ''
    }
    if (initial) setLanguage(initial)
  }, [isCs])

  // Check OpenSubtitles whenever the language changes.
  useEffect(() => {
    if (!language) {
      setStatus('idle')
      return
    }
    try {
      window.localStorage.setItem(STORAGE_KEY, language)
    } catch {}
    abortRef.current?.abort()
    const controller = new AbortController()
    abortRef.current = controller
    setStatus('loading')
    setAvailability(null)
    setEnglishOpened(false)

    const query = new URLSearchParams({ type: media.type, slug: media.slug, language })
    fetch(`/api/catalog/availability?${query.toString()}`, { signal: controller.signal })
      .then(async (response) => (response.ok ? ((await response.json()) as Availability) : FAILED))
      .catch((error) => (error?.name === 'AbortError' ? null : FAILED))
      .then((data) => {
        if (!data || controller.signal.aborted) return
        const next = statusOf(data)
        setAvailability(data)
        setStatus(next)
        analytics.catalogLanguageChecked(media.slug, language, next)
      })
    return () => controller.abort()
  }, [language, media.type, media.slug])

  const selected = LANGUAGE_BY_CODE.get(language)
  const name = selected ? (isCs ? selected.nativeName : selected.name) : ''
  const total = availability?.total || 0
  const files = isCs ? csFiles(total) : `${total.toLocaleString('en-US')} ${total === 1 ? 'file' : 'files'}`

  const chips = useMemo(() => {
    const seen = new Set<string>()
    const list: { code: string; label: string }[] = []
    for (const osCode of sampledLanguages) {
      const { code } = fromOpenSubtitlesLanguageCode(osCode)
      const entry = LANGUAGE_BY_CODE.get(code)
      if (!entry || seen.has(code)) continue
      seen.add(code)
      list.push({ code, label: isCs ? entry.nativeName : entry.name })
    }
    return list.slice(0, 12)
  }, [sampledLanguages, isCs])

  const optionLabel = (code: string) => {
    const entry = LANGUAGE_BY_CODE.get(code)
    if (!entry) return code
    return isCs ? `${entry.nativeName} · ${entry.name}` : `${entry.name} · ${entry.nativeName}`
  }
  const popular = POPULAR_TARGET_LANGUAGES.filter((code) => LANGUAGE_BY_CODE.has(code))
  const all = [...SUPPORTED_LANGUAGES].sort((a, b) => optionLabel(a.code).localeCompare(optionLabel(b.code)))

  const titleWithYear = `${media.title} (${media.year})`
  const translateHref = `${prefix}/translate?from=subtitle-catalog&sourceLanguage=en&targetLanguage=${encodeURIComponent(language)}&title=${encodeURIComponent(titleWithYear)}`
  const englishIsExternal = Boolean(englishSourceUrl)
  const englishHref = englishSourceUrl || `${prefix}/subtitles-search?q=${encodeURIComponent(media.title)}`

  const t = isCs
    ? {
        heading: 'Titulky ve vašem jazyce',
        sub: `Vyberte jazyk. Ověříme OpenSubtitles pro ${media.title} a ukážeme nejrychlejší cestu.`,
        yourLanguage: 'Váš jazyk',
        choose: 'Vyberte jazyk…',
        popular: 'Nejžádanější',
        all: 'Všechny jazyky',
        onOs: 'Už na OpenSubtitles:',
        idle: ['Vyberte jazyk', 'Ověříme OpenSubtitles', 'Stáhněte je, nebo přeložte anglický soubor zdarma'],
        loading: `Ověřujeme OpenSubtitles: ${name}…`,
        availableTitle: `${name}: titulky jsou k dispozici`,
        availableBody: `${files} na OpenSubtitles.`,
        bestMatch: 'Nejlepší shoda',
        open: 'Otevřít na OpenSubtitles',
        instead: 'Špatný release nebo časování? Přeložte si anglický soubor',
        englishHint: 'Potřebujete jiný jazyk? Vyberte ho výše a ověříme ho.',
        machineTitle: `${name}: jen strojově přeložené soubory`,
        machineBody: `${files}, žádný od člověka. Vytvořte lepší z anglického souboru:`,
        machineOpen: 'Přesto otevřít',
        missingTitle: `${name}: na OpenSubtitles zatím žádné titulky`,
        missingBody: 'Vytvořte si vlastní během pár minut. Časování zůstane přesně jako v anglickém souboru.',
        unlistedTitle: `${name}: OpenSubtitles tento jazyk nenabízí`,
        errorTitle: 'OpenSubtitles se teď nepodařilo kontaktovat',
        errorBody: 'Anglický soubor si můžete přeložit i tak:',
        step1Title: 'Stáhněte anglické titulky',
        step1Text: englishIsExternal ? 'Nejlépe hodnocený anglický soubor pro tento titul. Časování už sedí.' : 'Najděte anglický soubor pro svůj díl nebo release.',
        step1Button: englishIsExternal ? 'Stáhnout anglické .srt' : 'Najít anglické titulky',
        step1Done: 'Otevřeno',
        step2Title: `Přeložte je do jazyka ${name}`,
        step2Text: 'Nahrajte soubor do SubtitleBotu. Zabere to pár minut, první soubor je zdarma.',
        step2Button: `Přeložit do: ${name}`,
      }
    : {
        heading: 'Subtitles in your language',
        sub: `Pick a language. We check OpenSubtitles for ${media.title} and show the fastest way to get it.`,
        yourLanguage: 'Your language',
        choose: 'Choose a language…',
        popular: 'Popular',
        all: 'All languages',
        onOs: 'Already on OpenSubtitles:',
        idle: ['Pick your language', 'We check OpenSubtitles', 'Download it, or translate the English file free'],
        loading: `Checking OpenSubtitles for ${name} subtitles…`,
        availableTitle: `${name} subtitles are available`,
        availableBody: `${files} on OpenSubtitles.`,
        bestMatch: 'Best match',
        open: `Open ${name} subtitles`,
        instead: 'Wrong release or timing off? Translate the English file instead',
        englishHint: 'Need another language? Choose it above and we check it for you.',
        machineTitle: `Only machine-translated ${name} files exist`,
        machineBody: `${files}, none made by a person. Make a better one from the English file:`,
        machineOpen: 'Open them anyway',
        missingTitle: `No ${name} subtitles on OpenSubtitles yet`,
        missingBody: 'Make your own in about two minutes. The timing stays exactly as in the English file.',
        unlistedTitle: `OpenSubtitles has no ${name} section`,
        errorTitle: 'We could not reach OpenSubtitles right now',
        errorBody: 'You can still translate the English file:',
        step1Title: 'Download the English subtitles',
        step1Text: englishIsExternal ? 'Best-rated English file for this title. Timing already fits.' : 'Find the English file for your episode or release.',
        step1Button: englishIsExternal ? 'Get English .srt' : 'Find English subtitles',
        step1Done: 'Opened',
        step2Title: `Translate it to ${name}`,
        step2Text: 'Upload the file to SubtitleBot. About two minutes, first file free.',
        step2Button: `Translate to ${name}`,
      }

  const openSource = () => analytics.catalogSourceOpened(media.slug, language)
  const clickTranslate = () => analytics.catalogTranslateClicked(media.slug, language, status)

  const steps = (
    <div className="grid gap-3 sm:grid-cols-2">
      <div className={`rounded-xl border p-4 transition-colors ${englishOpened ? 'border-green-300 bg-green-50/70 dark:border-green-800/50 dark:bg-green-950/20' : 'bg-muted/40'}`}>
        <div className="flex items-center gap-2 mb-2">
          <span className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-sm font-bold ${englishOpened ? 'bg-green-600 text-white' : 'bg-foreground text-background'}`}>{englishOpened ? <Check className="h-4 w-4" /> : '1'}</span>
          <h3 className="font-semibold">{t.step1Title}</h3>
        </div>
        <p className="text-sm text-muted-foreground mb-3">{t.step1Text}</p>
        <Button asChild variant="outline" size="sm">
          {englishIsExternal ? (
            <a href={englishHref} target="_blank" rel="noopener noreferrer" onClick={() => { setEnglishOpened(true); analytics.catalogSourceOpened(media.slug, 'en') }}>
              <Download className="h-4 w-4" />{englishOpened ? t.step1Done : t.step1Button}<ExternalLink className="h-3.5 w-3.5" />
            </a>
          ) : (
            <Link href={englishHref} onClick={() => setEnglishOpened(true)}><Search className="h-4 w-4" />{t.step1Button}</Link>
          )}
        </Button>
      </div>
      <div className="rounded-xl border border-primary/30 bg-primary/5 p-4">
        <div className="flex items-center gap-2 mb-2">
          <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground text-sm font-bold">2</span>
          <h3 className="font-semibold">{t.step2Title}</h3>
        </div>
        <p className="text-sm text-muted-foreground mb-3">{t.step2Text}</p>
        <Button asChild size="sm">
          <Link href={translateHref} onClick={clickTranslate}><Wand2 className="h-4 w-4" />{t.step2Button}<ArrowRight className="h-4 w-4" /></Link>
        </Button>
      </div>
    </div>
  )

  const problemHeader = (title: string, body: string) => (
    <div className="flex gap-3 mb-4">
      <TriangleAlert className="h-6 w-6 shrink-0 text-amber-500 mt-0.5" />
      <div>
        <p className="text-lg font-semibold leading-snug">{title}</p>
        <p className="text-sm text-muted-foreground mt-1">{body}</p>
      </div>
    </div>
  )

  return (
    <section id="language-finder" aria-labelledby="language-finder-heading" className="rounded-2xl border bg-card shadow-sm overflow-hidden">
      <div className="p-5 sm:p-6 border-b bg-gradient-to-r from-primary/[0.06] to-transparent">
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div className="max-w-xl">
            <h2 id="language-finder-heading" className="text-xl font-bold flex items-center gap-2"><Languages className="h-5 w-5 text-primary" />{t.heading}</h2>
            <p className="text-sm text-muted-foreground mt-1">{t.sub}</p>
          </div>
          <label className="flex flex-col gap-1.5 md:min-w-[300px]">
            <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">{t.yourLanguage}</span>
            <select
              value={language}
              onChange={(event) => setLanguage(event.target.value)}
              className="h-11 w-full rounded-lg border bg-background px-3 text-base font-medium shadow-sm focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <option value="">{t.choose}</option>
              <optgroup label={t.popular}>{popular.map((code) => <option key={code} value={code}>{optionLabel(code)}</option>)}</optgroup>
              <optgroup label={t.all}>{all.map((entry) => <option key={entry.code} value={entry.code}>{optionLabel(entry.code)}</option>)}</optgroup>
            </select>
          </label>
        </div>
        {chips.length > 0 && (
          <div className="mt-4 flex flex-wrap items-center gap-2">
            <span className="text-xs text-muted-foreground mr-1">{t.onOs}</span>
            {chips.map((chip) => (
              <button
                key={chip.code}
                type="button"
                onClick={() => setLanguage(chip.code)}
                aria-pressed={chip.code === language}
                className={`rounded-full border px-3 py-1 text-sm font-medium transition-colors ${chip.code === language ? 'border-primary bg-primary text-primary-foreground' : 'bg-background hover:border-primary hover:text-primary'}`}
              >
                {chip.label}
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="p-5 sm:p-6" aria-live="polite">
        {status === 'idle' && (
          <ol className="grid gap-3 sm:grid-cols-3">
            {t.idle.map((text, index) => (
              <li key={text} className="flex items-center gap-3 rounded-xl bg-muted/40 p-3 text-sm">
                <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-foreground text-background text-sm font-bold">{index + 1}</span>
                <span className="font-medium">{text}</span>
              </li>
            ))}
          </ol>
        )}

        {status === 'loading' && (
          <div className="flex items-center gap-3 text-muted-foreground"><Loader2 className="h-5 w-5 animate-spin text-primary" />{t.loading}</div>
        )}

        {status === 'available' && availability && (
          <div>
            <div className="flex gap-3">
              <CheckCircle2 className="h-6 w-6 shrink-0 text-green-600 mt-0.5" />
              <div className="min-w-0">
                <p className="text-lg font-semibold leading-snug">{t.availableTitle}</p>
                <p className="text-sm text-muted-foreground mt-1">
                  {t.availableBody}
                  {availability.best && <span className="block truncate">{t.bestMatch}: <span className="font-mono text-xs">{availability.best.release}</span></span>}
                </p>
              </div>
            </div>
            <div className="mt-4 flex flex-wrap items-center gap-3">
              {availability.best && (
                <Button asChild>
                  <a href={availability.best.sourceUrl} target="_blank" rel="noopener noreferrer" onClick={openSource}><Download className="h-4 w-4" />{t.open}<ExternalLink className="h-3.5 w-3.5" /></a>
                </Button>
              )}
              {language === 'en' ? (
                <span className="text-sm text-muted-foreground">{t.englishHint}</span>
              ) : (
                <Link href={translateHref} onClick={clickTranslate} className="inline-flex items-center gap-1 text-sm font-semibold text-primary hover:underline">{t.instead}<ArrowRight className="h-4 w-4" /></Link>
              )}
            </div>
          </div>
        )}

        {status === 'machine-only' && availability && (
          <div>
            {problemHeader(t.machineTitle, t.machineBody)}
            {steps}
            {availability.best && (
              <a href={availability.best.sourceUrl} target="_blank" rel="noopener noreferrer" onClick={openSource} className="mt-3 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground hover:underline">{t.machineOpen}<ExternalLink className="h-3.5 w-3.5" /></a>
            )}
          </div>
        )}

        {status === 'missing' && (
          <div>
            {problemHeader(t.missingTitle, t.missingBody)}
            {steps}
          </div>
        )}

        {status === 'unlisted' && (
          <div>
            {problemHeader(t.unlistedTitle, t.missingBody)}
            {steps}
          </div>
        )}

        {status === 'error' && (
          <div>
            {problemHeader(t.errorTitle, t.errorBody)}
            {steps}
          </div>
        )}
      </div>
    </section>
  )
}
