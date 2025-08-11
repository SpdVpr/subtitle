'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { SubtitleEditor } from '@/components/preview/subtitle-editor'
import { useAuth } from '@/hooks/useAuth'
import { SubtitleEntry } from '@/types/preview'
import { 
  Eye, 
  Download, 
  ArrowLeft, 
  Save,
  FileText,
  Languages,
  Zap
} from 'lucide-react'

export default function PreviewPage() {
  const { user } = useAuth()
  const [previewData, setPreviewData] = useState<any>(null)
  const [entries, setEntries] = useState<SubtitleEntry[]>([])
  const [originalEntries, setOriginalEntries] = useState<SubtitleEntry[]>([])
  const [showOriginal, setShowOriginal] = useState(false)
  const [hasChanges, setHasChanges] = useState(false)

  useEffect(() => {
    // Load preview data from sessionStorage
    const storedData = sessionStorage.getItem('previewData')
    if (storedData) {
      const data = JSON.parse(storedData)
      setPreviewData(data)
      
      // Generate mock subtitle entries for demo
      generateMockEntries(data)
    }
  }, [])

  const generateMockEntries = (data: any) => {
    // Mock original entries
    const mockOriginalEntries: SubtitleEntry[] = [
      {
        index: 1,
        startTime: '00:00:01,000',
        endTime: '00:00:04,000',
        text: 'Hello, welcome to our application!',
        originalText: 'Hello, welcome to our application!'
      },
      {
        index: 2,
        startTime: '00:00:05,000',
        endTime: '00:00:08,000',
        text: 'This is a sample subtitle file for testing.',
        originalText: 'This is a sample subtitle file for testing.'
      },
      {
        index: 3,
        startTime: '00:00:09,000',
        endTime: '00:00:12,000',
        text: 'You can upload your own SRT files here.',
        originalText: 'You can upload your own SRT files here.'
      },
      {
        index: 4,
        startTime: '00:00:13,000',
        endTime: '00:00:16,000',
        text: 'And translate them to any supported language.',
        originalText: 'And translate them to any supported language.'
      },
      {
        index: 5,
        startTime: '00:00:17,000',
        endTime: '00:00:21,000',
        text: 'The timing will be intelligently adjusted based on language characteristics.',
        originalText: 'The timing will be intelligently adjusted based on language characteristics.'
      }
    ]

    // Mock translated entries based on target language
    const mockTranslatedEntries: SubtitleEntry[] = mockOriginalEntries.map(entry => {
      let translatedText = entry.text
      
      // Simple mock translation based on target language
      switch (data.targetLanguage) {
        case 'es': // Spanish
          translatedText = entry.text
            .replace('Hello, welcome to our application!', '¡Hola, bienvenido a nuestra aplicación!')
            .replace('This is a sample subtitle file for testing.', 'Este es un archivo de subtítulos de muestra para pruebas.')
            .replace('You can upload your own SRT files here.', 'Puedes subir tus propios archivos SRT aquí.')
            .replace('And translate them to any supported language.', 'Y traducirlos a cualquier idioma compatible.')
            .replace('The timing will be intelligently adjusted based on language characteristics.', 'El tiempo se ajustará inteligentemente según las características del idioma.')
          break
        case 'fr': // French
          translatedText = entry.text
            .replace('Hello, welcome to our application!', 'Bonjour, bienvenue dans notre application!')
            .replace('This is a sample subtitle file for testing.', 'Ceci est un fichier de sous-titres d\'exemple pour les tests.')
            .replace('You can upload your own SRT files here.', 'Vous pouvez télécharger vos propres fichiers SRT ici.')
            .replace('And translate them to any supported language.', 'Et les traduire dans n\'importe quelle langue prise en charge.')
            .replace('The timing will be intelligently adjusted based on language characteristics.', 'Le timing sera intelligemment ajusté en fonction des caractéristiques de la langue.')
          break
        case 'de': // German
          translatedText = entry.text
            .replace('Hello, welcome to our application!', 'Hallo, willkommen in unserer Anwendung!')
            .replace('This is a sample subtitle file for testing.', 'Dies ist eine Beispiel-Untertiteldatei zum Testen.')
            .replace('You can upload your own SRT files here.', 'Sie können hier Ihre eigenen SRT-Dateien hochladen.')
            .replace('And translate them to any supported language.', 'Und sie in jede unterstützte Sprache übersetzen.')
            .replace('The timing will be intelligently adjusted based on language characteristics.', 'Das Timing wird intelligent basierend auf Sprachcharakteristiken angepasst.')
          break
        case 'cs': // Czech
          translatedText = entry.text
            .replace('Hello, welcome to our application!', 'Ahoj, vítejte v naší aplikaci!')
            .replace('This is a sample subtitle file for testing.', 'Toto je ukázkový soubor titulků pro testování.')
            .replace('You can upload your own SRT files here.', 'Zde můžete nahrát své vlastní SRT soubory.')
            .replace('And translate them to any supported language.', 'A přeložit je do jakéhokoli podporovaného jazyka.')
            .replace('The timing will be intelligently adjusted based on language characteristics.', 'Časování bude inteligentně upraveno na základě charakteristik jazyka.')
          break
      }
      
      return {
        ...entry,
        text: translatedText,
        confidence: 0.85 + Math.random() * 0.1, // Mock confidence score
        isEdited: false
      }
    })

    setOriginalEntries(mockOriginalEntries)
    setEntries(mockTranslatedEntries)
  }

  const handleEntriesChange = (newEntries: SubtitleEntry[]) => {
    setEntries(newEntries)
    setHasChanges(true)
  }

  const handleSave = () => {
    // In a real app, this would save to backend
    console.log('Saving changes...', entries)
    setHasChanges(false)
    alert('Changes saved successfully!')
  }

  const handleDownload = () => {
    // Generate SRT content
    const srtContent = entries.map(entry => 
      `${entry.index}\n${entry.startTime} --> ${entry.endTime}\n${entry.text}\n`
    ).join('\n')
    
    // Create download
    const blob = new Blob([srtContent], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = previewData?.translatedFileName || 'translated_subtitles.srt'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  }

  if (!user) {
    return (
      <div className="container py-8">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-3xl font-bold mb-4">Subtitle Preview</h1>
          <p className="text-gray-600 mb-8">
            Please log in to access the preview feature
          </p>
          <Button onClick={() => window.location.href = '/login'}>
            Log In
          </Button>
        </div>
      </div>
    )
  }

  if (!previewData) {
    return (
      <div className="container py-8">
        <div className="max-w-4xl mx-auto text-center">
          <FileText className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h1 className="text-3xl font-bold mb-4">No Preview Data</h1>
          <p className="text-gray-600 mb-8">
            No subtitle data found for preview. Please translate a file first.
          </p>
          <Button onClick={() => window.location.href = '/translate'}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Translation
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="py-8">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-6xl">
        {/* Header */}
        <div className="mb-8">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div className="text-center lg:text-left">
              <div className="flex items-center justify-center lg:justify-start space-x-3 mb-2">
                <Eye className="h-8 w-8 text-blue-600" />
                <h1 className="text-3xl font-bold">Subtitle Preview & Editor</h1>
              </div>
              <p className="text-gray-600">
                Review and edit your translated subtitles before downloading
              </p>
            </div>

            <div className="flex items-center justify-center lg:justify-end space-x-4">
              <Button
                variant="outline"
                onClick={() => window.location.href = '/translate'}
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back
              </Button>

              {hasChanges && (
                <Button onClick={handleSave}>
                  <Save className="h-4 w-4 mr-2" />
                  Save Changes
                </Button>
              )}

              <Button onClick={handleDownload}>
                <Download className="h-4 w-4 mr-2" />
                Download
              </Button>
            </div>
          </div>
        </div>

        {/* Translation Info */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="text-lg">Translation Details</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-4 gap-4 text-sm">
              <div>
                <span className="text-gray-500">Original File:</span>
                <div className="font-medium">{previewData.originalFile}</div>
              </div>
              <div>
                <span className="text-gray-500">Language:</span>
                <div className="font-medium flex items-center">
                  <Languages className="h-3 w-3 mr-1" />
                  {previewData.sourceLanguage} → {previewData.targetLanguage}
                </div>
              </div>
              <div>
                <span className="text-gray-500">AI Service:</span>
                <div className="font-medium flex items-center">
                  <Zap className="h-3 w-3 mr-1" />
                  {previewData.aiService === 'google' ? 'Google Translate' : 'OpenAI GPT'}
                </div>
              </div>
              <div>
                <span className="text-gray-500">Subtitles:</span>
                <div className="font-medium">{entries.length} entries</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Subtitle Editor */}
        <SubtitleEditor
          entries={entries}
          originalEntries={originalEntries}
          onEntriesChange={handleEntriesChange}
          showOriginal={showOriginal}
          onShowOriginalChange={setShowOriginal}
        />
      </div>
    </div>
  )
}
