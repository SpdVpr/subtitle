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
  RefreshCw
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
      toast.error('Prosím vyberte platný SRT soubor s titulky')
      return
    }

    setIsLoading(true)
    try {
      const content = await file.text()
      const parsedEntries = SubtitleProcessor.parseSRT(content)
      
      setEntries(parsedEntries)
      setOriginalEntries([...parsedEntries]) // Keep original for comparison
      setFileName(file.name)
      setHasUnsavedChanges(false)
      
      toast.success(`Načteno ${parsedEntries.length} titulků ze souboru ${file.name}`)
    } catch (error) {
      console.error('Failed to load subtitle file:', error)
      toast.error('Nepodařilo se načíst soubor s titulky. Zkontrolujte formát.')
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
      toast.error('Žádné titulky ke stažení')
      return
    }

    try {
      const srtContent = SubtitleProcessor.generateSRT(entries)
      const blob = new Blob([srtContent], { type: 'text/plain;charset=utf-8' })
      const url = URL.createObjectURL(blob)
      
      const link = document.createElement('a')
      link.href = url
      link.download = fileName ? fileName.replace('.srt', '_upravene.srt') : 'upravene_titulky.srt'
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      URL.revokeObjectURL(url)
      
      setHasUnsavedChanges(false)
      toast.success('Titulky úspěšně staženy!')
    } catch (error) {
      console.error('Failed to download subtitles:', error)
      toast.error('Nepodařilo se stáhnout titulky')
    }
  }

  // Reset to original
  const handleReset = () => {
    if (originalEntries.length === 0) {
      toast.error('Žádné původní titulky k obnovení')
      return
    }

    setEntries([...originalEntries])
    setHasUnsavedChanges(false)
    toast.success('Titulky obnoveny na původní')
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold text-foreground">Editor Titulků</h1>
              <p className="text-muted-foreground mt-2">
                Pokročilý editor titulků s hromadnými operacemi a chytrými nástroji
              </p>
            </div>
            <div className="flex items-center space-x-2">
              {hasUnsavedChanges && (
                <Badge variant="secondary" className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200">
                  <Edit3 className="h-3 w-3 mr-1" />
                  Neuložené změny
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

          {/* Action Bar */}
          <div className="flex flex-wrap items-center gap-3">
            <Button
              onClick={() => fileInputRef.current?.click()}
              disabled={isLoading}
              className="flex items-center space-x-2"
            >
              <Upload className="h-4 w-4" />
              <span>Nahrát SRT soubor</span>
            </Button>

            {entries.length > 0 && (
              <>
                <Button
                  variant="outline"
                  onClick={handleDownload}
                  className="flex items-center space-x-2"
                >
                  <Download className="h-4 w-4" />
                  <span>Stáhnout upravené</span>
                </Button>

                <Button
                  variant="outline"
                  onClick={handleReset}
                  disabled={!hasUnsavedChanges}
                  className="flex items-center space-x-2"
                >
                  <RefreshCw className="h-4 w-4" />
                  <span>Obnovit původní</span>
                </Button>

                <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                  <FileText className="h-4 w-4" />
                  <span>{entries.length} titulků</span>
                  {hasUnsavedChanges && (
                    <>
                      <Separator orientation="vertical" className="h-4" />
                      <Edit3 className="h-4 w-4 text-yellow-600" />
                      <span className="text-yellow-600">Upraveno</span>
                    </>
                  )}
                </div>
              </>
            )}
          </div>

          <input
            ref={fileInputRef}
            type="file"
            accept=".srt"
            onChange={handleFileUpload}
            className="hidden"
          />
        </div>

        {/* Main Content */}
        {entries.length === 0 ? (
          <Card className="text-center py-12">
            <CardContent>
              <Upload className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-xl font-semibold mb-2">Žádné titulky nenačteny</h3>
              <p className="text-muted-foreground mb-6">
                Nahrajte SRT soubor a začněte upravovat titulky s pokročilými nástroji
              </p>
              <Button onClick={() => fileInputRef.current?.click()}>
                <Upload className="h-4 w-4 mr-2" />
                Nahrát SRT soubor
              </Button>
            </CardContent>
          </Card>
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
