import { NextResponse } from 'next/server'

export async function GET() {
  // Only allow in development or with specific header
  const isDev = process.env.NODE_ENV === 'development'
  
  if (!isDev) {
    return NextResponse.json({ error: 'Not available in production' }, { status: 403 })
  }

  const envCheck = {
    NODE_ENV: process.env.NODE_ENV,
    OPENAI_API_KEY: process.env.OPENAI_API_KEY ? {
      exists: true,
      length: process.env.OPENAI_API_KEY.length,
      startsWithSk: process.env.OPENAI_API_KEY.startsWith('sk-'),
      preview: process.env.OPENAI_API_KEY.substring(0, 10) + '...'
    } : { exists: false },
    GOOGLE_TRANSLATE_API_KEY: process.env.GOOGLE_TRANSLATE_API_KEY ? {
      exists: true,
      length: process.env.GOOGLE_TRANSLATE_API_KEY.length,
      preview: process.env.GOOGLE_TRANSLATE_API_KEY.substring(0, 10) + '...'
    } : { exists: false },
    OPENSUBTITLES_API_KEY: process.env.OPENSUBTITLES_API_KEY ? {
      exists: true,
      length: process.env.OPENSUBTITLES_API_KEY.length,
      preview: process.env.OPENSUBTITLES_API_KEY.substring(0, 10) + '...'
    } : { exists: false }
  }

  return NextResponse.json(envCheck)
}
