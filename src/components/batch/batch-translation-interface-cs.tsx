'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { useDropzone } from 'react-dropzone'
import { useRouter } from 'next/navigation'
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
  Edit3
} from 'lucide-react'
import JSZip from 'jszip'
import { toast } from 'sonner'
import { useAuth } from '@/hooks/useAuth'

interface BatchFile {
  id: string
  file: File
  status: 'pending' | 'processing' | 'completed' | 'error'
  progress: number
  result?: {
    translatedContent: string
    subtitleCount: number
    characterCount: number
    jobId?: string
    translatedFileName?: string
  }
  error?: string
  subtitleCount?: number
}

export function BatchTranslationInterfaceCS() {
  const { user } = useAuth()
  const router = useRouter()
  const [files, setFiles] = useState<BatchFile[]>([])
  const [targetLanguage, setTargetLanguage] = useState<string>('')
  const [isProcessing, setIsProcessing] = useState(false)
  const [overallProgress, setOverallProgress] = useState(0)
  const refreshCreditsRef = useRef<(() => void) | null>(null)
  const [totalSubtitles, setTotalSubtitles] = useState(0)

  // Helper function to check supported subtitle formats
  const isSupportedSubtitleFile = (fileName: string): boolean => {
    const supportedExtensions = ['.srt', '.vtt', '.ass', '.ssa', '.sub', '.sbv', '.txt']
    return supportedExtensions.some(ext => fileName.toLowerCase().endsWith(ext))
  }

  // File processing functions
  const processZipFile = async (zipFile: File): Promise<File[]> => {
    try {
      const zipData = await JSZip.loadAsync(zipFile)
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
      throw new Error('Nepodařilo se extrahovat soubory titulků z ZIP archivu')
    }
  }

  const countSubtitlesInFile = async (file: File): Promise<number> => {
    try {
      const content = await file.text()
      // Simple SRT counting - count blocks separated by empty lines
      const blocks = content.trim().split(/\n\s*\n/)
      return blocks.filter(block => block.trim().length > 0).length
    } catch (error) {
      console.error('Error counting subtitles:', error)
      return 0
    }
  }

  // Handle file drop
  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    const newFiles: BatchFile[] = []

    for (const file of acceptedFiles) {
      if (file.name.toLowerCase().endsWith('.zip')) {
        try {
          const extractedFiles = await processZipFile(file)
          for (const extractedFile of extractedFiles) {
            const subtitleCount = await countSubtitlesInFile(extractedFile)
            newFiles.push({
              id: Math.random().toString(36).substr(2, 9),
              file: extractedFile,
              status: 'pending',
              progress: 0,
              subtitleCount
            })
          }
        } catch (error) {
          console.error('Error processing ZIP file:', error)
          toast.error(`Chyba při zpracování ZIP souboru: ${file.name}`)
        }
      } else if (isSupportedSubtitleFile(file.name)) {
        const subtitleCount = await countSubtitlesInFile(file)
        newFiles.push({
          id: Math.random().toString(36).substr(2, 9),
          file,
          status: 'pending',
          progress: 0,
          subtitleCount
        })
      } else {
        toast.error(`Nepodporovaný formát souboru: ${file.name}`)
      }
    }

    setFiles(prev => [...prev, ...newFiles])

    // Calculate total subtitles
    const total = newFiles.reduce((sum, file) => sum + (file.subtitleCount || 0), 0)
    setTotalSubtitles(prev => prev + total)
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
    window.open('/cs/preview', '_blank')
  }

  // Start batch translation
  const startBatchTranslation = async () => {
    if (files.length === 0) {
      toast.error('Prosím přidejte soubory k překladu')
      return
    }

    if (!targetLanguage) {
      toast.error('Prosím vyberte cílový jazyk')
      return
    }

    if (!user) {
      toast.error('Musíte být přihlášeni')
      return
    }

    setIsProcessing(true)
    setOverallProgress(0)

    // Process files sequentially
    for (let i = 0; i < files.length; i++) {
      const file = files[i]

      // Skip if already completed or has error
      if (file.status === 'completed' || file.status === 'error') {
        continue
      }

      console.log(`🔄 Processing file ${i + 1}/${files.length}: ${file.file.name}`)

      // Update file status to processing
      setFiles(prev => prev.map(f =>
        f.id === file.id ? { ...f, status: 'processing' as const, progress: 0 } : f
      ))

      try {
        // Read file content
        const content = await file.file.text()
        console.log(`📖 Read file content: ${content.length} characters`)

        // Create form data for API
        const formData = new FormData()
        formData.append('file', file.file)
        formData.append('targetLanguage', targetLanguage)
        formData.append('userId', user.uid)

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

    setIsProcessing(false)
    toast.success('Batch translation dokončen!')
  }

  // Download individual file
  const downloadFile = (file: BatchFile) => {
    if (!file.result?.translatedContent) {
      toast.error('Žádný přeložený obsah ke stažení')
      return
    }

    const blob = new Blob([file.result.translatedContent], { type: 'text/plain;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = file.result.translatedFileName || `${file.file.name.replace(/\.[^/.]+$/, '')}_translated.srt`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)

    toast.success(`Soubor ${file.file.name} stažen!`)
  }

  // Download all completed files as ZIP
  const downloadAllAsZip = async () => {
    const completedFiles = files.filter(f => f.status === 'completed' && f.result?.translatedContent)

    if (completedFiles.length === 0) {
      toast.error('Žádné dokončené překlady ke stažení')
      return
    }

    try {
      const zip = new JSZip()

      completedFiles.forEach(file => {
        if (file.result?.translatedContent) {
          const fileName = file.result.translatedFileName || `${file.file.name.replace(/\.[^/.]+$/, '')}_translated.srt`
          zip.file(fileName, file.result.translatedContent)
        }
      })

      const zipBlob = await zip.generateAsync({ type: 'blob' })
      const url = URL.createObjectURL(zipBlob)
      const link = document.createElement('a')
      link.href = url
      link.download = `batch_translations_${new Date().toISOString().split('T')[0]}.zip`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      URL.revokeObjectURL(url)

      toast.success(`Staženo ${completedFiles.length} přeložených souborů jako ZIP`)
    } catch (error) {
      console.error('Error creating ZIP:', error)
      toast.error('Nepodařilo se vytvořit ZIP archiv')
    }
  }

  // Calculate statistics
  const completedCount = files.filter(f => f.status === 'completed').length
  const errorCount = files.filter(f => f.status === 'error').length
  const totalFiles = files.length

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
          <CardTitle className="flex items-center space-x-2">
            <Upload className="h-5 w-5" />
            <span>Nahrát Soubory</span>
          </CardTitle>
          <CardDescription>
            Nahrajte více souborů titulků (SRT, VTT, ASS, SSA, SUB, SBV, TXT) nebo ZIP archiv obsahující soubory titulků
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div
            {...getRootProps()}
            className={`
              border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors
              ${isDragActive
                ? 'border-blue-400 bg-blue-50 dark:bg-blue-950'
                : 'border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500'
              }
              ${isProcessing ? 'opacity-50 cursor-not-allowed' : ''}
            `}
          >
            <input {...getInputProps()} />
            <div className="space-y-4">
              <div className="mx-auto w-12 h-12 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center">
                {isDragActive ? (
                  <Archive className="h-6 w-6 text-blue-600" />
                ) : (
                  <Upload className="h-6 w-6 text-gray-600" />
                )}
              </div>

              {isDragActive ? (
                <div>
                  <p className="text-gray-600 font-medium mb-2">
                    Přetáhněte soubory titulků nebo ZIP archivy zde
                  </p>
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
                </div>
              ) : (
                <div>
                  <p className="text-gray-600 font-medium mb-2">
                    Přetáhněte soubory sem nebo klikněte pro výběr
                  </p>
                  <p className="text-sm text-gray-500 mb-4">
                    Vyberte více souborů titulků nebo ZIP archiv
                  </p>
                  <Button variant="outline" disabled={isProcessing}>
                    <Upload className="h-4 w-4 mr-2" />
                    Vybrat Soubory
                  </Button>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Language Selection */}
      {files.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Nastavení Překladu</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-2 block">Cílový Jazyk</label>
                <LanguageSelector
                  value={targetLanguage}
                  onValueChange={setTargetLanguage}
                  placeholder="Vyberte cílový jazyk..."
                />
              </div>

              {totalSubtitles > 0 && (
                <div className="flex items-center space-x-4 text-sm text-gray-600">
                  <div className="flex items-center space-x-1">
                    <FileText className="h-4 w-4" />
                    <span>{totalFiles} souborů</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Calculator className="h-4 w-4" />
                    <span>~{totalSubtitles} titulků</span>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* File List */}
      {files.length > 0 && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Soubory k Překladu ({files.length})</CardTitle>
              <div className="flex items-center space-x-2">
                {completedCount > 0 && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={downloadAllAsZip}
                    className="flex items-center space-x-1"
                  >
                    <Download className="h-4 w-4" />
                    <span>Stáhnout Vše (ZIP)</span>
                  </Button>
                )}
                <Button
                  onClick={startBatchTranslation}
                  disabled={isProcessing || !targetLanguage || files.length === 0}
                  className="flex items-center space-x-2"
                >
                  <Zap className="h-4 w-4" />
                  <span>{isProcessing ? 'Překládání...' : 'Začít Překlad'}</span>
                </Button>
              </div>
            </div>

            {/* Overall Progress */}
            {isProcessing && (
              <div className="mt-4">
                <div className="flex justify-between text-sm text-gray-600 mb-2">
                  <span>Celkový Průběh</span>
                  <span>{Math.round(overallProgress)}%</span>
                </div>
                <Progress value={overallProgress} className="h-2" />
                <div className="flex justify-between text-xs text-gray-500 mt-1">
                  <span>{completedCount} dokončeno</span>
                  <span>{errorCount} chyb</span>
                </div>
              </div>
            )}
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {files.map((file) => (
                <div key={file.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center space-x-3 flex-1">
                    <FileText className="h-5 w-5 text-gray-500 flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{file.file.name}</p>
                      <div className="flex items-center space-x-2 text-xs text-gray-500">
                        <span>{(file.file.size / 1024).toFixed(1)} KB</span>
                        {file.subtitleCount && (
                          <>
                            <span>•</span>
                            <span>~{file.subtitleCount} titulků</span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    {file.status === 'pending' && (
                      <Badge variant="secondary">
                        <Clock className="h-3 w-3 mr-1" />
                        Čeká
                      </Badge>
                    )}

                    {file.status === 'processing' && (
                      <Badge className="bg-blue-500 dark:bg-blue-600">
                        <Clock className="h-3 w-3 mr-1" />
                        Zpracovává se
                      </Badge>
                    )}

                    {file.status === 'completed' && (
                      <>
                        <Badge className="bg-green-500 dark:bg-green-600">
                          <CheckCircle className="h-3 w-3 mr-1" />
                          Dokončeno
                        </Badge>
                        <div className="flex gap-1">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleEditTranslation(file)}
                            title="Editovat a Náhled"
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => downloadFile(file)}
                            title="Stáhnout"
                          >
                            <Download className="h-4 w-4" />
                          </Button>
                        </div>
                      </>
                    )}

                    {file.status === 'error' && (
                      <Badge variant="destructive">
                        <AlertCircle className="h-3 w-3 mr-1" />
                        Chyba
                      </Badge>
                    )}

                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeFile(file.id)}
                      disabled={isProcessing}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>

                  {/* Progress Bar */}
                  <div className="w-full">
                    {(file.status === 'processing' || file.status === 'completed') && (
                      <div className="mt-2">
                        <div className="flex justify-between text-xs text-muted-foreground mb-1">
                          <span>
                            {file.status === 'completed' ? 'Dokončeno' :
                             (file.progress || 0) < 30 ? 'Analýza a research...' : 'Překládání...'}
                          </span>
                          <span>{Math.round(file.progress || 0)}%</span>
                        </div>
                        <Progress
                          value={file.progress || 0}
                          className={`h-2 ${file.status === 'completed' ? 'bg-green-100' : ''}`}
                        />
                      </div>
                    )}

                    {file.status === 'error' && file.error && (
                      <div className="mt-2">
                        <p className="text-xs text-red-600">{file.error}</p>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}