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

        // Calculate and deduct credits upfront
        const batchSize = 20
        const totalBatches = Math.ceil(entries.length / batchSize)
        const totalCredits = totalBatches * 0.4

        console.log(`💰 Premium translation: ${entries.length} subtitles, ${totalBatches} batches, ${totalCredits} credits`)

        // Check balance and deduct credits upfront
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

        const premium = new PremiumTranslationService(apiKey)

        const progressCallback = async (stage: string, progress: number, details?: string) => {
          controller.enqueue(sse({ type: 'progress', stage, progress, details }))
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

        controller.enqueue(sse({
          type: 'result',
          status: 'completed',
          translatedContent,
          translatedFileName,
          subtitleCount: translated.length,
          characterCount: translatedContent.length
        }))
      } catch (err: any) {
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

