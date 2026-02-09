'use client'

import React, { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { TranslationSelectorDialog } from './translation-selector-dialog'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Slider } from '@/components/ui/slider'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { Separator } from '@/components/ui/separator'
import { 
  Upload, 
  Eye, 
  EyeOff, 
  RotateCcw,
  Type,
  Clock,
  Palette
} from 'lucide-react'
import { OverlayConfiguration, OverlaySubtitleEntry } from '@/types/subtitle'

interface VideoSubtitleControlsProps {
  configuration: OverlayConfiguration
  onConfigurationChange: (config: OverlayConfiguration) => void
  onFileUpload: (event: React.ChangeEvent<HTMLInputElement>) => void
  onLoadFromTranslation: () => void
  entries: OverlaySubtitleEntry[]
  currentTime: number
  compact?: boolean
}

const FONT_FAMILIES = [
  'Arial, sans-serif',
  'Helvetica, sans-serif',
  'Times New Roman, serif',
  'Georgia, serif',
  'Verdana, sans-serif',
  'Tahoma, sans-serif',
  'Impact, sans-serif'
]

const ANCHOR_POSITIONS = [
  { value: 'bottom-center', label: 'Bottom Center' },
  { value: 'bottom-left', label: 'Bottom Left' },
  { value: 'bottom-right', label: 'Bottom Right' },
  { value: 'center', label: 'Center' },
  { value: 'top-center', label: 'Top Center' },
  { value: 'top-left', label: 'Top Left' },
  { value: 'top-right', label: 'Top Right' }
]

export function VideoSubtitleControls({
  configuration,
  onConfigurationChange,
  onFileUpload,
  onLoadFromTranslation,
  entries,
  currentTime,
  compact = false
}: VideoSubtitleControlsProps) {
  const [isCollapsed, setIsCollapsed] = useState(false)

  const updateConfiguration = (updates: Partial<OverlayConfiguration>) => {
    onConfigurationChange({ ...configuration, ...updates })
  }

  const updateStyle = (updates: Partial<OverlayConfiguration['style']>) => {
    onConfigurationChange({
      ...configuration,
      style: { ...configuration.style, ...updates }
    })
  }

  const updatePosition = (updates: Partial<OverlayConfiguration['position']>) => {
    onConfigurationChange({
      ...configuration,
      position: { ...configuration.position, ...updates }
    })
  }

  const updateSynchronization = (updates: Partial<OverlayConfiguration['synchronization']>) => {
    onConfigurationChange({
      ...configuration,
      synchronization: { ...configuration.synchronization, ...updates }
    })
  }

  // Find current subtitle for preview
  const currentEntry = entries.find(entry => {
    const { offset, speedMultiplier } = configuration.synchronization
    const adjustedTime = ((currentTime * speedMultiplier) * 1000) + offset
    return adjustedTime >= entry.displayStartTime && adjustedTime <= entry.displayEndTime
  })

  // Compact mode for subtitle tools card
  if (compact) {
    return (
      <div className="space-y-3">
        <div className="space-y-2">
          <Label className="text-sm font-medium">Select File</Label>
          <div className="relative">
            <Input
              id="subtitle-file-compact"
              type="file"
              accept=".srt,.vtt,.ass,.ssa,.sub"
              onChange={onFileUpload}
              className="hidden"
            />
            <Button
              variant="outline"
              className="w-full text-sm"
              size="sm"
              onClick={() => document.getElementById('subtitle-file-compact')?.click()}
            >
              <Upload className="h-4 w-4 mr-2" />
              Load from PC
            </Button>
          </div>
        </div>

        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-background px-2 text-muted-foreground">or</span>
          </div>
        </div>

        <TranslationSelectorDialog
          onTranslationSelect={onLoadFromTranslation}
          trigger={
            <Button
              variant="outline"
              className="w-full text-sm"
              size="sm"
            >
              <Upload className="h-4 w-4 mr-2" />
              Load from Translation
            </Button>
          }
        />
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Subtitle File */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center space-x-2">
            <Upload className="h-4 w-4" />
            <span>Subtitles</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="space-y-2">
            <Label className="text-sm font-medium">Select File</Label>
            <div className="relative">
              <Input
                id="subtitle-file"
                type="file"
                accept=".srt,.vtt,.ass,.ssa,.sub"
                onChange={onFileUpload}
                className="hidden"
              />
              <Button
                variant="outline"
                className="w-full text-sm"
                size="sm"
                onClick={() => document.getElementById('subtitle-file')?.click()}
              >
                <Upload className="h-4 w-4 mr-2" />
                Load from PC
              </Button>
            </div>
          </div>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-background px-2 text-muted-foreground">or</span>
            </div>
          </div>

          <TranslationSelectorDialog
            onTranslationSelect={onLoadFromTranslation}
            trigger={
              <Button
                variant="outline"
                className="w-full text-sm"
                size="sm"
              >
                <Upload className="h-4 w-4 mr-2" />
                Load from Translation
              </Button>
            }
          />

          {entries.length > 0 && (
            <div className="text-sm text-green-600 dark:text-green-400">
              ✅ {entries.length} subtitles loaded
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
