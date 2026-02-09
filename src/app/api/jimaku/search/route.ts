import { NextRequest, NextResponse } from 'next/server'

// Jimaku API configuration
const JIMAKU_API_URL = 'https://jimaku.cc/api'
const API_KEY = process.env.JIMAKU_API_KEY

interface JimakuEntry {
  id: string
  type: string
  attributes: {
    name: string
    original_name?: string
    year?: number
    season?: string
    episode?: number
    anilist_id?: number
    mal_id?: number
    tmdb_id?: number
    imdb_id?: string
    created_at: string
    updated_at: string
  }
  relationships?: {
    files?: {
      data: Array<{
        id: string
        type: string
      }>
    }
  }
}

interface JimakuFile {
  id: string
  type: string
  attributes: {
    name: string
    url: string
    language: string
    created_at: string
    updated_at: string
  }
}

interface JimakuSearchResponse {
  data: JimakuEntry[]
  included?: JimakuFile[]
  meta?: {
    total: number
    page: number
    per_page: number
    total_pages: number
  }
}

export async function GET(request: NextRequest) {
  try {
    // Check if API key is configured
    if (!API_KEY) {
      return NextResponse.json(
        { error: 'Jimaku API key not configured' },
        { status: 500 }
      )
    }

    const { searchParams } = new URL(request.url)

    // Extract search parameters
    const query = searchParams.get('query')
    const anime = searchParams.get('anime') === 'true'
    const manga = searchParams.get('manga') === 'true'
    const anilist_id = searchParams.get('anilist_id')
    const mal_id = searchParams.get('mal_id')
    const tmdb_id = searchParams.get('tmdb_id')
    const imdb_id = searchParams.get('imdb_id')
    const page = searchParams.get('page') || '1'
    const limit = searchParams.get('limit') || '20'

    if (!query && !anilist_id && !mal_id && !tmdb_id && !imdb_id) {
      return NextResponse.json(
        { error: 'At least one search parameter is required' },
        { status: 400 }
      )
    }

    // Build Jimaku API URL
    const apiUrl = new URL(`${JIMAKU_API_URL}/entries/search`)

    if (query) apiUrl.searchParams.set('query', query)
    if (anime) apiUrl.searchParams.set('anime', 'true')
    if (manga) apiUrl.searchParams.set('manga', 'true')
    if (anilist_id) apiUrl.searchParams.set('anilist_id', anilist_id)
    if (mal_id) apiUrl.searchParams.set('mal_id', mal_id)
    if (tmdb_id) apiUrl.searchParams.set('tmdb_id', tmdb_id)
    if (imdb_id) apiUrl.searchParams.set('imdb_id', imdb_id)
    apiUrl.searchParams.set('page', page)
    apiUrl.searchParams.set('limit', limit)

    console.log('Calling Jimaku API:', apiUrl.toString())

    // Try different authentication methods
    const authMethods = [
      { 'Authorization': API_KEY },
      { 'Authorization': `Bearer ${API_KEY}` },
      { 'X-API-Key': API_KEY },
      { 'Api-Key': API_KEY },
      { 'X-Auth-Token': API_KEY }
    ]

    let response: Response | null = null
    let lastError: string = ''

    for (const headers of authMethods) {
      try {
        console.log('Trying auth method:', Object.keys(headers)[0])
        response = await fetch(apiUrl.toString(), {
          method: 'GET',
          headers: {
            ...headers,
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            'User-Agent': 'SubtitleAI v1.0 (https://subtitle-ai.vercel.app)',
          },
        })

        console.log('Jimaku API response status:', response.status)

        if (response.ok) {
          break // Success, exit the loop
        } else {
          const errorText = await response.text()
          lastError = `${response.status}: ${errorText}`
          console.log('Auth method failed:', Object.keys(headers)[0], lastError)
        }
      } catch (error) {
        lastError = error instanceof Error ? error.message : 'Unknown error'
        console.log('Auth method error:', Object.keys(headers)[0], lastError)
      }
    }

    if (!response || !response.ok) {
      console.error('All Jimaku API auth methods failed. Last error:', lastError)
      return NextResponse.json(
        {
          error: 'Failed to authenticate with Jimaku API',
          details: lastError || 'All authentication methods failed'
        },
        { status: 401 }
      )
    }

    const data: JimakuSearchResponse = await response.json()
    console.log('Jimaku API response data:', JSON.stringify(data, null, 2))

    return NextResponse.json(data)

  } catch (error) {
    console.error('Jimaku search error:', error)

    return NextResponse.json(
      {
        error: 'Internal server error',
        details: 'Unable to connect to Jimaku service. Please try again later.'
      },
      { status: 500 }
    )
  }
}
