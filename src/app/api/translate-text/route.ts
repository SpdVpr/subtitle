import { NextRequest, NextResponse } from 'next/server'
import { PremiumTranslationService } from '@/lib/premium-translation-service'
import { verifyUser } from '@/lib/user-auth-server'

// Regenerating one subtitle in the editor is free, so cap what one request may send:
// without limits this route would be an open Gemini proxy paid for by us.
const MAX_TEXT_LENGTH = 1000
const MAX_CONTEXT_LENGTH = 2000
const MAX_LANGUAGE_LENGTH = 20

export async function POST(request: NextRequest) {
  try {
    const authUser = await verifyUser(request)
    if (!authUser) return NextResponse.json({ error: 'Authentication required.' }, { status: 401 })
    if (!authUser.emailVerified) {
      return NextResponse.json({ error: 'Email verification required.', code: 'EMAIL_NOT_VERIFIED' }, { status: 403 })
    }

    const { text, sourceLanguage, targetLanguage, context } = await request.json()

    if (
      typeof text !== 'string' || !text.trim() ||
      typeof sourceLanguage !== 'string' || !sourceLanguage ||
      typeof targetLanguage !== 'string' || !targetLanguage
    ) {
      return NextResponse.json(
        { error: 'Missing required parameters: text, sourceLanguage, targetLanguage' },
        { status: 400 }
      )
    }
    if (
      text.length > MAX_TEXT_LENGTH ||
      sourceLanguage.length > MAX_LANGUAGE_LENGTH ||
      targetLanguage.length > MAX_LANGUAGE_LENGTH
    ) {
      return NextResponse.json({ error: 'Subtitle text is too long.' }, { status: 400 })
    }

    const geminiKey = process.env.GEMINI_API_KEY
    if (!geminiKey) {
      return NextResponse.json({ error: 'Translation service is not configured.' }, { status: 500 })
    }

    const translator = new PremiumTranslationService(geminiKey, 'standard')
    const translatedText = await translator.translateText(
      text,
      sourceLanguage,
      targetLanguage,
      typeof context === 'string' ? context.slice(0, MAX_CONTEXT_LENGTH) : undefined
    )

    return NextResponse.json({
      translatedText,
      originalText: text,
      sourceLanguage,
      targetLanguage,
      success: true
    })

  } catch (error) {
    console.error('❌ Translation error:', error)

    return NextResponse.json(
      {
        error: 'Translation failed',
        details: error instanceof Error ? error.message : 'Unknown error',
        success: false
      },
      { status: 500 }
    )
  }
}
