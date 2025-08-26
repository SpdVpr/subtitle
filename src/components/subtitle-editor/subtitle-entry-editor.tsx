'use client'

import React, { useState, useMemo, useCallback } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { ScrollArea } from '@/components/ui/scroll-area'
import { SubtitleEntry } from '@/types/preview'
import { OptimizedSubtitleEntry } from './optimized-subtitle-entry'
import {
  Plus
} from 'lucide-react'

interface SubtitleEntryEditorProps {
  entries: SubtitleEntry[]
  originalEntries: SubtitleEntry[]
  selectedEntries: Set<number>
  editingEntry: number | null
  showOriginal: boolean
  onToggleSelection: (index: number) => void
  onUpdateEntry: (index: number, updates: Partial<SubtitleEntry>) => void
  onDeleteEntry: (index: number) => void
  onAddEntry: (afterIndex: number) => void
  onSetEditingEntry: (index: number | null) => void
}

export function SubtitleEntryEditor({
  entries,
  originalEntries,
  selectedEntries,
  editingEntry,
  showOriginal,
  onToggleSelection,
  onUpdateEntry,
  onDeleteEntry,
  onAddEntry,
  onSetEditingEntry
}: SubtitleEntryEditorProps) {
  const [expandedEntry, setExpandedEntry] = useState<number | null>(null)

  // Memoized helper function to get original entry
  const getOriginalEntry = useCallback((index: number) => {
    return originalEntries.find(entry => entry.index === entries[index].index)
  }, [originalEntries, entries])

  // Memoized handlers to prevent unnecessary re-renders
  const handleToggleExpanded = useCallback((index: number | null) => {
    setExpandedEntry(index)
  }, [])

  // Memoized entry list to prevent unnecessary recalculations
  const entryComponents = useMemo(() => {
    return entries.map((entry, index) => (
      <OptimizedSubtitleEntry
        key={`${entry.index}-${entry.text.slice(0, 20)}`} // Stable key
        entry={entry}
        index={index}
        isSelected={selectedEntries.has(index)}
        isEditing={editingEntry === index}
        isExpanded={expandedEntry === index}
        showOriginal={showOriginal}
        originalEntry={getOriginalEntry(index)}
        onToggleSelection={onToggleSelection}
        onUpdateEntry={onUpdateEntry}
        onDeleteEntry={onDeleteEntry}
        onAddEntry={onAddEntry}
        onSetEditingEntry={onSetEditingEntry}
        onToggleExpanded={handleToggleExpanded}
      />
    ))
  }, [
    entries,
    selectedEntries,
    editingEntry,
    expandedEntry,
    showOriginal,
    getOriginalEntry,
    onToggleSelection,
    onUpdateEntry,
    onDeleteEntry,
    onAddEntry,
    onSetEditingEntry,
    handleToggleExpanded
  ])

  return (
    <div className="space-y-4">
      {/* Entry List - Optimized with memoization */}
      <ScrollArea className="h-[600px]">
        <div className="space-y-2">
          {entryComponents}
        </div>
      </ScrollArea>

      {/* Add Entry at End */}
      <Card className="border-dashed">
        <CardContent className="p-4 text-center">
          <Button
            variant="outline"
            onClick={() => onAddEntry(entries.length - 1)}
            className="flex items-center space-x-2"
          >
            <Plus className="h-4 w-4" />
            <span>Add New Entry</span>
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
