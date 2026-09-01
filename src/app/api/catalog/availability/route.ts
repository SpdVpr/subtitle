import { NextRequest, NextResponse } from 'next/server'
import { fetchCatalogLanguageAvailability, getCatalogSeed } from '@/lib/subtitle-catalog'
import { toOpenSubtitlesLanguageCodes } from '@/lib/subtitle-catalog-languages'
import { SUPPORTED_LANGUAGES } from '@/types/subtitle'

// Live "is this language available for this title?" check used by the catalog
// language finder. Inputs are restricted to catalog titles and translator
// languages, and each OpenSubtitles lookup is cached for six hours.

const CACHE_HEADERS = { 'Cache-Control': 'public, s-maxage=21600, stale-while-revalidate=86400' }

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const type = searchParams.get('type')
  const slug = (searchParams.get('slug') || '').trim()
  const language = (searchParams.get('language') || '').trim().toLowerCase()

  if (type !== 'movie' && type !== 'tv') {
    return NextResponse.json({ error: 'type must be movie or tv' }, { status: 400 })
  }
  const media = getCatalogSeed(type, slug)
  if (!media) {
    return NextResponse.json({ error: 'Unknown catalog title' }, { status: 404 })
  }
  if (!SUPPORTED_LANGUAGES.some((item) => item.code === language)) {
    return NextResponse.json({ error: 'Unsupported language' }, { status: 400 })
  }

  const osCodes = toOpenSubtitlesLanguageCodes(language)
  if (!osCodes.length) {
    return NextResponse.json(
      { language, listed: false, fetched: true, total: 0, humanCount: 0, machineOnly: false, best: null },
      { headers: CACHE_HEADERS },
    )
  }

  const availability = await fetchCatalogLanguageAvailability(media, osCodes)
  const best = availability.best
    ? { sourceUrl: availability.best.sourceUrl, release: availability.best.release, trusted: availability.best.trusted, language: availability.best.language }
    : null

  return NextResponse.json(
    { language, listed: true, fetched: availability.fetched, total: availability.total, humanCount: availability.humanCount, machineOnly: availability.machineOnly, best },
    { headers: availability.fetched ? CACHE_HEADERS : { 'Cache-Control': 'no-store' } },
  )
}
