/**
 * Turns a raw scene-style release name ("Movie.2023.1080p.WEB-DL.DDP5.1-GROUP")
 * into a neutral label ("Web", "Blu-ray · Extended").
 *
 * Catalog pages must not print raw release names: anti-piracy crawlers match
 * them and file DMCA notices against the page (Google notice, 2026-11-18).
 */

const SOURCES: [RegExp, { en: string; cs: string }][] = [
  [/blu-?ray|bd-?rip|br-?rip|bd-?remux|\bremux\b|\bbd\d*\b|uhd/i, { en: 'Blu-ray', cs: 'Blu-ray' }],
  [/web-?dl|web-?rip|\bweb\b|\b(amzn|nf|dsnp|hmax|atvp|hulu|pcok|pmtp)\b/i, { en: 'Web', cs: 'Web' }],
  [/dvd/i, { en: 'DVD', cs: 'DVD' }],
  [/hdtv|pdtv|sdtv|\btv-?rip\b/i, { en: 'TV broadcast', cs: 'TV vysílání' }],
]

const EDITIONS: [RegExp, { en: string; cs: string }][] = [
  [/director'?s[ ._-]?cut|\bdc\b/i, { en: "Director's Cut", cs: 'Režisérská verze' }],
  [/extended/i, { en: 'Extended', cs: 'Prodloužená verze' }],
  [/unrated|uncut/i, { en: 'Unrated', cs: 'Nesestříhaná verze' }],
  [/\bimax\b/i, { en: 'IMAX', cs: 'IMAX' }],
]

export function releaseLabel(release: string, locale: 'en' | 'cs' = 'en'): string | null {
  const source = SOURCES.find(([pattern]) => pattern.test(release))?.[1][locale]
  const edition = EDITIONS.find(([pattern]) => pattern.test(release))?.[1][locale]
  const parts = [source, edition].filter(Boolean)
  return parts.length ? parts.join(' · ') : null
}
