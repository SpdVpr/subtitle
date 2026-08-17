import fs from 'node:fs'
import path from 'node:path'

const input = process.argv[2]
if (!input) {
  console.error('Usage: npm run seo:gsc -- path/to/Queries.csv')
  process.exit(1)
}

function parseCsv(text) {
  const rows = []
  let row = [], value = '', quoted = false
  for (let i = 0; i < text.length; i += 1) {
    const char = text[i]
    if (char === '"' && quoted && text[i + 1] === '"') { value += '"'; i += 1 }
    else if (char === '"') quoted = !quoted
    else if (char === ',' && !quoted) { row.push(value); value = '' }
    else if ((char === '\n' || char === '\r') && !quoted) {
      if (char === '\r' && text[i + 1] === '\n') i += 1
      row.push(value); value = ''
      if (row.some((cell) => cell.trim())) rows.push(row)
      row = []
    } else value += char
  }
  if (value || row.length) { row.push(value); rows.push(row) }
  return rows
}

function number(value = '') {
  const normalized = String(value).replace(/\s/g, '').replace('%', '').replace(',', '.')
  const result = Number(normalized)
  return Number.isFinite(result) ? result : 0
}

function findColumn(headers, candidates) {
  const lowered = headers.map((header) => header.trim().toLowerCase())
  return lowered.findIndex((header) => candidates.some((candidate) => header === candidate || header.includes(candidate)))
}

const clusters = [
  ['finder', /find|search|seek|hled|vyhled/i],
  ['movie', /movie|film/i],
  ['tv', /\btv\b|series|show|seri/i],
  ['anime', /anime|jimaku/i],
  ['english', /english|angli/i],
  ['translation', /translat|překlad|preklad/i],
  ['sync', /sync|timing|delay|offset|fps|časov|posun/i],
  ['format', /\bsrt\b|\bvtt\b|\bass\b|format|convert/i],
]

const text = fs.readFileSync(path.resolve(input), 'utf8').replace(/^\uFEFF/, '')
const rows = parseCsv(text)
if (rows.length < 2) throw new Error('CSV does not contain data rows.')
const headers = rows[0]
const queryIndex = findColumn(headers, ['query', 'dotaz', 'top queries'])
const clickIndex = findColumn(headers, ['clicks', 'click', 'kliknutí', 'kliknuti', 'prokliky'])
const impressionIndex = findColumn(headers, ['impressions', 'impression', 'zobrazení', 'zobrazeni'])
const positionIndex = findColumn(headers, ['position', 'pozice'])
if ([queryIndex, clickIndex, impressionIndex].some((index) => index < 0)) throw new Error(`Required columns not found. Headers: ${headers.join(', ')}`)

const data = rows.slice(1).map((row) => ({
  query: row[queryIndex]?.trim() || '',
  clicks: number(row[clickIndex]),
  impressions: number(row[impressionIndex]),
  position: positionIndex >= 0 ? number(row[positionIndex]) : 0,
})).filter((row) => row.query)

const totals = data.reduce((sum, row) => ({ clicks: sum.clicks + row.clicks, impressions: sum.impressions + row.impressions }), { clicks: 0, impressions: 0 })
console.log('\nGSC query summary')
console.log(`Rows: ${data.length.toLocaleString()}`)
console.log(`Clicks: ${totals.clicks.toLocaleString()}`)
console.log(`Impressions: ${totals.impressions.toLocaleString()}`)
console.log(`Weighted CTR: ${totals.impressions ? (totals.clicks / totals.impressions * 100).toFixed(2) : '0.00'}%`)

console.log('\nClusters')
for (const [name, pattern] of clusters) {
  const matched = data.filter((row) => pattern.test(row.query))
  const clicks = matched.reduce((sum, row) => sum + row.clicks, 0)
  const impressions = matched.reduce((sum, row) => sum + row.impressions, 0)
  console.log(`${name.padEnd(12)} ${String(matched.length).padStart(5)} queries  ${String(clicks).padStart(8)} clicks  ${impressions ? (clicks / impressions * 100).toFixed(2) : '0.00'}% CTR`)
}

console.log('\nHighest-impact ranking opportunities (positions 4–15)')
data.filter((row) => row.position >= 4 && row.position <= 15 && row.impressions >= 100)
  .sort((a, b) => b.impressions - a.impressions)
  .slice(0, 30)
  .forEach((row) => console.log(`${row.query.slice(0, 48).padEnd(50)} ${String(row.impressions).padStart(8)} imp  ${String(row.clicks).padStart(6)} clicks  pos ${row.position.toFixed(1)}`))

console.log('\nCTR opportunities (at least 500 impressions, below 5% CTR)')
data.filter((row) => row.impressions >= 500 && row.clicks / row.impressions < 0.05)
  .sort((a, b) => b.impressions - a.impressions)
  .slice(0, 30)
  .forEach((row) => console.log(`${row.query.slice(0, 48).padEnd(50)} ${String(row.impressions).padStart(8)} imp  ${(row.clicks / row.impressions * 100).toFixed(2)}% CTR`))
