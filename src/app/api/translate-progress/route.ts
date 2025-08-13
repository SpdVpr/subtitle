import { NextRequest } from 'next/server'

// Store for progress tracking
const progressStore = new Map<string, {
  stage: string
  progress: number
  details?: string
}>()

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const sessionId = searchParams.get('sessionId')

  if (!sessionId) {
    return new Response('Session ID required', { status: 400 })
  }

  // Set up Server-Sent Events
  const encoder = new TextEncoder()
  
  const stream = new ReadableStream({
    start(controller) {
      // Send initial connection
      controller.enqueue(encoder.encode(`data: ${JSON.stringify({ type: 'connected' })}\n\n`))

      // Set up interval to check for progress updates
      const interval = setInterval(() => {
        const progress = progressStore.get(sessionId)
        if (progress) {
          controller.enqueue(encoder.encode(`data: ${JSON.stringify({
            type: 'progress',
            ...progress
          })}\n\n`))
          
          // Clean up completed sessions
          if (progress.stage === 'completed' || progress.stage === 'error') {
            setTimeout(() => {
              progressStore.delete(sessionId)
              clearInterval(interval)
              controller.close()
            }, 5000)
          }
        }
      }, 500) // Check every 500ms

      // Clean up on client disconnect
      request.signal.addEventListener('abort', () => {
        clearInterval(interval)
        progressStore.delete(sessionId)
        controller.close()
      })
    }
  })

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Headers': 'Cache-Control'
    }
  })
}

// Helper function to update progress (called from translation API)
export function updateTranslationProgress(sessionId: string, stage: string, progress: number, details?: string) {
  progressStore.set(sessionId, { stage, progress, details })
  console.log(`📊 Progress update [${sessionId}]: ${stage} (${progress}%) - ${details || ''}`)
}

// Export the progress store for use in other API routes
export { progressStore }
