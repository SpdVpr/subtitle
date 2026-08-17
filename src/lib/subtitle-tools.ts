export type SubtitleFormat = 'srt' | 'vtt'

export interface SubtitleCue {
  id?: string
  startMs: number
  endMs: number
  text: string
  settings?: string
  sourceBlock: number
}

export interface ParsedSubtitle {
  format: SubtitleFormat
  cues: SubtitleCue[]
  errors: string[]
  warnings: string[]
}

export interface CueMetric {
  cue: SubtitleCue
  characters: number
  durationSeconds: number
  cps: number
  longestLine: number
}

export function parseTimestamp(value: string): number | null {
  const clean = value.trim().replace(',', '.')
  const parts = clean.split(':')
  if (parts.length < 2 || parts.length > 3) return null
  const secondsPart = Number(parts.pop())
  const minutes = Number(parts.pop())
  const hours = parts.length ? Number(parts.pop()) : 0
  if (![hours, minutes, secondsPart].every(Number.isFinite)) return null
  if (hours < 0 || minutes < 0 || minutes >= 60 || secondsPart < 0 || secondsPart >= 60) return null
  return Math.round((hours * 3600 + minutes * 60 + secondsPart) * 1000)
}

export function formatTimestamp(ms: number, format: SubtitleFormat): string {
  const safe = Math.max(0, Math.round(ms))
  const hours = Math.floor(safe / 3_600_000)
  const minutes = Math.floor((safe % 3_600_000) / 60_000)
  const seconds = Math.floor((safe % 60_000) / 1000)
  const millis = safe % 1000
  const separator = format === 'srt' ? ',' : '.'
  return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}${separator}${String(millis).padStart(3, '0')}`
}

export function parseSubtitle(input: string): ParsedSubtitle {
  const normalized = input.replace(/^\uFEFF/, '').replace(/\r\n?/g, '\n').trim()
  const format: SubtitleFormat = /^WEBVTT(?:\s|$)/i.test(normalized) ? 'vtt' : 'srt'
  const errors: string[] = []
  const warnings: string[] = []
  const cues: SubtitleCue[] = []

  if (!normalized) return { format, cues, errors: ['The subtitle file is empty.'], warnings }

  const blocks = normalized.split(/\n{2,}/)
  blocks.forEach((block, blockIndex) => {
    const lines = block.split('\n').map((line) => line.trimEnd())
    if (format === 'vtt' && blockIndex === 0 && /^WEBVTT/i.test(lines[0] || '')) return
    if (/^(NOTE|STYLE|REGION)(?:\s|$)/.test(lines[0] || '')) return

    const timingIndex = lines.findIndex((line) => line.includes('-->'))
    if (timingIndex === -1) {
      if (lines.some((line) => line.trim())) warnings.push(`Block ${blockIndex + 1} has no timing line and was skipped.`)
      return
    }

    const [startRaw, rightRaw = ''] = lines[timingIndex].split(/\s+-->\s+/)
    const [endRaw, ...settings] = rightRaw.trim().split(/\s+/)
    const startMs = parseTimestamp(startRaw)
    const endMs = parseTimestamp(endRaw)
    if (startMs === null || endMs === null) {
      errors.push(`Block ${blockIndex + 1} contains an invalid timestamp.`)
      return
    }
    if (endMs <= startMs) errors.push(`Block ${blockIndex + 1} ends before or at its start time.`)

    const text = lines.slice(timingIndex + 1).join('\n').trim()
    if (!text) warnings.push(`Block ${blockIndex + 1} has no subtitle text.`)

    cues.push({
      id: timingIndex > 0 ? lines[timingIndex - 1].trim() : undefined,
      startMs,
      endMs,
      text,
      settings: settings.join(' ') || undefined,
      sourceBlock: blockIndex + 1,
    })
  })

  for (let index = 1; index < cues.length; index += 1) {
    if (cues[index].startMs < cues[index - 1].startMs) warnings.push(`Cue ${index + 1} starts before the previous cue.`)
    if (cues[index].startMs < cues[index - 1].endMs) warnings.push(`Cue ${index + 1} overlaps the previous cue.`)
  }

  if (!cues.length && !errors.length) errors.push('No subtitle cues were found.')
  return { format, cues, errors, warnings }
}

export function serializeSubtitle(cues: SubtitleCue[], format: SubtitleFormat): string {
  const body = cues.map((cue, index) => {
    const timing = `${formatTimestamp(cue.startMs, format)} --> ${formatTimestamp(cue.endMs, format)}${format === 'vtt' && cue.settings ? ` ${cue.settings}` : ''}`
    if (format === 'vtt') return `${cue.id && !/^\d+$/.test(cue.id) ? `${cue.id}\n` : ''}${timing}\n${cue.text}`
    return `${index + 1}\n${timing}\n${cue.text}`
  }).join('\n\n')
  return format === 'vtt' ? `WEBVTT\n\n${body}\n` : `${body}\n`
}

export function transformTiming(cues: SubtitleCue[], offsetMs: number, sourceFps: number, targetFps: number): SubtitleCue[] {
  const ratio = sourceFps > 0 && targetFps > 0 ? sourceFps / targetFps : 1
  return cues.map((cue) => ({
    ...cue,
    startMs: Math.max(0, cue.startMs * ratio + offsetMs),
    endMs: Math.max(1, cue.endMs * ratio + offsetMs),
  }))
}

export function analyzeReadability(cues: SubtitleCue[]): CueMetric[] {
  return cues.map((cue) => {
    const plainText = cue.text.replace(/<[^>]+>|\{[^}]+\}/g, '').replace(/\n/g, ' ').trim()
    const characters = plainText.length
    const durationSeconds = Math.max(0.001, (cue.endMs - cue.startMs) / 1000)
    return {
      cue,
      characters,
      durationSeconds,
      cps: characters / durationSeconds,
      longestLine: Math.max(0, ...cue.text.split('\n').map((line) => line.replace(/<[^>]+>|\{[^}]+\}/g, '').length)),
    }
  })
}

export function detectEncoding(buffer: ArrayBuffer): { encoding: string; confidence: string; text: string; note: string } {
  const bytes = new Uint8Array(buffer)
  if (bytes[0] === 0xef && bytes[1] === 0xbb && bytes[2] === 0xbf) {
    return { encoding: 'UTF-8 with BOM', confidence: 'high', text: new TextDecoder('utf-8').decode(bytes.slice(3)), note: 'A UTF-8 byte-order mark was found.' }
  }
  if (bytes[0] === 0xff && bytes[1] === 0xfe) {
    return { encoding: 'UTF-16 LE', confidence: 'high', text: new TextDecoder('utf-16le').decode(bytes.slice(2)), note: 'A UTF-16 little-endian byte-order mark was found.' }
  }
  if (bytes[0] === 0xfe && bytes[1] === 0xff) {
    const swapped = new Uint8Array(bytes.length - 2)
    for (let i = 2; i + 1 < bytes.length; i += 2) { swapped[i - 2] = bytes[i + 1]; swapped[i - 1] = bytes[i] }
    return { encoding: 'UTF-16 BE', confidence: 'high', text: new TextDecoder('utf-16le').decode(swapped), note: 'A UTF-16 big-endian byte-order mark was found.' }
  }
  try {
    const text = new TextDecoder('utf-8', { fatal: true }).decode(bytes)
    return { encoding: 'UTF-8', confidence: 'high', text, note: 'Every byte sequence is valid UTF-8.' }
  } catch {
    const text = new TextDecoder('windows-1252').decode(bytes)
    return { encoding: 'Legacy single-byte encoding', confidence: 'medium', text, note: 'The file is not valid UTF-8. It was decoded as Windows-1252 for preview; Central European files may require Windows-1250.' }
  }
}
