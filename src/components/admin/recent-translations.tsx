'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { formatDistanceToNow } from 'date-fns'
import { cs } from 'date-fns/locale'
import { Download, RefreshCw, FileText, User, Globe, Clock, ChevronLeft, ChevronRight } from 'lucide-react'

interface RecentTranslation {
  id: string
  originalFileName: string
  translatedFileName?: string
  sourceLanguage: string
  targetLanguage: string
  userEmail: string
  userDisplayName?: string
  userId: string
  status: string
  aiService: string
  subtitleCount?: number
  characterCount?: number
  processingTimeMs?: number
  createdAt: any
  completedAt: any
  translatedContent?: string
  confidence?: number
}

interface RecentTranslationsProps {
  onRefresh?: () => void
}

export function RecentTranslations({ onRefresh }: RecentTranslationsProps) {
  const [translations, setTranslations] = useState<RecentTranslation[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [totalCount, setTotalCount] = useState(0)
  const [hasMore, setHasMore] = useState(false)
  const itemsPerPage = 20

  const loadTranslations = async (page = currentPage) => {
    setLoading(true)
    setError(null)

    try {
      const adminEmail = typeof window !== 'undefined' ? localStorage.getItem('adminEmail') || '' : ''

      const response = await fetch(`/api/admin/recent-translations?page=${page}&limit=${itemsPerPage}`, {
        headers: {
          'x-admin-email': adminEmail
        }
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to load recent translations')
      }

      setTranslations(data.translations || [])
      setCurrentPage(data.currentPage || 1)
      setTotalPages(data.totalPages || 1)
      setTotalCount(data.totalCount || 0)
      setHasMore(data.hasMore || false)
    } catch (error) {
      console.error('Failed to load recent translations:', error)
      setError(error instanceof Error ? error.message : 'Failed to load recent translations')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadTranslations()
  }, [])

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage)
      loadTranslations(newPage)
    }
  }

  const handleRefresh = () => {
    loadTranslations(currentPage)
    if (onRefresh) {
      onRefresh()
    }
  }

  const handleDownload = async (translation: RecentTranslation) => {
    if (!translation.translatedContent) {
      alert('Přeložený obsah není k dispozici pro stažení')
      return
    }

    try {
      // Create blob and download
      const blob = new Blob([translation.translatedContent], { type: 'text/plain;charset=utf-8' })
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = translation.translatedFileName || `${translation.originalFileName}_${translation.targetLanguage}.srt`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      URL.revokeObjectURL(url)
    } catch (error) {
      console.error('Download failed:', error)
      alert('Stažení se nezdařilo')
    }
  }

  const getLanguageName = (code: string) => {
    const languages: { [key: string]: string } = {
      'cs': 'Čeština',
      'en': 'Angličtina',
      'de': 'Němčina',
      'fr': 'Francouzština',
      'es': 'Španělština',
      'it': 'Italština',
      'pl': 'Polština',
      'sk': 'Slovenština',
      'auto': 'Automaticky'
    }
    return languages[code] || code.toUpperCase()
  }

  const getServiceName = (service: string) => {
    const services: { [key: string]: string } = {
      'google': 'Google Translate',
      'openai': 'OpenAI',
      'premium': 'Premium AI'
    }
    return services[service] || service.toUpperCase()
  }

  const formatDate = (timestamp: any) => {
    if (!timestamp) return 'Neznámé'

    try {
      // Now we receive ISO strings from the API
      const date = new Date(timestamp)

      // Check if date is valid
      if (isNaN(date.getTime())) {
        console.warn('Invalid date:', timestamp)
        return 'Neznámé datum'
      }

      return date.toLocaleString('cs-CZ', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      })
    } catch (error) {
      console.error('Date formatting error:', error, timestamp)
      return 'Neznámé datum'
    }
  }

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <FileText className="w-5 h-5" />
            <span>Poslední překlady</span>
            <RefreshCw className="w-4 h-4 animate-spin ml-auto" />
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <div className="text-muted-foreground">Načítání překladů...</div>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <FileText className="w-5 h-5" />
            <span>Poslední překlady</span>
            <Button
              onClick={loadTranslations}
              variant="outline"
              size="sm"
              className="ml-auto"
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Obnovit
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <FileText className="w-5 h-5" />
          <span>Poslední překlady ({totalCount} celkem)</span>
          <Button
            onClick={handleRefresh}
            variant="outline"
            size="sm"
            className="ml-auto"
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Obnovit
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {translations.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            Žádné překlady nebyly nalezeny
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-2 px-2 font-medium">Soubor</th>
                  <th className="text-left py-2 px-2 font-medium">Uživatel</th>
                  <th className="text-left py-2 px-2 font-medium">Překlad</th>
                  <th className="text-left py-2 px-2 font-medium">Datum</th>
                  <th className="text-left py-2 px-2 font-medium">Detaily</th>
                  <th className="text-left py-2 px-2 font-medium">Akce</th>
                </tr>
              </thead>
              <tbody>
                {translations.map((translation) => (
                  <tr key={translation.id} className="border-b hover:bg-muted/50">
                    <td className="py-3 px-2">
                      <div className="flex flex-col">
                        <span className="font-medium text-sm">{translation.originalFileName}</span>
                        {translation.translatedFileName && (
                          <span className="text-xs text-muted-foreground">{translation.translatedFileName}</span>
                        )}
                      </div>
                    </td>
                    <td className="py-3 px-2">
                      <div className="flex items-center space-x-2">
                        <User className="w-4 h-4 text-muted-foreground" />
                        <div className="flex flex-col">
                          <span className="text-sm">{translation.userEmail}</span>
                          {translation.userDisplayName && (
                            <span className="text-xs text-muted-foreground">{translation.userDisplayName}</span>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-2">
                      <div className="flex items-center space-x-2">
                        <Globe className="w-4 h-4 text-muted-foreground" />
                        <div className="flex flex-col">
                          <span className="text-sm">{getLanguageName(translation.sourceLanguage)} → {getLanguageName(translation.targetLanguage)}</span>
                          <Badge variant="outline" className="text-xs w-fit">
                            {getServiceName(translation.aiService)}
                          </Badge>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-2">
                      <div className="flex items-center space-x-2">
                        <Clock className="w-4 h-4 text-muted-foreground" />
                        <div className="flex flex-col">
                          <span className="text-sm font-medium">{formatDate(translation.completedAt)}</span>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-2">
                      <div className="flex flex-col space-y-1">
                        {translation.subtitleCount && (
                          <span className="text-xs text-muted-foreground">
                            {translation.subtitleCount} titulků
                          </span>
                        )}
                        {translation.processingTimeMs && (
                          <span className="text-xs text-muted-foreground">
                            {Math.round(translation.processingTimeMs / 1000)}s
                          </span>
                        )}
                        {translation.confidence && (
                          <Badge variant="secondary" className="text-xs w-fit">
                            {Math.round(translation.confidence * 100)}%
                          </Badge>
                        )}
                      </div>
                    </td>
                    <td className="py-3 px-2">
                      <Button
                        onClick={() => handleDownload(translation)}
                        variant="outline"
                        size="sm"
                        disabled={!translation.translatedContent}
                        className="flex items-center space-x-1"
                      >
                        <Download className="w-4 h-4" />
                        <span>Stáhnout</span>
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between mt-6 pt-4 border-t">
            <div className="text-sm text-muted-foreground">
              Stránka {currentPage} z {totalPages} • Zobrazeno {translations.length} z {totalCount} překladů
            </div>
            <div className="flex items-center space-x-2">
              <Button
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage <= 1 || loading}
                variant="outline"
                size="sm"
                className="flex items-center space-x-1"
              >
                <ChevronLeft className="w-4 h-4" />
                <span>Předchozí</span>
              </Button>

              {/* Page numbers */}
              <div className="flex items-center space-x-1">
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  let pageNum: number
                  if (totalPages <= 5) {
                    pageNum = i + 1
                  } else if (currentPage <= 3) {
                    pageNum = i + 1
                  } else if (currentPage >= totalPages - 2) {
                    pageNum = totalPages - 4 + i
                  } else {
                    pageNum = currentPage - 2 + i
                  }

                  return (
                    <Button
                      key={pageNum}
                      onClick={() => handlePageChange(pageNum)}
                      disabled={loading}
                      variant={currentPage === pageNum ? "default" : "outline"}
                      size="sm"
                      className="w-8 h-8 p-0"
                    >
                      {pageNum}
                    </Button>
                  )
                })}
              </div>

              <Button
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage >= totalPages || loading}
                variant="outline"
                size="sm"
                className="flex items-center space-x-1"
              >
                <span>Další</span>
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
