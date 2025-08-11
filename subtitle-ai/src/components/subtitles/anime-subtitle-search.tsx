'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Download, ExternalLink, Calendar, Hash, Film, BookOpen } from 'lucide-react'
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
  const [type, setType] = useState<'anime' | 'manga' | 'both'>('anime')
  const [language, setLanguage] = useState('en')
  const [loading, setLoading] = useState(false)
  const [results, setResults] = useState<JimakuEntry[]>([])

  const [totalCount, setTotalCount] = useState(0)

  const handleSearch = async () => {
    if (!query.trim()) {
      toast.error('Zadejte název anime nebo mangy')
      return
    }

    console.log('🎌 AnimeSubtitleSearch: Starting search for:', query)
    setLoading(true)
    try {
      const params = new URLSearchParams({
        query: query.trim(),
        limit: '50'
      })

      if (type === 'anime') params.set('anime', 'true')
      else if (type === 'manga') params.set('manga', 'true')
      else {
        params.set('anime', 'true')
        params.set('manga', 'true')
      }

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
        toast.info('Nebyly nalezeny žádné titulky')
      } else {
        toast.success(`Nalezeno ${data.length} ${data.length === 1 ? 'položka' : 'položek'}`)
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
            <span>Vyhledávání anime/manga titulků</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="lg:col-span-1">
              <Input
                placeholder="Název anime nebo mangy..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              />
            </div>
            <Select value={type} onValueChange={(value) => setType(value as 'anime' | 'manga' | 'both')}>
              <SelectTrigger>
                <SelectValue placeholder="Typ" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="anime">Anime</SelectItem>
                <SelectItem value="manga">Manga</SelectItem>
                <SelectItem value="both">Obojí</SelectItem>
              </SelectContent>
            </Select>
            <Select value={language} onValueChange={setLanguage}>
              <SelectTrigger>
                <SelectValue placeholder="Jazyk" />
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
              {loading ? 'Vyhledávám...' : 'Vyhledat'}
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
                            Film
                          </Badge>
                        )}
                        {entry.flags.anime && (
                          <Badge variant="outline">
                            Anime
                          </Badge>
                        )}
                        {entry.flags.external && (
                          <Badge variant="secondary">
                            Externí
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
                      <span>Zobrazit na Jimaku</span>
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
