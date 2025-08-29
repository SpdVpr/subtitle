'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Loader2, CheckCircle, XCircle } from 'lucide-react'

const LANGUAGES = [
  { code: 'cs', name: 'Czech' },
  { code: 'sk', name: 'Slovak' },
  { code: 'de', name: 'German' },
  { code: 'fr', name: 'French' },
  { code: 'es', name: 'Spanish' },
  { code: 'it', name: 'Italian' },
  { code: 'pl', name: 'Polish' },
  { code: 'ru', name: 'Russian' },
]

export default function TestTranslatePage() {
  const [text, setText] = useState('Hello, world! How are you today?')
  const [premiumText] = useState(`I'll be back.
May the Force be with you.
You talking to me?
Here's looking at you, kid.
Elementary, my dear Watson.
I feel the need... the need for speed!`)
  const [targetLanguage, setTargetLanguage] = useState('cs')
  const [service, setService] = useState<'premium'>('premium')
  const [result, setResult] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const testBasicAPI = async () => {
    setLoading(true)
    setError('')
    setResult(null)

    try {
      const response = await fetch(`/api/test-translate?service=${service}`)
      const data = await response.json()

      if (response.ok) {
        setResult(data)
      } else {
        setError(data.error || 'API test failed')
      }
    } catch (err) {
      setError('Failed to test API')
    } finally {
      setLoading(false)
    }
  }

  const testCustomTranslation = async () => {
    if (!text.trim()) {
      setError('Please enter some text to translate')
      return
    }

    setLoading(true)
    setError('')
    setResult(null)

    try {
      const response = await fetch('/api/test-translate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text: service === 'premium' ? premiumText : text.trim(),
          targetLanguage,
          sourceLanguage: 'en',
          service
        })
      })

      const data = await response.json()
      
      if (response.ok) {
        setResult(data)
      } else {
        setError(data.error || 'Translation failed')
      }
    } catch (err) {
      setError('Failed to translate text')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="container mx-auto py-8 px-4 max-w-4xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Google Translate API Test</h1>
        <p className="text-gray-600">
          Test your Google Translate API configuration and functionality.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Basic API Test */}
        <Card>
          <CardHeader>
            <CardTitle>Basic API Test</CardTitle>
            <CardDescription>
              Test if translation APIs are properly configured
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium mb-2 block">
                Translation Service:
              </label>
              <Select value={service} onValueChange={(value: any) => setService(value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="premium">🎬 Premium AI Context (OpenAI)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Button
              onClick={testBasicAPI}
              disabled={loading}
              className="w-full"
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Testing...
                </>
              ) : (
                `Test ${service.toUpperCase()} API`
              )}
            </Button>
          </CardContent>
        </Card>

        {/* Custom Translation Test */}
        <Card>
          <CardHeader>
            <CardTitle>Custom Translation</CardTitle>
            <CardDescription>
              Test translation with your own text
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium mb-2 block">
                Text to translate:
              </label>
              {service === 'premium' ? (
                <div className="space-y-2">
                  <div className="p-3 bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800/30 rounded">
                    <p className="text-sm text-blue-800 dark:text-blue-300 font-medium">🎬 Premium Context Mode</p>
                    <p className="text-xs text-blue-600 dark:text-blue-400">Using famous movie quotes for context analysis demo</p>
                  </div>
                  <Textarea
                    value={premiumText}
                    disabled
                    rows={6}
                    className="bg-gray-50 dark:bg-muted"
                  />
                </div>
              ) : (
                <Textarea
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  placeholder="Enter text to translate..."
                  rows={3}
                />
              )}
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">
                Target Language:
              </label>
              <Select value={targetLanguage} onValueChange={setTargetLanguage}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {LANGUAGES.map((lang) => (
                    <SelectItem key={lang.code} value={lang.code}>
                      {lang.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <Button 
              onClick={testCustomTranslation} 
              disabled={loading || !text.trim()}
              className="w-full"
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Translating...
                </>
              ) : (
                'Translate Text'
              )}
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Results */}
      {(result || error) && (
        <Card className="mt-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              {error ? (
                <>
                  <XCircle className="h-5 w-5 text-red-500" />
                  Error
                </>
              ) : (
                <>
                  <CheckCircle className="h-5 w-5 text-green-500" />
                  Result
                </>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {error ? (
              <div className="text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950/30 p-4 rounded-md">
                <p className="font-medium">Error:</p>
                <p>{error}</p>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="bg-green-50 dark:bg-green-950/30 p-4 rounded-md">
                  <p className="font-medium text-green-800 dark:text-green-300 mb-2">
                    ✅ {result.message || 'Translation successful!'}
                  </p>
                  
                  {result.test && (
                    <div className="text-sm text-green-700">
                      <p><strong>Original:</strong> {result.test.original.join(', ')}</p>
                      <p><strong>Translated:</strong> {result.test.translated.join(', ')}</p>
                      <p><strong>Language:</strong> {result.test.sourceLanguage} → {result.test.targetLanguage}</p>
                    </div>
                  )}

                  {result.original && (
                    <div className="text-sm text-green-700">
                      <p><strong>Original:</strong> {result.original.join(', ')}</p>
                      <p><strong>Translated:</strong> {result.translated.join(', ')}</p>
                      <p><strong>Language:</strong> {result.sourceLanguage} → {result.targetLanguage}</p>
                    </div>
                  )}

                  {result.contextAnalysis && (
                    <div className="text-sm text-blue-700 dark:text-blue-300 mt-4 p-3 bg-blue-50 dark:bg-blue-950/30 rounded">
                      <p><strong>🎬 Context Analysis (Premium Feature):</strong></p>
                      <ul className="list-disc list-inside mt-2 space-y-1">
                        {result.contextAnalysis.genre && <li><strong>Genre:</strong> {result.contextAnalysis.genre}</li>}
                        {result.contextAnalysis.setting && <li><strong>Setting:</strong> {result.contextAnalysis.setting}</li>}
                        {result.contextAnalysis.tone && <li><strong>Tone:</strong> {result.contextAnalysis.tone}</li>}
                        {result.contextAnalysis.audience && <li><strong>Audience:</strong> {result.contextAnalysis.audience}</li>}
                        {result.contextAnalysis.cultural_context && <li><strong>Cultural Context:</strong> {result.contextAnalysis.cultural_context}</li>}
                        {result.contextAnalysis.title && <li><strong>Detected Title:</strong> {result.contextAnalysis.title}</li>}
                      </ul>
                    </div>
                  )}
                </div>

                <details className="text-xs">
                  <summary className="cursor-pointer text-gray-600 dark:text-muted-foreground hover:text-gray-800 dark:hover:text-foreground">
                    Show raw response
                  </summary>
                  <pre className="mt-2 bg-gray-100 dark:bg-muted p-2 rounded text-xs overflow-auto">
                    {JSON.stringify(result, null, 2)}
                  </pre>
                </details>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Instructions */}
      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Setup Instructions</CardTitle>
        </CardHeader>
        <CardContent className="text-sm space-y-2">
          <p><strong>1.</strong> Create OpenAI account at platform.openai.com</p>
          <p><strong>2.</strong> Generate API key in API Keys section</p>
          <p><strong>3.</strong> Add API key to .env.local: <code>OPENAI_API_KEY=your_key</code></p>
          <p><strong>4.</strong> Restart development server</p>
          <p><strong>Note:</strong> Only Premium AI Context service is supported for best translation quality.</p>
        </CardContent>
      </Card>
    </div>
  )
}
