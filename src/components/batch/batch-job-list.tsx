'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { useBatch } from '@/hooks/useBatch'
import { BatchJob, BatchProgress } from '@/types/batch'
import { 
  Download, 
  Trash2, 
  X, 
  Clock, 
  CheckCircle, 
  XCircle, 
  Loader2,
  FileText,
  Languages
} from 'lucide-react'

export function BatchJobList() {
  const { jobs, loading, downloadBatchResult, cancelBatchJob, deleteBatchJob, subscribeToBatchProgress, refreshJobs } = useBatch()
  const [progressUpdates, setProgressUpdates] = useState<Record<string, BatchProgress>>({})

  useEffect(() => {
    // Subscribe to progress updates for active jobs
    const unsubscribeFunctions: (() => void)[] = []

    jobs.forEach(job => {
      if (job.status === 'processing') {
        const unsubscribe = subscribeToBatchProgress(job.id, (progress) => {
          setProgressUpdates(prev => ({
            ...prev,
            [job.id]: progress
          }))
        })
        unsubscribeFunctions.push(unsubscribe)
      }
    })

    // Cleanup subscriptions
    return () => {
      unsubscribeFunctions.forEach(unsubscribe => unsubscribe())
    }
  }, [jobs, subscribeToBatchProgress])

  // Refresh jobs periodically
  useEffect(() => {
    const interval = setInterval(() => {
      refreshJobs()
    }, 5000) // Refresh every 5 seconds

    return () => clearInterval(interval)
  }, [refreshJobs])

  const getStatusIcon = (status: BatchJob['status']) => {
    switch (status) {
      case 'pending':
        return <Clock className="h-4 w-4 text-gray-500" />
      case 'processing':
        return <Loader2 className="h-4 w-4 text-blue-500 animate-spin" />
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-green-500" />
      case 'failed':
        return <XCircle className="h-4 w-4 text-red-500" />
      case 'cancelled':
        return <X className="h-4 w-4 text-gray-500" />
      default:
        return null
    }
  }

  const getStatusBadge = (status: BatchJob['status']) => {
    const variants = {
      pending: 'outline',
      processing: 'default',
      completed: 'default',
      failed: 'destructive',
      cancelled: 'secondary'
    } as const

    const colors = {
      pending: 'text-gray-600',
      processing: 'text-blue-600',
      completed: 'text-green-600',
      failed: 'text-red-600',
      cancelled: 'text-gray-600'
    }

    return (
      <Badge variant={variants[status]} className={colors[status]}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    )
  }

  const formatDuration = (ms: number) => {
    const seconds = Math.floor(ms / 1000)
    const minutes = Math.floor(seconds / 60)
    const hours = Math.floor(minutes / 60)

    if (hours > 0) {
      return `${hours}h ${minutes % 60}m`
    } else if (minutes > 0) {
      return `${minutes}m ${seconds % 60}s`
    } else {
      return `${seconds}s`
    }
  }

  const handleDownload = async (jobId: string) => {
    try {
      await downloadBatchResult(jobId)
    } catch (error) {
      console.error('Download failed:', error)
    }
  }

  const handleCancel = async (jobId: string) => {
    try {
      await cancelBatchJob(jobId)
    } catch (error) {
      console.error('Cancel failed:', error)
    }
  }

  const handleDelete = async (jobId: string) => {
    if (confirm('Are you sure you want to delete this batch job?')) {
      try {
        await deleteBatchJob(jobId)
      } catch (error) {
        console.error('Delete failed:', error)
      }
    }
  }

  if (loading && jobs.length === 0) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-8">
          <Loader2 className="h-6 w-6 animate-spin mr-2" />
          <span>Loading batch jobs...</span>
        </CardContent>
      </Card>
    )
  }

  if (jobs.length === 0) {
    return (
      <Card>
        <CardContent className="text-center py-8">
          <FileText className="h-12 w-12 text-gray-400 dark:text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-foreground mb-2">No batch jobs yet</h3>
          <p className="text-gray-600 dark:text-muted-foreground">
            Create your first batch translation job to get started
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      {jobs.map(job => {
        const progress = progressUpdates[job.id] || {
          jobId: job.id,
          status: job.status,
          progress: job.progress,
          processedFiles: job.processedFiles,
          totalFiles: job.totalFiles
        }

        return (
          <Card key={job.id}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  {getStatusIcon(job.status)}
                  <div>
                    <CardTitle className="text-lg">{job.name}</CardTitle>
                    <CardDescription>
                      Created {job.createdAt.toLocaleDateString()} at {job.createdAt.toLocaleTimeString()}
                    </CardDescription>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  {getStatusBadge(job.status)}
                  {job.status === 'processing' && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleCancel(job.id)}
                    >
                      <X className="h-4 w-4 mr-1" />
                      Cancel
                    </Button>
                  )}
                  {job.status === 'completed' && job.downloadUrl && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDownload(job.id)}
                    >
                      <Download className="h-4 w-4 mr-1" />
                      Download
                    </Button>
                  )}
                  {(job.status === 'completed' || job.status === 'failed' || job.status === 'cancelled') && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDelete(job.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {/* Job Details */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  <div>
                    <span className="text-gray-500">Files:</span>
                    <div className="font-medium">{job.totalFiles}</div>
                  </div>
                  <div>
                    <span className="text-gray-500">Language:</span>
                    <div className="font-medium flex items-center">
                      <Languages className="h-3 w-3 mr-1" />
                      {job.sourceLanguage || 'auto'} → {job.targetLanguage}
                    </div>
                  </div>
                  <div>
                    <span className="text-gray-500">AI Service:</span>
                    <div className="font-medium capitalize">{job.aiService}</div>
                  </div>
                  <div>
                    <span className="text-gray-500">Duration:</span>
                    <div className="font-medium">
                      {job.processingTimeMs ? formatDuration(job.processingTimeMs) : '-'}
                    </div>
                  </div>
                </div>

                {/* Progress */}
                {(job.status === 'processing' || job.status === 'completed') && (
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Progress</span>
                      <span>{progress.processedFiles}/{progress.totalFiles} files ({progress.progress}%)</span>
                    </div>
                    <Progress value={progress.progress} className="h-2" />
                    {progress.currentFile && (
                      <p className="text-xs text-gray-600">
                        Currently processing: {progress.currentFile}
                      </p>
                    )}
                    {progress.estimatedTimeRemaining && progress.estimatedTimeRemaining > 0 && (
                      <p className="text-xs text-gray-600">
                        Estimated time remaining: {progress.estimatedTimeRemaining}s
                      </p>
                    )}
                  </div>
                )}

                {/* Error Message */}
                {job.status === 'failed' && job.errorMessage && (
                  <div className="p-3 text-sm text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800/30 rounded-md">
                    {job.errorMessage}
                  </div>
                )}

                {/* File Status */}
                {job.files.length > 0 && (job.status === 'processing' || job.status === 'completed' || job.status === 'failed') && (
                  <div className="space-y-2">
                    <h4 className="text-sm font-medium">File Status</h4>
                    <div className="max-h-32 overflow-y-auto space-y-1">
                      {job.files.map(file => (
                        <div key={file.id} className="flex items-center justify-between text-xs p-2 bg-gray-50 dark:bg-card rounded">
                          <span className="truncate">{file.originalName}</span>
                          <div className="flex items-center space-x-2">
                            {file.status === 'completed' && <CheckCircle className="h-3 w-3 text-green-500" />}
                            {file.status === 'failed' && <XCircle className="h-3 w-3 text-red-500" />}
                            {file.status === 'processing' && <Loader2 className="h-3 w-3 text-blue-500 animate-spin" />}
                            {file.status === 'pending' && <Clock className="h-3 w-3 text-gray-500" />}
                            <span className="capitalize">{file.status}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}
