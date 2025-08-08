export interface TranslationService {
  translate(
    texts: string[],
    targetLanguage: string,
    sourceLanguage?: string
  ): Promise<string[]>
}

export class GoogleTranslateService implements TranslationService {
  private apiKey: string

  constructor(apiKey: string) {
    this.apiKey = apiKey
  }

  async translate(
    texts: string[],
    targetLanguage: string,
    sourceLanguage?: string
  ): Promise<string[]> {
    // Use free Google Translate (without API key) via public endpoint
    return this.translateWithFreeService(texts, targetLanguage, sourceLanguage)
  }

  private async translateWithFreeService(
    texts: string[],
    targetLanguage: string,
    sourceLanguage?: string
  ): Promise<string[]> {
    const translatedTexts: string[] = []

    try {
      // Process texts in smaller batches to avoid rate limits
      const batchSize = 5
      for (let i = 0; i < texts.length; i += batchSize) {
        const batch = texts.slice(i, i + batchSize)
        const batchResults = await Promise.all(
          batch.map(text => this.translateSingleText(text, targetLanguage, sourceLanguage))
        )
        translatedTexts.push(...batchResults)

        // Add small delay between batches to be respectful
        if (i + batchSize < texts.length) {
          await new Promise(resolve => setTimeout(resolve, 100))
        }
      }

      return translatedTexts
    } catch (error) {
      console.error('Google Translate error:', error)
      // Fallback to mock translation if real translation fails
      return this.mockTranslate(texts, targetLanguage)
    }
  }

  private async translateSingleText(
    text: string,
    targetLanguage: string,
    sourceLanguage?: string
  ): Promise<string> {
    try {
      // Use Google Translate's public endpoint (no API key required)
      const sourceLang = sourceLanguage || 'auto'
      const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=${sourceLang}&tl=${targetLanguage}&dt=t&q=${encodeURIComponent(text)}`

      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        }
      })

      if (!response.ok) {
        throw new Error(`Translation failed: ${response.status}`)
      }

      const data = await response.json()

      // Parse Google Translate response format
      if (data && data[0] && Array.isArray(data[0])) {
        const translatedText = data[0]
          .map((item: any) => item[0])
          .filter((text: string) => text)
          .join('')

        return translatedText || text // Return original if translation failed
      }

      return text
    } catch (error) {
      console.warn(`Failed to translate "${text}":`, error)
      return text // Return original text if translation fails
    }
  }

  private mockTranslate(texts: string[], targetLanguage: string): Promise<string[]> {
    // Mock translation for demo purposes when real translation fails
    return new Promise((resolve) => {
      setTimeout(() => {
        const translated = texts.map(text => `[${targetLanguage.toUpperCase()}] ${text}`)
        resolve(translated)
      }, 500 + Math.random() * 1000) // Simulate API delay
    })
  }
}

export class OpenAITranslateService implements TranslationService {
  private apiKey: string
  private contextAnalysis: any = null

  constructor(apiKey: string) {
    this.apiKey = apiKey
  }

  async translate(
    texts: string[],
    targetLanguage: string,
    sourceLanguage?: string
  ): Promise<string[]> {
    if (!this.apiKey || this.apiKey.includes('your_openai_api_key')) {
      // Fallback for demo/development
      return this.mockTranslate(texts, targetLanguage)
    }

    try {
      // Build-safe: only initialize OpenAI at runtime with valid key
      if (typeof window === 'undefined' && process.env.NODE_ENV !== 'production') {
        // Build time or development: skip real OpenAI initialization
        return this.mockTranslate(texts, targetLanguage)
      }

      const { OpenAI } = await import('openai')

      const openai = new OpenAI({
        apiKey: this.apiKey,
        dangerouslyAllowBrowser: true, // Allow browser usage for demo
      })

      const translatedTexts: string[] = []

      // Language mapping for better prompts
      const languageNames: Record<string, string> = {
        'cs': 'Czech',
        'sk': 'Slovak',
        'de': 'German',
        'fr': 'French',
        'es': 'Spanish',
        'it': 'Italian',
        'pl': 'Polish',
        'ru': 'Russian',
        'en': 'English',
        'pt': 'Portuguese',
        'nl': 'Dutch',
        'sv': 'Swedish',
        'da': 'Danish',
        'no': 'Norwegian',
        'fi': 'Finnish',
        'hu': 'Hungarian',
        'ro': 'Romanian',
        'bg': 'Bulgarian',
        'hr': 'Croatian',
        'sl': 'Slovenian',
        'et': 'Estonian',
        'lv': 'Latvian',
        'lt': 'Lithuanian'
      }

      const targetLangName = languageNames[targetLanguage] || targetLanguage
      const sourceLangName = sourceLanguage ? languageNames[sourceLanguage] || sourceLanguage : 'auto-detected language'

      // Process texts in smaller batches like Google Translate
      const batchSize = 5
      for (let i = 0; i < texts.length; i += batchSize) {
        const batch = texts.slice(i, i + batchSize)

        try {
          // Simple, direct prompt without numbering to avoid [AI-CS] issues
          const textsToTranslate = batch.join('\n')

          const completion = await openai.chat.completions.create({
            model: "gpt-4o-mini",
            messages: [
              {
                role: "system",
                content: `You are a professional subtitle translator. Translate text from ${sourceLangName} to ${targetLangName}.

RULES:
- Return ONLY the translated text
- Maintain original meaning and tone
- Keep subtitle length appropriate
- Preserve formatting like [MUSIC], [SOUND], speaker names
- Do NOT add prefixes, suffixes, or explanations
- Translate line by line, maintaining the same number of lines`
              },
              {
                role: "user",
                content: textsToTranslate
              }
            ],
            temperature: 0.2,
            max_tokens: 1000,
          })

          const response = completion.choices[0]?.message?.content || ''

          // Split response into lines and clean up
          const responseLines = response.split('\n')
            .map(line => line.trim())
            .filter(line => line.length > 0)
            .map(line => {
              // Remove any unwanted prefixes like [AI-CS], [TRANSLATED], etc.
              return line.replace(/^\[.*?\]\s*/, '').trim()
            })

          // Ensure we have the same number of lines as input
          for (let j = 0; j < batch.length; j++) {
            const translatedLine = responseLines[j] || batch[j] // Fallback to original
            translatedTexts.push(translatedLine)
          }

          // Rate limiting like Google Translate
          if (i + batchSize < texts.length) {
            await new Promise(resolve => setTimeout(resolve, 100))
          }

        } catch (error) {
          console.error('OpenAI translation error for batch:', error)

          // Fallback: add original texts if translation fails
          for (const text of batch) {
            translatedTexts.push(text)
          }
        }
      }

      return translatedTexts
    } catch (error) {
      console.error('OpenAI translation error:', error)
      // Fallback to mock translation like Google Translate does
      return this.mockTranslate(texts, targetLanguage)
    }
  }

  // Premium Feature: Fast Context Analysis (lightweight)
  async analyzeContext(texts: string[]): Promise<any> {
    // Fast pattern-based analysis instead of slow AI call
    const sampleText = texts.slice(0, 20).join(' ').toLowerCase()

    let genre = "unknown"
    let tone = "neutral"
    let audience = "general"
    let title = "unknown"

    // Quick pattern detection
    if (sampleText.includes('south park') || sampleText.includes('cartman')) {
      genre = "comedy"
      tone = "humorous"
      audience = "adults"
      title = "South Park"
    } else if (sampleText.includes('♪') || sampleText.includes('♫')) {
      genre = "musical"
      tone = "upbeat"
    } else if (sampleText.includes('fuck') || sampleText.includes('shit')) {
      audience = "adults"
      tone = "casual"
    }

    console.log(`🎬 Fast context analysis: ${genre}, ${tone}, ${audience}`)

    this.contextAnalysis = {
      genre,
      setting: "modern",
      tone,
      audience,
      cultural_context: "international",
      title
    }

    return this.contextAnalysis
  }

  // Premium Feature: Fast Context-Aware Translation
  async translateWithContext(
    texts: string[],
    targetLanguage: string,
    sourceLanguage?: string,
    enableContextAnalysis = false
  ): Promise<string[]> {
    if (!this.apiKey || this.apiKey.includes('your_openai_api_key')) {
      return this.mockTranslate(texts, targetLanguage)
    }

    console.log('🎬 Premium Context Translation started:', texts.length, 'subtitles')
    const startTime = Date.now()

    try {
      // Build-safe: only initialize OpenAI at runtime with valid key
      if (typeof window === 'undefined' && process.env.NODE_ENV !== 'production') {
        // Build time or development: skip real OpenAI initialization
        return this.mockTranslate(texts, targetLanguage)
      }

      const { OpenAI } = await import('openai')

      const openai = new OpenAI({
        apiKey: this.apiKey,
        dangerouslyAllowBrowser: true,
      })

      const languageNames: Record<string, string> = {
        'cs': 'Czech', 'sk': 'Slovak', 'de': 'German', 'fr': 'French',
        'es': 'Spanish', 'it': 'Italian', 'pl': 'Polish', 'ru': 'Russian',
        'en': 'English', 'pt': 'Portuguese', 'nl': 'Dutch', 'sv': 'Swedish',
        'da': 'Danish', 'no': 'Norwegian', 'fi': 'Finnish', 'hu': 'Hungarian',
        'ro': 'Romanian', 'bg': 'Bulgarian', 'hr': 'Croatian', 'sl': 'Slovenian',
        'et': 'Estonian', 'lv': 'Latvian', 'lt': 'Lithuanian'
      }

      const targetLangName = languageNames[targetLanguage] || targetLanguage
      const sourceLangName = sourceLanguage ? languageNames[sourceLanguage] || sourceLanguage : 'auto-detected language'

      // Fast context analysis (optional, lightweight)
      let contextHint = ""
      if (enableContextAnalysis && texts.length > 10) {
        const sampleText = texts.slice(0, 10).join(' ')
        if (sampleText.includes('♪') || sampleText.includes('♫')) {
          contextHint = "\n- This appears to be a musical/song content"
        }
        if (sampleText.includes('<i>') || sampleText.includes('NARRATOR')) {
          contextHint += "\n- Contains narrative or italic text"
        }
        if (sampleText.toLowerCase().includes('south park') || sampleText.toLowerCase().includes('cartman')) {
          contextHint += "\n- This is South Park content (comedy, adult humor)"
        }
      }

      // FIXED: Process in smaller batches to maintain exact structure
      const translatedTexts: string[] = []
      const batchSize = 10 // Smaller batches for better control

      for (let i = 0; i < texts.length; i += batchSize) {
        const batch = texts.slice(i, i + batchSize)
        const batchStartIndex = i + 1

        // Create numbered batch with clear instructions
        const numberedBatch = batch.map((text, index) =>
          `${batchStartIndex + index}. ${text}`
        ).join('\n')

        const completion = await openai.chat.completions.create({
          model: "gpt-4o-mini",
          messages: [
            {
              role: "system",
              content: `You are a professional subtitle translator. Translate from ${sourceLangName} to ${targetLangName}.

CRITICAL RULES:
1. Return EXACTLY ${batch.length} numbered lines
2. Each input line = exactly one output line
3. Do NOT split long translations into multiple lines
4. Do NOT merge multiple lines into one
5. Keep each translation on its original line number
6. Preserve formatting: <i>, ♪, [SOUND], speaker names
7. NO prefixes, NO explanations, ONLY translations${contextHint}

EXAMPLE:
Input: "1. Hello world"
Output: "1. Ahoj světe"

RESPONSE FORMAT: Return numbered lines exactly matching input count.`
            },
            {
              role: "user",
              content: `Translate these ${batch.length} subtitle lines:\n\n${numberedBatch}`
            }
          ],
          temperature: 0.1,
          max_tokens: Math.min(2000, batch.length * 100),
        })

        const response = completion.choices[0]?.message?.content || ''

        // Parse response with strict validation
        const responseLines = response.split('\n')
          .map(line => line.trim())
          .filter(line => line.length > 0 && /^\d+\./.test(line)) // Only numbered lines
          .map(line => {
            // Remove numbering: "1. Hello" -> "Hello"
            return line.replace(/^\d+\.\s*/, '').trim()
          })
          .map(line => {
            // Remove any unwanted prefixes
            return line.replace(/^\[.*?\]\s*/, '').trim()
          })

        // Strict validation: ensure exact count match
        if (responseLines.length !== batch.length) {
          console.warn(`⚠️ Batch ${i}: Expected ${batch.length} lines, got ${responseLines.length}`)
          // Fallback: use original texts for this batch
          translatedTexts.push(...batch)
        } else {
          translatedTexts.push(...responseLines)
        }

        // Rate limiting between batches
        if (i + batchSize < texts.length) {
          await new Promise(resolve => setTimeout(resolve, 200))
        }
      }

      const endTime = Date.now()
      console.log(`✅ Premium translation completed in ${endTime - startTime}ms`)
      console.log(`📊 Input: ${texts.length} lines, Output: ${translatedTexts.length} lines`)

      // Final validation: ensure exact count match
      if (translatedTexts.length !== texts.length) {
        console.error(`❌ CRITICAL ERROR: Input/Output count mismatch!`)
        console.error(`Expected: ${texts.length}, Got: ${translatedTexts.length}`)

        // Emergency fallback: pad or trim to match
        while (translatedTexts.length < texts.length) {
          const missingIndex = translatedTexts.length
          translatedTexts.push(texts[missingIndex] || 'ERROR')
        }
        if (translatedTexts.length > texts.length) {
          translatedTexts.splice(texts.length)
        }

        console.log(`🔧 Fixed to ${translatedTexts.length} lines`)
      }

      return translatedTexts

    } catch (error) {
      console.error('Premium translation error:', error)
      return this.mockTranslate(texts, targetLanguage)
    }
  }

  private getContextSpecificInstructions(context: any, targetLanguage: string): string {
    if (!context) return ""

    let instructions = []

    // Genre-specific instructions
    switch (context.genre?.toLowerCase()) {
      case 'comedy':
        instructions.push(`- Adapt humor and jokes for ${targetLanguage} cultural context`)
        instructions.push("- Maintain comedic timing in translation length")
        break
      case 'action':
        instructions.push("- Use dynamic, energetic language")
        instructions.push("- Keep exclamations and commands punchy")
        break
      case 'drama':
        instructions.push("- Preserve emotional nuance and subtlety")
        instructions.push("- Use appropriate formal/informal register")
        break
      case 'horror':
        instructions.push("- Maintain suspenseful and atmospheric language")
        instructions.push("- Preserve fear-inducing terminology")
        break
      case 'sci-fi':
        instructions.push("- Adapt technical terminology appropriately")
        instructions.push("- Maintain futuristic/scientific tone")
        break
      case 'romance':
        instructions.push("- Use romantic and emotional language naturally")
        instructions.push("- Adapt intimate expressions culturally")
        break
    }

    // Audience-specific instructions
    switch (context.audience?.toLowerCase()) {
      case 'children':
        instructions.push("- Use simple, age-appropriate language")
        instructions.push("- Avoid complex sentence structures")
        break
      case 'teens':
        instructions.push("- Use contemporary, youthful expressions")
        instructions.push("- Include modern slang where appropriate")
        break
    }

    // Cultural context instructions
    if (context.cultural_context) {
      instructions.push(`- Adapt cultural references from ${context.cultural_context} context to ${targetLanguage} audience`)
    }

    return instructions.join('\n')
  }

  private buildPrompt(texts: string[], targetLanguage: string, sourceLanguage?: string): string {
    const sourceLang = sourceLanguage ? ` from ${sourceLanguage}` : ''
    const header = `Translate the following subtitle lines${sourceLang} to ${targetLanguage}:\n\n`
    const numberedTexts = texts.map((text, index) => `${index + 1}. ${text}`).join('\n')
    
    return header + numberedTexts
  }

  private mockTranslate(texts: string[], targetLanguage: string): Promise<string[]> {
    // Mock translation for demo purposes
    return new Promise((resolve) => {
      setTimeout(() => {
        const translated = texts.map(text => `[AI-${targetLanguage.toUpperCase()}] ${text}`)
        resolve(translated)
      }, 1000 + Math.random() * 2000) // Simulate longer AI processing
    })
  }
}

// LibreTranslate Service (Free)
export class LibreTranslateService implements TranslationService {
  private baseUrl: string

  constructor(baseUrl: string = 'https://libretranslate.de') {
    this.baseUrl = baseUrl
  }

  async translate(
    texts: string[],
    targetLanguage: string,
    sourceLanguage?: string
  ): Promise<string[]> {
    const translatedTexts: string[] = []

    for (const text of texts) {
      try {
        const response = await fetch(`${this.baseUrl}/translate`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            q: text,
            source: sourceLanguage || 'auto',
            target: targetLanguage,
            format: 'text'
          })
        })

        if (!response.ok) {
          throw new Error(`LibreTranslate API error: ${response.status}`)
        }

        const data = await response.json()
        translatedTexts.push(data.translatedText || text)
      } catch (error) {
        console.warn('LibreTranslate error:', error)
        translatedTexts.push(text) // Fallback to original text
      }
    }

    return translatedTexts
  }
}

// MyMemory Service (Free)
export class MyMemoryService implements TranslationService {
  async translate(
    texts: string[],
    targetLanguage: string,
    sourceLanguage?: string
  ): Promise<string[]> {
    const translatedTexts: string[] = []

    for (const text of texts) {
      try {
        const langPair = `${sourceLanguage || 'en'}|${targetLanguage}`
        const response = await fetch(
          `https://api.mymemory.translated.net/get?q=${encodeURIComponent(text)}&langpair=${langPair}`
        )

        if (!response.ok) {
          throw new Error(`MyMemory API error: ${response.status}`)
        }

        const data = await response.json()
        translatedTexts.push(data.responseData?.translatedText || text)
      } catch (error) {
        console.warn('MyMemory error:', error)
        translatedTexts.push(text) // Fallback to original text
      }
    }

    return translatedTexts
  }
}

// Premium Context-Aware Translation Service
export class PremiumTranslationService implements TranslationService {
  private openaiService: OpenAITranslateService

  constructor(openaiApiKey: string) {
    this.openaiService = new OpenAITranslateService(openaiApiKey)
  }

  async translate(
    texts: string[],
    targetLanguage: string,
    sourceLanguage?: string
  ): Promise<string[]> {
    console.log('🎬 PremiumTranslationService.translate called')
    console.log('📝 Texts to translate:', texts.length, 'items')
    console.log('🌍 Target language:', targetLanguage)
    console.log('🌍 Source language:', sourceLanguage)

    try {
      // Premium feature: Always use context analysis
      const result = await this.openaiService.translateWithContext(
        texts,
        targetLanguage,
        sourceLanguage,
        true // Enable context analysis
      )

      console.log('✅ Premium translation completed successfully')
      console.log('📝 Translated texts:', result.length, 'items')
      return result
    } catch (error) {
      console.error('❌ Premium translation failed:', error)
      throw error
    }
  }

  async analyzeContent(texts: string[]) {
    return this.openaiService.analyzeContext(texts)
  }
}

export class TranslationServiceFactory {
  static create(service: 'google' | 'openai' | 'libretranslate' | 'mymemory' | 'premium'): TranslationService {
    console.log('🔧 TranslationServiceFactory.create called with service:', service)

    switch (service) {
      case 'google':
        // Use free Google Translate service (no API key required)
        return new GoogleTranslateService('free')
      case 'openai':
        // Build-safe: only access env vars at runtime, not during build
        if (typeof window === 'undefined' && process.env.NODE_ENV === 'production') {
          // Server-side production: check for real keys
          const openaiApiKey = process.env.NEXT_PUBLIC_OPENAI_API_KEY || process.env.OPENAI_API_KEY
          if (!openaiApiKey || openaiApiKey.includes('your_openai_api_key')) {
            throw new Error('OpenAI API key not configured')
          }
          return new OpenAITranslateService(openaiApiKey)
        } else {
          // Build time or development: use safe fallback
          return new OpenAITranslateService('demo_key_for_build')
        }
      case 'libretranslate':
        return new LibreTranslateService()
      case 'mymemory':
        return new MyMemoryService()
      case 'premium':
        console.log('🎬 Creating Premium service...')
        // Build-safe: only access env vars at runtime
        if (typeof window === 'undefined' && process.env.NODE_ENV === 'production') {
          // Server-side production: check for real keys
          const premiumApiKey = process.env.NEXT_PUBLIC_OPENAI_API_KEY || process.env.OPENAI_API_KEY
          console.log('🔑 Premium API key available:', !!premiumApiKey)
          console.log('🔑 API key starts with:', premiumApiKey?.substring(0, 10))

          if (!premiumApiKey || premiumApiKey.includes('your_openai_api_key')) {
            console.error('❌ Premium API key validation failed')
            throw new Error('OpenAI API key required for Premium translation')
          }

          console.log('✅ Premium service created successfully')
          return new PremiumTranslationService(premiumApiKey)
        } else {
          // Build time or development: use safe fallback
          console.log('✅ Premium service created with demo key for build')
          return new PremiumTranslationService('demo_key_for_build')
        }
      default:
        throw new Error(`Unsupported translation service: ${service}`)
    }
  }
}
