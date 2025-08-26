'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Separator } from '@/components/ui/separator'
import { SubtitleEntry } from '@/types/preview'
import { toast } from 'sonner'
import {
  Wand2,
  Clock,
  Type,
  ArrowUp,
  ArrowDown,
  RotateCcw,
  Zap,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Scissors,
  Merge,
  Plus,
  Minus
} from 'lucide-react'

interface BatchOperationsPanelProps {
  entries: SubtitleEntry[]
  selectedEntries: Set<number>
  onEntriesChange: (entries: SubtitleEntry[]) => void
}

export function BatchOperationsPanel({
  entries,
  selectedEntries,
  onEntriesChange
}: BatchOperationsPanelProps) {
  const [maxLineLength, setMaxLineLength] = useState('42')
  const [maxLines, setMaxLines] = useState('2')

  const selectedCount = selectedEntries.size
  const allSelected = selectedCount === entries.length



  const formatText = () => {
    if (selectedEntries.size === 0) {
      toast.error('No entries selected')
      return
    }

    const maxLength = parseInt(maxLineLength)
    const maxLinesNum = parseInt(maxLines)

    const newEntries = entries.map((entry, index) => {
      if (selectedEntries.has(index)) {
        let text = entry.text
        
        // Split into words and reformat
        const words = text.split(' ')
        const lines: string[] = []
        let currentLine = ''
        
        for (const word of words) {
          if (currentLine.length + word.length + 1 <= maxLength) {
            currentLine += (currentLine ? ' ' : '') + word
          } else {
            if (currentLine) lines.push(currentLine)
            currentLine = word
          }
        }
        if (currentLine) lines.push(currentLine)
        
        // Limit number of lines
        const formattedText = lines.slice(0, maxLinesNum).join('\n')
        
        return {
          ...entry,
          text: formattedText,
          isEdited: true
        }
      }
      return entry
    })

    onEntriesChange(newEntries)
    toast.success(`Formatted ${selectedCount} entries`)
  }

  // Utility functions
  const timeToSeconds = (timeStr: string): number => {
    const [hours, minutes, seconds] = timeStr.split(':')
    const [secs, ms] = seconds.split(',')
    return parseInt(hours) * 3600 + parseInt(minutes) * 60 + parseInt(secs) + parseInt(ms) / 1000
  }

  const secondsToTime = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    const secs = Math.floor(seconds % 60)
    const ms = Math.floor((seconds % 1) * 1000)
    
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')},${ms.toString().padStart(3, '0')}`
  }

  return (
    <div className="space-y-6">
      {/* Selection Info */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Wand2 className="h-5 w-5 text-primary" />
              <span className="font-medium">
                {selectedCount === 0 
                  ? 'No entries selected' 
                  : `${selectedCount} ${selectedCount === 1 ? 'entry' : 'entries'} selected`
                }
              </span>
            </div>
            {selectedCount > 0 && (
              <span className="text-sm text-muted-foreground">
                {allSelected ? 'All entries' : `${selectedCount} of ${entries.length}`}
              </span>
            )}
          </div>
        </CardContent>
      </Card>



      {/* Text Formatting */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <AlignLeft className="h-5 w-5" />
            <span>Text Formatting</span>
          </CardTitle>
          <CardDescription>
            Format text layout and line breaks
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label>Max Line Length</Label>
              <Input
                type="number"
                value={maxLineLength}
                onChange={(e) => setMaxLineLength(e.target.value)}
                min="10"
                max="100"
              />
            </div>
            <div className="space-y-2">
              <Label>Max Lines</Label>
              <Input
                type="number"
                value={maxLines}
                onChange={(e) => setMaxLines(e.target.value)}
                min="1"
                max="5"
              />
            </div>
            <div className="space-y-2">
              <Label>&nbsp;</Label>
              <Button
                onClick={formatText}
                disabled={selectedCount === 0}
                className="w-full"
              >
                <AlignLeft className="h-4 w-4 mr-2" />
                Format Text
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
