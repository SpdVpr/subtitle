'use client'

import React, { useState, useCallback, useRef, useEffect, useMemo } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Separator } from '@/components/ui/separator'
import {
  Play,
  Pause,
  Volume2,
  VolumeX,
  Maximize,
  Settings,
  Upload,
  ExternalLink,
  AlertCircle,
  ChevronLeft,
  ChevronRight
} from 'lucide-react'
import { toast } from 'sonner'
import { SubtitleProcessor } from '@/lib/subtitle-processor'
import { auth } from '@/lib/firebase'
import { 
  OverlayConfiguration, 
  OverlaySubtitleEntry,
  DEFAULT_OVERLAY_CONFIGURATION 
} from '@/types/subtitle'
import { VideoPlayer } from './video-player'
import { VideoSubtitleOverlay } from './video-subtitle-overlay'
import { VideoSubtitleControls } from './video-subtitle-controls'
import { SubtitlePreviewTable } from './subtitle-preview-table'
import { SubtitleStyleBar } from './subtitle-style-bar'
import { TranslationSelectorDialog } from './translation-selector-dialog'
import { PictureInPictureSubtitles } from './picture-in-picture-subtitles'
import { usePathname } from 'next/navigation'

interface VideoSource {
  url: string
  type: 'youtube' | 'vimeo' | 'direct' | 'iframe'
  embedUrl?: string
}

export function VideoPlayerWithSubtitles() {
  const pathname = usePathname()
  const isCzech = pathname.startsWith('/cs')

  const [videoUrl, setVideoUrl] = useState('')
  const [videoSource, setVideoSource] = useState<VideoSource | null>(null)
  const [configuration, setConfiguration] = useState<OverlayConfiguration>(DEFAULT_OVERLAY_CONFIGURATION)
  const [entries, setEntries] = useState<OverlaySubtitleEntry[]>([])
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const [isPlaying, setIsPlaying] = useState(false)
  const [volume, setVolume] = useState(1)
  const [isMuted, setIsMuted] = useState(false)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const intervalRef = useRef<NodeJS.Timeout>()
  const videoRef = useRef<HTMLVideoElement>(null)
  const videoContainerRef = useRef<HTMLDivElement>(null)

  // Load subtitles from sessionStorage (from translate page PiP overlay)
  useEffect(() => {
    const pipSubtitles = sessionStorage.getItem('pipSubtitles')
    const pipSubtitleFileName = sessionStorage.getItem('pipSubtitleFileName')

    if (pipSubtitles) {
      try {
        console.log('🔍 Video Tools - Loading PiP subtitles:')
        console.log('📝 Content length:', pipSubtitles.length)
        console.log('📝 First 500 chars:', pipSubtitles.substring(0, 500))
        console.log('📝 Contains timing?', pipSubtitles.includes('-->'))

        const parsedEntries = SubtitleProcessor.parseSRT(pipSubtitles)
        console.log('📝 Parsed entries:', parsedEntries.length)
        if (parsedEntries[0]) {
          console.log('📝 First entry details:')
          console.log('  - Index:', parsedEntries[0].index)
          console.log('  - Start time:', parsedEntries[0].startTime)
          console.log('  - End time:', parsedEntries[0].endTime)
          console.log('  - Text:', parsedEntries[0].text)
        }

        // Use convertToOverlayEntries to properly convert time to milliseconds
        const overlayEntries = convertToOverlayEntries(parsedEntries).map(entry => ({
          ...entry,
          visible: true
        }))

        setEntries(overlayEntries)
        toast.success(`Loaded ${overlayEntries.length} subtitles from translation${pipSubtitleFileName ? ` (${pipSubtitleFileName})` : ''}`)

        // Auto-start playback for subtitle-only mode
        setIsPlaying(true)
        setCurrentTime(0)

        // Clear from sessionStorage after loading
        sessionStorage.removeItem('pipSubtitles')
        sessionStorage.removeItem('pipSubtitleFileName')
      } catch (error) {
        console.error('Failed to load subtitles from sessionStorage:', error)
        console.log('📝 Raw content that failed to parse:', pipSubtitles)
        toast.error('Failed to load subtitles from translation')
      }
    }
  }, [])

  // For iframe videos (YouTube, Vimeo) or subtitle-only mode, we need to simulate time progression
  useEffect(() => {
    const needsSimulation = !videoSource ||
      (videoSource && (videoSource.type === 'youtube' || videoSource.type === 'vimeo' || videoSource.type === 'iframe'))

    if (needsSimulation && isPlaying) {
      intervalRef.current = setInterval(() => {
        setCurrentTime(prev => prev + 0.1)
      }, 100)
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    }
  }, [isPlaying, videoSource])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    }
  }, [])

  // Convert subtitle entries to overlay entries
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

  // Calculate maximum time from subtitles
  const maxSubtitleTime = useMemo(() => {
    if (entries.length === 0) return duration || 3600 // Default to 1 hour if no subtitles

    const lastEntry = entries[entries.length - 1]
    const maxTimeSeconds = lastEntry.displayEndTime / 1000

    // Always use subtitle duration if available, otherwise video duration
    return maxTimeSeconds > 0 ? maxTimeSeconds : (duration || 3600)
  }, [entries, duration])

  // Parse video URL and determine source type
  const parseVideoUrl = useCallback((url: string): VideoSource | null => {
    if (!url) return null

    // YouTube
    const youtubeMatch = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([a-zA-Z0-9_-]+)/)
    if (youtubeMatch) {
      return {
        url,
        type: 'youtube',
        embedUrl: `https://www.youtube.com/embed/${youtubeMatch[1]}?enablejsapi=1&origin=${window.location.origin}`
      }
    }

    // Vimeo
    const vimeoMatch = url.match(/vimeo\.com\/(\d+)/)
    if (vimeoMatch) {
      return {
        url,
        type: 'vimeo',
        embedUrl: `https://player.vimeo.com/video/${vimeoMatch[1]}`
      }
    }

    // Direct video files
    if (url.match(/\.(mp4|webm|ogg|mov|avi)(\?.*)?$/i)) {
      return {
        url,
        type: 'direct'
      }
    }

    // Generic iframe (for other embeddable content)
    if (url.startsWith('http')) {
      return {
        url,
        type: 'iframe',
        embedUrl: url
      }
    }

    return null
  }, [])

  // Load video
  const handleLoadVideo = useCallback(() => {
    const source = parseVideoUrl(videoUrl)
    if (!source) {
      toast.error('Invalid video URL. Please check the format.')
      return
    }

    setVideoSource(source)
    setCurrentTime(0)
    setIsPlaying(false)
    toast.success(`Video loaded: ${source.type.toUpperCase()}`)
  }, [videoUrl, parseVideoUrl])

  // Handle file upload
  const handleFileUpload = useCallback(async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    const supportedExtensions = ['.srt', '.vtt', '.ass', '.ssa', '.sub', '.sbv']
    const isSupported = supportedExtensions.some(ext => file.name.toLowerCase().endsWith(ext))

    if (!isSupported) {
      toast.error('Please select a valid subtitle file (SRT, VTT, ASS, SSA, SUB, SBV)')
      return
    }

    try {
      toast.info('Processing subtitle file...')
      const subtitleFile = await SubtitleProcessor.processFile(file)
      const overlayEntries = convertToOverlayEntries(subtitleFile.entries)
      console.log('Loaded subtitle entries:', overlayEntries)
      setEntries(overlayEntries)
      toast.success(`Loaded ${overlayEntries.length} subtitle entries`)
    } catch (error) {
      console.error('Failed to load subtitle file:', error)
      toast.error('Failed to load subtitle file. Please check the format.')
    }
  }, [convertToOverlayEntries])

  // Load specific translation from selection
  const loadSelectedTranslation = useCallback(async (job: any) => {
    try {
      console.log('🔍 Loading selected translation:', job.id)

      const user = auth.currentUser
      if (!user) {
        toast.error('Please log in to load translation results')
        return
      }

      let translatedContent = ''

      // Try to get content directly from job
      if (job.translatedContent) {
        console.log('✅ Found translated content in job data')
        translatedContent = job.translatedContent
      } else {
        // Fallback: try to download from storage
        console.log('📥 Downloading translated content from storage...')
        const downloadResponse = await fetch('/api/translation-history/download', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ jobId: job.id, userId: user.uid })
        })

        if (!downloadResponse.ok) {
          throw new Error(`Download failed: ${downloadResponse.status}`)
        }

        translatedContent = await downloadResponse.text()
        console.log('✅ Downloaded translated content from storage')
      }

      if (!translatedContent) {
        toast.error('No translated content available')
        return
      }

      console.log(`📄 Content preview:`, translatedContent.substring(0, 200) + '...')

      // Parse subtitle content (auto-detect format)
      try {
        console.log('🎬 Parsing subtitle content...')
        const fileName = job.translatedFileName || job.originalFileName || 'subtitles.srt'
        const entries = SubtitleProcessor.parseSubtitleFile(translatedContent, fileName)
        console.log(`✅ Successfully parsed ${entries.length} subtitle entries`)
        const overlayEntries = convertToOverlayEntries(entries)
        setEntries(overlayEntries)
        toast.success(`Loaded ${overlayEntries.length} subtitles from "${job.translatedFileName || job.originalFileName}"`)
      } catch (srtError) {
        console.error('❌ Failed to parse SRT content:', srtError)
        toast.error('Invalid SRT format in translation results')
      }

    } catch (error) {
      console.error('❌ Failed to load selected translation:', error)
      toast.error('Failed to load translation results')
    }
  }, [convertToOverlayEntries])

  // Video control handlers
  const handlePlayPause = useCallback(() => {
    const newIsPlaying = !isPlaying
    setIsPlaying(newIsPlaying)

    // For iframe videos, we simulate duration if not set
    if (videoSource && (videoSource.type === 'youtube' || videoSource.type === 'vimeo' || videoSource.type === 'iframe') && duration === 0) {
      setDuration(3600) // Default to 1 hour for iframe videos
    }
  }, [isPlaying, videoSource, duration])

  const handleTimeUpdate = useCallback((time: number) => {
    setCurrentTime(time)
  }, [])

  const handleDurationChange = useCallback((dur: number) => {
    setDuration(dur)
  }, [])

  // Jump to first subtitle
  const jumpToFirstSubtitle = useCallback(() => {
    if (entries.length > 0 && videoRef.current) {
      const firstSubtitleTime = entries[0].displayStartTime / 1000 // Convert to seconds
      videoRef.current.currentTime = firstSubtitleTime
    }
  }, [entries])

  // Synchronization controls
  const adjustOffset = useCallback((delta: number) => {
    setConfiguration(prev => ({
      ...prev,
      synchronization: {
        ...prev.synchronization,
        offset: prev.synchronization.offset + delta
      }
    }))
  }, [])

  const adjustSpeed = useCallback((delta: number) => {
    setConfiguration(prev => ({
      ...prev,
      synchronization: {
        ...prev.synchronization,
        speedMultiplier: Math.max(0.1, Math.min(3.0, prev.synchronization.speedMultiplier + delta))
      }
    }))
  }, [])

  // Fullscreen functionality
  const toggleFullscreen = useCallback(async () => {
    if (!videoContainerRef.current) return

    try {
      if (!isFullscreen) {
        // Enter fullscreen
        if (videoContainerRef.current.requestFullscreen) {
          await videoContainerRef.current.requestFullscreen()
        } else if ((videoContainerRef.current as any).webkitRequestFullscreen) {
          await (videoContainerRef.current as any).webkitRequestFullscreen()
        } else if ((videoContainerRef.current as any).msRequestFullscreen) {
          await (videoContainerRef.current as any).msRequestFullscreen()
        }
      } else {
        // Exit fullscreen
        if (document.exitFullscreen) {
          await document.exitFullscreen()
        } else if ((document as any).webkitExitFullscreen) {
          await (document as any).webkitExitFullscreen()
        } else if ((document as any).msExitFullscreen) {
          await (document as any).msExitFullscreen()
        }
      }
    } catch (error) {
      console.error('Fullscreen error:', error)
    }
  }, [isFullscreen])

  // Listen for fullscreen changes
  useEffect(() => {
    const handleFullscreenChange = () => {
      const isCurrentlyFullscreen = !!(
        document.fullscreenElement ||
        (document as any).webkitFullscreenElement ||
        (document as any).msFullscreenElement
      )
      setIsFullscreen(isCurrentlyFullscreen)
    }

    document.addEventListener('fullscreenchange', handleFullscreenChange)
    document.addEventListener('webkitfullscreenchange', handleFullscreenChange)
    document.addEventListener('msfullscreenchange', handleFullscreenChange)

    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange)
      document.removeEventListener('webkitfullscreenchange', handleFullscreenChange)
      document.removeEventListener('msfullscreenchange', handleFullscreenChange)
    }
  }, [])

  const handleSeek = useCallback((time: number) => {
    setCurrentTime(time)

    // For direct video, seek the actual video element
    if (videoSource?.type === 'direct' && videoRef.current) {
      videoRef.current.currentTime = time
    }

    // For iframe videos (YouTube, Vimeo), we can only update our internal time
    // The iframe player doesn't support programmatic seeking from external code
  }, [videoSource])

  const handleVolumeChange = useCallback((vol: number) => {
    setVolume(vol)
    setIsMuted(vol === 0)
  }, [])

  const toggleMute = useCallback(() => {
    setIsMuted(!isMuted)
  }, [isMuted])

  return (
    <div className="space-y-6">
      {/* Initial Choice - Video URL or Subtitle Upload */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Video URL Option */}
        <Card className={videoSource ? "ring-2 ring-blue-500" : ""}>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <ExternalLink className="h-5 w-5 text-blue-600" />
              <span>🎬 Video Player</span>
            </CardTitle>
            <CardDescription>
              Watch videos with subtitle overlay on our website
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="video-url">Video URL</Label>
              <Input
                id="video-url"
                type="url"
                placeholder="https://youtube.com/watch?v=..."
                value={videoUrl}
                onChange={(e) => setVideoUrl(e.target.value)}
                className="w-full"
              />
            </div>

            <Button
              onClick={handleLoadVideo}
              disabled={!videoUrl.trim()}
              className="w-full"
            >
              Load Video
            </Button>

            {videoSource && (
              <div className="flex items-center space-x-2 text-sm text-green-600 dark:text-green-400">
                <Play className="h-4 w-4" />
                <span>Video ready: {videoSource.type.toUpperCase()}</span>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Subtitle Upload Option */}
        <Card className={entries.length > 0 ? "ring-2 ring-green-500" : ""}>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Upload className="h-5 w-5 text-green-600" />
              <span>📝 {isCzech ? 'Plovoucí titulky' : 'Subtitle Overlay'}</span>
            </CardTitle>
            <CardDescription>
              {isCzech
                ? 'Použijte plovoucí titulky s jakýmkoli video zdrojem'
                : 'Use Picture-in-Picture with any video source'
              }
            </CardDescription>
          </CardHeader>
          <CardContent>
            {/* Use existing VideoSubtitleControls for file upload */}
            <VideoSubtitleControls
              configuration={configuration}
              onConfigurationChange={setConfiguration}
              onFileUpload={handleFileUpload}
              onLoadFromTranslation={loadSelectedTranslation}
              entries={entries}
              currentTime={currentTime}
              compact={true}
            />

            {entries.length > 0 && (
              <div className="flex items-center space-x-2 text-sm text-green-600 dark:text-green-400 mt-4">
                <Settings className="h-4 w-4" />
                <span>{entries.length} subtitles loaded</span>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Video Player Section - Show when video is loaded */}
      {videoSource && (
        <div className="space-y-6">
          {/* Video Player - Full Width */}
          <Card>
            <CardContent className="p-0">
              <div
                ref={videoContainerRef}
                className={`relative bg-black overflow-hidden ${
                  isFullscreen
                    ? 'fixed inset-0 z-50 w-screen h-screen'
                    : 'rounded-lg'
                }`}
                style={{
                  aspectRatio: isFullscreen ? 'unset' : '16/9',
                  minHeight: isFullscreen ? '100vh' : '500px'
                }}
              >
                <VideoPlayer
                  source={videoSource}
                  currentTime={currentTime}
                  isPlaying={isPlaying}
                  volume={isMuted ? 0 : volume}
                  onTimeUpdate={handleTimeUpdate}
                  onDurationChange={handleDurationChange}
                  onPlayStateChange={setIsPlaying}
                  videoRef={videoRef}
                />

                {/* Subtitle Overlay */}
                <VideoSubtitleOverlay
                  entries={entries}
                  configuration={configuration}
                  currentTime={currentTime}
                  onConfigurationChange={setConfiguration}
                />
              </div>
                
                {/* Video Controls */}
                <div className={`p-4 ${
                  isFullscreen
                    ? 'absolute bottom-0 left-0 right-0 bg-black/80 backdrop-blur-sm'
                    : 'bg-gray-50 dark:bg-card'
                }`}>
                  <div className="flex items-center space-x-4">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handlePlayPause}
                    >
                      {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                    </Button>

                    {entries.length > 0 && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={jumpToFirstSubtitle}
                        title="Jump to first subtitle"
                      >
                        📝
                      </Button>
                    )}
                    
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
                    
                    {/* Subtitle Synchronization */}
                    {entries.length > 0 && (
                      <div className="flex items-center space-x-1 border-r pr-2">
                        <span className="text-xs text-muted-foreground">Sync:</span>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => adjustOffset(-100)}
                          title="Subtitle earlier (-100ms)"
                          className="h-6 w-6 p-0"
                        >
                          <ChevronLeft className="h-3 w-3" />
                        </Button>
                        <span className="text-xs min-w-[40px] text-center">
                          {configuration.synchronization.offset}ms
                        </span>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => adjustOffset(100)}
                          title="Subtitle later (+100ms)"
                          className="h-6 w-6 p-0"
                        >
                          <ChevronRight className="h-3 w-3" />
                        </Button>
                      </div>
                    )}

                    <div className="flex items-center space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={toggleMute}
                      >
                        {isMuted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
                      </Button>
                      
                      <input
                        type="range"
                        min="0"
                        max="1"
                        step="0.1"
                        value={isMuted ? 0 : volume}
                        onChange={(e) => handleVolumeChange(parseFloat(e.target.value))}
                        className="w-20"
                      />

                      <Button
                        variant="outline"
                        size="sm"
                        onClick={toggleFullscreen}
                        title={isFullscreen ? "Exit fullscreen" : "Enter fullscreen"}
                      >
                        <Maximize className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Subtitle Style Bar - Only show when subtitles are loaded */}
            {entries.length > 0 && (
              <SubtitleStyleBar
                configuration={configuration}
                onConfigurationChange={setConfiguration}
              />
            )}

          {/* Subtitle Controls for Video Player - Always show */}
          <div className="grid lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <VideoSubtitleControls
                configuration={configuration}
                onConfigurationChange={setConfiguration}
                onFileUpload={handleFileUpload}
                onLoadFromTranslation={loadSelectedTranslation}
                entries={entries}
                currentTime={currentTime}
              />
            </div>
            <div className="lg:col-span-1">
              {entries.length > 0 && (
                <SubtitlePreviewTable
                  entries={entries}
                  currentTime={currentTime}
                />
              )}
            </div>
          </div>
        </div>
      )}

      {/* Subtitle Tools Section - Show when subtitles are loaded but no video */}
      {entries.length > 0 && !videoSource && (
        <div className="space-y-6">

          {/* Picture-in-Picture Subtitles - Main Feature */}
          <PictureInPictureSubtitles
            entries={entries}
            configuration={configuration}
            currentTime={currentTime}
            isPlaying={isPlaying}
            onConfigurationChange={setConfiguration}
            onTimeUpdate={setCurrentTime}
            onPlayStateChange={setIsPlaying}
          />

          {/* Subtitle Preview Table */}
          <SubtitlePreviewTable
            entries={entries}
            currentTime={currentTime}
          />


        </div>
      )}
    </div>
  )
}
