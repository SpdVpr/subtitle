'use client'

import React from 'react'
import { Label } from '@/components/ui/label'
import { Slider } from '@/components/ui/slider'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { OverlayConfiguration } from '@/types/subtitle'

const FONT_FAMILIES = [
  'Arial, sans-serif',
  'Helvetica, sans-serif',
  'Georgia, serif',
  'Times New Roman, serif',
  'Courier New, monospace',
  'Verdana, sans-serif',
  'Tahoma, sans-serif',
  'Impact, sans-serif'
]

const FONT_WEIGHTS = [
  { value: 'normal', label: 'Normal' },
  { value: 'bold', label: 'Bold' }
]

interface SubtitleStyleBarProps {
  configuration: OverlayConfiguration
  onConfigurationChange: (config: OverlayConfiguration) => void
}

export function SubtitleStyleBar({
  configuration,
  onConfigurationChange
}: SubtitleStyleBarProps) {
  const updateStyle = (updates: Partial<OverlayConfiguration['style']>) => {
    onConfigurationChange({
      ...configuration,
      style: { ...configuration.style, ...updates }
    })
  }

  return (
    <div className="bg-gray-50 dark:bg-card border rounded-lg p-4">
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4 items-end">
        {/* Font Size */}
        <div className="space-y-2">
          <Label className="text-xs">Size: {configuration.style.fontSize}px</Label>
          <Slider
            value={[configuration.style.fontSize]}
            onValueChange={([value]) => updateStyle({ fontSize: value })}
            min={12}
            max={48}
            step={2}
            className="w-full"
          />
        </div>

        {/* Font Family */}
        <div className="space-y-2">
          <Label className="text-xs">Font</Label>
          <Select
            value={configuration.style.fontFamily}
            onValueChange={(value) => updateStyle({ fontFamily: value })}
          >
            <SelectTrigger className="text-xs h-8">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {FONT_FAMILIES.map(font => (
                <SelectItem key={font} value={font} className="text-xs">
                  {font.split(',')[0]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Font Weight */}
        <div className="space-y-2">
          <Label className="text-xs">Weight</Label>
          <Select
            value={configuration.style.fontWeight}
            onValueChange={(value) => updateStyle({ fontWeight: value })}
          >
            <SelectTrigger className="text-xs h-8">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {FONT_WEIGHTS.map(weight => (
                <SelectItem key={weight.value} value={weight.value} className="text-xs">
                  {weight.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Text Color */}
        <div className="space-y-2">
          <Label className="text-xs">Text Color</Label>
          <input
            type="color"
            value={configuration.style.color}
            onChange={(e) => updateStyle({ color: e.target.value })}
            className="w-full h-8 rounded border cursor-pointer"
          />
        </div>

        {/* Background Color */}
        <div className="space-y-2">
          <Label className="text-xs">Background</Label>
          <input
            type="color"
            value={configuration.style.backgroundColor}
            onChange={(e) => updateStyle({ backgroundColor: e.target.value })}
            className="w-full h-8 rounded border cursor-pointer"
          />
        </div>

        {/* Background Opacity */}
        <div className="space-y-2">
          <Label className="text-xs">Opacity: {Math.round(configuration.style.backgroundOpacity * 100)}%</Label>
          <Slider
            value={[configuration.style.backgroundOpacity]}
            onValueChange={([value]) => updateStyle({ backgroundOpacity: value })}
            min={0}
            max={1}
            step={0.1}
            className="w-full"
          />
        </div>
      </div>
    </div>
  )
}
