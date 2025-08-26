'use client'

import { useState, useRef, useMemo, useCallback, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Checkbox } from '@/components/ui/checkbox'
import { SubtitleEntry } from '@/types/preview'
import { toast } from 'sonner'
import {
  Search,
  Replace,
  Edit3,
  Undo,
  Redo,
  Copy,
  Trash2,
  Plus,
  Settings,
  Eye,
  EyeOff,
  Clock,
  Type,
  Zap,
  CheckSquare,
  Square,
  Filter,
  ArrowUp,
  ArrowDown,
  RotateCcw,
  Save,
  Wand2
} from 'lucide-react'
import { BatchOperationsPanel } from './batch-operations-panel'
import { SubtitleEntryEditor } from './subtitle-entry-editor'
import { SearchAndReplacePanel } from './search-and-replace-panel'

interface AdvancedSubtitleEditorProps {
  entries: SubtitleEntry[]
  originalEntries: SubtitleEntry[]
  onEntriesChange: (entries: SubtitleEntry[]) => void
  fileName?: string
}

export function AdvancedSubtitleEditor({
  entries,
  originalEntries,
  onEntriesChange,
  fileName
}: AdvancedSubtitleEditorProps) {
  const [selectedEntries, setSelectedEntries] = useState<Set<number>>(new Set())
  const [editingEntry, setEditingEntry] = useState<number | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('')
  const [showOriginal, setShowOriginal] = useState(false)
  const [filterModified, setFilterModified] = useState(false)
  const [editHistory, setEditHistory] = useState<any[]>([])
  const [historyIndex, setHistoryIndex] = useState(-1)

  // Debounce search term for better performance
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm)
    }, 300)

    return () => clearTimeout(timer)
  }, [searchTerm])

  // Optimized filter with debounced search
  const filteredEntries = useMemo(() => {
    let filtered = entries

    // Search filter - using debounced search term
    if (debouncedSearchTerm.length > 0) {
      const searchLower = debouncedSearchTerm.toLowerCase()
      filtered = filtered.filter(entry => {
        const textMatch = entry.text.toLowerCase().includes(searchLower)
        const originalMatch = entry.originalText?.toLowerCase().includes(searchLower)
        return textMatch || originalMatch
      })
    }

    // Modified filter
    if (filterModified) {
      filtered = filtered.filter(entry => entry.isEdited)
    }

    return filtered
  }, [entries, debouncedSearchTerm, filterModified])

  // Optimized selection handlers with useCallback
  const toggleEntrySelection = useCallback((index: number) => {
    setSelectedEntries(prev => {
      const newSelection = new Set(prev)
      if (newSelection.has(index)) {
        newSelection.delete(index)
      } else {
        newSelection.add(index)
      }
      return newSelection
    })
  }, [])

  const selectAllVisible = useCallback(() => {
    const visibleIndices = new Set(filteredEntries.map(entry => entry.index - 1))
    setSelectedEntries(visibleIndices)
  }, [filteredEntries])

  const clearSelection = useCallback(() => {
    setSelectedEntries(new Set())
  }, [])

  // Optimized edit operations
  const updateEntry = useCallback((index: number, updates: Partial<SubtitleEntry>) => {
    const newEntries = [...entries]
    const oldEntry = { ...newEntries[index] }
    newEntries[index] = { ...newEntries[index], ...updates, isEdited: true }

    // Add to history - limit history size for performance
    const action = {
      type: 'edit',
      index,
      oldValue: oldEntry,
      newValue: newEntries[index],
      timestamp: Date.now()
    }

    setEditHistory(prev => {
      const newHistory = prev.slice(Math.max(0, prev.length - 50), historyIndex + 1) // Keep only last 50 actions
      newHistory.push(action)
      return newHistory
    })
    setHistoryIndex(prev => Math.min(prev + 1, 50))

    onEntriesChange(newEntries)
  }, [entries, historyIndex, onEntriesChange])

  const deleteEntry = useCallback((index: number) => {
    const newEntries = entries.filter((_, i) => i !== index)
    // Reindex entries efficiently
    newEntries.forEach((entry, idx) => {
      entry.index = idx + 1
    })
    onEntriesChange(newEntries)
    toast.success('Entry deleted')
  }, [entries, onEntriesChange])

  const addEntry = useCallback((afterIndex: number) => {
    const newEntries = [...entries]
    const prevEntry = newEntries[afterIndex]
    const nextEntry = newEntries[afterIndex + 1]

    // Calculate timing
    const prevEndTime = prevEntry ? timeToSeconds(prevEntry.endTime) : 0
    const nextStartTime = nextEntry ? timeToSeconds(nextEntry.startTime) : prevEndTime + 5

    const startTime = prevEndTime + 0.1
    const endTime = Math.min(startTime + 2, nextStartTime - 0.1)

    const newEntry: SubtitleEntry = {
      index: afterIndex + 2,
      startTime: secondsToTime(startTime),
      endTime: secondsToTime(endTime),
      text: '',
      isEdited: true
    }

    // Insert and reindex
    newEntries.splice(afterIndex + 1, 0, newEntry)
    newEntries.forEach((entry, idx) => {
      entry.index = idx + 1
    })

    onEntriesChange(newEntries)
    setEditingEntry(afterIndex + 1)
    toast.success('New entry added')
  }, [entries, onEntriesChange])

  // Optimized Undo/Redo
  const undo = useCallback(() => {
    if (historyIndex >= 0) {
      const action = editHistory[historyIndex]
      const newEntries = [...entries]
      newEntries[action.index] = action.oldValue
      onEntriesChange(newEntries)
      setHistoryIndex(prev => prev - 1)
      toast.success('Undone')
    }
  }, [historyIndex, editHistory, entries, onEntriesChange])

  const redo = useCallback(() => {
    if (historyIndex < editHistory.length - 1) {
      const action = editHistory[historyIndex + 1]
      const newEntries = [...entries]
      newEntries[action.index] = action.newValue
      onEntriesChange(newEntries)
      setHistoryIndex(prev => prev + 1)
      toast.success('Redone')
    }
  }, [historyIndex, editHistory, entries, onEntriesChange])

  // Memoized helper functions for better performance
  const timeToSeconds = useCallback((timeStr: string): number => {
    const [hours, minutes, seconds] = timeStr.split(':')
    const [secs, ms] = seconds.split(',')
    return parseInt(hours) * 3600 + parseInt(minutes) * 60 + parseInt(secs) + parseInt(ms) / 1000
  }, [])

  const secondsToTime = useCallback((seconds: number): string => {
    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    const secs = Math.floor(seconds % 60)
    const ms = Math.floor((seconds % 1) * 1000)

    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')},${ms.toString().padStart(3, '0')}`
  }, [])

  return (
    <div className="space-y-6">
      {/* Toolbar */}
      <Card>
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg">Editor Tools</CardTitle>
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={undo}
                disabled={historyIndex < 0}
              >
                <Undo className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={redo}
                disabled={historyIndex >= editHistory.length - 1}
              >
                <Redo className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            {/* Search */}
            <div className="space-y-2">
              <Label>Search Subtitles</Label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search text..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            {/* Filters */}
            <div className="space-y-2">
              <Label>Filters</Label>
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="show-original"
                    checked={showOriginal}
                    onCheckedChange={setShowOriginal}
                  />
                  <Label htmlFor="show-original" className="text-sm">Show Original</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="filter-modified"
                    checked={filterModified}
                    onCheckedChange={setFilterModified}
                  />
                  <Label htmlFor="filter-modified" className="text-sm">Modified Only</Label>
                </div>
              </div>
            </div>

            {/* Selection */}
            <div className="space-y-2">
              <Label>Selection ({selectedEntries.size} selected)</Label>
              <div className="flex items-center space-x-2">
                <Button variant="outline" size="sm" onClick={selectAllVisible}>
                  <CheckSquare className="h-4 w-4 mr-1" />
                  All Visible
                </Button>
                <Button variant="outline" size="sm" onClick={clearSelection}>
                  <Square className="h-4 w-4 mr-1" />
                  Clear
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Main Editor Tabs */}
      <Tabs defaultValue="editor" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="editor">
            <Edit3 className="h-4 w-4 mr-2" />
            Editor
          </TabsTrigger>
          <TabsTrigger value="batch">
            <Wand2 className="h-4 w-4 mr-2" />
            Batch Operations
          </TabsTrigger>
          <TabsTrigger value="search-replace">
            <Replace className="h-4 w-4 mr-2" />
            Find & Replace
          </TabsTrigger>
        </TabsList>

        <TabsContent value="editor" className="space-y-4">
          <SubtitleEntryEditor
            entries={filteredEntries}
            originalEntries={originalEntries}
            selectedEntries={selectedEntries}
            editingEntry={editingEntry}
            showOriginal={showOriginal}
            onToggleSelection={toggleEntrySelection}
            onUpdateEntry={updateEntry}
            onDeleteEntry={deleteEntry}
            onAddEntry={addEntry}
            onSetEditingEntry={setEditingEntry}
          />
        </TabsContent>

        <TabsContent value="batch">
          <BatchOperationsPanel
            entries={entries}
            selectedEntries={selectedEntries}
            onEntriesChange={onEntriesChange}
          />
        </TabsContent>

        <TabsContent value="search-replace">
          <SearchAndReplacePanel
            entries={entries}
            onEntriesChange={onEntriesChange}
          />
        </TabsContent>
      </Tabs>
    </div>
  )
}
