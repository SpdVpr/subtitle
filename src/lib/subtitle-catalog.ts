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
  /** OpenSubtitles language codes seen in the current samples, most frequent first. */
  sampledLanguages: string[]
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
  { slug: 'the-godfather-part-ii-1974', title: 'The Godfather Part II', year: 1974, type: 'movie', imdbId: 71562, tmdbId: 240, popularity: 97, description: 'Francis Ford Coppola’s crime epic follows Michael Corleone while tracing Vito Corleone’s rise.' },
  { slug: 'the-lord-of-the-rings-the-two-towers-2002', title: 'The Lord of the Rings: The Two Towers', year: 2002, type: 'movie', imdbId: 167261, tmdbId: 121, popularity: 96, description: 'The second film in Peter Jackson’s Lord of the Rings trilogy.' },
  { slug: 'the-lord-of-the-rings-the-return-of-the-king-2003', title: 'The Lord of the Rings: The Return of the King', year: 2003, type: 'movie', imdbId: 167260, tmdbId: 122, popularity: 97, description: 'The concluding film in Peter Jackson’s Lord of the Rings trilogy.' },
  { slug: 'dune-part-two-2024', title: 'Dune: Part Two', year: 2024, type: 'movie', imdbId: 15239678, tmdbId: 693134, popularity: 96, description: 'Denis Villeneuve’s continuation of Paul Atreides’ journey on Arrakis.' },
  { slug: 'forrest-gump-1994', title: 'Forrest Gump', year: 1994, type: 'movie', imdbId: 109830, tmdbId: 13, popularity: 96, description: 'Robert Zemeckis drama following one man through decades of American history.' },
  { slug: 'se7en-1995', title: 'Se7en', year: 1995, type: 'movie', imdbId: 114369, tmdbId: 807, popularity: 95, description: 'David Fincher crime thriller about detectives pursuing a serial killer.' },
  { slug: 'the-silence-of-the-lambs-1991', title: 'The Silence of the Lambs', year: 1991, type: 'movie', imdbId: 102926, tmdbId: 274, popularity: 94, description: 'Psychological thriller centered on Clarice Starling and Hannibal Lecter.' },
  { slug: 'saving-private-ryan-1998', title: 'Saving Private Ryan', year: 1998, type: 'movie', imdbId: 120815, tmdbId: 857, popularity: 94, description: 'Steven Spielberg war drama following a squad sent behind enemy lines.' },
  { slug: 'the-green-mile-1999', title: 'The Green Mile', year: 1999, type: 'movie', imdbId: 120689, tmdbId: 497, popularity: 94, description: 'Supernatural prison drama adapted from the novel by Stephen King.' },
  { slug: 'terminator-2-judgment-day-1991', title: 'Terminator 2: Judgment Day', year: 1991, type: 'movie', imdbId: 103064, tmdbId: 280, popularity: 95, description: 'James Cameron science-fiction action sequel starring Arnold Schwarzenegger.' },
  { slug: 'back-to-the-future-1985', title: 'Back to the Future', year: 1985, type: 'movie', imdbId: 88763, tmdbId: 105, popularity: 93, description: 'Time-travel adventure directed by Robert Zemeckis.' },
  { slug: 'goodfellas-1990', title: 'Goodfellas', year: 1990, type: 'movie', imdbId: 99685, tmdbId: 769, popularity: 93, description: 'Martin Scorsese crime drama chronicling life inside the mob.' },
  { slug: 'whiplash-2014', title: 'Whiplash', year: 2014, type: 'movie', imdbId: 2582802, tmdbId: 244786, popularity: 92, description: 'Intense drama about a jazz drummer and his demanding instructor.' },
  { slug: 'joker-2019', title: 'Joker', year: 2019, type: 'movie', imdbId: 7286456, tmdbId: 475557, popularity: 96, description: 'Psychological crime drama starring Joaquin Phoenix as Arthur Fleck.' },
  { slug: 'the-batman-2022', title: 'The Batman', year: 2022, type: 'movie', imdbId: 1877830, tmdbId: 414906, popularity: 95, description: 'Matt Reeves detective thriller starring Robert Pattinson as Batman.' },
  { slug: 'spider-man-no-way-home-2021', title: 'Spider-Man: No Way Home', year: 2021, type: 'movie', imdbId: 10872600, tmdbId: 634649, popularity: 95, description: 'Marvel multiverse adventure starring Tom Holland as Spider-Man.' },
  { slug: 'top-gun-maverick-2022', title: 'Top Gun: Maverick', year: 2022, type: 'movie', imdbId: 1745960, tmdbId: 361743, popularity: 92, description: 'Aviation action drama in which Pete Mitchell trains a new generation of pilots.' },
  { slug: 'barbie-2023', title: 'Barbie', year: 2023, type: 'movie', imdbId: 1517268, tmdbId: 346698, popularity: 94, description: 'Greta Gerwig fantasy comedy starring Margot Robbie and Ryan Gosling.' },
  { slug: '3-idiots-2009', title: '3 Idiots', year: 2009, type: 'movie', imdbId: 1187043, tmdbId: 20453, popularity: 94, description: 'Indian comedy-drama about friendship, education, and personal ambition.' },
  { slug: 'rrr-2022', title: 'RRR', year: 2022, type: 'movie', imdbId: 8178634, tmdbId: 579974, popularity: 92, description: 'S. S. Rajamouli’s Telugu-language historical action epic.' },
  { slug: 'avatar-the-way-of-water-2022', title: 'Avatar: The Way of Water', year: 2022, type: 'movie', imdbId: 1630029, tmdbId: 76600, popularity: 95, description: 'James Cameron’s science-fiction sequel returning to the world of Pandora.' },
  { slug: 'everything-everywhere-all-at-once-2022', title: 'Everything Everywhere All at Once', year: 2022, type: 'movie', imdbId: 6710474, tmdbId: 545611, popularity: 91, description: 'Multiverse action comedy-drama starring Michelle Yeoh.' },
  { slug: 'deadpool-and-wolverine-2024', title: 'Deadpool & Wolverine', year: 2024, type: 'movie', imdbId: 6263850, tmdbId: 533535, popularity: 94, description: 'Marvel action comedy bringing Deadpool and Wolverine together.' },
  { slug: 'inside-out-2-2024', title: 'Inside Out 2', year: 2024, type: 'movie', imdbId: 22022452, tmdbId: 1022789, popularity: 92, description: 'Pixar sequel exploring new emotions during Riley’s teenage years.' },
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

export interface CatalogLanguageAvailability {
  total: number
  humanCount: number
  machineOnly: boolean
  best: CatalogSubtitle | null
  fetched: boolean
}

const API_URL = 'https://api.opensubtitles.com/api/v1/subtitles'
const OPENSUBTITLES_URL = 'https://www.opensubtitles.com'
const CACHE_SECONDS = 21_600
const languageQuery = catalogLanguages.map((language) => language.code).join(',')

interface OpenSubtitlesSourceAttributes {
  url?: unknown
  slug?: unknown
}

export function getOpenSubtitlesSourceUrl(attributes?: OpenSubtitlesSourceAttributes): string {
  if (typeof attributes?.url === 'string' && attributes.url.startsWith('http')) {
    return attributes.url
  }

  const slug = typeof attributes?.slug === 'string' ? attributes.slug.trim() : ''
  if (slug) {
    return `${OPENSUBTITLES_URL}/en/subtitles/${encodeURIComponent(slug)}`
  }

  return `${OPENSUBTITLES_URL}/`
}

export function getCatalogSeed(type: CatalogMediaType, slug: string) {
  return catalogSeeds.find((seed) => seed.type === type && seed.slug === slug)
}

function emptyResult(media: CatalogSeed): CatalogResult {
  return { media, subtitles: [], total: 0, languageCounts: {}, sampledLanguages: [], fetched: false }
}

function buildSearchUrl(media: CatalogSeed, languages?: string) {
  const url = new URL(API_URL)
  url.searchParams.set(media.type === 'movie' ? 'imdb_id' : 'parent_imdb_id', String(media.imdbId))
  if (languages) url.searchParams.set('languages', languages)
  url.searchParams.set('per_page', '50')
  url.searchParams.set('page', '1')
  if (media.type === 'movie') url.searchParams.set('type', 'movie')
  return url
}

function parseSubtitles(data: any, fallbackRelease: string): CatalogSubtitle[] {
  return (Array.isArray(data?.data) ? data.data : []).map((item: any) => ({
    id: String(item.id),
    language: String(item.attributes?.language || 'unknown').toLowerCase(),
    release: String(item.attributes?.release || item.attributes?.feature_details?.movie_name || fallbackRelease),
    fps: Number.isFinite(Number(item.attributes?.fps)) && Number(item.attributes?.fps) > 0 ? Number(item.attributes.fps) : null,
    trusted: Boolean(item.attributes?.from_trusted),
    hearingImpaired: Boolean(item.attributes?.hearing_impaired),
    aiTranslated: Boolean(item.attributes?.ai_translated),
    machineTranslated: Boolean(item.attributes?.machine_translated),
    downloadCount: Number(item.attributes?.download_count || 0),
    sourceUrl: getOpenSubtitlesSourceUrl(item.attributes),
    uploadDate: item.attributes?.upload_date ? String(item.attributes.upload_date) : null,
  }))
}

function countLanguages(subtitles: CatalogSubtitle[]) {
  return subtitles.reduce<Record<string, number>>((counts, subtitle) => {
    counts[subtitle.language] = (counts[subtitle.language] || 0) + 1
    return counts
  }, {})
}

/** One cached OpenSubtitles search. Returns null on any non-OK response after retries. */
async function fetchOpenSubtitles(url: URL, key: string, tag: string, fallbackRelease: string): Promise<{ total: number; subtitles: CatalogSubtitle[] } | null> {
  let response: Response | null = null
  for (let attempt = 0; attempt < 3; attempt += 1) {
    response = await fetch(url, {
      headers: {
        'Api-Key': key,
        Accept: 'application/json',
        'User-Agent': 'SubtitleBot v1.0 (https://www.subtitlebot.com)',
      },
      next: { revalidate: CACHE_SECONDS, tags: [tag] },
    })
    if (response.ok || (response.status !== 429 && response.status < 500)) break
    await new Promise((resolve) => setTimeout(resolve, 400 * (attempt + 1)))
  }
  if (!response?.ok) return null
  const data = await response.json()
  const subtitles = parseSubtitles(data, fallbackRelease)
  return { total: Number(data.total_count || subtitles.length), subtitles }
}

/** Trusted first, then human-made, then most downloaded. */
export function pickBestSubtitle(subtitles: CatalogSubtitle[]): CatalogSubtitle | null {
  const human = (subtitle: CatalogSubtitle) => Number(!(subtitle.aiTranslated || subtitle.machineTranslated))
  return [...subtitles].sort((a, b) => Number(b.trusted) - Number(a.trusted) || human(b) - human(a) || b.downloadCount - a.downloadCount)[0] || null
}

export async function fetchCatalogResult(media: CatalogSeed): Promise<CatalogResult> {
  const key = process.env.OPENSUBTITLES_API_KEY
  if (!key) return emptyResult(media)

  try {
    const tag = `subtitle-catalog-${media.type}-${media.slug}`
    const primary = await fetchOpenSubtitles(buildSearchUrl(media, languageQuery), key, tag, media.title)
    if (!primary) return emptyResult(media)

    // A second, unfiltered sample widens the list of languages the page can show.
    // It is best-effort: when it fails we still have the catalog-language sample.
    const broad = await fetchOpenSubtitles(buildSearchUrl(media), key, `${tag}-all`, media.title).catch(() => null)
    const merged = new Map<string, CatalogSubtitle>()
    for (const subtitle of [...primary.subtitles, ...(broad?.subtitles || [])]) merged.set(subtitle.id, subtitle)
    const sampledLanguages = Object.entries(countLanguages([...merged.values()]))
      .sort((a, b) => b[1] - a[1])
      .map(([code]) => code)

    return {
      media,
      subtitles: primary.subtitles,
      total: broad?.total ?? primary.total,
      languageCounts: countLanguages(primary.subtitles),
      sampledLanguages,
      fetched: true,
    }
  } catch {
    return emptyResult(media)
  }
}

/** Live availability of one language for a title. `osCodes` are OpenSubtitles language codes (see subtitle-catalog-languages). */
export async function fetchCatalogLanguageAvailability(media: CatalogSeed, osCodes: string[]): Promise<CatalogLanguageAvailability> {
  const none: CatalogLanguageAvailability = { total: 0, humanCount: 0, machineOnly: false, best: null, fetched: false }
  const key = process.env.OPENSUBTITLES_API_KEY
  if (!key || !osCodes.length) return none

  try {
    const codes = osCodes.join(',')
    const result = await fetchOpenSubtitles(buildSearchUrl(media, codes), key, `subtitle-catalog-${media.type}-${media.slug}-${codes.replace(/,/g, '-')}`, media.title)
    if (!result) return none
    const human = result.subtitles.filter((subtitle) => !subtitle.aiTranslated && !subtitle.machineTranslated)
    return {
      total: result.total,
      humanCount: human.length,
      machineOnly: result.total > 0 && human.length === 0,
      best: pickBestSubtitle(human.length ? human : result.subtitles),
      fetched: true,
    }
  } catch {
    return none
  }
}

export function relatedCatalogSeeds(media: CatalogSeed, limit = 6) {
  return catalogSeeds.filter((seed) => seed.type === media.type && seed.slug !== media.slug).sort((a, b) => b.popularity - a.popularity).slice(0, limit)
}

export function getCatalogByType(type: CatalogMediaType) {
  return catalogSeeds.filter((seed) => seed.type === type).sort((a, b) => b.popularity - a.popularity)
}
