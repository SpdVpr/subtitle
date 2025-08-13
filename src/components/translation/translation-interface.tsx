'use client'

import { useState, useEffect, useRef } from 'react'
import { SubtitleProcessor } from '@/lib/subtitle-processor'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { FileUpload } from './file-upload'
import { LanguageSelector } from './language-selector'
import { ContextualTranslationProgress } from './contextual-translation-progress'
import { useTranslationProgress } from '@/hooks/use-translation-progress'
import { TranslationResult } from '@/types/subtitle'
import { useAuth } from '@/hooks/useAuth'
import { CreditsDisplay } from '@/components/ui/credits-display'
import { Download, Crown, AlertCircle, Eye } from 'lucide-react'

export function TranslationInterface() {
  const { user } = useAuth()
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [sourceLanguage, setSourceLanguage] = useState<string>('')
  const [targetLanguage, setTargetLanguage] = useState<string>('')
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
      alert('Please log in to use translation services.')
      return
    }

    setIsTranslating(true)
    
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
          sourceLanguage: sourceLanguage === 'auto' || !sourceLanguage ? 'auto' : sourceLanguage,
          targetLanguage: targetLanguage,
          aiService: 'premium'
        }))
        sessionStorage.setItem('translatedContent', finalContent)
        // Save original content for side-by-side if user provided it (from processed file)
        try { sessionStorage.setItem('originalContent', subtitleFile.content) } catch {}
      } catch {}

      // Translation completed successfully
      completeProgress()
    } catch (error) {
      console.error('Translation error:', error)
      result.status = 'failed'
      result.error = error instanceof Error ? error.message : 'Translation failed'
      setTranslationResult({ ...result })

      // Cleanup progress tracking on error
      errorProgress(error instanceof Error ? error.message : 'Translation failed')
      if ((window as any).cleanupProgressTracking) {
        (window as any).cleanupProgressTracking()
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
            <CreditsDisplay showBuyButton={false} className="text-lg" />
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

      {/* Translation Settings */}
      {selectedFile && (
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
                <LanguageSelector
                  value={sourceLanguage}
                  onValueChange={setSourceLanguage}
                  placeholder="Auto-detect"
                  includeAutoDetect={true}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Target Language *
                </label>
                <LanguageSelector
                  value={targetLanguage}
                  onValueChange={setTargetLanguage}
                  placeholder="Select target language"
                />
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
              result={translationResult}
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
                    <span className="font-medium">Original:</span> {translationResult.originalFileName}
                  </div>
                  <div>
                    <span className="font-medium">Translated:</span> {translationResult.translatedFileName}
                  </div>
                  <div>
                    <span className="font-medium">Subtitles:</span> {translationResult.subtitleCount}
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
                <p>{translationResult.error || 'An unknown error occurred'}</p>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  )
}
