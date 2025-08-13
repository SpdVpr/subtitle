'use client'

import { useState, useEffect, createContext, useContext } from 'react'
import { useAuth } from './useAuth'
import { 
  BatchJob, 
  BatchJobRequest, 
  BatchProgress, 
  BatchContextType 
} from '@/types/batch'
import { BatchProcessor } from '@/lib/batch-processor'

const BatchContext = createContext<BatchContextType | null>(null)

export function useBatch() {
  const context = useContext(BatchContext)
  if (!context) {
    throw new Error('useBatch must be used within a BatchProvider')
  }
  return context
}

export function useBatchProvider(): BatchContextType {
  const { user } = useAuth()
  const [jobs, setJobs] = useState<BatchJob[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (user) {
      refreshJobs()
    } else {
      setJobs([])
    }
  }, [user])

  const refreshJobs = async (): Promise<void> => {
    if (!user) return
    
    try {
      setLoading(true)
      setError(null)
      
      const userJobs = BatchProcessor.getUserJobs(user.uid)
      setJobs(userJobs)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load batch jobs')
    } finally {
      setLoading(false)
    }
  }

  const createBatchJob = async (request: BatchJobRequest): Promise<string> => {
    if (!user) {
      throw new Error('User must be logged in to create batch jobs')
    }

    try {
      setError(null)
      const jobId = await BatchProcessor.createJob(request, user.uid)
      
      // Refresh jobs to include the new one
      await refreshJobs()
      
      return jobId
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to create batch job'
      setError(errorMessage)
      throw new Error(errorMessage)
    }
  }

  const getBatchJob = async (jobId: string): Promise<BatchJob | null> => {
    try {
      setError(null)
      return BatchProcessor.getJob(jobId)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to get batch job')
      return null
    }
  }

  const cancelBatchJob = async (jobId: string): Promise<void> => {
    try {
      setError(null)
      BatchProcessor.cancelJob(jobId)
      await refreshJobs()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to cancel batch job')
      throw err
    }
  }

  const deleteBatchJob = async (jobId: string): Promise<void> => {
    try {
      setError(null)
      BatchProcessor.deleteJob(jobId)
      await refreshJobs()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete batch job')
      throw err
    }
  }

  const downloadBatchResult = async (jobId: string): Promise<void> => {
    try {
      setError(null)
      const job = BatchProcessor.getJob(jobId)
      
      if (!job || !job.downloadUrl) {
        throw new Error('Download not available')
      }

      // Create download link
      const link = document.createElement('a')
      link.href = job.downloadUrl
      link.download = `${job.name}_translated.zip`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to download batch result')
      throw err
    }
  }

  const subscribeToBatchProgress = (
    jobId: string, 
    callback: (progress: BatchProgress) => void
  ): (() => void) => {
    return BatchProcessor.subscribeToProgress(jobId, callback)
  }

  return {
    jobs,
    loading,
    error,
    createBatchJob,
    getBatchJob,
    cancelBatchJob,
    deleteBatchJob,
    downloadBatchResult,
    subscribeToBatchProgress,
    refreshJobs,
  }
}

export { BatchContext }
