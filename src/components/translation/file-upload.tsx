'use client'

import { useCallback, useState } from 'react'
import { useDropzone } from 'react-dropzone'
import { Upload, File, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { cn } from '@/lib/utils'

interface FileUploadProps {
  onFileSelect: (file: File) => void
  selectedFile: File | null
  onFileRemove: () => void
  disabled?: boolean
}

export function FileUpload({ onFileSelect, selectedFile, onFileRemove, disabled }: FileUploadProps) {
  const [dragActive, setDragActive] = useState(false)

  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) {
      onFileSelect(acceptedFiles[0])
    }
  }, [onFileSelect])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'text/plain': ['.srt'],
      'application/x-subrip': ['.srt']
    },
    maxFiles: 1,
    disabled,
    onDragEnter: () => setDragActive(true),
    onDragLeave: () => setDragActive(false),
  })

  if (selectedFile) {
    return (
      <Card className="w-full">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <File className="h-8 w-8 text-blue-600" />
              <div>
                <p className="font-medium">{selectedFile.name}</p>
                <p className="text-sm text-gray-600">
                  {(selectedFile.size / 1024).toFixed(1)} KB
                </p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={onFileRemove}
              disabled={disabled}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="w-full">
      <CardContent className="p-6">
        <div
          {...getRootProps()}
          className={cn(
            "border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors",
            isDragActive || dragActive
              ? "border-blue-500 bg-blue-50"
              : "border-gray-300 hover:border-gray-400",
            disabled && "cursor-not-allowed opacity-50"
          )}
        >
          <input {...getInputProps()} />
          <Upload className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium mb-2">Upload Subtitle File</h3>
          <p className="text-gray-600 mb-4">
            Drag and drop your SRT file here, or click to browse
          </p>
          <Button variant="outline" disabled={disabled}>
            Choose File
          </Button>
          <p className="text-sm text-gray-500 mt-4">
            Supports: .srt files up to 10MB
          </p>
        </div>
      </CardContent>
    </Card>
  )
}
