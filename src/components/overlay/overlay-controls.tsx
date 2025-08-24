'use client'

import React, { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Slider } from '@/components/ui/slider'
import { Switch } from '@/components/ui/switch'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Separator } from '@/components/ui/separator'
import { 
  Settings, 
  Upload, 
  Eye, 
  EyeOff, 
  Lock, 
  Unlock, 
  RotateCcw,
  Palette,
  Type,
  Move,
  Clock,
  Download
} from 'lucide-react'
import { OverlayConfiguration, DEFAULT_OVERLAY_CONFIGURATION } from '@/types/subtitle'
import { cn } from '@/lib/utils'

interface OverlayControlsProps {
  configuration: OverlayConfiguration
  onConfigurationChange: (config: OverlayConfiguration) => void
  onFileUpload: (file: File) => void
  onExportSettings: () => void
  onImportSettings: (settings: OverlayConfiguration) => void
  onLoadFromTranslation?: () => void
  className?: string
}

const FONT_FAMILIES = [
  'Arial, sans-serif',
  'Helvetica, sans-serif',
  'Times New Roman, serif',
  'Georgia, serif',
  'Verdana, sans-serif',
  'Tahoma, sans-serif',
  'Trebuchet MS, sans-serif',
  'Impact, sans-serif',
  'Comic Sans MS, cursive',
  'Courier New, monospace'
]

const FONT_WEIGHTS = [
  { value: '100', label: 'Thin' },
  { value: '200', label: 'Extra Light' },
  { value: '300', label: 'Light' },
  { value: '400', label: 'Normal' },
  { value: '500', label: 'Medium' },
  { value: '600', label: 'Semi Bold' },
  { value: '700', label: 'Bold' },
  { value: '800', label: 'Extra Bold' },
  { value: '900', label: 'Black' }
]

const ANCHOR_POSITIONS = [
  { value: 'top-left', label: 'Top Left' },
  { value: 'top-center', label: 'Top Center' },
  { value: 'top-right', label: 'Top Right' },
  { value: 'center-left', label: 'Center Left' },
  { value: 'center', label: 'Center' },
  { value: 'center-right', label: 'Center Right' },
  { value: 'bottom-left', label: 'Bottom Left' },
  { value: 'bottom-center', label: 'Bottom Center' },
  { value: 'bottom-right', label: 'Bottom Right' }
]

export function OverlayControls({
  configuration,
  onConfigurationChange,
  onFileUpload,
  onExportSettings,
  onImportSettings,
  onLoadFromTranslation,
  className
}: OverlayControlsProps) {
  const [isCollapsed, setIsCollapsed] = useState(false)

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file && file.name.endsWith('.srt')) {
      onFileUpload(file)
    }
  }

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

  const resetToDefaults = () => {
    onConfigurationChange(DEFAULT_OVERLAY_CONFIGURATION)
  }

  return (
    <Card className={cn('w-full max-w-md', className)}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Settings className="h-5 w-5" />
            <CardTitle className="text-lg">Subtitle Overlay</CardTitle>
          </div>
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => updateConfiguration({ visible: !configuration.visible })}
            >
              {configuration.visible ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => updateConfiguration({ locked: !configuration.locked })}
            >
              {configuration.locked ? <Lock className="h-4 w-4" /> : <Unlock className="h-4 w-4" />}
            </Button>
          </div>
        </div>
        <CardDescription>
          Customize subtitle appearance and behavior
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* File Upload */}
        <div className="space-y-2">
          <Label htmlFor="subtitle-file">Load Subtitle File</Label>
          <div className="flex space-x-2">
            <Input
              id="subtitle-file"
              type="file"
              accept=".srt"
              onChange={handleFileUpload}
              className="flex-1"
            />
            <Button variant="outline" size="sm" onClick={onExportSettings}>
              <Download className="h-4 w-4" />
            </Button>
          </div>

          {/* Load from translation results */}
          {onLoadFromTranslation && (
            <Button
              variant="outline"
              size="sm"
              onClick={onLoadFromTranslation}
              className="w-full"
            >
              <Upload className="h-4 w-4 mr-2" />
              Load from Translation Results
            </Button>
          )}
        </div>

        <Separator />

        <Tabs defaultValue="style" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="style" className="flex items-center space-x-1">
              <Type className="h-4 w-4" />
              <span>Style</span>
            </TabsTrigger>
            <TabsTrigger value="position" className="flex items-center space-x-1">
              <Move className="h-4 w-4" />
              <span>Position</span>
            </TabsTrigger>
            <TabsTrigger value="sync" className="flex items-center space-x-1">
              <Clock className="h-4 w-4" />
              <span>Sync</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="style" className="space-y-4 mt-4">
            {/* Font Settings */}
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label>Font Size</Label>
                  <Slider
                    value={[configuration.style.fontSize]}
                    onValueChange={([value]) => updateStyle({ fontSize: value })}
                    min={12}
                    max={72}
                    step={1}
                    className="w-full"
                  />
                  <div className="text-xs text-muted-foreground text-center">
                    {configuration.style.fontSize}px
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label>Font Weight</Label>
                  <Select
                    value={configuration.style.fontWeight}
                    onValueChange={(value) => updateStyle({ fontWeight: value as any })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {FONT_WEIGHTS.map(weight => (
                        <SelectItem key={weight.value} value={weight.value}>
                          {weight.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Font Family</Label>
                <Select
                  value={configuration.style.fontFamily}
                  onValueChange={(value) => updateStyle({ fontFamily: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {FONT_FAMILIES.map(font => (
                      <SelectItem key={font} value={font}>
                        <span style={{ fontFamily: font }}>{font.split(',')[0]}</span>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <Separator />

            {/* Color Settings */}
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label>Text Color</Label>
                  <div className="flex space-x-2">
                    <Input
                      type="color"
                      value={configuration.style.color}
                      onChange={(e) => updateStyle({ color: e.target.value })}
                      className="w-12 h-10 p-1 border rounded"
                    />
                    <Input
                      value={configuration.style.color}
                      onChange={(e) => updateStyle({ color: e.target.value })}
                      className="flex-1 font-mono text-xs"
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label>Background</Label>
                  <div className="flex space-x-2">
                    <Input
                      type="color"
                      value={configuration.style.backgroundColor}
                      onChange={(e) => updateStyle({ backgroundColor: e.target.value })}
                      className="w-12 h-10 p-1 border rounded"
                    />
                    <Input
                      value={configuration.style.backgroundColor}
                      onChange={(e) => updateStyle({ backgroundColor: e.target.value })}
                      className="flex-1 font-mono text-xs"
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Background Opacity</Label>
                <Slider
                  value={[configuration.style.backgroundOpacity]}
                  onValueChange={([value]) => updateStyle({ backgroundOpacity: value })}
                  min={0}
                  max={1}
                  step={0.1}
                  className="w-full"
                />
                <div className="text-xs text-muted-foreground text-center">
                  {Math.round(configuration.style.backgroundOpacity * 100)}%
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="position" className="space-y-4 mt-4">
            {/* Position Settings */}
            <div className="space-y-3">
              <div className="space-y-2">
                <Label>Anchor Point</Label>
                <Select
                  value={configuration.position.anchor}
                  onValueChange={(value) => updatePosition({ anchor: value as any })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {ANCHOR_POSITIONS.map(pos => (
                      <SelectItem key={pos.value} value={pos.value}>
                        {pos.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label>X Position (%)</Label>
                  <Slider
                    value={[configuration.position.x]}
                    onValueChange={([value]) => updatePosition({ x: value })}
                    min={0}
                    max={100}
                    step={1}
                    className="w-full"
                  />
                  <div className="text-xs text-muted-foreground text-center">
                    {Math.round(configuration.position.x)}%
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label>Y Position (%)</Label>
                  <Slider
                    value={[configuration.position.y]}
                    onValueChange={([value]) => updatePosition({ y: value })}
                    min={0}
                    max={100}
                    step={1}
                    className="w-full"
                  />
                  <div className="text-xs text-muted-foreground text-center">
                    {Math.round(configuration.position.y)}%
                  </div>
                </div>
              </div>
            </div>

            <Separator />

            {/* Behavior Settings */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label htmlFor="snap-edges">Snap to Edges</Label>
                <Switch
                  id="snap-edges"
                  checked={configuration.snapToEdges}
                  onCheckedChange={(checked) => updateConfiguration({ snapToEdges: checked })}
                />
              </div>
              
              <div className="flex items-center justify-between">
                <Label htmlFor="fade-inout">Fade In/Out</Label>
                <Switch
                  id="fade-inout"
                  checked={configuration.fadeInOut}
                  onCheckedChange={(checked) => updateConfiguration({ fadeInOut: checked })}
                />
              </div>
            </div>
          </TabsContent>

          <TabsContent value="sync" className="space-y-4 mt-4">
            {/* Synchronization Settings */}
            <div className="space-y-3">
              <div className="space-y-2">
                <Label>Time Offset (ms)</Label>
                <div className="flex space-x-2">
                  <Input
                    type="number"
                    value={configuration.synchronization.offset}
                    onChange={(e) => updateSynchronization({ offset: parseInt(e.target.value) || 0 })}
                    className="flex-1"
                    step="100"
                  />
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => updateSynchronization({ offset: configuration.synchronization.offset - 500 })}
                    title="Subtract 500ms"
                  >
                    -500
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => updateSynchronization({ offset: configuration.synchronization.offset + 500 })}
                    title="Add 500ms"
                  >
                    +500
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => updateSynchronization({ offset: 0 })}
                  >
                    Reset
                  </Button>
                </div>
                <div className="text-xs text-muted-foreground">
                  {configuration.synchronization.offset > 0 ? '+' : ''}{configuration.synchronization.offset}ms
                  {configuration.synchronization.offset !== 0 && (
                    <span className="ml-2">
                      ({configuration.synchronization.offset > 0 ? 'Subtitles delayed' : 'Subtitles advanced'})
                    </span>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <Label>Speed Multiplier</Label>
                <Slider
                  value={[configuration.synchronization.speedMultiplier]}
                  onValueChange={([value]) => updateSynchronization({ speedMultiplier: value })}
                  min={0.5}
                  max={2.0}
                  step={0.1}
                  className="w-full"
                />
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>0.5x (Slower)</span>
                  <span className="font-medium">
                    {configuration.synchronization.speedMultiplier.toFixed(1)}x
                  </span>
                  <span>2.0x (Faster)</span>
                </div>
              </div>

              <Separator />

              {/* Quick Sync Buttons */}
              <div className="space-y-2">
                <Label>Quick Adjustments</Label>
                <div className="grid grid-cols-2 gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => updateSynchronization({
                      offset: configuration.synchronization.offset - 1000
                    })}
                  >
                    -1s
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => updateSynchronization({
                      offset: configuration.synchronization.offset + 1000
                    })}
                  >
                    +1s
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => updateSynchronization({
                      offset: configuration.synchronization.offset - 100
                    })}
                  >
                    -0.1s
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => updateSynchronization({
                      offset: configuration.synchronization.offset + 100
                    })}
                  >
                    +0.1s
                  </Button>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Speed Presets</Label>
                <div className="grid grid-cols-3 gap-2">
                  <Button
                    variant={configuration.synchronization.speedMultiplier === 0.8 ? "default" : "outline"}
                    size="sm"
                    onClick={() => updateSynchronization({ speedMultiplier: 0.8 })}
                  >
                    0.8x
                  </Button>
                  <Button
                    variant={configuration.synchronization.speedMultiplier === 1.0 ? "default" : "outline"}
                    size="sm"
                    onClick={() => updateSynchronization({ speedMultiplier: 1.0 })}
                  >
                    1.0x
                  </Button>
                  <Button
                    variant={configuration.synchronization.speedMultiplier === 1.2 ? "default" : "outline"}
                    size="sm"
                    onClick={() => updateSynchronization({ speedMultiplier: 1.2 })}
                  >
                    1.2x
                  </Button>
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>

        <Separator />

        {/* Reset Button */}
        <Button
          variant="outline"
          onClick={resetToDefaults}
          className="w-full"
        >
          <RotateCcw className="h-4 w-4 mr-2" />
          Reset to Defaults
        </Button>
      </CardContent>
    </Card>
  )
}
