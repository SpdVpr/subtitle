'use client'

import { useState, useEffect, useRef } from 'react'
import { UserService } from '@/lib/database'
import { SubtitleProcessor } from '@/lib/subtitle-processor'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { FileUpload } from './file-upload'
import { LanguageSelector } from './language-selector'
import { TranslationProgress } from './translation-progress'
import { ContextualTranslationProgress } from './contextual-translation-progress'
import { useTranslationProgress } from '@/hooks/use-translation-progress'
import { TranslationServiceFactory } from '@/lib/translation-services'
import { PremiumTranslationService } from '@/lib/premium-translation-service'
import { TranslationResult, SUPPORTED_LANGUAGES } from '@/types/subtitle'
import { getLanguageCharacteristics } from '@/lib/language-characteristics'
import { useAuth } from '@/hooks/useAuth'
import { CreditsDisplay } from '@/components/ui/credits-display'
import { Download, Crown, AlertCircle, Eye } from 'lucide-react'

export function TranslationInterface() {
  const { user } = useAuth()
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [sourceLanguage, setSourceLanguage] = useState<string>('')
  const [targetLanguage, setTargetLanguage] = useState<string>('')
  const [aiService, setAiService] = useState<'google' | 'openai' | 'premium'>('google')
  const [isTranslating, setIsTranslating] = useState(false)
  const [translationResult, setTranslationResult] = useState<TranslationResult | null>(null)
  const [notifyOnComplete, setNotifyOnComplete] = useState<boolean>(false)
  const [estimatedCost, setEstimatedCost] = useState<number | null>(null)
  const [subtitleCount, setSubtitleCount] = useState<number | null>(null)
  const {
    progress: translationProgress,
    startProgress,
    updateProgress,
    completeProgress,
    errorProgress,
    resetProgress
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
      document.title = `100% • SubtitleAI`
      // Desktop notification (optional)
      if (notifyOnComplete && 'Notification' in window) {
        if (Notification.permission === 'granted') {
          new Notification('Překlad dokončen', {
            body: selectedFile ? `${selectedFile.name} je připraven` : 'Soubor je připraven',
          })
        } else if (Notification.permission !== 'denied') {
          Notification.requestPermission().then((perm) => {
            if (perm === 'granted') {
              new Notification('Překlad dokončen', {
                body: selectedFile ? `${selectedFile.name} je připraven` : 'Soubor je připraven',
              })
            }
          })
        }
      }
      // Small delay then restore
      const t = setTimeout(() => { document.title = originalTitleRef.current }, 2000)
      return () => clearTimeout(t)
    } else {
      document.title = originalTitleRef.current
    }
    return () => { /* no-op */ }
  }, [translationProgress.isActive, translationProgress.progress, translationResult?.status, translationResult?.progress, notifyOnComplete, selectedFile])

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

      // Calculate cost based on service and subtitle count
      const chunksNeeded = Math.ceil(count / 20) // Approximately 20 subtitles per chunk
      const costPerChunk = aiService === 'premium' ? 0.2 : 0.1
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

  // Recalculate cost when AI service changes
  useEffect(() => {
    if (selectedFile && subtitleCount) {
      const chunksNeeded = Math.ceil(subtitleCount / 20)
      const costPerChunk = aiService === 'premium' ? 0.2 : 0.1
      const estimated = chunksNeeded * costPerChunk
      setEstimatedCost(estimated)
    }
  }, [aiService, subtitleCount])

  const handleTranslate = async () => {
    if (!selectedFile || !targetLanguage) return

    // Check if user is logged in
    if (!user) {
      alert('Please log in to use translation services.')
      return
    }

    setIsTranslating(true)
    
    const result: TranslationResult = {
      id: Date.now().toString(),
      originalFileName: selectedFile.name,
      translatedFileName: `${selectedFile.name.replace('.srt', '')}_${targetLanguage}.srt`,
      targetLanguage,
      sourceLanguage: sourceLanguage || 'auto',
      aiService,
      status: 'processing',
      progress: 0,
      subtitleCount: 0
    }

    setTranslationResult(result)

    try {
      // Step 1: Process the file
      result.progress = 10
      setTranslationResult({ ...result })
      
      const subtitleFile = await SubtitleProcessor.processFile(selectedFile)
      result.subtitleCount = subtitleFile.entries.length
      
      // Step 2: Prepare for translation
      result.progress = 20
      setTranslationResult({ ...result })
      
      const textChunks = aiService === 'premium'
        ? SubtitleProcessor.splitTextForPremiumTranslation(subtitleFile.entries)
        : SubtitleProcessor.splitTextForTranslation(subtitleFile.entries)

      console.log('🔧 Creating translation service for:', aiService)
      console.log('📝 Text chunks to translate:', textChunks.length)

      // For premium/openai services, use API route instead of direct client calls
      if (aiService === 'premium' || aiService === 'openai') {
        console.log('🚀 Using API route for premium/openai translation')

        // Check if user is logged in for premium services
        if (!user?.uid) {
          throw new Error('Please log in to use premium translation services')
        }

        console.log('👤 User ID:', user.uid)

        // Generate session ID for progress tracking
        const sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`

        // Start progress tracking for premium service via streaming endpoint
        if (aiService === 'premium') {
          startProgress()

          const formData = new FormData()
          formData.append('file', selectedFile)
          formData.append('targetLanguage', targetLanguage)
          formData.append('sourceLanguage', sourceLanguage)
          formData.append('userId', user.uid)

          console.log('📤 Starting streamed translation via /api/translate-stream')
          const response = await fetch('/api/translate-stream', {
            method: 'POST',
            body: formData
          })

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
                  updateProgress(msg.stage, msg.progress, msg.details)
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
              sourceLanguage: sourceLanguage || 'auto',
              targetLanguage: targetLanguage,
              aiService: aiService
            }))
            sessionStorage.setItem('translatedContent', finalContent)
            // Save original content for side-by-side if user provided it (from processed file)
            try { sessionStorage.setItem('originalContent', subtitleFile.content) } catch {}
          } catch {}

          // Translation completed successfully
          completeProgress()
          return
        }

        // Use API route for translation (OpenAI standard, non-stream)

        // Guard: only poll if jobId exists
        if (!apiResult.jobId) {
          throw new Error('No translated content or file URL available')
        }

        // Premium service uses job system - poll for completion
        console.log('🔄 Premium service: Starting job polling for jobId:', apiResult.jobId)
        let jobStatus = 'pending'
        let statusData: any = null
        let pollCount = 0
        const maxPolls = 120 // 2 minutes max

        while ((jobStatus === 'pending' || jobStatus === 'processing') && pollCount < maxPolls) {
          await new Promise(resolve => setTimeout(resolve, 1000))

          const statusResponse = await fetch(`/api/translate?jobId=${apiResult.jobId}&userId=${user.uid}`)
          statusData = await statusResponse.json()
          jobStatus = statusData.status
          pollCount++

          console.log(`🔄 Premium job polling ${pollCount}: status = ${jobStatus}`)

          if (jobStatus === 'processing') {
            // For premium service, progress is handled by SSE, but update basic progress as fallback
            result.progress = Math.min(90, 20 + (pollCount * 2))
            setTranslationResult({ ...result })
          }
        }

        if (pollCount >= maxPolls) {
          throw new Error('Premium translation timeout - please try again')
        }

        if (jobStatus === 'failed') {
          throw new Error('Translation job failed')
        }

        // Show finalizing message
        result.progress = 95
        setTranslationResult({ ...result })

        // Handle both demo jobs (with direct content) and real jobs (with file URL)
        let translatedContent: string

        if (statusData.translatedContent) {
          // Demo job - content is directly available
          console.log('📄 Using direct translated content from demo job')
          translatedContent = statusData.translatedContent
        } else if (statusData.translatedFileUrl) {
          // Real job - download from URL
          console.log('📄 Downloading translated file from URL:', statusData.translatedFileUrl)
          const downloadResponse = await fetch(statusData.translatedFileUrl)
          translatedContent = await downloadResponse.text()
        } else {
          throw new Error('No translated content or file URL available')
        }

        result.status = 'completed'
        result.progress = 100
        result.downloadUrl = URL.createObjectURL(new Blob([translatedContent], { type: 'text/plain' }))
        result.translatedFileName = statusData.translatedFileName || 'translated.srt'
        result.processingTimeMs = Date.now() - parseInt(result.id)

        setTranslationResult({ ...result })

        // Persist preview data and contents for /preview
        try {
          sessionStorage.setItem('previewData', JSON.stringify({
            originalFile: selectedFile?.name,
            translatedFileName: result.translatedFileName,
            sourceLanguage: sourceLanguage || 'auto',
            targetLanguage: targetLanguage,
            aiService: aiService
          }))
          sessionStorage.setItem('translatedContent', translatedContent)
          try { sessionStorage.setItem('originalContent', subtitleFile.content) } catch {}
        } catch {}

        // Translation completed successfully

        // Cleanup progress tracking for premium service
        if (aiService === 'premium') {
          completeProgress()
          if ((window as any).cleanupProgressTracking) {
            (window as any).cleanupProgressTracking()
          }
        }

        console.log('🎉 Premium translation completed via job system')
        return
      }

      // For other services, use client-side translation
      let translationService
      try {
        translationService = TranslationServiceFactory.create(aiService)
        console.log('✅ Translation service created:', translationService.constructor.name)
      } catch (error) {
        console.warn('Translation service creation failed, using fallback:', error)
        translationService = TranslationServiceFactory.create('google') // Safe fallback
        console.log('✅ Fallback translation service created:', translationService.constructor.name)
      }
      
      // Step 3: Translate chunks
      const translatedChunks: string[][] = []
      const totalChunks = textChunks.length

      for (let i = 0; i < textChunks.length; i++) {
        const chunk = textChunks[i]

        try {
          const translatedChunk = await translationService.translate(
            chunk,
            targetLanguage,
            sourceLanguage || undefined
          )

          translatedChunks.push(translatedChunk)

          // Update progress with more detailed info
          const progressPercent = 20 + Math.round((i + 1) / totalChunks * 60)
          result.progress = progressPercent
          setTranslationResult({
            ...result,
            progress: progressPercent
          })

          // Small delay to show progress updates
          await new Promise(resolve => setTimeout(resolve, 50))
        } catch (chunkError) {
          console.warn(`Failed to translate chunk ${i + 1}:`, chunkError)
          // Use original text if translation fails for this chunk
          translatedChunks.push(chunk)
        }
      }
      
      // Step 4: Merge results and generate file with intelligent timing
      result.progress = 90
      setTranslationResult({ ...result })

      const translatedEntries = SubtitleProcessor.mergeTranslatedChunks(
        subtitleFile.entries,
        translatedChunks,
        sourceLanguage || 'en',
        targetLanguage,
        aiService === 'premium' // Enable premium timing for premium service
      )
      
      const translatedContent = SubtitleProcessor.generateSRT(translatedEntries)
      
      // Create download blob
      const blob = new Blob([translatedContent], { type: 'text/plain' })
      const downloadUrl = URL.createObjectURL(blob)
      
      // Complete
      result.status = 'completed'
      result.progress = 100
      result.downloadUrl = downloadUrl
      result.processingTimeMs = Date.now() - parseInt(result.id)

      setTranslationResult({ ...result })

      // Persist preview data and contents for /preview
      try {
        sessionStorage.setItem('previewData', JSON.stringify({
          originalFile: selectedFile?.name,
          translatedFileName: result.translatedFileName,
          sourceLanguage: sourceLanguage || 'auto',
          targetLanguage: targetLanguage,
          aiService: aiService
        }))
        sessionStorage.setItem('translatedContent', translatedContent)
        try { sessionStorage.setItem('originalContent', subtitleFile.content) } catch {}
      } catch {}

      // Translation completed successfully
      
    } catch (error) {
      console.error('❌ Translation error occurred:', error)
      console.error('❌ Error details:', error instanceof Error ? error.message : 'Unknown error')
      result.status = 'failed'
      result.errorMessage = error instanceof Error ? error.message : 'Translation failed'
      setTranslationResult({ ...result })

      // Cleanup progress tracking on error
      if (aiService === 'premium') {
        errorProgress(error instanceof Error ? error.message : 'Translation failed')
        if ((window as any).cleanupProgressTracking) {
          (window as any).cleanupProgressTracking()
        }
      }
    } finally {
      setIsTranslating(false)
    }
  }

  const handleDownload = () => {
    if (!translationResult?.downloadUrl) return
    
    const link = document.createElement('a')
    link.href = translationResult.downloadUrl
    link.download = translationResult.translatedFileName
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const canTranslate = selectedFile && targetLanguage && !isTranslating

  return (
    <div className="space-y-6">
      {/* Credits Status */}
      {user && (
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <Crown className="h-5 w-5 text-blue-600" />
                <div>
                  <h3 className="font-semibold">Credits Balance</h3>
                  <p className="text-sm text-gray-600">
                    Pay-as-you-go translation system
                  </p>
                </div>
              </div>
              <div className="text-right">
                <CreditsDisplay showBuyButton={false} className="text-lg" />
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Translate Subtitles</CardTitle>
          <CardDescription>
            Upload your SRT file and select target language for real Google Translate translation.
            <br />
            <a
              href="/sample.srt"
              download="sample.srt"
              className="text-blue-600 hover:underline text-sm"
            >
              Download sample SRT file
            </a> to test the translation.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* File Upload */}
          <div>
            <label className="block text-sm font-medium mb-2">
              Subtitle File
            </label>
            <FileUpload
              onFileSelect={handleFileSelect}
              selectedFile={selectedFile}
              onFileRemove={handleFileRemove}
              disabled={isTranslating}
            />
          </div>

          {/* Language Selection */}
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">
                Source Language (Optional)
              </label>
              <LanguageSelector
                value={sourceLanguage}
                onValueChange={setSourceLanguage}
                placeholder="Auto-detect"
                disabled={isTranslating}
                excludeLanguage={targetLanguage}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">
                Target Language *
              </label>
              <LanguageSelector
                value={targetLanguage}
                onValueChange={setTargetLanguage}
                placeholder="Select target language"
                disabled={isTranslating}
                excludeLanguage={sourceLanguage}
              />
              {targetLanguage && (
                <div className="mt-2 p-2 bg-blue-50 rounded-md text-xs">
                  <div className="font-medium text-blue-800">
                    {getLanguageCharacteristics(targetLanguage).name} characteristics:
                  </div>
                  <div className="text-blue-600 mt-1">
                    Timing adjustment: {(getLanguageCharacteristics(targetLanguage).timingMultiplier * 100).toFixed(0)}% of original
                    {getLanguageCharacteristics(targetLanguage).timingMultiplier > 1.1 &&
                      " (longer timing for complex language)"}
                    {getLanguageCharacteristics(targetLanguage).timingMultiplier < 0.9 &&
                      " (shorter timing for fast-reading language)"}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* AI Service Selection */}
          <div>
            <label className="block text-sm font-medium mb-2">
              Translation Service
            </label>
            <Select value={aiService} onValueChange={(value: 'google' | 'openai' | 'premium') => setAiService(value)} disabled={isTranslating}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="google">
                  <div className="flex flex-col">
                    <span>Google Translate (Free)</span>
                    <span className="text-xs text-green-600">✓ Real translation • Auto-retiming</span>
                  </div>
                </SelectItem>
                <SelectItem value="openai">
                  <div className="flex flex-col">
                    <span>OpenAI GPT (Standard)</span>
                    <span className="text-xs text-gray-500">AI translation • Requires API key</span>
                  </div>
                </SelectItem>
                <SelectItem value="premium">
                  <div className="flex flex-col">
                    <span>🎬 Premium Context AI (~0.2 credits/20 lines)</span>
                    <span className="text-xs text-blue-600">✓ Context-aware • Film/TV optimized</span>
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
            {aiService === 'google' && (
              <p className="text-xs text-gray-600 mt-1">
                Using free Google Translate with intelligent language-aware timing adjustment
              </p>
            )}
            {aiService === 'openai' && (
              <p className="text-xs text-gray-600 mt-1">
                Using OpenAI GPT for natural AI translation
              </p>
            )}
            {aiService === 'premium' && (
              <p className="text-xs text-blue-600 mt-1">
                🎬 Using Premium Context AI - analyzes film/TV context for optimal translation
              </p>
            )}

            {/* Optional desktop notification toggle */}
            <div className="mt-4 flex items-center gap-2">
              <input
                id="notify_complete"
                type="checkbox"
                className="h-4 w-4"
                disabled={isTranslating}
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
          </div>

          {/* Cost Estimation */}
          {selectedFile && subtitleCount && estimatedCost !== null && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium text-blue-900">Estimated Cost</h4>
                  <p className="text-sm text-blue-700">
                    {subtitleCount} subtitles • {Math.ceil(subtitleCount / 20)} chunks
                  </p>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-blue-900">
                    {estimatedCost.toFixed(2)} credits
                  </div>
                  <div className="text-sm text-blue-600">
                    ≈ ${(estimatedCost / 100).toFixed(3)} USD
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
            {isTranslating ? 'Translating...' : 'Start Translation'}
          </Button>
        </CardContent>
      </Card>

      {/* Translation Progress */}
      {translationResult && (
        <>
          {/* Show contextual progress for premium service */}
          {aiService === 'premium' && translationProgress.isActive && (
            <ContextualTranslationProgress progress={translationProgress} />
          )}

          {/* Show regular progress for other services or when contextual progress is not active */}
          {(aiService !== 'premium' || !translationProgress.isActive) && (
            <TranslationProgress result={translationResult} />
          )}
        </>
      )}

      {/* Download Section */}
      {translationResult?.status === 'completed' && (
        <Card>
          <CardHeader>
            <CardTitle>Translation Complete</CardTitle>
            <CardDescription>
              Your translated subtitle file is ready for download or preview
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <Button onClick={handleDownload} size="lg" className="w-full">
                <Download className="h-4 w-4 mr-2" />
                Download {translationResult.translatedFileName}
              </Button>

              <Button
                variant="outline"
                size="lg"
                className="w-full"
                onClick={() => {
                  // Create preview URL with translation data
                  const previewData = {
                    originalFile: selectedFile?.name,
                    translatedFileName: translationResult.translatedFileName,
                    sourceLanguage: sourceLanguage || 'auto',
                    targetLanguage: targetLanguage,
                    aiService: aiService
                  }

                  // Store in sessionStorage for preview page
                  sessionStorage.setItem('previewData', JSON.stringify(previewData))
                  window.open('/preview', '_blank')
                }}
              >
                <Eye className="h-4 w-4 mr-2" />
                Preview & Edit
              </Button>
            </div>

            <div className="text-center">
              <p className="text-sm text-gray-600">
                Use Preview & Edit to review and modify translations before downloading
              </p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
