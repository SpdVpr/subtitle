type Feature = { id: string; attributes: { title: string; year: string; imdb_id?: number } }

/** Resolve titles before searching files: fuzzy subtitle search can bury new releases
 * behind hundreds of releases of unrelated, older movies. */
export async function resolveSubtitleTitles(
  query: string, type: string | null, year: string | null,
  request: (url: URL) => Promise<Response>,
): Promise<Array<{ imdbId: string; type: 'movie' | 'episode' }>> {
  const types = type === 'movie' ? ['movie'] : type === 'episode' ? ['tvshow'] : ['movie', 'tvshow']
  const normalize = (s: string) => s.toLowerCase().replace(/[^\p{L}\p{N}]/gu, '')
  const results = await Promise.all(types.map(async (mediaType) => {
    const url = new URL('https://api.opensubtitles.com/api/v1/features')
    url.searchParams.set('query', query)
    url.searchParams.set('type', mediaType)
    url.searchParams.set('query_match', 'exact')
    if (year) url.searchParams.set('year', year)
    let response = await request(url)
    if (!response.ok) return []
    let body = await response.json()
    // Provider's exact match is punctuation-sensitive ("Dune: Part Two").
    // Retry its broad title lookup, then apply our punctuation-insensitive match.
    if (!(body.data as Feature[] || []).some(f => normalize(f.attributes.title) === normalize(query))) {
      url.searchParams.delete('query_match')
      response = await request(url)
      if (!response.ok) return []
      body = await response.json()
    }
    return (body.data as Feature[] || [])
      .filter(f => f.attributes.imdb_id && normalize(f.attributes.title) === normalize(query))
      .map(f => ({ imdbId: String(f.attributes.imdb_id), type: mediaType === 'tvshow' ? 'episode' as const : 'movie' as const, year: Number(f.attributes.year) }))
  }))
  return results.flat().sort((a, b) => b.year - a.year).slice(0, 3)
}
