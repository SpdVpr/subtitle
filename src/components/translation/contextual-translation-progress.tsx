'use client'

import { Progress } from '@/components/ui/progress'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { TranslationProgress, TRANSLATION_STAGES, TranslationStage } from '@/hooks/use-translation-progress'
import { CheckCircle, Circle, AlertCircle, ChevronDown, ChevronRight, FileText, Search, BarChart3, Loader2 } from 'lucide-react'
import React, { useState, useCallback } from 'react'

interface ContextualTranslationProgressProps {
  progress: TranslationProgress
  selectedFile?: File | null
  result?: any
  className?: string
}

// Global storage for reasoning data - persists after translation completes
const reasoningData: Record<string, any> = {}

// Helper function to extract show info from filename
const extractShowInfoFromFilename = (filename: string) => {
  // Remove file extension and common release info
  let cleanName = filename.replace(/\.(srt|vtt|ass)$/i, '')

  // Remove common release tags
  cleanName = cleanName.replace(/\b(1080p|720p|480p|2160p|4K|HDR|x264|x265|h264|h265|HEVC|WEB|WEBRip|BluRay|BDRip|DVDRip|HDTV|WEB-DL)\b/gi, '')
  cleanName = cleanName.replace(/\b(REPACK|PROPER|INTERNAL|LIMITED|EXTENDED|UNCUT|DIRECTORS|CUT)\b/gi, '')
  cleanName = cleanName.replace(/\[[^\]]+\]/g, '') // Remove [tags]
  cleanName = cleanName.replace(/\([^)]+\)/g, '') // Remove (tags)

  // Try to extract show title, season, episode with various patterns
  const patterns = [
    /^(.+?)[\s\.]S(\d+)E(\d+)/i,  // Show.Name.S01E01
    /^(.+?)[\s\.](\d+)x(\d+)/i,   // Show.Name.1x01
    /^(.+?)[\s\.]Season[\s\.](\d+)[\s\.]Episode[\s\.](\d+)/i,
    /^(.+?)[\s\.](\d{4})[\s\.]S(\d+)E(\d+)/i,  // Show.Name.2021.S01E01
  ]

  for (const pattern of patterns) {
    const match = cleanName.match(pattern)
    if (match) {
      let title = match[1].replace(/[\.\-_]/g, ' ').trim()
      let season, episode

      if (pattern.source.includes('(\\d{4})')) {
        // Pattern with year
        season = parseInt(match[3])
        episode = parseInt(match[4])
      } else {
        season = parseInt(match[2])
        episode = parseInt(match[3])
      }

      return {
        title: title,
        season: season,
        episode: episode
      }
    }
  }

  // If no pattern matches, just use the cleaned filename as title
  return {
    title: cleanName.replace(/[\.\-_]/g, ' ').trim(),
    season: null,
    episode: null
  }
}

// Dynamic data displays for each stage
interface StageInfoDisplayProps {
  stage: TranslationStage
  isActive: boolean
  isCompleted: boolean
  progress: TranslationProgress
  selectedFile?: File | null
  storedReasoningData: Record<string, any>
  setStoredReasoningData: React.Dispatch<React.SetStateAction<Record<string, any>>>
}

function StageInfoDisplay({ stage, isActive, isCompleted, progress, selectedFile, storedReasoningData, setStoredReasoningData, jsonData }: StageInfoDisplayProps & { jsonData: Record<string, any> }) {
  // Data storage is now handled in the main component

  // Parse JSON data from stored details
  const parseStageData = (stageKey: string) => {
    // First try to use JSON data if available
    const jsonDataForStage = jsonData[stageKey]
    const regularData = storedReasoningData[stageKey]
    const data = jsonDataForStage || regularData
    console.log(`🔍 parseStageData for ${stageKey}:`, {
      hasJsonData: !!jsonDataForStage,
      hasRegularData: !!regularData,
      usingJsonData: !!jsonDataForStage,
      dataType: typeof data,
      dataPreview: data ? data.substring(0, 100) + '...' : 'none',
      allStoredKeys: Object.keys(storedReasoningData),
      allJsonKeys: Object.keys(jsonData)
    })

    // If we have real data, use it
    if (data) {
      // If data is already an object, return it directly
      if (typeof data === 'object') {
        console.log(`✅ Using object data for ${stageKey}:`, data)
        return data
      }

      // If data is a string, try to parse JSON from it
      if (typeof data === 'string') {
        console.log(`🔍 Parsing string data for ${stageKey}:`)
        console.log(`📝 Full data content:`, data)

        // Try multiple JSON extraction patterns
        let jsonMatch = data.match(/```json\s*([\s\S]*?)\s*```/)
        console.log('🔍 Pattern 1 (```json):', !!jsonMatch)

        if (!jsonMatch) {
          // Try without the json language specifier
          jsonMatch = data.match(/```\s*([\s\S]*?)\s*```/)
          console.log('🔍 Pattern 2 (```):', !!jsonMatch)
        }
        if (!jsonMatch) {
          // Try to find JSON object directly in the string
          jsonMatch = data.match(/(\{[\s\S]*\})/)
          console.log('🔍 Pattern 3 (direct JSON):', !!jsonMatch)
        }

        if (jsonMatch) {
          console.log(`🔍 Found JSON match:`, jsonMatch[1])
          try {
            const parsedData = JSON.parse(jsonMatch[1])
            console.log(`✅ Successfully parsed JSON for ${stageKey}:`, parsedData)
            return parsedData
          } catch (e) {
            console.error(`❌ Failed to parse JSON for ${stageKey}:`, e)
            console.error(`❌ Raw JSON string:`, jsonMatch[1])
            return null
          }
        } else {
          console.warn(`⚠️ No JSON pattern found in data for ${stageKey}`)
          console.warn(`⚠️ Data content:`, data)
        }
      }
    }

    // No fallback data - only show real data when available

    return null
  }

  const renderStageInfo = () => {
    const data = parseStageData(stage.key)

    switch (stage.key) {
      case 'analyzing':
        if (!data) return null
        return (
          <div className="mt-3 p-4 bg-blue-50 rounded-lg border border-blue-200">
            <div className="space-y-3">
              <div className="bg-white p-3 rounded border border-blue-100">
                <h4 className="font-semibold text-blue-900 mb-2">📁 File Information</h4>
                <div className="space-y-1 text-sm">
                  <div><strong>Title:</strong> {data.extractedInfo?.title || 'Unknown'}</div>
                  {data.extractedInfo?.year && <div><strong>Year:</strong> {data.extractedInfo.year}</div>}
                  {data.extractedInfo?.season && <div><strong>Season:</strong> {data.extractedInfo.season}</div>}
                  {data.extractedInfo?.episode && <div><strong>Episode:</strong> {data.extractedInfo.episode}</div>}
                  <div><strong>Format:</strong> {data.fileAnalysis?.format || 'Unknown'}</div>
                  <div><strong>Source:</strong> {data.fileAnalysis?.source || 'Unknown'}</div>
                  {data.fileAnalysis?.quality && <div><strong>Quality:</strong> {data.fileAnalysis.quality}</div>}
                </div>
              </div>
            </div>
          </div>
        )

      case 'researching':
        if (!data) return null
        return (
          <div className="mt-3 p-4 bg-green-50 rounded-lg border border-green-200">
            <div className="space-y-3">
              <div className="bg-white p-3 rounded border border-green-100">
                <h4 className="font-semibold text-green-900 mb-2">📚 Show Information</h4>
                <div className="space-y-1 text-sm">
                  <div><strong>Title:</strong> {data.title}</div>
                  <div><strong>Genre:</strong> {Array.isArray(data.genre) ? data.genre.join(', ') : 'Unknown'}</div>
                  {data.setting && <div><strong>Setting:</strong> {data.setting}</div>}
                </div>
              </div>
              {data.characters && Array.isArray(data.characters) && data.characters.length > 0 && (
                <div className="bg-white p-3 rounded border border-green-100">
                  <h4 className="font-semibold text-purple-900 mb-2">🎭 Main Characters</h4>
                  <div className="flex flex-wrap gap-2">
                    {data.characters.slice(0, 8).map((char: string, i: number) => (
                      <span key={i} className="bg-purple-200 text-purple-800 px-2 py-1 rounded text-xs">{char}</span>
                    ))}
                  </div>
                </div>
              )}
              {data.culturalContext && (
                <div className="bg-white p-3 rounded border border-green-100">
                  <h4 className="font-semibold text-orange-900 mb-2">🌍 Cultural Context</h4>
                  <div className="text-sm">{data.culturalContext}</div>
                </div>
              )}
              {data.plot && (
                <div className="bg-white p-3 rounded border border-green-100">
                  <h4 className="font-semibold text-yellow-900 mb-2">📖 Plot Summary</h4>
                  <div className="text-sm">{data.plot.length > 200 ? data.plot.substring(0, 200) + '...' : data.plot}</div>
                </div>
              )}
            </div>
          </div>
        )

      case 'analyzing_content':
        if (!data) return null
        return (
          <div className="mt-3 p-4 bg-purple-50 rounded-lg border border-purple-200">
            <div className="space-y-3">
              {data.subtitleStatistics && (
                <div className="bg-white p-3 rounded border border-purple-100">
                  <h4 className="font-semibold text-indigo-900 mb-2">📊 Subtitle Statistics</h4>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div><strong>Total entries:</strong> {data.subtitleStatistics.totalEntries || 0}</div>
                    <div><strong>Dialogue lines:</strong> {data.subtitleStatistics.dialogueLines || 0}</div>
                    <div><strong>Questions:</strong> {data.subtitleStatistics.questions || 0}</div>
                    <div><strong>Exclamations:</strong> {data.subtitleStatistics.exclamations || 0}</div>
                  </div>
                </div>
              )}
              {data.culturalElementsFound && Array.isArray(data.culturalElementsFound) && data.culturalElementsFound.length > 0 && (
                <div className="bg-white p-3 rounded border border-purple-100">
                  <h4 className="font-semibold text-teal-900 mb-2">🌸 Cultural Elements</h4>
                  <div className="flex flex-wrap gap-2">
                    {data.culturalElementsFound.map((term: string, i: number) => (
                      <span key={i} className="bg-teal-200 text-teal-800 px-2 py-1 rounded text-xs">{term}</span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )

      default:
        return null
    }
  }

  // Only show for key stages and when completed or active
  const keyStages = ['analyzing', 'researching', 'analyzing_content']
  if (!keyStages.includes(stage.key)) {
    return null
  }

  // Show if active, completed, has stored data, or has a selected file (for fallback data)
  const hasStoredData = storedReasoningData[stage.key]
  const hasFallbackData = selectedFile

  if (!isActive && !isCompleted && !hasStoredData && !hasFallbackData) {
    return null
  }

  return renderStageInfo()
}

export function ContextualTranslationProgress({ progress, selectedFile, result, className }: ContextualTranslationProgressProps) {
  // Use React state to store reasoning data so component re-renders when data changes
  const [storedReasoningData, setStoredReasoningData] = React.useState<Record<string, any>>({})
  // Separate storage for JSON data to prevent overwriting
  const [jsonData, setJsonData] = React.useState<Record<string, any>>({})

  // Clear data immediately when translation starts
  React.useEffect(() => {
    if (progress.stage === 'initializing' && progress.progress === 0) {
      console.log(`🗑️ NEW TRANSLATION STARTED - Clearing all stored data immediately`)
      setStoredReasoningData({})
      setJsonData({})

      // Also clear localStorage to prevent any race conditions
      const stages = ['analyzing', 'researching', 'analyzing_content', 'translating', 'finalizing']
      stages.forEach(stage => {
        try {
          localStorage.removeItem(`translation-reasoning-${stage}`)
          console.log(`🗑️ Cleared localStorage for ${stage}`)
        } catch (error) {
          console.error(`Failed to clear localStorage for ${stage}:`, error)
        }
      })
      return
    }
  }, [progress.stage, progress.progress])

  // Load data from localStorage when stage changes (but not during initialization)
  React.useEffect(() => {
    // Skip loading during initialization to prevent showing old data
    if (progress.stage === 'initializing') {
      return
    }

    console.log(`🔄 Loading data from localStorage for stage: ${progress.stage}`)

    const stages = ['analyzing', 'researching', 'analyzing_content', 'translating', 'finalizing']
    const newStoredData: Record<string, string> = {}
    const newJsonData: Record<string, string> = {}

    stages.forEach(stage => {
      const data = localStorage.getItem(`translation-reasoning-${stage}`)
      if (data) {
        console.log(`📂 Found data for ${stage}:`, data.substring(0, 100) + '...')
        newStoredData[stage] = data

        // Check if it's JSON data
        const hasJsonData = data.includes('```json') || data.includes('```\n{') || data.includes('```\n  {')
        if (hasJsonData) {
          console.log(`💎 Found JSON data for ${stage}`)
          newJsonData[stage] = data
        }
      }
    })

    setStoredReasoningData(newStoredData)
    setJsonData(newJsonData)

    console.log(`📂 Loaded data for stages:`, Object.keys(newStoredData))
    console.log(`💎 Loaded JSON data for stages:`, Object.keys(newJsonData))
  }, [progress.stage]) // Reload when stage changes to pick up new data

  console.log('🎨 ContextualTranslationProgress render:', {
    isActive: progress.isActive,
    stage: progress.stage,
    progress: progress.progress,
    selectedFile: !!selectedFile,
    hasStoredData: Object.keys(storedReasoningData).length > 0,
    hasJsonData: Object.keys(jsonData).length > 0,
    storedDataKeys: Object.keys(storedReasoningData),
    jsonDataKeys: Object.keys(jsonData),
    currentDetails: progress.details ? progress.details.substring(0, 100) + '...' : 'none',
    jsonDataPreview: Object.keys(jsonData).reduce((acc, key) => {
      acc[key] = jsonData[key] ? jsonData[key].substring(0, 50) + '...' : 'none'
      return acc
    }, {} as Record<string, string>)
  })

  // Show component if there's a selected file or if translation is active/has progress
  const shouldShow = selectedFile || progress.isActive || progress.progress > 0 || progress.stage !== 'initializing'

  if (!shouldShow) {
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
              {/* Debug info */}
              <div className="text-xs text-gray-500 mt-1">
                Component rendered - Stage: {progress.stage}, Progress: {progress.progress}%, File: {selectedFile?.name || 'none'}
              </div>
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

        {/* Translation Stages */}
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

        {/* Static Information Displays */}
        <div className="space-y-4">
          {/* Debug info */}
          {selectedFile && (
            <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="text-sm font-medium text-blue-800">File Selected: {selectedFile.name}</div>
              <div className="text-xs text-blue-600 mt-1">Ready for contextual translation analysis</div>
            </div>
          )}

          {/* Show stored data info */}
          {Object.keys(reasoningData).length > 0 && (
            <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
              <div className="text-sm font-medium text-green-800">Previous Translation Data Available</div>
              <div className="text-xs text-green-600 mt-1">
                Stages with data: {Object.keys(reasoningData).join(', ')}
              </div>
            </div>
          )}

          <StageInfoDisplay
            stage={{ key: 'analyzing', name: 'Analyzing File', icon: <FileText className="h-4 w-4" />, label: 'Analyzing File', description: 'Extracting show information from filename' }}
            isActive={progress.stage === 'analyzing'}
            isCompleted={progress.stage !== 'analyzing' && progress.progress > 15}
            progress={progress}
            selectedFile={selectedFile}
            storedReasoningData={storedReasoningData}
            setStoredReasoningData={setStoredReasoningData}
            jsonData={jsonData}
          />
          <StageInfoDisplay
            stage={{ key: 'researching', name: 'Researching Content', icon: <Search className="h-4 w-4" />, label: 'Researching Content', description: 'Gathering contextual information about the show' }}
            isActive={progress.stage === 'researching'}
            isCompleted={progress.stage !== 'researching' && progress.progress > 40}
            progress={progress}
            selectedFile={selectedFile}
            storedReasoningData={storedReasoningData}
            setStoredReasoningData={setStoredReasoningData}
            jsonData={jsonData}
          />
          <StageInfoDisplay
            stage={{ key: 'analyzing_content', name: 'Analyzing Subtitles', icon: <BarChart3 className="h-4 w-4" />, label: 'Analyzing Subtitles', description: 'Processing subtitle content and themes' }}
            isActive={progress.stage === 'analyzing_content'}
            isCompleted={progress.stage !== 'analyzing_content' && progress.progress > 50}
            progress={progress}
            selectedFile={selectedFile}
            storedReasoningData={storedReasoningData}
            setStoredReasoningData={setStoredReasoningData}
            jsonData={jsonData}
          />
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
