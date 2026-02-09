'use client'

import React, { useState, useEffect, useRef, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  OverlayConfiguration, 
  OverlaySubtitleEntry, 
  OverlayState,
  DEFAULT_OVERLAY_CONFIGURATION 
} from '@/types/subtitle'
import { cn } from '@/lib/utils'

interface SubtitleOverlayProps {
  entries: OverlaySubtitleEntry[]
  configuration: OverlayConfiguration
  onConfigurationChange: (config: OverlayConfiguration) => void
  currentTime: number
  className?: string
}

export function SubtitleOverlay({
  entries,
  configuration,
  onConfigurationChange,
  currentTime,
  className
}: SubtitleOverlayProps) {
  const [isDragging, setIsDragging] = useState(false)
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 })
  const [currentEntry, setCurrentEntry] = useState<OverlaySubtitleEntry | null>(null)
  const overlayRef = useRef<HTMLDivElement>(null)
  const dragStartRef = useRef({ x: 0, y: 0 })

  // Find current subtitle entry based on time with advanced synchronization
  useEffect(() => {
    const { offset, speedMultiplier } = configuration.synchronization

    // Apply speed multiplier and offset
    const adjustedTime = ((currentTime * speedMultiplier) * 1000) + offset

    // Find the entry that should be displayed at this time
    const entry = entries.find(entry => {
      const entryStart = entry.displayStartTime
      const entryEnd = entry.displayEndTime

      return adjustedTime >= entryStart && adjustedTime <= entryEnd
    })

    setCurrentEntry(entry || null)
  }, [currentTime, entries, configuration.synchronization])

  // Handle drag start
  const handleDragStart = useCallback((e: React.MouseEvent) => {
    if (configuration.locked) return
    
    e.preventDefault()
    setIsDragging(true)
    
    const rect = overlayRef.current?.getBoundingClientRect()
    if (rect) {
      dragStartRef.current = {
        x: e.clientX - rect.left,
        y: e.clientY - rect.top
      }
    }
  }, [configuration.locked])

  // Handle drag move
  const handleDragMove = useCallback((e: MouseEvent) => {
    if (!isDragging) return

    const viewportWidth = window.innerWidth
    const viewportHeight = window.innerHeight
    const overlayRect = overlayRef.current?.getBoundingClientRect()

    if (!overlayRect) return

    let newX = ((e.clientX - dragStartRef.current.x) / viewportWidth) * 100
    let newY = ((e.clientY - dragStartRef.current.y) / viewportHeight) * 100

    // Constrain to viewport with overlay dimensions
    const overlayWidthPercent = (overlayRect.width / viewportWidth) * 100
    const overlayHeightPercent = (overlayRect.height / viewportHeight) * 100

    newX = Math.max(0, Math.min(100 - overlayWidthPercent, newX))
    newY = Math.max(0, Math.min(100 - overlayHeightPercent, newY))

    // Enhanced snap to edges with magnetic effect
    if (configuration.snapToEdges) {
      const snapThreshold = 8 // percentage
      const magneticForce = 2 // pixels of magnetic pull

      // Horizontal snapping
      if (newX < snapThreshold) {
        newX = 0
      } else if (newX > 100 - overlayWidthPercent - snapThreshold) {
        newX = 100 - overlayWidthPercent
      } else if (Math.abs(newX - 50 + overlayWidthPercent/2) < snapThreshold) {
        // Snap to center
        newX = 50 - overlayWidthPercent/2
      }

      // Vertical snapping
      if (newY < snapThreshold) {
        newY = 0
      } else if (newY > 100 - overlayHeightPercent - snapThreshold) {
        newY = 100 - overlayHeightPercent
      } else if (Math.abs(newY - 50 + overlayHeightPercent/2) < snapThreshold) {
        // Snap to center
        newY = 50 - overlayHeightPercent/2
      }
    }

    // Update anchor based on position for better UX
    let newAnchor = configuration.position.anchor
    if (newX < 33 && newY < 33) newAnchor = 'top-left'
    else if (newX > 66 && newY < 33) newAnchor = 'top-right'
    else if (newX < 33 && newY > 66) newAnchor = 'bottom-left'
    else if (newX > 66 && newY > 66) newAnchor = 'bottom-right'
    else if (newY < 33) newAnchor = 'top-center'
    else if (newY > 66) newAnchor = 'bottom-center'
    else if (newX < 33) newAnchor = 'center-left'
    else if (newX > 66) newAnchor = 'center-right'
    else newAnchor = 'center'

    onConfigurationChange({
      ...configuration,
      position: {
        ...configuration.position,
        x: newX,
        y: newY,
        anchor: newAnchor
      }
    })
  }, [isDragging, configuration, onConfigurationChange])

  // Handle drag end
  const handleDragEnd = useCallback(() => {
    setIsDragging(false)
  }, [])

  // Set up drag event listeners
  useEffect(() => {
    if (isDragging) {
      document.addEventListener('mousemove', handleDragMove)
      document.addEventListener('mouseup', handleDragEnd)
      
      return () => {
        document.removeEventListener('mousemove', handleDragMove)
        document.removeEventListener('mouseup', handleDragEnd)
      }
    }
  }, [isDragging, handleDragMove, handleDragEnd])

  // Calculate position styles
  const getPositionStyles = () => {
    const { x, y, anchor } = configuration.position
    
    const styles: React.CSSProperties = {
      position: 'fixed',
      zIndex: 9999,
      pointerEvents: configuration.locked ? 'none' : 'auto',
    }

    // Set position based on anchor
    switch (anchor) {
      case 'top-left':
        styles.left = `${x}%`
        styles.top = `${y}%`
        break
      case 'top-center':
        styles.left = `${x}%`
        styles.top = `${y}%`
        styles.transform = 'translateX(-50%)'
        break
      case 'top-right':
        styles.right = `${100 - x}%`
        styles.top = `${y}%`
        break
      case 'center-left':
        styles.left = `${x}%`
        styles.top = `${y}%`
        styles.transform = 'translateY(-50%)'
        break
      case 'center':
        styles.left = `${x}%`
        styles.top = `${y}%`
        styles.transform = 'translate(-50%, -50%)'
        break
      case 'center-right':
        styles.right = `${100 - x}%`
        styles.top = `${y}%`
        styles.transform = 'translateY(-50%)'
        break
      case 'bottom-left':
        styles.left = `${x}%`
        styles.bottom = `${100 - y}%`
        break
      case 'bottom-center':
        styles.left = `${x}%`
        styles.bottom = `${100 - y}%`
        styles.transform = 'translateX(-50%)'
        break
      case 'bottom-right':
        styles.right = `${100 - x}%`
        styles.bottom = `${100 - y}%`
        break
    }

    return styles
  }

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
      WebkitTextStroke: style.textOutline 
        ? `${style.textOutlineWidth}px ${style.textOutlineColor}`
        : 'none',
      padding: `${style.padding}px`,
      borderRadius: `${style.borderRadius}px`,
      maxWidth: `${style.maxWidth}vw`,
      textAlign: style.textAlign,
      lineHeight: style.lineHeight,
      whiteSpace: 'pre-wrap',
      wordWrap: 'break-word',
      userSelect: 'none',
      cursor: configuration.locked ? 'default' : 'move'
    }
  }

  if (!configuration.visible || !currentEntry) {
    return null
  }

  return (
    <AnimatePresence>
      <motion.div
        ref={overlayRef}
        className={cn('subtitle-overlay', className)}
        style={getPositionStyles()}
        onMouseDown={handleDragStart}
        initial={configuration.fadeInOut ? { opacity: 0 } : { opacity: 1 }}
        animate={{ opacity: 1 }}
        exit={configuration.fadeInOut ? { opacity: 0 } : { opacity: 1 }}
        transition={{ 
          duration: configuration.fadeInOutDuration / 1000,
          ease: 'easeInOut'
        }}
      >
        <div
          style={getTextStyles()}
          className={cn(
            'subtitle-text',
            isDragging && 'select-none'
          )}
        >
          {currentEntry.text}
        </div>
        
        {/* Enhanced drag indicators and visual feedback */}
        {!configuration.locked && (
          <>
            {/* Drag handle */}
            <div className="absolute -top-2 -right-2 w-4 h-4 bg-blue-500 rounded-full opacity-50 hover:opacity-100 transition-opacity cursor-move" />

            {/* Dragging state indicator */}
            {isDragging && (
              <div className="absolute inset-0 border-2 border-blue-400 border-dashed rounded animate-pulse" />
            )}

            {/* Corner resize indicators */}
            <div className="absolute -top-1 -left-1 w-2 h-2 bg-blue-400 rounded-full opacity-30" />
            <div className="absolute -top-1 -right-1 w-2 h-2 bg-blue-400 rounded-full opacity-30" />
            <div className="absolute -bottom-1 -left-1 w-2 h-2 bg-blue-400 rounded-full opacity-30" />
            <div className="absolute -bottom-1 -right-1 w-2 h-2 bg-blue-400 rounded-full opacity-30" />
          </>
        )}

        {/* Snap guides when dragging */}
        {isDragging && configuration.snapToEdges && (
          <>
            {/* Vertical center line */}
            <div className="fixed top-0 bottom-0 left-1/2 w-px bg-blue-400/50 z-[9998] pointer-events-none" />
            {/* Horizontal center line */}
            <div className="fixed left-0 right-0 top-1/2 h-px bg-blue-400/50 z-[9998] pointer-events-none" />
            {/* Edge guides */}
            <div className="fixed top-0 bottom-0 left-0 w-px bg-red-400/50 z-[9998] pointer-events-none" />
            <div className="fixed top-0 bottom-0 right-0 w-px bg-red-400/50 z-[9998] pointer-events-none" />
            <div className="fixed left-0 right-0 top-0 h-px bg-red-400/50 z-[9998] pointer-events-none" />
            <div className="fixed left-0 right-0 bottom-0 h-px bg-red-400/50 z-[9998] pointer-events-none" />
          </>
        )}
      </motion.div>
    </AnimatePresence>
  )
}
