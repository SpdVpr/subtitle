'use client'

import React, { useRef, useEffect, useCallback } from 'react'

interface VideoSource {
  url: string
  type: 'youtube' | 'vimeo' | 'direct' | 'iframe'
  embedUrl?: string
}

interface VideoPlayerProps {
  source: VideoSource
  currentTime: number
  isPlaying: boolean
  volume: number
  onTimeUpdate: (time: number) => void
  onDurationChange: (duration: number) => void
  onPlayStateChange: (isPlaying: boolean) => void
  videoRef?: React.RefObject<HTMLVideoElement>
}

export function VideoPlayer({
  source,
  currentTime,
  isPlaying,
  volume,
  onTimeUpdate,
  onDurationChange,
  onPlayStateChange,
  videoRef
}: VideoPlayerProps) {
  const localVideoRef = useRef<HTMLVideoElement>(null)
  const actualVideoRef = videoRef || localVideoRef
  const iframeRef = useRef<HTMLIFrameElement>(null)

  // Handle direct video playback
  useEffect(() => {
    if (source.type === 'direct' && actualVideoRef.current) {
      const video = actualVideoRef.current
      
      const handleTimeUpdate = () => {
        onTimeUpdate(video.currentTime)
      }
      
      const handleDurationChange = () => {
        onDurationChange(video.duration || 0)
      }
      
      const handlePlay = () => {
        onPlayStateChange(true)
      }
      
      const handlePause = () => {
        onPlayStateChange(false)
      }

      video.addEventListener('timeupdate', handleTimeUpdate)
      video.addEventListener('durationchange', handleDurationChange)
      video.addEventListener('loadedmetadata', handleDurationChange)
      video.addEventListener('play', handlePlay)
      video.addEventListener('pause', handlePause)

      return () => {
        video.removeEventListener('timeupdate', handleTimeUpdate)
        video.removeEventListener('durationchange', handleDurationChange)
        video.removeEventListener('loadedmetadata', handleDurationChange)
        video.removeEventListener('play', handlePlay)
        video.removeEventListener('pause', handlePause)
      }
    }
  }, [source, onTimeUpdate, onDurationChange, onPlayStateChange])

  // Sync video playback state
  useEffect(() => {
    if (source.type === 'direct' && actualVideoRef.current) {
      const video = actualVideoRef.current
      
      if (isPlaying && video.paused) {
        video.play().catch(console.error)
      } else if (!isPlaying && !video.paused) {
        video.pause()
      }
    }
  }, [isPlaying, source.type])

  // Sync video time
  useEffect(() => {
    if (source.type === 'direct' && actualVideoRef.current) {
      const video = actualVideoRef.current
      const timeDiff = Math.abs(video.currentTime - currentTime)
      
      // Only seek if there's a significant difference (avoid infinite loops)
      if (timeDiff > 0.5) {
        video.currentTime = currentTime
      }
    }
  }, [currentTime, source.type])

  // Sync volume
  useEffect(() => {
    if (source.type === 'direct' && actualVideoRef.current) {
      actualVideoRef.current.volume = volume
    }
  }, [volume, source.type])

  // YouTube API integration (for future enhancement)
  const setupYouTubeAPI = useCallback(() => {
    // This would require YouTube IFrame API
    // For now, we'll use basic iframe embed
    console.log('YouTube player setup - API integration can be added here')
  }, [])

  // Render based on source type
  const renderPlayer = () => {
    switch (source.type) {
      case 'direct':
        return (
          <video
            ref={actualVideoRef}
            src={source.url}
            className="w-full h-full object-contain"
            controls={false} // We'll use custom controls
            preload="metadata"
          />
        )

      case 'youtube':
        return (
          <iframe
            ref={iframeRef}
            src={source.embedUrl}
            className="w-full h-full"
            frameBorder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            title="YouTube Video"
          />
        )

      case 'vimeo':
        return (
          <iframe
            ref={iframeRef}
            src={source.embedUrl}
            className="w-full h-full"
            frameBorder="0"
            allow="autoplay; fullscreen; picture-in-picture"
            allowFullScreen
            title="Vimeo Video"
          />
        )

      case 'iframe':
        return (
          <iframe
            ref={iframeRef}
            src={source.embedUrl}
            className="w-full h-full"
            frameBorder="0"
            allowFullScreen
            title="Video Player"
          />
        )

      default:
        return (
          <div className="w-full h-full flex items-center justify-center bg-gray-900 text-white">
            <div className="text-center">
              <div className="text-4xl mb-4">⚠️</div>
              <div>Unsupported video format</div>
            </div>
          </div>
        )
    }
  }

  return (
    <div className="absolute inset-0">
      {renderPlayer()}
      

    </div>
  )
}
