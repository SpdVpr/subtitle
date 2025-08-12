import { NextRequest, NextResponse } from 'next/server'
import { TranslationJobService, UserService, AnalyticsService } from '@/lib/database'
import { StorageService } from '@/lib/storage'
import { ErrorTracker } from '@/lib/error-tracking'
import { SubtitleProcessor } from '@/lib/subtitle-processor'
import { TranslationServiceFactory } from '@/lib/translation-services'
import { PremiumTranslationService } from '@/lib/premium-translation-service'
import { updateTranslationProgress } from '../translate-progress/route'
// Security validation will be handled in middleware

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData()
    const file = formData.get('file') as File
    const targetLanguage = formData.get('targetLanguage') as string
    const sourceLanguage = formData.get('sourceLanguage') as string | null
    const aiServiceRaw = formData.get('aiService') as 'google' | 'openai' | 'premium'
    // Map premium to openai for database storage
    const aiService: 'google' | 'openai' = aiServiceRaw === 'premium' ? 'openai' : aiServiceRaw as 'google' | 'openai'
    const userId = formData.get('userId') as string
    const sessionId = formData.get('sessionId') as string || `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`

    // Basic validation (security handled in middleware)
    if (!file || !targetLanguage || !userId) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Validate file
    const fileValidation = StorageService.validateFile(file)
    if (!fileValidation.valid) {
      return NextResponse.json(
        { error: fileValidation.error },
        { status: 400 }
      )
    }

    // Check user limits (skip for demo user)
    let user = null
    if (userId && userId.endsWith('-user-demo')) {
      // Create mock user for any demo account (free/pro/premium)
      user = {
        uid: userId,
        email: userId.includes('premium') ? 'premium@test.com' : userId.includes('pro') ? 'pro@test.com' : 'free@test.com',
        displayName: userId.includes('premium') ? 'Premium Test User' : userId.includes('pro') ? 'Pro Test User' : 'Free Test User',
        usage: {
          translationsUsed: 0,
          translationsLimit: userId.includes('premium') ? 1000 : userId.includes('pro') ? 200 : 10,
          batchJobsUsed: 0,
          batchJobsLimit: userId.includes('premium') ? 10 : userId.includes('pro') ? 5 : 0
        }
      }
    } else {
      user = await UserService.getUser(userId)
      if (!user) {
        return NextResponse.json(
          { error: 'User not found' },
          { status: 404 }
        )
      }

      if (user.usage.translationsUsed >= user.usage.translationsLimit) {
        return NextResponse.json(
          { error: 'Translation limit exceeded' },
          { status: 429 }
        )
      }
    }

    // Inline processing for demo user to avoid Firebase dependencies
    if (userId === 'premium-user-demo') {
      try {
        // Process subtitle file
        const fileContent = await file.text()
        const subtitleEntries = SubtitleProcessor.parseSRT(fileContent)

        if (subtitleEntries.length === 0) {
          return NextResponse.json({ error: 'No valid subtitles found in file' }, { status: 400 })
        }

        // For premium service, always use job system for progress tracking
        if (aiServiceRaw === 'premium') {
          console.log('🎬 Premium service will use job system for progress tracking')
          // Skip inline processing for premium - use job system below
        } else {
          let translatedEntries
          // Use traditional chunking approach for other services
          console.log('🔧 Using traditional translation service:', aiService)
          const textChunks = SubtitleProcessor.splitTextForTranslation(subtitleEntries)
          let translationService
          try {
            translationService = TranslationServiceFactory.create(aiService)
          } catch (err) {
            translationService = TranslationServiceFactory.create('google')
          }

          const translatedChunks: string[][] = []
          for (const chunk of textChunks) {
            const translatedChunk = await translationService.translate(
              chunk,
              targetLanguage,
              sourceLanguage || 'en'
            )
            translatedChunks.push(translatedChunk)
          }

          translatedEntries = SubtitleProcessor.mergeTranslatedChunks(
            subtitleEntries,
            translatedChunks,
            sourceLanguage || 'en',
            targetLanguage,
            false
          )
          const translatedContent = SubtitleProcessor.generateSRT(translatedEntries)
          const translatedFileName = file.name.replace('.srt', `_${targetLanguage}.srt`)

          return NextResponse.json({
            status: 'completed',
            translatedContent,
            translatedFileName,
            subtitleCount: subtitleEntries.length,
            characterCount: translatedContent.length,
          })
        }
      } catch (inlineErr) {
        await ErrorTracker.logApiError(
          inlineErr instanceof Error ? inlineErr : new Error(String(inlineErr)),
          '/api/translate',
          'POST'
        )
        return NextResponse.json({ error: 'Inline translation failed' }, { status: 500 })
      }
    }

    try {
      // Create translation job
      console.log('📋 Creating translation job for premium service')

      // For demo users, use simplified job system
      if (userId === 'premium-user-demo') {
        console.log('🎭 Demo user detected - using simplified job system')
        const jobId = `demo_job_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`

        // Start processing in background without database
        console.log('🚀 Starting demo background processing')
        processTranslationJobDemo(jobId, file, userId, sourceLanguage, targetLanguage, aiServiceRaw, sessionId)

        return NextResponse.json({
          jobId,
          sessionId,
          status: 'pending',
          message: 'Demo translation job created successfully'
        })
      }

      // For real users, use full database system
      const jobId = await TranslationJobService.createJob({
        userId,
        type: 'single',
        status: 'pending',
        originalFileName: file.name,
        originalFileSize: file.size,
        sourceLanguage: sourceLanguage || undefined,
        targetLanguage,
        aiService
      })
      console.log('✅ Translation job created:', jobId)

      // Start processing in background
      console.log('🚀 Starting background processing')
      processTranslationJob(jobId, file, userId, sourceLanguage, targetLanguage, aiServiceRaw, sessionId)

      return NextResponse.json({
        jobId,
        sessionId,
        status: 'pending',
        message: 'Translation job created successfully'
      })
    } catch (jobError) {
      console.error('❌ Job creation failed:', jobError)
      console.error('❌ Job error details:', jobError instanceof Error ? jobError.message : String(jobError))
      console.error('❌ Job error stack:', jobError instanceof Error ? jobError.stack : 'No stack trace')

      await ErrorTracker.logApiError(
        jobError instanceof Error ? jobError : new Error(String(jobError)),
        '/api/translate',
        'POST'
      )
      return NextResponse.json({ error: 'Failed to create translation job' }, { status: 500 })
    }

  } catch (error) {
    await ErrorTracker.logApiError(
      error instanceof Error ? error : new Error(String(error)),
      '/api/translate',
      'POST'
    )

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

async function processTranslationJob(
  jobId: string,
  file: File,
  userId: string,
  sourceLanguage: string | null,
  targetLanguage: string,
  aiServiceRaw: 'google' | 'openai' | 'premium',
  sessionId: string
) {
  const startTime = Date.now()
  // Map premium to openai for service creation
  const aiService: 'google' | 'openai' = aiServiceRaw === 'premium' ? 'openai' : aiServiceRaw as 'google' | 'openai'

  try {
    console.log('🎬 Processing translation job:', jobId)
    console.log('🔧 Job details:', { userId, sourceLanguage, targetLanguage, aiServiceRaw, sessionId })

    // Update job status
    console.log('📊 Updating job status to processing')
    await TranslationJobService.updateJob(jobId, {
      status: 'processing',
      startedAt: new Date() as any
    })
    console.log('✅ Job status updated')

    // Upload original file
    console.log('📁 Uploading original file to storage')
    const { url: originalFileUrl } = await StorageService.uploadFile(
      file,
      userId,
      jobId,
      true
    )
    console.log('✅ Original file uploaded:', originalFileUrl)

    console.log('📊 Updating job with file URL')
    await TranslationJobService.updateJob(jobId, {
      originalFileUrl
    })
    console.log('✅ Job updated with file URL')

    // Process subtitle file
    const fileContent = await file.text()
    const subtitleEntries = SubtitleProcessor.parseSRT(fileContent)

    if (subtitleEntries.length === 0) {
      throw new Error('No valid subtitles found in file')
    }

    let translatedEntries

    if (aiServiceRaw === 'premium') {
      // Use new Premium Context AI service for best quality
      const premiumService = new PremiumTranslationService(process.env.OPENAI_API_KEY || 'demo_key')

      // Progress callback for real-time updates
      const progressCallback = (stage: string, progress: number, details?: string) => {
        console.log(`🔄 Background Translation Progress: ${stage} (${progress}%) - ${details || ''}`)
        updateTranslationProgress(sessionId, stage, progress, details)
      }

      translatedEntries = await premiumService.translateSubtitles(
        subtitleEntries,
        targetLanguage,
        sourceLanguage || 'en',
        file.name,
        progressCallback
      )
    } else {
      // Use traditional chunking approach for other services
      const textChunks = SubtitleProcessor.splitTextForTranslation(subtitleEntries)

      // Build-safe: only create translation service at runtime
      let translationService
      try {
        translationService = TranslationServiceFactory.create(aiService)
      } catch (error) {
        console.warn('Translation service creation failed, using fallback:', error)
        translationService = TranslationServiceFactory.create('google') // Safe fallback
      }

      const translatedChunks: string[][] = []

      // Translate chunks
      for (const chunk of textChunks) {
        const translatedChunk = await translationService.translate(
          chunk,
          targetLanguage,
          sourceLanguage || 'en'
        )
        translatedChunks.push(translatedChunk)
      }

      // Merge translated chunks
      translatedEntries = SubtitleProcessor.mergeTranslatedChunks(
        subtitleEntries,
        translatedChunks,
        sourceLanguage || 'en',
        targetLanguage,
        false
      )
    }

    // Generate translated SRT content
    const translatedContent = SubtitleProcessor.generateSRT(translatedEntries)
    
    // Upload translated file
    const translatedFileName = file.name.replace('.srt', `_${targetLanguage}.srt`)
    const { url: translatedFileUrl } = await StorageService.uploadTranslatedFile(
      translatedContent,
      file.name,
      userId,
      jobId,
      targetLanguage
    )

    const processingTime = Date.now() - startTime

    // Update job as completed
    await TranslationJobService.updateJob(jobId, {
      status: 'completed',
      completedAt: new Date() as any,
      processingTimeMs: processingTime,
      translatedFileName,
      translatedFileUrl,
      subtitleCount: subtitleEntries.length,
      characterCount: fileContent.length,
      confidence: 0.85 // Mock confidence score
    })

    // Update user usage (skip for demo user)
    if (userId !== 'premium-user-demo') {
      await UserService.updateUsage(userId, {
        translationsUsed: 1
      })
    }

    // Record analytics
    const today = new Date().toISOString().split('T')[0]
    await AnalyticsService.recordDailyUsage(userId, today, {
      translationsCount: 1,
      filesProcessed: 1,
      charactersTranslated: fileContent.length,
      processingTimeMs: processingTime,
      languagePairs: { [`${sourceLanguage || 'auto'}-${targetLanguage}`]: 1 },
      serviceUsage: { [aiServiceRaw]: 1 },
      averageConfidence: 0.85
    })

    ErrorTracker.addBreadcrumb(
      'Translation completed successfully',
      'translation',
      'info',
      { jobId, processingTime, subtitleCount: subtitleEntries.length }
    )

  } catch (error) {
    const processingTime = Date.now() - startTime
    console.error('❌ Translation job failed:', jobId, error)
    console.error('❌ Error details:', error instanceof Error ? error.message : String(error))
    console.error('❌ Error stack:', error instanceof Error ? error.stack : 'No stack trace')

    // Update progress with error
    updateTranslationProgress(sessionId, 'error', 0, `Translation failed: ${error instanceof Error ? error.message : 'Unknown error'}`)

    // Update job as failed
    try {
      await TranslationJobService.updateJob(jobId, {
        status: 'failed',
        completedAt: new Date() as any,
        processingTimeMs: processingTime,
        errorMessage: error instanceof Error ? error.message : 'Translation failed'
      })
      console.log('✅ Job status updated to failed')
    } catch (updateError) {
      console.error('❌ Failed to update job status:', updateError)
    }

    // Log error
    await ErrorTracker.logTranslationError(
      error instanceof Error ? error : new Error(String(error)),
      userId,
      jobId,
      {
        sourceLanguage: sourceLanguage || undefined,
        targetLanguage,
        aiService: aiServiceRaw,
        fileSize: file.size
      }
    )

    // Record failed analytics
    const today = new Date().toISOString().split('T')[0]
    await AnalyticsService.recordDailyUsage(userId, today, {
      errorCount: 1
    })
  }
}

// GET endpoint to check job status
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

    // Check for demo jobs first
    if (jobId.startsWith('demo_job_') && userId === 'premium-user-demo') {
      console.log('🎭 Checking demo job status:', jobId)
      const demoResults = (global as any).demoJobResults || {}
      const demoJob = demoResults[jobId]

      if (!demoJob) {
        return NextResponse.json({
          status: 'processing',
          message: 'Demo job is still processing...'
        })
      }

      return NextResponse.json(demoJob)
    }

    // For real users, use database
    const job = await TranslationJobService.getJob(jobId)

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
      '/api/translate',
      'GET'
    )

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// Demo version of processTranslationJob that doesn't use database
async function processTranslationJobDemo(
  jobId: string,
  file: File,
  userId: string,
  sourceLanguage: string | null,
  targetLanguage: string,
  aiServiceRaw: 'google' | 'openai' | 'premium',
  sessionId: string
) {
  const startTime = Date.now()

  try {
    console.log('🎭 Processing DEMO translation job:', jobId)
    console.log('🔧 Demo job details:', { userId, sourceLanguage, targetLanguage, aiServiceRaw, sessionId })

    // Process subtitle file
    const fileContent = await file.text()
    const subtitleEntries = SubtitleProcessor.parseSRT(fileContent)

    if (subtitleEntries.length === 0) {
      console.error('❌ No valid subtitles found in file')
      updateTranslationProgress(sessionId, 'error', 0, 'No valid subtitles found in file')
      return
    }

    console.log('📊 Demo: Processing', subtitleEntries.length, 'subtitle entries')

    // Use Premium Context AI service for demo
    const premiumService = new PremiumTranslationService(process.env.OPENAI_API_KEY || 'demo_key')

    // Progress callback for real-time updates
    const progressCallback = (stage: string, progress: number, details?: string) => {
      console.log(`🔄 Demo Translation Progress: ${stage} (${progress}%) - ${details || ''}`)
      updateTranslationProgress(sessionId, stage, progress, details)
    }

    const translatedEntries = await premiumService.translateSubtitles(
      subtitleEntries,
      targetLanguage,
      sourceLanguage || 'en',
      file.name,
      progressCallback
    )

    // Generate translated content
    const translatedContent = SubtitleProcessor.generateSRT(translatedEntries)
    const translatedFileName = file.name.replace('.srt', `_${targetLanguage}.srt`)

    console.log('✅ Demo translation completed successfully')

    // Store result in memory for demo (in real app, this would be in database)
    ;(global as any).demoJobResults = (global as any).demoJobResults || {}
    ;(global as any).demoJobResults[jobId] = {
      status: 'completed',
      translatedContent,
      translatedFileName,
      subtitleCount: translatedEntries.length,
      processingTimeMs: Date.now() - startTime,
      completedAt: new Date().toISOString()
    }

    // Final progress update
    updateTranslationProgress(sessionId, 'completed', 100, 'Demo translation completed successfully!')

  } catch (error) {
    const processingTime = Date.now() - startTime
    console.error('❌ Demo translation job failed:', jobId, error)

    // Update progress with error
    updateTranslationProgress(sessionId, 'error', 0, `Demo translation failed: ${error instanceof Error ? error.message : 'Unknown error'}`)

    // Store error result
    ;(global as any).demoJobResults = (global as any).demoJobResults || {}
    ;(global as any).demoJobResults[jobId] = {
      status: 'failed',
      errorMessage: error instanceof Error ? error.message : 'Demo translation failed',
      processingTimeMs: processingTime
    }
  }
}
