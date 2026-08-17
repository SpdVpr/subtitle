import assert from 'node:assert/strict'
import { analyzeReadability, detectEncoding, parseSubtitle, serializeSubtitle, transformTiming } from '../src/lib/subtitle-tools.ts'

const srt = `1\n00:00:01,000 --> 00:00:03,000\nHello world.\n\n2\n00:00:04,000 --> 00:00:05,000\nA fast subtitle line.`
const parsed = parseSubtitle(srt)
assert.equal(parsed.format, 'srt')
assert.equal(parsed.cues.length, 2)
assert.deepEqual(parsed.errors, [])

const shifted = transformTiming(parsed.cues, 500, 24, 25)
assert.equal(Math.round(shifted[0].startMs), 1460)
assert.match(serializeSubtitle(shifted, 'srt'), /00:00:01,460 --> 00:00:03,380/)

const vtt = serializeSubtitle(parsed.cues, 'vtt')
assert.ok(vtt.startsWith('WEBVTT'))
assert.equal(parseSubtitle(vtt).cues.length, 2)

const metrics = analyzeReadability(parsed.cues)
assert.equal(metrics.length, 2)
assert.ok(metrics[1].cps > metrics[0].cps)

const utf8 = new TextEncoder().encode('Příliš žluťoučký kůň')
assert.equal(detectEncoding(utf8.buffer).encoding, 'UTF-8')

const invalid = parseSubtitle('1\n00:00:05,000 --> 00:00:03,000\nBroken')
assert.equal(invalid.errors.length, 1)

console.log('Subtitle tool tests passed.')
