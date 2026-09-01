import assert from 'node:assert/strict'
import { catalogSeeds, getOpenSubtitlesSourceUrl, pickBestSubtitle } from '../src/lib/subtitle-catalog.ts'
import { detectPreferredLanguage, fromOpenSubtitlesLanguageCode, toOpenSubtitlesLanguageCodes } from '../src/lib/subtitle-catalog-languages.ts'

assert.equal(
  getOpenSubtitlesSourceUrl({
    url: 'https://www.opensubtitles.com/es/subtitles/13913612-dune-2021-bluray-2160p-proper-es-srt',
    slug: 'dune-2021-bluray-2160p-proper-es-srt',
  }),
  'https://www.opensubtitles.com/es/subtitles/13913612-dune-2021-bluray-2160p-proper-es-srt',
)

assert.equal(
  getOpenSubtitlesSourceUrl({ slug: 'dune-2021-1080p-hmax-web-dl-ddp5-1-atmos-x264-evo' }),
  'https://www.opensubtitles.com/en/subtitles/dune-2021-1080p-hmax-web-dl-ddp5-1-atmos-x264-evo',
)

assert.equal(getOpenSubtitlesSourceUrl(), 'https://www.opensubtitles.com/')

const slugs = catalogSeeds.map((seed) => `${seed.type}/${seed.slug}`)
const imdbIds = catalogSeeds.map((seed) => `${seed.type}/${seed.imdbId}`)

assert.equal(new Set(slugs).size, slugs.length, 'Catalog routes must be unique')
assert.equal(new Set(imdbIds).size, imdbIds.length, 'Catalog IMDb IDs must be unique within each media type')
assert.ok(catalogSeeds.some((seed) => seed.slug === 'dune-part-two-2024'))
assert.ok(catalogSeeds.some((seed) => seed.slug === '3-idiots-2009'))
assert.equal(catalogSeeds.filter((seed) => seed.type === 'movie').length, 40)

assert.deepEqual(toOpenSubtitlesLanguageCodes('pt'), ['pt-pt', 'pt-br'])
assert.deepEqual(toOpenSubtitlesLanguageCodes('zh'), ['zh-cn', 'zh-tw'])
assert.deepEqual(toOpenSubtitlesLanguageCodes('SK'), ['sk'])
assert.deepEqual(toOpenSubtitlesLanguageCodes('qu'), [], 'Languages missing from OpenSubtitles map to no codes')
assert.deepEqual(fromOpenSubtitlesLanguageCode('pt-br'), { code: 'pt', variant: 'BR' })
assert.deepEqual(fromOpenSubtitlesLanguageCode('en'), { code: 'en' })

const supported = new Set(['en', 'sk', 'tl', 'no', 'pt'])
assert.equal(detectPreferredLanguage(['sk-SK', 'en-US'], supported), 'sk')
assert.equal(detectPreferredLanguage(['fil-PH'], supported), 'tl')
assert.equal(detectPreferredLanguage(['nb-NO'], supported), 'no')
assert.equal(detectPreferredLanguage(['pt-BR'], supported), 'pt')
assert.equal(detectPreferredLanguage(['xx', 'yy-ZZ'], supported), null)

const sample = (overrides) => ({ id: '1', language: 'en', release: 'r', fps: null, trusted: false, hearingImpaired: false, aiTranslated: false, machineTranslated: false, downloadCount: 0, sourceUrl: 'https://www.opensubtitles.com/', uploadDate: null, ...overrides })
assert.equal(pickBestSubtitle([]), null)
assert.equal(pickBestSubtitle([sample({ id: 'a', downloadCount: 900, machineTranslated: true }), sample({ id: 'b', downloadCount: 10 }), sample({ id: 'c', trusted: true, downloadCount: 1 })]).id, 'c', 'Trusted files win')
assert.equal(pickBestSubtitle([sample({ id: 'a', downloadCount: 900, machineTranslated: true }), sample({ id: 'b', downloadCount: 10 })]).id, 'b', 'Human-made files beat machine translations')

console.log('Subtitle catalog tests passed.')
