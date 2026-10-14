const assert = require('node:assert/strict')
const fs = require('node:fs')
const path = require('node:path')
const Module = require('node:module')
const ts = require('typescript')

// Compile the existing TS services without changing the app's runtime or adding dependencies.
require.extensions['.ts'] = (module, filename) => {
  const code = ts.transpileModule(fs.readFileSync(filename, 'utf8'), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022, esModuleInterop: true },
  }).outputText
  module._compile(code, filename)
}
const originalResolve = Module._resolveFilename
Module._resolveFilename = function (request, ...args) {
  return originalResolve.call(this, request.startsWith('@/') ? path.resolve('src', request.slice(2)) : request, ...args)
}
const live = process.argv.includes('--live')
if (live) require('@next/env').loadEnvConfig(process.cwd())
else process.env.GEMINI_API_KEY = 'test-only'

let reply = '1. שלום עולם.\n2. להתראות.'
const originalLoad = Module._load
if (!live) Module._load = function (request, ...args) {
  if (request === '@google/genai') return {
    ThinkingLevel: { MINIMAL: 'minimal' },
    GoogleGenAI: class { models = { generateContent: async () => {
      if (reply instanceof Error) throw reply
      return { text: reply }
    } } },
  }
  return originalLoad.call(this, request, ...args)
}

async function main() {
  const { PremiumTranslationService } = require('../src/lib/premium-translation-service.ts')
  const { SubtitleProcessor } = require('../src/lib/subtitle-processor.ts')
  const { resolveSubtitleTitles } = require('../src/lib/opensubtitles-title-search.ts')
  const { SUPPORTED_LANGUAGES } = require('../src/types/subtitle.ts')
  assert.ok(SUPPORTED_LANGUAGES.some(lang => lang.code === 'he'))
  const srt = '1\n00:00:01,000 --> 00:00:03,000\nHello world.\n\n2\n00:00:04,000 --> 00:00:06,000\nSee you tomorrow.'
  const entries = SubtitleProcessor.parseSubtitleFile(srt, 'test.srt')
  assert.equal(entries.length, 2)
  assert.equal(SubtitleProcessor.parseSubtitleFile('WEBVTT\n\n00:00:01.000 --> 00:00:03.000\nHello world.', 'test.vtt').length, 1)
  const translator = new PremiumTranslationService(process.env.GEMINI_API_KEY, 'standard')
  for (const language of live ? ['cs', 'he'] : ['he']) {
    const result = await translator.translateSubtitles(entries, language, 'auto', 'test.srt')
    assert.equal(result.length, entries.length)
    assert.deepEqual(result.map(x => [x.startTime, x.endTime]), entries.map(x => [x.startTime, x.endTime]))
    assert.ok(result.every((x, i) => x.text !== entries[i].text))
    if (language === 'he') assert.ok(result.every(x => /[\u0590-\u05ff]/.test(x.text)))
    console.log(JSON.stringify({ language, translations: result.map(x => x.text) }))
  }
  if (!live) {
    // Exercise the actual UI stream consumer, including errors previously swallowed as JSON errors.
    const source = fs.readFileSync('src/components/translation/translation-interface.tsx', 'utf8')
    const start = source.indexOf('  const handleStreamingResponse = ')
    const end = source.indexOf('  const handleTranslationComplete = ', start)
    const consumerCode = ts.transpileModule(source.slice(start, end), {
      compilerOptions: { target: ts.ScriptTarget.ES2022 },
    }).outputText
    let completed = null
    const consume = new Function('window', 'lastStreamStageRef', 'lastStreamProgressRef', 'updateProgress', 'handleTranslationComplete', consumerCode + '\nreturn handleStreamingResponse')(
      { subtitleCount: 2 }, { current: '' }, { current: 0 }, () => {}, async result => { completed = result },
    )
    await assert.rejects(() => consume(new Response('data: {"type":"error","message":"Insufficient credits"}\n\n')), /Insufficient credits/)
    await assert.rejects(() => consume(new Response('data: {"type":"progress","progress":10}\n\n')), /before a result/)
    await consume(new Response('data: {"type":"result","translatedContent":"שלום"}\n\n'))
    assert.equal(completed.translatedContent, 'שלום')
    for (const broken of ['1. Only one line.', '', new Error('Provider unavailable')]) {
      reply = broken
      await assert.rejects(() => translator.translateSubtitles(entries, 'he', 'en', 'test.srt'))
    }
    const urls = []
    const titles = await resolveSubtitleTitles('Superman', null, null, async url => {
      urls.push(new URL(url))
      return Response.json({ data: url.searchParams.get('type') === 'movie' ? [
        { attributes: { title: 'Superman', year: '1978', imdb_id: 78346 } },
        { attributes: { title: 'Superman', year: '2025', imdb_id: 5950044 } },
        { attributes: { title: 'Superman Returns', year: '2026', imdb_id: 99 } },
      ] : [] })
    })
    assert.equal(titles[0].imdbId, '5950044')
    assert.equal(titles.length, 2)
    assert.ok(urls.slice(0, 2).every(url => url.searchParams.get('query_match') === 'exact'))
  } else {
    const { GET } = require('../src/app/api/opensubtitles/search/route.ts')
    for (const [query, languages, expected] of [
      ['Wednesday', 'en', 13443470], ['Dune Part Two', 'en', 15239678],
      ['Superman', 'en', 5950044], ['Wednesday', 'he', 13443470],
    ]) {
      const response = await GET(new Request('http://localhost/api/opensubtitles/search?' + new URLSearchParams({ query, languages })))
      const body = await response.json()
      assert.equal(response.status, 200)
      assert.ok(body.data.length > 0, `${query}: no subtitles`)
      assert.ok(body.data.every(x => Number(x.attributes.feature_details.parent_imdb_id || x.attributes.feature_details.imdb_id) === expected), `${query}: wrong title`)
      assert.ok(body.data.every(x => x.attributes.language === languages))
      console.log(JSON.stringify({ query, languages, total: body.total_count, pages: body.total_pages, first: body.data[0].attributes.feature_details }))
    }
  }
  console.log('Feedback regression checks passed' + (live ? ' (live providers).' : '.'))
}
main().catch(error => { console.error(error); process.exitCode = 1 })
