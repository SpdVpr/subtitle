import { NextRequest, NextResponse } from 'next/server'
import { SubtitleProcessor } from '@/lib/subtitle-processor'
import { PremiumTranslationService } from '@/lib/premium-translation-service'

// GET method for debugging
export async function GET() {
  return NextResponse.json({
    message: 'Translate-stream endpoint is working',
    methods: ['GET', 'POST'],
    timestamp: new Date().toISOString()
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

        const progressCallback = async (stage: string, progress: number, details?: string) => {
          console.log(`📊 Progress: ${stage} - ${progress}% - ${details}`)
          controller.enqueue(sse({ type: 'progress', stage, progress, details }))
          // Add small delay to ensure progress updates are visible
          await new Promise(resolve => setTimeout(resolve, 100))
        }

        const translated = await premium.translateSubtitles(
          entries,
          targetLanguage,
          sourceLanguage || 'en',
          file.name,
          progressCallback
        )

        const translatedContent = SubtitleProcessor.generateSRT(translated)
        const translatedFileName = file.name.replace('.srt', `_${targetLanguage}.srt`)

        // Create and save translation job for history
        let jobId: string | undefined
        try {
          const { TranslationJobService } = await import('@/lib/database-admin')

          // Create job record
          jobId = await TranslationJobService.createJob({
            userId,
            type: 'single',
            status: 'pending',
            originalFileName: file.name,
            originalFileSize: file.size,
            sourceLanguage: sourceLanguage || undefined,
            targetLanguage,
            aiService: 'premium'
          })
          console.log(`📝 Created translation job: ${jobId}`)

          // Upload translated file to storage
          const { StorageService } = await import('@/lib/storage')
          const { url: translatedFileUrl } = await StorageService.uploadTranslatedFile(
            translatedContent,
            file.name,
            userId,
            jobId,
            targetLanguage
          )
          console.log(`📤 Uploaded translated file: ${translatedFileUrl}`)

          // Update job as completed
          const processingTime = Date.now() - startTime
          await TranslationJobService.updateJob(jobId, {
            status: 'completed',
            completedAt: new Date() as any,
            processingTimeMs: processingTime,
            translatedFileName,
            translatedFileUrl,
            subtitleCount: translated.length,
            characterCount: translatedContent.length,
            confidence: 0.95 // Premium AI confidence
          })
          console.log(`✅ Updated job ${jobId} as completed`)

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
            processingTimeMs: processingTime,
            languagePairs: { [`${sourceLanguage || 'auto'}-${targetLanguage}`]: 1 },
            serviceUsage: { 'premium': 1 },
            averageConfidence: 0.95
          })
          console.log(`📈 Recorded analytics for user ${userId}`)

        } catch (storageError) {
          console.error('❌ Failed to save translation job:', storageError)
          // Continue anyway - user still gets the translation
        }

        controller.enqueue(sse({
          type: 'result',
          status: 'completed',
          translatedContent,
          translatedFileName,
          subtitleCount: translated.length,
          characterCount: translatedContent.length,
          jobId
        }))
      } catch (err: any) {
        console.error('❌ Translation failed:', err)

        // Refund credits on translation failure (only in production)
        if (process.env.NODE_ENV !== 'development') {
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
        }

        controller.enqueue(sse({ type: 'error', message: err?.message || 'Translation failed' }))
      } finally {
        controller.close()
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

