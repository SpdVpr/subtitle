'use client'

import React, { useState, useCallback, useRef, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Slider } from '@/components/ui/slider'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { Separator } from '@/components/ui/separator'
import { 
  ExternalLink, 
  Upload, 
  Play, 
  Pause, 
  Settings, 
  Eye,
  EyeOff,
  RotateCcw,
  Download
} from 'lucide-react'
import { toast } from 'sonner'
import { SubtitleProcessor } from '@/lib/subtitle-processor'
import { 
  OverlayConfiguration, 
  OverlaySubtitleEntry,
  DEFAULT_OVERLAY_CONFIGURATION 
} from '@/types/subtitle'

interface PopupWindowRef {
  window: Window | null
  isOpen: boolean
}

export function SubtitlePopupController() {
  const [configuration, setConfiguration] = useState<OverlayConfiguration>(DEFAULT_OVERLAY_CONFIGURATION)
  const [entries, setEntries] = useState<OverlaySubtitleEntry[]>([])
  const [currentTime, setCurrentTime] = useState(0)
  const [isPlaying, setIsPlaying] = useState(false)
  const popupRef = useRef<PopupWindowRef>({ window: null, isOpen: false })
  const intervalRef = useRef<NodeJS.Timeout>()

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

  // Handle file upload
  const handleFileUpload = useCallback(async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    if (!file.name.toLowerCase().endsWith('.srt')) {
      toast.error('Please select a valid SRT subtitle file')
      return
    }

    try {
      toast.info('Processing subtitle file...')
      const subtitleFile = await SubtitleProcessor.processFile(file)
      const overlayEntries = convertToOverlayEntries(subtitleFile.entries)
      setEntries(overlayEntries)
      toast.success(`Loaded ${overlayEntries.length} subtitle entries`)
    } catch (error) {
      console.error('Failed to load subtitle file:', error)
      toast.error('Failed to load subtitle file. Please check the format.')
    }
  }, [convertToOverlayEntries])

  // Load from translation results
  const loadFromTranslationResults = useCallback(() => {
    try {
      const translatedContent = sessionStorage.getItem('translatedSubtitleContent')
      if (translatedContent) {
        const parsedEntries = JSON.parse(translatedContent)
        const overlayEntries = convertToOverlayEntries(parsedEntries)
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

  // Open popup window
  const openPopupWindow = useCallback(() => {
    if (entries.length === 0) {
      toast.error('Please load a subtitle file first')
      return
    }

    if (popupRef.current.isOpen && popupRef.current.window && !popupRef.current.window.closed) {
      popupRef.current.window.focus()
      return
    }

    const popupFeatures = [
      'width=800',
      'height=200',
      'left=100',
      'top=100',
      'resizable=yes',
      'scrollbars=no',
      'toolbar=no',
      'menubar=no',
      'location=no',
      'status=no',
      'alwaysRaised=yes'
    ].join(',')

    const popup = window.open('/subtitle-popup/overlay', 'subtitleOverlay', popupFeatures)
    
    if (!popup) {
      toast.error('Popup was blocked. Please allow popups for this site.')
      return
    }

    popupRef.current = { window: popup, isOpen: true }

    // Wait for popup to load, then send initial data
    popup.addEventListener('load', () => {
      sendToPopup({
        type: 'INIT',
        entries,
        configuration,
        currentTime
      })
    })

    // Handle popup close
    const checkClosed = setInterval(() => {
      if (popup.closed) {
        popupRef.current = { window: null, isOpen: false }
        clearInterval(checkClosed)
        toast.info('Subtitle window closed')
      }
    }, 1000)

    toast.success('Subtitle window opened! Position it over your video.')
  }, [entries, configuration, currentTime])

  // Send message to popup
  const sendToPopup = useCallback((message: any) => {
    if (popupRef.current.window && !popupRef.current.window.closed) {
      popupRef.current.window.postMessage(message, window.location.origin)
    }
  }, [])

  // Update configuration and send to popup
  const updateConfiguration = useCallback((updates: Partial<OverlayConfiguration>) => {
    const newConfig = { ...configuration, ...updates }
    setConfiguration(newConfig)
    
    sendToPopup({
      type: 'UPDATE_CONFIG',
      configuration: newConfig
    })
  }, [configuration, sendToPopup])

  // Time control
  const handleTimeChange = useCallback((newTime: number) => {
    setCurrentTime(newTime)
    sendToPopup({
      type: 'UPDATE_TIME',
      currentTime: newTime
    })
  }, [sendToPopup])

  // Play/Pause control
  const togglePlayback = useCallback(() => {
    const newIsPlaying = !isPlaying
    setIsPlaying(newIsPlaying)
    
    if (newIsPlaying) {
      intervalRef.current = setInterval(() => {
        setCurrentTime(prev => {
          const newTime = prev + 0.1
          sendToPopup({
            type: 'UPDATE_TIME',
            currentTime: newTime
          })
          return newTime
        })
      }, 100)
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    }
  }, [isPlaying, sendToPopup])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
      if (popupRef.current.window && !popupRef.current.window.closed) {
        popupRef.current.window.close()
      }
    }
  }, [])

  const maxTime = entries.length > 0 ? Math.max(...entries.map(e => e.displayEndTime)) / 1000 : 100

  return (
    <div className="space-y-6">
      {/* Main Controls */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <ExternalLink className="h-5 w-5" />
            <span>Subtitle Popup Controller</span>
          </CardTitle>
          <CardDescription>
            Load subtitles and open a popup window that stays on top of any video
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* File Upload */}
          <div className="space-y-2">
            <Label htmlFor="subtitle-file">Load Subtitle File (.srt)</Label>
            <Input
              id="subtitle-file"
              type="file"
              accept=".srt"
              onChange={handleFileUpload}
            />
            {entries.length > 0 && (
              <p className="text-sm text-green-600 dark:text-green-400">
                ✅ {entries.length} subtitles loaded
              </p>
            )}
          </div>

          {/* Load from Translation Results */}
          <div className="space-y-2">
            <Button
              variant="outline"
              onClick={loadFromTranslationResults}
              className="w-full"
            >
              <Upload className="h-4 w-4 mr-2" />
              Load from Translation Results
            </Button>
            <p className="text-xs text-muted-foreground">
              Load subtitles from your recent translation
            </p>
          </div>

          <Separator />

          {/* Popup Control */}
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-semibold">Subtitle Window</h3>
              <p className="text-sm text-muted-foreground">
                {popupRef.current.isOpen ? 'Window is open' : 'Window is closed'}
              </p>
            </div>
            <Button 
              onClick={openPopupWindow}
              disabled={entries.length === 0}
              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
            >
              <ExternalLink className="h-4 w-4 mr-2" />
              Open Subtitle Window
            </Button>
          </div>

          {/* Demo Playback Controls */}
          {entries.length > 0 && (
            <>
              <Separator />
              <div className="space-y-4">
                <h3 className="font-semibold">Demo Playback (for testing)</h3>
                <div className="flex items-center space-x-4">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={togglePlayback}
                  >
                    {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                  </Button>
                  
                  <div className="flex-1">
                    <Slider
                      value={[currentTime]}
                      onValueChange={([value]) => handleTimeChange(value)}
                      min={0}
                      max={maxTime}
                      step={0.1}
                      className="w-full"
                    />
                  </div>
                  
                  <span className="text-sm text-muted-foreground min-w-[60px]">
                    {Math.floor(currentTime / 60)}:{Math.floor(currentTime % 60).toString().padStart(2, '0')}
                  </span>
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Configuration */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Settings className="h-5 w-5" />
            <span>Subtitle Appearance</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="style" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="style">Style</TabsTrigger>
              <TabsTrigger value="sync">Sync</TabsTrigger>
            </TabsList>

            <TabsContent value="style" className="space-y-4 mt-4">
              {/* Font Size */}
              <div className="space-y-2">
                <Label>Font Size: {configuration.style.fontSize}px</Label>
                <Slider
                  value={[configuration.style.fontSize]}
                  onValueChange={([value]) => updateConfiguration({
                    style: { ...configuration.style, fontSize: value }
                  })}
                  min={16}
                  max={48}
                  step={1}
                />
              </div>

              {/* Colors */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Text Color</Label>
                  <Input
                    type="color"
                    value={configuration.style.color}
                    onChange={(e) => updateConfiguration({
                      style: { ...configuration.style, color: e.target.value }
                    })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Background Color</Label>
                  <Input
                    type="color"
                    value={configuration.style.backgroundColor}
                    onChange={(e) => updateConfiguration({
                      style: { ...configuration.style, backgroundColor: e.target.value }
                    })}
                  />
                </div>
              </div>

              {/* Background Opacity */}
              <div className="space-y-2">
                <Label>Background Opacity: {Math.round(configuration.style.backgroundOpacity * 100)}%</Label>
                <Slider
                  value={[configuration.style.backgroundOpacity]}
                  onValueChange={([value]) => updateConfiguration({
                    style: { ...configuration.style, backgroundOpacity: value }
                  })}
                  min={0}
                  max={1}
                  step={0.1}
                />
              </div>
            </TabsContent>

            <TabsContent value="sync" className="space-y-4 mt-4">
              {/* Time Offset */}
              <div className="space-y-2">
                <Label>Time Offset: {configuration.synchronization.offset}ms</Label>
                <div className="flex space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => updateConfiguration({
                      synchronization: { 
                        ...configuration.synchronization, 
                        offset: configuration.synchronization.offset - 500 
                      }
                    })}
                  >
                    -500ms
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => updateConfiguration({
                      synchronization: { 
                        ...configuration.synchronization, 
                        offset: configuration.synchronization.offset + 500 
                      }
                    })}
                  >
                    +500ms
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => updateConfiguration({
                      synchronization: { 
                        ...configuration.synchronization, 
                        offset: 0 
                      }
                    })}
                  >
                    Reset
                  </Button>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  )
}
