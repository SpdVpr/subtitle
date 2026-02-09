'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Search, Download, ExternalLink, Calendar, Star, Users, Clock } from 'lucide-react'
import { toast } from 'sonner'

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

export function SubtitleSearch() {
  const [query, setQuery] = useState('')
  const [language, setLanguage] = useState('en')
  const [type, setType] = useState<'movie' | 'episode' | 'all'>('all')
  const [year, setYear] = useState('')
  const [results, setResults] = useState<SubtitleResult[]>([])
  const [loading, setLoading] = useState(false)
  const [totalCount, setTotalCount] = useState(0)
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(0)

  const handleSearch = async (page = 1) => {
    if (!query.trim()) {
      toast.error('Zadejte název filmu nebo seriálu')
      return
    }

    setLoading(true)
    try {
      const params = new URLSearchParams({
        query: query.trim(),
        languages: language,
        page: page.toString(),
        per_page: '200' // Increased from 20 to match hierarchical search
      })

      if (type && type !== 'all') params.set('type', type)
      if (year) params.set('year', year)

      const response = await fetch(`/api/opensubtitles/search?${params}`)

      if (!response.ok) {
        const error = await response.json()
        const errorMessage = error.details || error.error || 'Chyba při vyhledávání'
        throw new Error(errorMessage)
      }

      const data: SearchResponse = await response.json()
      setResults(data.data)
      setTotalCount(data.total_count)
      setCurrentPage(data.page)
      setTotalPages(data.total_pages)

      if (data.data.length === 0) {
        toast.info('Nebyly nalezeny žádné titulky')
      } else {
        toast.success(`Nalezeno ${data.total_count} titulků`)
      }
    } catch (error) {
      console.error('Search error:', error)
      toast.error(error instanceof Error ? error.message : 'Chyba při vyhledávání')
    } finally {
      setLoading(false)
    }
  }

  const handleDownload = (subtitle: SubtitleResult) => {
    // Redirect to OpenSubtitles website for download
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
            <span>Vyhledat titulky</span>
          </CardTitle>
          <CardDescription>
            Vyhledejte titulky v databázi OpenSubtitles a stáhněte si je pro překlad
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
              placeholder="Rok (volitelné)"
              value={year}
              onChange={(e) => setYear(e.target.value)}
              className="max-w-32"
            />
            <Button onClick={() => handleSearch()} disabled={loading}>
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
              Nalezeno {totalCount} titulků
            </h3>
            {totalPages > 1 && (
              <div className="flex items-center space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleSearch(currentPage - 1)}
                  disabled={currentPage <= 1 || loading}
                >
                  Předchozí
                </Button>
                <span className="text-sm text-muted-foreground">
                  Stránka {currentPage} z {totalPages}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleSearch(currentPage + 1)}
                  disabled={currentPage >= totalPages || loading}
                >
                  Další
                </Button>
              </div>
            )}
          </div>

          <div className="grid gap-4">
            {results.map((subtitle) => (
              <Card key={subtitle.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1 space-y-3">
                      <div>
                        <h4 className="text-lg font-semibold text-blue-600">
                          {subtitle.attributes.feature_details.title}
                        </h4>
                        <p className="text-sm text-muted-foreground">
                          {subtitle.attributes.feature_details.movie_name} ({subtitle.attributes.feature_details.year})
                        </p>
                        {subtitle.attributes.release && (
                          <p className="text-sm text-muted-foreground mt-1">
                            Release: {subtitle.attributes.release}
                          </p>
                        )}
                      </div>

                      <div className="flex flex-wrap gap-2">
                        <Badge variant="secondary">
                          {getLanguageLabel(subtitle.attributes.language)}
                        </Badge>
                        <Badge variant="outline">
                          {subtitle.attributes.feature_details.feature_type}
                        </Badge>
                        {subtitle.attributes.hd && (
                          <Badge variant="outline" className="text-green-600 dark:text-green-400">
                            HD
                          </Badge>
                        )}
                        {subtitle.attributes.hearing_impaired && (
                          <Badge variant="outline" className="text-blue-600 dark:text-blue-400">
                            Pro neslyšící
                          </Badge>
                        )}
                        {subtitle.attributes.from_trusted && (
                          <Badge variant="outline" className="text-purple-600 dark:text-purple-400">
                            Ověřený
                          </Badge>
                        )}
                        {subtitle.attributes.ai_translated && (
                          <Badge variant="outline" className="text-orange-600 dark:text-orange-400">
                            AI překlad
                          </Badge>
                        )}
                      </div>

                      <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                        <div className="flex items-center space-x-1">
                          <Download className="h-4 w-4" />
                          <span>{subtitle.attributes.download_count.toLocaleString()} stažení</span>
                        </div>
                        {subtitle.attributes.votes > 0 && (
                          <div className="flex items-center space-x-1">
                            <Star className="h-4 w-4" />
                            <span>{subtitle.attributes.ratings}/10 ({subtitle.attributes.votes} hlasů)</span>
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
                        {subtitle.attributes.fps > 0 && (
                          <div className="flex items-center space-x-1">
                            <Clock className="h-4 w-4" />
                            <span>{subtitle.attributes.fps} FPS</span>
                          </div>
                        )}
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
                        className="flex items-center space-x-2"
                      >
                        <ExternalLink className="h-4 w-4" />
                        <span>Stáhnout</span>
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => window.open(`/translate`, '_blank')}
                        className="text-xs"
                      >
                        Přeložit titulky
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-center">
              <div className="flex items-center space-x-2">
                <Button
                  variant="outline"
                  onClick={() => handleSearch(1)}
                  disabled={currentPage <= 1 || loading}
                >
                  První
                </Button>
                <Button
                  variant="outline"
                  onClick={() => handleSearch(currentPage - 1)}
                  disabled={currentPage <= 1 || loading}
                >
                  Předchozí
                </Button>
                <span className="px-4 py-2 text-sm">
                  Stránka {currentPage} z {totalPages}
                </span>
                <Button
                  variant="outline"
                  onClick={() => handleSearch(currentPage + 1)}
                  disabled={currentPage >= totalPages || loading}
                >
                  Další
                </Button>
                <Button
                  variant="outline"
                  onClick={() => handleSearch(totalPages)}
                  disabled={currentPage >= totalPages || loading}
                >
                  Poslední
                </Button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Info Card */}
      <Card className="bg-blue-50 dark:bg-blue-950/30 border-blue-200 dark:border-blue-800/30">
        <CardContent className="p-6">
          <div className="flex items-start space-x-3">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center">
                <ExternalLink className="h-4 w-4 text-blue-600 dark:text-blue-400" />
              </div>
            </div>
            <div>
              <h4 className="font-semibold text-blue-900 dark:text-blue-300 mb-2">Jak to funguje?</h4>
              <div className="text-sm text-blue-800 space-y-2">
                <p>1. Vyhledejte titulky k vašemu filmu nebo seriálu</p>
                <p>2. Klikněte na "Stáhnout" - budete přesměrováni na OpenSubtitles.com</p>
                <p>3. Stáhněte si titulky z OpenSubtitles</p>
                <p>4. Vraťte se k nám a použijte náš AI překladač pro překlad do vašeho jazyka</p>
              </div>
              <div className="mt-4 p-3 bg-yellow-50 dark:bg-yellow-950/30 border border-yellow-200 dark:border-yellow-800/30 rounded-md">
                <p className="text-xs text-yellow-800 dark:text-yellow-300">
                  <strong>Poznámka:</strong> Pokud vyhledávání nefunguje, může být OpenSubtitles API dočasně nedostupné.
                  Zkuste to prosím za chvíli znovu.
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}