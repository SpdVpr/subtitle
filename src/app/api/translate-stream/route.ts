import { NextRequest, NextResponse } from 'next/server'
import { SubtitleProcessor } from '@/lib/subtitle-processor'
import { PremiumTranslationService } from '@/lib/premium-translation-service'

// GET method for debugging
export async function GET() {
  return NextResponse.json({
    message: 'Translate-stream endpoint is working',
    methods: ['GET', 'POST'],
    timestamp: new Date().toISOString(),
    version: '2.0.0-timeout-fix'
  })
}

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get('file') as File | null
    const targetLanguage = (formData.get('targetLanguage') as string) || 'cs'
    const sourceLanguage = (formData.get('sourceLanguage') as string) || 'en'
    const userId = (formData.get('userId') as string) || ''
    const translationModel = (formData.get('translationModel') as string) || 'standard'

    // Check if user is logged in
    if (!userId) {
      return new Response(JSON.stringify({ error: 'Authentication required. Please log in to use translation services.' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' }
      })
    }

    if (!file) {
      return new Response(JSON.stringify({ error: 'No file uploaded' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      })
    }

    const geminiKey = process.env.GEMINI_API_KEY
    const apiKey = process.env.OPENAI_API_KEY || 'gemini-mode' // OpenAI key kept for backward compat
    console.log('🔑 ROUTE: GEMINI_API_KEY exists:', !!geminiKey, '| OPENAI_API_KEY exists:', !!process.env.OPENAI_API_KEY)
    if (!geminiKey) {
      return new Response('Translation requires a valid GEMINI_API_KEY', { status: 400 })
    }

    const encoder = new TextEncoder()
    function sse(obj: any) {
      return encoder.encode(`data: ${JSON.stringify(obj)}\n\n`)
    }

    const stream = new ReadableStream<Uint8Array>({
      async start(controller) {
        let progressTimeoutId: NodeJS.Timeout | null = null
        let controllerClosed = false

        try {
          controller.enqueue(sse({ type: 'connected' }))
          controller.enqueue(sse({ type: 'progress', stage: 'initializing', progress: 0, details: 'Starting translation process...' }))

          // Add small delay to ensure progress is visible
          await new Promise(resolve => setTimeout(resolve, 500))

          if (!userId) {
            controller.enqueue(sse({ type: 'error', message: 'User not identified' }))
            controller.close()
            return
          }

          const fileText = await file.text()
          const entries = SubtitleProcessor.parseSRT(fileText)
          if (!entries.length) {
            controller.enqueue(sse({ type: 'error', message: 'No valid subtitles found in file' }))
            controller.close()
            return
          }

          // Calculate credits based on selected model
          const batchSize = 20
          const totalBatches = Math.ceil(entries.length / batchSize)
          const creditsPerBatch = translationModel === 'premium' ? 1.5 : 0.5
          const totalCredits = totalBatches * creditsPerBatch

          console.log(`💰 ${translationModel} translation: ${entries.length} subtitles, ${totalBatches} batches, ${totalCredits} credits (${creditsPerBatch} per batch)`)

          const startTime = Date.now()

          // Skip credit deduction in development mode
          if (process.env.NODE_ENV === 'development') {
            console.log('🚧 Development mode: Skipping credit deduction')
            controller.enqueue(sse({ type: 'progress', stage: 'payment', progress: 5, details: 'Development mode: Credits skipped' }))
            await new Promise(resolve => setTimeout(resolve, 300))
          } else {
            // Production credit handling
            try {
              const { UserService } = await import('@/lib/database-admin')
              const user = await UserService.getUser(userId)
              const balance = (user?.creditsBalance || 0)

              if (balance < totalCredits) {
                controller.enqueue(sse({ type: 'error', message: `Insufficient credits. Required: ${totalCredits.toFixed(2)}, Available: ${balance.toFixed(2)}` }))
                controller.close()
                return
              }

              // Deduct all credits upfront
              console.log(`💳 PRODUCTION: About to deduct ${totalCredits} credits for user ${userId}`)
              await UserService.adjustCredits(userId, -totalCredits, `${translationModel} translation: ${entries.length} subtitles (${totalBatches} batches)`)
              console.log(`✅ PRODUCTION: Successfully deducted ${totalCredits} credits for ${translationModel} translation`)
            } catch (err) {
              console.error('❌ PRODUCTION: Credit deduction failed:', err)
              console.error('❌ PRODUCTION: Error details:', err instanceof Error ? err.message : String(err))
              console.error('❌ PRODUCTION: Error stack:', err instanceof Error ? err.stack : 'No stack')
              controller.enqueue(sse({ type: 'error', message: 'Failed to process payment. Please try again.' }))
              controller.close()
              return
            }
          }

          // Always use PremiumTranslationService but with different models
          const premium = new PremiumTranslationService(geminiKey, translationModel as 'standard' | 'premium')

          let lastProgressTime = Date.now()

          const progressCallback = async (stage: string, progress: number, details?: string) => {
            // Check if controller is still open
            if (controllerClosed) {
              console.warn('⚠️ Skipping progress update - controller already closed')
              return
            }

            // More detailed logging for production debugging
            const timestamp = new Date().toISOString()
            console.log(`📊 [${timestamp}] Progress: ${stage} - ${Math.round(progress)}% - ${details || 'No details'}`)

            // Reset progress timeout
            if (progressTimeoutId) {
              clearTimeout(progressTimeoutId)
            }

            // Set new timeout to detect stuck progress (adaptive based on file size)
            const subtitleCount = entries.length
            const baseTimeout = stage === 'translating' ? 180000 : 120000 // 3 minutes for translating, 2 minutes for others
            const timeoutPerSubtitle = stage === 'translating' ? 150 : 50 // Extra time per subtitle
            const adaptiveTimeout = Math.min(
              baseTimeout + (subtitleCount * timeoutPerSubtitle),
              280000 // Max 4.67 minutes (under Vercel 5 minute limit)
            )
            const timeoutDuration = adaptiveTimeout

            // Log adaptive timeout info
            if (subtitleCount > 500) {
              console.log(`🕐 Adaptive timeout: ${Math.round(timeoutDuration / 1000)}s for ${subtitleCount} subtitles in ${stage} stage`)
            }

            progressTimeoutId = setTimeout(() => {
              if (!controllerClosed) {
                console.error(`❌ [${new Date().toISOString()}] Progress timeout after ${Math.round(timeoutDuration / 1000)}s - translation appears stuck at ${stage} ${Math.round(progress)}%`)
                controllerClosed = true
                try {
                  controller.enqueue(sse({ type: 'error', message: 'Translation timeout - please try again' }))
                  controller.close()
                } catch (timeoutError) {
                  console.error('❌ Failed to send timeout error:', timeoutError)
                }
              }
            }, timeoutDuration)

            lastProgressTime = Date.now()

            try {
              controller.enqueue(sse({ type: 'progress', stage, progress, details }))
              // Add small delay to ensure progress updates are visible
              await new Promise(resolve => setTimeout(resolve, 100))
            } catch (error) {
              console.warn(`⚠️ [${timestamp}] Failed to send progress update - controller may be closed:`, error.message)
              controllerClosed = true
            }
          }

          // Safe wrapper for progress callback that handles errors gracefully
          const safeProgressCallback = (stage: string, progress: number, details?: string) => {
            try {
              progressCallback(stage, progress, details)
            } catch (error) {
              console.warn(`⚠️ Failed to send progress update for ${stage}:`, error)
            }
          }

          const translated = await premium.translateSubtitles(
            entries,
            targetLanguage,
            sourceLanguage || 'en',
            file.name,
            progressCallback
          )

          // Clear progress timeout on successful completion
          if (progressTimeoutId) {
            clearTimeout(progressTimeoutId)
          }

          const translatedContent = SubtitleProcessor.generateSRT(translated, targetLanguage)
          const translatedFileName = file.name.replace('.srt', `_${targetLanguage}.srt`)

          // Check if controller is still open before sending result
          if (controllerClosed) {
            console.warn('⚠️ Translation completed but controller already closed')
            return
          }

          console.log('🎉 Translation completed successfully')

          // Send finalizing progress first
          try {
            safeProgressCallback('finalizing', 95, 'Preparing final result...')
            await new Promise(resolve => setTimeout(resolve, 500)) // Ensure finalizing is visible
          } catch (progressError) {
            console.warn('⚠️ Failed to send finalizing progress:', progressError)
          }

          // CRITICAL: Save to database FIRST (before trying to send result to client)
          console.log('📝 PRODUCTION: Saving translation job and updating usage BEFORE sending result...')
          let jobId: string | undefined

          try {
            const { TranslationJobService } = await import('@/lib/database-admin')

            // Create job record as completed (since translation is already done)
            console.log(`📝 PRODUCTION: About to create translation job for user ${userId}`)
            jobId = await TranslationJobService.createJob({
              userId,
              type: 'single',
              status: 'completed',
              originalFileName: file.name,
              originalFileSize: file.size,
              sourceLanguage: sourceLanguage || undefined,
              targetLanguage,
              aiService: 'openai',
              translatedFileName,
              translatedContent, // Store content directly in job
              subtitleCount: translated.length,
              characterCount: translatedContent.length,
              confidence: 0.95,
              processingTimeMs: Date.now() - startTime,
              completedAt: new Date() as any
            })
            console.log(`📝 PRODUCTION: Successfully created completed translation job: ${jobId} for user ${userId}`)

            // Update user usage statistics and last active
            const { UserService } = await import('@/lib/database-admin')
            await UserService.updateUsage(userId, {
              translationsUsed: 1,
              lastActive: new Date()
            })
            console.log(`📊 PRODUCTION: Updated user usage statistics and last active`)

            console.log('✅ PRODUCTION: All critical database operations completed successfully')
          } catch (dbError) {
            console.error('❌ PRODUCTION: Critical database operations failed:', dbError)
            console.error('❌ PRODUCTION: DB error details:', dbError instanceof Error ? dbError.message : String(dbError))
            // Continue anyway - user should still get their translation
          }

          // Now try to send result to client
          let resultSent = false

          // Try multiple times to send result (in case of temporary controller issues)
          for (let attempt = 1; attempt <= 3; attempt++) {
            try {
              console.log(`📤 Sending result to client (attempt ${attempt}/3)...`)

              controller.enqueue(sse({
                type: 'result',
                status: 'completed',
                translatedContent,
                translatedFileName,
                subtitleCount: translated.length,
                characterCount: translatedContent.length,
                jobId: 'pending' // Will be updated after database operations
              }))

              console.log('✅ Result sent to client successfully')
              resultSent = true

              // Send completion progress
              safeProgressCallback('completed', 100, 'Translation completed successfully!')
              break

            } catch (error) {
              console.error(`❌ Failed to send result (attempt ${attempt}/3) - controller issue:`, error.message)

              if (attempt === 3) {
                console.error('❌ All attempts to send result failed - controller permanently closed')
                controllerClosed = true
                // Continue with database operations even if result sending failed
                // User can still get the result from Translation History
              } else {
                // Small delay before retry
                await new Promise(resolve => setTimeout(resolve, 100))
              }
            }
          }

          if (!resultSent) {
            console.warn('⚠️ Result not sent to client, but translation completed - will be available in history')
          }

          // Additional background operations (analytics, storage upload)
          console.log('📝 Starting additional background operations...')

          try {

            // Try to upload to storage (optional - if it fails, we still have the content in the job)
            if (jobId) {
              try {
                const { StorageService } = await import('@/lib/storage')
                const { TranslationJobService } = await import('@/lib/database-admin')
                const { url: translatedFileUrl } = await StorageService.uploadTranslatedFile(
                  translatedContent,
                  file.name,
                  userId,
                  jobId,
                  targetLanguage
                )
                console.log(`📤 Uploaded translated file: ${translatedFileUrl}`)

                // Update job with storage URL
                await TranslationJobService.updateJob(jobId, {
                  translatedFileUrl
                })
              } catch (storageError) {
                console.warn('⚠️ Storage upload failed, but job content is saved:', storageError)
                // Continue - we have the content in the job record
              }
            }

            // Storage upload completed (user usage already updated above)

            // Record analytics
            const { AnalyticsService } = await import('@/lib/database-admin')
            const today = new Date().toISOString().split('T')[0]
            await AnalyticsService.recordDailyUsage(userId, today, {
              translationsCount: 1,
              filesProcessed: 1,
              charactersTranslated: translatedContent.length,
              processingTimeMs: Date.now() - startTime,
              languagePairs: { [`${sourceLanguage || 'auto'}-${targetLanguage}`]: 1 },
              serviceUsage: { 'premium': 1 },
              averageConfidence: 0.95
            })
            console.log(`📈 Recorded analytics for user ${userId}`)
            console.log('✅ All database operations completed successfully')

          } catch (backgroundError) {
            console.error('❌ PRODUCTION: Database operations failed:', backgroundError)
            console.error('❌ PRODUCTION: Background error details:', backgroundError instanceof Error ? backgroundError.message : String(backgroundError))
            console.error('❌ PRODUCTION: Background error stack:', backgroundError instanceof Error ? backgroundError.stack : 'No stack')
            // Don't affect the user experience - they already have their translation
          }
        } catch (err: any) {
          console.error('❌ Translation failed:', err)

          // Clear progress timeout on error
          if (progressTimeoutId) {
            clearTimeout(progressTimeoutId)
          }

          // Refund credits on translation failure (only in production) - do this asynchronously
          if (process.env.NODE_ENV !== 'development') {
            setImmediate(async () => {
              try {
                const { UserService } = await import('@/lib/database-admin')
                const batchSize = 20
                const totalBatches = Math.ceil(entries.length / batchSize)
                const creditsPerBatch = translationModel === 'premium' ? 0.75 : 0.25
                const totalCredits = totalBatches * creditsPerBatch

                await UserService.adjustCredits(userId, totalCredits, `Refund for failed translation: ${file.name}`)
                console.log(`💰 Refunded ${totalCredits} credits due to translation failure`)
              } catch (refundError) {
                console.error('❌ Failed to refund credits:', refundError)
              }
            })
          }

          if (!controllerClosed) {
            try {
              controller.enqueue(sse({ type: 'error', message: err?.message || 'Translation failed' }))
            } catch (closeError) {
              console.warn('⚠️ Failed to send error - controller already closed')
            }
          }
        } finally {
          // Ensure timeout is cleared
          if (progressTimeoutId) {
            clearTimeout(progressTimeoutId)
          }
          if (!controllerClosed) {
            controllerClosed = true
            controller.close()
          }
        }
      }
    })

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive'
      }
    })

  } catch (error) {
    console.error('❌ Translate-stream error:', error)
    return new Response(JSON.stringify({
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    })
  }
}

