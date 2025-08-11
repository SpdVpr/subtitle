export interface SubtitlePreview {
  id: string
  originalFile: File
  translatedEntries: SubtitleEntry[]
  originalEntries: SubtitleEntry[]
  sourceLanguage: string
  targetLanguage: string
  aiService: 'google' | 'openai'
  createdAt: Date
  isEdited: boolean
  editHistory: EditAction[]
}

export interface EditAction {
  id: string
  type: 'edit_text' | 'edit_timing' | 'add_entry' | 'delete_entry' | 'split_entry' | 'merge_entries'
  timestamp: Date
  entryId: string
  oldValue?: any
  newValue?: any
  description: string
}

export interface SubtitleEntry {
  index: number
  startTime: string
  endTime: string
  text: string
  originalText?: string
  isEdited?: boolean
  confidence?: number // AI confidence score
  suggestions?: string[] // Alternative translations
}

export interface PreviewSettings {
  showOriginal: boolean
  showTimestamps: boolean
  showConfidence: boolean
  showSuggestions: boolean
  playbackSpeed: number
  fontSize: 'small' | 'medium' | 'large'
  theme: 'light' | 'dark'
}

export interface VideoPreview {
  videoFile?: File
  videoUrl?: string
  currentTime: number
  duration: number
  isPlaying: boolean
  volume: number
  playbackRate: number
}

export interface PreviewContextType {
  preview: SubtitlePreview | null
  settings: PreviewSettings
  video: VideoPreview | null
  loading: boolean
  error: string | null
  
  // Actions
  createPreview: (file: File, translatedEntries: SubtitleEntry[], originalEntries: SubtitleEntry[], config: any) => Promise<string>
  loadPreview: (previewId: string) => Promise<void>
  updateEntry: (entryId: string, updates: Partial<SubtitleEntry>) => Promise<void>
  addEntry: (afterIndex: number, entry: Omit<SubtitleEntry, 'index'>) => Promise<void>
  deleteEntry: (entryId: string) => Promise<void>
  splitEntry: (entryId: string, splitPoint: number) => Promise<void>
  mergeEntries: (entryIds: string[]) => Promise<void>
  
  // Settings
  updateSettings: (settings: Partial<PreviewSettings>) => void
  
  // Video
  loadVideo: (file: File) => Promise<void>
  seekTo: (time: number) => void
  play: () => void
  pause: () => void
  
  // Export
  exportSubtitles: (format: 'srt' | 'vtt' | 'ass') => Promise<Blob>
  saveChanges: () => Promise<void>
  discardChanges: () => void
}

export interface AnalyticsData {
  userId: string
  period: 'day' | 'week' | 'month' | 'year'
  startDate: Date
  endDate: Date
  
  // Translation stats
  totalTranslations: number
  translationsByLanguage: Record<string, number>
  translationsByService: Record<string, number>
  averageProcessingTime: number
  
  // File stats
  totalFiles: number
  totalSubtitles: number
  averageFileSize: number
  fileFormats: Record<string, number>
  
  // Usage stats
  storageUsed: number
  apiCallsUsed: number
  batchJobsCreated: number
  
  // Quality metrics
  averageConfidence: number
  editRate: number // percentage of translations that were edited
  errorRate: number
  
  // Time-based data
  dailyUsage: Array<{
    date: string
    translations: number
    files: number
    processingTime: number
  }>
  
  // Popular features
  featureUsage: Record<string, number>
  
  // Performance metrics
  successRate: number
  averageUserRating?: number
}

export interface AnalyticsContextType {
  data: AnalyticsData | null
  loading: boolean
  error: string | null
  
  // Actions
  loadAnalytics: (period: AnalyticsData['period'], startDate?: Date, endDate?: Date) => Promise<void>
  trackEvent: (event: string, properties?: Record<string, any>) => Promise<void>
  trackTranslation: (translationData: any) => Promise<void>
  trackEdit: (editData: any) => Promise<void>
  
  // Exports
  exportAnalytics: (format: 'csv' | 'json' | 'pdf') => Promise<Blob>
}
