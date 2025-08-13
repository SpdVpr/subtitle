import { NextRequest } from 'next/server'
import { SubtitleProcessor } from '@/lib/subtitle-processor'
import { PremiumTranslationService } from '@/lib/premium-translation-service'

export async function POST(request: NextRequest) {
  const formData = await request.formData()
  const file = formData.get('file') as File | null
  const targetLanguage = (formData.get('targetLanguage') as string) || 'cs'
  const sourceLanguage = (formData.get('sourceLanguage') as string) || 'en'
  const userId = (formData.get('userId') as string) || ''

  if (!file) {
    return new Response('No file uploaded', { status: 400 })
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

        const premium = new PremiumTranslationService(apiKey)

        // Credit charging per batch (0.2 credits per batch of 20)
        const batchSize = 20
        const totalBatches = Math.ceil(entries.length / batchSize)
        let chargedBatches = 0

        const progressCallback = async (stage: string, progress: number, details?: string) => {
          // Detect new batch start from details string
          if (stage === 'translating' && details) {
            const m = details.match(/batch\s+(\d+)\/(\d+)/i)
            if (m) {
              const currentBatch = parseInt(m[1])
              if (currentBatch > chargedBatches) {
                // Check balance and charge 0.2 credits
                try {
                  // Fetch user to verify balance
                  const { UserService } = await import('@/lib/database')
                  const user = await UserService.getUser(userId)
                  const balance = (user?.creditsBalance || 0)
                  if (balance < 0.2) {
                    controller.enqueue(sse({ type: 'error', message: 'Insufficient credits. Please top up to continue.' }))
                    controller.close()
                    throw new Error('Insufficient credits')
                  }
                  await UserService.adjustCredits(userId, -0.2, `Premium translation batch ${currentBatch}/${totalBatches}`, undefined, currentBatch)
                  chargedBatches = currentBatch
                } catch (err) {
                  console.error('Credit charge failed:', err)
                }
              }
            }
          }

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
}

