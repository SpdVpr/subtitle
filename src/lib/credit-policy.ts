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

export const FREE_TRANSLATION_COPY = {
  en: 'Your first subtitle file is free. No card required.',
  cs: 'První soubor titulků přeložíme zdarma. Bez platební karty.',
} as const
