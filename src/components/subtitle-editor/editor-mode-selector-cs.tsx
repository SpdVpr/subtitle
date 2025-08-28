'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  FileText,
  Monitor,
  Edit3,
  Copy,
  GitCompare,
  Users,
  ArrowRight,
  Sparkles
} from 'lucide-react'

interface EditorModeSelectorProps {
  onModeSelect: (mode: 'single' | 'dual') => void
}

export function EditorModeSelectorCs({ onModeSelect }: EditorModeSelectorProps) {
  const [selectedMode, setSelectedMode] = useState<'single' | 'dual' | null>(null)

  const handleModeSelect = (mode: 'single' | 'dual') => {
    setSelectedMode(mode)
    // Small delay for visual feedback
    setTimeout(() => {
      onModeSelect(mode)
    }, 200)
  }

  return (
    <div className="max-w-4xl mx-auto">

      <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
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
          <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 to-blue-600/5 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>

          <div className="relative z-10 text-center">
            <div className={`w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-8 transition-all duration-300 ${
              selectedMode === 'single'
                ? 'bg-blue-500 scale-110'
                : 'bg-gradient-to-br from-blue-100 to-blue-200 dark:from-blue-900 dark:to-blue-800 group-hover:scale-110'
            }`}>
              <FileText className={`h-12 w-12 transition-colors duration-300 ${
                selectedMode === 'single'
                  ? 'text-white'
                  : 'text-blue-600 dark:text-blue-400'
              }`} />
            </div>

            <h3 className="text-3xl font-bold mb-4 bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent">
              Jednoduchý Editor
            </h3>

            <p className="text-lg text-muted-foreground mb-8 max-w-md mx-auto">
              Perfektní pro editaci jednoho souboru s titulky s plnou podporou plovoucího okna
            </p>

            <div className="space-y-3 mb-8">
              <div className="flex items-center justify-center space-x-2 text-sm">
                <FileText className="h-4 w-4 text-blue-500" />
                <span>Editace jednoho souboru</span>
              </div>
              <div className="flex items-center justify-center space-x-2 text-sm">
                <Monitor className="h-4 w-4 text-blue-500" />
                <span>Podpora plovoucího okna</span>
              </div>
              <div className="flex items-center justify-center space-x-2 text-sm">
                <Edit3 className="h-4 w-4 text-blue-500" />
                <span>Všechny editační funkce</span>
              </div>
            </div>

            <Badge variant="outline" className="text-blue-600 border-blue-300 bg-blue-50 dark:bg-blue-950 px-6 py-2">
              Doporučeno pro většinu uživatelů
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
          <div className="absolute inset-0 bg-gradient-to-r from-purple-500/5 to-purple-600/5 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>

          <div className="relative z-10 text-center">
            <div className={`w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-8 transition-all duration-300 ${
              selectedMode === 'dual'
                ? 'bg-purple-500 scale-110'
                : 'bg-gradient-to-br from-purple-100 to-purple-200 dark:from-purple-900 dark:to-purple-800 group-hover:scale-110'
            }`}>
              <Copy className={`h-12 w-12 transition-colors duration-300 ${
                selectedMode === 'dual'
                  ? 'text-white'
                  : 'text-purple-600 dark:text-purple-400'
              }`} />
            </div>

            <h3 className="text-3xl font-bold mb-4 bg-gradient-to-r from-purple-600 to-purple-800 bg-clip-text text-transparent">
              Dvojitý Editor
            </h3>

            <p className="text-lg text-muted-foreground mb-8 max-w-md mx-auto">
              Porovnávejte a upravujte dva soubory s titulky vedle sebe s plovoucími okny
            </p>

            <div className="space-y-3 mb-8">
              <div className="flex items-center justify-center space-x-2 text-sm">
                <Copy className="h-4 w-4 text-purple-500" />
                <span>Dva soubory vedle sebe</span>
              </div>
              <div className="flex items-center justify-center space-x-2 text-sm">
                <GitCompare className="h-4 w-4 text-purple-500" />
                <span>Porovnání a synchronizace změn</span>
              </div>
              <div className="flex items-center justify-center space-x-2 text-sm">
                <Users className="h-4 w-4 text-purple-500" />
                <span>Perfektní pro spolupráci</span>
              </div>
            </div>

            <Badge variant="outline" className="text-purple-600 border-purple-300 bg-purple-50 dark:bg-purple-950 px-6 py-2">
              Skvělé pro porovnání a korekce
            </Badge>
          </div>
        </div>
      </div>
    </div>
  )
}
