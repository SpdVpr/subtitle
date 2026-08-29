import { NextRequest, NextResponse } from 'next/server'
import { TranslationJobService } from '@/lib/database-admin'
import { groupSubtitlesByTitle } from '@/lib/subtitle-name-cleaner'
import rateLimiter, { RATE_LIMITS, createRateLimitResponse } from '@/lib/rate-limiter'

export interface TranslationStatistics {
  period: 'week' | 'month'
  startDate: string
  endDate: string
  data: {
    // Top translated subtitles (cleaned names) - period-based
    topSubtitles: Array<{
      title: string
      count: number
      examples: string[] // Original filenames as examples
    }>

    // Top target languages - ALL TIME statistics
    topLanguages: Array<{
      language: string
      languageCode: string
      count: number
      percentage: number
    }>

    // Summary statistics
    totalTranslations: number
    uniqueTitles: number
    uniqueLanguages: number

    // Daily breakdown for charts
    dailyBreakdown: Array<{
      date: string
      count: number
    }>
  }
}

// Language code to name mapping
const LANGUAGE_NAMES: Record<string, string> = {
  'cs': 'Czech',
  'en': 'English',
  'de': 'German',
  'fr': 'French',
  'es': 'Spanish',
  'it': 'Italian',
  'pt': 'Portuguese',
  'ru': 'Russian',
  'zh': 'Chinese',
  'ja': 'Japanese',
  'ko': 'Korean',
  'pl': 'Polish',
  'nl': 'Dutch',
  'sv': 'Swedish',
  'no': 'Norwegian',
  'da': 'Danish',
  'fi': 'Finnish',
  'hu': 'Hungarian',
  'ro': 'Romanian',
  'bg': 'Bulgarian',
  'hr': 'Croatian',
  'sk': 'Slovak',
  'sl': 'Slovenian',
  'et': 'Estonian',
  'lv': 'Latvian',
  'lt': 'Lithuanian',
  'uk': 'Ukrainian',
  'be': 'Belarusian',
  'mk': 'Macedonian',
  'sr': 'Serbian',
  'bs': 'Bosnian',
  'me': 'Montenegrin',
  'al': 'Albanian',
  'tr': 'Turkish',
  'ar': 'Arabic',
  'he': 'Hebrew',
  'hi': 'Hindi',
  'th': 'Thai',
  'vi': 'Vietnamese',
  'id': 'Indonesian',
  'ms': 'Malay',
  'tl': 'Filipino'
}

// These are site-wide aggregates that change slowly, but the query behind them
// reads 1000 documents. Uncached, every crawler hit on /statistics turned into
// 1000 Firestore reads; on 2026-08-28 that added up to ~7.3M reads in one day.
const STATS_TTL_MS = 60 * 60 * 1000 // 1 hour
const statsCache = new Map<'week' | 'month', { expiresAt: number, payload: TranslationStatistics }>()

// The CDN absorbs the repeat traffic so most requests never reach a function
// instance; the in-memory map covers the ones that do.
const CACHE_HEADERS = {
  'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=86400'
}

function cacheAndRespond(period: 'week' | 'month', payload: TranslationStatistics) {
  statsCache.set(period, { expiresAt: Date.now() + STATS_TTL_MS, payload })
  return NextResponse.json(payload, { headers: CACHE_HEADERS })
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    // Collapse anything unrecognised to 'week': a varying ?period= value must not
    // be able to miss the cache and reach Firestore on every request.
    const period: 'week' | 'month' = searchParams.get('period') === 'month' ? 'month' : 'week'

    const ipAddress =
      req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
      req.headers.get('x-real-ip') ||
      'unknown'
    const rateLimitKey = `statistics:${ipAddress}`

    if (rateLimiter.isRateLimited(rateLimitKey, RATE_LIMITS.API.maxRequests, RATE_LIMITS.API.windowMs)) {
      return NextResponse.json(
        createRateLimitResponse(rateLimiter.getResetTime(rateLimitKey)),
        { status: 429 }
      )
    }

    const cached = statsCache.get(period)
    if (cached && cached.expiresAt > Date.now()) {
      return NextResponse.json(cached.payload, { headers: CACHE_HEADERS })
    }
    
    console.log('📊 Statistics API called with period:', period)
    
    // Calculate date range
    const now = new Date()
    const daysBack = period === 'week' ? 7 : 30
    const startDate = new Date(now.getTime() - daysBack * 24 * 60 * 60 * 1000)
    
    const startDateStr = startDate.toISOString().split('T')[0]
    const endDateStr = now.toISOString().split('T')[0]
    
    console.log('📅 Date range:', { startDateStr, endDateStr, daysBack })
    
    // Get all translation jobs from the period
    // Note: We'll get more jobs than needed and filter client-side since Firestore queries are limited
    const allJobs = await TranslationJobService.getJobsForStatistics(1000) // Get last 1000 jobs
    
    console.log('📋 Total jobs retrieved:', allJobs.length)
    
    // Filter jobs by date range and completed status
    const filteredJobs = allJobs.filter(job => {
      if (job.status !== 'completed') return false
      
      const jobDate = job.completedAt || job.createdAt
      if (!jobDate) return false
      
      // Convert Firestore timestamp to Date
      const date = jobDate instanceof Date ? jobDate : new Date(jobDate.seconds * 1000)
      return date >= startDate && date <= now
    })
    
    console.log('✅ Filtered jobs for period:', filteredJobs.length)
    
    if (filteredJobs.length === 0) {
      console.log('⚠️ No translation jobs found for the specified period')
      return cacheAndRespond(period, {
        period,
        startDate: startDateStr,
        endDate: endDateStr,
        data: {
          topSubtitles: [],
          topLanguages: [],
          totalTranslations: 0,
          uniqueTitles: 0,
          uniqueLanguages: 0,
          dailyBreakdown: []
        }
      })
    }
    
    // Group subtitles by cleaned title
    const subtitleData = filteredJobs.map(job => ({
      originalFileName: job.originalFileName,
      count: 1
    }))
    
    const groupedSubtitles = groupSubtitlesByTitle(subtitleData)
    const topSubtitles = groupedSubtitles.slice(0, 6) // Top 6
    
    console.log('🎬 Top subtitles:', topSubtitles.slice(0, 3))

    // Analyze target languages - ALL TIME (not filtered by period)
    const allTimeLanguageCount = new Map<string, number>()

    // Use ALL completed jobs for language statistics, not just filtered ones
    const allCompletedJobs = allJobs.filter(job => job.status === 'completed')

    for (const job of allCompletedJobs) {
      const lang = job.targetLanguage
      allTimeLanguageCount.set(lang, (allTimeLanguageCount.get(lang) || 0) + 1)
    }

    const totalAllTimeTranslations = allCompletedJobs.length
    const topLanguages = Array.from(allTimeLanguageCount.entries())
      .map(([languageCode, count]) => ({
        language: LANGUAGE_NAMES[languageCode] || languageCode.toUpperCase(),
        languageCode,
        count,
        percentage: Math.round((count / totalAllTimeTranslations) * 100)
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 6) // Top 6 languages

    console.log('🌍 Top languages (all time):', topLanguages.slice(0, 3))
    
    // Create daily breakdown for charts
    const dailyCount = new Map<string, number>()
    
    for (const job of filteredJobs) {
      const jobDate = job.completedAt || job.createdAt
      if (!jobDate) continue
      
      const date = jobDate instanceof Date ? jobDate : new Date(jobDate.seconds * 1000)
      const dateStr = date.toISOString().split('T')[0]
      
      dailyCount.set(dateStr, (dailyCount.get(dateStr) || 0) + 1)
    }
    
    // Fill in missing dates with 0 counts
    const dailyBreakdown = []
    for (let d = new Date(startDate); d <= now; d.setDate(d.getDate() + 1)) {
      const dateStr = d.toISOString().split('T')[0]
      dailyBreakdown.push({
        date: dateStr,
        count: dailyCount.get(dateStr) || 0
      })
    }
    
    const totalTranslations = filteredJobs.length // Period-based translations

    const statistics: TranslationStatistics = {
      period,
      startDate: startDateStr,
      endDate: endDateStr,
      data: {
        topSubtitles,
        topLanguages,
        totalTranslations,
        uniqueTitles: groupedSubtitles.length,
        uniqueLanguages: allTimeLanguageCount.size, // All-time unique languages
        dailyBreakdown
      }
    }
    
    console.log('📊 Statistics summary:', {
      totalTranslations: statistics.data.totalTranslations,
      uniqueTitles: statistics.data.uniqueTitles,
      uniqueLanguages: statistics.data.uniqueLanguages,
      topSubtitlesCount: statistics.data.topSubtitles.length,
      topLanguagesCount: statistics.data.topLanguages.length
    })
    
    return cacheAndRespond(period, statistics)
    
  } catch (error) {
    console.error('❌ Statistics API Error:', error)
    return NextResponse.json(
      { 
        error: 'Failed to fetch statistics', 
        details: error instanceof Error ? error.message : String(error) 
      },
      { status: 500 }
    )
  }
}
