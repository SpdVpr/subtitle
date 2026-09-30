'use client'

import { useState, useEffect, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Search, Download, ExternalLink, Calendar, Star, Users, Clock, ChevronRight, ChevronDown, Film, Tv, Image } from 'lucide-react'
import { toast } from 'sonner'
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible'
import { analytics } from '@/lib/analytics'
import { SUPPORTED_LANGUAGES } from '@/types/subtitle'
import {
  POPULAR_TARGET_LANGUAGES,
  detectPreferredLanguage,
  fromOpenSubtitlesLanguageCode,
  toOpenSubtitlesLanguageCodes,
} from '@/lib/subtitle-catalog-languages'

interface SubtitleFile {
  file_id: number
  cd_number: number
  file_name: string | null
}

interface SubtitleResult {
  id: string
  attributes: {
    subtitle_id: string
    language: string
    download_count: number
    new_download_count: number
    hearing_impaired: boolean
    hd: boolean
    fps: number
    votes: number
    ratings: number
    from_trusted: boolean
    foreign_parts_only: boolean
    upload_date: string
    ai_translated: boolean
    machine_translated: boolean
    release: string
    comments: string
    uploader: {
      uploader_id: number
      name: string
      rank: string
    }
    feature_details: {
      feature_id: number
      feature_type: string
      year: number
      title: string
      movie_name: string
      imdb_id: string
      tmdb_id: number
    }
    url: string
    download_url: string
    related_links?: Array<{
      label: string
      url: string
      img_url: string
    }>
    files: SubtitleFile[]
  }
}

interface SearchResponse {
  total_pages: number
  total_count: number
  per_page: number
  page: number
  data: SubtitleResult[]
}

// Grouped data structures
interface GroupedSubtitle extends SubtitleResult {
  season_number?: number
  episode_number?: number
}

interface Episode {
  episode_number: number
  subtitles: GroupedSubtitle[]
}

interface Season {
  season_number: number
  episodes: Episode[]
}

interface Show {
  title: string
  year: number
  imdb_id: string
  tmdb_id: number
  feature_type: string
  seasons: Season[]
  movie_subtitles?: GroupedSubtitle[] // For movies
  subtitles?: GroupedSubtitle[] // Flat TV list after episode details load
  total_subtitles?: number
}

// Enhanced TMDB image component with real API integration
const TMDBImage = ({ tmdbId, type, title, year, className, openSubtitlesImageUrl }: {
  tmdbId: number,
  type: 'movie' | 'tv',
  title: string,
  year?: number,
  className?: string,
  openSubtitlesImageUrl?: string
}) => {
  const [imageUrl, setImageUrl] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)

  useEffect(() => {
    const loadImage = async () => {
      // First, try to use OpenSubtitles image if available
      if (openSubtitlesImageUrl) {
        console.log('Using OpenSubtitles image:', openSubtitlesImageUrl)
        setImageUrl(openSubtitlesImageUrl)
        setLoading(false)
        return
      }

      // Fallback to TMDB if no OpenSubtitles image and tmdbId is available
      if (!tmdbId) {
        setLoading(false)
        setError(true)
        return
      }

      try {
        // Use TMDB API to get poster image
        const response = await fetch(`/api/tmdb/${type}/${tmdbId}`)
        if (response.ok) {
          const data = await response.json()
          if (data.poster_path) {
            setImageUrl(`https://image.tmdb.org/t/p/w300${data.poster_path}`)
          } else {
            setError(true)
          }
        } else {
          console.warn('TMDB API failed:', response.status, response.statusText)
          setError(true)
        }
      } catch (err) {
        console.warn('Failed to fetch TMDB image:', err)
        setError(true)
      } finally {
        setLoading(false)
      }
    }

    loadImage()
  }, [tmdbId, type, openSubtitlesImageUrl])

  if (loading) {
    return (
      <div className={`bg-gray-200 dark:bg-muted rounded-lg flex items-center justify-center animate-pulse ${className}`}>
        <div className="text-center p-2">
          <div className="h-8 w-8 bg-gray-300 dark:bg-muted-foreground/20 rounded mx-auto mb-1"></div>
          <div className="h-2 w-12 bg-gray-300 dark:bg-muted-foreground/20 rounded mb-1"></div>
          <div className="h-2 w-16 bg-gray-300 dark:bg-muted-foreground/20 rounded"></div>
        </div>
      </div>
    )
  }

  if (imageUrl && !error) {
    return (
      <div className={`rounded-lg overflow-hidden shadow-md ${className}`}>
        <img
          src={imageUrl}
          alt={`${title} poster`}
          className="w-full h-full object-cover"
          onError={() => setError(true)}
        />
      </div>
    )
  }

  // Fallback placeholder with better design
  return (
    <div className={`bg-gradient-to-br from-slate-100 to-slate-200 dark:from-accent dark:to-muted rounded-lg flex items-center justify-center border border-slate-300 dark:border-border ${className}`}>
      <div className="text-center p-2">
        {type === 'movie' ? (
          <Film className="h-6 w-6 text-slate-500 dark:text-muted-foreground mx-auto mb-1" />
        ) : (
          <Tv className="h-6 w-6 text-slate-500 dark:text-muted-foreground mx-auto mb-1" />
        )}
        <div className="text-xs text-slate-600 dark:text-foreground font-medium">{type === 'movie' ? 'Movie' : 'TV Series'}</div>
        <div className="text-xs text-slate-500 dark:text-muted-foreground truncate max-w-[70px] leading-tight" title={title}>
          {title}
        </div>
        {year && (
          <div className="text-xs text-slate-400 dark:text-muted-foreground">({year})</div>
        )}
      </div>
    </div>
  )
}

// Shared with the catalog language finder: "the language I watch in".
const LANGUAGE_STORAGE_KEY = 'subtitlebot.catalog.language'

// Every translation language that OpenSubtitles also lists, popular ones first.
const SEARCHABLE_LANGUAGES = SUPPORTED_LANGUAGES.filter((lang) => toOpenSubtitlesLanguageCodes(lang.code).length > 0)
const SEARCHABLE_CODES = new Set(SEARCHABLE_LANGUAGES.map((lang) => lang.code))
const LANGUAGE_BY_CODE = new Map(SEARCHABLE_LANGUAGES.map((lang) => [lang.code, lang]))
const POPULAR_CODES = new Set<string>(POPULAR_TARGET_LANGUAGES)
const LANGUAGE_OPTIONS = [
  ...POPULAR_TARGET_LANGUAGES.filter((code) => SEARCHABLE_CODES.has(code)).map((code) => LANGUAGE_BY_CODE.get(code)!),
  ...SEARCHABLE_LANGUAGES.filter((lang) => !POPULAR_CODES.has(lang.code)).sort((a, b) => a.name.localeCompare(b.name)),
]

const osLanguages = (code: string) => toOpenSubtitlesLanguageCodes(code).join(',') || code

// OpenSubtitles search is fuzzy and nearly always returns something, so "missing" means
// no result title contains every word of the query (years ignored, punctuation-insensitive).
const normalizeTitle = (value: string) => value.toLowerCase().replace(/[\s\-_:;.,'"’!?&()[\]]+/g, '')
const titleMatchesQuery = (title: string, searchQuery: string) => {
  const words = searchQuery
    .split(/\s+/)
    .filter((word) => word && !/^(19|20)\d{2}$/.test(word))
    .map(normalizeTitle)
    .filter(Boolean)
  const normalized = normalizeTitle(title)
  return words.length > 0 && words.every((word) => normalized.includes(word))
}

const TEXTS = {
  en: {
    enterQuery: 'Please enter a movie or TV series name',
    searchError: 'Search error',
    noResults: 'No subtitles found',
    found: (n: number) => `Found ${n} ${n === 1 ? 'show/movie' : 'shows/movies'}`,
    subtitleCount: (n: number) => `${n} ${n === 1 ? 'subtitle' : 'subtitles'}`,
    season: (n: number) => `Season ${n}`,
    episodeCount: (n: number) => `${n} ${n === 1 ? 'episode' : 'episodes'}`,
    episode: (n: number) => `Episode ${n}`,
    loadingEpisodes: 'Loading episodes...',
    translate: 'Translate • first file free',
    translateTo: (lang: string) => `Translate to ${lang} • first file free`,
    missingTitle: (lang: string, q: string) => `No ${lang} subtitles for “${q}” yet`,
    missingBody: (lang: string) => `Download the English subtitles and our AI translates them to ${lang} in about a minute, with the timing kept. Your first file is free.`,
    showEnglish: 'Show English subtitles',
    translateNow: (lang: string) => `Translate to ${lang} free`,
    needLanguage: (lang: string) => `Need ${lang}? Download any English file below and translate it to ${lang}. Your first file is free.`,
    redirecting: 'Redirecting to OpenSubtitles for subtitle download',
    title: 'Search Subtitles',
    description: 'Search subtitles grouped by TV series and movies for better organization',
    queryPlaceholder: 'Movie or TV series name...',
    typeAll: 'All',
    typeMovie: 'Movie',
    typeSeries: 'TV Series',
    yearPlaceholder: 'Year (optional)',
    includeAI: 'Include AI/Machine translated',
    trustedOnly: 'Trusted sources only',
    search: 'Search',
    searching: 'Searching...',
    movieLabel: '🎬 Movie',
    seriesLabel: '📺 TV Series',
    trusted: 'Trusted',
    hearingImpaired: 'Hearing Impaired',
    aiTranslation: 'AI Translation',
    release: 'Release',
    download: 'Download',
    downloads: (n: number) => `${n.toLocaleString('en-US')} downloads`,
  },
  cs: {
    enterQuery: 'Zadejte název filmu nebo seriálu',
    searchError: 'Chyba při vyhledávání',
    noResults: 'Žádné titulky nenalezeny',
    found: (n: number) => `Nalezeno ${n} ${n === 1 ? 'seriál/film' : 'seriálů/filmů'}`,
    subtitleCount: (n: number) => `${n} ${n === 1 ? 'titulek' : n >= 2 && n <= 4 ? 'titulky' : 'titulků'}`,
    season: (n: number) => `Série ${n}`,
    episodeCount: (n: number) => `${n} ${n === 1 ? 'díl' : n >= 2 && n <= 4 ? 'díly' : 'dílů'}`,
    episode: (n: number) => `Díl ${n}`,
    loadingEpisodes: 'Načítání epizod...',
    translate: 'Přeložit • první soubor zdarma',
    translateTo: (lang: string) => `Přeložit do: ${lang} • zdarma`,
    missingTitle: (lang: string, q: string) => `Titulky „${q}“ zatím nejsou dostupné (${lang})`,
    missingBody: (lang: string) => `Stáhněte anglické titulky a naše AI je zhruba za minutu přeloží do cílového jazyka (${lang}) se zachovaným časováním. První soubor je zdarma.`,
    showEnglish: 'Zobrazit anglické titulky',
    translateNow: (lang: string) => `Přeložit do: ${lang} zdarma`,
    needLanguage: (lang: string) => `Chcete titulky v jiném jazyce (${lang})? Stáhněte kterýkoli anglický soubor níže a přeložte ho. První soubor je zdarma.`,
    redirecting: 'Přesměrováváme vás na OpenSubtitles ke stažení titulků',
    title: 'Hledat titulky',
    description: 'Výsledky seskupené podle seriálů a filmů',
    queryPlaceholder: 'Název filmu nebo seriálu...',
    typeAll: 'Vše',
    typeMovie: 'Film',
    typeSeries: 'Seriál',
    yearPlaceholder: 'Rok (nepovinné)',
    includeAI: 'Včetně AI/strojových překladů',
    trustedOnly: 'Jen důvěryhodné zdroje',
    search: 'Hledat',
    searching: 'Hledám...',
    movieLabel: '🎬 Film',
    seriesLabel: '📺 Seriál',
    trusted: 'Ověřené',
    hearingImpaired: 'Pro neslyšící',
    aiTranslation: 'AI překlad',
    release: 'Release',
    download: 'Stáhnout',
    downloads: (n: number) => `${n.toLocaleString('cs-CZ')} stažení`,
  },
}

export function HierarchicalSubtitleSearch({ locale = 'en' }: { locale?: 'en' | 'cs' }) {
  const isCs = locale === 'cs'
  const t = TEXTS[locale]
  const langPrefix = isCs ? '/cs' : ''

  const [query, setQuery] = useState('')
  const [language, setLanguage] = useState('en')
  // The language the visitor actually wants; stays set while they browse English files to translate.
  const [wantedLanguage, setWantedLanguage] = useState<string | null>(null)
  const [lastSearch, setLastSearch] = useState<{ query: string; language: string; found: number } | null>(null)
  const [type, setType] = useState<'movie' | 'episode' | 'all'>('all')
  const [year, setYear] = useState('')
  const [shows, setShows] = useState<Show[]>([])
  const [loading, setLoading] = useState(false)
  const [totalCount, setTotalCount] = useState(0)
  const [expandedShows, setExpandedShows] = useState<Set<string>>(new Set())
  const [expandedSeasons, setExpandedSeasons] = useState<Set<string>>(new Set())
  const [showEpisodes, setShowEpisodes] = useState<Map<string, Show>>(new Map()) // Store detailed episode data
  const [includeAI, setIncludeAI] = useState(false)
  const [trustedOnly, setTrustedOnly] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const [hasMore, setHasMore] = useState(false)
  const autoSearchDone = useRef(false)

  console.log('🔧 Component state:', { query, loading, shows: shows.length, totalCount })

  // Helper function to extract season/episode from release string
  const extractSeasonEpisode = (release: string): { season?: number, episode?: number } => {
    // Try to match patterns like S01E01, s1e1, Season.1.Episode.1, etc.
    const patterns = [
      /[Ss](\d+)[Ee](\d+)/,
      /Season\.?(\d+)\.?Episode\.?(\d+)/i,
      /(\d+)x(\d+)/
    ]

    for (const pattern of patterns) {
      const match = release.match(pattern)
      if (match) {
        return {
          season: parseInt(match[1]),
          episode: parseInt(match[2])
        }
      }
    }
    return {}
  }

  // Helper function to detect if a subtitle is actually a TV series episode
  const isActuallyTVSeries = (subtitle: SubtitleResult): boolean => {
    const release = subtitle.attributes.release
    const title = subtitle.attributes.feature_details.title
    const movieName = subtitle.attributes.feature_details.movie_name

    // Check for season/episode patterns in release name
    const hasSeasonEpisode = /S\d+E\d+/i.test(release) || /Season\s+\d+/i.test(release) || /Episode\s+\d+/i.test(release)

    // Check for TV series indicators in title or movie_name
    const hasTVIndicators = /\s(S\d+E\d+|\d+x\d+)\s/i.test(title) ||
                           /\s(S\d+E\d+|\d+x\d+)\s/i.test(movieName) ||
                           title.includes('"') || movieName.includes('"') // Quotes often indicate TV episodes

    const result = hasSeasonEpisode || hasTVIndicators

    // Debug logging
    if (result) {
      console.log('🔍 TV Series detected:', {
        title,
        movieName,
        release,
        hasSeasonEpisode,
        hasTVIndicators,
        result
      })
    }

    return result
  }

  // Extract base series name (remove episode info)
  const extractSeriesName = (title: string, movieName: string): string => {
    console.log('🔍 Extracting series name from:', { title, movieName })

    // Try to extract series name from movie_name first (often more accurate)
    if (movieName.includes('"')) {
      // Pattern: "2025 - \"Dexter: Original Sin\" Blood Drive"
      const match = movieName.match(/^(\d+\s*-\s*)?[""]([^"""]+)[""]/)
      if (match && match[2]) {
        const seriesName = match[2].trim()
        console.log('✅ Extracted from movie_name:', seriesName)
        return seriesName
      }
    }

    // Fallback to title processing
    const processed = title
      .replace(/^"([^"]+)".*/, '$1') // Remove quotes and episode title
      .replace(/\s+S\d+E\d+.*$/i, '') // Remove "S01E01" and everything after
      .replace(/\s+Season\s+\d+.*$/i, '') // Remove "Season 1" and everything after
      .replace(/\s+Episode\s+\d+.*$/i, '') // Remove "Episode 1" and everything after
      .replace(/\s+\d+x\d+.*$/i, '') // Remove "1x01" and everything after
      .replace(/\s+\(\d{4}\)$/, '') // Remove year in parentheses at the end
      .trim()

    console.log('⚠️ Fallback to title processing:', processed)
    return processed
  }

  // Group subtitles by show only (don't group by episodes yet)
  const groupSubtitles = (subtitles: SubtitleResult[], searchQuery: string = ''): Show[] => {
    console.log('🔍 Grouping subtitles:', subtitles.length, 'items')
    const showsMap = new Map<string, Show>()

    subtitles.forEach(subtitle => {
      const { feature_details } = subtitle.attributes

      // Determine if this is actually a TV series episode despite being marked as "Movie"
      const isActuallyTV = feature_details.feature_type === 'Episode' || isActuallyTVSeries(subtitle)

      // For TV series, extract base series name
      let displayTitle = feature_details.title
      let showKey = `${feature_details.imdb_id}-${feature_details.title}-${feature_details.year}`

      if (isActuallyTV) {
        // Use parent_title if available (for proper series grouping), otherwise extract from title
        displayTitle = (feature_details as any).parent_title || extractSeriesName(feature_details.title, feature_details.movie_name)
        // Use parent_imdb_id if available for better grouping
        const parentId = (feature_details as any).parent_imdb_id || feature_details.imdb_id
        showKey = `series-${parentId}-${displayTitle}`
        console.log('📺 TV Series detected:', feature_details.title, '→', displayTitle, 'key:', showKey)
      }

      if (!showsMap.has(showKey)) {
        // For episodes, prefer parent IDs so that follow-up fetches cover the whole series
        const seriesImdbId: string = String((feature_details as any).parent_imdb_id || feature_details.imdb_id)
        const seriesTmdbId: number = (feature_details as any).parent_tmdb_id || feature_details.tmdb_id

        showsMap.set(showKey, {
          title: displayTitle,
          year: feature_details.year,
          imdb_id: isActuallyTV ? seriesImdbId : String(feature_details.imdb_id),
          tmdb_id: isActuallyTV ? seriesTmdbId : feature_details.tmdb_id,
          feature_type: isActuallyTV ? 'Episode' : feature_details.feature_type,
          seasons: [],
          movie_subtitles: !isActuallyTV ? [] : undefined,
          total_subtitles: 0 // Add counter for total subtitles
        })
      }

      const show = showsMap.get(showKey)!
      show.total_subtitles = (show.total_subtitles || 0) + 1

      if (!isActuallyTV) {
        // For movies, store the subtitles
        if (!show.movie_subtitles) show.movie_subtitles = []
        show.movie_subtitles.push(subtitle as GroupedSubtitle)
      }
      // For TV series, we'll load episodes on demand when user clicks on the show
    })

    // Sort shows by relevance and popularity
    const shows = Array.from(showsMap.values())
    console.log('📊 Before sorting:', shows.map(s => `${s.title} (${s.feature_type}, ${s.total_subtitles} subs)`))

    const sorted = shows.sort((a, b) => {
      // 1. Prioritize exact title matches (case insensitive)
      const queryLower = searchQuery.toLowerCase()
      const aExactMatch = a.title.toLowerCase().includes(queryLower)
      const bExactMatch = b.title.toLowerCase().includes(queryLower)

      if (aExactMatch && !bExactMatch) return -1
      if (!aExactMatch && bExactMatch) return 1

      // 2. Prioritize TV series over movies when searching for series
      if (a.feature_type === 'Episode' && b.feature_type === 'Movie') return -1
      if (a.feature_type === 'Movie' && b.feature_type === 'Episode') return 1

      // 3. Sort by total number of subtitles (more popular shows first)
      const subtitleDiff = (b.total_subtitles || 0) - (a.total_subtitles || 0)
      if (subtitleDiff !== 0) return subtitleDiff

      // 4. Sort by year (newer first)
      return (b.year || 0) - (a.year || 0)
    })

    console.log('📊 After sorting:', sorted.map(s => `${s.title} (${s.feature_type}, ${s.total_subtitles} subs)`))
    return sorted
  }

  // Load detailed episodes for a specific show
  const loadShowEpisodes = async (show: Show) => {
    // Use the same key format as in groupSubtitles
    const showKey = show.feature_type === 'Episode'
      ? `series-${show.imdb_id}-${show.title}`
      : `${show.imdb_id}-${show.title}-${show.year}`

    // If already loaded, don't reload
    if (showEpisodes.has(showKey)) {
      return
    }

    try {
      // Search for all episodes of this specific show
      const params = new URLSearchParams({
        languages: osLanguages(lastSearch?.language || language),
        per_page: '100',
        type: 'episode',
        parent_imdb_id: show.imdb_id?.toString() || ''
      })

      const response = await fetch(`/api/opensubtitles/search?${params}`)
      if (!response.ok) throw new Error('Failed to fetch episodes')

      const data = await response.json()

      // Group the detailed results by season/episode
      const detailedShow = groupDetailedSubtitles(data.data, show)

      setShowEpisodes(prev => new Map(prev).set(showKey, detailedShow))
    } catch (error) {
      console.error('Error loading show episodes:', error)
    }
  }

  // Group subtitles with full season/episode structure
  const groupDetailedSubtitles = (subtitles: SubtitleResult[], show: Show): Show => {
    const seasonsMap = new Map<number, Season>()

    subtitles.forEach(subtitle => {
      const fd = subtitle.attributes.feature_details as any
      // Prefer explicit season/episode from feature_details, fallback to parsing the release name
      const parsed = extractSeasonEpisode(subtitle.attributes.release)
      const seasonFromApi = fd?.season_number as number | undefined
      const episodeFromApi = fd?.episode_number as number | undefined
      const season = seasonFromApi ?? parsed.season
      const episode = episodeFromApi ?? parsed.episode

      const groupedSubtitle: GroupedSubtitle = {
        ...subtitle,
        season_number: season,
        episode_number: episode
      }

      const seasonNumber = season || 1
      const episodeNumber = episode || 1

      if (!seasonsMap.has(seasonNumber)) {
        seasonsMap.set(seasonNumber, { season_number: seasonNumber, episodes: [] })
      }

      const seasonObj = seasonsMap.get(seasonNumber)!
      let episodeObj = seasonObj.episodes.find(e => e.episode_number === episodeNumber)

      if (!episodeObj) {
        episodeObj = { episode_number: episodeNumber, subtitles: [] }
        seasonObj.episodes.push(episodeObj)
      }

      episodeObj.subtitles.push(groupedSubtitle)
    })

    // Sort seasons and episodes
    const seasons = Array.from(seasonsMap.values())
    seasons.sort((a, b) => a.season_number - b.season_number)
    seasons.forEach(season => {
      season.episodes.sort((a, b) => a.episode_number - b.episode_number)
    })

    return {
      ...show,
      seasons,
      subtitles: subtitles as GroupedSubtitle[],
    }
  }

  const handleSearch = async (queryOverride?: string, languageOverride?: string) => {
    const effectiveQuery = typeof queryOverride === 'string' ? queryOverride.trim() : query.trim()
    const searchLanguage = languageOverride || language
    if (!effectiveQuery) {
      toast.error(t.enterQuery)
      return
    }

    console.log('🔍 HierarchicalSubtitleSearch: Starting search for:', effectiveQuery)
    console.log('🎯 Current type value:', type)
    setLoading(true)
    setCurrentPage(1)

    try {
      const params = new URLSearchParams({
        query: effectiveQuery,
        languages: osLanguages(searchLanguage),
        per_page: '200', // Get more results for better coverage
      })

      // Add type filter only if specifically requested (not 'all')
      if (type && type !== 'all') {
        console.log('🎯 Adding type filter:', type)
        params.set('type', type)
      } else {
        console.log('🎯 Skipping type filter (type is "all" or empty)')
      }

      // Add additional filters
      if (year) params.set('year', year)
      if (trustedOnly) params.set('trusted_sources', 'only')
      if (!includeAI) {
        params.set('ai_translated', 'exclude')
        params.set('machine_translated', 'exclude')
      }

      // Add page parameter
      params.set('page', currentPage.toString())

      const response = await fetch(`/api/opensubtitles/search?${params}`)

      if (!response.ok) {
        const error = await response.json()
        const errorMessage = error.details || error.error || t.searchError
        throw new Error(errorMessage)
      }

      const data: SearchResponse = await response.json()
      analytics.subtitleSearchCompleted('opensubtitles', searchLanguage, data.total_count)
      console.log('📊 Raw API data:', data.data.length, 'subtitles')
      let groupedShows = groupSubtitles(data.data, effectiveQuery)
      console.log('🎭 Grouped shows:', groupedShows.length, 'shows')

      // If no TV series found and we're searching for "all", try specific episode search
      const hasEpisodes = groupedShows.some(show => show.feature_type === 'Episode')
      if (!hasEpisodes && type === 'all' && groupedShows.length < 5) {
        console.log('🔄 No TV series found, trying episode-specific search...')

        try {
          const episodeParams = new URLSearchParams({
            query: effectiveQuery,
            languages: osLanguages(searchLanguage),
            per_page: '100',
            type: 'episode'
          })

          if (year) episodeParams.set('year', year)
          if (trustedOnly) episodeParams.set('trusted_sources', 'only')
          if (!includeAI) {
            episodeParams.set('ai_translated', 'exclude')
            episodeParams.set('machine_translated', 'exclude')
          }

          const episodeResponse = await fetch(`/api/opensubtitles/search?${episodeParams}`)
          if (episodeResponse.ok) {
            const episodeData: SearchResponse = await episodeResponse.json()
            console.log('📺 Episode search data:', episodeData.data.length, 'episodes')

            if (episodeData.data.length > 0) {
              const episodeShows = groupSubtitles(episodeData.data, effectiveQuery)
              console.log('📺 Episode shows:', episodeShows.length, 'shows')

              // Merge with existing results, prioritizing TV series
              const allShows = [...episodeShows, ...groupedShows]
              groupedShows = allShows.filter((show, index, self) =>
                index === self.findIndex(s => s.imdb_id === show.imdb_id && s.title === show.title)
              )
            }
          }
        } catch (error) {
          console.error('Episode search failed:', error)
        }
      }

      setShows(groupedShows)
      setTotalCount(data.total_count)
      setLastSearch({
        query: effectiveQuery,
        language: searchLanguage,
        found: groupedShows.filter((show) => titleMatchesQuery(show.title, effectiveQuery)).length,
      })

      // Auto-expand first show if there's only one
      if (groupedShows.length === 1) {
        const firstShow = groupedShows[0]
        const showKey = firstShow.feature_type === 'Episode'
          ? `series-${firstShow.imdb_id}-${firstShow.title}`
          : `${firstShow.imdb_id}-${firstShow.title}-${firstShow.year}`

        setExpandedShows(prev => new Set(prev).add(showKey))
        // Load episodes for the first show
        setTimeout(() => loadShowEpisodes(firstShow), 100)
      }

      if (groupedShows.length === 0) {
        // Non-English misses get the translate card below instead of a dead-end toast.
        if (searchLanguage === 'en') toast.info(t.noResults)
      } else {
        toast.success(t.found(groupedShows.length))
      }
    } catch (error) {
      console.error('Search error:', error)
      toast.error(error instanceof Error ? error.message : t.searchError)
    } finally {
      setLoading(false)
    }
  }

  // Preselect the visitor's language: last choice, then the page locale, then the browser.
  useEffect(() => {
    let initial = ''
    try {
      initial = window.localStorage.getItem(LANGUAGE_STORAGE_KEY) || ''
    } catch {}
    if (!SEARCHABLE_CODES.has(initial)) {
      initial = (isCs ? 'cs' : '') || detectPreferredLanguage(navigator.languages || [navigator.language], SEARCHABLE_CODES) || 'en'
    }
    if (initial !== 'en') setWantedLanguage(initial)
    // A ?q= link (e.g. "Get English .srt" from the catalog) searches in English on mount.
    if (!new URLSearchParams(window.location.search).get('q')?.trim()) setLanguage(initial)
  }, [isCs])

  const handleLanguageChange = (code: string) => {
    setLanguage(code)
    setWantedLanguage(code === 'en' ? null : code)
    try {
      window.localStorage.setItem(LANGUAGE_STORAGE_KEY, code)
    } catch {}
  }

  const showEnglishInstead = () => {
    if (!lastSearch) return
    setLanguage('en')
    void handleSearch(lastSearch.query, 'en')
  }

  const translateHref = (sourceLanguage: string, title?: string, from = 'subtitle-search') => {
    const params = new URLSearchParams({ from, sourceLanguage })
    if (wantedLanguage && wantedLanguage !== sourceLanguage) params.set('targetLanguage', wantedLanguage)
    if (title) params.set('title', title)
    return `${langPrefix}/translate?${params.toString()}`
  }

  const translateLabel = (sourceLanguage: string) =>
    wantedLanguage && wantedLanguage !== sourceLanguage ? t.translateTo(getLanguageLabel(wantedLanguage)) : t.translate

  useEffect(() => {
    if (autoSearchDone.current) return
    const initialQuery = new URLSearchParams(window.location.search).get('q')?.trim()
    if (!initialQuery) return
    autoSearchDone.current = true
    setQuery(initialQuery)
    void handleSearch(initialQuery)
  }, [])

  const toggleShow = async (showKey: string, show: Show) => {
    const newExpanded = new Set(expandedShows)
    if (newExpanded.has(showKey)) {
      newExpanded.delete(showKey)
    } else {
      newExpanded.add(showKey)
      // Load episodes when expanding a show
      if (show.feature_type !== 'Movie') {
        await loadShowEpisodes(show)
      }
    }
    setExpandedShows(newExpanded)
  }

  const toggleSeason = (seasonKey: string) => {
    const newExpanded = new Set(expandedSeasons)
    if (newExpanded.has(seasonKey)) {
      newExpanded.delete(seasonKey)
    } else {
      newExpanded.add(seasonKey)
    }
    setExpandedSeasons(newExpanded)
  }

  const handleDownload = (subtitle: GroupedSubtitle) => {
    analytics.subtitleSourceOpened('opensubtitles')
    window.open(subtitle.attributes.download_url, '_blank')
    toast.info(t.redirecting)
  }



  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString(isCs ? 'cs-CZ' : 'en-US')
  }

  // Accepts SubtitleBot codes and OpenSubtitles codes (pt-br, zh-cn, ...).
  const getLanguageLabel = (code: string) => {
    const entry = LANGUAGE_BY_CODE.get(fromOpenSubtitlesLanguageCode(code).code)
    if (!entry) return code.toUpperCase()
    return isCs ? entry.nativeName : entry.name
  }

  const toAppLanguage = (osCode: string) => fromOpenSubtitlesLanguageCode(osCode).code

  // Helper function to get OpenSubtitles image URL from a group of subtitles
  const getOpenSubtitlesImageUrl = (subtitles: GroupedSubtitle[]): string | undefined => {
    for (const subtitle of subtitles) {
      if (subtitle.attributes.related_links && subtitle.attributes.related_links.length > 0) {
        const imgUrl = subtitle.attributes.related_links[0].img_url
        if (imgUrl) {
          return imgUrl
        }
      }
    }
    return undefined
  }

  return (
    <div className="space-y-6">
      {/* Search Form */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Search className="h-5 w-5" />
            <span>{t.title}</span>
          </CardTitle>
          <CardDescription>
            {t.description}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="lg:col-span-2">
              <Input
                placeholder={t.queryPlaceholder}
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              />
            </div>
            <Select value={language} onValueChange={handleLanguageChange}>
              <SelectTrigger aria-label="Subtitle language">
                <SelectValue placeholder="Language" />
              </SelectTrigger>
              <SelectContent>
                {LANGUAGE_OPTIONS.map(lang => (
                  <SelectItem key={lang.code} value={lang.code}>
                    {isCs ? lang.nativeName : lang.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={type} onValueChange={(value) => setType(value as 'movie' | 'episode' | 'all')}>
              <SelectTrigger aria-label="Movie or TV show">
                <SelectValue placeholder="Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t.typeAll}</SelectItem>
                <SelectItem value="movie">{t.typeMovie}</SelectItem>
                <SelectItem value="episode">{t.typeSeries}</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Advanced Search Options */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Input
              placeholder={t.yearPlaceholder}
              value={year}
              onChange={(e) => setYear(e.target.value)}
              className="max-w-32"
            />
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="includeAI"
                checked={includeAI}
                onChange={(e) => setIncludeAI(e.target.checked)}
                className="rounded"
              />
              <label htmlFor="includeAI" className="text-sm text-gray-700 dark:text-foreground">
                {t.includeAI}
              </label>
            </div>
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="trustedOnly"
                checked={trustedOnly}
                onChange={(e) => setTrustedOnly(e.target.checked)}
                className="rounded"
              />
              <label htmlFor="trustedOnly" className="text-sm text-gray-700 dark:text-foreground">
                {t.trustedOnly}
              </label>
            </div>
          </div>

          <div className="flex justify-between items-center">
            <Button onClick={() => {
              console.log('🔘 Search button clicked')
              handleSearch()
            }} disabled={loading}>
              {loading ? t.searching : t.search}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Nothing in the visitor's language: the moment translation is worth paying for */}
      {!loading && lastSearch && lastSearch.found === 0 && lastSearch.language !== 'en' && (
        <Card className="border-blue-300 bg-blue-50 dark:border-blue-800/50 dark:bg-blue-950/30">
          <CardContent className="p-5 sm:p-6 space-y-3">
            <h3 className="text-lg font-semibold text-blue-950 dark:text-blue-100">
              {t.missingTitle(getLanguageLabel(lastSearch.language), lastSearch.query)}
            </h3>
            <p className="text-sm text-blue-900/80 dark:text-blue-200/80">
              {t.missingBody(getLanguageLabel(lastSearch.language))}
            </p>
            <div className="flex flex-col sm:flex-row gap-2">
              <Button onClick={showEnglishInstead}>
                <Search className="h-4 w-4 mr-2" />
                {t.showEnglish}
              </Button>
              <Button asChild variant="outline">
                <a href={translateHref('en', lastSearch.query, 'subtitle-search-missing')}>
                  {t.translateNow(getLanguageLabel(lastSearch.language))}
                </a>
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Results */}
      {shows.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">
              {t.found(shows.length)}
            </h3>
          </div>
          {lastSearch?.language === 'en' && wantedLanguage && (
            <p className="rounded-lg border border-blue-200 bg-blue-50 px-4 py-3 text-sm text-blue-900 dark:border-blue-800/40 dark:bg-blue-950/30 dark:text-blue-200">
              {t.needLanguage(getLanguageLabel(wantedLanguage))}
            </p>
          )}

          <div className="space-y-4">
            {shows.map((show) => {
              // Use the same key format as in groupSubtitles
              const showKey = show.feature_type === 'Episode'
                ? `series-${show.imdb_id}-${show.title}`
                : `${show.imdb_id}-${show.title}-${show.year}`
              const isExpanded = expandedShows.has(showKey)

              return (
                <Card key={showKey} className="overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300 border-l-4 border-l-blue-500">
                  <Collapsible open={isExpanded} onOpenChange={() => toggleShow(showKey, show)}>
                    <CollapsibleTrigger asChild>
                      <CardHeader className="cursor-pointer hover:bg-gradient-to-r hover:from-blue-50 hover:to-purple-50 dark:hover:from-accent dark:hover:to-muted transition-all duration-300 p-6">
                        <div className="flex items-start justify-between">
                          <div className="flex items-start space-x-4">
                            {/* Enhanced TMDB Thumbnail */}
                            <div className="relative">
                              <TMDBImage
                                tmdbId={show.tmdb_id}
                                type={show.feature_type === 'Movie' ? 'movie' : 'tv'}
                                title={show.title}
                                year={show.year}
                                className="w-20 h-30 flex-shrink-0 shadow-md"
                                openSubtitlesImageUrl={
                                  show.feature_type === 'Movie'
                                    ? getOpenSubtitlesImageUrl(show.movie_subtitles || [])
                                    : getOpenSubtitlesImageUrl(show.subtitles || [])
                                }
                              />
                              {/* Media type badge */}
                              <div className="absolute -top-2 -right-2">
                                {show.feature_type === 'Movie' ? (
                                  <div className="bg-blue-500 dark:bg-blue-600 text-white p-1 rounded-full shadow-lg">
                                    <Film className="h-3 w-3" />
                                  </div>
                                ) : (
                                  <div className="bg-green-500 dark:bg-green-600 text-white p-1 rounded-full shadow-lg">
                                    <Tv className="h-3 w-3" />
                                  </div>
                                )}
                              </div>
                            </div>

                            <div className="flex-1 min-w-0">
                              <div className="flex items-center space-x-2 mb-2">
                                <CardTitle className="text-xl font-bold text-gray-900 truncate">
                                  {show.title}
                                </CardTitle>
                                <Badge variant="secondary" className="text-xs">
                                  {show.year}
                                </Badge>
                              </div>

                              <div className="text-sm text-gray-600 mb-3">
                                <div className="flex items-center space-x-4">
                                  <span className="font-medium">
                                    {show.feature_type === 'Movie' ? t.movieLabel : t.seriesLabel}
                                  </span>
                                  {show.tmdb_id && (
                                    <span className="text-xs bg-gray-100 dark:bg-muted px-2 py-1 rounded">
                                      TMDB: {show.tmdb_id}
                                    </span>
                                  )}
                                  {show.imdb_id && (
                                    <span className="text-xs bg-yellow-100 dark:bg-yellow-900/30 px-2 py-1 rounded">
                                      IMDb: {show.imdb_id}
                                    </span>
                                  )}
                                </div>
                              </div>

                              {/* Subtitle count and quality indicators */}
                              <div className="flex items-center space-x-3 text-sm">
                                <Badge variant="outline" className="bg-blue-50 dark:bg-blue-950/30">
                                  {t.subtitleCount(show.feature_type === 'Movie'
                                    ? (show.movie_subtitles?.length || 0)
                                    : (show.total_subtitles || 0))}
                                </Badge>
                                {((show.feature_type === 'Movie' ? show.movie_subtitles : show.subtitles) || []).some(s => s.attributes.from_trusted) && (
                                  <Badge variant="outline" className="bg-green-50 dark:bg-green-950/30 text-green-700 dark:text-green-300">
                                    ✓ {t.trusted}
                                  </Badge>
                                )}
                                {((show.feature_type === 'Movie' ? show.movie_subtitles : show.subtitles) || []).some(s => s.attributes.hd) && (
                                  <Badge variant="outline" className="bg-purple-50 dark:bg-purple-950/30 text-purple-700 dark:text-purple-300">
                                    HD
                                  </Badge>
                                )}
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Badge variant="outline">
                              {t.subtitleCount(show.total_subtitles || 0)}
                            </Badge>
                            {isExpanded ? (
                              <ChevronDown className="h-4 w-4" />
                            ) : (
                              <ChevronRight className="h-4 w-4" />
                            )}
                          </div>
                        </div>
                      </CardHeader>
                    </CollapsibleTrigger>

                    <CollapsibleContent>
                      <CardContent className="pt-0">
                        {show.feature_type === 'Movie' && show.movie_subtitles ? (
                          // Movie subtitles
                          <div className="space-y-3">
                            {(show.movie_subtitles || []).map((subtitle) => (
                              <div key={subtitle.id} className="border rounded-lg p-4 bg-gray-50 dark:bg-card dark:border-border">
                                <div className="flex items-start justify-between">
                                  <div className="flex-1 space-y-2">
                                    <div className="flex flex-wrap gap-2">
                                      <Badge variant="secondary">
                                        {getLanguageLabel(subtitle.attributes.language)}
                                      </Badge>
                                      {subtitle.attributes.hd && (
                                        <Badge variant="outline" className="text-green-600">HD</Badge>
                                      )}
                                      {subtitle.attributes.hearing_impaired && (
                                        <Badge variant="outline" className="text-blue-600">{t.hearingImpaired}</Badge>
                                      )}
                                      {subtitle.attributes.from_trusted && (
                                        <Badge variant="outline" className="text-purple-600 dark:text-purple-400">{t.trusted}</Badge>
                                      )}
                                      {subtitle.attributes.ai_translated && (
                                        <Badge variant="outline" className="text-orange-600 dark:text-orange-400">{t.aiTranslation}</Badge>
                                      )}
                                    </div>

                                    <p className="text-sm text-muted-foreground">
                                      {t.release}: {subtitle.attributes.release}
                                    </p>

                                    <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                                      <div className="flex items-center space-x-1">
                                        <Download className="h-4 w-4" />
                                        <span>{subtitle.attributes.download_count.toLocaleString()}</span>
                                      </div>
                                      {subtitle.attributes.votes > 0 && (
                                        <div className="flex items-center space-x-1">
                                          <Star className="h-4 w-4" />
                                          <span>{subtitle.attributes.ratings}/10</span>
                                        </div>
                                      )}
                                      <div className="flex items-center space-x-1">
                                        <Calendar className="h-4 w-4" />
                                        <span>{formatDate(subtitle.attributes.upload_date)}</span>
                                      </div>
                                      <div className="flex items-center space-x-1">
                                        <Users className="h-4 w-4" />
                                        <span>{subtitle.attributes.uploader.name}</span>
                                      </div>
                                    </div>

                                    {subtitle.attributes.comments && (
                                      <p className="text-sm text-muted-foreground italic">
                                        {subtitle.attributes.comments}
                                      </p>
                                    )}
                                  </div>

                                  <div className="ml-4 flex flex-col space-y-2">
                                    <Button
                                      onClick={() => handleDownload(subtitle)}
                                      size="sm"
                                      className="flex items-center space-x-2"
                                    >
                                      <ExternalLink className="h-4 w-4" />
                                      <span>{t.download}</span>
                                    </Button>
                                    <Button
                                      onClick={() => window.open(translateHref(toAppLanguage(subtitle.attributes.language), `${show.title} (${show.year})`), '_blank')}
                                      size="sm"
                                      variant="outline"
                                      className="text-xs"
                                    >
                                      {translateLabel(toAppLanguage(subtitle.attributes.language))}
                                    </Button>

                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        ) : (
                          // TV Series seasons and episodes
                          <div className="space-y-4">
                            {(() => {
                              const detailedShow = showEpisodes.get(showKey)
                              if (!detailedShow || !detailedShow.seasons?.length) {
                                return (
                                  <div className="p-4 text-center text-muted-foreground">
                                    {t.loadingEpisodes}
                                  </div>
                                )
                              }

                              return (detailedShow.seasons || []).map((season) => {
                              const seasonKey = `${showKey}-season-${season.season_number}`
                              const isSeasonExpanded = expandedSeasons.has(seasonKey)

                              return (
                                <div key={seasonKey} className="border rounded-lg">
                                  <Collapsible open={isSeasonExpanded} onOpenChange={() => toggleSeason(seasonKey)}>
                                    <CollapsibleTrigger asChild>
                                      <div className="flex items-center justify-between p-4 cursor-pointer hover:bg-gray-50 dark:hover:bg-card transition-colors">
                                        <div className="flex items-center space-x-2">
                                          <h4 className="font-semibold">{t.season(season.season_number)}</h4>
                                          <Badge variant="outline">
                                            {t.episodeCount(season.episodes?.length || 0)}
                                          </Badge>
                                        </div>
                                        {isSeasonExpanded ? (
                                          <ChevronDown className="h-4 w-4" />
                                        ) : (
                                          <ChevronRight className="h-4 w-4" />
                                        )}
                                      </div>
                                    </CollapsibleTrigger>

                                    <CollapsibleContent>
                                      <div className="px-4 pb-4 space-y-3">
                                        {(season.episodes || []).map((episode) => (
                                          <div key={`${seasonKey}-episode-${episode.episode_number}`} className="border rounded-lg p-3 bg-gray-50 dark:bg-card dark:border-border">
                                            <div className="mb-3">
                                              <h5 className="font-medium">
                                                {t.episode(episode.episode_number)}
                                                <Badge variant="outline" className="ml-2">
                                                  {t.subtitleCount(episode.subtitles?.length || 0)}
                                                </Badge>
                                              </h5>
                                            </div>

                                            <div className="space-y-2">
                                              {(episode.subtitles || []).map((subtitle) => (
                                                <div key={subtitle.id} className="flex items-center justify-between p-2 bg-white dark:bg-background rounded border dark:border-border">
                                                  <div className="flex-1">
                                                    <div className="flex flex-wrap gap-1 mb-1">
                                                      <Badge variant="secondary" className="text-xs">
                                                        {getLanguageLabel(subtitle.attributes.language)}
                                                      </Badge>
                                                      {subtitle.attributes.hd && (
                                                        <Badge variant="outline" className="text-xs text-green-600 dark:text-green-400">HD</Badge>
                                                      )}
                                                      {subtitle.attributes.hearing_impaired && (
                                                        <Badge variant="outline" className="text-xs text-blue-600 dark:text-blue-400">HI</Badge>
                                                      )}
                                                      {subtitle.attributes.from_trusted && (
                                                        <Badge variant="outline" className="text-xs text-purple-600 dark:text-purple-400">✓</Badge>
                                                      )}
                                                    </div>
                                                    <p className="text-xs text-muted-foreground truncate">
                                                      {subtitle.attributes.release}
                                                    </p>
                                                    <div className="flex items-center space-x-3 text-xs text-muted-foreground mt-1">
                                                      <span>{t.downloads(subtitle.attributes.download_count)}</span>
                                                      {subtitle.attributes.votes > 0 && (
                                                        <span>⭐ {subtitle.attributes.ratings}/10</span>
                                                      )}
                                                    </div>
                                                  </div>
                                                  <div className="flex space-x-1">
                                                    <Button
                                                      onClick={() => handleDownload(subtitle)}
                                                      size="sm"
                                                      variant="outline"
                                                      className="text-xs px-2 py-1"
                                                      title={t.download}
                                                    >
                                                      <ExternalLink className="h-3 w-3" />
                                                    </Button>
                                                    <Button
                                                      onClick={() => window.open(translateHref(toAppLanguage(subtitle.attributes.language), `${show.title} S${String(season.season_number).padStart(2, '0')}E${String(episode.episode_number).padStart(2, '0')}`), '_blank')}
                                                      size="sm"
                                                      variant="outline"
                                                      className="text-xs px-2 py-1"
                                                      title={translateLabel(toAppLanguage(subtitle.attributes.language))}
                                                    >
                                                      Translate
                                                    </Button>

                                                  </div>
                                                </div>
                                              ))}
                                            </div>
                                          </div>
                                        ))}
                                      </div>
                                    </CollapsibleContent>
                                  </Collapsible>
                                </div>
                              )
                            })
                            })()}
                          </div>
                        )}
                      </CardContent>
                    </CollapsibleContent>
                  </Collapsible>
                </Card>
              )
            })}
          </div>
        </div>
      )}


    </div>
  )
}
