import { NextRequest, NextResponse } from 'next/server'
import { BatchJobService, UserService, AnalyticsService } from '@/lib/database'
import { StorageService } from '@/lib/storage'
import { ErrorTracker } from '@/lib/error-tracking'
import { SubtitleProcessor } from '@/lib/subtitle-processor'
import { TranslationServiceFactory } from '@/lib/translation-services'
import JSZip from 'jszip'

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData()
    const files = formData.getAll('files') as File[]
    const targetLanguage = formData.get('targetLanguage') as string
    const sourceLanguage = formData.get('sourceLanguage') as string | null
    const aiService = formData.get('aiService') as 'google' | 'openai' | 'premium'
    const userId = formData.get('userId') as string
    const jobName = formData.get('jobName') as string

    // Validate inputs
    if (!files.length || !targetLanguage || !userId || !jobName) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Check user limits
    const user = await UserService.getUser(userId)
    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    if (user.usage.batchJobsUsed >= user.usage.batchJobsLimit) {
      return NextResponse.json(
        { error: 'Batch job limit exceeded' },
        { status: 429 }
      )
    }

    // Validate files
    for (const file of files) {
      const validation = StorageService.validateFile(file)
      if (!validation.valid) {
        return NextResponse.json(
          { error: `File ${file.name}: ${validation.error}` },
          { status: 400 }
        )
      }
    }

    // Create batch files
    const batchFiles = files.map((file, index) => ({
      id: `file_${index}_${Date.now()}`,
      originalName: file.name,
      size: file.size,
      status: 'pending' as const,
      progress: 0
    }))

    // Create batch job
    const jobId = await BatchJobService.createJob({
      userId,
      name: jobName,
      status: 'pending',
      sourceLanguage: sourceLanguage || undefined,
      targetLanguage,
      aiService,
      totalFiles: files.length,
      processedFiles: 0,
      failedFiles: 0,
      progress: 0,
      files: batchFiles
    })

    // Start processing in background
    processBatchJob(jobId, files, userId, sourceLanguage, targetLanguage, aiService)

    return NextResponse.json({
      jobId,
      status: 'pending',
      message: 'Batch job created successfully'
    })

  } catch (error) {
    await ErrorTracker.logApiError(
      error instanceof Error ? error : new Error(String(error)),
      '/api/batch',
      'POST'
    )

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

async function processBatchJob(
  jobId: string,
  files: File[],
  userId: string,
  sourceLanguage: string | null,
  targetLanguage: string,
  aiService: 'google' | 'openai' | 'premium'
) {
  const startTime = Date.now()

  try {
    // Update job status
    await BatchJobService.updateJob(jobId, {
      status: 'processing',
      startedAt: new Date() as any
    })

    const translationService = TranslationServiceFactory.create(aiService)
    const translatedFiles: { name: string; content: string }[] = []
    let processedFiles = 0
    let failedFiles = 0

    for (let i = 0; i < files.length; i++) {
      const file = files[i]
      const fileStartTime = Date.now()

      try {
        // Get current job state
        const job = await BatchJobService.getJob(jobId)
        if (!job || job.status === 'cancelled') break

        // Update file status to processing
        const updatedFiles = [...job.files]
        updatedFiles[i].status = 'processing'
        
        await BatchJobService.updateJob(jobId, {
          files: updatedFiles
        })

        // Upload original file
        const { url: originalUrl } = await StorageService.uploadFile(
          file,
          userId,
          jobId,
          true
        )

        updatedFiles[i].originalUrl = originalUrl

        // Process file
        const fileContent = await file.text()
        const subtitleEntries = SubtitleProcessor.parseSRT(fileContent)

        if (subtitleEntries.length === 0) {
          throw new Error('No valid subtitles found in file')
        }

        updatedFiles[i].subtitleCount = subtitleEntries.length

        // Translate file
        const textChunks = SubtitleProcessor.splitTextForTranslation(subtitleEntries)
        const translatedChunks: string[][] = []

        for (const chunk of textChunks) {
          const translatedChunk = await translationService.translate(
            chunk,
            targetLanguage,
            sourceLanguage || 'en'
          )
          translatedChunks.push(translatedChunk)
        }

        // Merge translated chunks
        const translatedEntries = SubtitleProcessor.mergeTranslatedChunks(
          subtitleEntries,
          translatedChunks,
          sourceLanguage || 'en',
          targetLanguage
        )

        // Generate translated content
        const translatedContent = SubtitleProcessor.generateSRT(translatedEntries)
        const translatedFileName = file.name.replace('.srt', `_${targetLanguage}.srt`)

        // Upload translated file
        const { url: translatedUrl } = await StorageService.uploadTranslatedFile(
          translatedContent,
          file.name,
          userId,
          jobId,
          targetLanguage
        )

        // Add to ZIP collection
        translatedFiles.push({
          name: translatedFileName,
          content: translatedContent
        })

        // Update file as completed
        const fileProcessingTime = Date.now() - fileStartTime
        updatedFiles[i].status = 'completed'
        updatedFiles[i].progress = 100
        updatedFiles[i].translatedUrl = translatedUrl
        updatedFiles[i].translatedName = translatedFileName
        updatedFiles[i].processingTimeMs = fileProcessingTime
        updatedFiles[i].confidence = 0.85

        processedFiles++

        // Update job progress
        const progress = Math.round((processedFiles / files.length) * 100)
        await BatchJobService.updateJob(jobId, {
          files: updatedFiles,
          processedFiles,
          progress
        })

      } catch (error) {
        // Mark file as failed
        const job = await BatchJobService.getJob(jobId)
        if (job) {
          const updatedFiles = [...job.files]
          updatedFiles[i].status = 'failed'
          updatedFiles[i].errorMessage = error instanceof Error ? error.message : 'Processing failed'
          
          failedFiles++
          processedFiles++

          const progress = Math.round((processedFiles / files.length) * 100)
          await BatchJobService.updateJob(jobId, {
            files: updatedFiles,
            processedFiles,
            failedFiles,
            progress
          })
        }

        await ErrorTracker.logBatchError(
          error instanceof Error ? error : new Error(String(error)),
          userId,
          jobId,
          {
            totalFiles: files.length,
            processedFiles,
            currentFile: file.name
          }
        )
      }
    }

    // Create ZIP file if we have translated files
    let downloadUrl: string | undefined

    if (translatedFiles.length > 0) {
      const zip = new JSZip()
      
      translatedFiles.forEach(file => {
        zip.file(file.name, file.content)
      })

      const zipBlob = await zip.generateAsync({ type: 'blob' })
      const zipFileName = `batch_translation_${targetLanguage}_${Date.now()}.zip`
      
      const { url } = await StorageService.uploadBatchZip(
        zipBlob,
        userId,
        jobId,
        zipFileName
      )
      
      downloadUrl = url
    }

    const processingTime = Date.now() - startTime

    // Update job as completed
    await BatchJobService.updateJob(jobId, {
      status: translatedFiles.length > 0 ? 'completed' : 'failed',
      completedAt: new Date() as any,
      processingTimeMs: processingTime,
      downloadUrl,
      errorMessage: translatedFiles.length === 0 ? 'No files were successfully processed' : undefined
    })

    // Update user usage
    await UserService.updateUsage(userId, {
      batchJobsUsed: 1,
      translationsUsed: translatedFiles.length
    })

    // Record analytics
    const today = new Date().toISOString().split('T')[0]
    await AnalyticsService.recordDailyUsage(userId, today, {
      translationsCount: translatedFiles.length,
      filesProcessed: translatedFiles.length,
      processingTimeMs: processingTime,
      languagePairs: { [`${sourceLanguage || 'auto'}-${targetLanguage}`]: translatedFiles.length },
      serviceUsage: { [aiService]: translatedFiles.length }
    })

  } catch (error) {
    const processingTime = Date.now() - startTime

    // Update job as failed
    await BatchJobService.updateJob(jobId, {
      status: 'failed',
      completedAt: new Date() as any,
      processingTimeMs: processingTime,
      errorMessage: error instanceof Error ? error.message : 'Batch processing failed'
    })

    await ErrorTracker.logBatchError(
      error instanceof Error ? error : new Error(String(error)),
      userId,
      jobId,
      { totalFiles: files.length }
    )
  }
}

// GET endpoint to check batch job status
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const jobId = searchParams.get('jobId')
    const userId = searchParams.get('userId')

    if (!jobId || !userId) {
      return NextResponse.json(
        { error: 'Missing jobId or userId' },
        { status: 400 }
      )
    }

    const job = await BatchJobService.getJob(jobId)
    
    if (!job) {
      return NextResponse.json(
        { error: 'Job not found' },
        { status: 404 }
      )
    }

    if (job.userId !== userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 403 }
      )
    }

    return NextResponse.json(job)

  } catch (error) {
    await ErrorTracker.logApiError(
      error instanceof Error ? error : new Error(String(error)),
      '/api/batch',
      'GET'
    )

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
