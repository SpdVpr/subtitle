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
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-end">
        {/* Font Size - Takes more space */}
        <div className="flex-1 min-w-[120px] space-y-2">
          <Label className="text-xs font-medium">Size: {configuration.style.fontSize}px</Label>
          <Slider
            value={[configuration.style.fontSize]}
            onValueChange={([value]) => updateStyle({ fontSize: value })}
            min={12}
            max={48}
            step={2}
            className="w-full"
          />
        </div>

        {/* Font Family - Takes more space */}
        <div className="flex-1 min-w-[140px] space-y-2">
          <Label className="text-xs font-medium">Font</Label>
          <Select
            value={configuration.style.fontFamily}
            onValueChange={(value) => updateStyle({ fontFamily: value })}
          >
            <SelectTrigger className="text-xs h-9">
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

        {/* Font Weight - Compact */}
        <div className="min-w-[100px] space-y-2">
          <Label className="text-xs font-medium">Weight</Label>
          <Select
            value={configuration.style.fontWeight}
            onValueChange={(value) => updateStyle({ fontWeight: value })}
          >
            <SelectTrigger className="text-xs h-9">
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

        {/* Text Color - Compact */}
        <div className="min-w-[80px] space-y-2">
          <Label className="text-xs font-medium">Color</Label>
          <input
            type="color"
            value={configuration.style.color}
            onChange={(e) => updateStyle({ color: e.target.value })}
            className="w-full h-9 rounded border cursor-pointer"
            title="Choose text color"
          />
        </div>
      </div>
    </div>
  )
}
