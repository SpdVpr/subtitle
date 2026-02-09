import { BatchJob, BatchFile, BatchJobRequest, BatchProgress } from '@/types/batch'
import { SubtitleProcessor } from './subtitle-processor'
import { TranslationServiceFactory } from './translation-services'
import JSZip from 'jszip'

export class BatchProcessor {
  private static jobs = new Map<string, BatchJob>()
  private static progressCallbacks = new Map<string, ((progress: BatchProgress) => void)[]>()

  /**
   * Create a new batch job
   */
  static async createJob(request: BatchJobRequest, userId: string): Promise<string> {
    const jobId = 'batch_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9)
    
    const batchFiles: BatchFile[] = request.files.map((file, index) => ({
      id: `file_${index}_${Date.now()}`,
      originalName: file.name,
      size: file.size,
      status: 'pending',
      progress: 0,
    }))

    const job: BatchJob = {
      id: jobId,
      userId,
      name: request.name,
      status: 'pending',
      createdAt: new Date(),
      updatedAt: new Date(),
      sourceLanguage: request.sourceLanguage,
      targetLanguage: request.targetLanguage,
      aiService: request.aiService,
      files: batchFiles,
      totalFiles: request.files.length,
      processedFiles: 0,
      failedFiles: 0,
      progress: 0,
    }

    this.jobs.set(jobId, job)
    
    // Start processing in background
    this.processJobAsync(jobId, request.files)
    
    return jobId
  }

  /**
   * Get batch job by ID
   */
  static getJob(jobId: string): BatchJob | null {
    return this.jobs.get(jobId) || null
  }

  /**
   * Get all jobs for user
   */
  static getUserJobs(userId: string): BatchJob[] {
    return Array.from(this.jobs.values())
      .filter(job => job.userId === userId)
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
  }

  /**
   * Cancel batch job
   */
  static cancelJob(jobId: string): void {
    const job = this.jobs.get(jobId)
    if (job && job.status === 'processing') {
      job.status = 'cancelled'
      job.updatedAt = new Date()
      this.jobs.set(jobId, job)
      this.notifyProgress(jobId)
    }
  }

  /**
   * Delete batch job
   */
  static deleteJob(jobId: string): void {
    this.jobs.delete(jobId)
    this.progressCallbacks.delete(jobId)
  }

  /**
   * Subscribe to job progress updates
   */
  static subscribeToProgress(jobId: string, callback: (progress: BatchProgress) => void): () => void {
    if (!this.progressCallbacks.has(jobId)) {
      this.progressCallbacks.set(jobId, [])
    }
    
    this.progressCallbacks.get(jobId)!.push(callback)
    
    // Return unsubscribe function
    return () => {
      const callbacks = this.progressCallbacks.get(jobId)
      if (callbacks) {
        const index = callbacks.indexOf(callback)
        if (index > -1) {
          callbacks.splice(index, 1)
        }
      }
    }
  }

  /**
   * Process batch job asynchronously
   */
  private static async processJobAsync(jobId: string, files: File[]): Promise<void> {
    const job = this.jobs.get(jobId)
    if (!job) return

    try {
      job.status = 'processing'
      job.startedAt = new Date()
      job.updatedAt = new Date()
      this.jobs.set(jobId, job)
      this.notifyProgress(jobId)

      const translationService = TranslationServiceFactory.create(job.aiService)
      const translatedFiles: { name: string; content: string }[] = []

      for (let i = 0; i < files.length; i++) {
        if (job.status === 'cancelled') break

        const file = files[i]
        const batchFile = job.files[i]
        
        try {
          // Update file status
          batchFile.status = 'processing'
          job.updatedAt = new Date()
          this.jobs.set(jobId, job)
          this.notifyProgress(jobId)

          // Process file
          const fileContent = await file.text()
          const subtitleFile = SubtitleProcessor.parseSRT(fileContent)
          
          if (subtitleFile.length === 0) {
            throw new Error('No valid subtitles found in file')
          }

          batchFile.subtitleCount = subtitleFile.length
          
          // Split into chunks for translation
          const textChunks = SubtitleProcessor.splitTextForTranslation(subtitleFile)
          const translatedChunks: string[][] = []

          // Translate chunks with progress updates
          for (let chunkIndex = 0; chunkIndex < textChunks.length; chunkIndex++) {
            if (job.status === 'cancelled') break

            const chunk = textChunks[chunkIndex]
            const translatedChunk = await translationService.translate(
              chunk,
              job.targetLanguage,
              job.sourceLanguage
            )
            
            translatedChunks.push(translatedChunk)
            
            // Update file progress
            batchFile.progress = Math.round(((chunkIndex + 1) / textChunks.length) * 100)
            this.jobs.set(jobId, job)
            this.notifyProgress(jobId)
          }

          if (job.status === 'cancelled') break

          // Merge translated chunks
          const translatedEntries = SubtitleProcessor.mergeTranslatedChunks(
            subtitleFile,
            translatedChunks,
            job.sourceLanguage || 'en',
            job.targetLanguage
          )

          // Generate translated content
          const translatedContent = SubtitleProcessor.generateSRT(translatedEntries, job.targetLanguage)
          const translatedFileName = file.name.replace('.srt', `_${job.targetLanguage}.srt`)
          
          translatedFiles.push({
            name: translatedFileName,
            content: translatedContent
          })

          // Mark file as completed
          batchFile.status = 'completed'
          batchFile.progress = 100
          batchFile.translatedName = translatedFileName
          batchFile.processingTimeMs = Date.now() - job.startedAt!.getTime()
          
          job.processedFiles++
          job.progress = Math.round((job.processedFiles / job.totalFiles) * 100)
          job.updatedAt = new Date()
          this.jobs.set(jobId, job)
          this.notifyProgress(jobId)

        } catch (error) {
          // Mark file as failed
          batchFile.status = 'failed'
          batchFile.errorMessage = error instanceof Error ? error.message : 'Processing failed'
          job.failedFiles++
          job.processedFiles++
          job.progress = Math.round((job.processedFiles / job.totalFiles) * 100)
          job.updatedAt = new Date()
          this.jobs.set(jobId, job)
          this.notifyProgress(jobId)
        }
      }

      if (job.status === 'cancelled') return

      // Create ZIP file with all translated files
      if (translatedFiles.length > 0) {
        const zip = new JSZip()
        
        translatedFiles.forEach(file => {
          zip.file(file.name, file.content)
        })

        const zipBlob = await zip.generateAsync({ type: 'blob' })
        const downloadUrl = URL.createObjectURL(zipBlob)
        
        job.downloadUrl = downloadUrl
      }

      // Mark job as completed
      job.status = translatedFiles.length > 0 ? 'completed' : 'failed'
      job.completedAt = new Date()
      job.progress = 100
      job.processingTimeMs = Date.now() - job.startedAt!.getTime()
      job.updatedAt = new Date()
      
      if (translatedFiles.length === 0) {
        job.errorMessage = 'No files were successfully processed'
      }

      this.jobs.set(jobId, job)
      this.notifyProgress(jobId)

    } catch (error) {
      // Mark job as failed
      job.status = 'failed'
      job.errorMessage = error instanceof Error ? error.message : 'Batch processing failed'
      job.completedAt = new Date()
      job.updatedAt = new Date()
      this.jobs.set(jobId, job)
      this.notifyProgress(jobId)
    }
  }

  /**
   * Notify progress callbacks
   */
  private static notifyProgress(jobId: string): void {
    const job = this.jobs.get(jobId)
    const callbacks = this.progressCallbacks.get(jobId)
    
    if (job && callbacks) {
      const progress: BatchProgress = {
        jobId: job.id,
        status: job.status,
        progress: job.progress,
        processedFiles: job.processedFiles,
        totalFiles: job.totalFiles,
        currentFile: job.files.find(f => f.status === 'processing')?.originalName,
        estimatedTimeRemaining: this.calculateEstimatedTime(job)
      }

      callbacks.forEach(callback => {
        try {
          callback(progress)
        } catch (error) {
          console.error('Error in progress callback:', error)
        }
      })
    }
  }

  /**
   * Calculate estimated time remaining
   */
  private static calculateEstimatedTime(job: BatchJob): number | undefined {
    if (!job.startedAt || job.processedFiles === 0) return undefined
    
    const elapsedMs = Date.now() - job.startedAt.getTime()
    const avgTimePerFile = elapsedMs / job.processedFiles
    const remainingFiles = job.totalFiles - job.processedFiles
    
    return Math.round(avgTimePerFile * remainingFiles / 1000) // seconds
  }
}
