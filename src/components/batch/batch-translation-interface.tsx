'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/hooks/useAuth'
import { useDropzone } from 'react-dropzone'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { LanguageSelector } from '../translation/language-selector'
import { CreditsDisplay } from '@/components/ui/credits-display'
import {
  Upload,
  X,
  FileText,
  Archive,
  Download,
  Calculator,
  AlertCircle,
  CheckCircle,
  Clock,
  Zap,
  Eye,
  Edit3,
  Crown
} from 'lucide-react'

interface BatchFile {
  file: File
  id: string
  status: 'pending' | 'processing' | 'completed' | 'error'
  progress: number
  result?: any
  error?: string
  estimatedCost?: number
  subtitleCount?: number
}

interface BatchTranslationInterfaceProps {
  locale?: 'en' | 'cs'
}

export function BatchTranslationInterface({ locale = 'en' }: BatchTranslationInterfaceProps) {
  const { user } = useAuth()
  const router = useRouter()
  const [files, setFiles] = useState<BatchFile[]>([])
  const [targetLanguage, setTargetLanguage] = useState<string>('')
  const [translationModel, setTranslationModel] = useState<'standard' | 'premium'>('standard') // Default to cheaper option
  const [isProcessing, setIsProcessing] = useState(false)
  const [totalEstimatedCost, setTotalEstimatedCost] = useState<number>(0)
  const [totalSubtitles, setTotalSubtitles] = useState<number>(0)
  const [userCredits, setUserCredits] = useState<number | null>(null)
  const refreshCreditsRef = useRef<(() => void) | null>(null)
  const [overallProgress, setOverallProgress] = useState<number>(0)
  const [currentFileIndex, setCurrentFileIndex] = useState<number>(0)

  // Fetch user credits
  const fetchUserCredits = async () => {
    if (!user) return

    try {
      const response = await fetch(`/api/user/credits?userId=${user.uid}`)
      if (response.ok) {
        const data = await response.json()
        setUserCredits(data.credits || 0)
        console.log('💰 User credits loaded:', data.credits)
      } else {
        console.error('Failed to fetch credits:', response.status)
        setUserCredits(0)
      }
    } catch (error) {
      console.error('Failed to fetch credits:', error)
      setUserCredits(0)
    }
  }

  // Load credits when user changes
  useEffect(() => {
    if (user) {
      fetchUserCredits()
    }
  }, [user])

  // Helper function to check supported subtitle formats
  const isSupportedSubtitleFile = (fileName: string): boolean => {
    const supportedExtensions = ['.srt', '.vtt', '.ass', '.ssa', '.sub', '.sbv', '.txt']
    return supportedExtensions.some(ext => fileName.toLowerCase().endsWith(ext))
  }

  // File processing functions
  const processZipFile = async (zipFile: File): Promise<File[]> => {
    // Import JSZip dynamically
    const JSZip = (await import('jszip')).default
    const zip = new JSZip()

    try {
      const zipData = await zip.loadAsync(zipFile)
      const srtFiles: File[] = []

      for (const [filename, file] of Object.entries(zipData.files)) {
        if (isSupportedSubtitleFile(filename) && !file.dir) {
          const content = await file.async('blob')
          const subtitleFile = new File([content], filename, { type: 'text/plain' })
          srtFiles.push(subtitleFile)
        }
      }

      return srtFiles
    } catch (error) {
      console.error('Error processing ZIP file:', error)
      throw new Error('Failed to extract subtitle files from ZIP')
    }
  }

  const estimateFileCredits = async (file: File): Promise<{ cost: number, subtitleCount: number }> => {
    try {
      const text = await file.text()
      const lines = text.split('\n')
      const subtitleBlocks = lines.filter(line => line.trim() && !line.match(/^\d+$/) && !line.match(/^\d{2}:\d{2}:\d{2}/))
      const subtitleCount = Math.max(1, subtitleBlocks.length)
      const costPerChunk = translationModel === 'premium' ? 1.5 : 0.5
      const cost = Math.ceil(subtitleCount / 20) * costPerChunk

      return { cost, subtitleCount }
    } catch (error) {
      console.error('Error estimating credits for file:', file.name, error)
      const defaultCostPerChunk = translationModel === 'premium' ? 1.5 : 0.5
      return { cost: defaultCostPerChunk, subtitleCount: 20 } // Default estimate
    }
  }

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    const newFiles: BatchFile[] = []

    for (const file of acceptedFiles) {
      if (file.name.toLowerCase().endsWith('.zip')) {
        try {
          const extractedFiles = await processZipFile(file)
          for (const srtFile of extractedFiles) {
            const { cost, subtitleCount } = await estimateFileCredits(srtFile)
            newFiles.push({
              file: srtFile,
              id: `${Date.now()}-${Math.random()}`,
              status: 'pending',
              progress: 0,
              estimatedCost: cost,
              subtitleCount
            })
          }
        } catch (error) {
          console.error('Error processing ZIP file:', error)
          alert(`Error processing ZIP file: ${file.name}`)
        }
      } else if (isSupportedSubtitleFile(file.name)) {
        const { cost, subtitleCount } = await estimateFileCredits(file)
        newFiles.push({
          file,
          id: `${Date.now()}-${Math.random()}`,
          status: 'pending',
          progress: 0,
          estimatedCost: cost,
          subtitleCount
        })
      }
    }

    setFiles(prev => [...prev, ...newFiles])
  }, [])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'text/plain': ['.srt', '.vtt', '.ass', '.ssa', '.sub', '.sbv', '.txt'],
      'text/vtt': ['.vtt'],
      'application/x-subrip': ['.srt'],
      'application/zip': ['.zip'],
      'application/x-zip-compressed': ['.zip']
    },
    disabled: isProcessing
  })

  // Calculate totals when files or model change
  useEffect(() => {
    const totalCost = files.reduce((sum, file) => sum + (file.estimatedCost || 0), 0)
    const totalSubs = files.reduce((sum, file) => sum + (file.subtitleCount || 0), 0)
    setTotalEstimatedCost(totalCost)
    setTotalSubtitles(totalSubs)
  }, [files])

  // Recalculate costs when model changes
  useEffect(() => {
    const recalculateCosts = async () => {
      if (files.length === 0) return

      const updatedFiles = await Promise.all(
        files.map(async (file) => {
          const { cost } = await estimateFileCredits(file.file)
          return { ...file, estimatedCost: cost }
        })
      )

      setFiles(updatedFiles)
    }

    recalculateCosts()
  }, [translationModel])

  const removeFile = (id: string) => {
    setFiles(prev => prev.filter(file => file.id !== id))
  }

  // Handle edit button click for completed translations
  const handleEditTranslation = (file: BatchFile) => {
    if (!file.result?.translatedContent) {
      console.error('No translated content available for editing')
      return
    }

    // Store data in sessionStorage for preview page
    const previewData = {
      originalFile: file.file.name,
      sourceLanguage: 'Auto-detect',
      targetLanguage: targetLanguage,
      aiService: 'premium',
      translatedFileName: file.result.translatedFileName || `${file.file.name.replace('.srt', '')}_translated.srt`
    }

    sessionStorage.setItem('previewData', JSON.stringify(previewData))
    sessionStorage.setItem('translatedContent', file.result.translatedContent)

    // Store original content if available
    file.file.text().then(originalContent => {
      sessionStorage.setItem('originalContent', originalContent)
    }).catch(console.error)

    // Open preview page in new tab
    window.open(locale === 'cs' ? '/cs/preview' : '/preview', '_blank')
  }



  const canStartTranslation = files.length > 0 && targetLanguage && !isProcessing && user

  const startBatchTranslation = async () => {
    console.log('🚀 Starting batch translation...')
    console.log('canStartTranslation:', canStartTranslation)
    console.log('userCredits:', userCredits)
    console.log('totalEstimatedCost:', totalEstimatedCost)
    console.log('files:', files)
    console.log('targetLanguage:', targetLanguage)
    console.log('user:', user)

    if (!canStartTranslation) {
      console.log('❌ Cannot start translation - missing requirements')
      return
    }

    // Check credits only if we have the credit info loaded
    if (userCredits !== null && totalEstimatedCost > userCredits) {
      console.log('❌ Insufficient credits')
      alert(`Insufficient credits. You need ${totalEstimatedCost.toFixed(1)} credits but only have ${userCredits}.`)
      return
    }

    console.log('✅ Starting batch processing...')
    setIsProcessing(true)
    setOverallProgress(0)
    setCurrentFileIndex(0)

    try {
      console.log(`📁 Processing ${files.length} files...`)

      // Process files one by one
      for (let i = 0; i < files.length; i++) {
        const file = files[i]
        console.log(`🔄 Processing file ${i + 1}/${files.length}: ${file.file.name}`)

        // Update current file index and progress
        setCurrentFileIndex(i + 1)
        const progressPerFile = 100 / files.length
        const currentProgress = (i / files.length) * 100
        setOverallProgress(currentProgress)

        // Update file status to processing
        setFiles(prev => prev.map(f =>
          f.id === file.id ? { ...f, status: 'processing' as const, progress: 0 } : f
        ))

        try {
          // Create translation job (similar to single file translation)
          console.log('📤 Creating FormData...')
          const formData = new FormData()
          formData.append('file', file.file)
          formData.append('targetLanguage', targetLanguage)
          formData.append('sourceLanguage', 'auto')
          formData.append('aiService', 'premium')
          formData.append('userId', user.uid)
          formData.append('translationModel', translationModel) // Add model selection

          console.log('📤 Sending request to /api/translate-stream...')

          try {
            // Use streaming API for real progress updates
            const response = await fetch('/api/translate-stream', {
              method: 'POST',
              body: formData
            })

            if (!response.ok) {
              const errorText = await response.text()
              console.error('❌ API Error:', errorText)
              throw new Error(`Translation failed: ${response.statusText} - ${errorText}`)
            }

            // Handle streaming response
            const reader = response.body?.getReader()
            if (!reader) {
              throw new Error('No response body reader available')
            }

            const decoder = new TextDecoder()
            let buffer = ''
            let translationResult: any = null

            while (true) {
              const { done, value } = await reader.read()
              if (done) break

              buffer += decoder.decode(value, { stream: true })
              const lines = buffer.split('\n')
              buffer = lines.pop() || ''

              for (const line of lines) {
                if (line.startsWith('data: ')) {
                  try {
                    const data = JSON.parse(line.substring(6))

                    if (data.type === 'progress') {
                      // Update real progress from API
                      const realProgress = Math.min(data.progress || 0, 99)
                      setFiles(prev => prev.map(f =>
                        f.id === file.id ? { ...f, progress: realProgress } : f
                      ))
                      console.log(`📊 Real progress: ${data.stage} (${realProgress}%) - ${data.details || ''}`)
                    } else if (data.type === 'result' || data.type === 'complete') {
                      translationResult = data
                      // Set progress to 100% when complete
                      setFiles(prev => prev.map(f =>
                        f.id === file.id ? { ...f, progress: 100 } : f
                      ))
                    } else if (data.type === 'error') {
                      throw new Error(data.error || data.message || 'Translation failed')
                    }
                  } catch (parseError) {
                    console.warn('Failed to parse SSE data:', line, parseError)
                  }
                }
              }
            }

            if (!translationResult) {
              throw new Error('No translation result received')
            }

            const result = translationResult
            console.log('✅ Translation result:', result)

            // translate-simple returns direct response with translated content
            if (result.translatedContent) {
              console.log('💾 Saving translation to database...')

              try {
                // Save translation to database via API
                const saveResponse = await fetch('/api/batch/save-translation', {
                  method: 'POST',
                  headers: {
                    'Content-Type': 'application/json',
                  },
                  body: JSON.stringify({
                    userId: user.uid,
                    originalFileName: file.file.name,
                    targetLanguage,
                    translatedContent: result.translatedContent,
                    subtitleCount: result.subtitleCount || file.subtitleCount || 0,
                    characterCount: result.characterCount || 0
                  })
                })

                if (saveResponse.ok) {
                  const saveResult = await saveResponse.json()
                  console.log('✅ Translation saved to database and credits deducted:', saveResult)

                  // Update file status to completed
                  setFiles(prev => prev.map(f =>
                    f.id === file.id ? {
                      ...f,
                      status: 'completed' as const,
                      progress: 100,
                      result: {
                        ...result,
                        jobId: saveResult.jobId,
                        translatedFileName: saveResult.translatedFileName
                      }
                    } : f
                  ))
                } else {
                  console.error('❌ Failed to save to database:', await saveResponse.text())
                  // Still show as completed in UI, but log the error
                  setFiles(prev => prev.map(f =>
                    f.id === file.id ? {
                      ...f,
                      status: 'completed' as const,
                      progress: 100,
                      result
                    } : f
                  ))
                }

              } catch (dbError) {
                console.error('❌ Failed to save to database:', dbError)
                // Still show as completed in UI, but log the error
                setFiles(prev => prev.map(f =>
                  f.id === file.id ? {
                    ...f,
                    status: 'completed' as const,
                    progress: 100,
                    result
                  } : f
                ))
              }
            } else {
              throw new Error('No translated content in response')
            }

            // Update overall progress
            const completedProgress = ((i + 1) / files.length) * 100
            setOverallProgress(completedProgress)

            // Refresh credits after each successful translation
            await fetchUserCredits()
            if (refreshCreditsRef.current && typeof refreshCreditsRef.current === 'function') {
              try {
                refreshCreditsRef.current()
              } catch (error) {
                console.warn('Failed to refresh credits display:', error)
              }
            }

          } catch (error) {
            console.error(`Error translating file ${file.file.name}:`, error)

            // Update file status to error
            setFiles(prev => prev.map(f =>
              f.id === file.id ? {
                ...f,
                status: 'error' as const,
                progress: 0,
                error: error instanceof Error ? error.message : 'Translation failed'
              } : f
            ))
          }
        } catch (error) {
          console.error(`Error processing file ${file.file.name}:`, error)

          // Update file status to error
          setFiles(prev => prev.map(f =>
            f.id === file.id ? {
              ...f,
              status: 'error' as const,
              progress: 0,
              error: error instanceof Error ? error.message : 'File processing failed'
            } : f
          ))
        }
      }

    } catch (error) {
      console.error('❌ Batch translation error:', error)
      alert(`Batch translation failed: ${error instanceof Error ? error.message : 'Unknown error'}. Please try again.`)
    } finally {
      console.log('🏁 Batch processing finished')
      setIsProcessing(false)
      setOverallProgress(100)
      setCurrentFileIndex(files.length)
    }
  }

  const downloadFile = (file: BatchFile) => {
    if (!file.result || !file.result.translatedContent) return

    const blob = new Blob([file.result.translatedContent], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = file.result.fileName || `translated_${file.file.name}`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  const downloadAllCompleted = () => {
    const completedFiles = files.filter(f => f.status === 'completed' && f.result)

    if (completedFiles.length === 0) return

    // Create and download a ZIP file with all completed translations
    import('jszip').then(({ default: JSZip }) => {
      const zip = new JSZip()

      completedFiles.forEach(file => {
        if (file.result && file.result.translatedContent) {
          const fileName = file.result.fileName || `translated_${file.file.name}`
          zip.file(fileName, file.result.translatedContent)
        }
      })

      zip.generateAsync({ type: 'blob' }).then(content => {
        const url = URL.createObjectURL(content)
        const a = document.createElement('a')
        a.href = url
        a.download = `batch_translations_${Date.now()}.zip`
        document.body.appendChild(a)
        a.click()
        document.body.removeChild(a)
        URL.revokeObjectURL(url)
      })
    })
  }

  if (!user) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Authentication Required</CardTitle>
          <CardDescription>Please log in to use batch translation</CardDescription>
        </CardHeader>
        <CardContent>
          <Button onClick={() => router.push(locale === 'cs' ? '/cs/login' : '/login')}>
            {locale === 'cs' ? 'Přihlásit se' : 'Log In'}
          </Button>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {/* Credits Display - Centered and Larger */}
      <div className="flex justify-center">
        <div className="transform scale-125">
          <CreditsDisplay
            onRefresh={(refreshFn) => {
              refreshCreditsRef.current = refreshFn
            }}
          />
        </div>
      </div>

      {/* File Upload Area */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Upload className="h-5 w-5" />
            Upload Subtitle Files
          </CardTitle>
          <CardDescription>
            Upload multiple subtitle files (SRT, VTT, ASS, SSA, SUB, SBV, TXT) or a ZIP archive containing subtitle files
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div
            {...getRootProps()}
            className={`
              border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors
              ${isDragActive ? 'border-blue-500 bg-blue-50 dark:bg-blue-950/30' : 'border-gray-300 dark:border-border hover:border-gray-400 dark:hover:border-muted-foreground'}
              ${isProcessing ? 'opacity-50 cursor-not-allowed' : ''}
            `}
          >
            <input {...getInputProps()} />
            <div className="flex flex-col items-center gap-4">
              {isDragActive ? (
                <>
                  <Upload className="h-12 w-12 text-blue-500" />
                  <p className="text-blue-600 font-medium">Drop files here...</p>
                </>
              ) : (
                <>
                  <div className="flex gap-4">
                    <FileText className="h-12 w-12 text-gray-400" />
                    <Archive className="h-12 w-12 text-gray-400" />
                  </div>
                  <div>
                    <p className="text-gray-600 font-medium mb-2">
                      Drag & drop subtitle files or ZIP archives here
                    </p>
                    <p className="text-sm text-gray-500">
                      or click to browse files
                    </p>
                  </div>
                  <div className="flex flex-wrap justify-center gap-2">
                    <Badge variant="secondary" className="bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-300">.srt</Badge>
                    <Badge variant="secondary" className="bg-green-50 text-green-700 dark:bg-green-950 dark:text-green-300">.vtt</Badge>
                    <Badge variant="secondary" className="bg-purple-50 text-purple-700 dark:bg-purple-950 dark:text-purple-300">.ass</Badge>
                    <Badge variant="secondary" className="bg-orange-50 text-orange-700 dark:bg-orange-950 dark:text-orange-300">.ssa</Badge>
                    <Badge variant="secondary" className="bg-pink-50 text-pink-700 dark:bg-pink-950 dark:text-pink-300">.sub</Badge>
                    <Badge variant="secondary" className="bg-indigo-50 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300">.sbv</Badge>
                    <Badge variant="secondary" className="bg-slate-50 text-slate-700 dark:bg-slate-950 dark:text-slate-300">.txt</Badge>
                    <Badge variant="secondary" className="bg-gray-50 text-gray-700 dark:bg-gray-950 dark:text-gray-300">.zip</Badge>
                  </div>
                </>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Translation Model Selection */}
      {files.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Translation Quality</CardTitle>
            <CardDescription>
              Choose between standard and premium AI translation
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Button
                variant={translationModel === 'standard' ? 'default' : 'outline'}
                className={`h-auto p-4 justify-start text-left ${translationModel === 'standard'
                  ? 'bg-primary text-primary-foreground'
                  : 'hover:bg-muted'
                  }`}
                onClick={() => setTranslationModel('standard')}
                disabled={isProcessing}
              >
                <div className="flex flex-col items-start w-full">
                  <div className="flex items-center gap-2 mb-1">
                    <Zap className="h-4 w-4" />
                    <span className="font-medium">Standard</span>
                    <Badge variant="secondary" className="text-xs">Gemini Flash</Badge>
                    <Badge variant="destructive" className="text-[10px] px-1 py-0 animate-pulse">SALE</Badge>
                  </div>
                  <p className="text-xs opacity-80 mb-2">Fast, reliable translation</p>
                  <div className="text-sm font-semibold"><span className="line-through opacity-50 mr-1">0.8</span>0.5 credits per 20 lines</div>
                </div>
              </Button>

              <Button
                variant={translationModel === 'premium' ? 'default' : 'outline'}
                className={`h-auto p-4 justify-start text-left relative overflow-hidden border-2 ${translationModel === 'premium'
                  ? 'bg-gradient-to-r from-amber-400 via-yellow-500 to-amber-600 text-black border-yellow-400 shadow-lg shadow-yellow-500/25'
                  : 'bg-white dark:bg-card border-yellow-300 dark:border-yellow-600/50 hover:border-yellow-400 hover:shadow-md hover:shadow-yellow-500/20'
                  }`}
                onClick={() => setTranslationModel('premium')}
                disabled={isProcessing}
              >
                {translationModel === 'premium' && (
                  <div className="absolute inset-0 bg-gradient-to-r from-yellow-400/20 via-amber-300/20 to-yellow-500/20 animate-pulse" />
                )}
                <div className="flex flex-col items-start w-full relative z-10">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-yellow-600">👑</span>
                    <span className="font-medium">Premium</span>
                    <Badge
                      variant="secondary"
                      className="text-xs bg-amber-100 text-amber-800 border border-amber-300"
                    >
                      Gemini Pro
                    </Badge>
                    <Badge variant="destructive" className="text-[10px] px-1 py-0 animate-pulse">SALE</Badge>
                  </div>
                  <p className={`text-xs mb-2 ${translationModel === 'premium' ? 'text-amber-900' : 'text-gray-600 dark:text-gray-400'
                    }`}>
                    Best quality with context
                  </p>
                  <div className={`text-sm font-semibold ${translationModel === 'premium' ? 'text-amber-900' : 'text-gray-900 dark:text-gray-100'
                    }`}>
                    <span className="line-through opacity-50 mr-1">2.0</span>1.5 credits per 20 lines
                  </div>
                </div>
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Language Selection */}
      {files.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Target Language</CardTitle>
            <CardDescription>
              Choose the target language for all files
            </CardDescription>
          </CardHeader>
          <CardContent>
            <LanguageSelector
              value={targetLanguage}
              onValueChange={setTargetLanguage}
              placeholder="Select target language"
            />
          </CardContent>
        </Card>
      )}

      {/* Cost Estimation */}
      {files.length > 0 && (
        <Card className={translationModel === 'premium' ? 'border-2 border-yellow-300 bg-gradient-to-br from-amber-50/50 to-yellow-50/50 shadow-lg shadow-yellow-500/10' : ''}>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calculator className={`h-5 w-5 ${translationModel === 'premium' ? 'text-amber-600' : ''}`} />
              Cost Estimation
              {translationModel === 'premium' && (
                <Crown className="h-4 w-4 text-amber-600" />
              )}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">{files.length}</div>
                <div className="text-sm text-gray-600">Files</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">{totalSubtitles}</div>
                <div className="text-sm text-gray-600">Subtitles</div>
              </div>
              <div className="text-center">
                <div className={`text-2xl font-bold ${translationModel === 'premium' ? 'text-amber-600' : 'text-purple-600'}`}>
                  {totalEstimatedCost.toFixed(1)}
                </div>
                <div className="text-sm text-gray-600">Credits</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-orange-600 dark:text-orange-400">
                  {userCredits !== null ? userCredits.toFixed(1) : '...'}
                </div>
                <div className="text-sm text-gray-600 dark:text-muted-foreground">Available</div>
              </div>
            </div>

            {/* Model Info */}
            <div className="mt-4 pt-4 border-t border-gray-200 dark:border-border">
              <div className="flex justify-between items-center text-sm">
                <span className="flex items-center gap-2">
                  {translationModel === 'premium' ? (
                    <>
                      <Crown className="h-4 w-4 text-yellow-600" />
                      <span>Premium AI with context research</span>
                      <span className="text-yellow-600">👑</span>
                    </>
                  ) : (
                    <>
                      <Zap className="h-4 w-4" />
                      Standard AI translation
                    </>
                  )}
                </span>
                <span className="text-muted-foreground">
                  Rate: {translationModel === 'premium' ? '1.5' : '0.5'} credits per 20 subtitles
                </span>
              </div>
            </div>

            {userCredits !== null && totalEstimatedCost > userCredits && (
              <div className="mt-4 p-3 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800/30 rounded-lg">
                <div className="flex items-center gap-2 text-red-800 dark:text-red-300">
                  <AlertCircle className="h-4 w-4" />
                  <span className="text-sm font-medium">
                    Insufficient credits. You need {(totalEstimatedCost - userCredits).toFixed(1)} more credits.
                  </span>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Overall Progress */}
      {isProcessing && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Zap className="h-5 w-5 animate-pulse text-blue-600" />
              Batch Translation Progress
            </CardTitle>
            <CardDescription>
              Processing file {currentFileIndex} of {files.length}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex justify-between text-sm">
                <span>Overall Progress</span>
                <span>{Math.round(overallProgress)}%</span>
              </div>
              <Progress value={overallProgress} className="h-3" />
              <div className="text-center text-sm text-gray-600">
                {Math.round(overallProgress) === 100 ?
                  'All files processed!' :
                  `${files.filter(f => f.status === 'completed').length} completed, ${files.filter(f => f.status === 'error').length} failed`
                }
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* File List */}
      {files.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Files to Translate ({files.length})</CardTitle>
            <CardDescription>
              Review your files before starting batch translation
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {files.map((file) => (
                <div key={file.id} className="flex items-center gap-3 p-3 border rounded-lg">
                  <FileText className="h-5 w-5 text-gray-400 flex-shrink-0" />

                  <div className="flex-1 min-w-0">
                    <div className="font-medium truncate">{file.file.name}</div>
                    <div className="text-sm text-gray-500 dark:text-muted-foreground">
                      {file.subtitleCount} subtitles • {file.estimatedCost?.toFixed(1)} credits
                    </div>

                    {(file.status === 'processing' || file.status === 'completed') && (
                      <div className="mt-2">
                        <div className="flex justify-between text-xs text-muted-foreground mb-1">
                          <span>
                            {file.status === 'completed' ? 'Completed' :
                              (file.progress || 0) < 30 ? 'Analysis & research...' : 'Translating...'}
                          </span>
                          <span>{Math.round(file.progress || 0)}%</span>
                        </div>
                        <Progress
                          value={file.progress || 0}
                          className={`h-2 ${file.status === 'completed' ? 'bg-green-100' : ''}`}
                        />
                      </div>
                    )}

                    {file.error && (
                      <div className="text-sm text-red-600 dark:text-red-400 mt-1">{file.error}</div>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    {file.status === 'pending' && (
                      <Badge variant="secondary">
                        <Clock className="h-3 w-3 mr-1" />
                        Pending
                      </Badge>
                    )}

                    {file.status === 'processing' && (
                      <Badge className="bg-blue-500 dark:bg-primary">
                        <Zap className="h-3 w-3 mr-1" />
                        Processing
                      </Badge>
                    )}

                    {file.status === 'completed' && (
                      <>
                        <Badge className="bg-green-500 dark:bg-green-600">
                          <CheckCircle className="h-3 w-3 mr-1" />
                          Completed
                        </Badge>
                        <div className="flex gap-1">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleEditTranslation(file)}
                            title="Edit & Preview"
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => downloadFile(file)}
                            title="Download"
                          >
                            <Download className="h-4 w-4" />
                          </Button>
                        </div>
                      </>
                    )}

                    {file.status === 'error' && (
                      <Badge variant="destructive">
                        <AlertCircle className="h-3 w-3 mr-1" />
                        Error
                      </Badge>
                    )}

                    {file.status === 'pending' && (
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => removeFile(file.id)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3 mt-6">
              <Button
                onClick={startBatchTranslation}
                disabled={!canStartTranslation}
                className="flex-1"
              >
                {isProcessing ? (
                  <>
                    <Zap className="h-4 w-4 mr-2 animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    <Zap className="h-4 w-4 mr-2" />
                    Start Batch Translation
                  </>
                )}
              </Button>

              {files.some(f => f.status === 'completed') && (
                <Button
                  variant="outline"
                  onClick={downloadAllCompleted}
                >
                  <Download className="h-4 w-4 mr-2" />
                  Download All
                </Button>
              )}

              {!isProcessing && (
                <Button
                  variant="outline"
                  onClick={() => setFiles([])}
                >
                  Clear All
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
