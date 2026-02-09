'use client'

import { BatchTranslationInterface } from '@/components/batch/batch-translation-interface'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { useAuth } from '@/hooks/useAuth'
import {
  Zap,
  FileText,
  Archive,
  CheckCircle,
  Clock,
  Download
} from 'lucide-react'

export default function BatchPage() {
  const { user } = useAuth()

  return (
    <div className="py-8">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-6xl">
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
  )
}
