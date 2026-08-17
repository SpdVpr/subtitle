export type CatalogMediaType = 'movie' | 'tv'

export interface CatalogSeed {
  slug: string
  title: string
  year: number
  type: CatalogMediaType
  imdbId: number
  tmdbId?: number
  popularity: number
  description: string
}

export interface CatalogSubtitle {
  id: string
  language: string
  release: string
  fps: number | null
  trusted: boolean
  hearingImpaired: boolean
  aiTranslated: boolean
  machineTranslated: boolean
  downloadCount: number
  sourceUrl: string
  uploadDate: string | null
}

export interface CatalogResult {
  media: CatalogSeed
  subtitles: CatalogSubtitle[]
  total: number
  languageCounts: Record<string, number>
  fetched: boolean
}

export const catalogLanguages = [
  { code: 'en', slug: 'english', name: 'English', csName: 'angličtině' },
  { code: 'es', slug: 'spanish', name: 'Spanish', csName: 'španělštině' },
  { code: 'id', slug: 'indonesian', name: 'Indonesian', csName: 'indonéštině' },
  { code: 'tl', slug: 'tagalog', name: 'Tagalog', csName: 'tagalogu' },
  { code: 'hi', slug: 'hindi', name: 'Hindi', csName: 'hindštině' },
  { code: 'cs', slug: 'czech', name: 'Czech', csName: 'češtině' },
] as const

export const catalogSeeds: CatalogSeed[] = [
  { slug: 'gladiator-2000', title: 'Gladiator', year: 2000, type: 'movie', imdbId: 172495, tmdbId: 98, popularity: 100, description: 'Ridley Scott historical epic starring Russell Crowe.' },
  { slug: 'the-godfather-1972', title: 'The Godfather', year: 1972, type: 'movie', imdbId: 68646, tmdbId: 238, popularity: 98, description: 'Crime drama directed by Francis Ford Coppola.' },
  { slug: 'inception-2010', title: 'Inception', year: 2010, type: 'movie', imdbId: 1375666, tmdbId: 27205, popularity: 97, description: 'Christopher Nolan science-fiction thriller about layered dreams.' },
  { slug: 'interstellar-2014', title: 'Interstellar', year: 2014, type: 'movie', imdbId: 816692, tmdbId: 157336, popularity: 96, description: 'Science-fiction drama about an interstellar mission.' },
  { slug: 'parasite-2019', title: 'Parasite', year: 2019, type: 'movie', imdbId: 6751668, tmdbId: 496243, popularity: 94, description: 'Bong Joon Ho thriller about two families in Seoul.' },
  { slug: 'the-dark-knight-2008', title: 'The Dark Knight', year: 2008, type: 'movie', imdbId: 468569, tmdbId: 155, popularity: 95, description: 'Superhero crime drama directed by Christopher Nolan.' },
  { slug: 'the-matrix-1999', title: 'The Matrix', year: 1999, type: 'movie', imdbId: 133093, tmdbId: 603, popularity: 93, description: 'Science-fiction action film directed by the Wachowskis.' },
  { slug: 'pulp-fiction-1994', title: 'Pulp Fiction', year: 1994, type: 'movie', imdbId: 110912, tmdbId: 680, popularity: 91, description: 'Interwoven crime film written and directed by Quentin Tarantino.' },
  { slug: 'fight-club-1999', title: 'Fight Club', year: 1999, type: 'movie', imdbId: 137523, tmdbId: 550, popularity: 90, description: 'David Fincher drama adapted from the novel by Chuck Palahniuk.' },
  { slug: 'the-shawshank-redemption-1994', title: 'The Shawshank Redemption', year: 1994, type: 'movie', imdbId: 111161, tmdbId: 278, popularity: 92, description: 'Prison drama directed by Frank Darabont.' },
  { slug: 'the-lord-of-the-rings-the-fellowship-of-the-ring-2001', title: 'The Lord of the Rings: The Fellowship of the Ring', year: 2001, type: 'movie', imdbId: 120737, tmdbId: 120, popularity: 94, description: 'First film in Peter Jackson’s Lord of the Rings trilogy.' },
  { slug: 'titanic-1997', title: 'Titanic', year: 1997, type: 'movie', imdbId: 120338, tmdbId: 597, popularity: 91, description: 'James Cameron romance and disaster film set aboard Titanic.' },
  { slug: 'avengers-endgame-2019', title: 'Avengers: Endgame', year: 2019, type: 'movie', imdbId: 4154796, tmdbId: 299534, popularity: 90, description: 'Marvel Studios ensemble superhero film.' },
  { slug: 'dune-2021', title: 'Dune', year: 2021, type: 'movie', imdbId: 1160419, tmdbId: 438631, popularity: 89, description: 'Denis Villeneuve adaptation of Frank Herbert’s science-fiction novel.' },
  { slug: 'oppenheimer-2023', title: 'Oppenheimer', year: 2023, type: 'movie', imdbId: 15398776, tmdbId: 872585, popularity: 88, description: 'Christopher Nolan biographical drama about J. Robert Oppenheimer.' },
  { slug: 'south-park-bigger-longer-uncut-1999', title: 'South Park: Bigger, Longer & Uncut', year: 1999, type: 'movie', imdbId: 158983, tmdbId: 9473, popularity: 82, description: 'Animated musical comedy based on the South Park television series.' },
  { slug: 'breaking-bad', title: 'Breaking Bad', year: 2008, type: 'tv', imdbId: 903747, tmdbId: 1396, popularity: 100, description: 'Crime drama series created by Vince Gilligan.' },
  { slug: 'game-of-thrones', title: 'Game of Thrones', year: 2011, type: 'tv', imdbId: 944947, tmdbId: 1399, popularity: 98, description: 'Fantasy drama series based on the novels by George R. R. Martin.' },
  { slug: 'stranger-things', title: 'Stranger Things', year: 2016, type: 'tv', imdbId: 4574334, tmdbId: 66732, popularity: 97, description: 'Science-fiction horror series created by the Duffer Brothers.' },
  { slug: 'the-last-of-us', title: 'The Last of Us', year: 2023, type: 'tv', imdbId: 3581920, tmdbId: 100088, popularity: 96, description: 'Post-apocalyptic drama series adapted from the video game.' },
  { slug: 'wednesday', title: 'Wednesday', year: 2022, type: 'tv', imdbId: 13443470, tmdbId: 119051, popularity: 94, description: 'Mystery comedy series centered on Wednesday Addams.' },
  { slug: 'south-park', title: 'South Park', year: 1997, type: 'tv', imdbId: 121955, tmdbId: 2190, popularity: 93, description: 'Animated satirical comedy series created by Trey Parker and Matt Stone.' },
  { slug: 'the-office-us', title: 'The Office', year: 2005, type: 'tv', imdbId: 386676, tmdbId: 2316, popularity: 92, description: 'American workplace mockumentary comedy series.' },
  { slug: 'friends', title: 'Friends', year: 1994, type: 'tv', imdbId: 108778, tmdbId: 1668, popularity: 91, description: 'American sitcom following six friends in New York City.' },
  { slug: 'chernobyl', title: 'Chernobyl', year: 2019, type: 'tv', imdbId: 7366338, tmdbId: 87108, popularity: 89, description: 'Historical drama miniseries about the 1986 nuclear disaster.' },
  { slug: 'the-boys', title: 'The Boys', year: 2019, type: 'tv', imdbId: 1190634, tmdbId: 76479, popularity: 90, description: 'Superhero satire series developed by Eric Kripke.' },
  { slug: 'house-of-the-dragon', title: 'House of the Dragon', year: 2022, type: 'tv', imdbId: 11198330, tmdbId: 94997, popularity: 90, description: 'Fantasy drama and prequel to Game of Thrones.' },
]

const API_URL = 'https://api.opensubtitles.com/api/v1/subtitles'
const languageQuery = catalogLanguages.map((language) => language.code).join(',')

export function getCatalogSeed(type: CatalogMediaType, slug: string) {
  return catalogSeeds.find((seed) => seed.type === type && seed.slug === slug)
}

export async function fetchCatalogResult(media: CatalogSeed): Promise<CatalogResult> {
  const key = process.env.OPENSUBTITLES_API_KEY
  if (!key) return { media, subtitles: [], total: 0, languageCounts: {}, fetched: false }
  const url = new URL(API_URL)
  url.searchParams.set(media.type === 'movie' ? 'imdb_id' : 'parent_imdb_id', String(media.imdbId))
  url.searchParams.set('languages', languageQuery)
  url.searchParams.set('per_page', '50')
  url.searchParams.set('page', '1')
  if (media.type === 'movie') url.searchParams.set('type', 'movie')

  try {
    let response: Response | null = null
    for (let attempt = 0; attempt < 3; attempt += 1) {
      response = await fetch(url, {
        headers: {
          'Api-Key': key,
          Accept: 'application/json',
          'User-Agent': 'SubtitleBot v1.0 (https://www.subtitlebot.com)',
        },
        next: { revalidate: 21_600, tags: [`subtitle-catalog-${media.type}-${media.slug}`] },
      })
      if (response.ok || (response.status !== 429 && response.status < 500)) break
      await new Promise((resolve) => setTimeout(resolve, 250 * (attempt + 1)))
    }
    if (!response) return { media, subtitles: [], total: 0, languageCounts: {}, fetched: false }
    if (!response.ok) return { media, subtitles: [], total: 0, languageCounts: {}, fetched: false }
    const data = await response.json()
    const subtitles: CatalogSubtitle[] = (Array.isArray(data.data) ? data.data : []).map((item: any) => ({
      id: String(item.id),
      language: String(item.attributes?.language || 'unknown'),
      release: String(item.attributes?.release || item.attributes?.feature_details?.movie_name || media.title),
      fps: Number.isFinite(Number(item.attributes?.fps)) && Number(item.attributes?.fps) > 0 ? Number(item.attributes.fps) : null,
      trusted: Boolean(item.attributes?.from_trusted),
      hearingImpaired: Boolean(item.attributes?.hearing_impaired),
      aiTranslated: Boolean(item.attributes?.ai_translated),
      machineTranslated: Boolean(item.attributes?.machine_translated),
      downloadCount: Number(item.attributes?.download_count || 0),
      sourceUrl: typeof item.attributes?.url === 'string' && item.attributes.url.startsWith('http') ? item.attributes.url : 'https://www.opensubtitles.com/',
      uploadDate: item.attributes?.upload_date ? String(item.attributes.upload_date) : null,
    }))
    const languageCounts = subtitles.reduce<Record<string, number>>((counts, subtitle) => {
      counts[subtitle.language] = (counts[subtitle.language] || 0) + 1
      return counts
    }, {})
    return { media, subtitles, total: Number(data.total_count || subtitles.length), languageCounts, fetched: true }
  } catch {
    return { media, subtitles: [], total: 0, languageCounts: {}, fetched: false }
  }
}

export function relatedCatalogSeeds(media: CatalogSeed, limit = 6) {
  return catalogSeeds.filter((seed) => seed.type === media.type && seed.slug !== media.slug).sort((a, b) => b.popularity - a.popularity).slice(0, limit)
}

export function getCatalogByType(type: CatalogMediaType) {
  return catalogSeeds.filter((seed) => seed.type === type).sort((a, b) => b.popularity - a.popularity)
}
