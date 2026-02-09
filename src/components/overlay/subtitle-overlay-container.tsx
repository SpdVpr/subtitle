'use client'

import React, { useState, useEffect, useCallback } from 'react'
import { SubtitleOverlay } from './subtitle-overlay'
import { OverlayControls } from './overlay-controls'
import { 
  OverlayConfiguration, 
  OverlaySubtitleEntry,
  DEFAULT_OVERLAY_CONFIGURATION 
} from '@/types/subtitle'
import { SubtitleProcessor } from '@/lib/subtitle-processor'
import { toast } from 'sonner'

interface SubtitleOverlayContainerProps {
  className?: string
}

export function SubtitleOverlayContainer({ className }: SubtitleOverlayContainerProps) {
  const [configuration, setConfiguration] = useState<OverlayConfiguration>(DEFAULT_OVERLAY_CONFIGURATION)
  const [entries, setEntries] = useState<OverlaySubtitleEntry[]>([])
  const [currentTime, setCurrentTime] = useState(0)
  const [isControlsVisible, setIsControlsVisible] = useState(true)

  // Load saved configuration on mount
  useEffect(() => {
    try {
      const savedConfig = localStorage.getItem('subtitle-overlay-config')
      if (savedConfig) {
        const parsedConfig = JSON.parse(savedConfig)
        setConfiguration({ ...DEFAULT_OVERLAY_CONFIGURATION, ...parsedConfig })
      }
    } catch (error) {
      console.warn('Failed to load saved configuration:', error)
    }
  }, [])

  // Save configuration changes
  const handleConfigurationChange = useCallback((newConfig: OverlayConfiguration) => {
    setConfiguration(newConfig)
    try {
      localStorage.setItem('subtitle-overlay-config', JSON.stringify(newConfig))
    } catch (error) {
      console.warn('Failed to save configuration:', error)
    }
  }, [])

  // Convert subtitle entries to overlay entries with timing calculations
  const convertToOverlayEntries = useCallback((subtitleEntries: any[]): OverlaySubtitleEntry[] => {
    return subtitleEntries.map(entry => {
      const startMs = SubtitleProcessor.timeToMilliseconds(entry.startTime)
      const endMs = SubtitleProcessor.timeToMilliseconds(entry.endTime)
      
      return {
        ...entry,
        displayStartTime: startMs,
        displayEndTime: endMs
      }
    })
  }, [])

  // Handle file upload with enhanced validation and processing
  const handleFileUpload = useCallback(async (file: File) => {
    try {
      // Validate file type and size
      if (!file.name.toLowerCase().endsWith('.srt')) {
        toast.error('Please select a valid SRT subtitle file')
        return
      }

      if (file.size > 10 * 1024 * 1024) { // 10MB limit
        toast.error('File size too large. Please select a file smaller than 10MB')
        return
      }

      toast.info('Processing subtitle file...')

      const subtitleFile = await SubtitleProcessor.processFile(file)

      // Validate subtitle content
      if (subtitleFile.entries.length === 0) {
        toast.error('No valid subtitle entries found in the file')
        return
      }

      const overlayEntries = convertToOverlayEntries(subtitleFile.entries)
      setEntries(overlayEntries)

      // Store file info in localStorage for persistence
      localStorage.setItem('subtitle-overlay-file', JSON.stringify({
        name: file.name,
        size: file.size,
        entryCount: overlayEntries.length,
        loadedAt: new Date().toISOString()
      }))

      toast.success(`Successfully loaded ${overlayEntries.length} subtitle entries from "${file.name}"`)
    } catch (error) {
      console.error('Failed to load subtitle file:', error)
      toast.error('Failed to load subtitle file. Please check the format and try again.')
    }
  }, [convertToOverlayEntries])

  // Export settings to JSON
  const handleExportSettings = useCallback(() => {
    const settings = {
      configuration,
      timestamp: new Date().toISOString(),
      version: '1.0'
    }
    
    const blob = new Blob([JSON.stringify(settings, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'subtitle-overlay-settings.json'
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
    
    toast.success('Settings exported successfully')
  }, [configuration])

  // Import settings from JSON
  const handleImportSettings = useCallback((importedConfig: OverlayConfiguration) => {
    handleConfigurationChange(importedConfig)
    toast.success('Settings imported successfully')
  }, [handleConfigurationChange])

  // Load subtitles from session storage (from translation results)
  const loadFromTranslationResults = useCallback(() => {
    try {
      const translatedContent = sessionStorage.getItem('translatedSubtitleContent')
      if (translatedContent) {
        const entries = SubtitleProcessor.parseSRT(translatedContent)
        const overlayEntries = convertToOverlayEntries(entries)
        setEntries(overlayEntries)
        toast.success(`Loaded ${overlayEntries.length} subtitles from translation results`)
      } else {
        toast.info('No translation results found. Please translate a subtitle file first.')
      }
    } catch (error) {
      console.error('Failed to load from translation results:', error)
      toast.error('Failed to load translation results')
    }
  }, [convertToOverlayEntries])

  // Check for translation results on mount
  useEffect(() => {
    const hasTranslationResults = sessionStorage.getItem('translatedSubtitleContent')
    if (hasTranslationResults && entries.length === 0) {
      // Auto-load if no subtitles are currently loaded
      setTimeout(() => {
        if (entries.length === 0) { // Double-check to avoid race conditions
          loadFromTranslationResults()
        }
      }, 1000)
    }
  }, [])

  // Simulate time progression for demo purposes
  useEffect(() => {
    if (entries.length === 0) return

    const interval = setInterval(() => {
      setCurrentTime(prev => {
        const maxTime = Math.max(...entries.map(e => e.displayEndTime)) / 1000
        return prev >= maxTime ? 0 : prev + 0.1
      })
    }, 100)

    return () => clearInterval(interval)
  }, [entries])

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.ctrlKey || e.metaKey) {
        switch (e.key) {
          case 'h':
            e.preventDefault()
            setIsControlsVisible(prev => !prev)
            break
          case 'l':
            e.preventDefault()
            setConfiguration(prev => ({ ...prev, locked: !prev.locked }))
            break
          case 'v':
            e.preventDefault()
            setConfiguration(prev => ({ ...prev, visible: !prev.visible }))
            break
        }
      }
      
      // Arrow keys for time navigation
      if (!e.ctrlKey && !e.metaKey) {
        switch (e.key) {
          case 'ArrowLeft':
            e.preventDefault()
            setCurrentTime(prev => Math.max(0, prev - 5))
            break
          case 'ArrowRight':
            e.preventDefault()
            setCurrentTime(prev => prev + 5)
            break
          case ' ':
            e.preventDefault()
            // Toggle play/pause would go here if we had video integration
            break
        }
      }
    }

    document.addEventListener('keydown', handleKeyPress)
    return () => document.removeEventListener('keydown', handleKeyPress)
  }, [])

  return (
    <div className={className}>
      {/* Subtitle Overlay */}
      <SubtitleOverlay
        entries={entries}
        configuration={configuration}
        onConfigurationChange={handleConfigurationChange}
        currentTime={currentTime}
      />

      {/* Controls Panel */}
      {isControlsVisible && (
        <div className="fixed top-4 right-4 z-50">
          <OverlayControls
            configuration={configuration}
            onConfigurationChange={handleConfigurationChange}
            onFileUpload={handleFileUpload}
            onExportSettings={handleExportSettings}
            onImportSettings={handleImportSettings}
            onLoadFromTranslation={loadFromTranslationResults}
          />
        </div>
      )}

      {/* Demo Controls */}
      {entries.length > 0 && (
        <div className="fixed bottom-4 left-4 right-4 z-50">
          <div className="bg-black/80 backdrop-blur-sm rounded-lg p-4 text-white">
            <div className="flex items-center space-x-4">
              <div className="text-sm">
                Time: {Math.floor(currentTime / 60)}:{Math.floor(currentTime % 60).toString().padStart(2, '0')}
              </div>
              <input
                type="range"
                min="0"
                max={Math.max(...entries.map(e => e.displayEndTime)) / 1000}
                value={currentTime}
                onChange={(e) => setCurrentTime(parseFloat(e.target.value))}
                className="flex-1"
              />
              <div className="text-sm">
                {entries.length} subtitles loaded
              </div>
            </div>
            <div className="text-xs text-gray-300 mt-2">
              Keyboard shortcuts: Ctrl+H (toggle controls), Ctrl+L (lock/unlock), Ctrl+V (show/hide), ←/→ (seek)
            </div>
          </div>
        </div>
      )}

      {/* Instructions */}
      {entries.length === 0 && (
        <div className="fixed inset-0 flex items-center justify-center z-40 pointer-events-none">
          <div className="bg-black/80 backdrop-blur-sm rounded-lg p-8 text-white text-center max-w-md">
            <h2 className="text-2xl font-bold mb-4">Subtitle Overlay</h2>
            <p className="text-gray-300 mb-4">
              Load a subtitle file (.srt) using the controls panel to get started.
            </p>
            <p className="text-sm text-gray-400">
              This overlay can be used with any video player or streaming service.
              Simply position it where you want your subtitles to appear.
            </p>
          </div>
        </div>
      )}
    </div>
  )
}
