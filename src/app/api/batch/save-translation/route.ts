import { NextRequest, NextResponse } from 'next/server'
import { TranslationJobService } from '@/lib/database-admin'
import { verifyUser } from '@/lib/user-auth-server'

export async function POST(req: NextRequest) {
  try {
    const authUser = await verifyUser(req)
    if (!authUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    const userId = authUser.uid

    const {
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

    if (!originalFileName || !targetLanguage || !translatedContent) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Get user profile to check email verification
    const userProfile = await UserService.getUser(userId)
    if (!userProfile) {
      return NextResponse.json(
        { error: 'User not found. Please log in again.' },
        { status: 404 }
      )
    }

    // Check if email is verified
    if (!userProfile.emailVerified) {
      return NextResponse.json(
        {
          error: 'Email verification required. Please verify your email address before using translation services.',
          code: 'EMAIL_NOT_VERIFIED'
        },
        { status: 403 }
      )
    }

    const translatedFileName = `${originalFileName.replace('.srt', '')}_${targetLanguage}.srt`

    // Create translation job in database (let Firestore generate the ID)
    const jobId = await TranslationJobService.createJob({
      userId,
      originalFileName,
      translatedFileName,
      sourceLanguage: 'auto',
      targetLanguage,
      aiService: 'openai',
      status: 'completed',
      completedAt: new Date() as any,
      subtitleCount: subtitleCount || 0,
      characterCount: characterCount || 0,
      processingTimeMs: 0,
      translatedContent,
    })

    // Legacy persistence endpoint only. Translation endpoints now reserve and
    // charge centrally; saving a result must never deduct a second time.
    const creditsUsed = 0

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
