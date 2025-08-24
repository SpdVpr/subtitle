'use client'

import React, { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  OverlayConfiguration, 
  OverlaySubtitleEntry,
  DEFAULT_OVERLAY_CONFIGURATION 
} from '@/types/subtitle'
import { Eye, EyeOff, Move, Settings, X } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface PopupMessage {
  type: 'INIT' | 'UPDATE_CONFIG' | 'UPDATE_TIME'
  entries?: OverlaySubtitleEntry[]
  configuration?: OverlayConfiguration
  currentTime?: number
}

export function SubtitlePopupOverlay() {
  const [configuration, setConfiguration] = useState<OverlayConfiguration>(DEFAULT_OVERLAY_CONFIGURATION)
  const [entries, setEntries] = useState<OverlaySubtitleEntry[]>([])
  const [currentTime, setCurrentTime] = useState(0)
  const [currentEntry, setCurrentEntry] = useState<OverlaySubtitleEntry | null>(null)
  const [showControls, setShowControls] = useState(true)
  const [isDragging, setIsDragging] = useState(false)
  const [subtitlePosition, setSubtitlePosition] = useState({ x: 50, y: 85 }) // percentage

  // Load saved position on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem('subtitle-popup-position')
      if (saved) {
        const position = JSON.parse(saved)
        setSubtitlePosition(position)
      }
    } catch (error) {
      console.warn('Failed to load saved position:', error)
    }
  }, [])

  // Save position when it changes
  const updatePosition = (newPosition: { x: number, y: number }) => {
    setSubtitlePosition(newPosition)
    try {
      localStorage.setItem('subtitle-popup-position', JSON.stringify(newPosition))
    } catch (error) {
      console.warn('Failed to save position:', error)
    }
  }

  // Listen for messages from parent window
  useEffect(() => {
    const handleMessage = (event: MessageEvent<PopupMessage>) => {
      // Security check - only accept messages from same origin
      if (event.origin !== window.location.origin) return

      const { type, entries: newEntries, configuration: newConfig, currentTime: newTime } = event.data

      switch (type) {
        case 'INIT':
          if (newEntries) setEntries(newEntries)
          if (newConfig) setConfiguration(newConfig)
          if (typeof newTime === 'number') setCurrentTime(newTime)
          break
        case 'UPDATE_CONFIG':
          if (newConfig) setConfiguration(newConfig)
          break
        case 'UPDATE_TIME':
          if (typeof newTime === 'number') setCurrentTime(newTime)
          break
      }
    }

    window.addEventListener('message', handleMessage)
    return () => window.removeEventListener('message', handleMessage)
  }, [])

  // Find current subtitle entry based on time
  useEffect(() => {
    const { offset, speedMultiplier } = configuration.synchronization
    const adjustedTime = ((currentTime * speedMultiplier) * 1000) + offset
    
    const entry = entries.find(entry => 
      adjustedTime >= entry.displayStartTime && adjustedTime <= entry.displayEndTime
    )
    
    setCurrentEntry(entry || null)
  }, [currentTime, entries, configuration.synchronization])

  // Auto-hide controls after 3 seconds of inactivity
  useEffect(() => {
    if (!showControls) return

    const timer = setTimeout(() => {
      setShowControls(false)
    }, 3000)

    return () => clearTimeout(timer)
  }, [showControls])

  // Show controls on mouse movement
  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (!showControls) {
      setShowControls(true)
    }

    // Handle dragging
    if (isDragging && e.buttons === 1) {
      const rect = e.currentTarget.getBoundingClientRect()
      const x = ((e.clientX - rect.left) / rect.width) * 100
      const y = ((e.clientY - rect.top) / rect.height) * 100

      // Constrain to viewport
      const constrainedX = Math.max(5, Math.min(95, x))
      const constrainedY = Math.max(5, Math.min(95, y))

      updatePosition({ x: constrainedX, y: constrainedY })
    }
  }, [showControls, isDragging])

  // Handle mouse down for dragging
  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    if (isDragging) {
      e.preventDefault()
      // Start dragging will be handled by mousemove
    }
  }, [isDragging])

  // Stop dragging on mouse up
  const handleMouseUp = useCallback(() => {
    // Dragging stops automatically when mouse is released
  }, [])

  // Calculate text styles
  const getTextStyles = (): React.CSSProperties => {
    const { style } = configuration
    
    return {
      fontSize: `${style.fontSize}px`,
      fontFamily: style.fontFamily,
      fontWeight: style.fontWeight,
      color: style.color,
      backgroundColor: `${style.backgroundColor}${Math.round(style.backgroundOpacity * 255).toString(16).padStart(2, '0')}`,
      textShadow: style.textShadow 
        ? `${style.textShadowBlur}px ${style.textShadowBlur}px ${style.textShadowBlur}px ${style.textShadowColor}`
        : 'none',
      padding: `${style.padding}px`,
      borderRadius: `${style.borderRadius}px`,
      textAlign: style.textAlign,
      lineHeight: style.lineHeight,
      whiteSpace: 'pre-wrap' as const,
      wordWrap: 'break-word' as const,
      userSelect: 'none' as const,
      maxWidth: '90vw',
      wordBreak: 'break-word' as const
    }
  }

  // Close window
  const closeWindow = () => {
    window.close()
  }

  // Toggle visibility
  const toggleVisibility = () => {
    setConfiguration(prev => ({
      ...prev,
      visible: !prev.visible
    }))
  }

  return (
    <div
      className={`fixed inset-0 ${isDragging ? 'pointer-events-auto cursor-move' : 'pointer-events-none'}`}
      onMouseMove={handleMouseMove}
      onMouseDown={handleMouseDown}
      onMouseUp={handleMouseUp}
      style={{
        background: 'transparent',
        overflow: 'hidden'
      }}
    >
      {/* Subtitle Display */}
      <div
        className="absolute pointer-events-none"
        style={{
          left: `${subtitlePosition.x}%`,
          top: `${subtitlePosition.y}%`,
          transform: 'translate(-50%, -50%)'
        }}
      >
        <AnimatePresence>
          {configuration.visible && currentEntry && (
            <motion.div
              initial={configuration.fadeInOut ? { opacity: 0, y: 20 } : { opacity: 1 }}
              animate={{ opacity: 1, y: 0 }}
              exit={configuration.fadeInOut ? { opacity: 0, y: -20 } : { opacity: 1 }}
              transition={{
                duration: configuration.fadeInOutDuration / 1000,
                ease: 'easeInOut'
              }}
              style={getTextStyles()}
              className="subtitle-text"
            >
              {currentEntry.text}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Control Panel */}
      <AnimatePresence>
        {showControls && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="absolute top-4 right-4 pointer-events-auto"
          >
            <div className="bg-black/80 backdrop-blur-sm rounded-lg p-3 flex items-center space-x-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={toggleVisibility}
                className="text-white hover:bg-white/20"
              >
                {configuration.visible ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
              </Button>
              
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsDragging(!isDragging)}
                className="text-white hover:bg-white/20"
              >
                <Move className="h-4 w-4" />
              </Button>
              
              <Button
                variant="ghost"
                size="sm"
                onClick={closeWindow}
                className="text-white hover:bg-white/20"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Status Display */}
      {entries.length === 0 && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="bg-black/80 backdrop-blur-sm rounded-lg p-8 text-white text-center max-w-md">
            <h2 className="text-xl font-bold mb-4">Subtitle Overlay Ready</h2>
            <p className="text-gray-300 mb-4">
              Waiting for subtitle data from the main window...
            </p>
            <p className="text-sm text-gray-400">
              Position this window over your video and load subtitles in the main window.
            </p>
          </div>
        </div>
      )}

      {/* Drag Instructions */}
      {isDragging && (
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 pointer-events-none">
          <div className="bg-blue-500/90 backdrop-blur-sm rounded-lg p-4 text-white text-center">
            <Move className="h-8 w-8 mx-auto mb-2" />
            <p className="font-semibold">Drag Mode Active</p>
            <p className="text-sm opacity-90">Drag this window to reposition</p>
          </div>
        </div>
      )}

      {/* Current subtitle info for debugging */}
      {process.env.NODE_ENV === 'development' && currentEntry && (
        <div className="absolute bottom-4 left-4 bg-black/80 backdrop-blur-sm rounded p-2 text-white text-xs pointer-events-none">
          <div>Entry: {currentEntry.index}</div>
          <div>Time: {Math.floor(currentTime)}s</div>
          <div>Entries: {entries.length}</div>
        </div>
      )}
    </div>
  )
}
