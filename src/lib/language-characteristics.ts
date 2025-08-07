export interface LanguageCharacteristics {
  code: string
  name: string
  // Průměrná délka slova v znacích
  averageWordLength: number
  // Rychlost čtení (slova za minutu)
  readingSpeed: number
  // Koeficient pro úpravu časování (1.0 = neutrální)
  timingMultiplier: number
  // Průměrný počet slabik na slovo
  averageSyllablesPerWord: number
  // Kompaktnost jazyka (více/méně slov pro vyjádření stejné myšlenky)
  compactness: number
}

export const LANGUAGE_CHARACTERISTICS: Record<string, LanguageCharacteristics> = {
  // Angličtina - referenční jazyk
  'en': {
    code: 'en',
    name: 'English',
    averageWordLength: 4.7,
    readingSpeed: 200,
    timingMultiplier: 1.0,
    averageSyllablesPerWord: 1.3,
    compactness: 1.0
  },
  
  // Čeština - delší slova, složitější gramatika
  'cs': {
    code: 'cs',
    name: 'Czech',
    averageWordLength: 5.8,
    readingSpeed: 180,
    timingMultiplier: 1.25,
    averageSyllablesPerWord: 1.8,
    compactness: 1.15
  },
  
  // Němčina - velmi dlouhá složená slova
  'de': {
    code: 'de',
    name: 'German',
    averageWordLength: 6.2,
    readingSpeed: 170,
    timingMultiplier: 1.3,
    averageSyllablesPerWord: 1.9,
    compactness: 1.2
  },
  
  // Španělština - rychlejší čtení, kratší slova
  'es': {
    code: 'es',
    name: 'Spanish',
    averageWordLength: 4.9,
    readingSpeed: 220,
    timingMultiplier: 0.95,
    averageSyllablesPerWord: 1.6,
    compactness: 1.05
  },
  
  // Francouzština - středně dlouhá slova
  'fr': {
    code: 'fr',
    name: 'French',
    averageWordLength: 5.1,
    readingSpeed: 190,
    timingMultiplier: 1.1,
    averageSyllablesPerWord: 1.5,
    compactness: 1.08
  },
  
  // Italština - podobná španělštině
  'it': {
    code: 'it',
    name: 'Italian',
    averageWordLength: 4.8,
    readingSpeed: 210,
    timingMultiplier: 0.98,
    averageSyllablesPerWord: 1.7,
    compactness: 1.03
  },
  
  // Portugalština
  'pt': {
    code: 'pt',
    name: 'Portuguese',
    averageWordLength: 5.0,
    readingSpeed: 200,
    timingMultiplier: 1.05,
    averageSyllablesPerWord: 1.6,
    compactness: 1.06
  },
  
  // Ruština - dlouhá slova, složitá gramatika
  'ru': {
    code: 'ru',
    name: 'Russian',
    averageWordLength: 6.1,
    readingSpeed: 160,
    timingMultiplier: 1.35,
    averageSyllablesPerWord: 2.1,
    compactness: 1.25
  },
  
  // Japonština - kompaktní, ale pomalé čtení
  'ja': {
    code: 'ja',
    name: 'Japanese',
    averageWordLength: 3.2,
    readingSpeed: 140,
    timingMultiplier: 1.4,
    averageSyllablesPerWord: 2.3,
    compactness: 0.8
  },
  
  // Korejština - podobná japonštině
  'ko': {
    code: 'ko',
    name: 'Korean',
    averageWordLength: 3.5,
    readingSpeed: 150,
    timingMultiplier: 1.3,
    averageSyllablesPerWord: 2.0,
    compactness: 0.85
  },
  
  // Čínština - velmi kompaktní
  'zh': {
    code: 'zh',
    name: 'Chinese',
    averageWordLength: 2.1,
    readingSpeed: 130,
    timingMultiplier: 1.2,
    averageSyllablesPerWord: 1.0,
    compactness: 0.6
  },
  
  // Arabština - RTL, složitá struktura
  'ar': {
    code: 'ar',
    name: 'Arabic',
    averageWordLength: 5.5,
    readingSpeed: 160,
    timingMultiplier: 1.3,
    averageSyllablesPerWord: 1.8,
    compactness: 1.2
  },
  
  // Hindština
  'hi': {
    code: 'hi',
    name: 'Hindi',
    averageWordLength: 5.2,
    readingSpeed: 170,
    timingMultiplier: 1.25,
    averageSyllablesPerWord: 1.9,
    compactness: 1.15
  },
  
  // Polština - podobná češtině
  'pl': {
    code: 'pl',
    name: 'Polish',
    averageWordLength: 5.6,
    readingSpeed: 175,
    timingMultiplier: 1.2,
    averageSyllablesPerWord: 1.7,
    compactness: 1.12
  },
  
  // Holandština
  'nl': {
    code: 'nl',
    name: 'Dutch',
    averageWordLength: 5.4,
    readingSpeed: 185,
    timingMultiplier: 1.15,
    averageSyllablesPerWord: 1.6,
    compactness: 1.1
  },
  
  // Švédština
  'sv': {
    code: 'sv',
    name: 'Swedish',
    averageWordLength: 5.2,
    readingSpeed: 190,
    timingMultiplier: 1.1,
    averageSyllablesPerWord: 1.5,
    compactness: 1.05
  },
  
  // Dánština
  'da': {
    code: 'da',
    name: 'Danish',
    averageWordLength: 5.0,
    readingSpeed: 195,
    timingMultiplier: 1.08,
    averageSyllablesPerWord: 1.4,
    compactness: 1.03
  },
  
  // Norština
  'no': {
    code: 'no',
    name: 'Norwegian',
    averageWordLength: 4.9,
    readingSpeed: 200,
    timingMultiplier: 1.05,
    averageSyllablesPerWord: 1.4,
    compactness: 1.02
  },
  
  // Finština - velmi dlouhá slova
  'fi': {
    code: 'fi',
    name: 'Finnish',
    averageWordLength: 6.8,
    readingSpeed: 155,
    timingMultiplier: 1.4,
    averageSyllablesPerWord: 2.2,
    compactness: 1.3
  },
  
  // Turečtina
  'tr': {
    code: 'tr',
    name: 'Turkish',
    averageWordLength: 5.7,
    readingSpeed: 165,
    timingMultiplier: 1.25,
    averageSyllablesPerWord: 1.9,
    compactness: 1.18
  }
}

/**
 * Získá charakteristiky jazyka nebo vrátí výchozí hodnoty
 */
export function getLanguageCharacteristics(languageCode: string): LanguageCharacteristics {
  return LANGUAGE_CHARACTERISTICS[languageCode] || LANGUAGE_CHARACTERISTICS['en']
}

/**
 * Vypočítá koeficient pro úpravu časování mezi dvěma jazyky
 */
export function calculateTimingAdjustment(
  sourceLanguage: string,
  targetLanguage: string,
  originalText: string,
  translatedText: string
): number {
  const sourceChar = getLanguageCharacteristics(sourceLanguage)
  const targetChar = getLanguageCharacteristics(targetLanguage)

  // Základní koeficient založený na charakteristikách jazyků
  const languageRatio = targetChar.timingMultiplier / sourceChar.timingMultiplier

  // Koeficient založený na skutečné délce textu
  const lengthRatio = translatedText.length / originalText.length

  // Koeficient založený na počtu slov
  const sourceWords = originalText.split(/\s+/).length
  const targetWords = translatedText.split(/\s+/).length
  const wordRatio = targetWords / sourceWords

  // Koeficient založený na kompaktnosti jazyka
  const compactnessRatio = targetChar.compactness / sourceChar.compactness

  // Kombinace všech faktorů s váhami
  const finalRatio = (
    languageRatio * 0.4 +      // 40% - charakteristiky jazyka
    lengthRatio * 0.3 +        // 30% - skutečná délka textu
    wordRatio * 0.2 +          // 20% - počet slov
    compactnessRatio * 0.1     // 10% - kompaktnost
  )

  // Debug logging
  console.log('⏱️ Timing adjustment calculation:')
  console.log(`📝 Original: "${originalText}" (${originalText.length} chars, ${sourceWords} words)`)
  console.log(`📝 Translated: "${translatedText}" (${translatedText.length} chars, ${targetWords} words)`)
  console.log(`🌍 ${sourceLanguage} → ${targetLanguage}`)
  console.log(`📊 Language ratio: ${languageRatio.toFixed(2)}`)
  console.log(`📊 Length ratio: ${lengthRatio.toFixed(2)}`)
  console.log(`📊 Word ratio: ${wordRatio.toFixed(2)}`)
  console.log(`📊 Compactness ratio: ${compactnessRatio.toFixed(2)}`)
  console.log(`⏱️ Final timing ratio: ${finalRatio.toFixed(2)}`)

  // Omezení na rozumné hodnoty (0.5x až 2.5x)
  const clampedRatio = Math.max(0.5, Math.min(2.5, finalRatio))

  if (clampedRatio !== finalRatio) {
    console.log(`⚠️ Ratio clamped from ${finalRatio.toFixed(2)} to ${clampedRatio.toFixed(2)}`)
  }

  return clampedRatio
}
