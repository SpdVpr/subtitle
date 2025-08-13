'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { SubtitleProcessor } from '@/lib/subtitle-processor'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { FileUpload } from './file-upload'
import { LanguageSelector } from './language-selector'
import { ContextualTranslationProgress } from './contextual-translation-progress'
import { ErrorBoundary } from '../common/ErrorBoundary'
import { useTranslationProgress } from '@/hooks/use-translation-progress'
import { TranslationResult } from '@/types/subtitle'
import { useAuth } from '@/hooks/useAuth'
import { CreditsDisplay } from '@/components/ui/credits-display'
import { TranslationJobService } from '@/lib/database'
import { Download, Crown, AlertCircle, Eye } from 'lucide-react'

export function TranslationInterface() {
  const { user } = useAuth()
  const router = useRouter()
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [sourceLanguage, setSourceLanguage] = useState<string>('')
  const [targetLanguage, setTargetLanguage] = useState<string>('')
  const [isTranslating, setIsTranslating] = useState(false)
  const [translationResult, setTranslationResult] = useState<TranslationResult | null>(null)
  const [notifyOnComplete, setNotifyOnComplete] = useState<boolean>(false)
  const [estimatedCost, setEstimatedCost] = useState<number | null>(null)
  const [subtitleCount, setSubtitleCount] = useState<number | null>(null)
  const [refreshCredits, setRefreshCredits] = useState<(() => void) | null>(null)
  const [isCompleted, setIsCompleted] = useState(false)
  const {
    progress: translationProgress,
    startProgress,
    updateProgress,
    completeProgress,
    errorProgress,
    resetProgress,
    setProgress
  } = useTranslationProgress()

  // Show progress in browser tab title when translating
  const originalTitleRef = useRef<string>('')
  useEffect(() => {
    if (!originalTitleRef.current) originalTitleRef.current = document.title
    const isActive = translationProgress.isActive || (translationResult?.status === 'processing')
    if (isActive) {
      const pct = translationProgress.progress || translationResult?.progress || 0
      document.title = `${Math.max(0, Math.min(100, Math.round(pct)))}% • SubtitleAI`
    } else if (translationResult?.status === 'completed') {
      document.title = '✅ Done • SubtitleAI'
      if (notifyOnComplete && 'Notification' in window) {
        Notification.requestPermission().then((perm) => {
          if (perm === 'granted') {
            new Notification('Překlad dokončen', {
              body: selectedFile ? `${selectedFile.name} je připraven` : 'Soubor je připraven',
            })
          }
        })
      }
      // Small delay then restore
      const t = setTimeout(() => { document.title = originalTitleRef.current }, 2000)
      return () => clearTimeout(t)
    } else {
      document.title = originalTitleRef.current
    }
    return () => { /* no-op */ }
  }, [translationProgress.isActive, translationProgress.progress, translationResult?.status, translationResult?.progress, notifyOnComplete, selectedFile])

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

  // Clear navigation blockers and debug navigation issues
  useEffect(() => {
    console.log('TranslationInterface mounted')

    // Clear any potential navigation blockers
    const clearNavigationBlockers = () => {
      // Clear all beforeunload listeners
      window.onbeforeunload = null

      console.log('Navigation blockers cleared in TranslationInterface')
    }

    clearNavigationBlockers()

    // Test navigation capability
    const testNavigation = () => {
      console.log('Testing navigation capability...')
      console.log('Current URL:', window.location.href)
      console.log('Router available:', !!router)
    }

    testNavigation()

    return () => {
      console.log('TranslationInterface unmounted')
      // Clear blockers on unmount too
      window.onbeforeunload = null
    }
  }, [router])

  // Force navigation function for testing
  const forceNavigate = (path: string) => {
    console.log('Force navigating to:', path)
    try {
      router.push(path)
    } catch (error) {
      console.error('Router.push failed:', error)
      // Fallback to window.location
      window.location.href = path
    }
  }

  // Note: Removed beforeunload listener as it was causing navigation issues
  // Users can navigate freely, but we'll add a visual warning in the UI instead

  const handleFileSelect = async (file: File) => {
    setSelectedFile(file)
    setTranslationResult(null)
    resetProgress()
    
    // Calculate estimated cost
    try {
      const fileContent = await file.text()
      const subtitleEntries = SubtitleProcessor.parseSRT(fileContent)
      const count = subtitleEntries.length
      setSubtitleCount(count)
      
      // Calculate cost based on subtitle count (premium service only)
      const chunksNeeded = Math.ceil(count / 20) // Approximately 20 subtitles per chunk
      const costPerChunk = 0.4 // Premium AI service rate
      const estimated = chunksNeeded * costPerChunk
      setEstimatedCost(estimated)
    } catch (error) {
      console.error('Failed to calculate estimated cost:', error)
      setEstimatedCost(null)
      setSubtitleCount(null)
    }
  }

  const handleFileRemove = () => {
    setSelectedFile(null)
    setTranslationResult(null)
    setEstimatedCost(null)
    setSubtitleCount(null)
    resetProgress()
  }

  // Recalculate cost when subtitle count changes (premium service only)
  useEffect(() => {
    if (selectedFile && subtitleCount) {
      const chunksNeeded = Math.ceil(subtitleCount / 20)
      const costPerChunk = 0.4 // Premium AI service rate
      const estimated = chunksNeeded * costPerChunk
      setEstimatedCost(estimated)
    }
  }, [subtitleCount])

  const handleTranslate = async () => {
    if (!selectedFile || !targetLanguage) return

    // Check if user is logged in
    if (!user) {
      alert('Please log in to use translation services. You will be redirected to the login page.')
      router.push('/login')
      return
    }

    setIsTranslating(true)
    setIsCompleted(false)
    startProgress()

    const result: TranslationResult = {
      id: Date.now().toString(),
      originalFileName: selectedFile.name,
      translatedFileName: `${selectedFile.name.replace('.srt', '')}_${targetLanguage}.srt`,
      targetLanguage,
      sourceLanguage: sourceLanguage === 'auto' || !sourceLanguage ? 'auto' : sourceLanguage,
      aiService: 'premium',
      status: 'processing',
      progress: 0,
      subtitleCount: 0
    }

    setTranslationResult(result)

    try {
      // Step 1: Process the file
      result.progress = 10
      setTranslationResult({ ...result })

      const fileContent = await selectedFile.text()
      const subtitleFile = {
        content: fileContent,
        entries: SubtitleProcessor.parseSRT(fileContent)
      }

      if (subtitleFile.entries.length === 0) {
        throw new Error('No valid subtitles found in the file')
      }

      result.subtitleCount = subtitleFile.entries.length
      setTranslationResult({ ...result })

      console.log('🚀 Using premium AI translation service')

      // Check if user is logged in
      if (!user?.uid) {
        throw new Error('Please log in to use translation services')
      }

      console.log('👤 User ID:', user.uid)

      // Start progress tracking for premium service via streaming endpoint
      const formData = new FormData()
      formData.append('file', selectedFile)
      formData.append('targetLanguage', targetLanguage)
      formData.append('sourceLanguage', sourceLanguage === 'auto' ? '' : sourceLanguage)
      formData.append('userId', user.uid)

      console.log('📤 Starting streamed translation via /api/translate-stream')
      let response = await fetch('/api/translate-stream', {
        method: 'POST',
        body: formData
      })

      // If streaming fails with 405, try simple endpoint
      if (response.status === 405) {
        console.log('🔄 Streaming failed with 405, trying simple endpoint...')

        response = await fetch('/api/translate-simple', {
          method: 'POST',
          body: formData
        })

        if (!response.ok) {
          const errorText = await response.text()
          throw new Error(`Simple translation failed: ${response.status} ${errorText}`)
        }

        // Handle simple response (not streaming)
        const simpleResult = await response.json()

        if (simpleResult.status === 'completed') {
          result.status = 'completed'
          result.progress = 100
          result.downloadUrl = URL.createObjectURL(new Blob([simpleResult.translatedContent], { type: 'text/plain' }))
          result.translatedFileName = simpleResult.translatedFileName
          result.processingTimeMs = simpleResult.processingTimeMs || (Date.now() - parseInt(result.id))
          setTranslationResult({ ...result })

          // Persist preview data
          try {
            sessionStorage.setItem('previewData', JSON.stringify({
              originalFile: selectedFile?.name,
              translatedFileName: result.translatedFileName,
              sourceLanguage: sourceLanguage === 'auto' || !sourceLanguage ? 'auto' : sourceLanguage,
              targetLanguage: targetLanguage,
              aiService: 'premium'
            }))
            sessionStorage.setItem('translatedContent', simpleResult.translatedContent)
            try { sessionStorage.setItem('originalContent', subtitleFile.content) } catch {}
          } catch {}

          if (!isCompleted) {
            setIsCompleted(true)
            try {
              completeProgress()
            } catch (progressError) {
              console.warn('Complete progress failed:', progressError)
            }
            // Refresh credits display
            if (typeof refreshCredits === 'function') {
              try { refreshCredits() } catch (e) { console.warn('refreshCredits failed', e) }
            }

            // Save translation to database for history
            if (user) {
              try {
                await TranslationJobService.createJob({
                  userId: user.uid,
                  type: 'single',
                  status: 'completed',
                  originalFileName: selectedFile.name,
                  originalFileSize: selectedFile.size,
                  translatedFileName: simpleResult.translatedFileName,
                  sourceLanguage: sourceLanguage === 'auto' ? undefined : sourceLanguage,
                  targetLanguage: targetLanguage,
                  aiService: 'openai', // Premium service
                  startedAt: new Date(parseInt(result.id)) as any,
                  completedAt: new Date() as any,
                  processingTimeMs: simpleResult.processingTimeMs || (Date.now() - parseInt(result.id)),
                  subtitleCount: subtitleFile.subtitles?.length || 0,
                  characterCount: simpleResult.translatedContent.length,
                  confidence: 0.95, // Assume high confidence for premium service
                  translatedContent: simpleResult.translatedContent, // Store the actual content
                  metadata: {
                    userAgent: navigator.userAgent,
                    fileFormat: 'srt'
                  }
                })
                console.log('✅ Translation saved to history')
              } catch (error) {
                console.warn('Failed to save translation to history:', error)
              }
            }
          }
          return
        } else {
          throw new Error(simpleResult.error || 'Simple translation failed')
        }
      }

      if (!response.ok || !response.body) {
        const t = await response.text()
        throw new Error(`Stream failed: ${response.status} ${t}`)
      }

      const reader = response.body.getReader()
      const decoder = new TextDecoder()

      let pending = ''
      let finalContent: string | null = null
      let finalFileName: string | null = null

      while (true) {
        const { done, value } = await reader.read()
        if (done) break
        const chunk = decoder.decode(value, { stream: true })
        pending += chunk

        const parts = pending.split('\n\n')
        pending = parts.pop() || ''

        for (const part of parts) {
          if (!part.startsWith('data: ')) continue
          const json = part.slice(6).trim()
          if (!json) continue
          try {
            const msg = JSON.parse(json)
            if (msg.type === 'progress') {
              try {
                // Validate stage before calling updateProgress
                const validStages = ['initializing', 'analyzing', 'researching', 'analyzing_content', 'translating', 'finalizing', 'completed', 'error']
                const stage = validStages.includes(msg.stage) ? msg.stage : 'translating'
                const progress = typeof msg.progress === 'number' ? msg.progress : 50
                const details = typeof msg.details === 'string' ? msg.details : 'Processing...'

                console.log('🔄 Progress update:', { stage, progress, details })
                updateProgress(stage, progress, details)
              } catch (progressError) {
                console.error('❌ Progress update failed:', progressError)
                // Continue without breaking the translation
              }
            } else if (msg.type === 'result' && msg.status === 'completed') {
              finalContent = msg.translatedContent
              finalFileName = msg.translatedFileName
            } else if (msg.type === 'error') {
              throw new Error(msg.message || 'Streamed translation error')
            }
          } catch (e) {
            console.warn('Failed to parse SSE chunk:', e)
          }
        }
      }

      if (!finalContent) {
        throw new Error('Stream ended without result')
      }

      result.status = 'completed'
      result.progress = 100
      result.downloadUrl = URL.createObjectURL(new Blob([finalContent], { type: 'text/plain' }))
      result.translatedFileName = finalFileName || `${selectedFile.name.replace('.srt', '')}_${targetLanguage}.srt`
      result.processingTimeMs = Date.now() - parseInt(result.id)
      setTranslationResult({ ...result })

      // Persist preview data and contents for /preview
      try {
        sessionStorage.setItem('previewData', JSON.stringify({
          originalFile: selectedFile?.name,
          translatedFileName: result.translatedFileName,
          sourceLanguage: sourceLanguage === 'auto' || !sourceLanguage ? 'auto' : sourceLanguage,
          targetLanguage: targetLanguage,
          aiService: 'premium'
        }))
        sessionStorage.setItem('translatedContent', finalContent)
        // Save original content for side-by-side if user provided it (from processed file)
        try { sessionStorage.setItem('originalContent', subtitleFile.content) } catch {}
      } catch {}

      // Translation completed successfully
      if (!isCompleted) {
        setIsCompleted(true)
        try {
          completeProgress()
        } catch (progressError) {
          console.warn('Complete progress failed:', progressError)
        }
        // Refresh credits display
        if (typeof refreshCredits === 'function') {
          try { refreshCredits() } catch (e) { console.warn('refreshCredits failed', e) }
        }

        // Save translation to database for history
        if (user) {
          try {
            await TranslationJobService.createJob({
              userId: user.uid,
              type: 'single',
              status: 'completed',
              originalFileName: selectedFile.name,
              originalFileSize: selectedFile.size,
              translatedFileName: finalFileName || `${selectedFile.name.replace('.srt', '')}_${targetLanguage}.srt`,
              sourceLanguage: sourceLanguage === 'auto' ? undefined : sourceLanguage,
              targetLanguage: targetLanguage,
              aiService: 'openai', // Premium service
              startedAt: new Date(parseInt(result.id)) as any,
              completedAt: new Date() as any,
              processingTimeMs: Date.now() - parseInt(result.id),
              subtitleCount: subtitleFile.subtitles?.length || 0,
              characterCount: finalContent.length,
              confidence: 0.95, // Assume high confidence for premium service
              translatedContent: finalContent, // Store the actual content
              metadata: {
                userAgent: navigator.userAgent,
                fileFormat: 'srt'
              }
            })
            console.log('✅ Translation saved to history')
          } catch (error) {
            console.warn('Failed to save translation to history:', error)
          }
        }
      }
    } catch (error) {
      console.error('Translation error:', error)

      // Extract meaningful error message
      let errorMessage = 'Translation failed'
      if (error instanceof Error) {
        errorMessage = error.message
      } else if (typeof error === 'string') {
        errorMessage = error
      }

      result.status = 'failed'
      result.error = errorMessage
      setTranslationResult({ ...result })

      // Cleanup progress tracking on error
      try {
        errorProgress(errorMessage)
      } catch (progressError) {
        console.error('❌ Error progress update failed:', progressError)
      }

      try {
        const cleanup = (window as any).cleanupProgressTracking
        if (typeof cleanup === 'function') {
          cleanup()
        }
      } catch (e) {
        console.warn('cleanupProgressTracking failed:', e)
      }
    } finally {
      setIsTranslating(false)
    }
  }

  const handleDownload = () => {
    if (!translationResult?.downloadUrl) return

    try {
      const link = document.createElement('a')
      link.href = translationResult.downloadUrl
      link.download = translationResult.translatedFileName || 'translated.srt'
      link.style.display = 'none'

      document.body.appendChild(link)
      link.click()

      // Cleanup with delay to ensure download starts
      setTimeout(() => {
        try {
          document.body.removeChild(link)
          // Revoke blob URL to free memory
          if (translationResult.downloadUrl.startsWith('blob:')) {
            URL.revokeObjectURL(translationResult.downloadUrl)
          }
        } catch (cleanupError) {
          console.warn('Download cleanup failed:', cleanupError)
        }
      }, 100)

    } catch (error) {
      console.error('Download failed:', error)
      // Fallback: try to open in new tab
      try {
        window.open(translationResult.downloadUrl, '_blank')
      } catch (fallbackError) {
        console.error('Fallback download failed:', fallbackError)
      }
    }
  }

  const canTranslate = selectedFile && targetLanguage && !isTranslating && user

  return (
    <div className="space-y-6">
      {/* Debug Navigation Panel */}
      <Card className="border-blue-500 bg-blue-50">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <span className="text-blue-800 font-medium">Navigation Debug</span>
            <div className="flex space-x-2">
              <Button
                size="sm"
                variant="outline"
                onClick={() => forceNavigate('/')}
              >
                Router Home
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => forceNavigate('/dashboard')}
              >
                Router Dashboard
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => {
                  console.log('Direct window.location to home')
                  window.location.href = '/'
                }}
              >
                Direct Home
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => {
                  console.log('Window.location.replace to dashboard')
                  window.location.replace('/dashboard')
                }}
              >
                Replace Dashboard
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => window.location.reload()}
              >
                Reload Page
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Translation in Progress Warning */}
      {(isTranslating || translationProgress.isActive) && (
        <Card className="border-orange-500 bg-orange-50">
          <CardContent className="p-4">
            <div className="flex items-center space-x-2 text-orange-800">
              <AlertCircle className="h-5 w-5" />
              <span className="font-medium">Translation in progress</span>
              <span className="text-sm">- Please wait for completion before navigating away</span>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Header */}
      <div className="text-center space-y-2">
        <div className="flex items-center justify-center space-x-2">
          <Crown className="h-6 w-6 text-yellow-500" />
          <h1 className="text-3xl font-bold text-gray-900">AI Subtitle Translation</h1>
        </div>
        <p className="text-gray-600">Premium AI-powered subtitle translation service</p>
        <div className="flex items-center justify-center space-x-4 text-sm text-gray-500">
          <span>Pay-as-you-go translation system</span>
          <div className="text-right">
            <CreditsDisplay
              showBuyButton={false}
              className="text-lg"
              onRefresh={(fn) => setRefreshCredits(() => fn)}
            />
          </div>
        </div>
      </div>

      {/* File Upload */}
      <Card>
        <CardHeader>
          <CardTitle>Upload Subtitle File</CardTitle>
          <CardDescription>
            Upload your SRT subtitle file for premium AI translation
          </CardDescription>
        </CardHeader>
        <CardContent>
          <FileUpload
            onFileSelect={handleFileSelect}
            onFileRemove={handleFileRemove}
            selectedFile={selectedFile}
          />
        </CardContent>
      </Card>

      {/* Login Required Notice */}
      {!user && (
        <Card className="border-orange-500 bg-orange-50">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <AlertCircle className="h-5 w-5 text-orange-600" />
              <span>Login Required</span>
            </CardTitle>
            <CardDescription>
              You need to be logged in to use the translation service.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <p className="text-orange-700">
                Please log in to access premium AI translation services and manage your credits.
              </p>
              <Button
                onClick={() => router.push('/login')}
                className="w-full"
              >
                Log In to Continue
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Translation Settings */}
      {selectedFile && user && (
        <Card>
          <CardHeader>
            <CardTitle>Translation Settings</CardTitle>
            <CardDescription>
              Configure your translation preferences
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Source Language (optional)
                </label>
                {/* TEMP: native select to avoid Radix/React 185 */}
                <select
                  className="w-full border rounded-md p-2"
                  value={sourceLanguage}
                  onChange={(e) => setSourceLanguage(e.target.value)}
                >
                  <option value="">Auto-detect (optional)</option>
                  <option value="cs">Czech (Čeština)</option>
                  <option value="en">English</option>
                  <option value="de">German (Deutsch)</option>
                  <option value="es">Spanish (Español)</option>
                  <option value="fr">French (Français)</option>
                  <option value="it">Italian (Italiano)</option>
                  <option value="pt">Portuguese (Português)</option>
                  <option value="ru">Russian (Русский)</option>
                  <option value="ja">Japanese (日本語)</option>
                  <option value="ko">Korean (한국어)</option>
                  <option value="zh">Chinese (中文)</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Target Language *
                </label>
                {/* TEMP: native select to avoid Radix/React 185 */}
                <select
                  className="w-full border rounded-md p-2"
                  value={targetLanguage}
                  onChange={(e) => setTargetLanguage(e.target.value)}
                >
                  <option value="" disabled>Select target language</option>
                  <option value="cs">Czech (Čeština)</option>
                  <option value="en">English</option>
                  <option value="de">German (Deutsch)</option>
                  <option value="es">Spanish (Español)</option>
                  <option value="fr">French (Français)</option>
                  <option value="it">Italian (Italiano)</option>
                  <option value="pt">Portuguese (Português)</option>
                  <option value="ru">Russian (Русский)</option>
                  <option value="ja">Japanese (日本語)</option>
                  <option value="ko">Korean (한국어)</option>
                  <option value="zh">Chinese (中文)</option>
                </select>
              </div>
            </div>

            {/* Cost Estimation */}
            {selectedFile && subtitleCount && estimatedCost !== null && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium text-blue-900">Estimated Cost</h4>
                    <p className="text-sm text-blue-700">
                      {subtitleCount || 0} subtitles • {Math.ceil((subtitleCount || 0) / 20)} chunks
                    </p>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-blue-900">
                      {(estimatedCost || 0).toFixed(2)} credits
                    </div>
                    <div className="text-sm text-blue-600">
                      ≈ ${((estimatedCost || 0) / 100).toFixed(3)} USD
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Translate Button */}
            <Button
              onClick={handleTranslate}
              disabled={!canTranslate}
              className="w-full"
              size="lg"
            >
              {isTranslating ? 'Translating...' : 'Start Premium Translation'}
            </Button>

            {/* Notification Settings */}
            <div className="flex items-center space-x-2 pt-2">
              <input
                type="checkbox"
                id="notify_complete"
                checked={notifyOnComplete}
                onChange={async (e) => {
                  const next = e.target.checked
                  setNotifyOnComplete(next)
                  if (next && 'Notification' in window && Notification.permission !== 'granted') {
                    try { await Notification.requestPermission() } catch {}
                  }
                }}
              />
              <label htmlFor="notify_complete" className="text-sm text-gray-700 select-none">
                Notify me on completion (desktop notification)
              </label>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Translation Progress */}
      {isTranslating && (
        <Card>
          <CardHeader>
            <CardTitle>Translation Progress</CardTitle>
          </CardHeader>
          <CardContent>
            <ContextualTranslationProgress
              progress={translationProgress}
            />
          </CardContent>
        </Card>
      )}

      {/* Translation Results */}
      {translationResult && translationResult.status !== 'processing' && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              {translationResult.status === 'completed' ? (
                <>
                  <span className="text-green-600">✅</span>
                  <span>Translation Completed</span>
                </>
              ) : (
                <>
                  <AlertCircle className="h-5 w-5 text-red-500" />
                  <span>Translation Failed</span>
                </>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {translationResult.status === 'completed' ? (
              <>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="font-medium">Original:</span> {String(translationResult.originalFileName || '')}
                  </div>
                  <div>
                    <span className="font-medium">Translated:</span> {String(translationResult.translatedFileName || '')}
                  </div>
                  <div>
                    <span className="font-medium">Subtitles:</span> {translationResult.subtitleCount || 0}
                  </div>
                  <div>
                    <span className="font-medium">Processing time:</span> {translationResult.processingTimeMs ? `${(translationResult.processingTimeMs / 1000).toFixed(1)}s` : 'N/A'}
                  </div>
                </div>

                <div className="flex space-x-2">
                  <Button onClick={handleDownload} className="flex-1">
                    <Download className="h-4 w-4 mr-2" />
                    Download
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => {
                      const previewData = {
                        originalFile: selectedFile?.name,
                        translatedFileName: translationResult.translatedFileName,
                        sourceLanguage: sourceLanguage === 'auto' || !sourceLanguage ? 'auto' : sourceLanguage,
                        targetLanguage: targetLanguage,
                        aiService: 'premium'
                      }

                      // Store in sessionStorage for preview page
                      sessionStorage.setItem('previewData', JSON.stringify(previewData))
                      window.open('/preview', '_blank')
                    }}
                  >
                    <Eye className="h-4 w-4 mr-2" />
                    Preview
                  </Button>
                </div>
              </>
            ) : (
              <div className="text-red-600">
                <p>{String(translationResult.error || 'An unknown error occurred')}</p>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  )
}
