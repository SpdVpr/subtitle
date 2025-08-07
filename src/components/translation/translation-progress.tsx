'use client'

import { Progress } from '@/components/ui/progress'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Loader2, CheckCircle, XCircle } from 'lucide-react'
import { TranslationResult } from '@/types/subtitle'
import { getLanguageCharacteristics } from '@/lib/language-characteristics'

interface TranslationProgressProps {
  result: TranslationResult
}

export function TranslationProgress({ result }: TranslationProgressProps) {
  const getStatusIcon = () => {
    switch (result.status) {
      case 'processing':
        return <Loader2 className="h-5 w-5 animate-spin text-blue-600" />
      case 'completed':
        return <CheckCircle className="h-5 w-5 text-green-600" />
      case 'failed':
        return <XCircle className="h-5 w-5 text-red-600" />
      default:
        return null
    }
  }

  const getStatusText = () => {
    switch (result.status) {
      case 'processing':
        if (result.progress < 20) return 'Processing subtitle file...'
        if (result.progress < 90) return 'Translating with Google Translate...'
        return 'Finalizing translation...'
      case 'completed':
        return 'Translation completed successfully!'
      case 'failed':
        return 'Translation failed'
      default:
        return 'Unknown status'
    }
  }

  const getStatusColor = () => {
    switch (result.status) {
      case 'processing':
        return 'text-blue-600'
      case 'completed':
        return 'text-green-600'
      case 'failed':
        return 'text-red-600'
      default:
        return 'text-gray-600'
    }
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          {getStatusIcon()}
          <span className={getStatusColor()}>{getStatusText()}</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span>Progress</span>
            <span>{result.progress}%</span>
          </div>
          <Progress value={result.progress} />
        </div>

        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <span className="font-medium">File:</span>
            <p className="text-gray-600 truncate">{result.originalFileName}</p>
          </div>
          <div>
            <span className="font-medium">Target Language:</span>
            <p className="text-gray-600">{result.targetLanguage.toUpperCase()}</p>
          </div>
          <div>
            <span className="font-medium">AI Service:</span>
            <p className="text-gray-600 capitalize">{result.aiService}</p>
          </div>
          <div>
            <span className="font-medium">Subtitles:</span>
            <p className="text-gray-600">{result.subtitleCount} entries</p>
          </div>
        </div>

        {result.status === 'failed' && result.errorMessage && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-md">
            <p className="text-sm text-red-600">{result.errorMessage}</p>
          </div>
        )}

        {result.status === 'completed' && (
          <div className="space-y-2">
            {result.processingTimeMs && (
              <div className="text-sm text-gray-600">
                Completed in {(result.processingTimeMs / 1000).toFixed(1)} seconds
              </div>
            )}
            <div className="text-sm text-green-600">
              ✓ Translation completed with intelligent timing adjustment
            </div>
            <div className="text-xs text-blue-600">
              Timing optimized for {getLanguageCharacteristics(result.targetLanguage).name}
              (reading speed: {getLanguageCharacteristics(result.targetLanguage).readingSpeed} WPM)
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
