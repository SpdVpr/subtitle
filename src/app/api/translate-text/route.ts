import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  try {
    const { text, targetLanguage, sourceLanguage = 'auto', service = 'google' } = await req.json()

    if (!text || !targetLanguage) {
      return NextResponse.json(
        { error: 'Missing text or targetLanguage' },
        { status: 400 }
      )
    }

    // Simple mock translation for now (to avoid CORS issues with Google Translate)
    // In production, you would use a proper translation service
    let translatedText = text

    if (service === 'google') {
      // Mock translation - just return original text for now
      // You can implement a proper server-side Google Translate API call here
      translatedText = text
    }

    return NextResponse.json({
      translatedText,
      sourceLanguage,
      targetLanguage,
      service
    })

  } catch (error) {
    console.error('Translation API error:', error)
    return NextResponse.json(
      { error: 'Translation failed' },
      { status: 500 }
    )
  }
}
