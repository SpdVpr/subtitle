'use client'

import React, { memo, useState, useCallback } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Checkbox } from '@/components/ui/checkbox'
import { Badge } from '@/components/ui/badge'
import { SubtitleEntry } from '@/types/preview'
import {
  Edit3,
  Trash2,
  Plus,
  Clock,
  Check,
  X,
  ChevronUp,
  ChevronDown
} from 'lucide-react'

interface OptimizedSubtitleEntryProps {
  entry: SubtitleEntry
  index: number
  isSelected: boolean
  isEditing: boolean
  isExpanded: boolean
  showOriginal: boolean
  originalEntry?: SubtitleEntry
  onToggleSelection: (index: number) => void
  onUpdateEntry: (index: number, updates: Partial<SubtitleEntry>) => void
  onDeleteEntry: (index: number) => void
  onAddEntry: (afterIndex: number) => void
  onSetEditingEntry: (index: number | null) => void
  onToggleExpanded: (index: number | null) => void
}

// Memoized component to prevent unnecessary re-renders
export const OptimizedSubtitleEntry = memo(function OptimizedSubtitleEntry({
  entry,
  index,
  isSelected,
  isEditing,
  isExpanded,
  showOriginal,
  originalEntry,
  onToggleSelection,
  onUpdateEntry,
  onDeleteEntry,
  onAddEntry,
  onSetEditingEntry,
  onToggleExpanded
}: OptimizedSubtitleEntryProps) {
  const [localText, setLocalText] = useState(entry.text)
  const [localStartTime, setLocalStartTime] = useState(entry.startTime)
  const [localEndTime, setLocalEndTime] = useState(entry.endTime)

  const hasChanges = entry.isEdited

  // Optimized handlers with useCallback to prevent re-renders
  const handleToggleSelection = useCallback(() => {
    onToggleSelection(index)
  }, [index, onToggleSelection])

  const handleStartEdit = useCallback(() => {
    setLocalText(entry.text)
    setLocalStartTime(entry.startTime)
    setLocalEndTime(entry.endTime)
    onSetEditingEntry(index)
  }, [index, entry.text, entry.startTime, entry.endTime, onSetEditingEntry])

  const handleSaveEdit = useCallback(() => {
    onUpdateEntry(index, {
      text: localText,
      startTime: localStartTime.replace('.', ','),
      endTime: localEndTime.replace('.', ',')
    })
    onSetEditingEntry(null)
  }, [index, localText, localStartTime, localEndTime, onUpdateEntry, onSetEditingEntry])

  const handleCancelEdit = useCallback(() => {
    setLocalText(entry.text)
    setLocalStartTime(entry.startTime)
    setLocalEndTime(entry.endTime)
    onSetEditingEntry(null)
  }, [entry.text, entry.startTime, entry.endTime, onSetEditingEntry])

  const handleToggleExpanded = useCallback(() => {
    onToggleExpanded(isExpanded ? null : index)
  }, [index, isExpanded, onToggleExpanded])

  const handleDelete = useCallback(() => {
    if (confirm('Are you sure you want to delete this entry?')) {
      onDeleteEntry(index)
    }
  }, [index, onDeleteEntry])

  const handleAddAfter = useCallback(() => {
    onAddEntry(index)
  }, [index, onAddEntry])

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && e.ctrlKey) {
      handleSaveEdit()
    }
    if (e.key === 'Escape') {
      handleCancelEdit()
    }
  }, [handleSaveEdit, handleCancelEdit])

  // Helper functions
  const formatTime = (timeStr: string) => timeStr.replace(',', '.')

  return (
    <Card
      className={`transition-colors ${
        isSelected 
          ? 'ring-2 ring-primary bg-primary/5' 
          : hasChanges 
          ? 'border-yellow-300 bg-yellow-50 dark:bg-yellow-950/20' 
          : ''
      }`}
    >
      <CardContent className="p-4">
        <div className="flex items-start space-x-3">
          {/* Selection Checkbox */}
          <Checkbox
            checked={isSelected}
            onCheckedChange={handleToggleSelection}
            className="mt-1"
          />

          {/* Entry Number */}
          <div className="flex-shrink-0 w-12 text-center">
            <Badge variant="outline" className="text-xs">
              #{entry.index}
            </Badge>
          </div>

          {/* Main Content */}
          <div className="flex-1 min-w-0">
            {isEditing ? (
              /* Edit Mode */
              <div className="space-y-3">
                <Textarea
                  value={localText}
                  onChange={(e) => setLocalText(e.target.value)}
                  onKeyDown={handleKeyDown}
                  className="min-h-[80px] resize-none"
                  placeholder="Enter subtitle text..."
                  autoFocus
                />
                
                <div className="grid grid-cols-2 gap-2">
                  <div className="space-y-1">
                    <label className="text-xs text-muted-foreground">Start Time</label>
                    <Input
                      value={formatTime(localStartTime)}
                      onChange={(e) => setLocalStartTime(e.target.value)}
                      className="text-xs font-mono"
                      placeholder="00:00:00.000"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs text-muted-foreground">End Time</label>
                    <Input
                      value={formatTime(localEndTime)}
                      onChange={(e) => setLocalEndTime(e.target.value)}
                      className="text-xs font-mono"
                      placeholder="00:00:00.000"
                    />
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <Button size="sm" onClick={handleSaveEdit}>
                    <Check className="h-4 w-4 mr-1" />
                    Save
                  </Button>
                  <Button variant="outline" size="sm" onClick={handleCancelEdit}>
                    <X className="h-4 w-4 mr-1" />
                    Cancel
                  </Button>
                </div>
              </div>
            ) : (
              /* View Mode */
              <div className="space-y-2">
                {/* Text Content */}
                <div
                  className="cursor-text p-2 rounded border-2 border-transparent hover:border-muted transition-colors"
                  onClick={handleStartEdit}
                >
                  <p className="text-sm leading-relaxed whitespace-pre-wrap">
                    {entry.text || <span className="text-muted-foreground italic">Empty subtitle</span>}
                  </p>
                </div>

                {/* Original Text (if showing) */}
                {showOriginal && originalEntry && originalEntry.text !== entry.text && (
                  <div className="p-2 bg-muted/50 rounded text-xs">
                    <span className="text-muted-foreground">Original: </span>
                    <span className="text-muted-foreground">{originalEntry.text}</span>
                  </div>
                )}

                {/* Timing Info */}
                <div className="flex items-center space-x-4 text-xs text-muted-foreground">
                  <div className="flex items-center space-x-1">
                    <Clock className="h-3 w-3" />
                    <span>{formatTime(entry.startTime)} → {formatTime(entry.endTime)}</span>
                  </div>
                  {hasChanges && (
                    <Badge variant="secondary" className="text-xs">
                      <Edit3 className="h-3 w-3 mr-1" />
                      Modified
                    </Badge>
                  )}
                </div>

                {/* Expanded Details */}
                {isExpanded && (
                  <div className="mt-3 p-3 bg-muted/30 rounded text-xs space-y-2">
                    <div>
                      <span className="font-medium">Duration: </span>
                      {((new Date(`1970-01-01T${entry.endTime.replace(',', '.')}Z`).getTime() - 
                         new Date(`1970-01-01T${entry.startTime.replace(',', '.')}Z`).getTime()) / 1000).toFixed(1)}s
                    </div>
                    <div>
                      <span className="font-medium">Characters: </span>
                      {entry.text.length}
                    </div>
                    <div>
                      <span className="font-medium">Words: </span>
                      {entry.text.split(/\s+/).filter(w => w.length > 0).length}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col space-y-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleToggleExpanded}
              className="h-8 w-8 p-0"
            >
              {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
            </Button>
            
            <Button
              variant="ghost"
              size="sm"
              onClick={handleStartEdit}
              className="h-8 w-8 p-0"
            >
              <Edit3 className="h-4 w-4" />
            </Button>

            <Button
              variant="ghost"
              size="sm"
              onClick={handleAddAfter}
              className="h-8 w-8 p-0"
            >
              <Plus className="h-4 w-4" />
            </Button>

            <Button
              variant="ghost"
              size="sm"
              onClick={handleDelete}
              className="h-8 w-8 p-0 text-destructive hover:text-destructive"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
})

OptimizedSubtitleEntry.displayName = 'OptimizedSubtitleEntry'
