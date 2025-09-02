'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { SubtitleEditor } from '@/components/preview/subtitle-editor'
import { SubtitleProcessor } from '@/lib/subtitle-processor'
import { 
  ArrowLeft, 
  Download, 
  Save, 
  FileText, 
  Languages, 
  Bot,
  AlertTriangle,
  CheckCircle,
  Clock
} from 'lucide-react'
import { toast } from 'sonner'

interface PreviewData {
  originalFile: string
  sourceLanguage: string
  targetLanguage: string
  aiService: string
  translatedFileName: string
}

interface SubtitleEntry {
  index: number
  startTime: string
  endTime: string
  text: string
}

export default function CzechPreviewPage() {
  const router = useRouter()
  const [previewData, setPreviewData] = useState<PreviewData | null>(null)
  const [originalEntries, setOriginalEntries] = useState<SubtitleEntry[]>([])
  const [translatedEntries, setTranslatedEntries] = useState<SubtitleEntry[]>([])
  const [hasChanges, setHasChanges] = useState(false)
  const [showOriginal, setShowOriginal] = useState(false)

  useEffect(() => {
    // Load data from sessionStorage
    const storedPreviewData = sessionStorage.getItem('previewData')
    const storedTranslatedContent = sessionStorage.getItem('translatedContent')
    const storedOriginalContent = sessionStorage.getItem('originalContent')

    if (!storedPreviewData || !storedTranslatedContent) {
      toast.error('Žádná data k náhledu nenalezena', {
        description: 'Prosím vraťte se zpět a přeložte titulky znovu.'
      })
      router.push('/cs/translate')
      return
    }

    try {
      const data: PreviewData = JSON.parse(storedPreviewData)
      setPreviewData(data)

      // Parse translated content
      const translatedParsed = SubtitleProcessor.parseSRT(storedTranslatedContent)
      setTranslatedEntries(translatedParsed)

      // Parse original content if available
      if (storedOriginalContent) {
        const originalParsed = SubtitleProcessor.parseSRT(storedOriginalContent)
        setOriginalEntries(originalParsed)
      }

    } catch (error) {
      console.error('Chyba při načítání dat náhledu:', error)
      toast.error('Chyba při načítání dat náhledu')
      router.push('/cs/translate')
    }
  }, [router])

  const handleSave = () => {
    if (!previewData) return

    try {
      const updatedContent = SubtitleProcessor.generateSRT(translatedEntries, previewData.targetLanguage)
      sessionStorage.setItem('translatedContent', updatedContent)
      setHasChanges(false)
      toast.success('Změny uloženy')
    } catch (error) {
      console.error('Chyba při ukládání:', error)
      toast.error('Chyba při ukládání změn')
    }
  }

  const handleDownload = () => {
    if (!previewData) return

    try {
      const content = SubtitleProcessor.generateSRT(translatedEntries, previewData.targetLanguage)
      const blob = new Blob([content], { type: 'text/plain;charset=utf-8' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = previewData.translatedFileName
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
      
      toast.success('Soubor stažen')
    } catch (error) {
      console.error('Chyba při stahování:', error)
      toast.error('Chyba při stahování souboru')
    }
  }

  if (!previewData) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Header */}
        <div className="mb-8">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-6">
            <div>
              <h1 className="text-3xl font-bold mb-2">Náhled a Úpravy Titulků</h1>
              <p className="text-muted-foreground">
                Zkontrolujte a upravte přeložené titulky před stažením
              </p>
            </div>

            <div className="flex items-center justify-center lg:justify-end space-x-4">
              <Button
                variant="outline"
                onClick={() => window.location.href = '/cs/translate'}
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Zpět
              </Button>

              {hasChanges && (
                <Button onClick={handleSave}>
                  <Save className="h-4 w-4 mr-2" />
                  Uložit Změny
                </Button>
              )}

              <Button onClick={handleDownload}>
                <Download className="h-4 w-4 mr-2" />
                Stáhnout
              </Button>
            </div>
          </div>

          {/* Translation Info */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center space-x-2">
                  <FileText className="h-4 w-4 text-blue-500" />
                  <div>
                    <p className="text-sm font-medium">Originální Soubor</p>
                    <p className="text-xs text-muted-foreground">{previewData.originalFile}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center space-x-2">
                  <Languages className="h-4 w-4 text-green-500" />
                  <div>
                    <p className="text-sm font-medium">Jazyky</p>
                    <p className="text-xs text-muted-foreground">
                      {previewData.sourceLanguage} → {previewData.targetLanguage}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center space-x-2">
                  <Bot className="h-4 w-4 text-purple-500" />
                  <div>
                    <p className="text-sm font-medium">AI Služba</p>
                    <p className="text-xs text-muted-foreground">{previewData.aiService}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center space-x-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <div>
                    <p className="text-sm font-medium">Titulky</p>
                    <p className="text-xs text-muted-foreground">{translatedEntries.length} položek</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Subtitle Editor */}
        <SubtitleEditor
          entries={translatedEntries}
          originalEntries={originalEntries}
          onEntriesChange={(newEntries) => {
            setTranslatedEntries(newEntries)
            setHasChanges(true)
          }}
          showOriginal={showOriginal}
          onShowOriginalChange={setShowOriginal}
          sourceLanguage={previewData.sourceLanguage}
          targetLanguage={previewData.targetLanguage}
          aiService={previewData.aiService}
        />
      </div>
    </div>
  )
}


