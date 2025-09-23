import { NextRequest, NextResponse } from 'next/server'
import { SubtitleProcessor } from '@/lib/subtitle-processor'
import { PremiumTranslationService } from '@/lib/premium-translation-service'

export async function GET() {
  return NextResponse.json({
    message: 'Simple translate endpoint is working',
    timestamp: new Date().toISOString()
  })
}

export async function POST(request: NextRequest) {
  try {
    console.log('🚀 Simple translate endpoint called')
    
    const formData = await request.formData()
    const file = formData.get('file') as File | null
    const targetLanguage = (formData.get('targetLanguage') as string) || 'cs'
    const sourceLanguage = (formData.get('sourceLanguage') as string) || 'en'
    const userId = (formData.get('userId') as string) || ''

    const startTime = Date.now()

    console.log('📝 Request data:', {
      hasFile: !!file,
      targetLanguage,
      sourceLanguage,
      userId: userId.substring(0, 10) + '...'
    })

    // Check if user is logged in
    if (!userId) {
      return NextResponse.json({ 
        error: 'Authentication required. Please log in to use translation services.' 
      }, { status: 401 })
    }

    if (!file) {
      return NextResponse.json({ 
        error: 'No file uploaded' 
      }, { status: 400 })
    }

    const apiKey = process.env.OPENAI_API_KEY
    if (!apiKey || !apiKey.startsWith('sk-')) {
      return NextResponse.json({ 
        error: 'Premium translation requires a valid OPENAI_API_KEY' 
      }, { status: 500 })
    }

    console.log('🔑 API key available:', !!apiKey)

    const fileText = await file.text()
    const entries = SubtitleProcessor.parseSRT(fileText)
    
    if (!entries.length) {
      return NextResponse.json({ 
        error: 'No valid subtitles found in file' 
      }, { status: 400 })
    }

    console.log('📄 Parsed subtitles:', entries.length)

    // Calculate and deduct credits upfront
    const batchSize = 20
    const totalBatches = Math.ceil(entries.length / batchSize)
    const totalCredits = totalBatches * 0.7

    console.log(`💰 Credit calculation: ${entries.length} subtitles, ${totalBatches} batches, ${totalCredits} credits`)

    // Check balance and deduct credits upfront
    try {
      const { UserService } = await import('@/lib/database-admin')

      console.log('🔍 Getting user data...')
      const user = await UserService.getUser(userId)

      if (!user) {
        console.error('❌ User not found:', userId)
        return NextResponse.json({
          error: 'User not found. Please log in again.'
        }, { status: 404 })
      }

      const balance = (user?.creditsBalance || 0)
      console.log(`💳 User balance: ${balance}, Required: ${totalCredits}`)

      if (balance < totalCredits) {
        return NextResponse.json({
          error: `Insufficient credits. Required: ${totalCredits.toFixed(2)}, Available: ${balance.toFixed(2)}`
        }, { status: 402 })
      }

      console.log('💰 Deducting credits...')
      console.log(`💳 SIMPLE: About to deduct ${totalCredits} credits for user ${userId}`)
      // Deduct all credits upfront
      await UserService.adjustCredits(userId, -totalCredits, `Premium translation: ${entries.length} subtitles (${totalBatches} batches)`)
      console.log(`✅ SIMPLE: Successfully deducted ${totalCredits} credits for premium translation`)
    } catch (err) {
      console.error('❌ Credit deduction failed:', err)
      console.error('❌ Error details:', err instanceof Error ? err.message : String(err))
      console.error('❌ Error stack:', err instanceof Error ? err.stack : 'No stack trace')

      return NextResponse.json({
        error: 'Failed to process payment: ' + (err instanceof Error ? err.message : 'Unknown database error')
      }, { status: 500 })
    }

    console.log('🎬 Starting premium translation...')
    const premium = new PremiumTranslationService(apiKey)

    // Progress callback that logs and could be extended for real-time updates
    const progressCallback = (stage: string, progress: number, details?: string) => {
      console.log(`🔄 Progress: ${stage} (${progress}%) - ${details || ''}`)
      // In future, we could send progress updates via WebSocket or polling
    }

    try {
      console.log('🚀 Calling PremiumTranslationService.translateSubtitles...')
      const translatedEntries = await premium.translateSubtitles(
        entries,
        targetLanguage,
        sourceLanguage || 'en',
        file.name,
        progressCallback
      )
      console.log('✅ PremiumTranslationService completed, got', translatedEntries.length, 'entries')

      const translatedContent = SubtitleProcessor.generateSRT(translatedEntries, targetLanguage)
      const translatedFileName = file.name.replace('.srt', `_${targetLanguage}.srt`)

      console.log('✅ Translation completed successfully')

      // Save translation job to database (asynchronously)
      try {
        const { TranslationJobService } = await import('@/lib/database-admin')

        const jobId = await TranslationJobService.createJob({
          userId,
          type: 'single',
          status: 'completed',
          originalFileName: file.name,
          originalFileSize: file.size,
          sourceLanguage: sourceLanguage || undefined,
          targetLanguage,
          aiService: 'openai',
          translatedFileName,
          translatedContent,
          subtitleCount: translatedEntries.length,
          characterCount: translatedContent.length,
          confidence: 0.95,
          processingTimeMs: Date.now() - startTime,
          completedAt: new Date() as any
        })
        console.log(`📝 SIMPLE: Created translation job: ${jobId} for user ${userId}`)
      } catch (jobError) {
        console.error('❌ Failed to save translation job:', jobError)
        // Don't fail the request if job saving fails
      }

      return NextResponse.json({
        status: 'completed',
        translatedContent,
        translatedFileName,
        subtitleCount: entries.length,
        creditsUsed: totalCredits,
        processingTimeMs: Date.now() - startTime
      })

    } catch (translationError) {
      console.error('❌ Translation failed:', translationError)
      
      // Refund credits on translation failure
      try {
        const { UserService } = await import('@/lib/database-admin')
        await UserService.adjustCredits(userId, totalCredits, `Refund for failed translation: ${file.name}`)
        console.log(`💰 Refunded ${totalCredits} credits due to translation failure`)
      } catch (refundError) {
        console.error('❌ Failed to refund credits:', refundError)
      }

      return NextResponse.json({ 
        error: 'Translation failed: ' + (translationError instanceof Error ? translationError.message : 'Unknown error')
      }, { status: 500 })
    }

  } catch (error) {
    console.error('❌ Simple translate error:', error)
    return NextResponse.json({ 
      error: 'Internal server error: ' + (error instanceof Error ? error.message : 'Unknown error')
    }, { status: 500 })
  }
}
