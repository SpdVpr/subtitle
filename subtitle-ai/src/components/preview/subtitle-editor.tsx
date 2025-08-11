'use client'

import { useState, useRef, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { SubtitleEntry } from '@/types/preview'
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
  Star
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

  return (
    <div className="space-y-6">
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
                
                <span className="text-sm text-gray-600">
                  {Math.floor(currentTime / 60)}:{Math.floor(currentTime % 60).toString().padStart(2, '0')}
                </span>
              </div>
              
              {/* Current Subtitle Display */}
              {currentEntry && (
                <div className="bg-black bg-opacity-80 text-white p-4 rounded-lg text-center">
                  <p className="text-lg">{currentEntry.text}</p>
                  {showOriginal && originalEntries && (
                    <p className="text-sm text-gray-300 mt-2">
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
      <Card>
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
        <CardContent>
          <div className="space-y-2 max-h-96 overflow-y-auto">
            {entries.map((entry, index) => (
              <div
                key={entry.index}
                className={`
                  p-3 border rounded-lg transition-colors cursor-pointer
                  ${selectedEntry === index ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-gray-300'}
                  ${currentEntry?.index === entry.index ? 'ring-2 ring-green-500' : ''}
                `}
                onClick={() => setSelectedEntry(index)}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1 space-y-2">
                    {/* Timing */}
                    <div className="flex items-center space-x-4 text-sm text-gray-600">
                      <Badge variant="outline" className="text-xs">
                        #{entry.index}
                      </Badge>
                      <span className="flex items-center">
                        <Clock className="h-3 w-3 mr-1" />
                        {entry.startTime} → {entry.endTime}
                      </span>
                      {entry.isEdited && (
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
                  
                  {/* Actions */}
                  <div className="flex items-center space-x-1 ml-4">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation()
                        jumpToEntry(entry)
                      }}
                      title="Jump to this subtitle"
                    >
                      <Play className="h-3 w-3" />
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
        </CardContent>
      </Card>
    </div>
  )
}
