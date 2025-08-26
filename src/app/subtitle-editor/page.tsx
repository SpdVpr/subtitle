'use client'

import { useState, useEffect, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { useAuth } from '@/hooks/useAuth'
import { SubtitleEntry } from '@/types/preview'
import { SubtitleProcessor } from '@/lib/subtitle-processor'
import { toast } from 'sonner'
import {
  Upload,
  Download,
  Save,
  FileText,
  Search,
  Replace,
  Edit3,
  Undo,
  Redo,
  Copy,
  Trash2,
  Plus,
  Settings,
  Eye,
  EyeOff,
  Clock,
  Type,
  Zap,
  RefreshCw,
  Wand2,
  Info,
  CheckCircle
} from 'lucide-react'
import { AdvancedSubtitleEditor } from '@/components/subtitle-editor/advanced-subtitle-editor'

export default function SubtitleEditorPage() {
  const { user } = useAuth()
  const [entries, setEntries] = useState<SubtitleEntry[]>([])
  const [originalEntries, setOriginalEntries] = useState<SubtitleEntry[]>([])
  const [fileName, setFileName] = useState<string>('')
  const [isLoading, setIsLoading] = useState(false)
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Handle file upload
  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    if (!file.name.toLowerCase().endsWith('.srt')) {
      toast.error('Please select a valid SRT file')
      return
    }

    setIsLoading(true)
    try {
      const content = await file.text()
      const parsedEntries = SubtitleProcessor.parseSRT(content)
      
      setEntries(parsedEntries)
      setOriginalEntries([...parsedEntries])
      setFileName(file.name)
      setHasUnsavedChanges(false)
      
      toast.success(`Loaded ${parsedEntries.length} subtitle entries from ${file.name}`)
    } catch (error) {
      console.error('Failed to parse SRT file:', error)
      toast.error('Failed to parse SRT file. Please check the format.')
    } finally {
      setIsLoading(false)
    }
  }

  // Handle entries change
  const handleEntriesChange = (newEntries: SubtitleEntry[]) => {
    setEntries(newEntries)
    setHasUnsavedChanges(true)
  }

  // Download edited subtitles
  const handleDownload = () => {
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
      
      setHasUnsavedChanges(false)
      toast.success('Subtitles downloaded successfully!')
    } catch (error) {
      console.error('Failed to download subtitles:', error)
      toast.error('Failed to download subtitles')
    }
  }

  // Reset to original
  const handleReset = () => {
    if (originalEntries.length === 0) {
      toast.error('No original subtitles to reset to')
      return
    }

    setEntries([...originalEntries])
    setHasUnsavedChanges(false)
    toast.success('Subtitles reset to original')
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Header */}
        <div className="mb-12 text-center">
          <div className="max-w-4xl mx-auto">
            <h1 className="text-5xl font-bold text-foreground mb-4">Subtitle Editor</h1>
            <p className="text-xl text-muted-foreground mb-6 max-w-3xl mx-auto">
              Professional subtitle editing suite with advanced tools for precise timing, batch operations, and intelligent text processing.
            </p>
            
            {/* Feature highlights */}
            <div className="flex flex-wrap justify-center gap-3 mb-8">
              <Badge variant="secondary" className="bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-300 px-3 py-1">
                <Edit3 className="h-4 w-4 mr-2" />
                Individual Editing
              </Badge>
              <Badge variant="secondary" className="bg-purple-50 text-purple-700 dark:bg-purple-950 dark:text-purple-300 px-3 py-1">
                <Wand2 className="h-4 w-4 mr-2" />
                Batch Operations
              </Badge>
              <Badge variant="secondary" className="bg-green-50 text-green-700 dark:bg-green-950 dark:text-green-300 px-3 py-1">
                <Search className="h-4 w-4 mr-2" />
                Find & Replace
              </Badge>
              <Badge variant="secondary" className="bg-orange-50 text-orange-700 dark:bg-orange-950 dark:text-orange-300 px-3 py-1">
                <Clock className="h-4 w-4 mr-2" />
                Timing Tools
              </Badge>
            </div>
            
            {/* Status badges */}
            <div className="flex justify-center items-center space-x-4">
              {hasUnsavedChanges && (
                <Badge variant="secondary" className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200">
                  <Edit3 className="h-3 w-3 mr-1" />
                  Unsaved Changes
                </Badge>
              )}
              {fileName && (
                <Badge variant="outline">
                  <FileText className="h-3 w-3 mr-1" />
                  {fileName}
                </Badge>
              )}
            </div>
          </div>
        </div>

        {/* Action Bar */}
        {entries.length === 0 ? (
          // Upload state - Dominant upload button
          <div className="text-center mb-12">
            <div className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-950 dark:to-purple-950 rounded-2xl p-8 border-2 border-dashed border-blue-200 dark:border-blue-800 max-w-md mx-auto">
              <div className="w-20 h-20 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center mx-auto mb-6">
                <Upload className="h-10 w-10 text-blue-600 dark:text-blue-400" />
              </div>
              <h3 className="text-2xl font-semibold mb-3">Start Here</h3>
              <p className="text-muted-foreground mb-6">
                Upload your SRT subtitle file to begin editing
              </p>
              <Button
                onClick={() => fileInputRef.current?.click()}
                disabled={isLoading}
                size="lg"
                className="text-lg px-8 py-4 h-auto bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 shadow-lg hover:shadow-xl transition-all duration-200"
              >
                <Upload className="h-6 w-6 mr-3" />
                <span>{isLoading ? 'Loading...' : 'Upload SRT File'}</span>
              </Button>
              <p className="text-sm text-muted-foreground mt-4">
                Supports standard SRT subtitle format - Max 50MB
              </p>
            </div>
          </div>
        ) : (
          // Editor controls - Centered
          <div className="text-center mb-8">
            <div className="inline-flex items-center space-x-2 text-sm text-muted-foreground mb-4">
              <FileText className="h-4 w-4" />
              <span>{entries.length} subtitle entries loaded</span>
              {hasUnsavedChanges && (
                <>
                  <Separator orientation="vertical" className="h-4" />
                  <Edit3 className="h-4 w-4 text-yellow-600" />
                  <span className="text-yellow-600">Modified</span>
                </>
              )}
            </div>
            
            <div className="flex flex-wrap justify-center items-center gap-3">
              <Button
                variant="outline"
                onClick={() => fileInputRef.current?.click()}
                disabled={isLoading}
                className="flex items-center space-x-2"
              >
                <Upload className="h-4 w-4" />
                <span>Load New File</span>
              </Button>

              <Button
                variant="outline"
                onClick={handleReset}
                disabled={!hasUnsavedChanges}
                className="flex items-center space-x-2"
              >
                <RefreshCw className="h-4 w-4" />
                <span>Reset Changes</span>
              </Button>

              <Button
                onClick={handleDownload}
                className="flex items-center space-x-2 bg-green-600 hover:bg-green-700"
              >
                <Download className="h-4 w-4" />
                <span>Download Edited</span>
              </Button>
            </div>
          </div>
        )}

        <input
          ref={fileInputRef}
          type="file"
          accept=".srt"
          onChange={handleFileUpload}
          className="hidden"
        />

        {/* Main Content */}
        {entries.length === 0 ? (
          <div className="max-w-4xl mx-auto">
            <div className="grid md:grid-cols-2 gap-8">
              {/* Welcome Card */}
              <Card className="p-8 text-center">
                <CardContent className="p-0">
                  <div className="w-20 h-20 bg-gradient-to-br from-blue-100 to-purple-100 dark:from-blue-900 dark:to-purple-900 rounded-full flex items-center justify-center mx-auto mb-6">
                    <Edit3 className="h-10 w-10 text-blue-600 dark:text-blue-400" />
                  </div>
                  <h3 className="text-2xl font-semibold mb-3">Professional Subtitle Editor</h3>
                  <p className="text-muted-foreground">
                    Upload your SRT file above to start editing with our advanced tools and features.
                  </p>
                </CardContent>
              </Card>

              {/* Features Card */}
              <Card className="p-8">
                <CardContent className="p-0">
                  <h4 className="text-lg font-semibold mb-6 flex items-center justify-center">
                    <CheckCircle className="h-5 w-5 text-green-600 mr-2" />
                    What You Can Do
                  </h4>
                  <div className="space-y-4">
                    <div className="flex items-start space-x-3">
                      <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center flex-shrink-0">
                        <Edit3 className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                      </div>
                      <div>
                        <p className="font-medium">Individual Editing</p>
                        <p className="text-sm text-muted-foreground">Edit text, timing, and formatting for each subtitle entry</p>
                      </div>
                    </div>
                    <div className="flex items-start space-x-3">
                      <div className="w-8 h-8 bg-purple-100 dark:bg-purple-900 rounded-full flex items-center justify-center flex-shrink-0">
                        <Wand2 className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                      </div>
                      <div>
                        <p className="font-medium">Batch Operations</p>
                        <p className="text-sm text-muted-foreground">Apply changes to multiple subtitles at once</p>
                      </div>
                    </div>
                    <div className="flex items-start space-x-3">
                      <div className="w-8 h-8 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center flex-shrink-0">
                        <Search className="h-4 w-4 text-green-600 dark:text-green-400" />
                      </div>
                      <div>
                        <p className="font-medium">Find & Replace</p>
                        <p className="text-sm text-muted-foreground">Search and replace text across all subtitles</p>
                      </div>
                    </div>
                    <div className="flex items-start space-x-3">
                      <div className="w-8 h-8 bg-orange-100 dark:bg-orange-900 rounded-full flex items-center justify-center flex-shrink-0">
                        <Clock className="h-4 w-4 text-orange-600 dark:text-orange-400" />
                      </div>
                      <div>
                        <p className="font-medium">Timing Adjustments</p>
                        <p className="text-sm text-muted-foreground">Sync and adjust subtitle timing precisely</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        ) : (
          <AdvancedSubtitleEditor
            entries={entries}
            originalEntries={originalEntries}
            onEntriesChange={handleEntriesChange}
            fileName={fileName}
          />
        )}
      </div>
    </div>
  )
}
