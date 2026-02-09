'use client'

import React, { memo, useState, useCallback } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
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
      className={`group transition-all duration-200 hover:shadow-md ${
        isSelected
          ? 'ring-2 ring-blue-500 bg-blue-50/50 dark:bg-blue-950/20 shadow-lg'
          : hasChanges
          ? 'border-amber-300 bg-amber-50/50 dark:bg-amber-950/20 shadow-sm'
          : 'hover:bg-muted/30'
      }`}
    >
      <CardContent className="p-5">
        <div className="flex items-start space-x-4">
          {/* Left: Selection & Number */}
          <div className="flex flex-col items-center space-y-2 flex-shrink-0">
            <Checkbox
              checked={isSelected}
              onCheckedChange={handleToggleSelection}
              className="data-[state=checked]:bg-blue-500 data-[state=checked]:border-blue-500"
            />
            <Badge
              variant="outline"
              className={`text-xs font-mono ${
                isSelected ? 'bg-blue-100 border-blue-300 text-blue-700 dark:bg-blue-900 dark:border-blue-700 dark:text-blue-300' : ''
              }`}
            >
              #{entry.index}
            </Badge>
          </div>

          {/* Main Content */}
          <div className="flex-1 min-w-0">
            {isEditing ? (
              /* Modern Edit Mode */
              <div className="space-y-4 bg-background/50 rounded-xl p-4 border border-blue-200 dark:border-blue-800">
                <div className="flex items-center space-x-2 mb-3">
                  <Edit3 className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                  <span className="text-sm font-medium text-blue-600 dark:text-blue-400">Editing Mode</span>
                </div>

                <Textarea
                  value={localText}
                  onChange={(e) => setLocalText(e.target.value)}
                  onKeyDown={handleKeyDown}
                  className="min-h-[100px] resize-none border-0 bg-background/80 focus:bg-background text-base leading-relaxed"
                  placeholder="Enter subtitle text..."
                  autoFocus
                />

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-2">
                    <Label className="text-xs font-medium text-muted-foreground flex items-center space-x-1">
                      <Clock className="h-3 w-3" />
                      <span>Start Time</span>
                    </Label>
                    <Input
                      value={formatTime(localStartTime)}
                      onChange={(e) => setLocalStartTime(e.target.value)}
                      className="text-sm font-mono bg-background/80"
                      placeholder="00:00:00.000"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs font-medium text-muted-foreground flex items-center space-x-1">
                      <Clock className="h-3 w-3" />
                      <span>End Time</span>
                    </Label>
                    <Input
                      value={formatTime(localEndTime)}
                      onChange={(e) => setLocalEndTime(e.target.value)}
                      className="text-sm font-mono bg-background/80"
                      placeholder="00:00:00.000"
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between pt-2">
                  <div className="flex items-center space-x-2">
                    <Button
                      size="sm"
                      onClick={handleSaveEdit}
                      className="bg-green-600 hover:bg-green-700"
                    >
                      <Check className="h-4 w-4 mr-2" />
                      Save Changes
                    </Button>
                    <Button variant="outline" size="sm" onClick={handleCancelEdit}>
                      <X className="h-4 w-4 mr-2" />
                      Cancel
                    </Button>
                  </div>
                  <div className="text-xs text-muted-foreground">
                    Press Ctrl+Enter to save
                  </div>
                </div>
              </div>
            ) : (
              /* Modern View Mode */
              <div className="space-y-3">
                {/* Text Content */}
                <div
                  className="group cursor-text p-4 rounded-xl border border-transparent hover:border-blue-200 dark:hover:border-blue-800 hover:bg-blue-50/30 dark:hover:bg-blue-950/20 transition-all duration-200"
                  onClick={handleStartEdit}
                >
                  <p className="text-base leading-relaxed whitespace-pre-wrap group-hover:text-blue-900 dark:group-hover:text-blue-100 transition-colors">
                    {entry.text || <span className="text-muted-foreground italic">Click to add subtitle text...</span>}
                  </p>

                  {/* Edit hint on hover */}
                  <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 mt-2">
                    <div className="flex items-center space-x-2 text-xs text-blue-600 dark:text-blue-400">
                      <Edit3 className="h-3 w-3" />
                      <span>Click to edit</span>
                    </div>
                  </div>
                </div>

                {/* Original Text Comparison */}
                {showOriginal && originalEntry && originalEntry.text !== entry.text && (
                  <div className="p-3 bg-slate-100 dark:bg-slate-800 rounded-lg border-l-4 border-slate-400">
                    <div className="flex items-center space-x-2 mb-2">
                      <div className="w-2 h-2 bg-slate-400 rounded-full"></div>
                      <span className="text-xs font-medium text-slate-600 dark:text-slate-400">Original</span>
                    </div>
                    <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
                      {originalEntry.text}
                    </p>
                  </div>
                )}

                {/* Timing & Status Bar */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="flex items-center space-x-2 text-xs text-muted-foreground bg-muted/50 px-3 py-1 rounded-full">
                      <Clock className="h-3 w-3" />
                      <span className="font-mono">{formatTime(entry.startTime)}</span>
                      <span>→</span>
                      <span className="font-mono">{formatTime(entry.endTime)}</span>
                    </div>

                    {hasChanges && (
                      <Badge className="text-xs bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200">
                        <Edit3 className="h-3 w-3 mr-1" />
                        Modified
                      </Badge>
                    )}
                  </div>

                  {/* Quick Stats */}
                  <div className="flex items-center space-x-3 text-xs text-muted-foreground">
                    <span>{entry.text.length} chars</span>
                    <span>{entry.text.split(/\s+/).filter(w => w.length > 0).length} words</span>
                  </div>
                </div>

                {/* Expanded Details */}
                {isExpanded && (
                  <div className="mt-4 p-4 bg-gradient-to-r from-slate-50 to-gray-50 dark:from-slate-900 dark:to-gray-900 rounded-xl border">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div className="text-center">
                        <div className="font-semibold text-blue-600 dark:text-blue-400">
                          {((new Date(`1970-01-01T${entry.endTime.replace(',', '.')}Z`).getTime() -
                             new Date(`1970-01-01T${entry.startTime.replace(',', '.')}Z`).getTime()) / 1000).toFixed(1)}s
                        </div>
                        <div className="text-xs text-muted-foreground">Duration</div>
                      </div>
                      <div className="text-center">
                        <div className="font-semibold text-purple-600 dark:text-purple-400">{entry.text.length}</div>
                        <div className="text-xs text-muted-foreground">Characters</div>
                      </div>
                      <div className="text-center">
                        <div className="font-semibold text-green-600 dark:text-green-400">
                          {entry.text.split(/\s+/).filter(w => w.length > 0).length}
                        </div>
                        <div className="text-xs text-muted-foreground">Words</div>
                      </div>
                      <div className="text-center">
                        <div className="font-semibold text-orange-600 dark:text-orange-400">
                          {Math.round(entry.text.length / ((new Date(`1970-01-01T${entry.endTime.replace(',', '.')}Z`).getTime() -
                             new Date(`1970-01-01T${entry.startTime.replace(',', '.')}Z`).getTime()) / 1000))}
                        </div>
                        <div className="text-xs text-muted-foreground">Chars/sec</div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Modern Action Buttons */}
          <div className="flex flex-col space-y-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleToggleExpanded}
              className="h-9 w-9 p-0 hover:bg-blue-100 dark:hover:bg-blue-900"
              title={isExpanded ? "Collapse details" : "Expand details"}
            >
              {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
            </Button>

            <Button
              variant="ghost"
              size="sm"
              onClick={handleStartEdit}
              className="h-9 w-9 p-0 hover:bg-green-100 dark:hover:bg-green-900"
              title="Edit this subtitle"
            >
              <Edit3 className="h-4 w-4" />
            </Button>

            <Button
              variant="ghost"
              size="sm"
              onClick={handleAddAfter}
              className="h-9 w-9 p-0 hover:bg-purple-100 dark:hover:bg-purple-900"
              title="Add new subtitle after this one"
            >
              <Plus className="h-4 w-4" />
            </Button>

            <Button
              variant="ghost"
              size="sm"
              onClick={handleDelete}
              className="h-9 w-9 p-0 text-red-500 hover:text-red-600 hover:bg-red-100 dark:hover:bg-red-900"
              title="Delete this subtitle"
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
