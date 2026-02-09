'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { TranslationJob } from '@/types/database'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Download, Clock, FileText, Globe, Loader2, RefreshCw } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'

interface TranslationHistoryProps {
  className?: string
  showHeader?: boolean
}

export function TranslationHistory({ className, showHeader = true }: TranslationHistoryProps) {
  const { user } = useAuth()
  const [jobs, setJobs] = useState<TranslationJob[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [downloadingJobs, setDownloadingJobs] = useState<Set<string>>(new Set())

  const loadTranslationHistory = async () => {
    if (!user) return

    try {
      setLoading(true)
      setError(null)

      console.log('📋 Loading translation history...')
      const response = await fetch(`/api/translation-history?userId=${user.uid}&limit=20`)

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || `HTTP ${response.status}`)
      }

      const data = await response.json()
      setJobs(data.jobs || [])
      console.log('✅ Loaded', data.jobs?.length || 0, 'translation jobs')
    } catch (err) {
      console.error('Failed to load translation history:', err)
      setError('Failed to load translation history')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadTranslationHistory()
  }, [user])

  const handleDownload = async (job: TranslationJob) => {
    if (!job.translatedFileName || !user) return

    setDownloadingJobs(prev => new Set(prev).add(job.id))

    try {
      console.log('🔽 Starting download for job:', job.id)

      // Use the download API endpoint
      const response = await fetch('/api/translation-history/download', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          jobId: job.id,
          userId: user.uid
        })
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || `HTTP ${response.status}`)
      }

      // Get the file content as blob
      const blob = await response.blob()

      // Create download link
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = job.translatedFileName
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)

      console.log('✅ Download completed successfully')
    } catch (err) {
      console.error('Download failed:', err)
      alert(`Download failed: ${err instanceof Error ? err.message : 'Unknown error'}`)
    } finally {
      setDownloadingJobs(prev => {
        const newSet = new Set(prev)
        newSet.delete(job.id)
        return newSet
      })
    }
  }

  const getLanguageName = (code?: string) => {
    if (!code) return 'Unknown'
    const languages: Record<string, string> = {
      // Evropské jazyky
      'en': 'English', 'es': 'Spanish', 'fr': 'French', 'de': 'German', 'it': 'Italian',
      'pt': 'Portuguese', 'ru': 'Russian', 'cs': 'Czech', 'pl': 'Polish', 'nl': 'Dutch',
      'sv': 'Swedish', 'da': 'Danish', 'no': 'Norwegian', 'fi': 'Finnish', 'tr': 'Turkish',
      'sk': 'Slovak', 'hu': 'Hungarian', 'ro': 'Romanian', 'bg': 'Bulgarian', 'hr': 'Croatian',
      'sl': 'Slovenian', 'et': 'Estonian', 'lv': 'Latvian', 'lt': 'Lithuanian', 'uk': 'Ukrainian',
      'be': 'Belarusian', 'mk': 'Macedonian', 'sr': 'Serbian', 'bs': 'Bosnian', 'mt': 'Maltese',
      'is': 'Icelandic', 'ga': 'Irish', 'cy': 'Welsh', 'eu': 'Basque', 'ca': 'Catalan',
      'gl': 'Galician', 'sq': 'Albanian', 'el': 'Greek', 'lb': 'Luxembourgish',

      // Asijské jazyky
      'ja': 'Japanese', 'ko': 'Korean', 'zh': 'Chinese', 'th': 'Thai', 'vi': 'Vietnamese',
      'id': 'Indonesian', 'ms': 'Malay', 'tl': 'Filipino', 'hi': 'Hindi', 'bn': 'Bengali',
      'ur': 'Urdu', 'fa': 'Persian', 'ar': 'Arabic', 'he': 'Hebrew', 'ta': 'Tamil',
      'te': 'Telugu', 'ml': 'Malayalam', 'kn': 'Kannada', 'gu': 'Gujarati', 'pa': 'Punjabi',
      'mr': 'Marathi', 'ne': 'Nepali', 'si': 'Sinhala', 'my': 'Myanmar', 'km': 'Khmer',
      'lo': 'Lao', 'ka': 'Georgian', 'hy': 'Armenian', 'az': 'Azerbaijani', 'kk': 'Kazakh',
      'ky': 'Kyrgyz', 'uz': 'Uzbek', 'tg': 'Tajik', 'mn': 'Mongolian',

      // Africké jazyky
      'sw': 'Swahili', 'am': 'Amharic', 'zu': 'Zulu', 'xh': 'Xhosa', 'af': 'Afrikaans',
      'yo': 'Yoruba', 'ig': 'Igbo', 'ha': 'Hausa',

      // Oceánské a další jazyky
      'mi': 'Maori', 'sm': 'Samoan', 'to': 'Tongan', 'fj': 'Fijian', 'jv': 'Javanese',
      'su': 'Sundanese', 'ceb': 'Cebuano', 'haw': 'Hawaiian', 'mg': 'Malagasy',
      'qu': 'Quechua', 'gn': 'Guarani', 'eo': 'Esperanto', 'la': 'Latin'
    }
    return languages[code] || code.toUpperCase()
  }

  if (loading) {
    const content = (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="h-6 w-6 animate-spin" />
        <span className="ml-2">Loading history...</span>
      </div>
    )

    if (!showHeader) {
      return <div className={className}>{content}</div>
    }

    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Clock className="h-5 w-5" />
            <span>Translation History</span>
          </CardTitle>
          <CardDescription>
            Your recent subtitle translations
          </CardDescription>
        </CardHeader>
        <CardContent>
          {content}
        </CardContent>
      </Card>
    )
  }

  if (error) {
    const content = (
      <div className="text-center py-8">
        <p className="text-red-600 dark:text-red-400 mb-4">{error}</p>
        <Button onClick={loadTranslationHistory} variant="outline">
          <RefreshCw className="h-4 w-4 mr-2" />
          Try Again
        </Button>
      </div>
    )

    if (!showHeader) {
      return <div className={className}>{content}</div>
    }

    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Clock className="h-5 w-5" />
            <span>Translation History</span>
          </CardTitle>
          <CardDescription>
            Your recent subtitle translations
          </CardDescription>
        </CardHeader>
        <CardContent>
          {content}
        </CardContent>
      </Card>
    )
  }

  const content = (
    <>
      {jobs.length === 0 ? (
          <div className="text-center py-8">
            <FileText className="h-12 w-12 text-gray-400 dark:text-muted-foreground mx-auto mb-4" />
            <p className="text-gray-600 dark:text-muted-foreground mb-2">No translations yet</p>
            <p className="text-sm text-gray-500 dark:text-muted-foreground">
              Your completed translations will appear here
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {jobs.map((job) => (
              <div
                key={job.id}
                className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 dark:hover:bg-card transition-colors"
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center space-x-2 mb-1">
                    <h4 className="font-medium text-sm truncate">
                      {job.originalFileName}
                    </h4>
                    <Badge variant={job.status === 'completed' ? 'default' : 'secondary'}>
                      {job.status}
                    </Badge>
                  </div>
                  <div className="flex items-center space-x-4 text-xs text-gray-500 dark:text-muted-foreground">
                    <span className="flex items-center space-x-1">
                      <Globe className="h-3 w-3" />
                      <span>
                        {getLanguageName(job.sourceLanguage)} → {getLanguageName(job.targetLanguage)}
                      </span>
                    </span>
                    <span>
                      {job.subtitleCount} subtitles
                    </span>
                    <span>
                      {job.createdAt && formatDistanceToNow(new Date(job.createdAt), { addSuffix: true })}
                    </span>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  {job.status === 'completed' && job.translatedFileName && (
                    <Button
                      onClick={() => handleDownload(job)}
                      disabled={downloadingJobs.has(job.id)}
                      size="sm"
                      variant="outline"
                    >
                      {downloadingJobs.has(job.id) ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Download className="h-4 w-4" />
                      )}
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
    </>
  )

  if (!showHeader) {
    return <div className={className}>{content}</div>
  }

  return (
    <Card className={className}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center space-x-2">
              <Clock className="h-5 w-5" />
              <span>Translation History</span>
            </CardTitle>
            <CardDescription>
              Your recent subtitle translations
            </CardDescription>
          </div>
          <Button onClick={loadTranslationHistory} variant="outline" size="sm">
            <RefreshCw className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {content}
      </CardContent>
    </Card>
  )
}
