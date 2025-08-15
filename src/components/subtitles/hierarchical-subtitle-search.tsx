'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Search, Download, ExternalLink, Calendar, Star, Users, Clock, ChevronRight, ChevronDown, Film, Tv, Image } from 'lucide-react'
import { toast } from 'sonner'
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible'

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
  total_subtitles?: number
}

// TMDB image helper functions
const getTMDBImageUrl = (tmdbId: number, type: 'movie' | 'tv', size: 'w300' | 'w500' = 'w300') => {
  if (!tmdbId) return null
  const baseUrl = 'https://image.tmdb.org/t/p/'
  // For now, we'll use a placeholder approach since we don't have TMDB API key
  // In production, you'd fetch the actual poster_path from TMDB API
  return `${baseUrl}${size}/placeholder.jpg` // This would be the actual poster_path
}

// Fallback image component
const TMDBImage = ({ tmdbId, type, title, className }: {
  tmdbId: number,
  type: 'movie' | 'tv',
  title: string,
  className?: string
}) => {
  // For demo purposes, we'll show a placeholder
  // In production, you'd implement proper TMDB API integration
  return (
    <div className={`bg-gray-200 rounded-lg flex items-center justify-center ${className}`}>
      <div className="text-center p-2">
        <Image className="h-8 w-8 text-gray-400 mx-auto mb-1" />
        <div className="text-xs text-gray-500 font-medium">{type === 'movie' ? 'Movie' : 'TV'}</div>
        <div className="text-xs text-gray-400 truncate max-w-[80px]">{title}</div>
      </div>
    </div>
  )
}

const LANGUAGE_OPTIONS = [
  { value: 'en', label: 'English' },
  { value: 'cs', label: 'Čeština' },
  { value: 'sk', label: 'Slovenčina' },
  { value: 'de', label: 'Deutsch' },
  { value: 'fr', label: 'Français' },
  { value: 'es', label: 'Español' },
  { value: 'it', label: 'Italiano' },
  { value: 'pt', label: 'Português' },
  { value: 'ru', label: 'Русский' },
  { value: 'pl', label: 'Polski' },
  { value: 'nl', label: 'Nederlands' },
  { value: 'sv', label: 'Svenska' },
  { value: 'da', label: 'Dansk' },
  { value: 'no', label: 'Norsk' },
  { value: 'fi', label: 'Suomi' },
]

export function HierarchicalSubtitleSearch() {
  console.log('🎬 HierarchicalSubtitleSearch component loaded')

  const [query, setQuery] = useState('')
  const [language, setLanguage] = useState('en')
  const [type, setType] = useState<'movie' | 'episode' | 'all'>('all')
  const [year, setYear] = useState('')
  const [shows, setShows] = useState<Show[]>([])
  const [loading, setLoading] = useState(false)
  const [totalCount, setTotalCount] = useState(0)
  const [expandedShows, setExpandedShows] = useState<Set<string>>(new Set())
  const [expandedSeasons, setExpandedSeasons] = useState<Set<string>>(new Set())
  const [showEpisodes, setShowEpisodes] = useState<Map<string, Show>>(new Map()) // Store detailed episode data

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

  // Extract base series name (remove episode info)
  const extractSeriesName = (title: string): string => {
    // Remove common episode patterns
    return title
      .replace(/\s+S\d+E\d+.*$/i, '') // Remove "S01E01" and everything after
      .replace(/\s+Season\s+\d+.*$/i, '') // Remove "Season 1" and everything after
      .replace(/\s+Episode\s+\d+.*$/i, '') // Remove "Episode 1" and everything after
      .replace(/\s+\d+x\d+.*$/i, '') // Remove "1x01" and everything after
      .replace(/\s+\(\d{4}\)$/, '') // Remove year in parentheses at the end
      .trim()
  }

  // Group subtitles by show only (don't group by episodes yet)
  const groupSubtitles = (subtitles: SubtitleResult[]): Show[] => {
    console.log('🔍 Grouping subtitles:', subtitles.length, 'items')
    const showsMap = new Map<string, Show>()

    subtitles.forEach(subtitle => {
      const { feature_details } = subtitle.attributes

      // For TV series, extract base series name
      let displayTitle = feature_details.title
      let showKey = `${feature_details.imdb_id}-${feature_details.title}-${feature_details.year}`

      if (feature_details.feature_type === 'Episode') {
        // Use parent_title if available (for proper series grouping), otherwise extract from title
        displayTitle = (feature_details as any).parent_title || extractSeriesName(feature_details.title)
        // Use parent_imdb_id if available for better grouping
        const parentId = (feature_details as any).parent_imdb_id || feature_details.imdb_id
        showKey = `series-${parentId}-${displayTitle}`
        console.log('📺 Episode:', feature_details.title, '→', displayTitle, 'key:', showKey)
      }

      if (!showsMap.has(showKey)) {
        // For episodes, prefer parent IDs so that follow-up fetches cover the whole series
        const seriesImdbId: string = String((feature_details as any).parent_imdb_id || feature_details.imdb_id)
        const seriesTmdbId: number = (feature_details as any).parent_tmdb_id || feature_details.tmdb_id

        showsMap.set(showKey, {
          title: displayTitle,
          year: feature_details.year,
          imdb_id: feature_details.feature_type === 'Episode' ? seriesImdbId : String(feature_details.imdb_id),
          tmdb_id: feature_details.feature_type === 'Episode' ? seriesTmdbId : feature_details.tmdb_id,
          feature_type: feature_details.feature_type,
          seasons: [],
          movie_subtitles: feature_details.feature_type === 'Movie' ? [] : undefined,
          total_subtitles: 0 // Add counter for total subtitles
        })
      }

      const show = showsMap.get(showKey)!
      show.total_subtitles = (show.total_subtitles || 0) + 1

      if (feature_details.feature_type === 'Movie') {
        // For movies, just count the subtitles, don't store them yet
        if (!show.movie_subtitles) show.movie_subtitles = []
      }
      // For TV series, we'll load episodes on demand when user clicks on the show
    })

    return Array.from(showsMap.values())
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
        languages: language,
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
      seasons
    }
  }

  const handleSearch = async () => {
    if (!query.trim()) {
      toast.error('Zadejte název filmu nebo seriálu')
      return
    }

    console.log('🔍 HierarchicalSubtitleSearch: Starting search for:', query)
    setLoading(true)
    try {
      const params = new URLSearchParams({
        query: query.trim(),
        languages: language,
        per_page: '100', // Get more results for better grouping
        type: 'episode' // Default to episode to get TV series
      })

      // Override type if specifically requested
      if (type && type !== 'all') params.set('type', type)
      if (year) params.set('year', year)

      const response = await fetch(`/api/opensubtitles/search?${params}`)

      if (!response.ok) {
        const error = await response.json()
        const errorMessage = error.details || error.error || 'Chyba při vyhledávání'
        throw new Error(errorMessage)
      }

      const data: SearchResponse = await response.json()
      console.log('📊 Raw API data:', data.data.length, 'subtitles')
      const groupedShows = groupSubtitles(data.data)
      console.log('🎭 Grouped shows:', groupedShows.length, 'shows')
      setShows(groupedShows)
      setTotalCount(data.total_count)

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
        toast.info('No subtitles found')
      } else {
        toast.success(`Found ${groupedShows.length} ${groupedShows.length === 1 ? 'show/movie' : 'shows/movies'}`)
      }
    } catch (error) {
      console.error('Search error:', error)
      toast.error(error instanceof Error ? error.message : 'Chyba při vyhledávání')
    } finally {
      setLoading(false)
    }
  }

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
    window.open(subtitle.attributes.download_url, '_blank')
    toast.info('Přesměrováváme vás na OpenSubtitles pro stažení titulků')
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('cs-CZ')
  }

  const getLanguageLabel = (code: string) => {
    return LANGUAGE_OPTIONS.find(lang => lang.value === code)?.label || code.toUpperCase()
  }

  return (
    <div className="space-y-6">
      {/* Search Form */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Search className="h-5 w-5" />
            <span>Search Subtitles</span>
          </CardTitle>
          <CardDescription>
            Search subtitles grouped by TV series and movies for better organization
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="lg:col-span-2">
              <Input
                placeholder="Název filmu nebo seriálu..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              />
            </div>
            <Select value={language} onValueChange={setLanguage}>
              <SelectTrigger>
                <SelectValue placeholder="Language" />
              </SelectTrigger>
              <SelectContent>
                {LANGUAGE_OPTIONS.map(lang => (
                  <SelectItem key={lang.value} value={lang.value}>
                    {lang.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={type} onValueChange={(value) => setType(value as 'movie' | 'episode' | 'all')}>
              <SelectTrigger>
                <SelectValue placeholder="Typ" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Vše</SelectItem>
                <SelectItem value="movie">Film</SelectItem>
                <SelectItem value="episode">Seriál</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex space-x-4">
            <Input
              placeholder="Year (optional)"
              value={year}
              onChange={(e) => setYear(e.target.value)}
              className="max-w-32"
            />
            <Button onClick={() => {
              console.log('🔘 Search button clicked')
              handleSearch()
            }} disabled={loading}>
              {loading ? 'Searching...' : 'Search'}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Results */}
      {shows.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">
              Nalezeno {shows.length} {shows.length === 1 ? 'seriál/film' : 'seriálů/filmů'}
            </h3>
          </div>

          <div className="space-y-4">
            {shows.map((show) => {
              // Use the same key format as in groupSubtitles
              const showKey = show.feature_type === 'Episode'
                ? `series-${show.imdb_id}-${show.title}`
                : `${show.imdb_id}-${show.title}-${show.year}`
              const isExpanded = expandedShows.has(showKey)

              return (
                <Card key={showKey} className="overflow-hidden">
                  <Collapsible open={isExpanded} onOpenChange={() => toggleShow(showKey, show)}>
                    <CollapsibleTrigger asChild>
                      <CardHeader className="cursor-pointer hover:bg-gray-50 transition-colors">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            {/* TMDB Thumbnail */}
                            <TMDBImage
                              tmdbId={show.tmdb_id}
                              type={show.feature_type === 'Movie' ? 'movie' : 'tv'}
                              title={show.title}
                              className="w-16 h-24 flex-shrink-0"
                            />
                            <div className="flex items-center space-x-2">
                              {show.feature_type === 'Movie' ? (
                                <Film className="h-5 w-5 text-blue-600" />
                              ) : (
                                <Tv className="h-5 w-5 text-green-600" />
                              )}
                              <div>
                                <CardTitle className="text-left">{show.title}</CardTitle>
                                <CardDescription>
                                  {show.feature_type} ({show.year})
                                  {show.tmdb_id && (
                                    <span className="ml-2 text-xs text-gray-400">
                                      TMDB: {show.tmdb_id}
                                    </span>
                                  )}
                                </CardDescription>
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Badge variant="outline">
                              {show.total_subtitles || 0} titulků
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
                            {show.movie_subtitles.map((subtitle) => (
                              <div key={subtitle.id} className="border rounded-lg p-4 bg-gray-50">
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
                                        <Badge variant="outline" className="text-blue-600">Pro neslyšící</Badge>
                                      )}
                                      {subtitle.attributes.from_trusted && (
                                        <Badge variant="outline" className="text-purple-600">Ověřený</Badge>
                                      )}
                                      {subtitle.attributes.ai_translated && (
                                        <Badge variant="outline" className="text-orange-600">AI překlad</Badge>
                                      )}
                                    </div>

                                    <p className="text-sm text-muted-foreground">
                                      Release: {subtitle.attributes.release}
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
                                      <span>Download</span>
                                    </Button>
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      onClick={() => window.open(`/translate`, '_blank')}
                                      className="text-xs"
                                    >
                                      Přeložit
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
                              if (!detailedShow || !detailedShow.seasons.length) {
                                return (
                                  <div className="p-4 text-center text-muted-foreground">
                                    Načítání epizod...
                                  </div>
                                )
                              }

                              return detailedShow.seasons.map((season) => {
                              const seasonKey = `${showKey}-season-${season.season_number}`
                              const isSeasonExpanded = expandedSeasons.has(seasonKey)

                              return (
                                <div key={seasonKey} className="border rounded-lg">
                                  <Collapsible open={isSeasonExpanded} onOpenChange={() => toggleSeason(seasonKey)}>
                                    <CollapsibleTrigger asChild>
                                      <div className="flex items-center justify-between p-4 cursor-pointer hover:bg-gray-50 transition-colors">
                                        <div className="flex items-center space-x-2">
                                          <h4 className="font-semibold">Série {season.season_number}</h4>
                                          <Badge variant="outline">
                                            {season.episodes.length} {season.episodes.length === 1 ? 'díl' : 'dílů'}
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
                                        {season.episodes.map((episode) => (
                                          <div key={`${seasonKey}-episode-${episode.episode_number}`} className="border rounded-lg p-3 bg-gray-50">
                                            <div className="mb-3">
                                              <h5 className="font-medium">
                                                Díl {episode.episode_number}
                                                <Badge variant="outline" className="ml-2">
                                                  {episode.subtitles.length} {episode.subtitles.length === 1 ? 'titulek' : 'titulků'}
                                                </Badge>
                                              </h5>
                                            </div>

                                            <div className="space-y-2">
                                              {episode.subtitles.map((subtitle) => (
                                                <div key={subtitle.id} className="flex items-center justify-between p-2 bg-white rounded border">
                                                  <div className="flex-1">
                                                    <div className="flex flex-wrap gap-1 mb-1">
                                                      <Badge variant="secondary" className="text-xs">
                                                        {getLanguageLabel(subtitle.attributes.language)}
                                                      </Badge>
                                                      {subtitle.attributes.hd && (
                                                        <Badge variant="outline" className="text-xs text-green-600">HD</Badge>
                                                      )}
                                                      {subtitle.attributes.hearing_impaired && (
                                                        <Badge variant="outline" className="text-xs text-blue-600">HI</Badge>
                                                      )}
                                                      {subtitle.attributes.from_trusted && (
                                                        <Badge variant="outline" className="text-xs text-purple-600">✓</Badge>
                                                      )}
                                                    </div>
                                                    <p className="text-xs text-muted-foreground truncate">
                                                      {subtitle.attributes.release}
                                                    </p>
                                                    <div className="flex items-center space-x-3 text-xs text-muted-foreground mt-1">
                                                      <span>{subtitle.attributes.download_count.toLocaleString()} stažení</span>
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
                                                    >
                                                      <ExternalLink className="h-3 w-3" />
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