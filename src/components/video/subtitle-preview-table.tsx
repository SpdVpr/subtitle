'use client'

import React, { useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { OverlaySubtitleEntry } from '@/types/subtitle'

interface SubtitlePreviewTableProps {
  entries: OverlaySubtitleEntry[]
  currentTime: number
  className?: string
}

export function SubtitlePreviewTable({
  entries,
  currentTime,
  className = ''
}: SubtitlePreviewTableProps) {
  // Find current subtitle and surrounding entries
  const { currentIndex, visibleEntries } = useMemo(() => {
    if (entries.length === 0) {
      return { currentIndex: -1, visibleEntries: [] }
    }

    const currentTimeMs = currentTime * 1000
    
    // Find current subtitle index
    const currentIdx = entries.findIndex(entry => 
      currentTimeMs >= entry.displayStartTime && currentTimeMs <= entry.displayEndTime
    )

    // If no current subtitle, find the next one
    const nextIdx = currentIdx === -1 
      ? entries.findIndex(entry => currentTimeMs < entry.displayStartTime)
      : currentIdx

    const baseIndex = nextIdx === -1 ? Math.max(0, entries.length - 3) : Math.max(0, nextIdx - 1)
    
    // Get 5 entries around current position
    const visible = entries.slice(baseIndex, baseIndex + 5)
    
    return {
      currentIndex: currentIdx,
      visibleEntries: visible.map((entry, idx) => ({
        ...entry,
        isActive: currentIdx !== -1 && entry.index === entries[currentIdx]?.index,
        isNext: currentIdx === -1 && idx === 0 && currentTimeMs < entry.displayStartTime
      }))
    }
  }, [entries, currentTime])

  const formatTime = (timeMs: number) => {
    const totalSeconds = Math.floor(timeMs / 1000)
    const minutes = Math.floor(totalSeconds / 60)
    const seconds = totalSeconds % 60
    return `${minutes}:${seconds.toString().padStart(2, '0')}`
  }

  if (entries.length === 0) {
    return (
      <Card className={className}>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm">Subtitle Preview</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-sm text-muted-foreground text-center py-4">
            No subtitles loaded
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className={className}>
      <CardHeader className="pb-3">
        <CardTitle className="text-sm">Subtitle Preview</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-1 max-h-60 overflow-y-auto">
          {visibleEntries.map((entry) => (
            <div
              key={entry.index}
              className={`p-2 rounded text-xs border-l-2 ${
                entry.isActive
                  ? 'bg-blue-50 dark:bg-blue-950 border-l-blue-500 font-medium'
                  : entry.isNext
                  ? 'bg-yellow-50 dark:bg-yellow-950 border-l-yellow-500'
                  : 'bg-gray-50 dark:bg-gray-800 border-l-gray-300'
              }`}
            >
              <div className="flex items-center justify-between mb-1">
                <span className="font-mono text-xs text-muted-foreground">
                  #{entry.index}
                </span>
                <span className="font-mono text-xs text-muted-foreground">
                  {formatTime(entry.displayStartTime)} - {formatTime(entry.displayEndTime)}
                </span>
              </div>
              <div className={`${
                entry.isActive ? 'text-blue-700 dark:text-blue-300' : 'text-gray-700 dark:text-gray-300'
              }`}>
                {entry.text}
              </div>
            </div>
          ))}
        </div>
        
        {currentIndex !== -1 && (
          <div className="mt-3 pt-3 border-t">
            <div className="text-xs text-muted-foreground">
              Current: #{entries[currentIndex].index} at {formatTime(currentTime * 1000)}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
