'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/hooks/useAuth'
import { useTranslationProgress } from '@/hooks/use-translation-progress'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { FileUpload } from './file-upload'
import { LanguageSelector } from './language-selector'
import { ContextualTranslationProgress } from './contextual-translation-progress'
import { ErrorBoundary } from '../common/ErrorBoundary'
import { SubtitleProcessor } from '@/lib/subtitle-processor'
import { TranslationResult } from '@/types/subtitle'
import { CreditsDisplay } from '@/components/ui/credits-display'
import { TranslationJobService } from '@/lib/database'
import { Download, Crown, AlertCircle, Eye, Calculator } from 'lucide-react'

export function TranslationInterface() {
  const router = useRouter()
  const { user } = useAuth()
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [sourceLanguage, setSourceLanguage] = useState<string>('auto') // Default to auto-detect
  const [targetLanguage, setTargetLanguage] = useState<string>('')
  const [isTranslating, setIsTranslating] = useState(false)
  const [translationResult, setTranslationResult] = useState<TranslationResult | null>(null)
  const [notifyOnComplete, setNotifyOnComplete] = useState<boolean>(false)
  const [estimatedCost, setEstimatedCost] = useState<number | null>(null)
  const [subtitleCount, setSubtitleCount] = useState<number | null>(null)
  const [refreshCredits, setRefreshCredits] = useState<(() => void) | null>(null)
  const [isCompleted, setIsCompleted] = useState(false)
  const [userCredits, setUserCredits] = useState<number | null>(null)
  const [retryCount, setRetryCount] = useState(0)
  const [maxRetries] = useState(2)
  const {
    progress: translationProgress,
    startProgress,
    updateProgress,
    completeProgress,
    errorProgress
  } = useTranslationProgress()
  const originalTitleRef = useRef<string>('')

  // Simple useEffect for testing
  useEffect(() => {
    console.log('TranslationInterface mounted - simple useEffect')
    return () => {
      console.log('TranslationInterface unmounted - simple useEffect')
    }
  }, [])

  // Title useEffect - this was in original code and might be problematic
  useEffect(() => {
    if (!originalTitleRef.current) originalTitleRef.current = document.title
    console.log('Title useEffect - storing original title:', originalTitleRef.current)
  }, [])

  useEffect(() => {
    if (translationProgress.isActive) {
      const pct = translationProgress.progress || 0
      const roundedPct = Math.max(0, Math.min(100, Math.round(pct)))
      document.title = `${roundedPct}% • SubtitleBot`
    } else if (translationResult?.status === 'completed') {
      document.title = '✅ Done • SubtitleBot'
      // Restore original title after delay
      const timer = setTimeout(() => {
        document.title = originalTitleRef.current || 'SubtitleBot'
      }, 3000)
      return () => clearTimeout(timer)
    } else {
      document.title = originalTitleRef.current || 'SubtitleBot'
    }
  }, [translationProgress.isActive, translationProgress.progress, translationResult?.status])

  // Separate effect for notifications to avoid blocking
  useEffect(() => {
    if (translationResult?.status === 'completed' && notifyOnComplete && selectedFile) {
      if ('Notification' in window) {
        Notification.requestPermission().then((perm) => {
          if (perm === 'granted') {
            new Notification('Překlad dokončen', {
              body: `${selectedFile.name} je připraven`,
            })
          }
        })
      }
    }
  }, [translationResult?.status, notifyOnComplete, selectedFile])

  // Cleanup blob URLs on unmount
  useEffect(() => {
    return () => {
      if (translationResult?.downloadUrl && translationResult.downloadUrl.startsWith('blob:')) {
        try {
          URL.revokeObjectURL(translationResult.downloadUrl)
        } catch (error) {
          console.warn('Failed to cleanup blob URL on unmount:', error)
        }
      }
    }
  }, [translationResult?.downloadUrl])

  // Fetch user credits
  useEffect(() => {
    const fetchCredits = async () => {
      if (!user) return

      try {
        const response = await fetch(`/api/user/credits?userId=${user.uid}`)
        if (response.ok) {
          const data = await response.json()
          setUserCredits(data.credits || 0)
        }
      } catch (error) {
        console.error('Failed to fetch credits:', error)
        setUserCredits(0)
      }
    }

    fetchCredits()
  }, [user])

  // Recalculate cost when subtitle count changes (premium service only)
  useEffect(() => {
    if (selectedFile && subtitleCount) {
      const chunksNeeded = Math.ceil(subtitleCount / 20)
      const costPerChunk = 0.4 // Premium AI service rate
      const estimated = chunksNeeded * costPerChunk
      setEstimatedCost(estimated)
    }
  }, [subtitleCount])

  const handleFileSelect = async (file: File) => {
    setSelectedFile(file)
    console.log('File selected:', file.name)

    // Parse subtitle file to count subtitles (from original code)
    try {
      const text = await file.text()
      const parsed = SubtitleProcessor.parseSRT(text)
      setSubtitleCount(parsed.length)
      console.log('Subtitle count:', parsed.length)

      // Set global variable for adaptive timeout
      ;(window as any).subtitleCount = parsed.length

      // Warn about very long files on Vercel Free plan
      if (parsed.length > 500) {
        console.warn(`⚠️ Large file detected: ${parsed.length} subtitles. May approach Vercel timeout limits.`)
      }
    } catch (error) {
      console.error('Error parsing subtitle file:', error)
      setSubtitleCount(null)
    }
  }

  const handleFileRemove = () => {
    setSelectedFile(null)
    setSubtitleCount(null)
    setEstimatedCost(null)
    console.log('File removed')
  }

  const handleTranslate = async () => {
    if (!selectedFile || !targetLanguage || !user) {
      console.log('Missing required fields for translation')
      return
    }

    console.log('Starting real translation...')
    setIsTranslating(true)
    setTranslationResult(null)
    setIsCompleted(false)

    try {
      // Start progress tracking
      startProgress()

      const formData = new FormData()
      formData.append('file', selectedFile)
      formData.append('targetLanguage', targetLanguage)
      formData.append('sourceLanguage', sourceLanguage === 'auto' ? '' : sourceLanguage)
      formData.append('userId', user.uid)

      console.log('Sending translation request...')

      // Try streaming endpoint first, fallback to simple endpoint
      let response
      try {
        response = await fetch('/api/translate-stream', {
          method: 'POST',
          body: formData,
        })

        if (response.status === 405) {
          console.log('Streaming endpoint returned 405, trying simple endpoint...')
          response = await fetch('/api/translate-simple', {
            method: 'POST',
            body: formData,
          })
        }
      } catch (error) {
        console.log('Streaming endpoint failed, trying simple endpoint...', error)
        response = await fetch('/api/translate-simple', {
          method: 'POST',
          body: formData,
        })
      }

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || `HTTP ${response.status}`)
      }

      const contentType = response.headers.get('content-type')
      console.log('🔍 Response content-type:', contentType)
      console.log('🔍 Response status:', response.status)
      console.log('🔍 Response headers:', Object.fromEntries(response.headers.entries()))

      // Always try streaming first since our API sends streaming data
      console.log('🌊 Attempting to process as streaming response...')
      await handleStreamingResponse(response)

    } catch (error) {
      console.error('Translation failed:', error)

      // Automatic retry logic
      if (retryCount < maxRetries && error instanceof Error &&
          (error.message.includes('timeout') || error.message.includes('stuck') || error.message.includes('network'))) {
        console.log(`🔄 Attempting retry ${retryCount + 1}/${maxRetries}`)
        setRetryCount(prev => prev + 1)

        // Wait a bit before retrying
        setTimeout(() => {
          handleTranslation()
        }, 3000)
        return
      }

      // Reset retry count on final failure
      setRetryCount(0)

      errorProgress(error instanceof Error ? error.message : 'Translation failed')
      setTranslationResult({
        status: 'error',
        error: error instanceof Error ? error.message : 'Translation failed'
      })
    } finally {
      setIsTranslating(false)
    }
  }

  const handleStreamingResponse = async (response: Response) => {
    console.log('🌊 handleStreamingResponse called')

    if (!response.body) {
      console.error('❌ No response body for streaming')
      throw new Error('No response body')
    }

    const reader = response.body.getReader()
    const decoder = new TextDecoder()
    let buffer = ''
    let lastProgressTime = Date.now()
    let progressStuckCount = 0

    // Adaptive timeout based on subtitle count
    const subtitleCount = window.subtitleCount || 500 // Get from global or default
    const baseTimeout = 180000 // 3 minutes base
    const timeoutPerSubtitle = 200 // 200ms per subtitle
    const adaptiveTimeout = Math.min(
      baseTimeout + (subtitleCount * timeoutPerSubtitle),
      290000 // Max 4.83 minutes (under Vercel 5 minute limit)
    )

    console.log(`🕐 Adaptive timeout set: ${Math.round(adaptiveTimeout/1000)}s for ${subtitleCount} subtitles`)

    const timeoutId = setTimeout(() => {
      console.warn(`⏰ Streaming timeout after ${Math.round(adaptiveTimeout/1000)}s - completing translation`)
      reader.cancel()
    }, adaptiveTimeout)

    // Progress monitoring to detect stuck translation (more lenient for translation phase)
    const progressMonitor = setInterval(() => {
      const now = Date.now()
      const timeSinceLastProgress = now - lastProgressTime

      // Different timeouts for different stages
      let timeoutThreshold = 60000 // Default 60 seconds
      if (handleStreamingResponse._lastStage === 'finalizing') {
        timeoutThreshold = 30000 // Only 30 seconds for finalizing
      } else if (handleStreamingResponse._lastStage === 'translating') {
        timeoutThreshold = 90000 // 90 seconds for translating
      }

      if (timeSinceLastProgress > timeoutThreshold) {
        progressStuckCount++
        console.warn(`⚠️ No progress for ${Math.round(timeSinceLastProgress/1000)}s in ${handleStreamingResponse._lastStage} stage (count: ${progressStuckCount})`)

        if (progressStuckCount >= 3) { // Reduced from 5 to 3
          console.error('❌ Translation appears stuck, cancelling...')
          reader.cancel()
          clearInterval(progressMonitor)
          throw new Error('Translation timeout - progress stuck')
        }
      }
    }, 10000) // Check every 10 seconds (more frequent)

    try {
      while (true) {
        const { done, value } = await reader.read()
        if (done) {
          console.log('🏁 Streaming completed')
          break
        }

        buffer += decoder.decode(value, { stream: true })

        // Process complete lines
        const lines = buffer.split('\n')
        buffer = lines.pop() || '' // Keep incomplete line in buffer

        for (const line of lines) {
          if (line.trim()) {
            try {
              // Remove "data: " prefix if present
              const cleanLine = line.startsWith('data: ') ? line.substring(6) : line
              if (!cleanLine.trim()) continue

              const data = JSON.parse(cleanLine)

              if (data.type === 'progress') {
                // Only log significant progress changes
                if (!handleStreamingResponse._lastProgress || Math.abs(data.progress - handleStreamingResponse._lastProgress) > 5) {
                  console.log('🔄 Frontend received progress:', data.stage, Math.round(data.progress))
                  handleStreamingResponse._lastProgress = data.progress
                }
                handleStreamingResponse._lastStage = data.stage // Track current stage
                lastProgressTime = Date.now() // Reset progress timer
                progressStuckCount = 0 // Reset stuck counter
                updateProgress(data.stage, data.progress, data.details)
              } else if (data.type === 'connected') {
                console.log('🔗 Frontend connected to stream')
              } else if (data.type === 'result' || data.type === 'complete') {
                await handleTranslationComplete(data)
                return
              } else if (data.type === 'error') {
                throw new Error(data.error || data.message)
              }
            } catch (parseError) {
              console.warn('⚠️ Failed to parse streaming line:', line, parseError)
            }
          }
        }
      }

      // Process any remaining buffer
      if (buffer.trim()) {
        try {
          const cleanLine = buffer.startsWith('data: ') ? buffer.substring(6) : buffer
          if (cleanLine.trim()) {
            const data = JSON.parse(cleanLine)

            if (data.type === 'progress') {
              lastProgressTime = Date.now() // Reset progress timer
              progressStuckCount = 0 // Reset stuck counter
              updateProgress(data.stage, data.progress, data.details)

              // Special handling for finalizing stage - expect result soon
              if (data.stage === 'finalizing' && data.progress >= 95) {
                console.log('🏁 Finalizing stage reached - expecting result soon')
              }
            } else if (data.type === 'result' || data.type === 'complete') {
              await handleTranslationComplete(data)
              return
            } else if (data.type === 'error') {
              throw new Error(data.error || data.message)
            }
          }
        } catch (parseError) {
          console.warn('⚠️ Failed to parse final buffer:', buffer, parseError)
        }
      }
    } finally {
      clearTimeout(timeoutId)
      clearInterval(progressMonitor)
      reader.releaseLock()
    }
  }

  const handleJsonResponse = async (result: any) => {
    console.log('JSON response:', result)

    if (result.jobId) {
      // Poll for job completion
      await pollJobStatus(result.jobId)
    } else if (result.translatedContent) {
      // Direct result
      await handleTranslationComplete(result)
    } else {
      throw new Error('Invalid response format')
    }
  }

  const pollJobStatus = async (jobId: string) => {
    console.log('Polling job status for:', jobId)

    const pollInterval = setInterval(async () => {
      try {
        const statusResponse = await fetch(`/api/translation-jobs/${jobId}/status`)
        if (!statusResponse.ok) throw new Error('Failed to fetch job status')

        const statusData = await statusResponse.json()
        console.log('Job status:', statusData)

        if (statusData.status === 'completed') {
          clearInterval(pollInterval)
          await handleTranslationComplete(statusData)
        } else if (statusData.status === 'failed') {
          clearInterval(pollInterval)
          throw new Error(statusData.error || 'Translation job failed')
        } else if (statusData.progress) {
          updateProgress(statusData.stage || 'processing', statusData.progress, statusData.details)
        }
      } catch (error) {
        clearInterval(pollInterval)
        throw error
      }
    }, 2000)

    // Cleanup after 10 minutes
    setTimeout(() => clearInterval(pollInterval), 600000)
  }

  const handleTranslationComplete = async (data: any) => {
    console.log('🎉 Translation completed, processing result:', data)

    if (!isCompleted) {
      setIsCompleted(true)

      try {
        completeProgress()
        console.log('✅ Progress completed successfully')
      } catch (error) {
        console.warn('⚠️ Error calling completeProgress:', error)
      }

      let downloadUrl = ''
      let translatedContent = ''

      if (data.translatedContent) {
        // Direct content (streaming result)
        translatedContent = data.translatedContent
        const blob = new Blob([translatedContent], { type: 'text/plain; charset=utf-8' })
        downloadUrl = URL.createObjectURL(blob)
        console.log(`📄 Direct content processed: ${data.subtitleCount} subtitles, ${data.characterCount} characters`)
      } else if (data.translatedFileUrl) {
        // File URL (database result)
        downloadUrl = data.translatedFileUrl
        console.log(`🔗 File URL processed: ${downloadUrl}`)
      } else {
        console.error('❌ No translated content or file URL provided:', data)
        throw new Error('No translated content or file URL provided')
      }

      const result: TranslationResult = {
        status: 'completed',
        downloadUrl,
        translatedContent,
        translatedFileName: data.translatedFileName || 'translated.srt',
        originalFileName: selectedFile?.name || 'unknown.srt'
      }

      setTranslationResult(result)
      console.log('✅ Translation result set successfully:', result.translatedFileName)
      console.log('Translation result set:', result)

      // Store translated content in sessionStorage for video player
      if (translatedContent) {
        console.log('💾 Storing translated content in sessionStorage for video player')
        sessionStorage.setItem('translatedContent', translatedContent)

        // Also store preview data for compatibility
        const previewData = {
          originalFileName: selectedFile?.name || 'unknown.srt',
          translatedFileName: result.translatedFileName,
          sourceLanguage: sourceLanguage === 'auto' ? 'en' : sourceLanguage,
          targetLanguage: targetLanguage,
          translatedContent: translatedContent
        }
        sessionStorage.setItem('previewData', JSON.stringify(previewData))
        console.log('💾 Stored preview data in sessionStorage')
      }

      // Refresh credits
      if (refreshCredits) {
        refreshCredits()
      }

      // Trigger global credits refresh for header
      console.log('🔄 Triggering global credits refresh after translation completion')
      window.dispatchEvent(new CustomEvent('refreshCredits'))
    }
  }

  const handleDownload = async () => {
    if (!translationResult?.downloadUrl) return

    try {
      console.log('Starting download...')

      if (translationResult.downloadUrl.startsWith('blob:')) {
        // Direct blob download
        const a = document.createElement('a')
        a.href = translationResult.downloadUrl
        a.download = translationResult.translatedFileName || 'translated.srt'
        document.body.appendChild(a)
        a.click()
        document.body.removeChild(a)
        console.log('Blob download completed')
      } else {
        // File URL download
        const response = await fetch(translationResult.downloadUrl)
        if (!response.ok) throw new Error('Download failed')

        const blob = await response.blob()
        const url = URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = translationResult.translatedFileName || 'translated.srt'
        document.body.appendChild(a)
        a.click()
        document.body.removeChild(a)
        URL.revokeObjectURL(url)
        console.log('File download completed')
      }
    } catch (error) {
      console.error('Download failed:', error)
      // Fallback: open in new tab
      if (translationResult.downloadUrl) {
        window.open(translationResult.downloadUrl, '_blank')
      }
    }
  }

  // Reduced console logging for performance

  return (
    <ErrorBoundary>
      <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>AI Subtitle Translation</CardTitle>
          <CardDescription>Upload your SRT file and translate it to any language</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {user && (
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Credits:</span>
              <CreditsDisplay
                userId={user.uid}
                onRefreshChange={setRefreshCredits}
              />
            </div>
          )}

          {!user && (
            <div className="p-4 bg-yellow-50 dark:bg-yellow-950/30 border border-yellow-200 dark:border-yellow-800/30 rounded-lg">
              <div className="flex items-center gap-2 text-yellow-800 dark:text-yellow-300">
                <AlertCircle className="h-4 w-4" />
                <span className="font-medium">Login Required</span>
              </div>
              <p className="text-yellow-700 dark:text-yellow-400 mt-1">
                Please log in to use the translation service.
              </p>
            </div>
          )}

          <FileUpload
            onFileSelect={handleFileSelect}
            onFileRemove={handleFileRemove}
            selectedFile={selectedFile}
            disabled={isTranslating}
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Source Language
              </label>
              <LanguageSelector
                placeholder="Select source language"
                value={sourceLanguage}
                onValueChange={setSourceLanguage}
                disabled={isTranslating}
                includeAutoDetect={true}
                excludeLanguage={targetLanguage}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Target Language
              </label>
              <LanguageSelector
                placeholder="Select target language"
                value={targetLanguage}
                onValueChange={setTargetLanguage}
                disabled={isTranslating}
                excludeLanguage={sourceLanguage === 'auto' ? '' : sourceLanguage}
              />
            </div>
          </div>

          {/* Cost Calculator */}
          {selectedFile && subtitleCount && estimatedCost && (
            <div className={`p-4 border rounded-lg ${
              userCredits !== null && userCredits < estimatedCost
                ? 'bg-red-50 dark:bg-red-950/30 border-red-200 dark:border-red-800/30'
                : 'bg-blue-50 dark:bg-blue-950/30 border-blue-200 dark:border-blue-800/30'
            }`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Calculator className={`h-5 w-5 ${
                    userCredits !== null && userCredits < estimatedCost
                      ? 'text-destructive'
                      : 'text-primary'
                  }`} />
                  <div>
                    <h4 className={`font-medium ${
                      userCredits !== null && userCredits < estimatedCost
                        ? 'text-destructive'
                        : 'text-foreground'
                    }`}>Translation Cost</h4>
                    <p className={`text-sm mt-1 ${
                      userCredits !== null && userCredits < estimatedCost
                        ? 'text-destructive/80'
                        : 'text-muted-foreground'
                    }`}>
                      {subtitleCount} subtitles • {Math.ceil(subtitleCount / 20)} batches
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <div className={`text-2xl font-bold ${
                    userCredits !== null && userCredits < estimatedCost
                      ? 'text-destructive'
                      : 'text-primary'
                  }`}>
                    {estimatedCost.toFixed(1)} credits
                  </div>
                  <p className={`text-xs ${
                    userCredits !== null && userCredits < estimatedCost
                      ? 'text-destructive/80'
                      : 'text-muted-foreground'
                  }`}>
                    ~${(estimatedCost / 100).toFixed(2)} USD
                  </p>
                </div>
              </div>

              {userCredits !== null && userCredits < estimatedCost && (
                <div className="mt-3 p-2 bg-destructive/10 border border-destructive/20 rounded">
                  <div className="flex items-center gap-2 text-destructive">
                    <AlertCircle className="h-4 w-4" />
                    <span className="font-medium text-sm">Insufficient Credits</span>
                  </div>
                  <p className="text-destructive/80 text-xs mt-1">
                    You have {userCredits.toFixed(1)} credits but need {estimatedCost.toFixed(1)} credits.
                    <a href="/buy-credits" className="underline ml-1">Buy more credits</a>
                  </p>
                </div>
              )}

              <div className={`mt-3 pt-3 border-t ${
                userCredits !== null && userCredits < estimatedCost
                  ? 'border-red-200 dark:border-red-800/30'
                  : 'border-blue-200 dark:border-blue-800/30'
              }`}>
                <div className={`flex justify-between items-center text-xs ${
                  userCredits !== null && userCredits < estimatedCost
                    ? 'text-destructive/80'
                    : 'text-primary/80'
                }`}>
                  <span>✨ Premium AI with context research</span>
                  <span>Rate: 0.4 credits per 20 subtitles</span>
                </div>
              </div>
            </div>
          )}

          <ContextualTranslationProgress
            progress={translationProgress}
            selectedFile={selectedFile}
            result={translationResult}
          />

          {translationResult?.status === 'completed' ? (
            // After translation is completed
            <div className="space-y-3">
              <Button
                onClick={handleDownload}
                className="w-full flex items-center justify-center gap-2"
                size="lg"
              >
                <Download className="h-5 w-5" />
                Download Translated Subtitles
              </Button>

              <div className="flex gap-2">
                <Button
                  onClick={() => {
                    if (translationResult?.translatedContent) {
                      // Store data in sessionStorage for preview page
                      const previewData = {
                        originalFile: selectedFile?.name || 'unknown.srt',
                        sourceLanguage: sourceLanguage === 'auto' ? 'Auto-detect' : sourceLanguage,
                        targetLanguage: targetLanguage,
                        aiService: 'openai', // We're using OpenAI for premium translation
                        translatedFileName: translationResult.translatedFileName || 'translated.srt'
                      }

                      sessionStorage.setItem('previewData', JSON.stringify(previewData))
                      sessionStorage.setItem('translatedContent', translationResult.translatedContent)

                      // If we have original content, store it too
                      if (selectedFile) {
                        selectedFile.text().then(originalContent => {
                          sessionStorage.setItem('originalContent', originalContent)
                        }).catch(console.error)
                      }

                      // Navigate to preview page
                      router.push('/preview')
                    }
                  }}
                  variant="outline"
                  className="flex-1 flex items-center gap-2"
                >
                  <Eye className="h-4 w-4" />
                  Edit & Preview
                </Button>

                <Button
                  onClick={() => {
                    // Reset for new translation
                    setTranslationResult(null)
                    setSelectedFile(null)
                    setSubtitleCount(null)
                    setEstimatedCost(null)
                  }}
                  variant="outline"
                  className="flex-1"
                >
                  New Translation
                </Button>
              </div>
            </div>
          ) : (
            // Before/during translation
            <Button
              onClick={handleTranslate}
              disabled={
                !selectedFile ||
                !targetLanguage ||
                isTranslating ||
                !user ||
                (userCredits !== null && estimatedCost !== null && userCredits < estimatedCost)
              }
              className="w-full"
              size="lg"
            >
              {isTranslating ? 'Translating...' :
               (userCredits !== null && estimatedCost !== null && userCredits < estimatedCost) ?
               'Insufficient Credits' : 'Start Translation'}
            </Button>
          )}

          {translationResult?.status === 'error' && (
            <div className="p-4 bg-destructive/10 border border-destructive/20 rounded-lg">
              <div className="flex items-center gap-2 text-destructive">
                <AlertCircle className="h-4 w-4" />
                <span className="font-medium">Translation Failed</span>
              </div>
              <p className="text-destructive/80 mt-1">{translationResult.error}</p>
            </div>
          )}

          {translationResult?.status === 'completed' && (
            <div className="p-4 bg-primary/10 border border-primary/20 rounded-lg">
              <div className="flex items-center gap-2 text-primary">
                <Crown className="h-4 w-4" />
                <span className="font-medium">Translation Completed!</span>
              </div>
              <p className="text-primary/80 mt-1">
                Your subtitle file has been translated successfully.
              </p>
            </div>
          )}
        </CardContent>
      </Card>
      </div>
    </ErrorBoundary>
  )
}
