import assert from 'node:assert/strict'
import { catalogSeeds, getOpenSubtitlesSourceUrl } from '../src/lib/subtitle-catalog.ts'

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

console.log('Subtitle catalog tests passed.')
