'use client'

import { useMemo, useState } from 'react'
import { AlertTriangle, CheckCircle2, Download, FileUp, RefreshCw, ShieldCheck } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import type { ToolDefinition } from '@/content/tools'
import { analyzeReadability, detectEncoding, parseSubtitle, serializeSubtitle, SubtitleFormat, transformTiming } from '@/lib/subtitle-tools'
import { analytics } from '@/lib/analytics'

const sample = `1
00:00:03,500 --> 00:00:06,200
Where are we going?

2
00:00:07,000 --> 00:00:09,200
We are going home.
`

function saveFile(content: string, filename: string) {
  const url = URL.createObjectURL(new Blob([content], { type: 'text/plain;charset=utf-8' }))
  const anchor = document.createElement('a')
  anchor.href = url
  anchor.download = filename
  anchor.click()
  setTimeout(() => URL.revokeObjectURL(url), 1000)
}

export function SubtitleWorkbench({ tool }: { tool: ToolDefinition }) {
  const isCs = tool.locale === 'cs'
  const [source, setSource] = useState('')
  const [filename, setFilename] = useState('subtitles.srt')
  const [offset, setOffset] = useState(0)
  const [sourceFps, setSourceFps] = useState(24)
  const [targetFps, setTargetFps] = useState(24)
  const [outputFormat, setOutputFormat] = useState<SubtitleFormat>('vtt')
  const [maxCps, setMaxCps] = useState(20)
  const [maxLine, setMaxLine] = useState(42)
  const [encodingResult, setEncodingResult] = useState<ReturnType<typeof detectEncoding> | null>(null)

  const parsed = useMemo(() => parseSubtitle(source), [source])
  const metrics = useMemo(() => analyzeReadability(parsed.cues), [parsed.cues])
  const transformed = useMemo(() => transformTiming(parsed.cues, Number(offset) || 0, Number(sourceFps) || 1, Number(targetFps) || 1), [parsed.cues, offset, sourceFps, targetFps])
  const syncOutput = source ? serializeSubtitle(transformed, parsed.format) : ''
  const convertedOutput = source ? serializeSubtitle(parsed.cues, outputFormat) : ''

  const loadTextFile = async (file: File) => {
    setFilename(file.name)
    if (tool.mode === 'encoding') {
      const result = detectEncoding(await file.arrayBuffer())
      setEncodingResult(result)
      setSource(result.text)
    } else {
      setSource(await file.text())
    }
    analytics.subtitleToolUsed(tool.mode)
  }

  const downloadResult = (content: string, extension: string) => {
    const base = filename.replace(/\.[^.]+$/, '') || 'subtitles'
    saveFile(content, `${base}-${tool.mode}.${extension}`)
    analytics.subtitleToolExported(tool.mode)
  }

  const fileControl = (
    <div className="rounded-xl border-2 border-dashed p-5 text-center bg-muted/20">
      <FileUp className="h-7 w-7 mx-auto text-primary mb-3" />
      <label className="font-semibold cursor-pointer text-primary hover:underline">
        {isCs ? 'Vybrat subtitle soubor' : 'Choose a subtitle file'}
        <input type="file" accept=".srt,.vtt,.txt,.sub" className="sr-only" onChange={(event) => event.target.files?.[0] && loadTextFile(event.target.files[0])} />
      </label>
      <p className="text-xs text-muted-foreground mt-2">{isCs ? 'Soubor zůstává ve vašem prohlížeči.' : 'The file stays in your browser.'}</p>
    </div>
  )

  if (tool.mode === 'encoding') {
    return (
      <div className="space-y-6">
        {fileControl}
        {encodingResult ? (
          <>
            <div className="grid gap-4 sm:grid-cols-3">
              <div className="rounded-xl border p-4"><div className="text-xs text-muted-foreground mb-1">{isCs ? 'Kódování' : 'Encoding'}</div><div className="font-bold">{encodingResult.encoding}</div></div>
              <div className="rounded-xl border p-4"><div className="text-xs text-muted-foreground mb-1">{isCs ? 'Jistota' : 'Confidence'}</div><div className="font-bold capitalize">{encodingResult.confidence}</div></div>
              <div className="rounded-xl border p-4"><div className="text-xs text-muted-foreground mb-1">{isCs ? 'Znaky' : 'Characters'}</div><div className="font-bold">{encodingResult.text.length.toLocaleString()}</div></div>
            </div>
            <p className="text-sm text-muted-foreground">{encodingResult.note}</p>
            <Textarea value={source} onChange={(event) => setSource(event.target.value)} rows={14} className="font-mono text-sm" aria-label={isCs ? 'Dekódovaný text' : 'Decoded subtitle text'} />
            <Button onClick={() => downloadResult(source.replace(/^\uFEFF/, ''), 'srt')}><Download className="h-4 w-4 mr-2" />{isCs ? 'Stáhnout jako UTF-8' : 'Download as UTF-8'}</Button>
          </>
        ) : <p className="text-center text-muted-foreground">{isCs ? 'Vyberte soubor pro detekci kódování.' : 'Choose a file to detect its encoding.'}</p>}
      </div>
    )
  }

  return (
    <div className="space-y-7">
      {fileControl}
      <div className="flex flex-wrap gap-3">
        <Button variant="outline" size="sm" onClick={() => { setSource(sample); setFilename('example.srt') }}>{isCs ? 'Vložit ukázku' : 'Load example'}</Button>
        <Button variant="ghost" size="sm" onClick={() => { setSource(''); setEncodingResult(null) }}><RefreshCw className="h-4 w-4 mr-2" />{isCs ? 'Vymazat' : 'Clear'}</Button>
      </div>
      <div>
        <label htmlFor="subtitle-source" className="block font-semibold mb-2">{isCs ? 'Obsah titulků' : 'Subtitle content'}</label>
        <Textarea id="subtitle-source" value={source} onChange={(event) => setSource(event.target.value)} rows={14} className="font-mono text-sm" placeholder={isCs ? 'Vložte SRT nebo WebVTT…' : 'Paste SRT or WebVTT…'} />
      </div>

      {source && (
        <div className="grid gap-3 sm:grid-cols-4">
          <div className="rounded-lg bg-muted/50 p-3"><div className="text-xs text-muted-foreground">{isCs ? 'Formát' : 'Format'}</div><div className="font-bold uppercase">{parsed.format}</div></div>
          <div className="rounded-lg bg-muted/50 p-3"><div className="text-xs text-muted-foreground">Cue</div><div className="font-bold">{parsed.cues.length}</div></div>
          <div className="rounded-lg bg-muted/50 p-3"><div className="text-xs text-muted-foreground">{isCs ? 'Chyby' : 'Errors'}</div><div className="font-bold text-red-600">{parsed.errors.length}</div></div>
          <div className="rounded-lg bg-muted/50 p-3"><div className="text-xs text-muted-foreground">{isCs ? 'Varování' : 'Warnings'}</div><div className="font-bold text-amber-600">{parsed.warnings.length}</div></div>
        </div>
      )}

      {tool.mode === 'sync' && (
        <>
          <div className="grid gap-4 sm:grid-cols-3">
            <div><label htmlFor="offset" className="block text-sm font-semibold mb-2">{isCs ? 'Posun (ms)' : 'Offset (ms)'}</label><Input id="offset" type="number" value={offset} onChange={(event) => setOffset(Number(event.target.value))} /></div>
            <div><label htmlFor="source-fps" className="block text-sm font-semibold mb-2">{isCs ? 'Zdrojové FPS' : 'Source FPS'}</label><Input id="source-fps" type="number" step="0.001" value={sourceFps} onChange={(event) => setSourceFps(Number(event.target.value))} /></div>
            <div><label htmlFor="target-fps" className="block text-sm font-semibold mb-2">{isCs ? 'Cílové FPS' : 'Target FPS'}</label><Input id="target-fps" type="number" step="0.001" value={targetFps} onChange={(event) => setTargetFps(Number(event.target.value))} /></div>
          </div>
          {syncOutput && <Textarea value={syncOutput} readOnly rows={10} className="font-mono text-sm" aria-label={isCs ? 'Náhled opravených titulků' : 'Corrected subtitle preview'} />}
          <Button disabled={!parsed.cues.length || parsed.errors.length > 0} onClick={() => downloadResult(syncOutput, parsed.format)}><Download className="h-4 w-4 mr-2" />{isCs ? 'Stáhnout opravený soubor' : 'Download corrected file'}</Button>
        </>
      )}

      {tool.mode === 'validator' && source && (
        <div className="space-y-5">
          {parsed.errors.length === 0 ? <div className="flex gap-3 rounded-xl border border-green-200 bg-green-50 dark:bg-green-950/20 p-4"><ShieldCheck className="h-6 w-6 text-green-600 shrink-0" /><div><div className="font-bold">{isCs ? 'Nebyla nalezena strukturální chyba' : 'No structural errors found'}</div><p className="text-sm text-muted-foreground">{isCs ? 'Před publikací přesto zkontrolujte text a přehrávání.' : 'Still review the text and playback before publishing.'}</p></div></div> : null}
          {[...parsed.errors.map((message) => ({ message, error: true })), ...parsed.warnings.map((message) => ({ message, error: false }))].map(({ message, error }) => <div key={message} className="flex gap-3 border-b pb-3"><AlertTriangle className={`h-5 w-5 shrink-0 ${error ? 'text-red-600' : 'text-amber-600'}`} /><span>{message}</span></div>)}
        </div>
      )}

      {tool.mode === 'reading-speed' && source && (
        <>
          <div className="grid gap-4 sm:grid-cols-2">
            <div><label htmlFor="max-cps" className="block text-sm font-semibold mb-2">{isCs ? 'Maximum znaků za sekundu' : 'Maximum characters per second'}</label><Input id="max-cps" type="number" value={maxCps} onChange={(event) => setMaxCps(Number(event.target.value))} /></div>
            <div><label htmlFor="max-line" className="block text-sm font-semibold mb-2">{isCs ? 'Maximum znaků na řádku' : 'Maximum characters per line'}</label><Input id="max-line" type="number" value={maxLine} onChange={(event) => setMaxLine(Number(event.target.value))} /></div>
          </div>
          <div className="overflow-x-auto border rounded-xl"><table className="w-full text-sm"><thead className="bg-muted"><tr><th className="p-3 text-left">#</th><th className="p-3 text-left">{isCs ? 'Text' : 'Text'}</th><th className="p-3 text-right">CPS</th><th className="p-3 text-right">{isCs ? 'Řádek' : 'Line'}</th><th className="p-3 text-center">{isCs ? 'Stav' : 'Status'}</th></tr></thead><tbody>{metrics.slice(0, 250).map((metric, index) => { const flagged = metric.cps > maxCps || metric.longestLine > maxLine; return <tr key={`${metric.cue.startMs}-${index}`} className="border-t"><td className="p-3">{index + 1}</td><td className="p-3 max-w-md whitespace-pre-line">{metric.cue.text}</td><td className={`p-3 text-right ${metric.cps > maxCps ? 'text-red-600 font-bold' : ''}`}>{metric.cps.toFixed(1)}</td><td className={`p-3 text-right ${metric.longestLine > maxLine ? 'text-red-600 font-bold' : ''}`}>{metric.longestLine}</td><td className="p-3 text-center">{flagged ? <AlertTriangle className="h-4 w-4 text-amber-600 inline" /> : <CheckCircle2 className="h-4 w-4 text-green-600 inline" />}</td></tr> })}</tbody></table></div>
        </>
      )}

      {tool.mode === 'converter' && (
        <>
          <div><label htmlFor="output-format" className="block text-sm font-semibold mb-2">{isCs ? 'Výstupní formát' : 'Output format'}</label><select id="output-format" value={outputFormat} onChange={(event) => setOutputFormat(event.target.value as SubtitleFormat)} className="h-10 rounded-md border bg-background px-3"><option value="srt">SRT</option><option value="vtt">WebVTT</option></select></div>
          {convertedOutput && <Textarea value={convertedOutput} readOnly rows={10} className="font-mono text-sm" aria-label={isCs ? 'Náhled převedených titulků' : 'Converted subtitle preview'} />}
          <Button disabled={!parsed.cues.length || parsed.errors.length > 0} onClick={() => downloadResult(convertedOutput, outputFormat)}><Download className="h-4 w-4 mr-2" />{isCs ? 'Stáhnout převedený soubor' : 'Download converted file'}</Button>
        </>
      )}
    </div>
  )
}
