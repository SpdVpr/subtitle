import { NextRequest, NextResponse } from 'next/server'
import { TranslationServiceFactory } from '@/lib/translation-services'

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const service = searchParams.get('service') || 'google'

    // Check API keys
    const googleConfigured = !!process.env.GOOGLE_TRANSLATE_API_KEY
    const openaiConfigured = !!process.env.OPENAI_API_KEY && !process.env.OPENAI_API_KEY.includes('your_openai_api_key')

    if ((service === 'google') && !googleConfigured) {
      return NextResponse.json(
        { error: 'Google Translate API key not configured' },
        { status: 500 }
      )
    }

    if ((service === 'openai' || service === 'premium') && !openaiConfigured) {
      return NextResponse.json(
        { error: 'OpenAI API key not configured' },
        { status: 500 }
      )
    }

    // Test translation with movie context
    const testTexts = service === 'premium'
      ? [
          "I'll be back.",
          "May the Force be with you.",
          "You talking to me?",
          "Here's looking at you, kid."
        ]
      : ['Hello, world!', 'How are you today?']

    const translationService = TranslationServiceFactory.create(service as any)

    const translatedTexts = await translationService.translate(
      testTexts,
      'cs', // Czech
      'en'  // English
    )

    let contextAnalysis = null
    if (service === 'premium' && translationService instanceof (await import('@/lib/translation-services')).PremiumTranslationService) {
      try {
        contextAnalysis = await (translationService as any).analyzeContent(testTexts)
      } catch (error) {
        console.warn('Context analysis failed:', error)
      }
    }

    return NextResponse.json({
      success: true,
      message: `${service.toUpperCase()} Translation API is working!`,
      service,
      test: {
        original: testTexts,
        translated: translatedTexts,
        sourceLanguage: 'en',
        targetLanguage: 'cs'
      },
      contextAnalysis,
      apiKeys: {
        google: googleConfigured,
        openai: openaiConfigured
      }
    })

  } catch (error) {
    console.error('Translation test error:', error)

    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Translation test failed',
      apiKeys: {
        google: !!process.env.GOOGLE_TRANSLATE_API_KEY,
        openai: !!process.env.OPENAI_API_KEY && !process.env.OPENAI_API_KEY.includes('your_openai_api_key')
      }
    }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const { text, targetLanguage, sourceLanguage, service = 'google' } = await req.json()

    if (!text || !targetLanguage) {
      return NextResponse.json(
        { error: 'Missing text or targetLanguage' },
        { status: 400 }
      )
    }

    // Check API keys based on service
    const googleConfigured = !!process.env.GOOGLE_TRANSLATE_API_KEY
    const openaiConfigured = !!process.env.OPENAI_API_KEY && !process.env.OPENAI_API_KEY.includes('your_openai_api_key')

    if (service === 'google' && !googleConfigured) {
      return NextResponse.json(
        { error: 'Google Translate API key not configured' },
        { status: 500 }
      )
    }

    if (service === 'openai' && !openaiConfigured) {
      return NextResponse.json(
        { error: 'OpenAI API key not configured' },
        { status: 500 }
      )
    }

    const translationService = TranslationServiceFactory.create(service as any)

    const texts = Array.isArray(text) ? text : [text]
    const translatedTexts = await translationService.translate(
      texts,
      targetLanguage,
      sourceLanguage || 'auto'
    )

    return NextResponse.json({
      success: true,
      service,
      original: texts,
      translated: translatedTexts,
      sourceLanguage: sourceLanguage || 'auto',
      targetLanguage
    })

  } catch (error) {
    console.error('Translation error:', error)

    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Translation failed'
    }, { status: 500 })
  }
}
