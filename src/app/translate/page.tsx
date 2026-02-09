'use client'

import { useState } from 'react'
import { TranslationInterface } from '@/components/translation/translation-interface'
import { BatchTranslationInterface } from '@/components/batch/batch-translation-interface'
import { EmailVerificationGuard } from '@/components/auth/email-verification-guard'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { FileText, Files, Zap, Clock, Users, ArrowRight, Archive, Download, Gamepad2, ExternalLink } from 'lucide-react'
import Link from 'next/link'
import { Breadcrumbs, breadcrumbConfigs } from '@/components/seo/breadcrumbs'
import { StructuredData } from '@/components/seo/structured-data'

export default function TranslatePage() {
  const [mode, setMode] = useState<'select' | 'single' | 'batch'>('select')

  if (mode === 'single') {
    return (
      <>
        <StructuredData locale="en" page="translate" />
        <EmailVerificationGuard>
          <div className="py-4 sm:py-6 md:py-8">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-4xl">
              <Breadcrumbs items={breadcrumbConfigs.en.translate} locale="en" />
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
              <TranslationInterface locale="en" />
            </div>
          </div>
        </EmailVerificationGuard>
      </>
    )
  }

  if (mode === 'batch') {
    return (
      <>
        <StructuredData locale="en" page="translate" />
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
              <BatchTranslationInterface locale="en" />

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
      </>
    )
  }

  // Mode selection
  return (
    <>
      <StructuredData locale="en" page="translate" />
      <div className="py-8">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-4xl">
          <Breadcrumbs items={breadcrumbConfigs.en.translate} locale="en" />
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
            <Card
              className="cursor-pointer hover:shadow-lg transition-all duration-200 border-2 hover:border-blue-200 dark:hover:border-blue-800 hover:scale-[1.02] group"
              onClick={() => setMode('single')}
            >
              <CardHeader className="text-center pb-4">
                <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-blue-200 dark:group-hover:bg-blue-800 transition-colors">
                  <FileText className="h-8 w-8 text-blue-600 dark:text-blue-400" />
                </div>
                <CardTitle className="text-2xl group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                  Single Translation
                </CardTitle>
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
                <div className="flex items-center justify-center gap-2 text-blue-600 dark:text-blue-400 font-medium group-hover:text-blue-700 dark:group-hover:text-blue-300 transition-colors">
                  <span>Choose Single Translation</span>
                  <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                </div>
              </CardContent>
            </Card>

            {/* Batch Translation */}
            <Card
              className="cursor-pointer hover:shadow-lg transition-all duration-200 border-2 hover:border-purple-200 dark:hover:border-purple-800 hover:scale-[1.02] group"
              onClick={() => setMode('batch')}
            >
              <CardHeader className="text-center pb-4">
                <div className="w-16 h-16 bg-purple-100 dark:bg-purple-900 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-purple-200 dark:group-hover:bg-purple-800 transition-colors">
                  <Files className="h-8 w-8 text-purple-600 dark:text-purple-400" />
                </div>
                <CardTitle className="text-2xl group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors">
                  Batch Translation
                </CardTitle>
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
                <div className="flex items-center justify-center gap-2 text-purple-600 dark:text-purple-400 font-medium group-hover:text-purple-700 dark:group-hover:text-purple-300 transition-colors">
                  <span>Choose Batch Translation</span>
                  <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                </div>
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
                <Badge variant="secondary" className="bg-orange-50 text-orange-700 dark:bg-orange-950 dark:text-orange-300">SSA</Badge>
                <Badge variant="secondary" className="bg-pink-50 text-pink-700 dark:bg-pink-950 dark:text-pink-300">SUB</Badge>
                <Badge variant="secondary" className="bg-indigo-50 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300">SBV</Badge>
                <Badge variant="secondary" className="bg-gray-50 text-gray-700 dark:bg-gray-950 dark:text-gray-300">TXT</Badge>
              </div>
              <span>•</span>
              <span>50+ languages supported</span>
            </div>
          </div>

          {/* UltiQuiz Promo */}
          <div className="mt-12">
            <Link
              href="https://ultiquiz.com"
              target="_blank"
              rel="noopener noreferrer"
              className="group block"
            >
              <div className="relative overflow-hidden rounded-xl border border-amber-200/50 dark:border-amber-800/30 bg-gradient-to-r from-amber-50 via-orange-50 to-yellow-50 dark:from-amber-950/20 dark:via-orange-950/20 dark:to-yellow-950/20 p-3 sm:p-4 transition-all duration-300 hover:shadow-lg hover:shadow-amber-500/10 hover:border-amber-300 dark:hover:border-amber-700">
                <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-amber-400/10 to-transparent rounded-bl-full" />
                <div className="relative flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-lg bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center shadow-md shadow-amber-500/20 flex-shrink-0">
                      <Gamepad2 className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-sm text-foreground">UltiQuiz</span>
                        <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-amber-100 dark:bg-amber-900/50 text-amber-700 dark:text-amber-300 font-medium">
                          From Our Studio
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        🎬 Love translating movie subtitles? Test your cinema knowledge with our quiz game!
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0 ml-3">
                    <span className="hidden sm:inline text-xs font-medium text-amber-600 dark:text-amber-400 group-hover:underline">Play Now</span>
                    <ExternalLink className="w-4 h-4 text-amber-500 group-hover:text-amber-600 transition-colors" />
                  </div>
                </div>
              </div>
            </Link>
          </div>
        </div>
      </div>
    </>
  )
}

// Note: metadata moved to layout.tsx since this is now a client component
