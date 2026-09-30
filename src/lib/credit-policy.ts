export type TranslationModel = 'standard' | 'premium'

export const SUBTITLES_PER_CREDIT_BATCH = 20

export const CREDIT_RATES: Record<TranslationModel, number> = {
  standard: 0.5,
  premium: 1.5,
}

export function getTranslationCredits(
  subtitleCount: number,
  model: TranslationModel = 'standard'
): number {
  const batches = Math.max(1, Math.ceil(Math.max(0, subtitleCount) / SUBTITLES_PER_CREDIT_BATCH))
  return batches * CREDIT_RATES[model]
}

export function getLinesForCredits(credits: number, model: TranslationModel): number {
  if (!Number.isFinite(credits) || credits <= 0) return 0
  return Math.floor(credits / CREDIT_RATES[model]) * SUBTITLES_PER_CREDIT_BATCH
}

// Typical subtitle file sizes, used to express credits as something people buy:
// a feature film is ~1,000 lines (median of real jobs), a TV episode ~500.
export const TYPICAL_MOVIE_LINES = 1000
export const TYPICAL_EPISODE_LINES = 500

/** How many files of `lines` subtitles the given credits translate. */
export function getFilesForCredits(credits: number, model: TranslationModel, lines: number): number {
  const perFile = getTranslationCredits(lines, model)
  return perFile > 0 ? Math.floor(credits / perFile) : 0
}

export const FREE_TRANSLATION_COPY = {
  en: 'Your first subtitle file is free. No card required.',
  cs: 'První soubor titulků přeložíme zdarma. Bez platební karty.',
} as const
