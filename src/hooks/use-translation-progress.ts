'use client'

import { useState, useCallback } from 'react'

export interface TranslationProgress {
  stage: 'initializing' | 'analyzing' | 'researching' | 'analyzing_content' | 'translating' | 'finalizing' | 'completed' | 'error'
  progress: number
  details?: string
  isActive: boolean
}

export interface TranslationStage {
  key: TranslationProgress['stage']
  label: string
  description: string
  icon: string
}

export const TRANSLATION_STAGES: TranslationStage[] = [
  {
    key: 'initializing',
    label: 'Initializing',
    description: 'Starting translation process',
    icon: '🚀'
  },
  {
    key: 'analyzing',
    label: 'Analyzing File',
    description: 'Extracting show information from filename',
    icon: '📁'
  },
  {
    key: 'researching',
    label: 'Researching Content',
    description: 'Gathering contextual information about the show',
    icon: '🔍'
  },
  {
    key: 'analyzing_content',
    label: 'Analyzing Subtitles',
    description: 'Analyzing subtitle content and themes',
    icon: '📊'
  },
  {
    key: 'translating',
    label: 'Translating',
    description: 'Translating with contextual awareness',
    icon: '🌐'
  },
  {
    key: 'finalizing',
    label: 'Finalizing',
    description: 'Quality checks and final processing',
    icon: '✨'
  },
  {
    key: 'completed',
    label: 'Completed',
    description: 'Translation completed successfully',
    icon: '✅'
  },
  {
    key: 'error',
    label: 'Error',
    description: 'Translation failed',
    icon: '❌'
  }
]

export function useTranslationProgress() {
  const [progress, setProgress] = useState<TranslationProgress>({
    stage: 'initializing',
    progress: 0,
    isActive: false
  })

  const startProgress = useCallback(() => {
    console.log('🚀 useTranslationProgress.startProgress called - CLEARING ALL DATA')

    // Clear all stored reasoning data from localStorage IMMEDIATELY
    const stages = ['analyzing', 'researching', 'analyzing_content', 'translating', 'finalizing']
    stages.forEach(stage => {
      try {
        localStorage.removeItem(`translation-reasoning-${stage}`)
        console.log(`🗑️ STARTUP: Cleared localStorage data for stage: ${stage}`)
      } catch (error) {
        console.error(`Failed to clear localStorage for ${stage}:`, error)
      }
    })

    setProgress({
      stage: 'initializing',
      progress: 0,
      details: 'Starting translation...',
      isActive: true
    })
  }, [])

  const updateProgress = useCallback((stage: TranslationProgress['stage'], progressValue: number, details?: string) => {
    console.log('🎯 useTranslationProgress.updateProgress called:', { stage, progressValue, details: details?.substring(0, 100) + '...' })

    // Store JSON data in localStorage for persistence
    if (details) {
      const hasJsonData = details.includes('```json') || details.includes('```\n{') || details.includes('```\n  {')
      if (hasJsonData) {
        console.log('💎 Storing JSON data in localStorage for stage:', stage)
        try {
          localStorage.setItem(`translation-reasoning-${stage}`, details)
        } catch (error) {
          console.error('Failed to store JSON data:', error)
        }
      } else {
        // Store non-JSON data only if we don't already have JSON data
        const existingJsonData = localStorage.getItem(`translation-reasoning-${stage}`)
        if (!existingJsonData || !existingJsonData.includes('```json')) {
          console.log('📝 Storing progress data in localStorage for stage:', stage)
          try {
            localStorage.setItem(`translation-reasoning-${stage}`, details)
          } catch (error) {
            console.error('Failed to store progress data:', error)
          }
        } else {
          console.log('⏭️ Keeping existing JSON data for stage:', stage)
        }
      }
    }

    setProgress({
      stage,
      progress: progressValue,
      details,
      isActive: stage !== 'completed' && stage !== 'error'
    })
  }, [])

  const completeProgress = useCallback(() => {
    try {
      setProgress({
        stage: 'completed',
        progress: 100,
        details: 'Translation completed successfully!',
        isActive: false
      })
    } catch (error) {
      console.error('completeProgress error:', error)
    }
  }, [])

  const errorProgress = useCallback((error: string) => {
    setProgress({
      stage: 'error',
      progress: 0,
      details: error,
      isActive: false
    })
  }, [])

  const resetProgress = useCallback(() => {
    // Clear all stored reasoning data from localStorage
    const stages = ['analyzing', 'researching', 'analyzing_content', 'translating', 'finalizing']
    stages.forEach(stage => {
      try {
        localStorage.removeItem(`translation-reasoning-${stage}`)
        console.log(`🗑️ Cleared localStorage data for stage: ${stage}`)
      } catch (error) {
        console.error(`Failed to clear localStorage for ${stage}:`, error)
      }
    })

    setProgress({
      stage: 'initializing',
      progress: 0,
      isActive: false
    })
  }, [])

  const getCurrentStage = useCallback(() => {
    return TRANSLATION_STAGES.find(stage => stage.key === progress.stage) || TRANSLATION_STAGES[0]
  }, [progress.stage])

  return {
    progress,
    startProgress,
    updateProgress,
    completeProgress,
    errorProgress,
    resetProgress,
    getCurrentStage,
    stages: TRANSLATION_STAGES,
    setProgress
  }
}
