import { NextRequest, NextResponse } from 'next/server'

// OpenSubtitles API configuration
const OPENSUBTITLES_API_URL = 'https://api.opensubtitles.com/api/v1'
const API_KEY = process.env.OPENSUBTITLES_API_KEY

interface OpenSubtitlesFile {
  file_id: number
  cd_number: number
  file_name: string | null
}

interface OpenSubtitlesFeatureDetails {
  feature_id: number
  feature_type: string
  year: number
  title: string
  movie_name: string
  imdb_id: string
  tmdb_id: number
}

interface OpenSubtitlesUploader {
  uploader_id: number
  name: string
  rank: string
}

interface OpenSubtitlesSubtitle {
  id: string
  type: string
  attributes: {
    subtitle_id: string
    language: string
    download_count: number
    new_download_count: number
    hearing_impaired: boolean
    hd: boolean
    fps: number
    votes: number
    ratings: number
    from_trusted: boolean
    foreign_parts_only: boolean
    upload_date: string
    ai_translated: boolean
    machine_translated: boolean
    release: string
    comments: string | null
    legacy_subtitle_id: number
    uploader: OpenSubtitlesUploader
    feature_details: OpenSubtitlesFeatureDetails
    url: string
    download_url?: string
    files: OpenSubtitlesFile[]
    moviehash_match: boolean
  }
}

export async function GET(request: NextRequest) {
  try {
    // Check if API key is configured
    if (!API_KEY) {
      return NextResponse.json(
        { error: 'OpenSubtitles API key not configured' },
        { status: 500 }
      )
    }

    const { searchParams } = new URL(request.url)

    // Extract search parameters
    const query = searchParams.get('query')
    const languages = searchParams.get('languages') || 'en'
    const imdb_id = searchParams.get('imdb_id')
    const parent_imdb_id = searchParams.get('parent_imdb_id')
    const tmdb_id = searchParams.get('tmdb_id')
    const parent_tmdb_id = searchParams.get('parent_tmdb_id')
    const type = searchParams.get('type') as 'movie' | 'episode' | null
    const season_number = searchParams.get('season_number')
    const episode_number = searchParams.get('episode_number')
    const year = searchParams.get('year')
    const page = searchParams.get('page') || '1'
    const per_page = searchParams.get('per_page') || '20'

    if (!query && !imdb_id && !tmdb_id && !parent_imdb_id && !parent_tmdb_id) {
      return NextResponse.json(
        { error: 'At least one search parameter (query, imdb_id, parent_imdb_id, tmdb_id, or parent_tmdb_id) is required' },
        { status: 400 }
      )
    }

    // Build OpenSubtitles API URL
    const apiUrl = new URL(`${OPENSUBTITLES_API_URL}/subtitles`)

    if (query) apiUrl.searchParams.set('query', query)
    if (languages) apiUrl.searchParams.set('languages', languages)
    if (imdb_id) apiUrl.searchParams.set('imdb_id', imdb_id)
    if (parent_imdb_id) apiUrl.searchParams.set('parent_imdb_id', parent_imdb_id)
    if (tmdb_id) apiUrl.searchParams.set('tmdb_id', tmdb_id)
    if (parent_tmdb_id) apiUrl.searchParams.set('parent_tmdb_id', parent_tmdb_id)
    if (type) apiUrl.searchParams.set('type', type)
    if (season_number) apiUrl.searchParams.set('season_number', season_number)
    if (episode_number) apiUrl.searchParams.set('episode_number', episode_number)
    if (year) apiUrl.searchParams.set('year', year)
    apiUrl.searchParams.set('page', page)
    apiUrl.searchParams.set('per_page', per_page)

    console.log('Calling OpenSubtitles API:', apiUrl.toString())

    // Make request to OpenSubtitles API with retry logic
    let response: Response
    let retries = 0
    const maxRetries = 2

    do {
      response = await fetch(apiUrl.toString(), {
        method: 'GET',
        headers: {
          'Api-Key': API_KEY,
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'User-Agent': 'SubtitleAI v1.0 (https://subtitle-ai.vercel.app)',
        },
      })

      console.log('OpenSubtitles API response status:', response.status)

      // If successful or client error (4xx), don't retry
      if (response.ok || (response.status >= 400 && response.status < 500)) {
        break
      }

      // For server errors (5xx), wait and retry
      if (retries < maxRetries && response.status >= 500) {
        console.log(`Retrying API call (attempt ${retries + 1}/${maxRetries})`)
        await new Promise(resolve => setTimeout(resolve, 1000 * (retries + 1)))
        retries++
      } else {
        break
      }
    } while (retries <= maxRetries)

    if (!response.ok) {
      const errorText = await response.text()
      console.error('OpenSubtitles API error:', response.status, errorText)

      let errorMessage = 'Failed to search subtitles'
      let details = 'API request failed'

      if (response.status === 429) {
        details = 'Rate limit exceeded. Please try again later.'
      } else if (response.status === 502 || response.status === 503) {
        details = 'OpenSubtitles service is temporarily unavailable. Please try again in a few minutes.'
      } else if (response.status === 401) {
        details = 'API authentication failed'
      } else if (response.status >= 500) {
        details = 'OpenSubtitles server error. Please try again later.'
      }

      return NextResponse.json(
        {
          error: errorMessage,
          details: details,
          status: response.status
        },
        { status: response.status >= 500 ? 503 : response.status }
      )
    }

    const data = await response.json()
    console.log('OpenSubtitles API response data:', JSON.stringify(data, null, 2))

    // Transform the response to include download URLs
    const transformedData = {
      ...data,
      data: data.data.map((subtitle: any) => ({
        ...subtitle,
        attributes: {
          ...subtitle.attributes,
          download_url: subtitle.attributes.url,
        }
      }))
    }

    return NextResponse.json(transformedData)

  } catch (error) {
    console.error('OpenSubtitles search error:', error)

    return NextResponse.json(
      {
        error: 'Internal server error',
        details: 'Unable to connect to OpenSubtitles service. Please try again later.'
      },
      { status: 500 }
    )
  }
}


