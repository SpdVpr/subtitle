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
import { SubtitleProcessor } from '@/lib/subtitle-processor'
import { toast } from 'sonner'
import {
  Search,
  Replace,
  Edit3,
  Undo,
  Redo,
  Save,
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
  Wand2,
  Move,
  Maximize2,
  Minimize2
} from 'lucide-react'

import { SubtitleEntryEditor } from './subtitle-entry-editor'
import { SearchAndReplacePanel } from './search-and-replace-panel'
import { SubtitleSyncPanel } from './subtitle-sync-panel'
import { SubtitleSyncPanelEn } from './subtitle-sync-panel-en'

interface AdvancedSubtitleEditorProps {
  entries: SubtitleEntry[]
  originalEntries: SubtitleEntry[]
  onEntriesChange: (entries: SubtitleEntry[]) => void
  fileName?: string
  editorId?: string
  initialFloating?: boolean
  initialPosition?: { x: number; y: number }
  onSave?: () => void
  locale?: 'en' | 'cs'
}

export function AdvancedSubtitleEditor({
  entries,
  originalEntries,
  onEntriesChange,
  fileName,
  editorId = 'default',
  initialFloating = false,
  initialPosition = { x: 0, y: 0 },
  onSave,
  locale = 'en'
}: AdvancedSubtitleEditorProps) {
  const [selectedEntries, setSelectedEntries] = useState<Set<number>>(new Set())
  const [editingEntry, setEditingEntry] = useState<number | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('')
  const [showOriginal, setShowOriginal] = useState(false)
  const [filterModified, setFilterModified] = useState(false)
  const [editHistory, setEditHistory] = useState<any[]>([])
  const [historyIndex, setHistoryIndex] = useState(-1)

  // Floating mode state
  const [isFloating, setIsFloating] = useState(initialFloating)
  const [editorSize, setEditorSize] = useState({ width: 800, height: 600 })
  const [editorPosition, setEditorPosition] = useState(initialPosition)
  const [isDragging, setIsDragging] = useState(false)
  const [isResizing, setIsResizing] = useState(false)
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 })
  const [resizeStart, setResizeStart] = useState({ x: 0, y: 0, width: 0, height: 0 })

  const editorRef = useRef<HTMLDivElement>(null)

  // Debounce search term for better performance
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm)
    }, 300)

    return () => clearTimeout(timer)
  }, [searchTerm])

  // Floating mode handlers
  const handleDragStart = useCallback((e: React.MouseEvent) => {
    if (!isFloating) return

    e.preventDefault()
    e.stopPropagation()

    setIsDragging(true)
    setDragStart({
      x: e.clientX - editorPosition.x,
      y: e.clientY - editorPosition.y
    })

    // Immediate visual feedback
    if (editorRef.current) {
      editorRef.current.style.transition = 'none'
    }
  }, [isFloating, editorPosition])

  const handleDragMove = useCallback((e: MouseEvent | TouchEvent) => {
    if (!isDragging) return

    // Get coordinates from mouse or touch event
    let clientX: number, clientY: number
    if ('touches' in e && e.touches.length > 0) {
      clientX = e.touches[0].clientX
      clientY = e.touches[0].clientY
    } else if ('clientX' in e) {
      clientX = e.clientX
      clientY = e.clientY
    } else {
      return
    }

    // Very liberal boundaries - allow almost complete off-screen movement
    const headerHeight = 50 // Keep at least header visible
    const minVisibleWidth = 50 // Very small minimum visible width

    const newX = Math.max(
      -editorSize.width + minVisibleWidth, // Allow moving almost completely to the left
      Math.min(window.innerWidth - minVisibleWidth, clientX - dragStart.x)
    )
    const newY = Math.max(
      -editorSize.height + headerHeight, // Allow moving almost completely upward
      Math.min(window.innerHeight - headerHeight, clientY - dragStart.y)
    )

    setEditorPosition({ x: newX, y: newY })
  }, [isDragging, dragStart, editorSize])

  const handleDragEnd = useCallback(() => {
    setIsDragging(false)

    // Restore transition after drag ends
    if (editorRef.current) {
      editorRef.current.style.transition = 'all 300ms'
    }
  }, [])

  const handleResizeStart = useCallback((e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()

    setIsResizing(true)
    setResizeStart({
      x: e.clientX,
      y: e.clientY,
      width: editorSize.width,
      height: editorSize.height
    })

    // Disable transition during resize
    if (editorRef.current) {
      editorRef.current.style.transition = 'none'
    }
  }, [editorSize])

  const handleResizeMove = useCallback((e: MouseEvent | TouchEvent) => {
    if (!isResizing) return

    // Get coordinates from mouse or touch event
    let clientX: number, clientY: number
    if ('touches' in e && e.touches.length > 0) {
      clientX = e.touches[0].clientX
      clientY = e.touches[0].clientY
    } else if ('clientX' in e) {
      clientX = e.clientX
      clientY = e.clientY
    } else {
      return
    }

    const deltaX = clientX - resizeStart.x
    const deltaY = clientY - resizeStart.y

    setEditorSize({
      width: Math.max(500, Math.min(window.innerWidth - 100, resizeStart.width + deltaX)),
      height: Math.max(400, Math.min(window.innerHeight - 100, resizeStart.height + deltaY))
    })
  }, [isResizing, resizeStart])

  const handleResizeEnd = useCallback(() => {
    setIsResizing(false)

    // Restore transition after resize ends
    if (editorRef.current) {
      editorRef.current.style.transition = 'all 300ms'
    }
  }, [])

  const toggleFloatingMode = useCallback(() => {
    setIsFloating(!isFloating)
    if (!isFloating) {
      // Center the editor when entering floating mode
      const centerX = Math.max(0, (window.innerWidth - editorSize.width) / 2)
      const centerY = Math.max(0, (window.innerHeight - editorSize.height) / 2)
      setEditorPosition({ x: centerX, y: centerY })
    }
  }, [isFloating, editorSize])

  const resetLayout = useCallback(() => {
    setEditorSize({ width: 800, height: 600 })
    setEditorPosition({ x: 0, y: 0 })
    setIsFloating(false)
  }, [])

  // Ultra-robust drag handling - works even with fast mouse movement
  useEffect(() => {
    if (!isDragging && !isResizing) return

    const handleMouseMove = (e: Event) => {
      e.preventDefault()
      e.stopPropagation()

      if (isDragging) {
        handleDragMove(e as MouseEvent)
      } else if (isResizing) {
        handleResizeMove(e as MouseEvent)
      }
    }

    const handleMouseUp = (e: Event) => {
      e.preventDefault()
      e.stopPropagation()

      if (isDragging) {
        handleDragEnd()
      } else if (isResizing) {
        handleResizeEnd()
      }
    }

    // Use comprehensive event coverage for bulletproof drag
    const moveEvents = ['mousemove', 'pointermove', 'touchmove']
    const endEvents = ['mouseup', 'pointerup', 'touchend', 'touchcancel', 'blur', 'focusout']

    // Add to document, window, and html for maximum coverage
    const targets = [document, window, document.documentElement]

    targets.forEach(target => {
      moveEvents.forEach(event => {
        target.addEventListener(event, handleMouseMove, {
          passive: false,
          capture: true
        })
      })

      endEvents.forEach(event => {
        target.addEventListener(event, handleMouseUp, {
          passive: false,
          capture: true
        })
      })
    })

    // Global styles for smooth dragging
    const originalStyles = {
      cursor: document.body.style.cursor,
      userSelect: document.body.style.userSelect,
      pointerEvents: document.body.style.pointerEvents
    }

    document.body.style.cursor = isDragging ? 'grabbing !important' : 'nw-resize !important'
    document.body.style.userSelect = 'none !important'
    document.body.style.pointerEvents = 'none !important'

    // Keep floating window interactive
    if (editorRef.current) {
      editorRef.current.style.pointerEvents = 'auto !important'
    }

    return () => {
      // Comprehensive cleanup
      targets.forEach(target => {
        moveEvents.forEach(event => {
          target.removeEventListener(event, handleMouseMove, { capture: true } as any)
        })

        endEvents.forEach(event => {
          target.removeEventListener(event, handleMouseUp, { capture: true } as any)
        })
      })

      // Restore original styles
      document.body.style.cursor = originalStyles.cursor
      document.body.style.userSelect = originalStyles.userSelect
      document.body.style.pointerEvents = originalStyles.pointerEvents

      if (editorRef.current) {
        editorRef.current.style.pointerEvents = ''
      }
    }
  }, [isDragging, isResizing, handleDragMove, handleResizeMove, handleDragEnd, handleResizeEnd])

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

  // Keyboard shortcuts for undo/redo
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Only handle if not typing in an input/textarea
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        return
      }

      // Ctrl+Z - Undo
      if (e.ctrlKey && e.key === 'z' && !e.shiftKey) {
        e.preventDefault()
        undo()
      }

      // Ctrl+Y or Ctrl+Shift+Z - Redo
      if ((e.ctrlKey && e.key === 'y') || (e.ctrlKey && e.shiftKey && e.key === 'z')) {
        e.preventDefault()
        redo()
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [undo, redo])

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
      {/* Window Controls */}
      <div className="bg-card/50 backdrop-blur-sm border rounded-2xl p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Badge variant="outline" className="bg-blue-50 dark:bg-blue-950">
              {entries.length} subtitles
            </Badge>
            {selectedEntries.size > 0 && (
              <Badge variant="outline" className="bg-purple-50 dark:bg-purple-950">
                {selectedEntries.size} selected
              </Badge>
            )}
          </div>

          <div className="flex items-center space-x-2">
            <Button
              variant={isFloating ? "default" : "default"}
              size="sm"
              onClick={toggleFloatingMode}
              className={`flex items-center space-x-2 font-semibold transition-all duration-200 ${
                isFloating
                  ? 'bg-blue-600 hover:bg-blue-700 text-white shadow-lg'
                  : 'bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg hover:shadow-xl transform hover:scale-105'
              }`}
            >
              {isFloating ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
              <span className="hidden sm:inline">{isFloating ? 'Dock Editor' : 'Float Editor'}</span>
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={resetLayout}
              className="flex items-center space-x-2"
            >
              <RotateCcw className="h-4 w-4" />
              <span className="hidden sm:inline">Reset</span>
            </Button>
          </div>
        </div>
      </div>

      {/* Resizable/Draggable Editor Container */}
      <div
        ref={editorRef}
        className={`relative transition-all duration-300 ${
          isFloating
            ? 'fixed z-50 shadow-2xl rounded-2xl border-2 border-blue-500 bg-background flex flex-col overflow-hidden'
            : 'rounded-xl border bg-background'
        }`}
        style={isFloating ? {
          left: editorPosition.x,
          top: editorPosition.y,
          width: editorSize.width,
          height: editorSize.height,
          minWidth: 500,
          minHeight: 400
        } : {
          width: '100%',
          height: 'auto'
        }}
      >
        {/* Drag Handle (only in floating mode) */}
        {isFloating && (
          <div
            className="flex items-center justify-between p-3 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-t-2xl cursor-grab active:cursor-grabbing select-none touch-none"
            onMouseDown={handleDragStart}
            onTouchStart={(e) => {
              const touch = e.touches[0]
              if (touch) {
                handleDragStart({
                  clientX: touch.clientX,
                  clientY: touch.clientY,
                  preventDefault: () => e.preventDefault(),
                  stopPropagation: () => e.stopPropagation()
                } as React.MouseEvent)
              }
            }}
            onDragStart={(e) => e.preventDefault()} // Prevent native drag
            onContextMenu={(e) => e.preventDefault()} // Prevent context menu
          >
            <div className="flex items-center space-x-2">
              <Move className="h-4 w-4" />
              <span className="font-medium">Subtitle Editor</span>
            </div>
            <div className="flex items-center space-x-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  if (onSave) {
                    onSave()
                  } else {
                    // Default save behavior
                    if (entries.length === 0) {
                      toast.error('No subtitles to save')
                      return
                    }

                    try {
                      const srtContent = SubtitleProcessor.generateSRT(entries)
                      const blob = new Blob([srtContent], { type: 'text/plain;charset=utf-8' })
                      const url = URL.createObjectURL(blob)

                      const link = document.createElement('a')
                      link.href = url
                      link.download = fileName ? fileName.replace('.srt', '_edited.srt') : 'edited_subtitles.srt'
                      document.body.appendChild(link)
                      link.click()
                      document.body.removeChild(link)
                      URL.revokeObjectURL(url)

                      toast.success('Subtitles saved successfully!')
                    } catch (error) {
                      console.error('Failed to save subtitles:', error)
                      toast.error('Failed to save subtitles')
                    }
                  }
                }}
                className="h-6 w-6 p-0 text-white hover:bg-white/20"
                title="Save file"
              >
                <Save className="h-3 w-3" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={toggleFloatingMode}
                className="h-6 w-6 p-0 text-white hover:bg-white/20"
                title="Dock window"
              >
                <Minimize2 className="h-3 w-3" />
              </Button>
            </div>
          </div>
        )}

        {/* Toolbar */}
        <div className={`bg-card/80 backdrop-blur-sm border-b p-4 ${isFloating ? '' : 'rounded-t-xl'}`}>
          <div className="flex flex-col lg:flex-row items-center justify-between gap-4">
            {/* Search & Filters */}
            <div className="flex items-center space-x-4 flex-1">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search subtitles..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 bg-background/50"
                />
              </div>

              <div className="flex items-center space-x-2">
                <Button
                  variant={showOriginal ? "default" : "outline"}
                  size="sm"
                  onClick={() => setShowOriginal(!showOriginal)}
                  className="flex items-center space-x-2"
                >
                  <Eye className="h-4 w-4" />
                  <span className="hidden sm:inline">Original</span>
                </Button>

                <Button
                  variant={filterModified ? "default" : "outline"}
                  size="sm"
                  onClick={() => setFilterModified(!filterModified)}
                  className="flex items-center space-x-2"
                >
                  <Filter className="h-4 w-4" />
                  <span className="hidden sm:inline">Modified</span>
                </Button>
              </div>
            </div>

            {/* History Controls */}
            <div className="flex items-center space-x-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={undo}
                disabled={historyIndex < 0}
                className="flex items-center space-x-2"
              >
                <Undo className="h-4 w-4" />
                <span className="hidden sm:inline">Undo</span>
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={redo}
                disabled={historyIndex >= editHistory.length - 1}
                className="flex items-center space-x-2"
              >
                <Redo className="h-4 w-4" />
                <span className="hidden sm:inline">Redo</span>
              </Button>

              <div className="h-4 w-px bg-border mx-2" />

              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  if (onSave) {
                    onSave()
                  } else {
                    // Auto-save with smart filename
                    if (entries.length === 0) {
                      toast.error('No subtitles to save')
                      return
                    }

                    try {
                      const srtContent = SubtitleProcessor.generateSRT(entries)
                      const blob = new Blob([srtContent], { type: 'text/plain;charset=utf-8' })
                      const url = URL.createObjectURL(blob)

                      // Smart filename generation
                      let downloadName = 'edited_subtitles.srt'
                      if (fileName) {
                        const baseName = fileName.replace(/\.srt$/i, '')
                        const timestamp = new Date().toISOString().slice(0, 16).replace(/[:-]/g, '')
                        downloadName = `${baseName}_edited_${timestamp}.srt`
                      }

                      const link = document.createElement('a')
                      link.href = url
                      link.download = downloadName
                      document.body.appendChild(link)
                      link.click()
                      document.body.removeChild(link)
                      URL.revokeObjectURL(url)

                      toast.success('Subtitles saved successfully!', {
                        description: downloadName
                      })
                    } catch (error) {
                      console.error('Failed to save subtitles:', error)
                      toast.error('Failed to save subtitles')
                    }
                  }
                }}
                className="flex items-center space-x-2 text-green-600 hover:text-green-700 hover:bg-green-50 dark:text-green-400 dark:hover:text-green-300 dark:hover:bg-green-950"
                title="Save file"
              >
                <Save className="h-4 w-4" />
                <span className="hidden sm:inline">Save</span>
              </Button>
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <Tabs defaultValue="editor" className={`w-full ${isFloating ? 'flex-1 flex flex-col' : ''}`}>
          <div className={`flex justify-center ${isFloating ? 'mb-2 px-4 flex-shrink-0' : 'mb-6'}`}>
            <TabsList className="grid grid-cols-3 gap-3 bg-transparent p-0">
              <TabsTrigger
                value="editor"
                className={`flex items-center justify-center space-x-2 rounded-xl font-bold transition-all duration-300 cursor-pointer
                  border-2 shadow-lg hover:shadow-2xl active:scale-95
                  data-[state=active]:bg-gradient-to-br data-[state=active]:from-blue-500 data-[state=active]:via-blue-600 data-[state=active]:to-blue-700
                  data-[state=active]:text-white data-[state=active]:border-blue-700 data-[state=active]:shadow-blue-500/60
                  data-[state=active]:ring-4 data-[state=active]:ring-blue-300 data-[state=active]:dark:ring-blue-800
                  data-[state=inactive]:bg-white data-[state=inactive]:dark:bg-slate-800
                  data-[state=inactive]:border-blue-300 data-[state=inactive]:dark:border-blue-700
                  data-[state=inactive]:text-blue-700 data-[state=inactive]:dark:text-blue-300
                  data-[state=inactive]:hover:bg-gradient-to-br data-[state=inactive]:hover:from-blue-400 data-[state=inactive]:hover:to-blue-500
                  data-[state=inactive]:hover:text-white data-[state=inactive]:hover:border-blue-500
                  data-[state=inactive]:hover:scale-105
                  ${isFloating ? 'px-4 py-3 text-sm' : 'px-8 py-4 text-base'}`}
              >
                <Edit3 className={isFloating ? "h-5 w-5" : "h-6 w-6"} />
                <span>Editor</span>
              </TabsTrigger>
              <TabsTrigger
                value="search-replace"
                className={`flex items-center justify-center space-x-2 rounded-xl font-bold transition-all duration-300 cursor-pointer
                  border-2 shadow-lg hover:shadow-2xl active:scale-95
                  data-[state=active]:bg-gradient-to-br data-[state=active]:from-purple-500 data-[state=active]:via-purple-600 data-[state=active]:to-purple-700
                  data-[state=active]:text-white data-[state=active]:border-purple-700 data-[state=active]:shadow-purple-500/60
                  data-[state=active]:ring-4 data-[state=active]:ring-purple-300 data-[state=active]:dark:ring-purple-800
                  data-[state=inactive]:bg-white data-[state=inactive]:dark:bg-slate-800
                  data-[state=inactive]:border-purple-300 data-[state=inactive]:dark:border-purple-700
                  data-[state=inactive]:text-purple-700 data-[state=inactive]:dark:text-purple-300
                  data-[state=inactive]:hover:bg-gradient-to-br data-[state=inactive]:hover:from-purple-400 data-[state=inactive]:hover:to-purple-500
                  data-[state=inactive]:hover:text-white data-[state=inactive]:hover:border-purple-500
                  data-[state=inactive]:hover:scale-105
                  ${isFloating ? 'px-4 py-3 text-sm' : 'px-8 py-4 text-base'}`}
              >
                <Replace className={isFloating ? "h-5 w-5" : "h-6 w-6"} />
                <span>Find & Replace</span>
              </TabsTrigger>
              <TabsTrigger
                value="sync"
                className={`flex items-center justify-center space-x-2 rounded-xl font-bold transition-all duration-300 cursor-pointer
                  border-2 shadow-lg hover:shadow-2xl active:scale-95
                  data-[state=active]:bg-gradient-to-br data-[state=active]:from-green-500 data-[state=active]:via-emerald-600 data-[state=active]:to-green-700
                  data-[state=active]:text-white data-[state=active]:border-green-700 data-[state=active]:shadow-green-500/60
                  data-[state=active]:ring-4 data-[state=active]:ring-green-300 data-[state=active]:dark:ring-green-800
                  data-[state=inactive]:bg-white data-[state=inactive]:dark:bg-slate-800
                  data-[state=inactive]:border-green-300 data-[state=inactive]:dark:border-green-700
                  data-[state=inactive]:text-green-700 data-[state=inactive]:dark:text-green-300
                  data-[state=inactive]:hover:bg-gradient-to-br data-[state=inactive]:hover:from-green-400 data-[state=inactive]:hover:to-emerald-500
                  data-[state=inactive]:hover:text-white data-[state=inactive]:hover:border-green-500
                  data-[state=inactive]:hover:scale-105
                  ${isFloating ? 'px-4 py-3 text-sm' : 'px-8 py-4 text-base'}`}
              >
                <Clock className={isFloating ? "h-5 w-5" : "h-6 w-6"} />
                <span>{locale === 'cs' ? 'Synchronizace' : 'Sync'}</span>
              </TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="editor" className={`${isFloating ? 'flex-1 overflow-hidden' : 'space-y-4'}`}>
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
              isFloating={isFloating}
              editorSize={editorSize}
            />
          </TabsContent>

          <TabsContent value="search-replace" className={`${isFloating ? 'flex-1 overflow-hidden' : ''}`}>
            <div
              className={`${isFloating ? 'h-full overflow-y-auto bg-background/50 p-4' : ''}`}
            >
              <SearchAndReplacePanel
                entries={entries}
                onEntriesChange={onEntriesChange}
              />
            </div>
          </TabsContent>

          <TabsContent value="sync" className={`${isFloating ? 'flex-1 overflow-hidden' : ''}`}>
            <div
              className={`${isFloating ? 'h-full overflow-y-auto bg-background/50 p-4' : ''}`}
            >
              {locale === 'cs' ? (
                <SubtitleSyncPanel
                  entries={entries}
                  onEntriesChange={onEntriesChange}
                />
              ) : (
                <SubtitleSyncPanelEn
                  entries={entries}
                  onEntriesChange={onEntriesChange}
                />
              )}
            </div>
          </TabsContent>
      </Tabs>

        {/* Resize Handle (only in floating mode) */}
        {isFloating && (
          <div
            className="absolute bottom-0 right-0 w-6 h-6 cursor-nw-resize bg-blue-500 rounded-tl-xl opacity-60 hover:opacity-100 transition-opacity flex items-end justify-end p-1 touch-none"
            onMouseDown={handleResizeStart}
            onTouchStart={(e) => {
              const touch = e.touches[0]
              if (touch) {
                handleResizeStart({
                  clientX: touch.clientX,
                  clientY: touch.clientY,
                  preventDefault: () => e.preventDefault(),
                  stopPropagation: () => e.stopPropagation()
                } as React.MouseEvent)
              }
            }}
            onDragStart={(e) => e.preventDefault()}
            onContextMenu={(e) => e.preventDefault()}
          >
            <div className="w-3 h-3 border-r-2 border-b-2 border-white"></div>
          </div>
        )}
      </div>
    </div>
  )
}
