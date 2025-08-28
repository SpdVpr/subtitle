'use client'

import React, { useState, useMemo, useCallback, useRef, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Badge } from '@/components/ui/badge'
import { SubtitleEntry } from '@/types/preview'
import { OptimizedSubtitleEntry } from './optimized-subtitle-entry'
import {
  Plus,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  Search,
  Hash
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
  isFloating?: boolean
  editorSize?: { width: number; height: number }
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
  onSetEditingEntry,
  isFloating = false,
  editorSize = { width: 800, height: 600 }
}: SubtitleEntryEditorProps) {
  const [expandedEntry, setExpandedEntry] = useState<number | null>(null)
  const [currentPage, setCurrentPage] = useState(1)
  const [entriesPerPage, setEntriesPerPage] = useState(isFloating ? 10 : 20)
  const [jumpToEntry, setJumpToEntry] = useState('')

  // Adjust entries per page based on floating mode
  React.useEffect(() => {
    if (isFloating && entriesPerPage > 10) {
      setEntriesPerPage(5) // Smaller number for floating mode
      setCurrentPage(1)
    } else if (!isFloating && entriesPerPage < 10) {
      setEntriesPerPage(20) // Larger number for normal mode
      setCurrentPage(1)
    }
  }, [isFloating, entriesPerPage])

  // Pagination logic
  const totalPages = Math.ceil(entries.length / entriesPerPage)
  const startIndex = (currentPage - 1) * entriesPerPage
  const endIndex = startIndex + entriesPerPage
  const currentEntries = entries.slice(startIndex, endIndex)

  // Navigation handlers
  const goToPage = useCallback((page: number) => {
    setCurrentPage(Math.max(1, Math.min(page, totalPages)))
  }, [totalPages])

  const goToFirstPage = useCallback(() => goToPage(1), [goToPage])
  const goToLastPage = useCallback(() => goToPage(totalPages), [goToPage, totalPages])
  const goToPrevPage = useCallback(() => goToPage(currentPage - 1), [currentPage, goToPage])
  const goToNextPage = useCallback(() => goToPage(currentPage + 1), [currentPage, goToPage])

  const jumpToEntryNumber = useCallback(() => {
    const entryNum = parseInt(jumpToEntry)
    if (entryNum && entryNum >= 1 && entryNum <= entries.length) {
      const pageForEntry = Math.ceil(entryNum / entriesPerPage)
      setCurrentPage(pageForEntry)
      setJumpToEntry('')
    }
  }, [jumpToEntry, entries.length, entriesPerPage])



  // Memoized helper function to get original entry
  const getOriginalEntry = useCallback((index: number) => {
    return originalEntries.find(entry => entry.index === entries[index].index)
  }, [originalEntries, entries])

  // Memoized handlers to prevent unnecessary re-renders
  const handleToggleExpanded = useCallback((index: number | null) => {
    setExpandedEntry(index)
  }, [])

  // Memoized entry list for current page
  const entryComponents = useMemo(() => {
    return currentEntries.map((entry, relativeIndex) => {
      const absoluteIndex = startIndex + relativeIndex
      return (
        <OptimizedSubtitleEntry
          key={`${entry.index}-${entry.text.slice(0, 20)}`} // Stable key
          entry={entry}
          index={absoluteIndex}
          isSelected={selectedEntries.has(absoluteIndex)}
          isEditing={editingEntry === absoluteIndex}
          isExpanded={expandedEntry === absoluteIndex}
          showOriginal={showOriginal}
          originalEntry={getOriginalEntry(absoluteIndex)}
          onToggleSelection={onToggleSelection}
          onUpdateEntry={onUpdateEntry}
          onDeleteEntry={onDeleteEntry}
          onAddEntry={onAddEntry}
          onSetEditingEntry={onSetEditingEntry}
          onToggleExpanded={handleToggleExpanded}
        />
      )
    })
  }, [
    currentEntries,
    startIndex,
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
    <div className={`${isFloating ? 'h-full flex flex-col' : 'space-y-6'}`}>

      {/* Navigation Bar - Only show when not floating */}
      {!isFloating && (
        <div className="bg-card/50 backdrop-blur-sm border rounded-2xl p-4">
          <div className="flex flex-col lg:flex-row items-center justify-between gap-4">
            {/* Jump to Entry */}
            <div className="flex items-center space-x-2">
              <Label className="text-sm font-medium">Jump to:</Label>
              <div className="flex items-center space-x-1">
                <Hash className="h-4 w-4 text-muted-foreground" />
                <Input
                  type="number"
                  placeholder="Entry #"
                  value={jumpToEntry}
                  onChange={(e) => setJumpToEntry(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && jumpToEntryNumber()}
                  className="w-24 h-8 text-sm"
                  min="1"
                  max={entries.length}
                />
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={jumpToEntryNumber}
                  className="h-8 px-2"
                >
                  <Search className="h-3 w-3" />
                </Button>
              </div>
            </div>

            {/* Entries per page */}
            <div className="flex items-center space-x-2">
              <Label className="text-sm font-medium">Show:</Label>
              <Select value={entriesPerPage.toString()} onValueChange={(value) => {
                setEntriesPerPage(parseInt(value))
                setCurrentPage(1)
              }}>
                <SelectTrigger className="w-20 h-8">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="5">5</SelectItem>
                  <SelectItem value="10">10</SelectItem>
                  <SelectItem value="15">15</SelectItem>
                  <SelectItem value="20">20</SelectItem>
                  {!isFloating && <SelectItem value="50">50</SelectItem>}
                  {!isFloating && <SelectItem value="100">100</SelectItem>}
                </SelectContent>
              </Select>
            </div>

            {/* Pagination */}
            <div className="flex items-center space-x-1">
              <Button
                variant="ghost"
                size="sm"
                onClick={goToFirstPage}
                disabled={currentPage === 1}
                className="h-8 px-2"
              >
                <ChevronsLeft className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={goToPrevPage}
                disabled={currentPage === 1}
                className="h-8 px-2"
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>

              <Badge variant="outline" className="mx-2">
                {currentPage} / {totalPages}
              </Badge>

              <Button
                variant="ghost"
                size="sm"
                onClick={goToNextPage}
                disabled={currentPage === totalPages}
                className="h-8 px-2"
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={goToLastPage}
                disabled={currentPage === totalPages}
                className="h-8 px-2"
              >
                <ChevronsRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Compact Navigation for Floating Mode */}
      {isFloating && (
        <div className="bg-card/80 backdrop-blur-sm border-b p-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Hash className="h-4 w-4 text-muted-foreground" />
              <Input
                type="number"
                placeholder="#"
                value={jumpToEntry}
                onChange={(e) => setJumpToEntry(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && jumpToEntryNumber()}
                className="w-16 h-7 text-sm"
                min="1"
                max={entries.length}
              />
              <Button
                size="sm"
                variant="ghost"
                onClick={jumpToEntryNumber}
                className="h-7 px-2"
              >
                <Search className="h-3 w-3" />
              </Button>
            </div>

            <Badge variant="outline" className="text-xs">
              {currentPage} / {totalPages}
            </Badge>

            <div className="flex items-center space-x-1">
              <Button
                variant="ghost"
                size="sm"
                onClick={goToPrevPage}
                disabled={currentPage === 1}
                className="h-7 px-2"
              >
                <ChevronLeft className="h-3 w-3" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={goToNextPage}
                disabled={currentPage === totalPages}
                className="h-7 px-2"
              >
                <ChevronRight className="h-3 w-3" />
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Scrollable Content Area */}
      <div className={`${isFloating ? 'flex-1 overflow-hidden' : ''}`}>
        <ScrollArea
          className={`bg-background/50 ${isFloating ? 'h-full' : 'rounded-xl border bg-muted/20'}`}
          style={isFloating ? {
            height: '100%',
            maxHeight: editorSize.height - 140 // Account for header and navigation
          } : {
            height: editorSize.height
          }}
        >
          <div className="space-y-3 p-4">
            {entryComponents}
          </div>
        </ScrollArea>
      </div>

      {/* Add Entry Button - Only show when not floating */}
      {!isFloating && (
        <div className="text-center">
          <Button
            variant="outline"
            onClick={() => onAddEntry(entries.length - 1)}
            className="flex items-center space-x-2"
          >
            <Plus className="h-4 w-4" />
            <span>Add New Entry</span>
          </Button>
        </div>
      )}
    </div>
  )
}
