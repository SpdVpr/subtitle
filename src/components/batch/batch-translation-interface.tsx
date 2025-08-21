'use client'

import { useState, useEffect, useCallback } from 'react'
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
  Zap
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

export function BatchTranslationInterface() {
  const router = useRouter()
  const { user } = useAuth()
  const [files, setFiles] = useState<BatchFile[]>([])
  const [targetLanguage, setTargetLanguage] = useState<string>('')
  const [isProcessing, setIsProcessing] = useState(false)
  const [totalEstimatedCost, setTotalEstimatedCost] = useState<number>(0)
  const [totalSubtitles, setTotalSubtitles] = useState<number>(0)
  const [userCredits, setUserCredits] = useState<number | null>(null)
  const [refreshCredits, setRefreshCredits] = useState<(() => void) | null>(null)
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

  // File processing functions
  const processZipFile = async (zipFile: File): Promise<File[]> => {
    // Import JSZip dynamically
    const JSZip = (await import('jszip')).default
    const zip = new JSZip()
    
    try {
      const zipData = await zip.loadAsync(zipFile)
      const srtFiles: File[] = []
      
      for (const [filename, file] of Object.entries(zipData.files)) {
        if (filename.toLowerCase().endsWith('.srt') && !file.dir) {
          const content = await file.async('blob')
          const srtFile = new File([content], filename, { type: 'text/plain' })
          srtFiles.push(srtFile)
        }
      }
      
      return srtFiles
    } catch (error) {
      console.error('Error processing ZIP file:', error)
      throw new Error('Failed to extract SRT files from ZIP')
    }
  }

  const estimateFileCredits = async (file: File): Promise<{ cost: number, subtitleCount: number }> => {
    try {
      const text = await file.text()
      const lines = text.split('\n')
      const subtitleBlocks = lines.filter(line => line.trim() && !line.match(/^\d+$/) && !line.match(/^\d{2}:\d{2}:\d{2}/))
      const subtitleCount = Math.max(1, subtitleBlocks.length)
      const cost = Math.ceil(subtitleCount / 20) * 0.4
      
      return { cost, subtitleCount }
    } catch (error) {
      console.error('Error estimating credits for file:', file.name, error)
      return { cost: 0.4, subtitleCount: 20 } // Default estimate
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
      } else if (file.name.toLowerCase().endsWith('.srt')) {
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
      'text/plain': ['.srt'],
      'application/zip': ['.zip'],
      'application/x-zip-compressed': ['.zip']
    },
    disabled: isProcessing
  })

  // Calculate totals when files change
  useEffect(() => {
    const totalCost = files.reduce((sum, file) => sum + (file.estimatedCost || 0), 0)
    const totalSubs = files.reduce((sum, file) => sum + (file.subtitleCount || 0), 0)
    setTotalEstimatedCost(totalCost)
    setTotalSubtitles(totalSubs)
  }, [files])

  const removeFile = (id: string) => {
    setFiles(prev => prev.filter(file => file.id !== id))
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

          console.log('📤 Sending request to /api/translate-simple...')

          const response = await fetch('/api/translate-simple', {
            method: 'POST',
            body: formData
          })

          console.log('📥 Response status:', response.status, response.statusText)

          if (!response.ok) {
            const errorText = await response.text()
            console.error('❌ API Error:', errorText)
            throw new Error(`Translation failed: ${response.statusText} - ${errorText}`)
          }

          const result = await response.json()
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
          if (refreshCredits && typeof refreshCredits === 'function') {
            try {
              refreshCredits()
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
              error: error instanceof Error ? error.message : 'Translation failed'
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
          <Button onClick={() => router.push('/login')}>
            Log In
          </Button>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {/* Credits Display */}
      <CreditsDisplay
        onRefresh={setRefreshCredits}
      />

      {/* File Upload Area */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Upload className="h-5 w-5" />
            Upload Subtitle Files
          </CardTitle>
          <CardDescription>
            Upload multiple SRT files or a ZIP archive containing SRT files
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
                      Drag & drop SRT files or ZIP archives here
                    </p>
                    <p className="text-sm text-gray-500">
                      or click to browse files
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Badge variant="secondary">.srt files</Badge>
                    <Badge variant="secondary">.zip archives</Badge>
                  </div>
                </>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Language Selection */}
      {files.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Translation Settings</CardTitle>
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
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calculator className="h-5 w-5" />
              Cost Estimation
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
                <div className="text-2xl font-bold text-purple-600">{totalEstimatedCost.toFixed(1)}</div>
                <div className="text-sm text-gray-600">Credits</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-orange-600 dark:text-orange-400">
                  {userCredits !== null ? userCredits.toFixed(1) : '...'}
                </div>
                <div className="text-sm text-gray-600 dark:text-muted-foreground">Available</div>
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

                    {file.status === 'processing' && (
                      <Progress value={file.progress} className="mt-2" />
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
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => downloadFile(file)}
                        >
                          <Download className="h-4 w-4" />
                        </Button>
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
