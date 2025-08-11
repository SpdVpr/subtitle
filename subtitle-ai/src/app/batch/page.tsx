'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { BatchUpload } from '@/components/batch/batch-upload'
import { BatchJobList } from '@/components/batch/batch-job-list'
import { useAuth } from '@/hooks/useAuth'
import { useSubscription } from '@/hooks/useSubscription'
import { 
  Zap, 
  FileText, 
  Crown, 
  CheckCircle,
  Clock,
  Download
} from 'lucide-react'

export default function BatchPage() {
  const { user } = useAuth()
  const { subscription } = useSubscription()
  const [activeTab, setActiveTab] = useState('upload')

  const handleJobCreated = (jobId: string) => {
    // Switch to jobs tab when a new job is created
    setActiveTab('jobs')
  }

  if (!user) {
    return (
      <div className="container py-8">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-3xl font-bold mb-4">Batch Translation</h1>
          <p className="text-gray-600 mb-8">
            Please log in to access batch translation features
          </p>
          <Button onClick={() => window.location.href = '/login'}>
            Log In
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="py-8">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-6xl">
        {/* Header */}
        <div className="mb-8 text-center">
          <div className="flex items-center justify-center space-x-3 mb-4">
            <Zap className="h-8 w-8 text-blue-600" />
            <h1 className="text-3xl font-bold">Batch Translation</h1>
            {subscription && subscription.plan !== 'free' && (
              <Crown className="h-6 w-6 text-yellow-500" />
            )}
          </div>
          <p className="text-gray-600 text-lg max-w-3xl mx-auto">
            Process multiple subtitle files simultaneously with AI-powered translation
          </p>
        </div>

        {/* Features Overview */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center space-x-3 mb-3">
                <FileText className="h-8 w-8 text-blue-500" />
                <h3 className="font-semibold">Multiple Files</h3>
              </div>
              <p className="text-sm text-gray-600">
                Upload and process dozens of SRT files in a single batch job
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center space-x-3 mb-3">
                <Clock className="h-8 w-8 text-green-500" />
                <h3 className="font-semibold">Time Saving</h3>
              </div>
              <p className="text-sm text-gray-600">
                Automated processing with real-time progress tracking
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center space-x-3 mb-3">
                <Download className="h-8 w-8 text-purple-500" />
                <h3 className="font-semibold">ZIP Download</h3>
              </div>
              <p className="text-sm text-gray-600">
                Get all translated files in a convenient ZIP archive
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="upload" className="flex items-center space-x-2">
              <Zap className="h-4 w-4" />
              <span>New Batch Job</span>
            </TabsTrigger>
            <TabsTrigger value="jobs" className="flex items-center space-x-2">
              <FileText className="h-4 w-4" />
              <span>My Jobs</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="upload" className="mt-6">
            <BatchUpload onJobCreated={handleJobCreated} />
          </TabsContent>

          <TabsContent value="jobs" className="mt-6">
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold">Batch Jobs</h2>
                <Button
                  variant="outline"
                  onClick={() => setActiveTab('upload')}
                >
                  <Zap className="h-4 w-4 mr-2" />
                  New Batch Job
                </Button>
              </div>
              <BatchJobList />
            </div>
          </TabsContent>
        </Tabs>

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
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <span className="text-blue-600 font-bold">1</span>
                </div>
                <h4 className="font-medium mb-2">Upload Files</h4>
                <p className="text-sm text-gray-600">
                  Select multiple SRT files using drag & drop or file picker
                </p>
              </div>

              <div className="text-center">
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <span className="text-green-600 font-bold">2</span>
                </div>
                <h4 className="font-medium mb-2">Configure</h4>
                <p className="text-sm text-gray-600">
                  Choose target language and AI service for translation
                </p>
              </div>

              <div className="text-center">
                <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <span className="text-purple-600 font-bold">3</span>
                </div>
                <h4 className="font-medium mb-2">Process</h4>
                <p className="text-sm text-gray-600">
                  AI translates all files with intelligent timing adjustment
                </p>
              </div>

              <div className="text-center">
                <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <span className="text-orange-600 font-bold">4</span>
                </div>
                <h4 className="font-medium mb-2">Download</h4>
                <p className="text-sm text-gray-600">
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
