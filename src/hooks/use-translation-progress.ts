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
    setProgress({
      stage: 'initializing',
      progress: 0,
      details: 'Starting translation...',
      isActive: true
    })
  }, [])

  const updateProgress = useCallback((stage: TranslationProgress['stage'], progressValue: number, details?: string) => {
    setProgress({
      stage,
      progress: progressValue,
      details,
      isActive: stage !== 'completed' && stage !== 'error'
    })
  }, [])

  const completeProgress = useCallback(() => {
    setProgress({
      stage: 'completed',
      progress: 100,
      details: 'Translation completed successfully!',
      isActive: false
    })
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
    stages: TRANSLATION_STAGES
  }
}
