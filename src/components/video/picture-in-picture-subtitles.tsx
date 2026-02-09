'use client'

import React, { useState, useCallback, useRef, useEffect, useMemo } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { PictureInPicture2, X, Settings, Play, Pause, ChevronLeft, ChevronRight } from 'lucide-react'
import { VideoSubtitleOverlay } from './video-subtitle-overlay'
import { SubtitleStyleBar } from './subtitle-style-bar'
import { toast } from 'sonner'
import { OverlaySubtitleEntry, OverlayConfiguration } from '@/types/subtitle'

interface PictureInPictureSubtitlesProps {
  entries: OverlaySubtitleEntry[]
  configuration: OverlayConfiguration
  currentTime: number
  isPlaying: boolean
  onConfigurationChange: (config: OverlayConfiguration) => void
  onTimeUpdate?: (time: number) => void
  onPlayStateChange?: (playing: boolean) => void
}

export function PictureInPictureSubtitles({
  entries,
  configuration,
  currentTime,
  isPlaying,
  onConfigurationChange,
  onTimeUpdate,
  onPlayStateChange
}: PictureInPictureSubtitlesProps) {
  const [isPipActive, setIsPipActive] = useState(false)
  const [pipSupported, setPipSupported] = useState(false)
  const [isClient, setIsClient] = useState(false)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const videoRef = useRef<HTMLVideoElement>(null)
  const animationRef = useRef<number>()
  const currentTimeRef = useRef<number>(currentTime)


  // Update currentTime ref when prop changes
  useEffect(() => {
    currentTimeRef.current = currentTime
  }, [currentTime])

  // Calculate maximum time from subtitles
  const maxSubtitleTime = useMemo(() => {
    if (entries.length === 0) return 3600 // Default to 1 hour if no subtitles

    const lastEntry = entries[entries.length - 1]
    const endTime = lastEntry.displayEndTime ?? lastEntry.endTime
    const maxTimeSeconds = endTime > 1000 ? endTime / 1000 : endTime

    return maxTimeSeconds > 0 ? maxTimeSeconds : 3600
  }, [entries])

  // Video control handlers
  const handlePlayPause = useCallback(() => {
    const newIsPlaying = !isPlaying
    onPlayStateChange?.(newIsPlaying)
  }, [isPlaying, onPlayStateChange])

  const handleSeek = useCallback((time: number) => {
    onTimeUpdate?.(time)
  }, [onTimeUpdate])

  const jumpToFirstSubtitle = useCallback(() => {
    if (entries.length > 0) {
      const firstEntry = entries[0]
      const startTime = firstEntry.displayStartTime ?? firstEntry.startTime
      const timeInSeconds = startTime > 1000 ? startTime / 1000 : startTime
      handleSeek(timeInSeconds)
    }
  }, [entries, handleSeek])

  // Synchronization controls
  const adjustOffset = useCallback((delta: number) => {
    onConfigurationChange({
      ...configuration,
      synchronization: {
        ...configuration.synchronization,
        offset: configuration.synchronization.offset + delta
      }
    })
  }, [configuration, onConfigurationChange])



  // Check Picture-in-Picture support
  useEffect(() => {
    // Mark as client-side rendered
    setIsClient(true)

    const checkSupport = () => {
      const supported = 'pictureInPictureEnabled' in document &&
                       document.pictureInPictureEnabled &&
                       'requestPictureInPicture' in HTMLVideoElement.prototype
      setPipSupported(supported)

      if (!supported) {
        console.warn('Picture-in-Picture not supported in this browser')
      }
    }

    checkSupport()
  }, [])

  // Find current subtitle entry
  const getCurrentEntry = useCallback((time: number = currentTime) => {
    // Convert time to milliseconds
    const timeInMs = time * 1000

    // Debug: Log timing information
    if (entries.length > 0 && time % 5 < 0.1) { // Log every 5 seconds
      console.log(`🕐 PiP getCurrentEntry - Time: ${time}s (${timeInMs}ms)`)
      console.log(`📝 Looking for subtitle at time ${time}s among ${entries.length} entries`)
    }

    // Check if entries have displayStartTime/displayEndTime or use startTime/endTime
    const entry = entries.find(entry => {
      const startTime = entry.displayStartTime ?? entry.startTime
      const endTime = entry.displayEndTime ?? entry.endTime

      // Check if times are in milliseconds (> 1000) or seconds
      const startTimeMs = startTime > 1000 ? startTime : startTime * 1000
      const endTimeMs = endTime > 1000 ? endTime : endTime * 1000

      return timeInMs >= startTimeMs && timeInMs <= endTimeMs
    })

    // Debug: Log found entry
    if (entry && time % 5 < 0.1) {
      console.log(`✅ Found subtitle: "${entry.text}" (${entry.startTime}-${entry.endTime})`)
    } else if (!entry && time % 5 < 0.1) {
      console.log(`❌ No subtitle found at time ${time}s`)
    }

    return entry || null
  }, [entries, currentTime])

  // Draw subtitle on canvas
  const drawSubtitle = useCallback((ctx: CanvasRenderingContext2D, text: string) => {
    const canvas = ctx.canvas
    const { width, height } = canvas

    // Clear canvas completely - try for transparent background
    ctx.clearRect(0, 0, width, height)

    if (!text) {
      // Just clear the canvas, don't show any message
      return
    }

    // Set up text styling - use font size from configuration
    const fontSize = configuration.style.fontSize
    console.log('PiP drawSubtitle - fontSize:', fontSize, 'color:', configuration.style.color)
    ctx.font = `${configuration.style.fontWeight} ${fontSize}px ${configuration.style.fontFamily}`
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'

    // Text wrapping function
    const wrapText = (text: string, maxWidth: number) => {
      const words = text.split(' ')
      const lines: string[] = []
      let currentLine = words[0]

      for (let i = 1; i < words.length; i++) {
        const word = words[i]
        const width = ctx.measureText(currentLine + ' ' + word).width
        if (width < maxWidth) {
          currentLine += ' ' + word
        } else {
          lines.push(currentLine)
          currentLine = word
        }
      }
      lines.push(currentLine)
      return lines
    }

    // Wrap text to fit canvas width (with padding)
    const maxTextWidth = width * 0.9 // 90% of canvas width
    const lines = wrapText(text, maxTextWidth)
    const lineHeight = fontSize * 1.2
    const totalTextHeight = lines.length * lineHeight

    // Calculate starting Y position to center text vertically in entire canvas
    const x = width / 2
    const startY = (height - totalTextHeight) / 2 + (lineHeight / 2)

    // No background drawing needed - PiP window has black background

    // Draw each line
    lines.forEach((line, index) => {
      const lineY = startY + index * lineHeight

      // Draw text shadow if enabled
      if (configuration.style.textShadow) {
        ctx.fillStyle = configuration.style.textShadowColor || '#000000'
        ctx.fillText(line, x + 3, lineY + 3)
      }

      // Draw text outline if enabled
      if (configuration.style.textOutline) {
        ctx.strokeStyle = configuration.style.textOutlineColor || '#000000'
        ctx.lineWidth = configuration.style.textOutlineWidth || 2
        ctx.strokeText(line, x, lineY)
      }

      // Draw main text
      ctx.fillStyle = configuration.style.color || '#ffffff'
      ctx.fillText(line, x, lineY)
    })

  }, [configuration.style])





  // Animation loop for updating subtitles
  const animate = useCallback(() => {
    if (!canvasRef.current || !isPipActive) {
      return
    }

    const ctx = canvasRef.current.getContext('2d')
    if (!ctx) {
      return
    }

    // Get fresh currentTime from the ref to avoid stale closure
    const freshCurrentTime = currentTimeRef.current
    const currentEntry = getCurrentEntry(freshCurrentTime)
    const text = currentEntry?.text || ''

    drawSubtitle(ctx, text)

    // Continue animation loop
    animationRef.current = requestAnimationFrame(animate)
  }, [isPipActive, getCurrentEntry, drawSubtitle])

  // Start animation loop when PiP becomes active
  useEffect(() => {
    if (isPipActive && !animationRef.current) {
      animate()
    } else if (!isPipActive && animationRef.current) {
      cancelAnimationFrame(animationRef.current)
      animationRef.current = undefined
    }
  }, [isPipActive, animate])

  // Force redraw when configuration changes while PiP is active
  useEffect(() => {
    if (isPipActive && canvasRef.current) {
      const ctx = canvasRef.current.getContext('2d')
      if (ctx) {
        const currentEntry = getCurrentEntry(currentTimeRef.current)
        const text = currentEntry?.text || ''
        drawSubtitle(ctx, text)
      }
    }
  }, [isPipActive, configuration.style, drawSubtitle, getCurrentEntry])



  // Start Picture-in-Picture
  const startPictureInPicture = useCallback(async () => {
    if (!pipSupported) {
      toast.error('Picture-in-Picture is not supported in this browser')
      return
    }

    if (entries.length === 0) {
      toast.error('Please load subtitles first')
      return
    }

    try {
      const canvas = canvasRef.current
      const video = videoRef.current

      if (!canvas || !video) return

      // Set fixed canvas dimensions - user can resize PiP window as needed
      canvas.width = 800
      canvas.height = 200

      // Draw initial subtitle
      const ctx = canvas.getContext('2d')
      if (ctx) {
        const currentEntry = getCurrentEntry(currentTime)
        const initialText = currentEntry?.text || ''
        drawSubtitle(ctx, initialText)
      }

      // Create video stream from canvas
      const stream = canvas.captureStream(30) // 30 FPS

      // Set up video element
      video.srcObject = stream
      video.muted = true
      video.playsInline = true
      video.controls = false

      // Wait for video to be ready
      await new Promise((resolve, reject) => {
        video.onloadedmetadata = resolve
        video.onerror = reject
        setTimeout(reject, 5000) // 5 second timeout
      })

      // Play video
      await video.play()

      // Small delay to ensure video is playing
      await new Promise(resolve => setTimeout(resolve, 100))

      // Start Picture-in-Picture
      await video.requestPictureInPicture()

      setIsPipActive(true)
      toast.success('Picture-in-Picture subtitle window opened!')

      // Animation loop will start automatically via useEffect

    } catch (error) {
      console.error('Failed to start Picture-in-Picture:', error)

      // More specific error messages
      if (error.name === 'AbortError') {
        toast.error('Video playback was interrupted. Please try again.')
      } else if (error.name === 'NotSupportedError') {
        toast.error('Picture-in-Picture is not supported for this content.')
      } else if (error.name === 'InvalidStateError') {
        toast.error('Cannot start Picture-in-Picture in current state.')
      } else {
        toast.error(`Failed to open Picture-in-Picture window: ${error.message}`)
      }
    }
  }, [pipSupported, entries.length, animate, getCurrentEntry, drawSubtitle])

  // Stop Picture-in-Picture
  const stopPictureInPicture = useCallback(async () => {
    try {
      if (document.pictureInPictureElement) {
        await document.exitPictureInPicture()
      }
      
      setIsPipActive(false)
      
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
      }

      if (videoRef.current) {
        videoRef.current.srcObject = null
      }

      toast.info('Picture-in-Picture window closed')
    } catch (error) {
      console.error('Failed to stop Picture-in-Picture:', error)
    }
  }, [])

  // Handle PiP events
  useEffect(() => {
    const video = videoRef.current
    if (!video) return

    const handleEnterPip = () => {
      setIsPipActive(true)
      animate()
    }

    const handleLeavePip = () => {
      setIsPipActive(false)
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
      }
    }

    video.addEventListener('enterpictureinpicture', handleEnterPip)
    video.addEventListener('leavepictureinpicture', handleLeavePip)

    return () => {
      video.removeEventListener('enterpictureinpicture', handleEnterPip)
      video.removeEventListener('leavepictureinpicture', handleLeavePip)
    }
  }, [animate])



  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
      }
    }
  }, [])

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-lg flex items-center gap-2">
          <PictureInPicture2 className="h-5 w-5" />
          Picture-in-Picture Subtitles
          {isClient && !pipSupported && (
            <Badge variant="destructive" className="text-xs">
              Not Supported
            </Badge>
          )}
          {isClient && isPipActive && (
            <Badge variant="default" className="text-xs bg-green-500">
              Active
            </Badge>
          )}
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Hidden canvas and video for PiP */}
        <div className="hidden">
          <canvas ref={canvasRef} />
          <video ref={videoRef} />
        </div>

        {/* Description */}
        <div className="text-sm text-muted-foreground">
          {!isClient ? (
            <>
              Loading Picture-in-Picture support detection...
            </>
          ) : pipSupported ? (
            <>
              Open a floating subtitle overlay window that stays on top of any content.
              Perfect for watching videos on any website while having subtitles always visible.
            </>
          ) : (
            <>
              Picture-in-Picture is not supported in this browser.
              Try using Chrome, Edge, or Safari for the best experience.
            </>
          )}
        </div>

        {/* Current subtitle preview */}
        {entries.length > 0 && (
          <div className="p-3 bg-muted rounded-lg">
            <div className="text-xs text-muted-foreground mb-1">Current subtitle:</div>
            <div className="text-sm font-medium">
              {getCurrentEntry()?.text || 'No subtitle at current time'}
            </div>
          </div>
        )}







        {/* Subtitle Testing Controls */}
        {entries.length > 0 && (
          <div className="p-4 bg-muted rounded-lg space-y-4">
            {/* Playback Controls */}
            <div className="flex items-center space-x-4">
              <Button
                variant="outline"
                size="sm"
                onClick={handlePlayPause}
              >
                {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
              </Button>

              <Button
                variant="outline"
                size="sm"
                onClick={jumpToFirstSubtitle}
                title="Jump to first subtitle"
              >
                📝
              </Button>

              <div className="flex-1">
                <input
                  type="range"
                  min="0"
                  max={maxSubtitleTime}
                  value={currentTime}
                  onChange={(e) => handleSeek(parseFloat(e.target.value))}
                  className="w-full"
                />
              </div>

              <span className="text-sm text-muted-foreground min-w-[80px]">
                {Math.floor(currentTime / 60)}:{Math.floor(currentTime % 60).toString().padStart(2, '0')} / {Math.floor(maxSubtitleTime / 60)}:{Math.floor(maxSubtitleTime % 60).toString().padStart(2, '0')}
              </span>
            </div>

            {/* Subtitle Synchronization */}
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <span className="text-sm font-medium">Sync Control:</span>
                <div className="flex items-center space-x-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => adjustOffset(-100)}
                    title="Subtitle earlier (-100ms)"
                    className="h-8 w-8 p-0"
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <span className="text-sm min-w-[60px] text-center font-mono">
                    {configuration.synchronization.offset}ms
                  </span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => adjustOffset(100)}
                    title="Subtitle later (+100ms)"
                    className="h-8 w-8 p-0"
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => adjustOffset(-1000)}
                  title="1 second earlier"
                >
                  -1s
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => adjustOffset(1000)}
                  title="1 second later"
                >
                  +1s
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => adjustOffset(-configuration.synchronization.offset)}
                  title="Reset sync"
                >
                  Reset
                </Button>
              </div>
            </div>

            {/* Current Subtitle Preview - Black Bar Only */}
            <div className="bg-black text-white p-4 rounded-lg text-center min-h-[60px] flex items-center justify-center">
              <div
                className="text-center"
                style={{
                  fontSize: `${configuration.style.fontSize}px`,
                  fontFamily: configuration.style.fontFamily,
                  fontWeight: configuration.style.fontWeight,
                  color: configuration.style.textColor,
                  textShadow: configuration.style.textShadow ? '2px 2px 4px rgba(0,0,0,0.8)' : 'none',
                  lineHeight: 1.4
                }}
              >
                {getCurrentEntry()?.text || 'No subtitle at current time'}
              </div>
            </div>
          </div>
        )}

        {/* Controls */}
        <div className="flex gap-2">
          <Button
            onClick={isPipActive ? stopPictureInPicture : startPictureInPicture}
            disabled={!isClient || !pipSupported || entries.length === 0}
            size="lg"
            className={isPipActive
              ? 'bg-red-500 hover:bg-red-600 text-white shadow-lg'
              : 'bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105 animate-pulse hover:animate-none border-2 border-green-400'
            }
          >
            {isPipActive ? (
              <>
                <X className="h-5 w-5 mr-2" />
                Close Overlay Window
              </>
            ) : (
              <>
                <PictureInPicture2 className="h-5 w-5 mr-2" />
                🚀 Open Overlay Window
              </>
            )}
          </Button>

          {entries.length > 0 && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <span>{entries.length} subtitles loaded</span>
              {isPlaying ? (
                <Play className="h-3 w-3 text-green-500" />
              ) : (
                <Pause className="h-3 w-3 text-gray-500" />
              )}
            </div>
          )}
        </div>

        {/* Subtitle Style Controls */}
        {entries.length > 0 && (
          <div className="border-t pt-4">
            <SubtitleStyleBar
              configuration={configuration}
              onConfigurationChange={onConfigurationChange}
            />
          </div>
        )}

        {/* Browser compatibility info */}
        <div className="text-xs text-muted-foreground border-t pt-3">
          <strong>Browser Support:</strong> Chrome 70+, Edge 79+, Safari 13.1+
          <br />
          <strong>Note:</strong> The floating window will show subtitles synchronized with your current playback time.
        </div>
      </CardContent>
    </Card>
  )
}
