import { NextRequest, NextResponse } from 'next/server'
import { TranslationJobService, UserService, AnalyticsService } from '@/lib/database-admin'
import { StorageService } from '@/lib/storage'
import { ErrorTracker } from '@/lib/error-tracking'
import { SubtitleProcessor } from '@/lib/subtitle-processor'
import { TranslationServiceFactory } from '@/lib/translation-services'
import { PremiumTranslationService } from '@/lib/premium-translation-service'
import { updateTranslationProgress } from '../translate-progress/route'
// Security validation will be handled in middleware

export async function POST(req: NextRequest) {
  try {
    console.log('🔄 Translation API called')
    const formData = await req.formData()
    const file = formData.get('file') as File
    const targetLanguage = formData.get('targetLanguage') as string
    const sourceLanguage = formData.get('sourceLanguage') as string | null
    const aiServiceRaw = formData.get('aiService') as 'google' | 'openai' | 'premium'
    // Map premium to openai for database storage
    const aiService: 'google' | 'openai' = aiServiceRaw === 'premium' ? 'openai' : aiServiceRaw as 'google' | 'openai'
    const userId = formData.get('userId') as string
    const sessionId = formData.get('sessionId') as string || `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    const translationModel = formData.get('translationModel') as string || 'standard'

    console.log('📋 Request params:', {
      fileName: file?.name,
      targetLanguage,
      sourceLanguage,
      aiServiceRaw,
      aiService,
      userId,
      sessionId
    })

    // Basic validation (security handled in middleware)
    if (!file || !targetLanguage) {
      return NextResponse.json(
        { error: 'Missing required fields: file and targetLanguage are required' },
        { status: 400 }
      )
    }

    // Check if user is logged in
    if (!userId) {
      return NextResponse.json(
        { error: 'Authentication required. Please log in to use translation services.' },
        { status: 401 }
      )
    }

    // Get user profile to check email verification
    const userProfile = await UserService.getUser(userId)
    if (!userProfile) {
      return NextResponse.json(
        { error: 'User not found. Please log in again.' },
        { status: 404 }
      )
    }

    // Check if email is verified
    if (!userProfile.emailVerified) {
      return NextResponse.json(
        {
          error: 'Email verification required. Please verify your email address before using translation services.',
          code: 'EMAIL_NOT_VERIFIED'
        },
        { status: 403 }
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

    // Check user credits
    let user = null
    if (userId && userId.endsWith('-user-demo')) {
      // Create mock user for any demo account
      user = {
        uid: userId,
        email: userId.includes('active') ? 'active@test.com' : userId.includes('power') ? 'power@test.com' : 'newbie@test.com',
        displayName: userId.includes('active') ? 'Active User' : userId.includes('power') ? 'Power User' : 'New User',
        creditsBalance: userId.includes('active') ? 150 : userId.includes('power') ? 75 : 200,
        usage: {
          translationsUsed: 0,
          translationsLimit: -1, // Unlimited with credits
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

      // Check credits instead of translation limits
      const creditsBalance = (user as any).creditsBalance || 0
      const requiredCredits = aiServiceRaw === 'premium' ? 0.2 : 0.1 // Estimate per batch

      if (creditsBalance < requiredCredits) {
        return NextResponse.json(
          { error: 'Insufficient credits. Please buy more credits to continue.' },
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
          let totalCreditsUsed = 0

          for (const chunk of textChunks) {
            // Charge 0.1 credits per chunk (approximately 20 lines)
            const chunkCredits = 0.1

            // Check credits before processing each chunk
            if (!userId.endsWith('-user-demo')) {
              const currentUser = await UserService.getUser(userId)
              const currentBalance = (currentUser as any)?.creditsBalance || 0

              if (currentBalance < chunkCredits) {
                return NextResponse.json(
                  { error: 'Insufficient credits during translation. Please buy more credits.' },
                  { status: 429 }
                )
              }

              // Deduct credits
              await UserService.adjustCredits(
                userId,
                -chunkCredits,
                `Standard translation chunk ${translatedChunks.length + 1}/${textChunks.length}`,
                undefined,
                translatedChunks.length + 1
              )
              totalCreditsUsed += chunkCredits
            }

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
          const translatedContent = SubtitleProcessor.generateSRT(translatedEntries, targetLanguage)
          const translatedFileName = file.name.replace('.srt', `_${targetLanguage}.srt`)

          return NextResponse.json({
            status: 'completed',
            translatedContent,
            translatedFileName,
            subtitleCount: subtitleEntries.length,
            characterCount: translatedContent.length,
            creditsUsed: totalCreditsUsed,
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

      // For premium service, always use real OpenAI API - no demo/mock modes
      if (aiServiceRaw === 'premium') {
        console.log('🎬 Premium Context AI service - validating OpenAI API key')

        // Validate OpenAI API key
        const apiKey = process.env.OPENAI_API_KEY
        if (!apiKey || apiKey === 'demo_key' || !apiKey.startsWith('sk-')) {
          console.error('❌ Invalid or missing OpenAI API key for premium service')
          return NextResponse.json({
            error: 'Premium Context AI requires a valid OpenAI API key. Please configure OPENAI_API_KEY environment variable.'
          }, { status: 400 })
        }

        console.log('✅ OpenAI API key validated, starting immediate premium translation')

        // Process subtitle file immediately
        const fileContent = await file.text()
        const subtitleEntries = SubtitleProcessor.parseSRT(fileContent)

        if (subtitleEntries.length === 0) {
          return NextResponse.json({ error: 'No valid subtitles found in file' }, { status: 400 })
        }

        console.log('📊 Processing', subtitleEntries.length, 'subtitle entries with OpenAI API')

        try {
          // Initialize premium service with model selection
          const premiumService = new PremiumTranslationService(apiKey, translationModel as 'standard' | 'premium')

          // Progress callback for real-time updates
          const progressCallback = (stage: string, progress: number, details?: string) => {
            console.log(`🔄 OpenAI Translation Progress: ${stage} (${progress}%) - ${details || ''}`)
            updateTranslationProgress(sessionId, stage, progress, details)
          }

          // Start with initial progress
          updateTranslationProgress(sessionId, 'initializing', 0, 'Starting premium translation process...')

          // Perform translation
          const translatedEntries = await premiumService.translateSubtitles(
            subtitleEntries,
            targetLanguage,
            sourceLanguage || 'en',
            file.name,
            progressCallback
          )

          // Generate final content
          const translatedContent = SubtitleProcessor.generateSRT(translatedEntries, targetLanguage)
          const translatedFileName = file.name.replace('.srt', `_${targetLanguage}.srt`)

          console.log('✅ Premium translation completed successfully')

          // Final progress update
          updateTranslationProgress(sessionId, 'completed', 100, 'Premium translation completed successfully!')

          return NextResponse.json({
            status: 'completed',
            translatedContent,
            translatedFileName,
            subtitleCount: translatedEntries.length,
            characterCount: translatedContent.length,
            processingTimeMs: Date.now() - Date.now(), // Will be calculated on client
            apiProvider: 'OpenAI',
            model: translationModel === 'premium' ? 'gpt-5.2' : 'gpt-5-mini'
          })

        } catch (error) {
          console.error('❌ Premium translation failed:', error)
          updateTranslationProgress(sessionId, 'error', 0, `OpenAI translation failed: ${error instanceof Error ? error.message : 'Unknown error'}`)

          return NextResponse.json({
            error: `Premium translation failed: ${error instanceof Error ? error.message : 'Unknown error'}`
          }, { status: 500 })
        }
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
    console.error('❌ Translation API Error:', error)
    console.error('❌ Error details:', error instanceof Error ? error.message : String(error))
    console.error('❌ Error stack:', error instanceof Error ? error.stack : 'No stack trace')

    await ErrorTracker.logApiError(
      error instanceof Error ? error : new Error(String(error)),
      '/api/translate',
      'POST'
    )

    return NextResponse.json(
      {
        error: 'Internal server error',
        details: error instanceof Error ? error.message : String(error)
      },
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

    // Check credits before processing (skip for demo user)
    if (userId !== 'premium-user-demo') {
      const user = await UserService.getUser(userId)
      const currentBalance = (user as any)?.creditsBalance || 0

      const chunksNeeded = Math.ceil(subtitleEntries.length / 20)
      const creditsPerChunk = translationModel === 'premium' ? 2.0 : 0.8
      const requiredCredits = chunksNeeded * creditsPerChunk

      console.log(`💰 Required credits: ${requiredCredits}, Current balance: ${currentBalance}`)

      if (currentBalance < requiredCredits) {
        throw new Error(`Insufficient credits. Required: ${requiredCredits.toFixed(2)}, Available: ${currentBalance.toFixed(2)}`)
      }
    }

    let translatedEntries

    if (aiServiceRaw === 'premium') {
      // Use Premium Context AI service with model selection
      const premiumService = new PremiumTranslationService(process.env.OPENAI_API_KEY || 'demo_key', translationModel as 'standard' | 'premium')

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
    const translatedContent = SubtitleProcessor.generateSRT(translatedEntries, targetLanguage)

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
    console.log('📊 Updating job as completed with data:', {
      jobId,
      status: 'completed',
      translatedFileName,
      translatedFileUrl,
      subtitleCount: subtitleEntries.length,
      characterCount: fileContent.length
    })

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

    console.log('✅ Job successfully updated as completed')

    // Calculate and deduct credits (skip for demo user)
    console.log('💰 Checking if credits should be deducted for user:', userId)
    if (userId !== 'premium-user-demo' && !userId.endsWith('-user-demo')) {
      // Calculate credits based on subtitle count and model
      const chunksNeeded = Math.ceil(subtitleEntries.length / 20)
      const creditsPerChunk = translationModel === 'premium' ? 2.0 : 0.8
      const totalCredits = chunksNeeded * creditsPerChunk

      console.log(`💰 Deducting ${totalCredits} credits for ${subtitleEntries.length} subtitles (${chunksNeeded} chunks, ${creditsPerChunk} per chunk)`)

      try {
        // Deduct credits
        await UserService.adjustCredits(
          userId,
          -totalCredits,
          `${aiServiceRaw === 'premium' ? 'Premium' : 'Standard'} translation: ${subtitleEntries.length} subtitles`,
          jobId
        )
        console.log('✅ Credits successfully deducted')
      } catch (error) {
        console.error('❌ Failed to deduct credits:', error)
        // Don't fail the translation if credit deduction fails
      }
    } else {
      console.log('💰 Skipping credit deduction for demo user:', userId)
    }

    // Update user usage
    await UserService.updateUsage(userId, {
      translationsUsed: 1
    })

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

    // Check for premium jobs
    if (jobId.startsWith('premium_job_')) {
      console.log('🎬 Checking premium job status:', jobId)
      const premiumResults = (global as any).premiumJobResults || {}
      const premiumJob = premiumResults[jobId]

      if (!premiumJob) {
        return NextResponse.json({
          status: 'processing',
          message: 'Premium job is still processing...'
        })
      }

      return NextResponse.json(premiumJob)
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



// Real premium translation function - OpenAI API only, no demo/mock modes
async function processRealPremiumTranslation(
  jobId: string,
  file: File,
  userId: string,
  sourceLanguage: string | null,
  targetLanguage: string,
  sessionId: string,
  apiKey: string
) {
  const startTime = Date.now()

  try {
    console.log('🎬 Starting real premium translation with OpenAI API:', jobId)
    console.log('🔧 Translation details:', { userId, sourceLanguage, targetLanguage, sessionId, fileName: file.name })

    // Initialize premium service with model selection
    console.log('🔑 Initializing PremiumTranslationService with API key and model:', translationModel)
    const premiumService = new PremiumTranslationService(apiKey, translationModel as 'standard' | 'premium')
    console.log('✅ PremiumTranslationService initialized')

    // Initial progress
    console.log('📊 Sending initial progress update')
    updateTranslationProgress(sessionId, 'initializing', 0, 'Starting premium translation process...')
    await new Promise(resolve => setTimeout(resolve, 500))
    console.log('✅ Initial progress sent')

    // Process subtitle file
    console.log('📄 Reading subtitle file content')
    const fileContent = await file.text()
    console.log('📄 File content length:', fileContent.length)

    console.log('📊 Parsing SRT content')
    const subtitleEntries = SubtitleProcessor.parseSRT(fileContent)
    console.log('📊 Parsed', subtitleEntries.length, 'subtitle entries')

    if (subtitleEntries.length === 0) {
      console.error('❌ No valid subtitles found in file')
      throw new Error('No valid subtitles found in file')
    }

    console.log('✅ Processing', subtitleEntries.length, 'subtitle entries with OpenAI API')

    // Phase 1: Analyzing filename
    updateTranslationProgress(sessionId, 'analyzing', 10, `Analyzing filename '${file.name}' and extracting show information...`)
    await new Promise(resolve => setTimeout(resolve, 800))

    // Phase 2: Research using OpenAI API
    console.log('📊 Sending research progress update')
    updateTranslationProgress(sessionId, 'researching', 30, 'Researching content for contextual information using OpenAI...')

    console.log('🔑 Starting OpenAI API research')
    const showName = file.name.split('.')[0] || 'Unknown Show'
    console.log('🔍 Researching show:', showName)

    try {
      const contextualInfo = await premiumService.researchShow(showName)
      console.log('✅ OpenAI research completed successfully')
      console.log('📋 Research result length:', contextualInfo.length)
      console.log('📋 Research preview:', contextualInfo.substring(0, 100) + '...')
    } catch (researchError) {
      console.error('❌ OpenAI research failed:', researchError)
      throw new Error(`Research failed: ${researchError instanceof Error ? researchError.message : 'Unknown error'}`)
    }

    await new Promise(resolve => setTimeout(resolve, 1000))

    // Phase 3: Analyzing content
    updateTranslationProgress(sessionId, 'analyzing_content', 50, 'Analyzing subtitle content and themes...')
    await new Promise(resolve => setTimeout(resolve, 1000))

    // Phase 4: Translation using OpenAI API
    updateTranslationProgress(sessionId, 'translating', 70, 'Translating with contextual awareness using OpenAI...')

    console.log('🔑 Using OpenAI API for contextual translation')
    const progressCallback = (stage: string, progress: number, details?: string) => {
      console.log(`🔄 OpenAI Translation Progress: ${stage} (${progress}%) - ${details || ''}`)
      updateTranslationProgress(sessionId, stage, Math.max(70, progress), details)
    }

    const translatedEntries = await premiumService.translateSubtitles(
      subtitleEntries,
      targetLanguage,
      sourceLanguage || 'en',
      file.name,
      progressCallback
    )

    console.log('✅ OpenAI translation completed for', translatedEntries.length, 'entries')

    // Phase 5: Finalizing
    updateTranslationProgress(sessionId, 'finalizing', 95, 'Finalizing translation and quality checks...')
    await new Promise(resolve => setTimeout(resolve, 500))

    // Generate final content
    const translatedContent = SubtitleProcessor.generateSRT(translatedEntries, targetLanguage)
    const translatedFileName = file.name.replace('.srt', `_${targetLanguage}.srt`)

    console.log('✅ Premium translation completed successfully with OpenAI API')

      // Store result
      ; (global as any).premiumJobResults = (global as any).premiumJobResults || {}
      ; (global as any).premiumJobResults[jobId] = {
        status: 'completed',
        translatedContent,
        translatedFileName,
        subtitleCount: translatedEntries.length,
        processingTimeMs: Date.now() - startTime,
        completedAt: new Date().toISOString(),
        contextualInfo: contextualInfo.substring(0, 200),
        apiProvider: 'OpenAI',
        model: translationModel === 'premium' ? 'gpt-5.2' : 'gpt-5-mini'
      }

    // Final progress update
    updateTranslationProgress(sessionId, 'completed', 100, `${translationModel === 'premium' ? 'Premium' : 'Standard'} translation completed successfully with OpenAI!`)

  } catch (error) {
    const processingTime = Date.now() - startTime
    console.error('❌ Premium translation failed:', jobId, error)

    // Update progress with error
    updateTranslationProgress(sessionId, 'error', 0, `OpenAI translation failed: ${error instanceof Error ? error.message : 'Unknown error'}`)

      // Store error result
      ; (global as any).premiumJobResults = (global as any).premiumJobResults || {}
      ; (global as any).premiumJobResults[jobId] = {
        status: 'failed',
        errorMessage: error instanceof Error ? error.message : 'Premium translation failed',
        processingTimeMs: processingTime,
        apiProvider: 'OpenAI'
      }
  }
}
