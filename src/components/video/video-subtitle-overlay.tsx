'use client'

import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  OverlayConfiguration,
  OverlaySubtitleEntry
} from '@/types/subtitle'

interface VideoSubtitleOverlayProps {
  entries: OverlaySubtitleEntry[]
  configuration: OverlayConfiguration
  currentTime: number
  onConfigurationChange?: (config: OverlayConfiguration) => void
}

export function VideoSubtitleOverlay({
  entries,
  configuration,
  currentTime,
  onConfigurationChange
}: VideoSubtitleOverlayProps) {
  const [currentEntry, setCurrentEntry] = useState<OverlaySubtitleEntry | null>(null)
  const [isDragging, setIsDragging] = useState(false)
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 })
  const overlayRef = useRef<HTMLDivElement>(null)

  // Find current subtitle entry based on time with synchronization
  const adjustedCurrentEntry = useMemo(() => {
    if (entries.length === 0) return null

    const { offset, speedMultiplier } = configuration.synchronization
    const adjustedTime = ((currentTime * speedMultiplier) * 1000) + offset

    const entry = entries.find(entry =>
      adjustedTime >= entry.displayStartTime && adjustedTime <= entry.displayEndTime
    )

    return entry || null
  }, [currentTime, entries, configuration.synchronization])

  // Update current entry
  useEffect(() => {
    setCurrentEntry(adjustedCurrentEntry)
  }, [adjustedCurrentEntry])

  // Drag & Drop handlers
  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    if (!onConfigurationChange) return

    // Only start dragging if clicking directly on the subtitle text
    const target = e.target as HTMLElement
    if (!target.closest('.subtitle-text')) return

    setIsDragging(true)

    // Get the video container bounds for relative positioning
    const videoContainer = overlayRef.current?.closest('.relative')
    if (videoContainer) {
      const rect = videoContainer.getBoundingClientRect()
      setDragStart({
        x: e.clientX - rect.left - (configuration.position.x * rect.width / 100),
        y: e.clientY - rect.top - (configuration.position.y * rect.height / 100)
      })
    } else {
      setDragStart({
        x: e.clientX - (configuration.position.x * window.innerWidth / 100),
        y: e.clientY - (configuration.position.y * window.innerHeight / 100)
      })
    }

    e.preventDefault()
    e.stopPropagation()
  }, [configuration.position, onConfigurationChange])

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!isDragging || !onConfigurationChange) return

    // Get the video container bounds for relative positioning
    const videoContainer = overlayRef.current?.closest('.relative')
    if (videoContainer) {
      const rect = videoContainer.getBoundingClientRect()
      const newX = ((e.clientX - rect.left - dragStart.x) / rect.width) * 100
      const newY = ((e.clientY - rect.top - dragStart.y) / rect.height) * 100

      // Clamp values to keep subtitle within video container
      const clampedX = Math.max(0, Math.min(100, newX))
      const clampedY = Math.max(0, Math.min(100, newY))

      onConfigurationChange({
        ...configuration,
        position: {
          ...configuration.position,
          x: clampedX,
          y: clampedY
        }
      })
    }
  }, [isDragging, dragStart, configuration, onConfigurationChange])

  const handleMouseUp = useCallback(() => {
    setIsDragging(false)
  }, [])

  // Add global mouse event listeners for dragging
  useEffect(() => {
    if (isDragging) {
      const handleMouseMoveGlobal = (e: MouseEvent) => {
        e.preventDefault()
        handleMouseMove(e)
      }

      const handleMouseUpGlobal = (e: MouseEvent) => {
        e.preventDefault()
        handleMouseUp()
      }

      document.addEventListener('mousemove', handleMouseMoveGlobal, { passive: false })
      document.addEventListener('mouseup', handleMouseUpGlobal, { passive: false })
      document.addEventListener('mouseleave', handleMouseUpGlobal, { passive: false })

      // Prevent text selection during drag
      document.body.style.userSelect = 'none'
      document.body.style.cursor = 'grabbing'

      return () => {
        document.removeEventListener('mousemove', handleMouseMoveGlobal)
        document.removeEventListener('mouseup', handleMouseUpGlobal)
        document.removeEventListener('mouseleave', handleMouseUpGlobal)
        document.body.style.userSelect = ''
        document.body.style.cursor = ''
      }
    }
  }, [isDragging, handleMouseMove, handleMouseUp])

  // Calculate text styles based on configuration
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
      padding: `${style.padding}px ${style.padding * 1.5}px`,
      borderRadius: `${style.borderRadius}px`,
      textAlign: style.textAlign,
      lineHeight: style.lineHeight,
      whiteSpace: 'pre-wrap' as const,
      wordWrap: 'break-word' as const,
      userSelect: 'none' as const,
      maxWidth: `${style.maxWidth}%`,
      wordBreak: 'break-word' as const,
      display: 'inline-block'
    }
  }

  // Calculate position styles based on configuration
  const getPositionStyles = (): React.CSSProperties => {
    const { position } = configuration
    
    const styles: React.CSSProperties = {
      position: 'absolute',
      zIndex: 10,
      pointerEvents: 'none'
    }

    // Set position based on anchor
    switch (position.anchor) {
      case 'top-left':
        styles.left = `${position.x}%`
        styles.top = `${position.y}%`
        break
      case 'top-center':
        styles.left = `${position.x}%`
        styles.top = `${position.y}%`
        styles.transform = 'translateX(-50%)'
        break
      case 'top-right':
        styles.right = `${100 - position.x}%`
        styles.top = `${position.y}%`
        break
      case 'center-left':
        styles.left = `${position.x}%`
        styles.top = `${position.y}%`
        styles.transform = 'translateY(-50%)'
        break
      case 'center':
        styles.left = `${position.x}%`
        styles.top = `${position.y}%`
        styles.transform = 'translate(-50%, -50%)'
        break
      case 'center-right':
        styles.right = `${100 - position.x}%`
        styles.top = `${position.y}%`
        styles.transform = 'translateY(-50%)'
        break
      case 'bottom-left':
        styles.left = `${position.x}%`
        styles.bottom = `${100 - position.y}%`
        break
      case 'bottom-center':
        styles.left = `${position.x}%`
        styles.bottom = `${100 - position.y}%`
        styles.transform = 'translateX(-50%)'
        break
      case 'bottom-right':
        styles.right = `${100 - position.x}%`
        styles.bottom = `${100 - position.y}%`
        break
    }

    return styles
  }

  if (!configuration.visible || !currentEntry) {
    return null
  }

  return (
    <div
      className="absolute inset-0 pointer-events-none"
      style={{ zIndex: 10 }}
    >
      <div
        ref={overlayRef}
        style={getPositionStyles()}
        className="pointer-events-none"
      >
        <AnimatePresence mode="wait">
          <motion.div
            key={currentEntry.index}
            initial={configuration.fadeInOut ? { opacity: 0, y: 10 } : { opacity: 1 }}
            animate={{ opacity: 1, y: 0 }}
            exit={configuration.fadeInOut ? { opacity: 0, y: -10 } : { opacity: 1 }}
            transition={{
              duration: configuration.fadeInOutDuration / 1000,
              ease: 'easeInOut'
            }}
            style={{
              ...getTextStyles(),
              userSelect: 'none',
              cursor: onConfigurationChange ? (isDragging ? 'grabbing' : 'grab') : 'default',
              pointerEvents: onConfigurationChange ? 'auto' : 'none',
              opacity: isDragging ? 0.8 : 1,
              transform: isDragging ? 'scale(1.05)' : 'scale(1)',
              transition: isDragging ? 'none' : 'transform 0.2s ease, opacity 0.2s ease'
            }}
            className="subtitle-text"
            onMouseDown={handleMouseDown}
          >
            {currentEntry.text}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  )
}
