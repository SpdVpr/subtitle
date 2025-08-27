import { SubtitleEntry, SubtitleFile } from '@/types/subtitle'
import { calculateTimingAdjustment, getLanguageCharacteristics } from './language-characteristics'

export class SubtitleProcessor {
  /**
   * Auto-detect and parse subtitle file based on extension
   */
  static parseSubtitleFile(content: string, fileName: string): SubtitleEntry[] {
    const extension = fileName.toLowerCase().split('.').pop()

    switch (extension) {
      case 'srt':
        return this.parseSRT(content)
      case 'vtt':
        return this.parseVTT(content)
      case 'ass':
      case 'ssa':
        return this.parseASS(content)
      case 'sub':
        return this.parseSUB(content)
      case 'sbv':
        return this.parseSBV(content)
      default:
        // Fallback to SRT parser for unknown formats
        return this.parseSRT(content)
    }
  }

  /**
   * Parse SRT file content into subtitle entries
   */
  static parseSRT(content: string): SubtitleEntry[] {
    const entries: SubtitleEntry[] = []

    // Normalize line endings and split into blocks
    const normalizedContent = content.replace(/\r\n/g, '\n').replace(/\r/g, '\n')
    const blocks = normalizedContent.trim().split(/\n\s*\n/)

    for (const block of blocks) {
      const lines = block.trim().split('\n')
      if (lines.length < 3) continue

      // Parse index
      const index = parseInt(lines[0].trim())
      if (isNaN(index)) continue

      // Parse timing line with more flexible regex
      const timeMatch = lines[1].match(/(\d{2}:\d{2}:\d{2}[,\.]\d{3})\s*-->\s*(\d{2}:\d{2}:\d{2}[,\.]\d{3})/)
      if (!timeMatch) continue

      // Normalize time format (ensure comma separator)
      const startTime = timeMatch[1].replace('.', ',')
      const endTime = timeMatch[2].replace('.', ',')

      // Join all text lines (preserving line breaks in subtitle text)
      const text = lines.slice(2).join('\n').trim()

      if (text) {
        entries.push({
          index,
          startTime,
          endTime,
          text,
          originalText: text
        })
      }
    }

    return entries
  }

  /**
   * Parse VTT (WebVTT) file content into subtitle entries
   */
  static parseVTT(content: string): SubtitleEntry[] {
    const entries: SubtitleEntry[] = []
    const lines = content.replace(/\r\n/g, '\n').replace(/\r/g, '\n').split('\n')

    let index = 1
    let i = 0

    // Skip header
    while (i < lines.length && !lines[i].includes('-->')) {
      i++
    }

    while (i < lines.length) {
      // Find timing line
      if (lines[i].includes('-->')) {
        const timeMatch = lines[i].match(/(\d{2}:\d{2}:\d{2}[.,]\d{3})\s*-->\s*(\d{2}:\d{2}:\d{2}[.,]\d{3})/)
        if (timeMatch) {
          const startTime = timeMatch[1].replace('.', ',')
          const endTime = timeMatch[2].replace('.', ',')

          // Collect text lines
          const textLines = []
          i++
          while (i < lines.length && lines[i].trim() !== '' && !lines[i].includes('-->')) {
            if (lines[i].trim()) {
              textLines.push(lines[i].trim())
            }
            i++
          }

          if (textLines.length > 0) {
            entries.push({
              index,
              startTime,
              endTime,
              text: textLines.join('\n'),
              originalText: textLines.join('\n')
            })
            index++
          }
        }
      } else {
        i++
      }
    }

    return entries
  }

  /**
   * Parse ASS/SSA file content into subtitle entries
   */
  static parseASS(content: string): SubtitleEntry[] {
    const entries: SubtitleEntry[] = []
    const lines = content.replace(/\r\n/g, '\n').replace(/\r/g, '\n').split('\n')

    let index = 1
    let inEventsSection = false

    for (const line of lines) {
      if (line.trim() === '[Events]') {
        inEventsSection = true
        continue
      }

      if (inEventsSection && line.startsWith('Dialogue:')) {
        const parts = line.split(',')
        if (parts.length >= 10) {
          const startTime = this.convertAssTimeToSrt(parts[1].trim())
          const endTime = this.convertAssTimeToSrt(parts[2].trim())
          const text = parts.slice(9).join(',').replace(/\\N/g, '\n')

          if (startTime && endTime && text) {
            entries.push({
              index,
              startTime,
              endTime,
              text: text.trim(),
              originalText: text.trim()
            })
            index++
          }
        }
      }
    }

    return entries
  }

  /**
   * Parse SUB file content into subtitle entries
   */
  static parseSUB(content: string): SubtitleEntry[] {
    const entries: SubtitleEntry[] = []
    const lines = content.replace(/\r\n/g, '\n').replace(/\r/g, '\n').split('\n')

    let index = 1

    for (const line of lines) {
      const match = line.match(/\{(\d+)\}\{(\d+)\}(.+)/)
      if (match) {
        const startFrame = parseInt(match[1])
        const endFrame = parseInt(match[2])
        const text = match[3].replace(/\|/g, '\n')

        // Convert frames to time (assuming 25fps)
        const startTime = this.framesToSrtTime(startFrame, 25)
        const endTime = this.framesToSrtTime(endFrame, 25)

        entries.push({
          index,
          startTime,
          endTime,
          text: text.trim(),
          originalText: text.trim()
        })
        index++
      }
    }

    return entries
  }

  /**
   * Parse SBV file content into subtitle entries
   */
  static parseSBV(content: string): SubtitleEntry[] {
    const entries: SubtitleEntry[] = []
    const blocks = content.replace(/\r\n/g, '\n').replace(/\r/g, '\n').trim().split(/\n\s*\n/)

    let index = 1

    for (const block of blocks) {
      const lines = block.trim().split('\n')
      if (lines.length >= 2) {
        const timeMatch = lines[0].match(/(\d+:\d{2}:\d{2}[.,]\d{3}),(\d+:\d{2}:\d{2}[.,]\d{3})/)
        if (timeMatch) {
          const startTime = timeMatch[1].replace('.', ',')
          const endTime = timeMatch[2].replace('.', ',')
          const text = lines.slice(1).join('\n')

          entries.push({
            index,
            startTime,
            endTime,
            text: text.trim(),
            originalText: text.trim()
          })
          index++
        }
      }
    }

    return entries
  }

  /**
   * Helper: Convert ASS time format to SRT time format
   */
  private static convertAssTimeToSrt(assTime: string): string {
    // ASS format: H:MM:SS.CC (centiseconds)
    // SRT format: HH:MM:SS,mmm (milliseconds)
    const match = assTime.match(/(\d+):(\d{2}):(\d{2})\.(\d{2})/)
    if (match) {
      const hours = match[1].padStart(2, '0')
      const minutes = match[2]
      const seconds = match[3]
      const centiseconds = match[4]
      const milliseconds = (parseInt(centiseconds) * 10).toString().padStart(3, '0')

      return `${hours}:${minutes}:${seconds},${milliseconds}`
    }
    return assTime
  }

  /**
   * Helper: Convert frame number to SRT time format
   */
  private static framesToSrtTime(frames: number, fps: number): string {
    const totalSeconds = frames / fps
    const hours = Math.floor(totalSeconds / 3600)
    const minutes = Math.floor((totalSeconds % 3600) / 60)
    const seconds = Math.floor(totalSeconds % 60)
    const milliseconds = Math.floor((totalSeconds % 1) * 1000)

    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')},${milliseconds.toString().padStart(3, '0')}`
  }

  /**
   * Generate SRT file content from subtitle entries
   */
  static generateSRT(entries: SubtitleEntry[]): string {
    return entries
      .map(entry => {
        return `${entry.index}\n${entry.startTime} --> ${entry.endTime}\n${entry.text}\n`
      })
      .join('\n')
  }

  /**
   * Validate SRT file format
   */
  static validateSRT(content: string): { isValid: boolean; error?: string } {
    try {
      const entries = this.parseSRT(content)
      
      if (entries.length === 0) {
        return { isValid: false, error: 'No valid subtitle entries found' }
      }

      // Check for basic format issues
      for (const entry of entries) {
        if (!entry.startTime || !entry.endTime || !entry.text) {
          return { isValid: false, error: `Invalid entry at index ${entry.index}` }
        }

        // Validate time format
        const timeRegex = /^\d{2}:\d{2}:\d{2},\d{3}$/
        if (!timeRegex.test(entry.startTime) || !timeRegex.test(entry.endTime)) {
          return { isValid: false, error: `Invalid time format at index ${entry.index}` }
        }
      }

      return { isValid: true }
    } catch (error) {
      return { isValid: false, error: 'Failed to parse SRT file' }
    }
  }

  /**
   * Process uploaded file and return subtitle data
   */
  static async processFile(file: File): Promise<SubtitleFile> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      
      reader.onload = (event) => {
        try {
          const content = event.target?.result as string

          // Use auto-detect parser based on file extension
          const entries = this.parseSubtitleFile(content, file.name)

          if (entries.length === 0) {
            reject(new Error('No valid subtitle entries found'))
            return
          }
          
          resolve({
            name: file.name,
            size: file.size,
            content,
            entries
          })
        } catch (error) {
          reject(new Error('Failed to process file'))
        }
      }

      reader.onerror = () => {
        reject(new Error('Failed to read file'))
      }

      reader.readAsText(file, 'utf-8')
    })
  }

  /**
   * Estimate translation time based on subtitle count
   */
  static estimateProcessingTime(entryCount: number, aiService: 'google' | 'openai'): number {
    // Base time per entry in milliseconds
    const baseTimePerEntry = aiService === 'google' ? 100 : 200
    const overhead = 2000 // 2 seconds overhead
    
    return (entryCount * baseTimePerEntry) + overhead
  }

  /**
   * Split long text into chunks for API limits
   */
  static splitTextForTranslation(entries: SubtitleEntry[], maxChunkSize: number = 1000): string[][] {
    const chunks: string[][] = []
    let currentChunk: string[] = []
    let currentSize = 0

    for (const entry of entries) {
      const textLength = entry.text.length

      if (currentSize + textLength > maxChunkSize && currentChunk.length > 0) {
        chunks.push([...currentChunk])
        currentChunk = []
        currentSize = 0
      }

      currentChunk.push(entry.text)
      currentSize += textLength
    }

    if (currentChunk.length > 0) {
      chunks.push(currentChunk)
    }

    return chunks
  }

  /**
   * Smart chunking for Premium Context AI - preserves narrative flow
   */
  static splitTextForPremiumTranslation(entries: SubtitleEntry[], maxChunkSize: number = 2000): string[][] {
    const chunks: string[][] = []
    let currentChunk: string[] = []
    let currentSize = 0

    for (let i = 0; i < entries.length; i++) {
      const entry = entries[i]
      const textLength = entry.text.length

      // Check if adding this entry would exceed the limit
      if (currentSize + textLength > maxChunkSize && currentChunk.length > 0) {
        // Try to find a good break point (avoid breaking in middle of dialogue)
        let breakPoint = currentChunk.length

        // Look for natural break points in the last few entries
        for (let j = Math.max(0, currentChunk.length - 5); j < currentChunk.length; j++) {
          const text = currentChunk[j].toLowerCase()
          // Good break points: scene changes, speaker changes, music/sound effects
          if (text.includes('[') || text.includes('♪') || text.includes('narrator') ||
              text.includes('music') || text.includes('sound') || text.length < 20) {
            breakPoint = j + 1
            break
          }
        }

        // Split at the break point
        if (breakPoint < currentChunk.length) {
          chunks.push(currentChunk.slice(0, breakPoint))
          currentChunk = currentChunk.slice(breakPoint)
          currentSize = currentChunk.reduce((sum, text) => sum + text.length, 0)
        } else {
          chunks.push([...currentChunk])
          currentChunk = []
          currentSize = 0
        }
      }

      currentChunk.push(entry.text)
      currentSize += textLength
    }

    if (currentChunk.length > 0) {
      chunks.push(currentChunk)
    }

    return chunks
  }

  /**
   * Merge translated chunks back into entries with intelligent timing adjustment
   */
  static mergeTranslatedChunks(
    originalEntries: SubtitleEntry[],
    translatedChunks: string[][],
    sourceLanguage: string = 'en',
    targetLanguage: string = 'en',
    isPremium: boolean = false
  ): SubtitleEntry[] {
    const translatedTexts = translatedChunks.flat()

    if (translatedTexts.length !== originalEntries.length) {
      throw new Error('Mismatch between original and translated text count')
    }

    return originalEntries.map((entry, index) => {
      const translatedText = translatedTexts[index] || entry.text
      const adjustedEntry = { ...entry, text: translatedText }

      // Premium AI uses advanced timing logic
      if (isPremium) {
        return this.adjustTimingForPremiumAI(
          adjustedEntry,
          entry.text,
          sourceLanguage,
          targetLanguage,
          originalEntries,
          index
        )
      }

      // Standard timing adjustment for other services
      return this.adjustTimingForLanguage(
        adjustedEntry,
        entry.text,
        sourceLanguage,
        targetLanguage
      )
    })
  }

  /**
   * Premium AI timing adjustment - FAST and PRECISE
   */
  static adjustTimingForPremiumAI(
    entry: SubtitleEntry,
    originalText: string,
    sourceLanguage: string,
    targetLanguage: string,
    allEntries: SubtitleEntry[],
    currentIndex: number
  ): SubtitleEntry {
    try {
      // RULE 1: If source is EN, preserve timing with minimal smart adjustments
      if (sourceLanguage === 'en') {
        return this.fastPremiumTimingAdjustment(entry, originalText, targetLanguage)
      }

      // RULE 2: For non-EN sources, use standard timing logic
      return this.adjustTimingForLanguage(entry, originalText, sourceLanguage, targetLanguage)
    } catch (error) {
      console.warn('Failed to adjust Premium timing:', error)
      return entry
    }
  }

  /**
   * Intelligent timing adjustment based on language characteristics
   */
  static adjustTimingForLanguage(
    entry: SubtitleEntry,
    originalText: string,
    sourceLanguage: string,
    targetLanguage: string
  ): SubtitleEntry {
    try {
      // Vypočítej koeficient úpravy na základě jazykových charakteristik
      const timingRatio = calculateTimingAdjustment(
        sourceLanguage,
        targetLanguage,
        originalText,
        entry.text
      )

      // Pouze upravuj pokud je změna významná (>10% změna)
      if (Math.abs(timingRatio - 1.0) < 0.1) {
        return entry
      }

      return this.adjustSubtitleTiming(entry, timingRatio, sourceLanguage, targetLanguage)
    } catch (error) {
      console.warn('Failed to adjust timing for language:', error)
      return entry
    }
  }

  /**
   * Adjust subtitle timing with language-aware constraints
   */
  static adjustSubtitleTiming(
    entry: SubtitleEntry,
    timingRatio: number,
    sourceLanguage: string = 'en',
    targetLanguage: string = 'en'
  ): SubtitleEntry {
    try {
      const startMs = this.timeToMilliseconds(entry.startTime)
      const endMs = this.timeToMilliseconds(entry.endTime)
      const originalDuration = endMs - startMs

      // Získej charakteristiky cílového jazyka pro lepší limity
      const targetChar = getLanguageCharacteristics(targetLanguage)

      // Vypočítej optimální rychlost čtení pro cílový jazyk
      const wordsInText = entry.text.split(/\s+/).length
      const charactersPerSecond = targetChar.averageWordLength * (targetChar.readingSpeed / 60)
      const optimalDuration = (entry.text.length / charactersPerSecond) * 1000

      // Kombinuj původní timing s optimálním timingem
      let newDuration = Math.round(originalDuration * timingRatio * 0.7 + optimalDuration * 0.3)

      // Dynamické limity založené na jazyce a délce textu
      const minDuration = Math.max(800, wordsInText * 300) // Minimálně 300ms na slovo
      const maxDuration = Math.min(8000, wordsInText * 1200) // Maximálně 1.2s na slovo

      newDuration = Math.max(minDuration, Math.min(maxDuration, newDuration))

      const newEndTime = this.millisecondsToTime(startMs + newDuration)

      return {
        ...entry,
        endTime: newEndTime
      }
    } catch (error) {
      console.warn('Failed to adjust timing:', error)
      return entry
    }
  }

  /**
   * Convert SRT time format to milliseconds
   */
  static timeToMilliseconds(timeStr: string): number {
    const match = timeStr.match(/(\d{2}):(\d{2}):(\d{2})[,.](\d{3})/)
    if (!match) throw new Error(`Invalid time format: ${timeStr}`)

    const [, hours, minutes, seconds, milliseconds] = match
    return (
      parseInt(hours) * 3600000 +
      parseInt(minutes) * 60000 +
      parseInt(seconds) * 1000 +
      parseInt(milliseconds)
    )
  }

  /**
   * Convert milliseconds to SRT time format
   */
  static millisecondsToTime(ms: number): string {
    const hours = Math.floor(ms / 3600000)
    const minutes = Math.floor((ms % 3600000) / 60000)
    const seconds = Math.floor((ms % 60000) / 1000)
    const milliseconds = ms % 1000

    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')},${milliseconds.toString().padStart(3, '0')}`
  }

  /**
   * Fast Premium timing adjustment - optimized for speed and accuracy
   */
  static fastPremiumTimingAdjustment(
    entry: SubtitleEntry,
    originalText: string,
    targetLanguage: string
  ): SubtitleEntry {
    const originalDuration = entry.endTime - entry.startTime
    const originalLength = originalText.length
    const translatedLength = entry.text.length

    // Quick length-based adjustment
    const lengthRatio = translatedLength / originalLength

    // Only adjust if translation is significantly longer (>30% longer)
    if (lengthRatio > 1.3) {
      // Calculate minimal extension needed
      const baseExtension = (lengthRatio - 1) * originalDuration * 0.5 // 50% of the difference
      const maxExtension = Math.min(baseExtension, 800) // Max 800ms extension

      console.log(`⏱️ Fast Premium timing: +${maxExtension}ms (ratio: ${lengthRatio.toFixed(2)})`)

      return {
        ...entry,
        endTime: entry.endTime + maxExtension
      }
    }

    // Otherwise preserve original timing (EN is perfect)
    return entry
  }

  /**
   * Preserve original timing exactly (for EN sources) - DEPRECATED
   */
  static preserveOriginalTiming(entry: SubtitleEntry, originalText: string): SubtitleEntry {
    // Use fast adjustment instead
    return this.fastPremiumTimingAdjustment(entry, originalText, 'cs')
  }

  /**
   * Analyze timing requirements for Premium AI
   */
  static analyzePremiumTiming(
    entry: SubtitleEntry,
    originalText: string,
    sourceLanguage: string,
    targetLanguage: string,
    allEntries: SubtitleEntry[],
    currentIndex: number
  ) {
    const originalDuration = entry.endTime - entry.startTime
    const optimalReadingTime = this.calculateOptimalReadingTime(entry.text, targetLanguage)

    // Context analysis
    const hasNextEntry = currentIndex < allEntries.length - 1
    const nextEntry = hasNextEntry ? allEntries[currentIndex + 1] : null
    const gapToNext = nextEntry ? nextEntry.startTime - entry.endTime : 1000

    // Speech pattern analysis
    const speechRate = this.analyzeSpeechRate(originalText, originalDuration)
    const textComplexity = this.analyzeTextComplexity(entry.text, targetLanguage)

    return {
      originalDuration,
      optimalReadingTime,
      gapToNext,
      speechRate,
      textComplexity,
      canExtend: gapToNext > 200, // Can extend if gap > 200ms
      maxExtension: Math.min(gapToNext * 0.8, 1000) // Max 80% of gap or 1s
    }
  }

  /**
   * Apply Premium timing adjustment
   */
  static applyPremiumTimingAdjustment(entry: SubtitleEntry, analysis: any): SubtitleEntry {
    const { originalDuration, optimalReadingTime, canExtend, maxExtension } = analysis

    // If reading time fits in original duration, keep it
    if (optimalReadingTime <= originalDuration) {
      console.log('✅ Original timing sufficient')
      return entry
    }

    // Calculate needed extension
    const neededExtension = optimalReadingTime - originalDuration

    if (!canExtend) {
      console.log('⚠️ Cannot extend - keeping original timing')
      return entry
    }

    // Apply smart extension
    const actualExtension = Math.min(neededExtension, maxExtension)
    console.log(`⏱️ Premium timing: +${actualExtension}ms (needed: ${neededExtension}ms)`)

    return {
      ...entry,
      endTime: entry.endTime + actualExtension
    }
  }

  /**
   * Calculate optimal reading time for text
   */
  static calculateOptimalReadingTime(text: string, language: string): number {
    const characteristics = getLanguageCharacteristics(language)
    const words = text.split(/\s+/).length
    const chars = text.length

    // Base reading time (words per minute to milliseconds)
    const baseTime = (words / characteristics.readingSpeed) * 60 * 1000

    // Adjust for character density
    const charDensityFactor = chars / (words * characteristics.averageWordLength)

    // Minimum time per subtitle (1.5s minimum)
    const minTime = 1500

    return Math.max(minTime, baseTime * charDensityFactor)
  }

  /**
   * Analyze speech rate from original timing
   */
  static analyzeSpeechRate(text: string, duration: number): number {
    const words = text.split(/\s+/).length
    return (words / duration) * 60 * 1000 // words per minute
  }

  /**
   * Analyze text complexity
   */
  static analyzeTextComplexity(text: string, language: string): number {
    const characteristics = getLanguageCharacteristics(language)
    const words = text.split(/\s+/)
    const avgWordLength = words.reduce((sum, word) => sum + word.length, 0) / words.length

    // Complexity based on word length vs language average
    return avgWordLength / characteristics.averageWordLength
  }
}
