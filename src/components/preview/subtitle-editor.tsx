'use client'

import { useState, useRef, useEffect, useMemo, useCallback } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Checkbox } from '@/components/ui/checkbox'
import { SubtitleEntry } from '@/types/preview'
import { SearchAndReplacePanel } from '@/components/subtitle-editor/search-and-replace-panel'
import { toast } from 'sonner'
import { 
  Play, 
  Pause, 
  SkipBack, 
  SkipForward, 
  Edit3, 
  Save, 
  Undo, 
  Redo,
  Plus,
  Trash2,
  Split,
  Merge,
  Eye,
  EyeOff,
  Clock,
  Type,
  Star,
  Wand2,
  Replace,
  CheckSquare,
  Square,
  RefreshCw,
  Loader2,
  Sparkles
} from 'lucide-react'

interface SubtitleEditorProps {
  entries: SubtitleEntry[]
  originalEntries?: SubtitleEntry[]
  onEntriesChange: (entries: SubtitleEntry[]) => void
  videoUrl?: string
  showOriginal?: boolean
  onShowOriginalChange?: (show: boolean) => void
}

export function SubtitleEditor({ 
  entries, 
  originalEntries, 
  onEntriesChange, 
  videoUrl,
  showOriginal = false,
  onShowOriginalChange 
}: SubtitleEditorProps) {
  const [selectedEntry, setSelectedEntry] = useState<number | null>(null)
  const [editingEntry, setEditingEntry] = useState<number | null>(null)
  const [currentTime, setCurrentTime] = useState(0)
  const [isPlaying, setIsPlaying] = useState(false)
  const [editHistory, setEditHistory] = useState<any[]>([])
  const [historyIndex, setHistoryIndex] = useState(-1)

  // Batch operations state
  const [selectedEntries, setSelectedEntries] = useState<Set<number>>(new Set())
  const [activeTab, setActiveTab] = useState('editor')

  // AI regeneration state
  const [regeneratingEntries, setRegeneratingEntries] = useState<Set<number>>(new Set())
  const videoRef = useRef<HTMLVideoElement>(null)

  // Convert time string to seconds
  const timeToSeconds = (timeStr: string): number => {
    const [hours, minutes, seconds] = timeStr.split(':')
    const [secs, ms] = seconds.split(',')
    return parseInt(hours) * 3600 + parseInt(minutes) * 60 + parseInt(secs) + parseInt(ms) / 1000
  }

  // Convert seconds to time string
  const secondsToTime = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    const secs = Math.floor(seconds % 60)
    const ms = Math.floor((seconds % 1) * 1000)
    
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')},${ms.toString().padStart(3, '0')}`
  }

  // Find current subtitle based on video time
  const getCurrentEntry = (): SubtitleEntry | null => {
    return entries.find(entry => {
      const start = timeToSeconds(entry.startTime)
      const end = timeToSeconds(entry.endTime)
      return currentTime >= start && currentTime <= end
    }) || null
  }

  // Update entry
  const updateEntry = (index: number, updates: Partial<SubtitleEntry>) => {
    const newEntries = [...entries]
    const oldEntry = { ...newEntries[index] }
    newEntries[index] = { ...newEntries[index], ...updates, isEdited: true }
    
    // Add to history
    const action = {
      type: 'edit',
      index,
      oldValue: oldEntry,
      newValue: newEntries[index],
      timestamp: Date.now()
    }
    
    const newHistory = editHistory.slice(0, historyIndex + 1)
    newHistory.push(action)
    setEditHistory(newHistory)
    setHistoryIndex(newHistory.length - 1)
    
    onEntriesChange(newEntries)
  }

  // Add new entry
  const addEntry = (afterIndex: number) => {
    const newEntries = [...entries]
    const prevEntry = newEntries[afterIndex]
    const nextEntry = newEntries[afterIndex + 1]
    
    const startTime = prevEntry ? timeToSeconds(prevEntry.endTime) + 0.1 : 0
    const endTime = nextEntry ? timeToSeconds(nextEntry.startTime) - 0.1 : startTime + 2
    
    const newEntry: SubtitleEntry = {
      index: afterIndex + 1,
      startTime: secondsToTime(startTime),
      endTime: secondsToTime(endTime),
      text: '',
      isEdited: true
    }
    
    // Reindex entries
    newEntries.splice(afterIndex + 1, 0, newEntry)
    newEntries.forEach((entry, idx) => {
      entry.index = idx + 1
    })
    
    onEntriesChange(newEntries)
    setEditingEntry(afterIndex + 1)
  }

  // Delete entry
  const deleteEntry = (index: number) => {
    const newEntries = entries.filter((_, idx) => idx !== index)
    // Reindex
    newEntries.forEach((entry, idx) => {
      entry.index = idx + 1
    })
    onEntriesChange(newEntries)
  }

  // Video controls
  const handlePlay = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause()
      } else {
        videoRef.current.play()
      }
      setIsPlaying(!isPlaying)
    }
  }

  const handleSeek = (time: number) => {
    if (videoRef.current) {
      videoRef.current.currentTime = time
      setCurrentTime(time)
    }
  }

  const jumpToEntry = (entry: SubtitleEntry) => {
    const startTime = timeToSeconds(entry.startTime)
    handleSeek(startTime)
    setSelectedEntry(entry.index - 1)
  }

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey || e.metaKey) {
        switch (e.key) {
          case 'z':
            e.preventDefault()
            // Undo
            break
          case 'y':
            e.preventDefault()
            // Redo
            break
          case 's':
            e.preventDefault()
            // Save
            break
        }
      }
      
      if (e.key === 'Space' && !editingEntry) {
        e.preventDefault()
        handlePlay()
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [editingEntry, isPlaying])

  const currentEntry = getCurrentEntry()

  // Batch operations handlers
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

  const selectAllEntries = useCallback(() => {
    setSelectedEntries(new Set(entries.map((_, index) => index)))
  }, [entries])

  const clearSelection = useCallback(() => {
    setSelectedEntries(new Set())
  }, [])

  // AI regeneration function
  const regenerateEntry = useCallback(async (index: number) => {
    const entry = entries[index]
    const originalEntry = originalEntries?.[index]

    if (!originalEntry?.text) {
      toast.error('No original text found for regeneration')
      return
    }

    setRegeneratingEntries(prev => new Set(prev).add(index))

    try {
      // Get translation settings from sessionStorage - prioritize preview data
      let previewData = JSON.parse(sessionStorage.getItem('previewData') || '{}')

      // Extract translation settings with proper fallbacks
      const sourceLanguage = previewData.sourceLanguage || 'en'
      const targetLanguage = previewData.targetLanguage || 'cs'
      const aiService = previewData.aiService || 'openai' // Default to openai for better quality

      console.log(`🔄 Regenerating subtitle #${entry.index}:`)
      console.log(`   From: ${sourceLanguage} → To: ${targetLanguage}`)
      console.log(`   Using: ${aiService}`)
      console.log(`   Original text: "${originalEntry.text}"`)
      console.log(`   Current text: "${entry.text}"`)

      const response = await fetch('/api/translate-text', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text: originalEntry.text, // Use original text for regeneration
          sourceLanguage: sourceLanguage,
          targetLanguage: targetLanguage,
          aiService: aiService,
          context: `Subtitle #${entry.index} from video content. Previous subtitle: "${entries[index - 1]?.text || ''}" Next subtitle: "${entries[index + 1]?.text || ''}"`
        }),
      })

      if (!response.ok) {
        const errorText = await response.text()
        console.error(`❌ API Error (${response.status}):`, errorText)
        throw new Error(`Translation failed: ${response.status} - ${errorText}`)
      }

      const result = await response.json()
      console.log('✅ Translation result:', result)

      if (result.translatedText) {
        // Update the entry with new translation
        updateEntry(index, {
          text: result.translatedText,
          isEdited: true
        })
        toast.success(`Subtitle #${entry.index} regenerated to ${targetLanguage}`)
      } else {
        console.error('❌ No translatedText in result:', result)
        throw new Error('No translation received')
      }

    } catch (error) {
      console.error('Failed to regenerate entry:', error)
      toast.error(`Failed to regenerate subtitle #${entry.index}. Please try again.`)
    } finally {
      setRegeneratingEntries(prev => {
        const newSet = new Set(prev)
        newSet.delete(index)
        return newSet
      })
    }
  }, [entries, originalEntries, updateEntry])

  return (
    <div className="flex-1 flex flex-col space-y-6 min-h-0">
      {/* Video Player */}
      {videoUrl && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Play className="h-5 w-5" />
              <span>Video Preview</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <video
                ref={videoRef}
                src={videoUrl}
                className="w-full max-h-96 bg-black rounded-lg"
                onTimeUpdate={(e) => setCurrentTime(e.currentTarget.currentTime)}
                onPlay={() => setIsPlaying(true)}
                onPause={() => setIsPlaying(false)}
              />
              
              {/* Video Controls */}
              <div className="flex items-center space-x-4">
                <Button variant="outline" size="sm" onClick={handlePlay}>
                  {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                </Button>
                
                <Button variant="outline" size="sm" onClick={() => handleSeek(Math.max(0, currentTime - 10))}>
                  <SkipBack className="h-4 w-4" />
                </Button>
                
                <Button variant="outline" size="sm" onClick={() => handleSeek(currentTime + 10)}>
                  <SkipForward className="h-4 w-4" />
                </Button>
                
                <div className="flex-1">
                  <input
                    type="range"
                    min="0"
                    max={videoRef.current?.duration || 100}
                    value={currentTime}
                    onChange={(e) => handleSeek(parseFloat(e.target.value))}
                    className="w-full"
                  />
                </div>
                
                <span className="text-sm text-gray-600 dark:text-muted-foreground">
                  {Math.floor(currentTime / 60)}:{Math.floor(currentTime % 60).toString().padStart(2, '0')}
                </span>
              </div>
              
              {/* Current Subtitle Display */}
              {currentEntry && (
                <div className="bg-black bg-opacity-80 text-white p-4 rounded-lg text-center">
                  <p className="text-lg">{currentEntry.text}</p>
                  {showOriginal && originalEntries && (
                    <p className="text-sm text-gray-300 dark:text-muted-foreground mt-2">
                      Original: {originalEntries[currentEntry.index - 1]?.text}
                    </p>
                  )}
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Editor Controls */}
      <Card className="flex-1 flex flex-col min-h-0">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center space-x-2">
              <Edit3 className="h-5 w-5" />
              <span>Subtitle Editor</span>
            </CardTitle>
            <div className="flex items-center space-x-2">
              {onShowOriginalChange && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onShowOriginalChange(!showOriginal)}
                >
                  {showOriginal ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  {showOriginal ? 'Hide' : 'Show'} Original
                </Button>
              )}
              
              <Button variant="outline" size="sm" disabled={historyIndex < 0}>
                <Undo className="h-4 w-4" />
              </Button>
              
              <Button variant="outline" size="sm" disabled={historyIndex >= editHistory.length - 1}>
                <Redo className="h-4 w-4" />
              </Button>
              
              <Button variant="outline" size="sm">
                <Save className="h-4 w-4" />
                Save
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="flex-1 min-h-0 overflow-hidden">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="h-full flex flex-col">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="editor">
                <Edit3 className="h-4 w-4 mr-2" />
                Editor
              </TabsTrigger>
              <TabsTrigger value="batch">
                <Wand2 className="h-4 w-4 mr-2" />
                Batch Operations
              </TabsTrigger>
            </TabsList>

            <TabsContent value="editor" className="flex-1 min-h-0 overflow-hidden mt-4">
              {/* Selection Controls */}
              <div className="flex items-center justify-between mb-4 p-2 bg-muted/50 rounded-lg">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    checked={selectedEntries.size === entries.length && entries.length > 0}
                    onCheckedChange={(checked) => checked ? selectAllEntries() : clearSelection()}
                  />
                  <span className="text-sm text-muted-foreground">
                    {selectedEntries.size === 0
                      ? 'Select entries for batch operations'
                      : `${selectedEntries.size} selected`
                    }
                  </span>
                </div>
                <div className="flex items-center space-x-2">
                  <Button variant="outline" size="sm" onClick={selectAllEntries}>
                    <CheckSquare className="h-4 w-4 mr-1" />
                    All
                  </Button>
                  <Button variant="outline" size="sm" onClick={clearSelection}>
                    <Square className="h-4 w-4 mr-1" />
                    Clear
                  </Button>
                </div>
              </div>

              <div className="space-y-2 h-full overflow-y-auto pr-1">
            {entries.map((entry, index) => (
              <div
                key={entry.index}
                className={`
                  p-3 border rounded-lg transition-colors cursor-pointer
                  ${selectedEntry === index ? 'border-blue-500 bg-blue-50 dark:bg-blue-950/30' : 'border-gray-200 dark:border-border hover:border-gray-300 dark:hover:border-muted-foreground'}
                  ${selectedEntries.has(index) ? 'ring-2 ring-primary bg-primary/5' : ''}
                  ${regeneratingEntries.has(index) ? 'ring-2 ring-purple-500 bg-purple-50 dark:bg-purple-950/30' : ''}
                  ${currentEntry?.index === entry.index ? 'ring-2 ring-green-500' : ''}
                `}
                onClick={() => setSelectedEntry(index)}
              >
                <div className="flex items-start justify-between">
                  {/* Selection Checkbox */}
                  <div className="flex items-start space-x-3 flex-1">
                    <Checkbox
                      checked={selectedEntries.has(index)}
                      onCheckedChange={() => toggleEntrySelection(index)}
                      onClick={(e) => e.stopPropagation()}
                      className="mt-1"
                    />
                    <div className="flex-1 space-y-2">
                    {/* Timing */}
                    <div className="flex items-center space-x-4 text-sm text-gray-600 dark:text-muted-foreground">
                      <Badge variant="outline" className="text-xs">
                        #{entry.index}
                      </Badge>
                      <span className="flex items-center">
                        <Clock className="h-3 w-3 mr-1" />
                        {entry.startTime} → {entry.endTime}
                      </span>
                      {regeneratingEntries.has(index) && (
                        <Badge variant="secondary" className="text-xs bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200">
                          <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                          Regenerating...
                        </Badge>
                      )}
                      {entry.isEdited && !regeneratingEntries.has(index) && (
                        <Badge variant="secondary" className="text-xs">
                          Edited
                        </Badge>
                      )}
                      {entry.confidence && (
                        <Badge variant="outline" className="text-xs">
                          <Star className="h-3 w-3 mr-1" />
                          {Math.round(entry.confidence * 100)}%
                        </Badge>
                      )}
                    </div>
                    
                    {/* Text */}
                    {editingEntry === index ? (
                      <div className="space-y-2">
                        <Textarea
                          value={entry.text}
                          onChange={(e) => updateEntry(index, { text: e.target.value })}
                          onBlur={() => setEditingEntry(null)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter' && e.ctrlKey) {
                              setEditingEntry(null)
                            }
                            if (e.key === 'Escape') {
                              setEditingEntry(null)
                            }
                          }}
                          className="min-h-[60px]"
                          autoFocus
                        />
                        <div className="flex space-x-2">
                          <Input
                            value={entry.startTime}
                            onChange={(e) => updateEntry(index, { startTime: e.target.value })}
                            className="text-xs"
                            placeholder="Start time"
                          />
                          <Input
                            value={entry.endTime}
                            onChange={(e) => updateEntry(index, { endTime: e.target.value })}
                            className="text-xs"
                            placeholder="End time"
                          />
                        </div>
                      </div>
                    ) : (
                      <div
                        className="cursor-text"
                        onClick={(e) => {
                          e.stopPropagation()
                          setEditingEntry(index)
                        }}
                      >
                        <p className="text-sm">{entry.text}</p>
                        {showOriginal && originalEntries && originalEntries[index] && (
                          <p className="text-xs text-gray-500 mt-1">
                            Original: {originalEntries[index].text}
                          </p>
                        )}
                      </div>
                    )}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center space-x-1 ml-4">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation()
                        regenerateEntry(index)
                      }}
                      disabled={regeneratingEntries.has(index) || !originalEntries?.[index]?.text}
                      title="Regenerate translation with AI"
                      className="text-purple-600 hover:text-purple-700 hover:bg-purple-50 dark:text-purple-400 dark:hover:text-purple-300 dark:hover:bg-purple-950/30"
                    >
                      {regeneratingEntries.has(index) ? (
                        <Loader2 className="h-3 w-3 animate-spin" />
                      ) : (
                        <Sparkles className="h-3 w-3" />
                      )}
                    </Button>

                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation()
                        addEntry(index)
                      }}
                      title="Add subtitle after this one"
                    >
                      <Plus className="h-3 w-3" />
                    </Button>

                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation()
                        deleteEntry(index)
                      }}
                      title="Delete this subtitle"
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
              </div>
            </TabsContent>

            <TabsContent value="batch" className="flex-1 min-h-0 overflow-hidden mt-4">
              <div className="h-full overflow-y-auto space-y-6">
                {/* AI Regeneration Panel */}
                <div className="bg-gradient-to-r from-purple-50 to-blue-50 dark:from-purple-950/20 dark:to-blue-950/20 p-6 rounded-lg border border-purple-200 dark:border-purple-800">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-2">
                      <Sparkles className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                      <h3 className="font-semibold text-purple-900 dark:text-purple-100">AI Regeneration</h3>
                    </div>
                    <Badge variant="secondary" className="bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200">
                      {selectedEntries.size} selected
                    </Badge>
                  </div>

                  <p className="text-sm text-purple-700 dark:text-purple-300 mb-4">
                    Regenerate translations for selected subtitles using AI. This will create new translations from the original text.
                  </p>

                  <Button
                    onClick={() => {
                      if (selectedEntries.size === 0) {
                        toast.error('Please select subtitles to regenerate')
                        return
                      }

                      // Regenerate all selected entries
                      Array.from(selectedEntries).forEach(index => {
                        regenerateEntry(index)
                      })
                    }}
                    disabled={selectedEntries.size === 0 || regeneratingEntries.size > 0}
                    className="bg-purple-600 hover:bg-purple-700 text-white"
                  >
                    {regeneratingEntries.size > 0 ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Regenerating {regeneratingEntries.size} subtitles...
                      </>
                    ) : (
                      <>
                        <Sparkles className="h-4 w-4 mr-2" />
                        Regenerate Selected ({selectedEntries.size})
                      </>
                    )}
                  </Button>
                </div>

                {/* Search and Replace Panel */}
                <SearchAndReplacePanel
                  entries={entries}
                  onEntriesChange={onEntriesChange}
                />
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  )
}
