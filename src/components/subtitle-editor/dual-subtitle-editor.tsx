'use client'

import { useState, useRef, useCallback } from 'react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { SubtitleEntry } from '@/types/preview'
import { SubtitleProcessor } from '@/lib/subtitle-processor'
import { AdvancedSubtitleEditor } from './advanced-subtitle-editor'
import { toast } from 'sonner'
import {
  Upload,
  Download,
  FileText,
  ArrowLeft,
  Copy,
  GitCompare,
  Layers,
  RefreshCw,
  Save
} from 'lucide-react'

interface DualSubtitleEditorProps {
  onBack: () => void
}

export function DualSubtitleEditor({ onBack }: DualSubtitleEditorProps) {
  // Left editor state
  const [leftEntries, setLeftEntries] = useState<SubtitleEntry[]>([])
  const [leftOriginalEntries, setLeftOriginalEntries] = useState<SubtitleEntry[]>([])
  const [leftFileName, setLeftFileName] = useState<string>('')
  const [leftHasChanges, setLeftHasChanges] = useState(false)

  // Right editor state
  const [rightEntries, setRightEntries] = useState<SubtitleEntry[]>([])
  const [rightOriginalEntries, setRightOriginalEntries] = useState<SubtitleEntry[]>([])
  const [rightFileName, setRightFileName] = useState<string>('')
  const [rightHasChanges, setRightHasChanges] = useState(false)

  const [isLoading, setIsLoading] = useState(false)
  const leftFileInputRef = useRef<HTMLInputElement>(null)
  const rightFileInputRef = useRef<HTMLInputElement>(null)

  // Process file upload
  const processFile = async (file: File, side: 'left' | 'right') => {
    if (!file.name.toLowerCase().endsWith('.srt')) {
      toast.error('Invalid file type. Please select an SRT file.')
      return
    }

    setIsLoading(true)

    try {
      const content = await file.text()
      const parsedEntries = SubtitleProcessor.parseSRT(content)

      if (parsedEntries.length === 0) {
        toast.error('No subtitles found in the file')
        return
      }

      if (side === 'left') {
        setLeftEntries(parsedEntries)
        setLeftOriginalEntries([...parsedEntries])
        setLeftFileName(file.name)
        setLeftHasChanges(false)
      } else {
        setRightEntries(parsedEntries)
        setRightOriginalEntries([...parsedEntries])
        setRightFileName(file.name)
        setRightHasChanges(false)
      }

      toast.success(`Successfully loaded ${parsedEntries.length} subtitle entries`, {
        description: `${side === 'left' ? 'Left' : 'Right'} editor: ${file.name}`
      })

    } catch (error) {
      console.error('Failed to parse SRT file:', error)
      toast.error('Failed to parse subtitle file')
    } finally {
      setIsLoading(false)
    }
  }

  // Handle file uploads
  const handleLeftFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return
    await processFile(file, 'left')
  }

  const handleRightFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return
    await processFile(file, 'right')
  }

  // Handle entries changes
  const handleLeftEntriesChange = (newEntries: SubtitleEntry[]) => {
    setLeftEntries(newEntries)
    setLeftHasChanges(true)
  }

  const handleRightEntriesChange = (newEntries: SubtitleEntry[]) => {
    setRightEntries(newEntries)
    setRightHasChanges(true)
  }

  // Download functions
  const handleDownload = (side: 'left' | 'right') => {
    const entries = side === 'left' ? leftEntries : rightEntries
    const fileName = side === 'left' ? leftFileName : rightFileName

    if (entries.length === 0) {
      toast.error('No subtitles to download')
      return
    }

    try {
      const srtContent = SubtitleProcessor.generateSRT(entries)
      const blob = new Blob([srtContent], { type: 'text/plain;charset=utf-8' })
      const url = URL.createObjectURL(blob)
      
      const link = document.createElement('a')
      link.href = url
      link.download = fileName ? fileName.replace('.srt', '_edited.srt') : 'edited_subtitles.srt'
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      URL.revokeObjectURL(url)
      
      if (side === 'left') {
        setLeftHasChanges(false)
      } else {
        setRightHasChanges(false)
      }
      
      toast.success(`${side === 'left' ? 'Left' : 'Right'} editor subtitles downloaded!`)
    } catch (error) {
      console.error('Failed to download subtitles:', error)
      toast.error('Failed to download subtitles')
    }
  }



  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button
            variant="ghost"
            onClick={onBack}
            className="flex items-center space-x-2"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Back to Mode Selection</span>
          </Button>
        </div>

        <div className="flex items-center space-x-2">
          <Badge variant="outline" className="bg-purple-50 dark:bg-purple-950">
            <Layers className="h-3 w-3 mr-1" />
            Dual Editor Mode
          </Badge>
        </div>
      </div>

      {/* File Upload Section */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Left Editor Upload */}
        <Card className="border-2 border-dashed border-blue-200 dark:border-blue-800">
          <CardHeader className="text-center">
            <CardTitle className="flex items-center justify-center space-x-2">
              <FileText className="h-5 w-5 text-blue-500" />
              <span>Left Editor</span>
            </CardTitle>
            <CardDescription>
              {leftFileName || 'Upload your first subtitle file'}
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center space-y-4">
            <Button
              onClick={() => leftFileInputRef.current?.click()}
              disabled={isLoading}
              className="w-full"
              variant={leftEntries.length > 0 ? "outline" : "default"}
            >
              <Upload className="h-4 w-4 mr-2" />
              {leftEntries.length > 0 ? 'Change File' : 'Upload SRT File'}
            </Button>
            
            {leftEntries.length > 0 && (
              <div className="flex items-center justify-between text-sm">
                <Badge variant="outline">{leftEntries.length} entries</Badge>
                {leftHasChanges && <Badge variant="secondary">Modified</Badge>}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Right Editor Upload */}
        <Card className="border-2 border-dashed border-purple-200 dark:border-purple-800">
          <CardHeader className="text-center">
            <CardTitle className="flex items-center justify-center space-x-2">
              <FileText className="h-5 w-5 text-purple-500" />
              <span>Right Editor</span>
            </CardTitle>
            <CardDescription>
              {rightFileName || 'Upload your second subtitle file'}
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center space-y-4">
            <Button
              onClick={() => rightFileInputRef.current?.click()}
              disabled={isLoading}
              className="w-full"
              variant={rightEntries.length > 0 ? "outline" : "default"}
            >
              <Upload className="h-4 w-4 mr-2" />
              {rightEntries.length > 0 ? 'Change File' : 'Upload SRT File'}
            </Button>
            
            {rightEntries.length > 0 && (
              <div className="flex items-center justify-between text-sm">
                <Badge variant="outline">{rightEntries.length} entries</Badge>
                {rightHasChanges && <Badge variant="secondary">Modified</Badge>}
              </div>
            )}
          </CardContent>
        </Card>
      </div>



      {/* Download Actions */}
      {(leftEntries.length > 0 || rightEntries.length > 0) && (
        <div className="flex items-center justify-center space-x-4">
          <Button
            onClick={() => handleDownload('left')}
            disabled={leftEntries.length === 0}
            className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700"
          >
            <Download className="h-4 w-4" />
            <span>Download Left</span>
          </Button>
          
          <Button
            onClick={() => handleDownload('right')}
            disabled={rightEntries.length === 0}
            className="flex items-center space-x-2 bg-purple-600 hover:bg-purple-700"
          >
            <Download className="h-4 w-4" />
            <span>Download Right</span>
          </Button>
        </div>
      )}

      {/* Hidden file inputs */}
      <input
        ref={leftFileInputRef}
        type="file"
        accept=".srt"
        onChange={handleLeftFileUpload}
        className="hidden"
      />
      <input
        ref={rightFileInputRef}
        type="file"
        accept=".srt"
        onChange={handleRightFileUpload}
        className="hidden"
      />

      {/* Dual Editors */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Left Editor */}
        {leftEntries.length > 0 && (
          <AdvancedSubtitleEditor
            entries={leftEntries}
            originalEntries={leftOriginalEntries}
            onEntriesChange={handleLeftEntriesChange}
            fileName={leftFileName}
            editorId="left"
            initialFloating={false}
            initialPosition={{ x: 200, y: 150 }}
            onSave={() => handleDownload('left')}
          />
        )}

        {/* Right Editor */}
        {rightEntries.length > 0 && (
          <AdvancedSubtitleEditor
            entries={rightEntries}
            originalEntries={rightOriginalEntries}
            onEntriesChange={handleRightEntriesChange}
            fileName={rightFileName}
            editorId="right"
            initialFloating={false}
            initialPosition={{ x: 850, y: 150 }}
            onSave={() => handleDownload('right')}
          />
        )}
      </div>
    </div>
  )
}
