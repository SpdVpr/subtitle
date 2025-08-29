'use client'

import { useState } from 'react'
import { TranslationInterface } from '@/components/translation/translation-interface'
import { BatchTranslationInterface } from '@/components/batch/batch-translation-interface'
import { EmailVerificationGuard } from '@/components/auth/email-verification-guard'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { FileText, Files, Zap, Clock, Users, ArrowRight, Archive, Download } from 'lucide-react'

export default function TranslatePage() {
  const [mode, setMode] = useState<'select' | 'single' | 'batch'>('select')

  if (mode === 'single') {
    return (
      <EmailVerificationGuard>
        <div className="py-4 sm:py-6 md:py-8">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-4xl">
            <div className="mb-6 sm:mb-8">
              <Button
                variant="ghost"
                onClick={() => setMode('select')}
                className="mb-4"
              >
                ← Back to Mode Selection
              </Button>
              <h1 className="text-2xl sm:text-3xl font-bold mb-2">Single Translation</h1>
              <p className="text-sm sm:text-base text-gray-600 dark:text-muted-foreground">
                Upload one SRT subtitle file and translate it to any language using AI
              </p>
            </div>
            <TranslationInterface />
          </div>
        </div>
      </EmailVerificationGuard>
    )
  }

  if (mode === 'batch') {
    return (
      <EmailVerificationGuard>
        <div className="py-8">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-6xl">
            {/* Back Button */}
            <Button
              variant="ghost"
              onClick={() => setMode('select')}
              className="mb-6"
            >
              ← Back to Mode Selection
            </Button>

            {/* Header */}
            <div className="mb-8 text-center">
              <div className="flex items-center justify-center space-x-3 mb-4">
                <Zap className="h-8 w-8 text-blue-600" />
                <h1 className="text-3xl font-bold">Batch Translation</h1>
              </div>
              <p className="text-gray-600 text-lg max-w-3xl mx-auto">
                Upload multiple subtitle files or ZIP archives and translate them all at once with AI
              </p>
            </div>

          {/* Features Overview */}
          <div className="grid md:grid-cols-3 gap-6 mb-8">
            <div className="bg-white dark:bg-card rounded-lg p-6 border border-gray-200 dark:border-border shadow-sm">
              <div className="flex items-center space-x-3 mb-3">
                <FileText className="h-8 w-8 text-blue-500 dark:text-blue-400" />
                <h3 className="font-semibold">Multiple Files & ZIP</h3>
              </div>
              <p className="text-sm text-gray-600 dark:text-muted-foreground">
                Upload individual SRT files or ZIP archives containing multiple subtitle files
              </p>
            </div>

            <div className="bg-white dark:bg-card rounded-lg p-6 border border-gray-200 dark:border-border shadow-sm">
              <div className="flex items-center space-x-3 mb-3">
                <Archive className="h-8 w-8 text-green-500 dark:text-green-400" />
                <h3 className="font-semibold">Smart Processing</h3>
              </div>
              <p className="text-sm text-gray-600 dark:text-muted-foreground">
                Automatic file extraction from ZIP and intelligent cost estimation
              </p>
            </div>

            <div className="bg-white dark:bg-card rounded-lg p-6 border border-gray-200 dark:border-border shadow-sm">
              <div className="flex items-center space-x-3 mb-3">
                <Download className="h-8 w-8 text-purple-500 dark:text-purple-400" />
                <h3 className="font-semibold">Batch Download</h3>
              </div>
              <p className="text-sm text-gray-600 dark:text-muted-foreground">
                Download individual files or get all translations in a single ZIP
              </p>
            </div>
          </div>

          {/* Main Content */}
          <BatchTranslationInterface />

          {/* Help Section */}
          <Card className="mt-8">
            <CardHeader>
              <CardTitle>How Batch Translation Works</CardTitle>
              <CardDescription>
                Step-by-step guide to batch processing
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-4 gap-6">
                <div className="text-center">
                  <div className="w-12 h-12 bg-blue-100 dark:bg-accent rounded-full flex items-center justify-center mx-auto mb-3">
                    <span className="text-blue-600 dark:text-primary font-bold">1</span>
                  </div>
                  <h4 className="font-medium mb-2">Upload Files</h4>
                  <p className="text-sm text-gray-600">
                    Upload SRT files individually or as ZIP archives
                  </p>
                </div>

                <div className="text-center">
                  <div className="w-12 h-12 bg-green-100 dark:bg-accent rounded-full flex items-center justify-center mx-auto mb-3">
                    <span className="text-green-600 dark:text-primary font-bold">2</span>
                  </div>
                  <h4 className="font-medium mb-2">Configure</h4>
                  <p className="text-sm text-gray-600">
                    Choose target language and review cost estimation
                  </p>
                </div>

                <div className="text-center">
                  <div className="w-12 h-12 bg-purple-100 dark:bg-accent rounded-full flex items-center justify-center mx-auto mb-3">
                    <span className="text-purple-600 dark:text-primary font-bold">3</span>
                  </div>
                  <h4 className="font-medium mb-2">Process</h4>
                  <p className="text-sm text-gray-600">
                    AI translates all files with intelligent timing adjustment
                  </p>
                </div>

                <div className="text-center">
                  <div className="w-12 h-12 bg-orange-100 dark:bg-accent rounded-full flex items-center justify-center mx-auto mb-3">
                    <span className="text-orange-600 dark:text-orange-400 font-bold">4</span>
                  </div>
                  <h4 className="font-medium mb-2">Download</h4>
                  <p className="text-sm text-gray-600 dark:text-muted-foreground">
                    Get all translated files in a single ZIP download
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
      </EmailVerificationGuard>
    )
  }

  // Mode selection
  return (
    <div className="py-8">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-4xl">
        {/* Header */}
        <div className="mb-12 text-center">
          <h1 className="text-4xl font-bold text-foreground mb-4">AI Subtitle Translation</h1>
          <p className="text-xl text-muted-foreground mb-8 max-w-3xl mx-auto">
            Choose your translation method based on your needs - single file or batch processing multiple files at once.
          </p>
        </div>

        {/* Mode Selection Cards */}
        <div className="grid md:grid-cols-2 gap-8 mb-8">
          {/* Single Translation */}
          <Card className="cursor-pointer hover:shadow-lg transition-all duration-200 border-2 hover:border-blue-200 dark:hover:border-blue-800">
            <CardHeader className="text-center pb-4">
              <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center mx-auto mb-4">
                <FileText className="h-8 w-8 text-blue-600 dark:text-blue-400" />
              </div>
              <CardTitle className="text-2xl">Single Translation</CardTitle>
              <CardDescription className="text-base">
                Perfect for one subtitle file
              </CardDescription>
            </CardHeader>
            <CardContent className="text-center">
              <div className="space-y-3 mb-6">
                <div className="flex items-center justify-center space-x-2 text-sm text-muted-foreground">
                  <Clock className="h-4 w-4" />
                  <span>Quick processing</span>
                </div>
                <div className="flex items-center justify-center space-x-2 text-sm text-muted-foreground">
                  <FileText className="h-4 w-4" />
                  <span>One file at a time</span>
                </div>
                <div className="flex items-center justify-center space-x-2 text-sm text-muted-foreground">
                  <Zap className="h-4 w-4" />
                  <span>Instant preview & editing</span>
                </div>
              </div>
              <Button
                onClick={() => setMode('single')}
                className="w-full"
                size="lg"
              >
                Choose Single Translation
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </CardContent>
          </Card>

          {/* Batch Translation */}
          <Card className="cursor-pointer hover:shadow-lg transition-all duration-200 border-2 hover:border-purple-200 dark:hover:border-purple-800">
            <CardHeader className="text-center pb-4">
              <div className="w-16 h-16 bg-purple-100 dark:bg-purple-900 rounded-full flex items-center justify-center mx-auto mb-4">
                <Files className="h-8 w-8 text-purple-600 dark:text-purple-400" />
              </div>
              <CardTitle className="text-2xl">Batch Translation</CardTitle>
              <CardDescription className="text-base">
                For multiple files or ZIP archives
              </CardDescription>
            </CardHeader>
            <CardContent className="text-center">
              <div className="space-y-3 mb-6">
                <div className="flex items-center justify-center space-x-2 text-sm text-muted-foreground">
                  <Files className="h-4 w-4" />
                  <span>Multiple files at once</span>
                </div>
                <div className="flex items-center justify-center space-x-2 text-sm text-muted-foreground">
                  <Users className="h-4 w-4" />
                  <span>Parallel processing</span>
                </div>
                <div className="flex items-center justify-center space-x-2 text-sm text-muted-foreground">
                  <Clock className="h-4 w-4" />
                  <span>Time saving</span>
                </div>
              </div>
              <Button
                onClick={() => setMode('batch')}
                variant="outline"
                className="w-full border-purple-200 hover:bg-purple-50 dark:border-purple-800 dark:hover:bg-purple-950"
                size="lg"
              >
                Choose Batch Translation
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Quick Info */}
        <div className="text-center">
          <div className="inline-flex items-center space-x-4 text-sm text-muted-foreground bg-muted/50 rounded-full px-6 py-3">
            <div className="flex items-center space-x-1">
              <Badge variant="secondary" className="bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-300">SRT</Badge>
              <Badge variant="secondary" className="bg-green-50 text-green-700 dark:bg-green-950 dark:text-green-300">VTT</Badge>
              <Badge variant="secondary" className="bg-purple-50 text-purple-700 dark:bg-purple-950 dark:text-purple-300">ASS</Badge>
              <span>and more formats</span>
            </div>
            <span>•</span>
            <span>50+ languages supported</span>
          </div>
        </div>
      </div>
    </div>
  )
}

// Note: metadata moved to layout.tsx since this is now a client component
