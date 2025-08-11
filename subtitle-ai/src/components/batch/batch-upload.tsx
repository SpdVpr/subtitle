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
import { useSubscription } from '@/hooks/useSubscription'
import { 
  Upload, 
  X, 
  FileText, 
  AlertCircle, 
  Zap,
  Crown
} from 'lucide-react'

interface BatchUploadProps {
  onJobCreated?: (jobId: string) => void
}

export function BatchUpload({ onJobCreated }: BatchUploadProps) {
  const { createBatchJob } = useBatch()
  const { canPerformAction } = useSubscription()
  const [files, setFiles] = useState<File[]>([])
  const [jobName, setJobName] = useState('')
  const [sourceLanguage, setSourceLanguage] = useState<string>('')
  const [targetLanguage, setTargetLanguage] = useState<string>('')
  const [aiService, setAiService] = useState<'google' | 'openai'>('google')
  const [isCreating, setIsCreating] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Check if user can use batch processing
  const batchCheck = canPerformAction('batch')

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const srtFiles = acceptedFiles.filter(file => 
      file.name.toLowerCase().endsWith('.srt') && file.size <= 10 * 1024 * 1024 // 10MB limit
    )
    
    setFiles(prev => [...prev, ...srtFiles])
    
    // Auto-generate job name if not set
    if (!jobName && srtFiles.length > 0) {
      const timestamp = new Date().toLocaleDateString()
      setJobName(`Batch Translation - ${timestamp}`)
    }
  }, [jobName])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'text/plain': ['.srt'],
      'application/x-subrip': ['.srt']
    },
    disabled: !batchCheck.allowed || isCreating
  })

  const removeFile = (index: number) => {
    setFiles(prev => prev.filter((_, i) => i !== index))
  }

  const handleCreateJob = async () => {
    if (!files.length || !targetLanguage || !jobName.trim()) return

    setIsCreating(true)
    setError(null)

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

  const canCreate = files.length > 0 && targetLanguage && jobName.trim() && !isCreating && batchCheck.allowed

  if (!batchCheck.allowed) {
    return (
      <Card className="border-orange-500 bg-orange-50">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Crown className="h-5 w-5 text-orange-600" />
            <span>Batch Processing - Premium Feature</span>
          </CardTitle>
          <CardDescription>
            Batch processing is available for Premium and Pro subscribers only.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center space-x-2 text-orange-600 mb-4">
            <AlertCircle className="h-4 w-4" />
            <span className="text-sm">{batchCheck.reason}</span>
          </div>
          <Button onClick={() => window.location.href = '/pricing'}>
            Upgrade to Premium
          </Button>
        </CardContent>
      </Card>
    )
  }

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
                ${isDragActive ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-gray-400'}
                ${!batchCheck.allowed || isCreating ? 'opacity-50 cursor-not-allowed' : ''}
              `}
            >
              <input {...getInputProps()} />
              <Upload className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              {isDragActive ? (
                <p className="text-blue-600">Drop the SRT files here...</p>
              ) : (
                <div>
                  <p className="text-gray-600 mb-2">
                    Drag & drop SRT files here, or click to select
                  </p>
                  <p className="text-sm text-gray-500">
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
                    <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                      <div className="flex items-center space-x-2">
                        <FileText className="h-4 w-4 text-gray-500" />
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
              <LanguageSelector
                value={sourceLanguage}
                onValueChange={setSourceLanguage}
                placeholder="Auto-detect"
                disabled={isCreating}
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
                disabled={isCreating}
                excludeLanguage={sourceLanguage}
              />
            </div>
          </div>

          {/* AI Service Selection */}
          <div>
            <label className="block text-sm font-medium mb-2">
              AI Translation Service
            </label>
            <Select value={aiService} onValueChange={(value: 'google' | 'openai') => setAiService(value)} disabled={isCreating}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="google">
                  <div className="flex flex-col">
                    <span>Google Translate (Free)</span>
                    <span className="text-xs text-green-600">✓ Fast batch processing</span>
                  </div>
                </SelectItem>
                <SelectItem value="openai">
                  <div className="flex flex-col">
                    <span>OpenAI GPT (Premium)</span>
                    <span className="text-xs text-blue-600">✓ Context-aware translation</span>
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Error Display */}
          {error && (
            <div className="p-3 text-sm text-red-600 bg-red-50 border border-red-200 rounded-md">
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
