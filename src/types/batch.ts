export interface BatchJob {
  id: string
  userId: string
  name: string
  status: 'pending' | 'processing' | 'completed' | 'failed' | 'cancelled'
  createdAt: Date
  updatedAt: Date
  startedAt?: Date
  completedAt?: Date
  
  // Configuration
  sourceLanguage?: string
  targetLanguage: string
  aiService: 'google' | 'openai'
  
  // Files
  files: BatchFile[]
  
  // Progress
  totalFiles: number
  processedFiles: number
  failedFiles: number
  progress: number // 0-100
  
  // Results
  downloadUrl?: string
  errorMessage?: string
  processingTimeMs?: number
}

export interface BatchFile {
  id: string
  originalName: string
  size: number
  status: 'pending' | 'processing' | 'completed' | 'failed'
  progress: number // 0-100
  
  // Results
  translatedName?: string
  downloadUrl?: string
  errorMessage?: string
  
  // Metadata
  subtitleCount?: number
  processingTimeMs?: number
}

export interface BatchJobRequest {
  name: string
  files: File[]
  sourceLanguage?: string
  targetLanguage: string
  aiService: 'google' | 'openai'
}

export interface BatchJobResponse {
  jobId: string
  status: string
  message: string
}

export interface BatchProgress {
  jobId: string
  status: BatchJob['status']
  progress: number
  processedFiles: number
  totalFiles: number
  currentFile?: string
  estimatedTimeRemaining?: number
}

export interface BatchContextType {
  jobs: BatchJob[]
  loading: boolean
  error: string | null
  
  // Actions
  createBatchJob: (request: BatchJobRequest) => Promise<string>
  getBatchJob: (jobId: string) => Promise<BatchJob | null>
  cancelBatchJob: (jobId: string) => Promise<void>
  deleteBatchJob: (jobId: string) => Promise<void>
  downloadBatchResult: (jobId: string) => Promise<void>
  
  // Real-time updates
  subscribeToBatchProgress: (jobId: string, callback: (progress: BatchProgress) => void) => () => void
  refreshJobs: () => Promise<void>
}
