import { NextRequest, NextResponse } from 'next/server'
import { SubtitleProcessor } from '@/lib/subtitle-processor'
import { PremiumTranslationService } from '@/lib/premium-translation-service'
import { verifyUser } from '@/lib/user-auth-server'
import {
  completeFreeTranslation,
  releaseFreeTranslation,
  reserveTranslationPayment,
  type TranslationPaymentReservation,
} from '@/lib/free-translation-server'
import type { TranslationModel } from '@/lib/credit-policy'

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
    const authUser = await verifyUser(request)
    if (!authUser) {
      return NextResponse.json({ error: 'Authentication required. Please sign in again.' }, { status: 401 })
    }
    if (!authUser.emailVerified) {
      return NextResponse.json({ error: 'Email verification required.', code: 'EMAIL_NOT_VERIFIED' }, { status: 403 })
    }

    const formData = await request.formData()
    const file = formData.get('file') as File | null
    const targetLanguage = (formData.get('targetLanguage') as string) || 'cs'
    const sourceLanguage = (formData.get('sourceLanguage') as string) || 'en'
    const userId = authUser.uid
    const translationModel: TranslationModel = formData.get('translationModel') === 'premium' ? 'premium' : 'standard'

    if (!file) {
      return new Response(JSON.stringify({ error: 'No file uploaded' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      })
    }

    const geminiKey = process.env.GEMINI_API_KEY
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
        let paymentReservation: TranslationPaymentReservation | null = null
        let parsedSubtitleCount = 0
        const requestStartedAt = Date.now()

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
          parsedSubtitleCount = entries.length
          if (!entries.length) {
            controller.enqueue(sse({ type: 'error', message: 'No valid subtitles found in file' }))
            controller.close()
            return
          }

          const startTime = Date.now()

          try {
            paymentReservation = await reserveTranslationPayment({
              userId,
              subtitleCount: entries.length,
              model: translationModel,
              description: `${translationModel} translation: ${entries.length} subtitles`,
            })
            controller.enqueue(sse({
              type: 'progress',
              stage: 'payment',
              progress: 5,
              details: paymentReservation.kind === 'free'
                ? 'Your first subtitle file is free.'
                : `${paymentReservation.creditsCharged} credits reserved`,
            }))
          } catch (err) {
            const message = err instanceof Error ? err.message : ''
            const [code, required = '0', available = '0'] = message.split(':')
            const userMessage = code === 'INSUFFICIENT_CREDITS'
                ? `Insufficient credits. Required: ${Number(required).toFixed(1)}, available: ${Number(available).toFixed(1)}.`
                : 'Failed to reserve translation payment. Please try again.'
            controller.enqueue(sse({ type: 'error', message: userMessage, code }))
            controller.close()
            return
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
              console.warn(`⚠️ [${timestamp}] Failed to send progress update - controller may be closed:`, error instanceof Error ? error.message : error)
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
              aiService: 'google',
              translatedFileName,
              translatedContent, // Store content directly in job
              subtitleCount: translated.length,
              characterCount: translatedContent.length,
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

            if (paymentReservation?.kind === 'free' && paymentReservation.claimId) {
              await completeFreeTranslation(userId, paymentReservation.claimId)
            }

            console.log('✅ PRODUCTION: All critical database operations completed successfully')
          } catch (dbError) {
            console.error('❌ PRODUCTION: Critical database operations failed:', dbError)
            console.error('❌ PRODUCTION: DB error details:', dbError instanceof Error ? dbError.message : String(dbError))
            // Continue anyway - user should still get their translation
          }

          // A delivered translation consumes the free attempt even if optional
          // history/storage bookkeeping failed.
          if (paymentReservation?.kind === 'free' && paymentReservation.claimId) {
            await completeFreeTranslation(userId, paymentReservation.claimId)
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
                jobId: jobId || 'pending',
                paymentKind: paymentReservation?.kind,
                creditsCharged: paymentReservation?.creditsCharged || 0,
              }))

              console.log('✅ Result sent to client successfully')
              resultSent = true

              // Send completion progress
              safeProgressCallback('completed', 100, 'Translation completed successfully!')
              break

            } catch (error) {
              console.error(`❌ Failed to send result (attempt ${attempt}/3) - controller issue:`, error instanceof Error ? error.message : error)

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

            // TranslationJobService.createJob already stores the SRT through
            // the Admin Storage SDK with an inline Firestore fallback.

            // Record analytics
            const { AnalyticsService } = await import('@/lib/database-admin')
            const today = new Date().toISOString().split('T')[0]
            await AnalyticsService.recordDailyUsage(userId, today, {
              translationsCount: 1,
              filesProcessed: 1,
              charactersTranslated: translatedContent.length,
              processingTimeMs: Date.now() - startTime,
              languagePairs: { [`${sourceLanguage || 'auto'}-${targetLanguage}`]: 1 },
              serviceUsage: { [`gemini_${translationModel}`]: 1 },
              averageConfidence: 0
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

          // Release the free attempt or refund the exact amount reserved.
          setImmediate(async () => {
            try {
              if (paymentReservation?.kind === 'free' && paymentReservation.claimId) {
                await releaseFreeTranslation(userId, paymentReservation.claimId)
              } else if (paymentReservation?.creditsCharged) {
                const { UserService } = await import('@/lib/database-admin')
                await UserService.adjustCredits(
                  userId,
                  paymentReservation.creditsCharged,
                  `Full refund for failed translation: ${file.name}`
                )
              }
            } catch (refundError) {
              console.error('❌ Failed to release/refund translation payment:', refundError)
            }
          })

          try {
            const { TranslationJobService } = await import('@/lib/database-admin')
            await TranslationJobService.createJob({
              userId,
              type: 'single',
              status: 'failed',
              originalFileName: file.name,
              originalFileSize: file.size,
              sourceLanguage: sourceLanguage || undefined,
              targetLanguage,
              aiService: 'google',
              subtitleCount: parsedSubtitleCount,
              processingTimeMs: Date.now() - requestStartedAt,
              errorMessage: err?.message || 'Translation failed',
              completedAt: new Date() as any,
            })
          } catch (failureLogError) {
            console.error('Failed to persist translation failure:', failureLogError)
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
