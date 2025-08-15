import { NextRequest, NextResponse } from 'next/server'
import { TranslationJobService, UserService } from '@/lib/database-admin'

export async function POST(req: NextRequest) {
  try {
    const {
      userId,
      originalFileName,
      targetLanguage,
      translatedContent,
      subtitleCount,
      characterCount
    } = await req.json()

    console.log('💾 Saving batch translation to database:', {
      userId,
      originalFileName,
      targetLanguage,
      subtitleCount
    })

    if (!userId || !originalFileName || !targetLanguage || !translatedContent) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Generate unique job ID
    const jobId = `batch_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    const translatedFileName = `${originalFileName.replace('.srt', '')}_${targetLanguage}.srt`

    // Create translation job in database
    await TranslationJobService.createJob({
      id: jobId,
      userId,
      originalFileName,
      translatedFileName,
      sourceLanguage: 'auto',
      targetLanguage,
      aiService: 'openai',
      status: 'completed',
      createdAt: new Date() as any,
      completedAt: new Date() as any,
      subtitleCount: subtitleCount || 0,
      characterCount: characterCount || 0,
      processingTimeMs: 2000, // Estimate
      translatedContent,
      confidence: 0.85
    })

    // Calculate and deduct credits
    const chunksNeeded = Math.ceil((subtitleCount || 20) / 20)
    const creditsUsed = chunksNeeded * 0.4

    await UserService.adjustCredits(
      userId,
      -creditsUsed,
      `Batch translation: ${originalFileName}`,
      jobId
    )

    console.log('✅ Batch translation saved successfully:', {
      jobId,
      creditsUsed,
      translatedFileName
    })

    return NextResponse.json({
      success: true,
      jobId,
      translatedFileName,
      creditsUsed
    })

  } catch (error) {
    console.error('❌ Failed to save batch translation:', error)
    return NextResponse.json(
      { 
        error: 'Failed to save translation',
        details: error instanceof Error ? error.message : String(error)
      },
      { status: 500 }
    )
  }
}
