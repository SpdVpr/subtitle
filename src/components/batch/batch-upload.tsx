'use client'

import { useState, useCallback } from 'react'
import { useDropzone } from 'react-dropzone'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { LanguageSelector } from '@/components/translation/language-selector'
import { Badge } from '@/components/ui/badge'
import { useBatch } from '@/hooks/useBatch'
import {
  Upload,
  X,
  FileText,
  AlertCircle,
  Zap,
  Star,
  StarOff
} from 'lucide-react'
import { useFavoriteLanguages } from '@/hooks/use-favorite-languages'
import { analytics } from '@/lib/analytics'

interface BatchUploadProps {
  onJobCreated?: (jobId: string) => void
}

export function BatchUpload({ onJobCreated }: BatchUploadProps) {
  const { createBatchJob } = useBatch()
  const { isFavorite, toggleFavorite } = useFavoriteLanguages()
  const [files, setFiles] = useState<File[]>([])
  const [jobName, setJobName] = useState('')
  const [sourceLanguage, setSourceLanguage] = useState<string>('')
  const [targetLanguage, setTargetLanguage] = useState<string>('')
  const [aiService] = useState<'premium'>('premium')
  const [isCreating, setIsCreating] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const isSupportedSubtitleFile = (fileName: string): boolean => {
    const supportedExtensions = ['.srt', '.vtt', '.ass', '.ssa', '.sub', '.sbv']
    return supportedExtensions.some(ext => fileName.toLowerCase().endsWith(ext))
  }

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const subtitleFiles = acceptedFiles.filter(file =>
      isSupportedSubtitleFile(file.name) && file.size <= 10 * 1024 * 1024 // 10MB limit
    )

    setFiles(prev => [...prev, ...subtitleFiles])

    // Auto-generate job name if not set
    if (!jobName && subtitleFiles.length > 0) {
      const timestamp = new Date().toLocaleDateString()
      setJobName(`Batch Translation - ${timestamp}`)
    }
  }, [jobName, isSupportedSubtitleFile])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'text/plain': ['.srt', '.vtt', '.ass', '.ssa', '.sub', '.sbv'],
      'text/vtt': ['.vtt'],
      'application/x-subrip': ['.srt']
    },
    disabled: isCreating
  })

  const removeFile = (index: number) => {
    setFiles(prev => prev.filter((_, i) => i !== index))
  }

  const handleCreateJob = async () => {
    if (!files.length || !targetLanguage || !jobName.trim()) return

    setIsCreating(true)
    setError(null)

    // Track batch translation start
    analytics.batchTranslationStarted(files.length, targetLanguage)

    try {
      const jobId = await createBatchJob({
        name: jobName.trim(),
        files,
        sourceLanguage: sourceLanguage || undefined,
        targetLanguage,
        aiService
      })

      // Reset form
      setFiles([])
      setJobName('')
      setSourceLanguage('')
      setTargetLanguage('')

      onJobCreated?.(jobId)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create batch job')
    } finally {
      setIsCreating(false)
    }
  }

  const canCreate = files.length > 0 && targetLanguage && jobName.trim() && !isCreating

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Batch Translation</CardTitle>
          <CardDescription>
            Upload multiple SRT files and translate them all at once
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Job Name */}
          <div>
            <label className="block text-sm font-medium mb-2">
              Job Name *
            </label>
            <Input
              value={jobName}
              onChange={(e) => setJobName(e.target.value)}
              placeholder="Enter a name for this batch job"
              disabled={isCreating}
            />
          </div>

          {/* File Upload */}
          <div>
            <label className="block text-sm font-medium mb-2">
              SRT Files *
            </label>
            <div
              {...getRootProps()}
              className={`
                border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors
                ${isDragActive ? 'border-blue-500 bg-blue-50 dark:bg-blue-950/30' : 'border-gray-300 dark:border-border hover:border-gray-400 dark:hover:border-muted-foreground'}
                ${isCreating ? 'opacity-50 cursor-not-allowed' : ''}
              `}
            >
              <input {...getInputProps()} />
              <Upload className="h-12 w-12 text-gray-400 dark:text-muted-foreground mx-auto mb-4" />
              {isDragActive ? (
                <p className="text-blue-600">Drop the SRT files here...</p>
              ) : (
                <div>
                  <p className="text-gray-600 dark:text-muted-foreground mb-2">
                    Drag & drop SRT files here, or click to select
                  </p>
                  <p className="text-sm text-gray-500 dark:text-muted-foreground">
                    Maximum 10MB per file
                  </p>
                </div>
              )}
            </div>

            {/* File List */}
            {files.length > 0 && (
              <div className="mt-4 space-y-2">
                <h4 className="text-sm font-medium">Selected Files ({files.length})</h4>
                <div className="max-h-40 overflow-y-auto space-y-2">
                  {files.map((file, index) => (
                    <div key={index} className="flex items-center justify-between p-2 bg-gray-50 dark:bg-card rounded">
                      <div className="flex items-center space-x-2">
                        <FileText className="h-4 w-4 text-gray-500 dark:text-muted-foreground" />
                        <span className="text-sm">{file.name}</span>
                        <Badge variant="outline" className="text-xs">
                          {(file.size / 1024).toFixed(1)} KB
                        </Badge>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeFile(index)}
                        disabled={isCreating}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Language Selection */}
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">
                Source Language (Optional)
              </label>
              <div className="flex gap-2">
                <LanguageSelector
                  value={sourceLanguage}
                  onValueChange={setSourceLanguage}
                  placeholder="Auto-detect"
                  disabled={isCreating}
                  excludeLanguage={targetLanguage}
                />
                {sourceLanguage && sourceLanguage !== 'auto' && (
                  <Button
                    variant="outline"
                    size="sm"
                    className="px-2"
                    onClick={() => toggleFavorite(sourceLanguage)}
                    disabled={isCreating}
                    title={isFavorite(sourceLanguage) ? "Remove from favorites" : "Add to favorites"}
                  >
                    {isFavorite(sourceLanguage) ? (
                      <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                    ) : (
                      <StarOff className="h-4 w-4 text-muted-foreground" />
                    )}
                  </Button>
                )}
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">
                Target Language *
              </label>
              <div className="flex gap-2">
                <LanguageSelector
                  value={targetLanguage}
                  onValueChange={setTargetLanguage}
                  placeholder="Select target language"
                  disabled={isCreating}
                  excludeLanguage={sourceLanguage}
                />
                {targetLanguage && targetLanguage !== 'auto' && (
                  <Button
                    variant="outline"
                    size="sm"
                    className="px-2"
                    onClick={() => toggleFavorite(targetLanguage)}
                    disabled={isCreating}
                    title={isFavorite(targetLanguage) ? "Remove from favorites" : "Add to favorites"}
                  >
                    {isFavorite(targetLanguage) ? (
                      <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                    ) : (
                      <StarOff className="h-4 w-4 text-muted-foreground" />
                    )}
                  </Button>
                )}
              </div>
            </div>
          </div>

          {/* AI Service Selection */}
          <div>
            <label className="block text-sm font-medium mb-2">
              AI Translation Service
            </label>
            <Select value="premium" onValueChange={() => { }} disabled={true}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="premium">
                  <div className="flex flex-col">
                    <span>🎬 Premium AI Context (Google Gemini)</span>
                    <span className="text-xs text-blue-600">✓ Context-aware translation with timing optimization</span>
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Error Display */}
          {error && (
            <div className="p-3 text-sm text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800/30 rounded-md">
              {error}
            </div>
          )}

          {/* Create Job Button */}
          <Button
            onClick={handleCreateJob}
            disabled={!canCreate}
            className="w-full"
            size="lg"
          >
            <Zap className="h-4 w-4 mr-2" />
            {isCreating ? 'Creating Batch Job...' : `Create Batch Job (${files.length} files)`}
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
