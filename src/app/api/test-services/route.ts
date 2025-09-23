import { NextResponse } from 'next/server'
import { TranslationJobService } from '@/lib/database'
import { StorageService } from '@/lib/storage'

export async function GET() {
  // Only allow in development
  if (process.env.NODE_ENV !== 'development') {
    return NextResponse.json({ error: 'Not available in production' }, { status: 403 })
  }

  const results: any = {
    timestamp: new Date().toISOString(),
    services: {}
  }

  // Test TranslationJobService
  try {
    console.log('🧪 Testing TranslationJobService...')
    const testJob = await TranslationJobService.createJob({
      userId: 'test-user',
      type: 'single',
      status: 'pending',
      originalFileName: 'test.srt',
      originalFileSize: 100,
      targetLanguage: 'cs',
      aiService: 'openai'
    })
    console.log('✅ TranslationJobService: Job created:', testJob)
    
    // Clean up test job
    await TranslationJobService.updateJob(testJob, { status: 'failed', errorMessage: 'Test job - cleaned up' })
    
    results.services.translationJobService = {
      status: 'working',
      testJobId: testJob
    }
  } catch (error) {
    console.error('❌ TranslationJobService failed:', error)
    results.services.translationJobService = {
      status: 'failed',
      error: error instanceof Error ? error.message : String(error)
    }
  }

  // Test StorageService
  try {
    console.log('🧪 Testing StorageService...')
    const testFile = new File(['test content'], 'test.txt', { type: 'text/plain' })
    const { url } = await StorageService.uploadFile(testFile, 'test-user', 'test-job', false)
    console.log('✅ StorageService: File uploaded:', url)
    
    results.services.storageService = {
      status: 'working',
      testUrl: url
    }
  } catch (error) {
    console.error('❌ StorageService failed:', error)
    results.services.storageService = {
      status: 'failed',
      error: error instanceof Error ? error.message : String(error)
    }
  }

  // Test environment variables
  results.environment = {
    nodeEnv: process.env.NODE_ENV,
    hasOpenAI: !!process.env.OPENAI_API_KEY,
    hasFirebaseProject: !!process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    hasStripeKey: !!process.env.STRIPE_SECRET_KEY
  }

  return NextResponse.json(results)
}
