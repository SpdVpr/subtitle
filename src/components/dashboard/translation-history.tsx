'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { TranslationJobService } from '@/lib/database'
import { TranslationJob } from '@/types/database'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Download, Clock, FileText, Globe, Loader2, RefreshCw } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'

interface TranslationHistoryProps {
  className?: string
}

export function TranslationHistory({ className }: TranslationHistoryProps) {
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
      const userJobs = await TranslationJobService.getUserJobs(user.uid, 20)
      setJobs(userJobs)
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
      const response = await fetch('/api/translation-history/download', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          jobId: job.id,
          userId: user.uid
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to download file')
      }

      const blob = await response.blob()
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = job.translatedFileName
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
    } catch (err) {
      console.error('Download failed:', err)
      // For now, show an alert - in production you'd want better error handling
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
      'en': 'English',
      'cs': 'Czech',
      'de': 'German',
      'fr': 'French',
      'es': 'Spanish',
      'it': 'Italian',
      'pt': 'Portuguese',
      'ru': 'Russian',
      'ja': 'Japanese',
      'ko': 'Korean',
      'zh': 'Chinese',
      'ar': 'Arabic',
      'hi': 'Hindi',
      'pl': 'Polish',
      'nl': 'Dutch',
      'sv': 'Swedish',
      'da': 'Danish',
      'no': 'Norwegian',
      'fi': 'Finnish',
      'tr': 'Turkish',
    }
    return languages[code] || code.toUpperCase()
  }

  if (loading) {
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
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin" />
            <span className="ml-2">Loading history...</span>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (error) {
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
          <div className="text-center py-8">
            <p className="text-red-600 mb-4">{error}</p>
            <Button onClick={loadTranslationHistory} variant="outline">
              <RefreshCw className="h-4 w-4 mr-2" />
              Try Again
            </Button>
          </div>
        </CardContent>
      </Card>
    )
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
        {jobs.length === 0 ? (
          <div className="text-center py-8">
            <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600 mb-2">No translations yet</p>
            <p className="text-sm text-gray-500">
              Your completed translations will appear here
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {jobs.map((job) => (
              <div
                key={job.id}
                className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors"
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
                  <div className="flex items-center space-x-4 text-xs text-gray-500">
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
                      {job.createdAt && formatDistanceToNow(job.createdAt.toDate(), { addSuffix: true })}
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
      </CardContent>
    </Card>
  )
}
