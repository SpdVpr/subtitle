// Pure helpers shared by the catalog pages (server), the language finder
// (client) and the availability API. Keep this file free of server-only code.

// Language codes accepted by the OpenSubtitles.com v1 API (GET /infos/languages).
export const OPENSUBTITLES_LANGUAGE_CODES = new Set([
  'ab', 'af', 'sq', 'am', 'ar', 'an', 'hy', 'as', 'at', 'az-az', 'eu', 'be', 'bn', 'bs', 'br', 'bg', 'my', 'ca', 'ze',
  'zh-ca', 'zh-cn', 'zh-tw', 'hr', 'cs', 'da', 'pr', 'nl', 'en', 'eo', 'et', 'ex', 'fi', 'fr', 'gd', 'gl', 'ka', 'de',
  'el', 'he', 'hi', 'hu', 'is', 'ig', 'id', 'ia', 'ga', 'it', 'ja', 'kn', 'kk', 'km', 'ko', 'ku', 'lv', 'lt', 'lb', 'mk',
  'ms', 'ml', 'ma', 'mr', 'mn', 'me', 'nv', 'ne', 'se', 'no', 'oc', 'or', 'fa', 'pl', 'pt-pt', 'pt-br', 'pm', 'ps', 'ro',
  'ru', 'sx', 'sr', 'sd', 'si', 'sk', 'sl', 'so', 'az-zb', 'es', 'sp', 'ea', 'sw', 'sv', 'sy', 'tl', 'ta', 'tt', 'te',
  'tm-td', 'th', 'tp', 'tr', 'tk', 'uk', 'ur', 'uz', 'vi', 'cy',
])

// SubtitleBot language code -> OpenSubtitles language codes that should count as that language.
const TO_OPENSUBTITLES: Record<string, string[]> = {
  pt: ['pt-pt', 'pt-br'],
  zh: ['zh-cn', 'zh-tw'],
  es: ['es', 'sp', 'ea'],
  az: ['az-az'],
}

// OpenSubtitles language code -> SubtitleBot language code (+ optional variant label).
const FROM_OPENSUBTITLES: Record<string, { code: string; variant?: string }> = {
  'pt-pt': { code: 'pt' },
  'pt-br': { code: 'pt', variant: 'BR' },
  pm: { code: 'pt', variant: 'MZ' },
  'zh-cn': { code: 'zh' },
  'zh-tw': { code: 'zh', variant: 'TW' },
  'zh-ca': { code: 'zh', variant: 'HK' },
  ze: { code: 'zh', variant: 'bilingual' },
  sp: { code: 'es', variant: 'EU' },
  ea: { code: 'es', variant: 'LA' },
  'az-az': { code: 'az' },
}

/** Codes to send in the OpenSubtitles `languages` parameter for a SubtitleBot language. Empty when the language is not listed there. */
export function toOpenSubtitlesLanguageCodes(code: string): string[] {
  const normalized = code.trim().toLowerCase()
  if (TO_OPENSUBTITLES[normalized]) return TO_OPENSUBTITLES[normalized]
  return OPENSUBTITLES_LANGUAGE_CODES.has(normalized) ? [normalized] : []
}

/** Maps an OpenSubtitles language code back to a SubtitleBot language code. */
export function fromOpenSubtitlesLanguageCode(osCode: string): { code: string; variant?: string } {
  const normalized = osCode.trim().toLowerCase()
  return FROM_OPENSUBTITLES[normalized] || { code: normalized }
}

// Browser locale tags that do not match SubtitleBot codes directly.
const BROWSER_TAG_ALIASES: Record<string, string> = {
  fil: 'tl',
  nb: 'no',
  nn: 'no',
  iw: 'he',
  in: 'id',
  ji: 'yi',
  zh: 'zh',
}

/** Picks the first browser language that SubtitleBot can translate into. Returns null when none matches. */
export function detectPreferredLanguage(tags: readonly string[], supported: ReadonlySet<string>): string | null {
  for (const tag of tags) {
    if (typeof tag !== 'string' || !tag) continue
    const base = tag.toLowerCase().split(/[-_]/)[0]
    const candidate = BROWSER_TAG_ALIASES[base] || base
    if (supported.has(candidate)) return candidate
  }
  return null
}

/** Target languages shown first in the finder. Ordered by real-world subtitle demand. */
export const POPULAR_TARGET_LANGUAGES = ['en', 'es', 'pt', 'fr', 'de', 'it', 'id', 'hi', 'ar', 'tr', 'pl', 'cs', 'vi', 'th', 'ms', 'tl'] as const
