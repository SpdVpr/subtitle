export interface SubtitleEntry {
  index: number
  startTime: string
  endTime: string
  text: string
  originalText?: string
}

export interface SubtitleFile {
  name: string
  size: number
  content: string
  entries: SubtitleEntry[]
}

export interface TranslationRequest {
  file: File
  targetLanguage: string
  sourceLanguage?: string
  aiService: 'google' | 'openai'
}

export interface TranslationResult {
  id: string
  originalFileName: string
  translatedFileName: string
  targetLanguage: string
  sourceLanguage: string
  aiService: 'google' | 'openai'
  status: 'processing' | 'completed' | 'failed'
  progress: number
  downloadUrl?: string
  errorMessage?: string
  processingTimeMs?: number
  subtitleCount: number
}

export interface LanguageOption {
  code: string
  name: string
  nativeName: string
}

export const SUPPORTED_LANGUAGES: LanguageOption[] = [
  { code: 'en', name: 'English', nativeName: 'English' },
  { code: 'es', name: 'Spanish', nativeName: 'Español' },
  { code: 'fr', name: 'French', nativeName: 'Français' },
  { code: 'de', name: 'German', nativeName: 'Deutsch' },
  { code: 'it', name: 'Italian', nativeName: 'Italiano' },
  { code: 'pt', name: 'Portuguese', nativeName: 'Português' },
  { code: 'ru', name: 'Russian', nativeName: 'Русский' },
  { code: 'ja', name: 'Japanese', nativeName: '日本語' },
  { code: 'ko', name: 'Korean', nativeName: '한국어' },
  { code: 'zh', name: 'Chinese', nativeName: '中文' },
  { code: 'ar', name: 'Arabic', nativeName: 'العربية' },
  { code: 'hi', name: 'Hindi', nativeName: 'हिन्दी' },
  { code: 'cs', name: 'Czech', nativeName: 'Čeština' },
  { code: 'pl', name: 'Polish', nativeName: 'Polski' },
  { code: 'nl', name: 'Dutch', nativeName: 'Nederlands' },
  { code: 'sv', name: 'Swedish', nativeName: 'Svenska' },
  { code: 'da', name: 'Danish', nativeName: 'Dansk' },
  { code: 'no', name: 'Norwegian', nativeName: 'Norsk' },
  { code: 'fi', name: 'Finnish', nativeName: 'Suomi' },
  { code: 'tr', name: 'Turkish', nativeName: 'Türkçe' },
]
