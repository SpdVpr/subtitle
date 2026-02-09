'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Download, ExternalLink, Calendar, Hash, Film, BookOpen, Image } from 'lucide-react'
import { toast } from 'sonner'

interface JimakuEntry {
  id: number
  name: string
  flags: {
    anime: boolean
    unverified: boolean
    external: boolean
    movie: boolean
    adult: boolean
  }
  last_modified: string
  creator_id?: number
  anilist_id?: number
  english_name?: string
  japanese_name?: string
  notes?: string
}



interface JimakuSearchResponse extends Array<JimakuEntry> {}

// AniList image placeholder component
const AniListImage = ({ anilistId, title, isMovie, className }: {
  anilistId?: number,
  title: string,
  isMovie: boolean,
  className?: string
}) => {
  // For demo purposes, we'll show a placeholder
  // In production, you'd implement proper AniList API integration
  return (
    <div className={`bg-gradient-to-br from-purple-100 to-pink-100 dark:from-purple-950/30 dark:to-pink-950/30 rounded-lg flex items-center justify-center ${className}`}>
      <div className="text-center p-2">
        <Image className="h-8 w-8 text-purple-400 dark:text-purple-300 mx-auto mb-1" />
        <div className="text-xs text-purple-600 dark:text-purple-300 font-medium">{isMovie ? 'Movie' : 'Anime'}</div>
        <div className="text-xs text-purple-500 dark:text-purple-400 truncate max-w-[80px]">{title}</div>
        {anilistId && (
          <div className="text-xs text-purple-400 dark:text-purple-500">ID: {anilistId}</div>
        )}
      </div>
    </div>
  )
}

const LANGUAGE_OPTIONS = [
  { value: 'en', label: 'English' },
  { value: 'ja', label: '日本語' },
  { value: 'cs', label: 'Čeština' },
  { value: 'sk', label: 'Slovenčina' },
  { value: 'de', label: 'Deutsch' },
  { value: 'fr', label: 'Français' },
  { value: 'es', label: 'Español' },
  { value: 'it', label: 'Italiano' },
  { value: 'pt', label: 'Português' },
  { value: 'ru', label: 'Русский' },
  { value: 'ko', label: '한국어' },
  { value: 'zh', label: '中文' },
]

export function AnimeSubtitleSearch() {
  const [query, setQuery] = useState('')
  const [type, setType] = useState<'anime'>('anime')
  const [language, setLanguage] = useState('en')
  const [loading, setLoading] = useState(false)
  const [results, setResults] = useState<JimakuEntry[]>([])

  const [totalCount, setTotalCount] = useState(0)

  const handleSearch = async () => {
    if (!query.trim()) {
      toast.error('Enter anime title')
      return
    }

    console.log('🎌 AnimeSubtitleSearch: Starting search for:', query)
    setLoading(true)
    try {
      const params = new URLSearchParams({
        query: query.trim(),
        limit: '50'
      })

      params.set('anime', 'true')

      const response = await fetch(`/api/jimaku/search?${params}`)

      if (!response.ok) {
        const error = await response.json()
        const errorMessage = error.details || error.error || 'Chyba při vyhledávání'
        throw new Error(errorMessage)
      }

      const data: JimakuSearchResponse = await response.json()
      console.log('📊 Jimaku API data:', data.length, 'entries')

      setResults(data)
      setTotalCount(data.length)

      // Clear files for now - we'll need to fetch them separately
      setFiles(new Map())

      if (data.length === 0) {
        toast.info('No subtitles found')
      } else {
        toast.success(`Found ${data.length} ${data.length === 1 ? 'item' : 'items'}`)
      }
    } catch (error) {
      console.error('Search error:', error)
      toast.error(error instanceof Error ? error.message : 'Chyba při vyhledávání')
    } finally {
      setLoading(false)
    }
  }

  const handleDownload = (entry: JimakuEntry) => {
    window.open(`https://jimaku.cc/entry/${entry.id}`, '_blank')
    toast.info('Přesměrováváme vás na Jimaku pro zobrazení titulků')
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('cs-CZ')
  }

  return (
    <div className="space-y-6">
      {/* Search Form */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Film className="h-5 w-5" />
            <span>Search Anime Subtitles</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Input
                placeholder="Anime title..."
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
          </div>
          <div className="flex space-x-4">
            <Button onClick={handleSearch} disabled={loading}>
              {loading ? 'Searching...' : 'Search'}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Results */}
      {results.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">
              Nalezeno {results.length} {results.length === 1 ? 'položka' : 'položek'}
            </h3>
          </div>

          <div className="space-y-4">
            {results.map((entry) => (
              <Card key={entry.id}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-3">
                      {/* AniList Thumbnail */}
                      <AniListImage
                        anilistId={entry.anilist_id}
                        title={entry.name}
                        isMovie={entry.flags.movie}
                        className="w-16 h-24 flex-shrink-0"
                      />
                      <div className="space-y-2">
                        <div className="flex items-center space-x-2">
                          {entry.flags.movie ? (
                            <Film className="h-4 w-4 text-blue-500" />
                          ) : (
                            <BookOpen className="h-4 w-4 text-green-500" />
                          )}
                          <h4 className="font-semibold text-lg">{entry.name}</h4>
                        </div>
                      {entry.english_name && entry.english_name !== entry.name && (
                        <p className="text-sm text-muted-foreground">
                          {entry.english_name}
                        </p>
                      )}
                      {entry.japanese_name && entry.japanese_name !== entry.name && (
                        <p className="text-sm text-muted-foreground">
                          {entry.japanese_name}
                        </p>
                      )}
                      <div className="flex flex-wrap gap-2">
                        {entry.flags.movie && (
                          <Badge variant="outline">
                            Movie
                          </Badge>
                        )}
                        {entry.flags.anime && (
                          <Badge variant="outline">
                            Anime
                          </Badge>
                        )}
                        {entry.flags.external && (
                          <Badge variant="secondary">
                            External
                          </Badge>
                        )}
                        {entry.anilist_id && (
                          <Badge variant="outline" className="flex items-center space-x-1">
                            <Hash className="h-3 w-3" />
                            <span>AniList: {entry.anilist_id}</span>
                          </Badge>
                        )}
                      </div>
                        {entry.notes && (
                          <p className="text-sm text-muted-foreground mt-2">
                            {entry.notes}
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="flex-shrink-0">
                      {/* Right side content if needed */}
                    </div>
                  </div>
                </CardHeader>

                <CardContent>
                  <div className="flex space-x-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleDownload(entry)}
                      className="flex items-center space-x-1"
                    >
                      <ExternalLink className="h-4 w-4" />
                      <span>View on Jimaku</span>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
