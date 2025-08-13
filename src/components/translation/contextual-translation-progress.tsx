'use client'

import { Progress } from '@/components/ui/progress'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { TranslationProgress, TRANSLATION_STAGES, TranslationStage } from '@/hooks/use-translation-progress'
import { CheckCircle, Circle, AlertCircle } from 'lucide-react'

interface ContextualTranslationProgressProps {
  progress: TranslationProgress
  className?: string
}

export function ContextualTranslationProgress({ progress, className }: ContextualTranslationProgressProps) {
  if (!progress.isActive && progress.stage === 'initializing') {
    return null
  }

  const getStageStatus = (stage: TranslationStage) => {
    const currentStageIndex = TRANSLATION_STAGES.findIndex(s => s.key === progress.stage)
    const stageIndex = TRANSLATION_STAGES.findIndex(s => s.key === stage.key)
    
    if (progress.stage === 'error') {
      return stageIndex <= currentStageIndex ? 'error' : 'pending'
    }
    
    if (stageIndex < currentStageIndex) return 'completed'
    if (stageIndex === currentStageIndex) return 'active'
    return 'pending'
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-green-600" />
      case 'active':
        return <div className="h-4 w-4 rounded-full bg-blue-600 animate-pulse" />
      case 'error':
        return <AlertCircle className="h-4 w-4 text-red-600" />
      default:
        return <Circle className="h-4 w-4 text-gray-300" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'text-green-600'
      case 'active':
        return 'text-blue-600 font-medium'
      case 'error':
        return 'text-red-600'
      default:
        return 'text-gray-400'
    }
  }

  return (
    <Card className={className}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-lg">AI Research-Based Translation</CardTitle>
            <CardDescription>
              Advanced contextual translation with comprehensive show research
            </CardDescription>
          </div>
          <Badge variant={progress.stage === 'error' ? 'destructive' : progress.stage === 'completed' ? 'default' : 'secondary'}>
            {progress.stage === 'error' ? 'Failed' : progress.stage === 'completed' ? 'Completed' : 'Processing'}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Overall Progress Bar */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="font-medium">Overall Progress</span>
            <span className="text-muted-foreground">{Math.round(Number(progress.progress) || 0)}%</span>
          </div>
          <Progress
            value={Number(progress.progress) || 0}
            className="h-2"
          />
          {progress.details && (
            <p className="text-sm text-muted-foreground">{String(progress.details)}</p>
          )}
        </div>

        {/* Stage List */}
        <div className="space-y-3">
          <h4 className="font-medium text-sm">Translation Stages</h4>
          <div className="space-y-2">
            {TRANSLATION_STAGES.filter(stage => stage.key !== 'error').map((stage) => {
              const status = getStageStatus(stage)
              return (
                <div key={stage.key} className="flex items-center space-x-3">
                  {getStatusIcon(status)}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-2">
                      <span className={`text-sm font-medium ${getStatusColor(status)}`}>
                        {String(stage.icon || '')} {String(stage.label || '')}
                      </span>
                      {status === 'active' && (
                        <div className="flex space-x-1">
                          <div className="w-1 h-1 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                          <div className="w-1 h-1 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                          <div className="w-1 h-1 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                        </div>
                      )}
                    </div>
                    <p className={`text-xs ${status === 'active' ? 'text-muted-foreground' : 'text-gray-400'}`}>
                      {String(stage.description || '')}
                    </p>
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Error State */}
        {progress.stage === 'error' && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
            <div className="flex items-center space-x-2">
              <AlertCircle className="h-4 w-4 text-red-600" />
              <span className="text-sm font-medium text-red-800">Translation Failed</span>
            </div>
            {progress.details && (
              <p className="text-sm text-red-700 mt-1">{String(progress.details)}</p>
            )}
          </div>
        )}

        {/* Success State */}
        {progress.stage === 'completed' && (
          <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
            <div className="flex items-center space-x-2">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <span className="text-sm font-medium text-green-800">Translation Completed Successfully!</span>
            </div>
            <p className="text-sm text-green-700 mt-1">
              Your subtitles have been translated with full contextual awareness and comprehensive show research.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
