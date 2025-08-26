import { NextRequest, NextResponse } from 'next/server'
import { PremiumTranslationService } from '@/lib/premium-translation-service'

export async function POST(request: NextRequest) {
  try {
    const { text, sourceLanguage, targetLanguage, aiService, context } = await request.json()

    if (!text || !sourceLanguage || !targetLanguage) {
      return NextResponse.json(
        { error: 'Missing required parameters: text, sourceLanguage, targetLanguage' },
        { status: 400 }
      )
    }

    // Get API key based on service
    let apiKey: string
    if (aiService === 'openai') {
      apiKey = process.env.OPENAI_API_KEY || ''
      if (!apiKey) {
        return NextResponse.json(
          { error: 'OpenAI API key not configured' },
          { status: 500 }
        )
      }
    } else {
      // Default to Google Translate
      apiKey = process.env.GOOGLE_TRANSLATE_API_KEY || ''
      if (!apiKey) {
        return NextResponse.json(
          { error: 'Google Translate API key not configured' },
          { status: 500 }
        )
      }
    }

    console.log(`🔄 Translating single text: "${text.substring(0, 50)}..." from ${sourceLanguage} to ${targetLanguage} using ${aiService}`)

    const translationService = new PremiumTranslationService(apiKey)

    let translatedText: string

    if (aiService === 'openai') {
      // Use OpenAI for translation with context
      const contextPrompt = context
        ? `Context: ${context}\n\nTranslate the following subtitle text from ${sourceLanguage} to ${targetLanguage}. Maintain the original meaning and tone while ensuring natural flow:`
        : `Translate the following subtitle text from ${sourceLanguage} to ${targetLanguage}. Maintain the original meaning and tone while ensuring natural flow:`

      translatedText = await translationService.translateWithOpenAI(
        text,
        sourceLanguage,
        targetLanguage,
        contextPrompt
      )
    } else {
      // Use Google Translate
      translatedText = await translationService.translateWithGoogle(
        text,
        sourceLanguage,
        targetLanguage
      )
    }

    console.log(`✅ Translation completed: "${translatedText.substring(0, 50)}..."`)

    return NextResponse.json({
      translatedText,
      originalText: text,
      sourceLanguage,
      targetLanguage,
      aiService,
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

// Handle OPTIONS for CORS
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  })
}
