'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  BarChart3,
  TrendingUp,
  Globe,
  Film,
  Calendar,
  Trophy,
  Award,
  Medal,
  Languages,
  Activity,
  Loader2
} from 'lucide-react'

export interface TranslationStatistics {
  period: 'week' | 'month'
  startDate: string
  endDate: string
  data: {
    topSubtitles: Array<{
      title: string
      count: number
      examples: string[]
    }>
    topLanguages: Array<{
      language: string
      languageCode: string
      count: number
      percentage: number
    }>
    totalTranslations: number
    uniqueTitles: number
    uniqueLanguages: number
    dailyBreakdown: Array<{
      date: string
      count: number
    }>
  }
}

// Helper function to get trophy icon and colors based on position
const getTrophyConfig = (position: number) => {
  switch (position) {
    case 1:
      return {
        icon: Trophy,
        bgGradient: 'from-yellow-400 to-yellow-600',
        borderColor: 'border-yellow-400/50',
        bgColor: 'bg-gradient-to-r from-yellow-50 to-amber-50',
        textColor: 'text-yellow-700',
        size: 'w-12 h-12',
        iconSize: 'h-7 w-7'
      }
    case 2:
      return {
        icon: Award,
        bgGradient: 'from-gray-400 to-gray-600',
        borderColor: 'border-gray-400/50',
        bgColor: 'bg-gradient-to-r from-gray-50 to-slate-50',
        textColor: 'text-gray-700',
        size: 'w-11 h-11',
        iconSize: 'h-6 w-6'
      }
    case 3:
      return {
        icon: Medal,
        bgGradient: 'from-amber-600 to-orange-700',
        borderColor: 'border-amber-600/50',
        bgColor: 'bg-gradient-to-r from-amber-50 to-orange-50',
        textColor: 'text-amber-700',
        size: 'w-10 h-10',
        iconSize: 'h-5 w-5'
      }
    case 4:
    case 5:
    case 6:
      return {
        icon: null,
        bgGradient: 'from-blue-500 to-blue-700',
        borderColor: 'border-blue-400/50',
        bgColor: 'bg-gradient-to-r from-blue-50 to-indigo-50',
        textColor: 'text-blue-700',
        size: 'w-9 h-9',
        iconSize: 'h-4 w-4'
      }
    default:
      return {
        icon: null,
        bgGradient: 'from-muted to-muted-foreground',
        borderColor: 'border-muted/50',
        bgColor: 'bg-muted/20',
        textColor: 'text-muted-foreground',
        size: 'w-9 h-9',
        iconSize: 'h-4 w-4'
      }
  }
}

export function TranslationStatisticsComponent() {
  const [statistics, setStatistics] = useState<TranslationStatistics | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [period, setPeriod] = useState<'week' | 'month'>('week')

  const loadStatistics = async (selectedPeriod: 'week' | 'month') => {
    setLoading(true)
    setError(null)
    
    try {
      console.log('📊 Loading statistics for period:', selectedPeriod)
      const response = await fetch(`/api/statistics?period=${selectedPeriod}`)
      
      if (!response.ok) {
        throw new Error(`Failed to fetch statistics: ${response.status}`)
      }
      
      const data = await response.json()
      console.log('📊 Statistics loaded:', data)
      setStatistics(data)
    } catch (err) {
      console.error('❌ Error loading statistics:', err)
      setError(err instanceof Error ? err.message : 'Failed to load statistics')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadStatistics(period)
  }, [period])

  const handlePeriodChange = (newPeriod: 'week' | 'month') => {
    setPeriod(newPeriod)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-primary" />
          <p className="text-muted-foreground">Loading translation statistics...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <Card className="border-destructive">
        <CardContent className="pt-6">
          <div className="text-center">
            <div className="text-destructive mb-2">⚠️ Error Loading Statistics</div>
            <p className="text-sm text-muted-foreground mb-4">{error}</p>
            <Button onClick={() => loadStatistics(period)} variant="outline">
              Try Again
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (!statistics) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="text-center text-muted-foreground">
            No statistics data available
          </div>
        </CardContent>
      </Card>
    )
  }

  const { data } = statistics

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <BarChart3 className="h-8 w-8 text-primary" />
            Translation Statistics
          </h1>
          <p className="text-muted-foreground mt-1">
            Insights into the most popular subtitles and target languages
          </p>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Translations</p>
                <p className="text-2xl font-bold">{data.totalTranslations.toLocaleString()}</p>
              </div>
              <Activity className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Unique Titles</p>
                <p className="text-2xl font-bold">{data.uniqueTitles.toLocaleString()}</p>
              </div>
              <Film className="h-8 w-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Languages</p>
                <p className="text-2xl font-bold">{data.uniqueLanguages}</p>
              </div>
              <Languages className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Period</p>
                <p className="text-2xl font-bold capitalize">{period}</p>
              </div>
              <TrendingUp className="h-8 w-8 text-orange-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Subtitles */}
        <Card>
          <CardHeader>
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <Trophy className="h-5 w-5 text-yellow-500" />
                  Most Translated Subtitles
                </CardTitle>
                <CardDescription>
                  Popular movies and TV shows for {period === 'week' ? 'this week' : 'this month'} (cleaned names)
                </CardDescription>
              </div>

              {/* Period Selector for Subtitles */}
              <Tabs value={period} onValueChange={(value) => handlePeriodChange(value as 'week' | 'month')}>
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="week" className="flex items-center gap-2 text-xs">
                    <Calendar className="h-3 w-3" />
                    This Week
                  </TabsTrigger>
                  <TabsTrigger value="month" className="flex items-center gap-2 text-xs">
                    <Calendar className="h-3 w-3" />
                    This Month
                  </TabsTrigger>
                </TabsList>
              </Tabs>
            </div>
          </CardHeader>
          <CardContent>
            {data.topSubtitles.length === 0 ? (
              <div className="text-center text-muted-foreground py-8">
                No subtitle data available for this period
              </div>
            ) : (
              <div className="space-y-4">
                {data.topSubtitles.slice(0, 6).map((subtitle, index) => {
                  const position = index + 1
                  const config = getTrophyConfig(position)
                  const IconComponent = config.icon

                  return (
                    <div
                      key={subtitle.title}
                      className={`relative flex items-center justify-between p-5 rounded-xl border-2 ${config.borderColor} ${config.bgColor} hover:shadow-lg transition-all duration-300 ${position <= 3 ? 'transform hover:scale-[1.02]' : ''}`}
                    >
                      <div className="flex items-center gap-5">
                        <div className={`flex items-center justify-center ${config.size} rounded-full bg-gradient-to-br ${config.bgGradient} shadow-lg`}>
                          {IconComponent ? (
                            <IconComponent className={`${config.iconSize} text-white`} />
                          ) : (
                            <span className="text-white font-bold text-sm">{position}</span>
                          )}
                        </div>
                        <div className="flex-1">
                          <p className={`font-bold text-xl ${config.textColor}`}>{subtitle.title}</p>
                          <p className="text-sm text-muted-foreground mt-1">
                            Examples: {subtitle.examples.slice(0, 2).join(', ')}
                            {subtitle.examples.length > 2 && '...'}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className={`text-3xl font-bold ${config.textColor}`}>
                          {subtitle.count}
                        </div>
                        <p className="text-sm text-muted-foreground">
                          translation{subtitle.count !== 1 ? 's' : ''}
                        </p>
                      </div>

                      {/* Special effects for top 3 */}
                      {position <= 3 && (
                        <div className="absolute -top-1 -right-1">
                          <div className={`w-6 h-6 rounded-full bg-gradient-to-br ${config.bgGradient} flex items-center justify-center shadow-md`}>
                            <span className="text-white text-xs font-bold">#{position}</span>
                          </div>
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Top Languages */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Globe className="h-5 w-5 text-blue-500" />
              Most Popular Target Languages
            </CardTitle>
            <CardDescription>
              All-time statistics - languages users translate to most often (not affected by period selection)
            </CardDescription>
          </CardHeader>
          <CardContent>
            {data.topLanguages.length === 0 ? (
              <div className="text-center text-muted-foreground py-8">
                No language data available
              </div>
            ) : (
              <div className="space-y-4">
                {data.topLanguages.slice(0, 6).map((language, index) => {
                  const position = index + 1
                  const config = getTrophyConfig(position)
                  const IconComponent = config.icon

                  return (
                    <div key={language.languageCode} className="relative">
                      <div className={`flex items-center justify-between p-5 rounded-xl border-2 ${config.borderColor} ${config.bgColor} hover:shadow-lg transition-all duration-300 z-10 relative ${position <= 3 ? 'transform hover:scale-[1.02]' : ''}`}>
                        <div className="flex items-center gap-5 z-10 relative">
                          <div className={`flex items-center justify-center ${config.size} rounded-full bg-gradient-to-br ${config.bgGradient} shadow-lg`}>
                            {IconComponent ? (
                              <IconComponent className={`${config.iconSize} text-white`} />
                            ) : (
                              <span className="text-white font-bold text-sm">{position}</span>
                            )}
                          </div>
                          <div>
                            <p className={`font-bold text-xl ${config.textColor}`}>{language.language}</p>
                            <p className="text-sm text-muted-foreground mt-1">
                              {language.count.toLocaleString()} translations
                            </p>
                          </div>
                        </div>
                        <div className="text-right z-10 relative">
                          <div className={`text-3xl font-bold ${config.textColor}`}>
                            {language.percentage}%
                          </div>
                        </div>

                        {/* Special effects for top 3 */}
                        {position <= 3 && (
                          <div className="absolute -top-1 -right-1">
                            <div className={`w-6 h-6 rounded-full bg-gradient-to-br ${config.bgGradient} flex items-center justify-center shadow-md`}>
                              <span className="text-white text-xs font-bold">#{position}</span>
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Progress bar */}
                      <div className="absolute inset-0 rounded-xl overflow-hidden">
                        <div
                          className={`h-full bg-gradient-to-r transition-all duration-1000 ease-out ${
                            position === 1 ? 'from-yellow-400/20 to-yellow-600/20' :
                            position === 2 ? 'from-gray-400/20 to-gray-600/20' :
                            position === 3 ? 'from-amber-600/20 to-orange-700/20' :
                            'from-blue-500/10 to-purple-600/10'
                          }`}
                          style={{ width: `${language.percentage}%` }}
                        />
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
