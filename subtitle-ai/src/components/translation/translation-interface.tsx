'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { FileUpload } from './file-upload'
import { LanguageSelector } from './language-selector'
import { TranslationProgress } from './translation-progress'
import { ContextualTranslationProgress } from './contextual-translation-progress'
import { useTranslationProgress } from '@/hooks/use-translation-progress'
import { SubtitleProcessor } from '@/lib/subtitle-processor'
import { TranslationServiceFactory } from '@/lib/translation-services'
import { PremiumTranslationService } from '@/lib/premium-translation-service'
import { TranslationResult, SUPPORTED_LANGUAGES } from '@/types/subtitle'
import { getLanguageCharacteristics } from '@/lib/language-characteristics'
import { useSubscription } from '@/hooks/useSubscription'
import { useAuth } from '@/hooks/useAuth'
import { Download, Crown, AlertCircle, Eye } from 'lucide-react'
import { SUBSCRIPTION_PLANS } from '@/lib/stripe'

export function TranslationInterface() {
  const { canPerformAction, incrementUsage, subscription, usage } = useSubscription()
  const { user } = useAuth()
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [sourceLanguage, setSourceLanguage] = useState<string>('')
  const [targetLanguage, setTargetLanguage] = useState<string>('')
  const [aiService, setAiService] = useState<'google' | 'openai' | 'premium'>(
    subscription?.plan === 'premium' || subscription?.plan === 'pro' ? 'premium' : 'google'
  )
  const [isTranslating, setIsTranslating] = useState(false)
  const [translationResult, setTranslationResult] = useState<TranslationResult | null>(null)
  const {
    progress: translationProgress,
    startProgress,
    updateProgress,
    completeProgress,
    errorProgress,
    resetProgress
  } = useTranslationProgress()

  const handleFileSelect = (file: File) => {
    setSelectedFile(file)
    setTranslationResult(null)
    resetProgress()
  }

  const handleFileRemove = () => {
    setSelectedFile(null)
    setTranslationResult(null)
    resetProgress()
  }

  const handleTranslate = async () => {
    if (!selectedFile || !targetLanguage) return

    // Check subscription limits
    const translationCheck = canPerformAction('translate')
    if (!translationCheck.allowed) {
      alert(`Translation limit reached: ${translationCheck.reason}. Please upgrade your plan.`)
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

        // Start progress tracking for premium service
        if (aiService === 'premium') {
          startProgress()

          // Set up Server-Sent Events for real-time progress
          const eventSource = new EventSource(`/api/translate-progress?sessionId=${sessionId}`)

          eventSource.onmessage = (event) => {
            const data = JSON.parse(event.data)
            if (data.type === 'progress') {
              updateProgress(data.stage, data.progress, data.details)
            }
          }

          eventSource.onerror = (error) => {
            console.error('❌ Progress tracking error:', error)
            eventSource.close()
          }

          // Clean up event source when translation completes
          const cleanup = () => {
            eventSource.close()
          }

          // Store cleanup function for later use
          ;(window as any).cleanupProgressTracking = cleanup
        }

        // Use API route for translation
        const formData = new FormData()
        formData.append('file', selectedFile)
        formData.append('targetLanguage', targetLanguage)
        formData.append('sourceLanguage', sourceLanguage)
        formData.append('aiService', aiService)
        formData.append('userId', user.uid)
        formData.append('sessionId', sessionId)

        console.log('📤 Sending API request to /api/translate')
        const response = await fetch('/api/translate', {
          method: 'POST',
          body: formData
        })

        console.log('📥 API response status:', response.status, response.ok)

        if (!response.ok) {
          const errorText = await response.text()
          console.error('❌ API error response:', errorText)
          if (aiService === 'premium') {
            errorProgress(`Translation API failed: ${response.status}`)
          }
          throw new Error(`Translation API failed: ${response.status} - ${errorText}`)
        }

        const apiResult = await response.json()
        console.log('📋 API result:', apiResult)

        // If API returned inline completed result (non-premium services), skip polling
        if (apiResult.status === 'completed' && apiResult.translatedContent && aiService !== 'premium') {
          console.log('✅ API returned completed result for non-premium service, finishing translation')
          const translatedContent = apiResult.translatedContent as string
          result.status = 'completed'
          result.progress = 100
          result.downloadUrl = URL.createObjectURL(new Blob([translatedContent], { type: 'text/plain' }))
          result.translatedFileName = apiResult.translatedFileName
          result.processingTimeMs = Date.now() - parseInt(result.id)
          setTranslationResult({ ...result })
          await incrementUsage('translation')

          console.log('🎉 Translation completed via API route')
          return
        }

        // Premium service uses job system - poll for completion
        console.log('🔄 Premium service: Starting job polling for jobId:', apiResult.jobId)
        let jobStatus = 'pending'
        let statusData: any = null
        let pollCount = 0
        while (jobStatus === 'pending' || jobStatus === 'processing') {
          await new Promise(resolve => setTimeout(resolve, 1000))

          const statusResponse = await fetch(`/api/translate?jobId=${apiResult.jobId}&userId=${user.uid}`)
          statusData = await statusResponse.json()
          jobStatus = statusData.status
          pollCount++

          console.log(`🔄 Job polling ${pollCount}: status = ${jobStatus}`)

          if (jobStatus === 'processing') {
            // For premium service, progress is handled by SSE, but update basic progress as fallback
            result.progress = Math.min(90, 20 + (pollCount * 8))
            setTranslationResult({ ...result })
          }
        }

        if (jobStatus === 'failed') {
          throw new Error('Translation job failed')
        }

        // Show finalizing message
        result.progress = 95
        setTranslationResult({ ...result })

        // Download the translated file
        const downloadResponse = await fetch(statusData.translatedFileUrl)
        const translatedContent = await downloadResponse.text()

        result.status = 'completed'
        result.progress = 100
        result.downloadUrl = URL.createObjectURL(new Blob([translatedContent], { type: 'text/plain' }))
        result.translatedFileName = statusData.translatedFileName
        result.processingTimeMs = Date.now() - parseInt(result.id)

        setTranslationResult({ ...result })
        await incrementUsage('translation')

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

      // Increment usage counter
      await incrementUsage('translation')
      
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
  const currentPlan = subscription ? SUBSCRIPTION_PLANS[subscription.plan] : SUBSCRIPTION_PLANS.free
  const translationCheck = canPerformAction('translate')

  return (
    <div className="space-y-6">
      {/* Subscription Status */}
      {subscription && (
        <Card className={`${!translationCheck.allowed ? 'border-orange-500 bg-orange-50' : ''}`}>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <Crown className="h-5 w-5 text-blue-600" />
                <div>
                  <p className="font-medium">{currentPlan.name} Plan</p>
                  <p className="text-sm text-gray-600">
                    {currentPlan.limits.translationsPerMonth === -1
                      ? 'Unlimited translations'
                      : `${currentPlan.limits.translationsPerMonth - (usage?.translationsUsed || 0)} translations remaining this month`
                    }
                  </p>
                </div>
              </div>
              {!translationCheck.allowed && (
                <div className="flex items-center space-x-2 text-orange-600">
                  <AlertCircle className="h-4 w-4" />
                  <span className="text-sm">Limit reached</span>
                </div>
              )}
            </div>
            {!translationCheck.allowed && (
              <div className="mt-4 p-3 bg-orange-100 rounded-md">
                <p className="text-sm text-orange-800 mb-2">{translationCheck.reason}</p>
                <Button size="sm" onClick={() => window.location.href = '/pricing'}>
                  Upgrade Plan
                </Button>
              </div>
            )}
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
                {subscription?.plan !== 'free' && (
                  <SelectItem value="premium">
                    <div className="flex flex-col">
                      <span>🎬 Premium Context AI (Premium)</span>
                      <span className="text-xs text-blue-600">✓ Context-aware • Film/TV optimized</span>
                    </div>
                  </SelectItem>
                )}
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
          </div>

          {/* Translate Button */}
          <Button
            onClick={handleTranslate}
            disabled={!canTranslate || !translationCheck.allowed}
            className="w-full"
            size="lg"
          >
            {isTranslating ? 'Translating...' : !translationCheck.allowed ? 'Upgrade Required' : 'Start Translation'}
          </Button>

          {!translationCheck.allowed && (
            <p className="text-sm text-orange-600 text-center">
              {translationCheck.reason} - <a href="/pricing" className="underline">Upgrade your plan</a>
            </p>
          )}
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
