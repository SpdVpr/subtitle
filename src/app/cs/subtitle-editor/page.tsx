'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { useAuth } from '@/hooks/useAuth'
import { auth } from '@/lib/firebase'
import { SubtitleEntry } from '@/types/preview'
import { SubtitleProcessor } from '@/lib/subtitle-processor'
import { TranslationSelectorDialog } from '@/components/video/translation-selector-dialog'
import { toast } from 'sonner'
import {
  Upload,
  Download,
  Save,
  FileText,
  ArrowLeft,
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
  CheckCircle,
  RotateCcw
} from 'lucide-react'
import { AdvancedSubtitleEditor } from '@/components/subtitle-editor/advanced-subtitle-editor'
import { EditorModeSelectorCs } from '@/components/subtitle-editor/editor-mode-selector-cs'
import { DualSubtitleEditor } from '@/components/subtitle-editor/dual-subtitle-editor'

export default function CzechSubtitleEditorPage() {
  const { user } = useAuth()
  const [editorMode, setEditorMode] = useState<'select' | 'single' | 'dual'>('select')
  const [entries, setEntries] = useState<SubtitleEntry[]>([])
  const [originalEntries, setOriginalEntries] = useState<SubtitleEntry[]>([])
  const [fileName, setFileName] = useState<string>('')
  const [isLoading, setIsLoading] = useState(false)
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false)
  const [isDragOver, setIsDragOver] = useState(false)
  const [autoSaveEnabled, setAutoSaveEnabled] = useState(true)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const autoSaveTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  // Process file upload with better error handling
  const processFile = async (file: File) => {
    // Validation
    if (!file.name.toLowerCase().endsWith('.srt')) {
      toast.error('Neplatný typ souboru. Prosím vyberte SRT soubor.', {
        description: 'Podporovány jsou pouze .srt soubory s titulky'
      })
      return
    }

    if (file.size > 50 * 1024 * 1024) { // 50MB limit
      toast.error('Soubor je příliš velký. Maximální velikost je 50MB.', {
        description: 'Prosím použijte menší soubor s titulky'
      })
      return
    }

    setIsLoading(true)

    try {
      // Check for auto-saved version
      const autoSavedContent = localStorage.getItem(`subtitle-editor-autosave-${file.name}`)
      if (autoSavedContent && hasUnsavedChanges) {
        toast.info('Nalezena automaticky uložená verze', {
          description: 'Načítám vaši předchozí práci...',
          duration: 2000
        })
      }

      const content = await file.text()

      // Validate file content
      if (!content.trim()) {
        toast.error('Prázdný soubor', {
          description: 'Vybraný soubor se zdá být prázdný'
        })
        return
      }

      const parsedEntries = SubtitleProcessor.parseSRT(content)

      if (parsedEntries.length === 0) {
        toast.error('Nenalezeny žádné titulky', {
          description: 'Soubor neobsahuje platné titulky'
        })
        return
      }

      setEntries(parsedEntries)
      setOriginalEntries([...parsedEntries])
      setFileName(file.name)
      setHasUnsavedChanges(false)

      toast.success(`Úspěšně načteno ${parsedEntries.length} titulků`, {
        description: `Ze souboru ${file.name}`,
        duration: 3000
      })

    } catch (error) {
      console.error('Failed to parse SRT file:', error)
      toast.error('Nepodařilo se načíst soubor s titulky', {
        description: 'Prosím zkontrolujte, zda je formát souboru správný a zkuste to znovu'
      })
    } finally {
      setIsLoading(false)
    }
  }

  // Handle file upload
  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return
    await processFile(file)
  }

  // Load specific translation from selection
  const loadSelectedTranslation = async (job: any) => {
    try {
      console.log('🔍 Loading selected translation:', job.id)

      const user = auth.currentUser
      if (!user) {
        toast.error('Musíte být přihlášeni pro načtení výsledků překladu')
        return
      }

      let translatedContent = ''

      // Try to get content from job data first
      if (job.translatedContent) {
        console.log('✅ Found translated content in job data')
        translatedContent = job.translatedContent
      } else {
        // Fallback: try to download from storage
        console.log('📥 Downloading translated content from storage...')
        const downloadResponse = await fetch('/api/translation-history/download', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ jobId: job.id, userId: user.uid })
        })

        if (!downloadResponse.ok) {
          throw new Error(`Failed to download: ${downloadResponse.statusText}`)
        }

        translatedContent = await downloadResponse.text()
      }

      if (!translatedContent) {
        toast.error('Žádný přeložený obsah není dostupný')
        return
      }

      console.log(`📄 Content preview:`, translatedContent.substring(0, 200) + '...')

      // Parse subtitle content
      try {
        console.log('🎬 Parsing subtitle content...')
        const fileName = job.translatedFileName || job.originalFileName || 'titulky.srt'
        const entries = SubtitleProcessor.parseSubtitleFile(translatedContent, fileName)
        console.log(`✅ Successfully parsed ${entries.length} subtitle entries`)

        setEntries(entries)
        setOriginalEntries([...entries])
        setFileName(fileName)
        setEditorMode('single')

        toast.success(`Načteno ${entries.length} titulků z "${job.translatedFileName || job.originalFileName}"`)
      } catch (srtError) {
        console.error('❌ Failed to parse SRT content:', srtError)
        toast.error('Neplatný SRT formát ve výsledcích překladu')
      }

    } catch (error) {
      console.error('❌ Failed to load selected translation:', error)
      toast.error('Nepodařilo se načíst výsledky překladu')
    }
  }

  // Load subtitles from translation session storage (fallback)
  const loadFromTranslation = () => {
    try {
      console.log('🔍 Checking sessionStorage for translation data...')

      // Debug: List all sessionStorage keys
      const allKeys = Object.keys(sessionStorage)
      console.log('📦 Available sessionStorage keys:', allKeys)

      // Try multiple possible keys for translated content
      const translatedContent = sessionStorage.getItem('translatedContent') ||
                               sessionStorage.getItem('translatedSubtitles') ||
                               sessionStorage.getItem('pipSubtitles')

      console.log('📝 translatedContent found:', !!translatedContent)
      console.log('📝 translatedContent length:', translatedContent?.length || 0)

      // Try to get filename from previewData or other sources
      let translatedFileName = 'prelozene_titulky.srt'
      try {
        const previewData = sessionStorage.getItem('previewData')
        console.log('📋 previewData found:', !!previewData)
        if (previewData) {
          const parsed = JSON.parse(previewData)
          console.log('📋 previewData content:', parsed)
          translatedFileName = parsed.translatedFileName || parsed.originalFileName || translatedFileName
        }
      } catch (e) {
        console.log('⚠️ Failed to parse previewData:', e)
        // Fallback to direct filename storage
        translatedFileName = sessionStorage.getItem('translatedFileName') ||
                           sessionStorage.getItem('pipSubtitleFileName') ||
                           translatedFileName
      }

      if (!translatedContent) {
        console.log('❌ No translated content found in sessionStorage, trying localStorage...')

        // Try localStorage as fallback
        const localStorageKeys = Object.keys(localStorage).filter(key =>
          key.includes('subtitle') || key.includes('translation') || key.includes('srt')
        )
        console.log('💾 Available localStorage keys:', localStorageKeys)

        // Try to find any recent translation data in localStorage
        let foundInLocalStorage = false
        for (const key of localStorageKeys) {
          try {
            const data = localStorage.getItem(key)
            if (data && data.includes('-->') && data.includes('\n')) {
              console.log('✅ Found SRT-like data in localStorage key:', key)
              const parsedEntries = SubtitleProcessor.parseSRT(data)
              if (parsedEntries.length > 0) {
                setEntries(parsedEntries)
                setOriginalEntries([...parsedEntries])
                setFileName(key.replace('subtitle-editor-autosave-', '') || 'obnovene_titulky.srt')
                setEditorMode('single')

                toast.success(`Obnoveno ${parsedEntries.length} titulků z místního úložiště`, {
                  description: 'Nalezena dříve uložená data titulků.'
                })
                foundInLocalStorage = true
                break
              }
            }
          } catch (e) {
            console.log('⚠️ Failed to parse localStorage key:', key, e)
          }
        }

        if (!foundInLocalStorage) {
          toast.error('Žádný překlad nenalezen', {
            description: 'Nejdříve přeložte titulky, poté je zde načtěte pro úpravy. Nebo zkuste funkci "Nedávné překlady" v dashboardu.'
          })
        }
        return
      }

      // Parse the translated content
      const parsedEntries = SubtitleProcessor.parseSRT(translatedContent)

      if (parsedEntries.length === 0) {
        toast.error('Neplatná data překladu', {
          description: 'Data překladu se zdají být poškozená nebo prázdná.'
        })
        return
      }

      // Load the entries
      setEntries(parsedEntries)
      setOriginalEntries([...parsedEntries])
      setFileName(translatedFileName)
      setEditorMode('single')

      toast.success(`Načteno ${parsedEntries.length} přeložených titulků`, {
        description: 'Nyní můžete upravovat přeložené titulky.'
      })

    } catch (error) {
      console.error('Failed to load translation:', error)
      toast.error('Nepodařilo se načíst překlad', {
        description: 'Při načítání přeložených titulků došlo k chybě.'
      })
    }
  }

  // Handle drag and drop
  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(true)
  }, [])

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(false)
  }, [])

  const handleDrop = useCallback(async (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(false)

    const files = Array.from(e.dataTransfer.files)
    const srtFile = files.find(file => file.name.toLowerCase().endsWith('.srt'))

    if (srtFile) {
      await processFile(srtFile)
    } else {
      toast.error('Prosím přetáhněte platný SRT soubor')
    }
  }, [])

  // Handle entries change with auto-save
  const handleEntriesChange = (newEntries: SubtitleEntry[]) => {
    setEntries(newEntries)
    setHasUnsavedChanges(true)

    // Auto-save after 3 seconds of inactivity
    if (autoSaveEnabled && fileName) {
      if (autoSaveTimeoutRef.current) {
        clearTimeout(autoSaveTimeoutRef.current)
      }

      autoSaveTimeoutRef.current = setTimeout(() => {
        // Auto-save to localStorage
        try {
          const srtContent = SubtitleProcessor.generateSRT(newEntries)
          localStorage.setItem(`subtitle-editor-autosave-${fileName}`, srtContent)
          toast.success('Automaticky uloženo', { duration: 1000 })
        } catch (error) {
          console.error('Auto-save failed:', error)
        }
      }, 3000)
    }
  }

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ctrl+S - Download
      if (e.ctrlKey && e.key === 's') {
        e.preventDefault()
        if (entries.length > 0) {
          handleDownload()
        }
      }

      // Ctrl+O - Open file
      if (e.ctrlKey && e.key === 'o') {
        e.preventDefault()
        fileInputRef.current?.click()
      }

      // Note: Ctrl+Z for undo is now handled by AdvancedSubtitleEditor component
      // Ctrl+R - Reset to original (alternative to avoid conflict with undo)
      if (e.ctrlKey && e.key === 'r' && hasUnsavedChanges && editorMode !== 'select') {
        e.preventDefault()
        if (confirm('Opravdu chcete obnovit titulky na původní verzi? Všechny změny budou ztraceny.')) {
          handleReset()
        }
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [entries.length, hasUnsavedChanges, editorMode])

  // Cleanup auto-save timeout
  useEffect(() => {
    return () => {
      if (autoSaveTimeoutRef.current) {
        clearTimeout(autoSaveTimeoutRef.current)
      }
    }
  }, [])

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
      link.download = fileName ? fileName.replace('.srt', '_upraveno.srt') : 'upravene_titulky.srt'
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
        {/* Modern Header */}
        <div className="mb-8">
          <div className="max-w-6xl mx-auto">
            {/* Main Title */}
            <div className="text-center mb-8">
              <div className="inline-flex items-center gap-3 bg-gradient-to-r from-blue-500/10 to-purple-500/10 px-6 py-3 rounded-full mb-6">
                <Edit3 className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                <span className="font-semibold text-blue-600 dark:text-blue-400">Profesionální Editor</span>
              </div>

              <h1 className="text-4xl md:text-6xl font-bold mb-4 bg-gradient-to-r from-blue-600 via-purple-600 to-blue-800 bg-clip-text text-transparent">
                Editor Titulků
              </h1>

              <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto">
                Upravujte, synchronizujte a zdokonalujte své titulky pomocí profesionálních nástrojů
              </p>
            </div>

            {/* Status Bar - Only show when file is loaded and in single mode */}
            {fileName && editorMode === 'single' && (
              <div className="bg-card/50 backdrop-blur-sm border rounded-2xl p-4 mb-6">
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center space-x-2">
                      <FileText className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                      <span className="font-medium">{fileName}</span>
                    </div>
                    <Separator orientation="vertical" className="h-6" />
                    <div className="flex items-center space-x-2">
                      <Badge variant="outline" className="bg-blue-50 dark:bg-blue-950">
                        {entries.length} titulků
                      </Badge>
                      {hasUnsavedChanges && (
                        <Badge className="bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200">
                          <Edit3 className="h-3 w-3 mr-1" />
                          Upraveno
                        </Badge>
                      )}
                    </div>
                  </div>

                  {/* Quick Actions */}
                  <div className="flex items-center space-x-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setEditorMode('select')}
                      className="text-muted-foreground hover:text-foreground"
                    >
                      <ArrowLeft className="h-4 w-4 mr-2" />
                      Změnit Režim
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => fileInputRef.current?.click()}
                      className="text-muted-foreground hover:text-foreground"
                    >
                      <Upload className="h-4 w-4 mr-2" />
                      Nový Soubor
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={handleReset}
                      disabled={!hasUnsavedChanges}
                      className="text-muted-foreground hover:text-foreground"
                    >
                      <RotateCcw className="h-4 w-4 mr-2" />
                      Obnovit
                    </Button>
                    <Button
                      onClick={handleDownload}
                      size="sm"
                      className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 shadow-lg"
                      title="Stáhnout upravený soubor (Ctrl+S)"
                    >
                      <Download className="h-4 w-4 mr-2" />
                      Stáhnout
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Action Bar */}
        {editorMode === 'single' && entries.length === 0 ? (
          // Modern Upload Zone with Drag & Drop
          <div className="text-center mb-12">
            <div
              className={`relative bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-blue-950/50 dark:via-background dark:to-purple-950/50 rounded-3xl p-12 border-2 border-dashed transition-all duration-300 max-w-2xl mx-auto ${
                isDragOver
                  ? 'border-blue-500 bg-blue-50 dark:border-blue-400 dark:bg-blue-950/70 scale-105'
                  : 'border-blue-200 dark:border-blue-800 hover:border-blue-300 dark:hover:border-blue-700'
              }`}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
            >
              {/* Animated background effect */}
              <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 to-purple-500/5 rounded-3xl animate-pulse"></div>

              <div className="relative z-10">
                <div className={`w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-8 transition-all duration-300 ${
                  isDragOver
                    ? 'bg-blue-500 scale-110'
                    : 'bg-gradient-to-br from-blue-100 to-purple-100 dark:from-blue-900 dark:to-purple-900'
                }`}>
                  <Upload className={`h-12 w-12 transition-colors duration-300 ${
                    isDragOver
                      ? 'text-white'
                      : 'text-blue-600 dark:text-blue-400'
                  }`} />
                </div>

                <h3 className="text-3xl font-bold mb-4 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  {isDragOver ? 'Přetáhněte Soubor Sem!' : 'Začněte Editovat'}
                </h3>

                <p className="text-lg text-muted-foreground mb-8 max-w-md mx-auto">
                  {isDragOver
                    ? 'Uvolněte pro nahrání SRT souboru'
                    : 'Přetáhněte SRT soubor sem, nebo klikněte pro procházení'
                  }
                </p>

                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Button
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isLoading}
                    size="lg"
                    className="text-lg px-10 py-6 h-auto bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105"
                  >
                    {isLoading ? (
                      <>
                        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white mr-3"></div>
                        <span>Zpracovávám...</span>
                      </>
                    ) : (
                      <>
                        <Upload className="h-6 w-6 mr-3" />
                        <span>Vybrat SRT Soubor</span>
                      </>
                    )}
                  </Button>

                  <TranslationSelectorDialog
                    onTranslationSelect={loadSelectedTranslation}
                    trigger={
                      <Button
                        disabled={isLoading}
                        size="lg"
                        variant="outline"
                        className="text-lg px-10 py-6 h-auto border-2 border-green-500 text-green-600 hover:bg-green-50 dark:text-green-400 dark:border-green-400 dark:hover:bg-green-950/20 shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105"
                      >
                        <RefreshCw className="h-6 w-6 mr-3" />
                        <span>Načíst z Překladu</span>
                      </Button>
                    }
                  />
                </div>

                <div className="mt-8 flex items-center justify-center space-x-6 text-sm text-muted-foreground">
                  <div className="flex items-center space-x-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <span>SRT Formát</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <span>Max 50MB</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <span>Okamžité Zpracování</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : null}

        <input
          ref={fileInputRef}
          type="file"
          accept=".srt"
          onChange={handleFileUpload}
          className="hidden"
        />

        {/* Main Content */}
        {editorMode === 'select' ? (
          <EditorModeSelectorCs onModeSelect={setEditorMode} />
        ) : editorMode === 'dual' ? (
          <DualSubtitleEditor onBack={() => setEditorMode('select')} />
        ) : editorMode === 'single' && entries.length === 0 ? (
          <div className="max-w-5xl mx-auto">

            {/* Getting Started Guide */}
            <Card className="bg-gradient-to-r from-slate-50 to-gray-50 dark:from-slate-900 dark:to-gray-900 border-0">
              <CardContent className="p-8">
                <div className="text-center">
                  <div className="w-16 h-16 bg-gradient-to-br from-slate-600 to-gray-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
                    <Info className="h-8 w-8 text-white" />
                  </div>
                  <h3 className="text-xl font-semibold mb-4">Rychlý Průvodce</h3>
                  <div className="grid md:grid-cols-3 gap-6 text-left max-w-3xl mx-auto">
                    <div className="flex items-start space-x-3">
                      <div className="w-8 h-8 bg-blue-500 text-white rounded-full flex items-center justify-center flex-shrink-0 text-sm font-bold">1</div>
                      <div>
                        <p className="font-medium">Nahrát Soubor</p>
                        <p className="text-sm text-muted-foreground">Přetáhněte nebo klikněte pro nahrání SRT souboru</p>
                      </div>
                    </div>
                    <div className="flex items-start space-x-3">
                      <div className="w-8 h-8 bg-purple-500 text-white rounded-full flex items-center justify-center flex-shrink-0 text-sm font-bold">2</div>
                      <div>
                        <p className="font-medium">Editovat a Navigovat</p>
                        <p className="text-sm text-muted-foreground">Upravujte titulky a používejte plovoucí okno pro lepší workflow</p>
                      </div>
                    </div>
                    <div className="flex items-start space-x-3">
                      <div className="w-8 h-8 bg-green-500 text-white rounded-full flex items-center justify-center flex-shrink-0 text-sm font-bold">3</div>
                      <div>
                        <p className="font-medium">Stáhnout</p>
                        <p className="text-sm text-muted-foreground">Uložte upravené titulky jako SRT soubor</p>
                      </div>
                    </div>
                  </div>

                  {/* Keyboard Shortcuts */}
                  <div className="mt-8 pt-6 border-t border-muted">
                    <h4 className="text-sm font-semibold mb-4 text-center">⌨️ Klávesové Zkratky</h4>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                      <div className="flex items-center justify-between">
                        <span>Otevřít soubor</span>
                        <Badge variant="outline" className="font-mono">Ctrl+O</Badge>
                      </div>
                      <div className="flex items-center justify-between">
                        <span>Stáhnout</span>
                        <Badge variant="outline" className="font-mono">Ctrl+S</Badge>
                      </div>
                      <div className="flex items-center justify-between">
                        <span>Obnovit na původní</span>
                        <Badge variant="outline" className="font-mono">Ctrl+R</Badge>
                      </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs mt-4">
                      <div className="flex items-center justify-between">
                        <span>Vrátit zpět (Undo)</span>
                        <Badge variant="outline" className="font-mono">Ctrl+Z</Badge>
                      </div>
                      <div className="flex items-center justify-between">
                        <span>Znovu (Redo)</span>
                        <Badge variant="outline" className="font-mono">Ctrl+Y</Badge>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        ) : editorMode === 'single' && entries.length > 0 ? (
          <AdvancedSubtitleEditor
            entries={entries}
            originalEntries={originalEntries}
            onEntriesChange={handleEntriesChange}
            fileName={fileName}
            locale="cs"
          />
        ) : null}
      </div>
    </div>
  )
}
