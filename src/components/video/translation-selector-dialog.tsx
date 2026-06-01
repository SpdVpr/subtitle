'use client'


import { authFetch } from '@/lib/auth-fetch'
import React, { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Calendar, FileText, Languages, Download, ChevronDown } from 'lucide-react'
import { auth } from '@/lib/firebase'

interface TranslationJob {
  id: string
  originalFileName: string
  translatedFileName?: string
  targetLanguage: string
  sourceLanguage?: string
  aiService: string
  status: string
  createdAt: string
  subtitleCount?: number
  translatedContent?: string
}

interface TranslationSelectorDialogProps {
  onTranslationSelect: (job: TranslationJob) => void
  trigger?: React.ReactNode
}

export function TranslationSelectorDialog({
  onTranslationSelect,
  trigger
}: TranslationSelectorDialogProps) {
  const [open, setOpen] = useState(false)
  const [jobs, setJobs] = useState<TranslationJob[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const loadTranslationHistory = async () => {
    try {
      setLoading(true)
      setError(null)

      const user = auth.currentUser
      if (!user) {
        setError('Please log in to load translation history')
        return
      }

      const response = await authFetch(`/api/translation-history?userId=${user.uid}&limit=10`)
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`)
      }

      const data = await response.json()
      if (!data.success) {
        throw new Error(data.error || 'Failed to load translation history')
      }

      // Filter only completed translations
      const completedJobs = data.jobs.filter((job: TranslationJob) => job.status === 'completed')
      setJobs(completedJobs)

    } catch (err) {
      console.error('Failed to load translation history:', err)
      setError(err instanceof Error ? err.message : 'Failed to load translation history')
    } finally {
      setLoading(false)
    }
  }

  const handleToggle = () => {
    if (!open && jobs.length === 0) {
      loadTranslationHistory()
    }
    setOpen(!open)
  }

  const handleJobSelect = (job: TranslationJob) => {
    onTranslationSelect(job)
    setOpen(false)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('cs-CZ', {
      day: '2-digit',
      month: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const getLanguageFlag = (lang: string) => {
    const flags: Record<string, string> = {
      // Evropské jazyky
      'en': '🇺🇸', 'es': '🇪🇸', 'fr': '🇫🇷', 'de': '🇩🇪', 'it': '🇮🇹',
      'pt': '🇵🇹', 'ru': '🇷🇺', 'cs': '🇨🇿', 'pl': '🇵🇱', 'nl': '🇳🇱',
      'sv': '🇸🇪', 'da': '🇩🇰', 'no': '🇳🇴', 'fi': '🇫🇮', 'tr': '🇹🇷',
      'sk': '🇸🇰', 'hu': '🇭🇺', 'ro': '🇷🇴', 'bg': '🇧🇬', 'hr': '🇭🇷',
      'sl': '🇸🇮', 'et': '🇪🇪', 'lv': '🇱🇻', 'lt': '🇱🇹', 'uk': '🇺🇦',
      'be': '🇧🇾', 'mk': '🇲🇰', 'sr': '🇷🇸', 'bs': '🇧🇦', 'mt': '🇲🇹',
      'is': '🇮🇸', 'ga': '🇮🇪', 'cy': '🏴󠁧󠁢󠁷󠁬󠁳󠁿', 'ca': '🏴󠁥󠁳󠁣󠁴󠁿', 'gl': '🏴󠁥󠁳󠁧󠁡󠁿',
      'sq': '🇦🇱', 'el': '🇬🇷', 'lb': '🇱🇺',

      // Asijské jazyky
      'ja': '🇯🇵', 'ko': '🇰🇷', 'zh': '🇨🇳', 'th': '🇹🇭', 'vi': '🇻🇳',
      'id': '🇮🇩', 'ms': '🇲🇾', 'tl': '🇵🇭', 'hi': '🇮🇳', 'bn': '🇧🇩',
      'ur': '🇵🇰', 'fa': '🇮🇷', 'ar': '🇸🇦', 'he': '🇮🇱', 'ta': '🇮🇳',
      'te': '🇮🇳', 'ml': '🇮🇳', 'kn': '🇮🇳', 'gu': '🇮🇳', 'pa': '🇮🇳',
      'mr': '🇮🇳', 'ne': '🇳🇵', 'si': '🇱🇰', 'my': '🇲🇲', 'km': '🇰🇭',
      'lo': '🇱🇦', 'ka': '🇬🇪', 'hy': '🇦🇲', 'az': '🇦🇿', 'kk': '🇰🇿',
      'ky': '🇰🇬', 'uz': '🇺🇿', 'tg': '🇹🇯', 'mn': '🇲🇳',

      // Africké jazyky
      'sw': '🇹🇿', 'am': '🇪🇹', 'zu': '🇿🇦', 'xh': '🇿🇦', 'af': '🇿🇦',
      'yo': '🇳🇬', 'ig': '🇳🇬', 'ha': '🇳🇬',

      // Oceánské a další
      'mi': '🇳🇿', 'sm': '🇼🇸', 'to': '🇹🇴', 'fj': '🇫🇯',
      'jv': '🇮🇩', 'su': '🇮🇩', 'ceb': '🇵🇭', 'haw': '🇺🇸', 'mg': '🇲🇬',
      'qu': '🇵🇪', 'gn': '🇵🇾', 'eo': '🌍', 'la': '🏛️'
    }
    return flags[lang] || '🌐'
  }

  return (
    <div className="relative">
      {/* Trigger Button */}
      <div onClick={handleToggle}>
        {trigger || (
          <Button variant="outline" size="sm" className="text-sm">
            <Download className="h-4 w-4 mr-2" />
            Load from Translation
            <ChevronDown className="h-4 w-4 ml-2" />
          </Button>
        )}
      </div>

      {/* Dropdown */}
      {open && (
        <div className="absolute bottom-full left-0 mb-2 w-80 z-50 shadow-lg">
          <Card className="border-2">
            <CardHeader className="pb-2 px-3 py-2">
              <CardTitle className="text-xs flex items-center gap-2 text-muted-foreground">
                <FileText className="h-3 w-3" />
                Select Translation
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0 px-3 pb-3">
              {loading && (
                <div className="text-center py-3 text-xs text-muted-foreground">
                  Loading translations...
                </div>
              )}

              {error && (
                <div className="text-center py-3 text-xs text-red-600">
                  {error}
                </div>
              )}

              {!loading && !error && jobs.length === 0 && (
                <div className="text-center py-3 text-xs text-muted-foreground">
                  No completed translations found
                </div>
              )}

              {!loading && !error && jobs.length > 0 && (
                <div className="space-y-1 max-h-48 overflow-y-auto">
                  {jobs.map((job) => (
                    <div
                      key={job.id}
                      className="p-2 border rounded hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer transition-colors"
                      onClick={() => handleJobSelect(job)}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex-1 min-w-0">
                          <h3 className="font-medium text-xs truncate mb-1">
                            {job.translatedFileName || job.originalFileName}
                          </h3>

                          <div className="flex items-center gap-2 text-xs text-muted-foreground">
                            <span className="text-xs">{formatDate(job.createdAt)}</span>
                            <span className="text-xs">
                              {getLanguageFlag(job.sourceLanguage || 'en')} → {getLanguageFlag(job.targetLanguage)}
                            </span>
                            {job.subtitleCount && (
                              <span className="text-xs">{job.subtitleCount} subs</span>
                            )}
                          </div>
                        </div>

                        <Download className="h-3 w-3 text-muted-foreground ml-2 shrink-0" />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}

      {/* Backdrop to close dropdown */}
      {open && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setOpen(false)}
        />
      )}
    </div>
  )
}
