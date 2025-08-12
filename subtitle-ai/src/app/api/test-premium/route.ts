import { NextResponse } from 'next/server'
import { PremiumTranslationService } from '@/lib/premium-translation-service'

export async function GET() {
  // Only allow in development
  if (process.env.NODE_ENV !== 'development') {
    return NextResponse.json({ error: 'Not available in production' }, { status: 403 })
  }

  try {
    console.log('🧪 Testing Premium Translation Service')
    
    // Test data
    const testEntries = [
      { id: '1', startTime: '00:00:01,000', endTime: '00:00:03,000', text: 'Hello, my name is Naruto!' },
      { id: '2', startTime: '00:00:04,000', endTime: '00:00:06,000', text: 'I will become the Hokage!' }
    ]

    const premiumService = new PremiumTranslationService(process.env.OPENAI_API_KEY || 'demo_key')
    
    // Progress tracking
    const progressLog: any[] = []
    const progressCallback = (stage: string, progress: number, details?: string) => {
      const logEntry = { stage, progress, details, timestamp: new Date().toISOString() }
      progressLog.push(logEntry)
      console.log('📊 Test Progress:', logEntry)
    }

    console.log('🚀 Starting test translation...')
    const result = await premiumService.translateSubtitles(
      testEntries,
      'cs',
      'en',
      'Naruto.S01E01.The.Hokage.srt',
      progressCallback
    )

    return NextResponse.json({
      success: true,
      originalEntries: testEntries,
      translatedEntries: result,
      progressLog,
      apiKeyStatus: {
        exists: !!process.env.OPENAI_API_KEY,
        length: process.env.OPENAI_API_KEY?.length || 0,
        startsWithSk: process.env.OPENAI_API_KEY?.startsWith('sk-') || false,
        preview: process.env.OPENAI_API_KEY?.substring(0, 10) + '...' || 'N/A'
      }
    })

  } catch (error) {
    console.error('❌ Test failed:', error)
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      apiKeyStatus: {
        exists: !!process.env.OPENAI_API_KEY,
        length: process.env.OPENAI_API_KEY?.length || 0,
        startsWithSk: process.env.OPENAI_API_KEY?.startsWith('sk-') || false,
        preview: process.env.OPENAI_API_KEY?.substring(0, 10) + '...' || 'N/A'
      }
    }, { status: 500 })
  }
}
