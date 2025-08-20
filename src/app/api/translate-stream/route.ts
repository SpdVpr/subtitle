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

  const apiKey = process.env.OPENAI_API_KEY
  if (!apiKey || !apiKey.startsWith('sk-')) {
    return new Response('Premium translation requires a valid OPENAI_API_KEY', { status: 400 })
  }

  const encoder = new TextEncoder()
  function sse(obj: any) {
    return encoder.encode(`data: ${JSON.stringify(obj)}\n\n`)
  }

  const stream = new ReadableStream<Uint8Array>({
    async start(controller) {
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

        // Calculate credits (for display only in development)
        const batchSize = 20
        const totalBatches = Math.ceil(entries.length / batchSize)
        const totalCredits = totalBatches * 0.4

        console.log(`💰 Premium translation: ${entries.length} subtitles, ${totalBatches} batches, ${totalCredits} credits`)

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
            await UserService.adjustCredits(userId, -totalCredits, `Premium translation: ${entries.length} subtitles (${totalBatches} batches)`)
            console.log(`✅ Deducted ${totalCredits} credits for premium translation`)
          } catch (err) {
            console.error('❌ Credit deduction failed:', err)
            controller.enqueue(sse({ type: 'error', message: 'Failed to process payment. Please try again.' }))
            controller.close()
            return
          }
        }

        const premium = new PremiumTranslationService(apiKey)

        let lastProgressTime = Date.now()
        let progressTimeoutId: NodeJS.Timeout | null = null
        let controllerClosed = false

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
            console.log(`🕐 Adaptive timeout: ${Math.round(timeoutDuration/1000)}s for ${subtitleCount} subtitles in ${stage} stage`)
          }

          progressTimeoutId = setTimeout(() => {
            if (!controllerClosed) {
              console.error(`❌ [${new Date().toISOString()}] Progress timeout after ${Math.round(timeoutDuration/1000)}s - translation appears stuck at ${stage} ${Math.round(progress)}%`)
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

        const translatedContent = SubtitleProcessor.generateSRT(translated)
        const translatedFileName = file.name.replace('.srt', `_${targetLanguage}.srt`)

        // Check if controller is still open before sending result
        if (controllerClosed) {
          console.warn('⚠️ Translation completed but controller already closed')
          return
        }

        console.log('🎉 Translation completed successfully')

        // Send result to client FIRST (before any database operations)
        let jobId: string | undefined
        try {
          // Add a small delay to ensure finalizing progress is visible
          await new Promise(resolve => setTimeout(resolve, 200))

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
        } catch (error) {
          console.error('❌ Failed to send result - controller closed:', error.message)
          controllerClosed = true
          return
        }

        // Now do database operations asynchronously (after client has the result)
        console.log('📝 Starting background database operations...')

        // Don't await these operations - do them in background
        setImmediate(async () => {
          try {
            const { TranslationJobService } = await import('@/lib/database-admin')

            // Create job record as completed (since translation is already done)
            jobId = await TranslationJobService.createJob({
              userId,
              type: 'single',
              status: 'completed',
              originalFileName: file.name,
              originalFileSize: file.size,
              sourceLanguage: sourceLanguage || undefined,
              targetLanguage,
              aiService: 'premium',
              translatedFileName,
              translatedContent, // Store content directly in job
              subtitleCount: translated.length,
              characterCount: translatedContent.length,
              confidence: 0.95,
              processingTimeMs: Date.now() - startTime,
              completedAt: new Date() as any
            })
            console.log(`📝 Created completed translation job: ${jobId}`)

            // Try to upload to storage (optional - if it fails, we still have the content in the job)
            try {
              const { StorageService } = await import('@/lib/storage')
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

            // Update user usage statistics
            const { UserService } = await import('@/lib/database-admin')
            await UserService.updateUsage(userId, {
              translationsUsed: 1
            })
            console.log(`📊 Updated user usage statistics`)

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
            console.log('✅ All background operations completed successfully')

          } catch (backgroundError) {
            console.error('❌ Background database operations failed:', backgroundError)
            // Don't affect the user experience - they already have their translation
          }
        })
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
              const totalCredits = totalBatches * 0.4

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

