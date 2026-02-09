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
  aiService: 'google' | 'openai' | 'premium'
}

export interface TranslationResult {
  id: string
  originalFileName: string
  translatedFileName: string
  targetLanguage: string
  sourceLanguage: string
  aiService: 'google' | 'openai' | 'premium'
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
  // Evropské jazyky
  { code: 'sk', name: 'Slovak', nativeName: 'Slovenčina' },
  { code: 'hu', name: 'Hungarian', nativeName: 'Magyar' },
  { code: 'ro', name: 'Romanian', nativeName: 'Română' },
  { code: 'bg', name: 'Bulgarian', nativeName: 'Български' },
  { code: 'hr', name: 'Croatian', nativeName: 'Hrvatski' },
  { code: 'sl', name: 'Slovenian', nativeName: 'Slovenščina' },
  { code: 'et', name: 'Estonian', nativeName: 'Eesti' },
  { code: 'lv', name: 'Latvian', nativeName: 'Latviešu' },
  { code: 'lt', name: 'Lithuanian', nativeName: 'Lietuvių' },
  { code: 'uk', name: 'Ukrainian', nativeName: 'Українська' },
  { code: 'be', name: 'Belarusian', nativeName: 'Беларуская' },
  { code: 'mk', name: 'Macedonian', nativeName: 'Македонски' },
  { code: 'sr', name: 'Serbian', nativeName: 'Српски' },
  { code: 'bs', name: 'Bosnian', nativeName: 'Bosanski' },
  { code: 'mt', name: 'Maltese', nativeName: 'Malti' },
  { code: 'is', name: 'Icelandic', nativeName: 'Íslenska' },
  { code: 'ga', name: 'Irish', nativeName: 'Gaeilge' },
  { code: 'cy', name: 'Welsh', nativeName: 'Cymraeg' },
  { code: 'eu', name: 'Basque', nativeName: 'Euskera' },
  { code: 'ca', name: 'Catalan', nativeName: 'Català' },
  { code: 'gl', name: 'Galician', nativeName: 'Galego' },
  { code: 'sq', name: 'Albanian', nativeName: 'Shqip' },
  { code: 'el', name: 'Greek', nativeName: 'Ελληνικά' },

  // Asijské jazyky
  { code: 'th', name: 'Thai', nativeName: 'ไทย' },
  { code: 'vi', name: 'Vietnamese', nativeName: 'Tiếng Việt' },
  { code: 'id', name: 'Indonesian', nativeName: 'Bahasa Indonesia' },
  { code: 'ms', name: 'Malay', nativeName: 'Bahasa Melayu' },
  { code: 'tl', name: 'Filipino', nativeName: 'Filipino' },
  { code: 'bn', name: 'Bengali', nativeName: 'বাংলা' },
  { code: 'ur', name: 'Urdu', nativeName: 'اردو' },
  { code: 'fa', name: 'Persian', nativeName: 'فارسی' },
  { code: 'he', name: 'Hebrew', nativeName: 'עברית' },
  { code: 'ta', name: 'Tamil', nativeName: 'தமிழ்' },
  { code: 'te', name: 'Telugu', nativeName: 'తెలుగు' },
  { code: 'ml', name: 'Malayalam', nativeName: 'മലയാളം' },
  { code: 'kn', name: 'Kannada', nativeName: 'ಕನ್ನಡ' },
  { code: 'gu', name: 'Gujarati', nativeName: 'ગુજરાતી' },
  { code: 'pa', name: 'Punjabi', nativeName: 'ਪੰਜਾਬੀ' },
  { code: 'mr', name: 'Marathi', nativeName: 'मराठी' },
  { code: 'ne', name: 'Nepali', nativeName: 'नेपाली' },
  { code: 'si', name: 'Sinhala', nativeName: 'සිංහල' },
  { code: 'my', name: 'Myanmar', nativeName: 'မြန်မာ' },
  { code: 'km', name: 'Khmer', nativeName: 'ខ្មែរ' },
  { code: 'lo', name: 'Lao', nativeName: 'ລາວ' },
  { code: 'ka', name: 'Georgian', nativeName: 'ქართული' },
  { code: 'hy', name: 'Armenian', nativeName: 'Հայերեն' },
  { code: 'az', name: 'Azerbaijani', nativeName: 'Azərbaycan' },
  { code: 'kk', name: 'Kazakh', nativeName: 'Қазақша' },
  { code: 'ky', name: 'Kyrgyz', nativeName: 'Кыргызча' },
  { code: 'uz', name: 'Uzbek', nativeName: 'Oʻzbekcha' },
  { code: 'tg', name: 'Tajik', nativeName: 'Тоҷикӣ' },
  { code: 'mn', name: 'Mongolian', nativeName: 'Монгол' },

  // Africké jazyky
  { code: 'sw', name: 'Swahili', nativeName: 'Kiswahili' },
  { code: 'am', name: 'Amharic', nativeName: 'አማርኛ' },
  { code: 'zu', name: 'Zulu', nativeName: 'isiZulu' },
  { code: 'xh', name: 'Xhosa', nativeName: 'isiXhosa' },
  { code: 'af', name: 'Afrikaans', nativeName: 'Afrikaans' },
  { code: 'yo', name: 'Yoruba', nativeName: 'Yorùbá' },
  { code: 'ig', name: 'Igbo', nativeName: 'Igbo' },
  { code: 'ha', name: 'Hausa', nativeName: 'Hausa' },

  // Další evropské jazyky
  { code: 'lb', name: 'Luxembourgish', nativeName: 'Lëtzebuergesch' },

  // Americké jazyky
  { code: 'qu', name: 'Quechua', nativeName: 'Runa Simi' },
  { code: 'gn', name: 'Guarani', nativeName: 'Avañe\'ẽ' },

  // Oceánské jazyky
  { code: 'mi', name: 'Maori', nativeName: 'Te Reo Māori' },
  { code: 'sm', name: 'Samoan', nativeName: 'Gagana Samoa' },
  { code: 'to', name: 'Tongan', nativeName: 'Lea Fakatonga' },
  { code: 'fj', name: 'Fijian', nativeName: 'Na Vosa Vakaviti' },

  // Další asijské jazyky
  { code: 'jv', name: 'Javanese', nativeName: 'Basa Jawa' },
  { code: 'su', name: 'Sundanese', nativeName: 'Basa Sunda' },
  { code: 'ceb', name: 'Cebuano', nativeName: 'Sinugbuanong Binisaya' },
  { code: 'haw', name: 'Hawaiian', nativeName: 'ʻŌlelo Hawaiʻi' },
  { code: 'mg', name: 'Malagasy', nativeName: 'Malagasy' },

  // Umělé jazyky
  { code: 'eo', name: 'Esperanto', nativeName: 'Esperanto' },
  { code: 'la', name: 'Latin', nativeName: 'Latina' },
]

// Subtitle Overlay Types
export interface OverlayPosition {
  x: number
  y: number
  anchor: 'top-left' | 'top-center' | 'top-right' | 'center-left' | 'center' | 'center-right' | 'bottom-left' | 'bottom-center' | 'bottom-right'
}

export interface OverlayStyle {
  fontSize: number
  fontFamily: string
  fontWeight: 'normal' | 'bold' | '100' | '200' | '300' | '400' | '500' | '600' | '700' | '800' | '900'
  color: string
  backgroundColor: string
  backgroundOpacity: number
  textShadow: boolean
  textShadowColor: string
  textShadowBlur: number
  textOutline: boolean
  textOutlineColor: string
  textOutlineWidth: number
  padding: number
  borderRadius: number
  maxWidth: number
  textAlign: 'left' | 'center' | 'right'
  lineHeight: number
}

export interface OverlaySynchronization {
  offset: number // milliseconds
  speedMultiplier: number
  autoSync: boolean
}

export interface OverlayConfiguration {
  position: OverlayPosition
  style: OverlayStyle
  synchronization: OverlaySynchronization
  visible: boolean
  locked: boolean
  snapToEdges: boolean
  fadeInOut: boolean
  fadeInOutDuration: number
}

export interface OverlaySubtitleEntry extends SubtitleEntry {
  displayStartTime: number // calculated with offset and speed
  displayEndTime: number // calculated with offset and speed
}

export interface OverlayState {
  isLoaded: boolean
  currentEntry: OverlaySubtitleEntry | null
  entries: OverlaySubtitleEntry[]
  configuration: OverlayConfiguration
  isDragging: boolean
  isControlsVisible: boolean
}

// Default configurations
export const DEFAULT_OVERLAY_STYLE: OverlayStyle = {
  fontSize: 24,
  fontFamily: 'Arial, sans-serif',
  fontWeight: 'bold',
  color: '#ffffff',
  backgroundColor: '#000000',
  backgroundOpacity: 0.7,
  textShadow: true,
  textShadowColor: '#000000',
  textShadowBlur: 2,
  textOutline: false,
  textOutlineColor: '#000000',
  textOutlineWidth: 1,
  padding: 12,
  borderRadius: 4,
  maxWidth: 80, // percentage of screen width
  textAlign: 'center',
  lineHeight: 1.2
}

export const DEFAULT_OVERLAY_POSITION: OverlayPosition = {
  x: 50, // percentage
  y: 85, // percentage
  anchor: 'bottom-center'
}

export const DEFAULT_OVERLAY_SYNCHRONIZATION: OverlaySynchronization = {
  offset: 0,
  speedMultiplier: 1.0,
  autoSync: false
}

export const DEFAULT_OVERLAY_CONFIGURATION: OverlayConfiguration = {
  position: DEFAULT_OVERLAY_POSITION,
  style: DEFAULT_OVERLAY_STYLE,
  synchronization: DEFAULT_OVERLAY_SYNCHRONIZATION,
  visible: true,
  locked: false,
  snapToEdges: true,
  fadeInOut: true,
  fadeInOutDuration: 300
}
