'use client'

import { useState, useCallback } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { SubtitleEntry } from '@/types/preview'
import { toast } from 'sonner'
import {
  Clock,
  Plus,
  Minus,
  RotateCcw,
  Zap,
  Info,
  CheckCircle,
  AlertCircle,
  ArrowRight,
  FastForward,
  Rewind,
  Eye
} from 'lucide-react'

interface SubtitleSyncPanelProps {
  entries: SubtitleEntry[]
  onEntriesChange: (entries: SubtitleEntry[]) => void
}

export function SubtitleSyncPanel({ entries, onEntriesChange }: SubtitleSyncPanelProps) {
  const [offsetSeconds, setOffsetSeconds] = useState<string>('0')
  const [offsetMilliseconds, setOffsetMilliseconds] = useState<string>('0')
  const [previewMode, setPreviewMode] = useState(false)
  const [previewEntries, setPreviewEntries] = useState<SubtitleEntry[]>([])

  // Helper: Convert time string to milliseconds
  const timeToMs = useCallback((timeStr: string): number => {
    const [hours, minutes, seconds] = timeStr.split(':')
    const [secs, ms] = seconds.split(',')
    return (
      parseInt(hours) * 3600000 +
      parseInt(minutes) * 60000 +
      parseInt(secs) * 1000 +
      parseInt(ms)
    )
  }, [])

  // Helper: Convert milliseconds to time string
  const msToTime = useCallback((ms: number): string => {
    // Handle negative times by clamping to 0
    ms = Math.max(0, ms)
    
    const hours = Math.floor(ms / 3600000)
    const minutes = Math.floor((ms % 3600000) / 60000)
    const seconds = Math.floor((ms % 60000) / 1000)
    const milliseconds = ms % 1000

    return `${hours.toString().padStart(2, '0')}:${minutes
      .toString()
      .padStart(2, '0')}:${seconds.toString().padStart(2, '0')},${milliseconds
      .toString()
      .padStart(3, '0')}`
  }, [])

  // Calculate total offset in milliseconds
  const getTotalOffsetMs = useCallback((): number => {
    const seconds = parseFloat(offsetSeconds) || 0
    const milliseconds = parseFloat(offsetMilliseconds) || 0
    return seconds * 1000 + milliseconds
  }, [offsetSeconds, offsetMilliseconds])

  // Apply time offset to all subtitles
  const applyTimeOffset = useCallback((preview: boolean = false) => {
    const totalOffsetMs = getTotalOffsetMs()

    if (totalOffsetMs === 0) {
      toast.error('Zadejte časový posun', {
        description: 'Posun musí být nenulový'
      })
      return
    }

    try {
      const adjustedEntries = entries.map(entry => {
        const startMs = timeToMs(entry.startTime)
        const endMs = timeToMs(entry.endTime)

        const newStartMs = startMs + totalOffsetMs
        const newEndMs = endMs + totalOffsetMs

        // Prevent negative times
        if (newStartMs < 0) {
          throw new Error('Časový posun by způsobil záporné časy')
        }

        return {
          ...entry,
          startTime: msToTime(newStartMs),
          endTime: msToTime(newEndMs),
          isEdited: true
        }
      })

      if (preview) {
        setPreviewEntries(adjustedEntries)
        setPreviewMode(true)
        toast.info('Náhled synchronizace', {
          description: `Posun: ${totalOffsetMs > 0 ? '+' : ''}${(totalOffsetMs / 1000).toFixed(3)}s`
        })
      } else {
        onEntriesChange(adjustedEntries)
        setPreviewMode(false)
        toast.success('Synchronizace úspěšná!', {
          description: `Všechny titulky posunuty o ${totalOffsetMs > 0 ? '+' : ''}${(
            totalOffsetMs / 1000
          ).toFixed(3)}s`
        })
      }
    } catch (error: any) {
      toast.error('Chyba při synchronizaci', {
        description: error.message || 'Zkontrolujte zadané hodnoty'
      })
    }
  }, [entries, getTotalOffsetMs, timeToMs, msToTime, onEntriesChange])

  // Quick offset buttons
  const applyQuickOffset = useCallback((seconds: number) => {
    setOffsetSeconds(seconds.toString())
    setOffsetMilliseconds('0')
  }, [])

  // Cancel preview
  const cancelPreview = useCallback(() => {
    setPreviewMode(false)
    setPreviewEntries([])
    toast.info('Náhled zrušen')
  }, [])

  // Apply preview
  const applyPreview = useCallback(() => {
    if (previewEntries.length > 0) {
      onEntriesChange(previewEntries)
      setPreviewMode(false)
      setPreviewEntries([])
      toast.success('Synchronizace aplikována!')
    }
  }, [previewEntries, onEntriesChange])

  // Reset form
  const resetForm = useCallback(() => {
    setOffsetSeconds('0')
    setOffsetMilliseconds('0')
    setPreviewMode(false)
    setPreviewEntries([])
  }, [])

  const totalOffsetMs = getTotalOffsetMs()
  const displayEntries = previewMode ? previewEntries : entries

  return (
    <div className="space-y-6">
      {/* Info Card */}
      <Card className="bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-blue-950/50 dark:to-cyan-950/50 border-blue-200 dark:border-blue-800">
        <CardHeader className="pb-3">
          <div className="flex items-center space-x-2">
            <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center">
              <Clock className="h-5 w-5 text-white" />
            </div>
            <div>
              <CardTitle className="text-lg">Synchronizace Titulků</CardTitle>
              <CardDescription>
                Posuňte časování všech titulků najednou
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex items-start space-x-2 text-sm text-muted-foreground">
            <Info className="h-4 w-4 mt-0.5 flex-shrink-0" />
            <p>
              Použijte kladné hodnoty pro posunutí titulků dopředu (později) nebo záporné hodnoty
              pro posunutí dozadu (dříve). Například +1 sekunda posune všechny titulky o 1 sekundu
              později.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Main Controls */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Zap className="h-5 w-5 text-blue-600 dark:text-blue-400" />
            <span>Nastavení Posunu</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Time Offset Inputs */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="flex items-center space-x-2">
                <Clock className="h-4 w-4" />
                <span>Sekundy</span>
              </Label>
              <Input
                type="number"
                step="0.1"
                value={offsetSeconds}
                onChange={(e) => setOffsetSeconds(e.target.value)}
                placeholder="0"
                className="text-lg font-mono"
                disabled={previewMode}
              />
              <p className="text-xs text-muted-foreground">
                Celé sekundy (může být záporné)
              </p>
            </div>

            <div className="space-y-2">
              <Label className="flex items-center space-x-2">
                <Clock className="h-4 w-4" />
                <span>Milisekundy</span>
              </Label>
              <Input
                type="number"
                step="1"
                min="-999"
                max="999"
                value={offsetMilliseconds}
                onChange={(e) => setOffsetMilliseconds(e.target.value)}
                placeholder="0"
                className="text-lg font-mono"
                disabled={previewMode}
              />
              <p className="text-xs text-muted-foreground">
                Jemné doladění (0-999 ms)
              </p>
            </div>
          </div>

          {/* Total Offset Display */}
          <div className="bg-muted/50 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Celkový posun:</span>
              <Badge
                variant={totalOffsetMs === 0 ? 'outline' : totalOffsetMs > 0 ? 'default' : 'destructive'}
                className="text-lg font-mono px-4 py-1"
              >
                {totalOffsetMs > 0 ? '+' : ''}
                {(totalOffsetMs / 1000).toFixed(3)}s
              </Badge>
            </div>
          </div>

          <Separator />

          {/* Quick Offset Buttons */}
          <div className="space-y-3">
            <Label className="text-sm font-medium">Rychlé Předvolby</Label>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => applyQuickOffset(-5)}
                disabled={previewMode}
                className="flex items-center space-x-1"
              >
                <Rewind className="h-3 w-3" />
                <span>-5s</span>
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => applyQuickOffset(-1)}
                disabled={previewMode}
                className="flex items-center space-x-1"
              >
                <Rewind className="h-3 w-3" />
                <span>-1s</span>
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => applyQuickOffset(1)}
                disabled={previewMode}
                className="flex items-center space-x-1"
              >
                <span>+1s</span>
                <FastForward className="h-3 w-3" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => applyQuickOffset(5)}
                disabled={previewMode}
                className="flex items-center space-x-1"
              >
                <span>+5s</span>
                <FastForward className="h-3 w-3" />
              </Button>
            </div>
          </div>

          <Separator />

          {/* Action Buttons */}
          {!previewMode ? (
            <div className="flex flex-col sm:flex-row gap-3">
              <Button
                onClick={() => applyTimeOffset(true)}
                disabled={totalOffsetMs === 0}
                variant="outline"
                className="flex-1 flex items-center justify-center space-x-2"
              >
                <Eye className="h-4 w-4" />
                <span>Náhled</span>
              </Button>
              <Button
                onClick={() => applyTimeOffset(false)}
                disabled={totalOffsetMs === 0}
                className="flex-1 flex items-center justify-center space-x-2 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700"
              >
                <CheckCircle className="h-4 w-4" />
                <span>Aplikovat Synchronizaci</span>
              </Button>
              <Button
                onClick={resetForm}
                variant="ghost"
                className="flex items-center space-x-2"
              >
                <RotateCcw className="h-4 w-4" />
                <span>Reset</span>
              </Button>
            </div>
          ) : (
            <div className="space-y-3">
              <div className="bg-blue-50 dark:bg-blue-950/50 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                <div className="flex items-start space-x-2">
                  <Info className="h-5 w-5 text-blue-600 dark:text-blue-400 mt-0.5" />
                  <div>
                    <p className="font-medium text-blue-900 dark:text-blue-100">
                      Režim náhledu aktivní
                    </p>
                    <p className="text-sm text-blue-700 dark:text-blue-300 mt-1">
                      Zkontrolujte první a poslední titulky níže. Pokud je vše v pořádku, klikněte
                      na "Potvrdit".
                    </p>
                  </div>
                </div>
              </div>
              <div className="flex gap-3">
                <Button
                  onClick={applyPreview}
                  className="flex-1 flex items-center justify-center space-x-2 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700"
                >
                  <CheckCircle className="h-4 w-4" />
                  <span>Potvrdit Změny</span>
                </Button>
                <Button onClick={cancelPreview} variant="outline" className="flex items-center space-x-2">
                  <AlertCircle className="h-4 w-4" />
                  <span>Zrušit</span>
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Preview Display */}
      {displayEntries.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">
              {previewMode ? 'Náhled Změn' : 'Aktuální Titulky'}
            </CardTitle>
            <CardDescription>
              {previewMode
                ? 'Zkontrolujte první a poslední titulky před aplikací'
                : 'První a poslední titulky pro referenci'}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* First subtitle */}
            <div className="bg-muted/50 rounded-lg p-4 space-y-2">
              <div className="flex items-center justify-between">
                <Badge variant="outline">První titulek</Badge>
                <span className="text-xs text-muted-foreground">#{displayEntries[0].index}</span>
              </div>
              <div className="flex items-center space-x-2 text-sm font-mono text-blue-600 dark:text-blue-400">
                <Clock className="h-3 w-3" />
                <span>
                  {displayEntries[0].startTime} <ArrowRight className="h-3 w-3 inline" />{' '}
                  {displayEntries[0].endTime}
                </span>
              </div>
              <p className="text-sm">{displayEntries[0].text}</p>
            </div>

            {/* Last subtitle */}
            {displayEntries.length > 1 && (
              <div className="bg-muted/50 rounded-lg p-4 space-y-2">
                <div className="flex items-center justify-between">
                  <Badge variant="outline">Poslední titulek</Badge>
                  <span className="text-xs text-muted-foreground">
                    #{displayEntries[displayEntries.length - 1].index}
                  </span>
                </div>
                <div className="flex items-center space-x-2 text-sm font-mono text-blue-600 dark:text-blue-400">
                  <Clock className="h-3 w-3" />
                  <span>
                    {displayEntries[displayEntries.length - 1].startTime}{' '}
                    <ArrowRight className="h-3 w-3 inline" />{' '}
                    {displayEntries[displayEntries.length - 1].endTime}
                  </span>
                </div>
                <p className="text-sm">{displayEntries[displayEntries.length - 1].text}</p>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  )
}

