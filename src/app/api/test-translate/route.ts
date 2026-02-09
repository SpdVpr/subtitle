import { NextRequest, NextResponse } from 'next/server'
import { TranslationServiceFactory } from '@/lib/translation-services'

export async function GET(req: NextRequest) {
  try {
    // Only premium service is supported
    const service = 'premium'

    // Check OpenAI API key
    const openaiConfigured = !!process.env.OPENAI_API_KEY && !process.env.OPENAI_API_KEY.includes('your_openai_api_key')

    if (!openaiConfigured) {
      return NextResponse.json(
        { error: 'OpenAI API key not configured' },
        { status: 500 }
      )
    }

    // Test translation with movie context
    const testTexts = [
      "I'll be back.",
      "May the Force be with you.",
      "You talking to me?",
      "Here's looking at you, kid."
    ]

    const translationService = TranslationServiceFactory.create('premium')

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
        openai: openaiConfigured
      }
    })

  } catch (error) {
    console.error('Translation test error:', error)

    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Translation test failed',
      apiKeys: {
        openai: !!process.env.OPENAI_API_KEY && !process.env.OPENAI_API_KEY.includes('your_openai_api_key')
      }
    }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const { text, targetLanguage, sourceLanguage, service = 'premium' } = await req.json()

    if (!text || !targetLanguage) {
      return NextResponse.json(
        { error: 'Missing text or targetLanguage' },
        { status: 400 }
      )
    }

    // Check OpenAI API key
    const openaiConfigured = !!process.env.OPENAI_API_KEY && !process.env.OPENAI_API_KEY.includes('your_openai_api_key')

    if (!openaiConfigured) {
      return NextResponse.json(
        { error: 'OpenAI API key not configured' },
        { status: 500 }
      )
    }

    const translationService = TranslationServiceFactory.create('premium')

    const texts = Array.isArray(text) ? text : [text]
    const translatedTexts = await translationService.translate(
      texts,
      targetLanguage,
      sourceLanguage || 'auto'
    )

    return NextResponse.json({
      success: true,
      service: 'premium',
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
