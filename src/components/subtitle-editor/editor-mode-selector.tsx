'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  Edit3,
  Copy,
  Monitor,
  FileText,
  ArrowRight,
  Users,
  GitCompare,
  Layers,
  Search,
  Clock,
  Zap
} from 'lucide-react'

interface EditorModeSelectorProps {
  onModeSelect: (mode: 'single' | 'dual') => void
}

export function EditorModeSelector({ onModeSelect }: EditorModeSelectorProps) {
  const [selectedMode, setSelectedMode] = useState<'single' | 'dual' | null>(null)

  const handleModeSelect = (mode: 'single' | 'dual') => {
    setSelectedMode(mode)
    setTimeout(() => onModeSelect(mode), 300) // Small delay for animation
  }

  return (
    <div className="max-w-6xl mx-auto">
      <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto mb-16">
        {/* Single Editor Mode - Large Button Style */}
        <div
          className={`relative bg-gradient-to-br from-blue-50 via-white to-blue-100 dark:from-blue-950/50 dark:via-background dark:to-blue-900/50 rounded-3xl p-12 border-2 transition-all duration-300 cursor-pointer group ${
            selectedMode === 'single'
              ? 'border-blue-500 bg-blue-50 dark:border-blue-400 dark:bg-blue-950/70 scale-105 shadow-2xl'
              : 'border-blue-200 dark:border-blue-800 hover:border-blue-300 dark:hover:border-blue-700 hover:scale-102 shadow-lg hover:shadow-xl'
          }`}
          onClick={() => handleModeSelect('single')}
        >
          {/* Animated background effect */}
          <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 to-blue-600/5 rounded-3xl animate-pulse"></div>

          <div className="relative z-10 text-center">
            <div className={`w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-8 transition-all duration-300 ${
              selectedMode === 'single'
                ? 'bg-blue-500 scale-110'
                : 'bg-gradient-to-br from-blue-100 to-blue-200 dark:from-blue-900 dark:to-blue-800 group-hover:scale-110'
            }`}>
              <Edit3 className={`h-12 w-12 transition-colors duration-300 ${
                selectedMode === 'single'
                  ? 'text-white'
                  : 'text-blue-600 dark:text-blue-400'
              }`} />
            </div>

            <h3 className="text-3xl font-bold mb-4 bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent">
              Single Editor
            </h3>

            <p className="text-lg text-muted-foreground mb-8 max-w-md mx-auto">
              Perfect for editing one subtitle file with full floating window support
            </p>

            <div className="space-y-3 mb-8">
              <div className="flex items-center justify-center space-x-2 text-sm">
                <FileText className="h-4 w-4 text-blue-500" />
                <span>One file editing</span>
              </div>
              <div className="flex items-center justify-center space-x-2 text-sm">
                <Monitor className="h-4 w-4 text-blue-500" />
                <span>Floating window support</span>
              </div>
              <div className="flex items-center justify-center space-x-2 text-sm">
                <Edit3 className="h-4 w-4 text-blue-500" />
                <span>Full editing features</span>
              </div>
            </div>

            <Badge variant="outline" className="text-blue-600 border-blue-300 bg-blue-50 dark:bg-blue-950 px-6 py-2">
              Recommended for most users
            </Badge>
          </div>
        </div>

        {/* Dual Editor Mode - Large Button Style */}
        <div
          className={`relative bg-gradient-to-br from-purple-50 via-white to-purple-100 dark:from-purple-950/50 dark:via-background dark:to-purple-900/50 rounded-3xl p-12 border-2 transition-all duration-300 cursor-pointer group ${
            selectedMode === 'dual'
              ? 'border-purple-500 bg-purple-50 dark:border-purple-400 dark:bg-purple-950/70 scale-105 shadow-2xl'
              : 'border-purple-200 dark:border-purple-800 hover:border-purple-300 dark:hover:border-purple-700 hover:scale-102 shadow-lg hover:shadow-xl'
          }`}
          onClick={() => handleModeSelect('dual')}
        >
          {/* Animated background effect */}
          <div className="absolute inset-0 bg-gradient-to-r from-purple-500/5 to-purple-600/5 rounded-3xl animate-pulse"></div>

          <div className="relative z-10 text-center">
            <div className={`w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-8 transition-all duration-300 ${
              selectedMode === 'dual'
                ? 'bg-purple-500 scale-110'
                : 'bg-gradient-to-br from-purple-100 to-purple-200 dark:from-purple-900 dark:to-purple-800 group-hover:scale-110'
            }`}>
              <Layers className={`h-12 w-12 transition-colors duration-300 ${
                selectedMode === 'dual'
                  ? 'text-white'
                  : 'text-purple-600 dark:text-purple-400'
              }`} />
            </div>

            <h3 className="text-3xl font-bold mb-4 bg-gradient-to-r from-purple-600 to-purple-800 bg-clip-text text-transparent">
              Dual Editor
            </h3>

            <p className="text-lg text-muted-foreground mb-8 max-w-md mx-auto">
              Compare and edit two subtitle files side-by-side with floating windows
            </p>

            <div className="space-y-3 mb-8">
              <div className="flex items-center justify-center space-x-2 text-sm">
                <Copy className="h-4 w-4 text-purple-500" />
                <span>Two files side-by-side</span>
              </div>
              <div className="flex items-center justify-center space-x-2 text-sm">
                <GitCompare className="h-4 w-4 text-purple-500" />
                <span>Compare & sync changes</span>
              </div>
              <div className="flex items-center justify-center space-x-2 text-sm">
                <Users className="h-4 w-4 text-purple-500" />
                <span>Perfect for collaboration</span>
              </div>
            </div>

            <Badge variant="outline" className="text-purple-600 border-purple-300 bg-purple-50 dark:bg-purple-950 px-6 py-2">
              Great for comparison & correction
            </Badge>
          </div>
        </div>
      </div>

      {/* Feature Showcase */}
      <div className="text-center mt-16">
        <h2 className="text-3xl font-bold mb-4 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
          ✨ What You Can Do
        </h2>
        <p className="text-lg text-muted-foreground mb-12 max-w-2xl mx-auto">
          Powerful subtitle editing features at your fingertips
        </p>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="group hover:shadow-lg transition-all duration-300 border-0 bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950 dark:to-blue-900">
            <CardContent className="p-6 text-center">
              <div className="w-16 h-16 bg-blue-500 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
                <Edit3 className="h-8 w-8 text-white" />
              </div>
              <h3 className="font-semibold mb-2 text-blue-900 dark:text-blue-100">Precise Editing</h3>
              <p className="text-sm text-blue-700 dark:text-blue-300">
                Edit text, timing, and formatting with pixel-perfect precision
              </p>
            </CardContent>
          </Card>

          <Card className="group hover:shadow-lg transition-all duration-300 border-0 bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-950 dark:to-purple-900">
            <CardContent className="p-6 text-center">
              <div className="w-16 h-16 bg-purple-500 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
                <Zap className="h-8 w-8 text-white" />
              </div>
              <h3 className="font-semibold mb-2 text-purple-900 dark:text-purple-100">Quick Navigation</h3>
              <p className="text-sm text-purple-700 dark:text-purple-300">
                Jump between subtitles with smart pagination
              </p>
            </CardContent>
          </Card>

          <Card className="group hover:shadow-lg transition-all duration-300 border-0 bg-gradient-to-br from-green-50 to-green-100 dark:from-green-950 dark:to-green-900">
            <CardContent className="p-6 text-center">
              <div className="w-16 h-16 bg-green-500 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
                <Search className="h-8 w-8 text-white" />
              </div>
              <h3 className="font-semibold mb-2 text-green-900 dark:text-green-100">Smart Search</h3>
              <p className="text-sm text-green-700 dark:text-green-300">
                Find and replace text across all entries
              </p>
            </CardContent>
          </Card>

          <Card className="group hover:shadow-lg transition-all duration-300 border-0 bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-950 dark:to-orange-900">
            <CardContent className="p-6 text-center">
              <div className="w-16 h-16 bg-orange-500 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
                <Clock className="h-8 w-8 text-white" />
              </div>
              <h3 className="font-semibold mb-2 text-orange-900 dark:text-orange-100">Perfect Timing</h3>
              <p className="text-sm text-orange-700 dark:text-orange-300">
                Sync and adjust timing with millisecond precision
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
