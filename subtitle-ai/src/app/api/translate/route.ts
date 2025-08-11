import { NextRequest, NextResponse } from 'next/server'
import { TranslationJobService, UserService, AnalyticsService } from '@/lib/database'
import { StorageService } from '@/lib/storage'
import { ErrorTracker } from '@/lib/error-tracking'
import { SubtitleProcessor } from '@/lib/subtitle-processor'
import { TranslationServiceFactory } from '@/lib/translation-services'
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

        // Split into chunks and translate using requested service (premium -> openai)
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

        const translatedEntries = SubtitleProcessor.mergeTranslatedChunks(
          subtitleEntries,
          translatedChunks,
          sourceLanguage || 'en',
          targetLanguage
        )
        const translatedContent = SubtitleProcessor.generateSRT(translatedEntries)
        const translatedFileName = file.name.replace('.srt', `_${targetLanguage}.srt`)

        return NextResponse.json({
          status: 'completed',
          translatedContent,
          translatedFileName,
          subtitleCount: subtitleEntries.length,
          characterCount: fileContent.length,
        })
      } catch (inlineErr) {
        await ErrorTracker.logApiError(
          inlineErr instanceof Error ? inlineErr : new Error(String(inlineErr)),
          '/api/translate',
          'POST'
        )
        return NextResponse.json({ error: 'Inline translation failed' }, { status: 500 })
      }
    }

    // Create translation job
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

    // Start processing in background
    processTranslationJob(jobId, file, userId, sourceLanguage, targetLanguage, aiServiceRaw)

    return NextResponse.json({
      jobId,
      status: 'pending',
      message: 'Translation job created successfully'
    })

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
  aiServiceRaw: 'google' | 'openai' | 'premium'
) {
  const startTime = Date.now()
  // Map premium to openai for service creation
  const aiService: 'google' | 'openai' = aiServiceRaw === 'premium' ? 'openai' : aiServiceRaw as 'google' | 'openai'

  try {
    // Update job status
    await TranslationJobService.updateJob(jobId, {
      status: 'processing',
      startedAt: new Date() as any
    })

    // Upload original file
    const { url: originalFileUrl } = await StorageService.uploadFile(
      file,
      userId,
      jobId,
      true
    )

    await TranslationJobService.updateJob(jobId, {
      originalFileUrl
    })

    // Process subtitle file
    const fileContent = await file.text()
    const subtitleEntries = SubtitleProcessor.parseSRT(fileContent)

    if (subtitleEntries.length === 0) {
      throw new Error('No valid subtitles found in file')
    }

    // Split into chunks for translation
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
    const translatedEntries = SubtitleProcessor.mergeTranslatedChunks(
      subtitleEntries,
      translatedChunks,
      sourceLanguage || 'en',
      targetLanguage
    )

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

    // Update job as failed
    await TranslationJobService.updateJob(jobId, {
      status: 'failed',
      completedAt: new Date() as any,
      processingTimeMs: processingTime,
      errorMessage: error instanceof Error ? error.message : 'Translation failed'
    })

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
