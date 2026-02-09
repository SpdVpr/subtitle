import { NextRequest, NextResponse } from 'next/server'

// TMDB API configuration
const TMDB_API_URL = 'https://api.themoviedb.org/3'
const TMDB_API_KEY = process.env.TMDB_API_KEY || 'demo_key'

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ type: string; id: string }> }
) {
  try {
    const { type, id } = await params

    if (!['movie', 'tv'].includes(type)) {
      return NextResponse.json(
        { error: 'Invalid type. Must be "movie" or "tv"' },
        { status: 400 }
      )
    }

    if (!id || isNaN(Number(id))) {
      return NextResponse.json(
        { error: 'Invalid ID. Must be a number' },
        { status: 400 }
      )
    }

    // Check if TMDB API key is available and valid
    if (!TMDB_API_KEY || TMDB_API_KEY === 'demo_key' || TMDB_API_KEY.includes('demo_key_for_development')) {
      console.log(`⚠️ TMDB API key not available, returning empty response for ${type} ID: ${id}`)
      return NextResponse.json({
        id: Number(id),
        title: 'Unknown',
        poster_path: null,
        overview: null,
        release_date: null
      })
    }

    console.log(`🎬 Fetching TMDB data for ${type} ID: ${id}`)

    // Build TMDB API URL
    const apiUrl = `${TMDB_API_URL}/${type}/${id}?api_key=${TMDB_API_KEY}&language=en-US`

    const response = await fetch(apiUrl, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'User-Agent': 'SubtitleAI v1.0 (https://subtitle-ai.vercel.app)',
      },
      // Cache for 1 hour
      next: { revalidate: 3600 }
    })

    if (!response.ok) {
      console.error(`TMDB API error: ${response.status}`)
      
      if (response.status === 404) {
        return NextResponse.json(
          { error: 'Content not found on TMDB' },
          { status: 404 }
        )
      }

      if (response.status === 401) {
        console.error('TMDB API key is invalid or missing')
        return NextResponse.json(
          { error: 'TMDB API authentication failed' },
          { status: 401 }
        )
      }

      return NextResponse.json(
        { error: 'Failed to fetch data from TMDB' },
        { status: response.status }
      )
    }

    const data = await response.json()
    
    // Return only the essential data we need
    const result = {
      id: data.id,
      title: data.title || data.name,
      poster_path: data.poster_path,
      backdrop_path: data.backdrop_path,
      overview: data.overview,
      release_date: data.release_date || data.first_air_date,
      vote_average: data.vote_average,
      vote_count: data.vote_count,
      genre_ids: data.genres?.map((g: any) => g.id) || [],
      original_language: data.original_language,
      popularity: data.popularity
    }

    console.log(`✅ TMDB data fetched successfully for ${type} ID: ${id}`)

    return NextResponse.json(result)

  } catch (error) {
    console.error('TMDB API error:', error)
    return NextResponse.json(
      { 
        error: 'Internal server error',
        details: error instanceof Error ? error.message : String(error)
      },
      { status: 500 }
    )
  }
}
