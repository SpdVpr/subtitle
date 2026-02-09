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
  },

  // Slovenština - podobná češtině
  'sk': {
    code: 'sk',
    name: 'Slovak',
    averageWordLength: 5.6,
    readingSpeed: 180,
    timingMultiplier: 1.2,
    averageSyllablesPerWord: 1.7,
    compactness: 1.12
  },

  // Maďarština - velmi dlouhá slova, složitá gramatika
  'hu': {
    code: 'hu',
    name: 'Hungarian',
    averageWordLength: 6.5,
    readingSpeed: 160,
    timingMultiplier: 1.35,
    averageSyllablesPerWord: 2.0,
    compactness: 1.28
  },

  // Rumunština
  'ro': {
    code: 'ro',
    name: 'Romanian',
    averageWordLength: 5.3,
    readingSpeed: 185,
    timingMultiplier: 1.15,
    averageSyllablesPerWord: 1.6,
    compactness: 1.08
  },

  // Bulharština
  'bg': {
    code: 'bg',
    name: 'Bulgarian',
    averageWordLength: 5.8,
    readingSpeed: 170,
    timingMultiplier: 1.25,
    averageSyllablesPerWord: 1.8,
    compactness: 1.18
  },

  // Chorvatština
  'hr': {
    code: 'hr',
    name: 'Croatian',
    averageWordLength: 5.4,
    readingSpeed: 175,
    timingMultiplier: 1.2,
    averageSyllablesPerWord: 1.7,
    compactness: 1.15
  },

  // Slovinština
  'sl': {
    code: 'sl',
    name: 'Slovenian',
    averageWordLength: 5.5,
    readingSpeed: 175,
    timingMultiplier: 1.22,
    averageSyllablesPerWord: 1.7,
    compactness: 1.16
  },

  // Estonština
  'et': {
    code: 'et',
    name: 'Estonian',
    averageWordLength: 6.0,
    readingSpeed: 165,
    timingMultiplier: 1.3,
    averageSyllablesPerWord: 1.9,
    compactness: 1.22
  },

  // Lotyština
  'lv': {
    code: 'lv',
    name: 'Latvian',
    averageWordLength: 5.8,
    readingSpeed: 170,
    timingMultiplier: 1.25,
    averageSyllablesPerWord: 1.8,
    compactness: 1.2
  },

  // Litevština
  'lt': {
    code: 'lt',
    name: 'Lithuanian',
    averageWordLength: 6.2,
    readingSpeed: 165,
    timingMultiplier: 1.3,
    averageSyllablesPerWord: 1.9,
    compactness: 1.25
  },

  // Ukrajinština
  'uk': {
    code: 'uk',
    name: 'Ukrainian',
    averageWordLength: 6.0,
    readingSpeed: 165,
    timingMultiplier: 1.3,
    averageSyllablesPerWord: 2.0,
    compactness: 1.22
  },

  // Běloruština
  'be': {
    code: 'be',
    name: 'Belarusian',
    averageWordLength: 6.1,
    readingSpeed: 160,
    timingMultiplier: 1.32,
    averageSyllablesPerWord: 2.0,
    compactness: 1.24
  },

  // Makedonština
  'mk': {
    code: 'mk',
    name: 'Macedonian',
    averageWordLength: 5.6,
    readingSpeed: 170,
    timingMultiplier: 1.25,
    averageSyllablesPerWord: 1.8,
    compactness: 1.18
  },

  // Srbština
  'sr': {
    code: 'sr',
    name: 'Serbian',
    averageWordLength: 5.5,
    readingSpeed: 175,
    timingMultiplier: 1.2,
    averageSyllablesPerWord: 1.7,
    compactness: 1.16
  },

  // Bosenština
  'bs': {
    code: 'bs',
    name: 'Bosnian',
    averageWordLength: 5.4,
    readingSpeed: 175,
    timingMultiplier: 1.18,
    averageSyllablesPerWord: 1.7,
    compactness: 1.14
  },

  // Maltština
  'mt': {
    code: 'mt',
    name: 'Maltese',
    averageWordLength: 5.2,
    readingSpeed: 180,
    timingMultiplier: 1.15,
    averageSyllablesPerWord: 1.6,
    compactness: 1.1
  },

  // Islandština
  'is': {
    code: 'is',
    name: 'Icelandic',
    averageWordLength: 6.8,
    readingSpeed: 155,
    timingMultiplier: 1.4,
    averageSyllablesPerWord: 2.1,
    compactness: 1.32
  },

  // Irština
  'ga': {
    code: 'ga',
    name: 'Irish',
    averageWordLength: 5.8,
    readingSpeed: 170,
    timingMultiplier: 1.25,
    averageSyllablesPerWord: 1.8,
    compactness: 1.2
  },

  // Velština
  'cy': {
    code: 'cy',
    name: 'Welsh',
    averageWordLength: 6.2,
    readingSpeed: 160,
    timingMultiplier: 1.3,
    averageSyllablesPerWord: 1.9,
    compactness: 1.25
  },

  // Baskičtina
  'eu': {
    code: 'eu',
    name: 'Basque',
    averageWordLength: 6.5,
    readingSpeed: 155,
    timingMultiplier: 1.35,
    averageSyllablesPerWord: 2.0,
    compactness: 1.3
  },

  // Katalánština
  'ca': {
    code: 'ca',
    name: 'Catalan',
    averageWordLength: 5.1,
    readingSpeed: 195,
    timingMultiplier: 1.08,
    averageSyllablesPerWord: 1.6,
    compactness: 1.05
  },

  // Galicijština
  'gl': {
    code: 'gl',
    name: 'Galician',
    averageWordLength: 5.2,
    readingSpeed: 190,
    timingMultiplier: 1.1,
    averageSyllablesPerWord: 1.6,
    compactness: 1.06
  },

  // Albánština
  'sq': {
    code: 'sq',
    name: 'Albanian',
    averageWordLength: 5.4,
    readingSpeed: 175,
    timingMultiplier: 1.2,
    averageSyllablesPerWord: 1.7,
    compactness: 1.15
  },

  // Řečtina
  'el': {
    code: 'el',
    name: 'Greek',
    averageWordLength: 5.9,
    readingSpeed: 165,
    timingMultiplier: 1.28,
    averageSyllablesPerWord: 1.9,
    compactness: 1.2
  },

  // Thajština
  'th': {
    code: 'th',
    name: 'Thai',
    averageWordLength: 4.2,
    readingSpeed: 140,
    timingMultiplier: 1.35,
    averageSyllablesPerWord: 1.8,
    compactness: 0.9
  },

  // Vietnamština
  'vi': {
    code: 'vi',
    name: 'Vietnamese',
    averageWordLength: 4.1,
    readingSpeed: 160,
    timingMultiplier: 1.2,
    averageSyllablesPerWord: 1.5,
    compactness: 0.95
  },

  // Indonéština
  'id': {
    code: 'id',
    name: 'Indonesian',
    averageWordLength: 5.8,
    readingSpeed: 180,
    timingMultiplier: 1.15,
    averageSyllablesPerWord: 1.8,
    compactness: 1.1
  },

  // Malajština
  'ms': {
    code: 'ms',
    name: 'Malay',
    averageWordLength: 5.5,
    readingSpeed: 185,
    timingMultiplier: 1.1,
    averageSyllablesPerWord: 1.7,
    compactness: 1.05
  },

  // Filipínština
  'tl': {
    code: 'tl',
    name: 'Filipino',
    averageWordLength: 5.9,
    readingSpeed: 175,
    timingMultiplier: 1.2,
    averageSyllablesPerWord: 1.8,
    compactness: 1.15
  },

  // Bengálština
  'bn': {
    code: 'bn',
    name: 'Bengali',
    averageWordLength: 5.1,
    readingSpeed: 165,
    timingMultiplier: 1.25,
    averageSyllablesPerWord: 1.8,
    compactness: 1.1
  },

  // Urdština
  'ur': {
    code: 'ur',
    name: 'Urdu',
    averageWordLength: 5.3,
    readingSpeed: 160,
    timingMultiplier: 1.3,
    averageSyllablesPerWord: 1.9,
    compactness: 1.2
  },

  // Perština
  'fa': {
    code: 'fa',
    name: 'Persian',
    averageWordLength: 5.4,
    readingSpeed: 165,
    timingMultiplier: 1.25,
    averageSyllablesPerWord: 1.8,
    compactness: 1.18
  },

  // Hebrejština
  'he': {
    code: 'he',
    name: 'Hebrew',
    averageWordLength: 4.8,
    readingSpeed: 170,
    timingMultiplier: 1.2,
    averageSyllablesPerWord: 1.6,
    compactness: 1.1
  },

  // Tamilština
  'ta': {
    code: 'ta',
    name: 'Tamil',
    averageWordLength: 6.2,
    readingSpeed: 150,
    timingMultiplier: 1.4,
    averageSyllablesPerWord: 2.1,
    compactness: 1.25
  },

  // Telugština
  'te': {
    code: 'te',
    name: 'Telugu',
    averageWordLength: 6.0,
    readingSpeed: 155,
    timingMultiplier: 1.35,
    averageSyllablesPerWord: 2.0,
    compactness: 1.22
  },

  // Malajálamština
  'ml': {
    code: 'ml',
    name: 'Malayalam',
    averageWordLength: 6.5,
    readingSpeed: 145,
    timingMultiplier: 1.45,
    averageSyllablesPerWord: 2.2,
    compactness: 1.3
  },

  // Kannadština
  'kn': {
    code: 'kn',
    name: 'Kannada',
    averageWordLength: 6.1,
    readingSpeed: 150,
    timingMultiplier: 1.4,
    averageSyllablesPerWord: 2.1,
    compactness: 1.25
  },

  // Gudžarátština
  'gu': {
    code: 'gu',
    name: 'Gujarati',
    averageWordLength: 5.8,
    readingSpeed: 160,
    timingMultiplier: 1.3,
    averageSyllablesPerWord: 1.9,
    compactness: 1.2
  },

  // Paňdžábština
  'pa': {
    code: 'pa',
    name: 'Punjabi',
    averageWordLength: 5.5,
    readingSpeed: 165,
    timingMultiplier: 1.25,
    averageSyllablesPerWord: 1.8,
    compactness: 1.15
  },

  // Maráthština
  'mr': {
    code: 'mr',
    name: 'Marathi',
    averageWordLength: 5.9,
    readingSpeed: 155,
    timingMultiplier: 1.35,
    averageSyllablesPerWord: 2.0,
    compactness: 1.22
  },

  // Nepálština
  'ne': {
    code: 'ne',
    name: 'Nepali',
    averageWordLength: 5.6,
    readingSpeed: 160,
    timingMultiplier: 1.3,
    averageSyllablesPerWord: 1.9,
    compactness: 1.18
  },

  // Sinhálština
  'si': {
    code: 'si',
    name: 'Sinhala',
    averageWordLength: 6.3,
    readingSpeed: 145,
    timingMultiplier: 1.4,
    averageSyllablesPerWord: 2.1,
    compactness: 1.28
  },

  // Myanmarština
  'my': {
    code: 'my',
    name: 'Myanmar',
    averageWordLength: 5.8,
    readingSpeed: 140,
    timingMultiplier: 1.45,
    averageSyllablesPerWord: 2.0,
    compactness: 1.25
  },

  // Khmerština
  'km': {
    code: 'km',
    name: 'Khmer',
    averageWordLength: 5.5,
    readingSpeed: 135,
    timingMultiplier: 1.5,
    averageSyllablesPerWord: 2.2,
    compactness: 1.3
  },

  // Laoština
  'lo': {
    code: 'lo',
    name: 'Lao',
    averageWordLength: 5.2,
    readingSpeed: 140,
    timingMultiplier: 1.4,
    averageSyllablesPerWord: 2.0,
    compactness: 1.2
  },

  // Gruzínština
  'ka': {
    code: 'ka',
    name: 'Georgian',
    averageWordLength: 6.4,
    readingSpeed: 155,
    timingMultiplier: 1.35,
    averageSyllablesPerWord: 2.0,
    compactness: 1.28
  },

  // Arménština
  'hy': {
    code: 'hy',
    name: 'Armenian',
    averageWordLength: 6.1,
    readingSpeed: 160,
    timingMultiplier: 1.3,
    averageSyllablesPerWord: 1.9,
    compactness: 1.22
  },

  // Ázerbájdžánština
  'az': {
    code: 'az',
    name: 'Azerbaijani',
    averageWordLength: 5.8,
    readingSpeed: 170,
    timingMultiplier: 1.2,
    averageSyllablesPerWord: 1.8,
    compactness: 1.15
  },

  // Kazaština
  'kk': {
    code: 'kk',
    name: 'Kazakh',
    averageWordLength: 6.2,
    readingSpeed: 160,
    timingMultiplier: 1.3,
    averageSyllablesPerWord: 1.9,
    compactness: 1.25
  },

  // Kyrgyzština
  'ky': {
    code: 'ky',
    name: 'Kyrgyz',
    averageWordLength: 6.0,
    readingSpeed: 165,
    timingMultiplier: 1.25,
    averageSyllablesPerWord: 1.8,
    compactness: 1.2
  },

  // Uzbečtina
  'uz': {
    code: 'uz',
    name: 'Uzbek',
    averageWordLength: 5.9,
    readingSpeed: 170,
    timingMultiplier: 1.2,
    averageSyllablesPerWord: 1.8,
    compactness: 1.18
  },

  // Tádžičtina
  'tg': {
    code: 'tg',
    name: 'Tajik',
    averageWordLength: 5.7,
    readingSpeed: 165,
    timingMultiplier: 1.25,
    averageSyllablesPerWord: 1.8,
    compactness: 1.2
  },

  // Mongolština
  'mn': {
    code: 'mn',
    name: 'Mongolian',
    averageWordLength: 6.3,
    readingSpeed: 155,
    timingMultiplier: 1.35,
    averageSyllablesPerWord: 2.0,
    compactness: 1.28
  },

  // Africké jazyky
  'sw': {
    code: 'sw',
    name: 'Swahili',
    averageWordLength: 5.6,
    readingSpeed: 175,
    timingMultiplier: 1.2,
    averageSyllablesPerWord: 1.8,
    compactness: 1.15
  },

  'am': {
    code: 'am',
    name: 'Amharic',
    averageWordLength: 5.9,
    readingSpeed: 150,
    timingMultiplier: 1.4,
    averageSyllablesPerWord: 2.0,
    compactness: 1.25
  },

  'zu': {
    code: 'zu',
    name: 'Zulu',
    averageWordLength: 6.8,
    readingSpeed: 145,
    timingMultiplier: 1.45,
    averageSyllablesPerWord: 2.3,
    compactness: 1.35
  },

  'xh': {
    code: 'xh',
    name: 'Xhosa',
    averageWordLength: 6.5,
    readingSpeed: 150,
    timingMultiplier: 1.4,
    averageSyllablesPerWord: 2.2,
    compactness: 1.3
  },

  'af': {
    code: 'af',
    name: 'Afrikaans',
    averageWordLength: 5.1,
    readingSpeed: 190,
    timingMultiplier: 1.1,
    averageSyllablesPerWord: 1.5,
    compactness: 1.05
  },

  'yo': {
    code: 'yo',
    name: 'Yoruba',
    averageWordLength: 5.3,
    readingSpeed: 170,
    timingMultiplier: 1.25,
    averageSyllablesPerWord: 1.8,
    compactness: 1.18
  },

  'ig': {
    code: 'ig',
    name: 'Igbo',
    averageWordLength: 5.7,
    readingSpeed: 165,
    timingMultiplier: 1.3,
    averageSyllablesPerWord: 1.9,
    compactness: 1.22
  },

  'ha': {
    code: 'ha',
    name: 'Hausa',
    averageWordLength: 5.2,
    readingSpeed: 175,
    timingMultiplier: 1.2,
    averageSyllablesPerWord: 1.7,
    compactness: 1.15
  },

  // Luxemburština
  'lb': {
    code: 'lb',
    name: 'Luxembourgish',
    averageWordLength: 5.8,
    readingSpeed: 170,
    timingMultiplier: 1.25,
    averageSyllablesPerWord: 1.8,
    compactness: 1.2
  },

  // Kečuánština
  'qu': {
    code: 'qu',
    name: 'Quechua',
    averageWordLength: 6.5,
    readingSpeed: 155,
    timingMultiplier: 1.35,
    averageSyllablesPerWord: 2.1,
    compactness: 1.3
  },

  // Guaraní
  'gn': {
    code: 'gn',
    name: 'Guarani',
    averageWordLength: 6.2,
    readingSpeed: 160,
    timingMultiplier: 1.3,
    averageSyllablesPerWord: 2.0,
    compactness: 1.25
  },

  // Maorština
  'mi': {
    code: 'mi',
    name: 'Maori',
    averageWordLength: 5.8,
    readingSpeed: 170,
    timingMultiplier: 1.25,
    averageSyllablesPerWord: 1.9,
    compactness: 1.2
  },

  // Samojština
  'sm': {
    code: 'sm',
    name: 'Samoan',
    averageWordLength: 6.1,
    readingSpeed: 165,
    timingMultiplier: 1.3,
    averageSyllablesPerWord: 2.0,
    compactness: 1.25
  },

  // Tongánština
  'to': {
    code: 'to',
    name: 'Tongan',
    averageWordLength: 5.9,
    readingSpeed: 170,
    timingMultiplier: 1.25,
    averageSyllablesPerWord: 1.9,
    compactness: 1.22
  },

  // Fidžijština
  'fj': {
    code: 'fj',
    name: 'Fijian',
    averageWordLength: 5.7,
    readingSpeed: 175,
    timingMultiplier: 1.2,
    averageSyllablesPerWord: 1.8,
    compactness: 1.18
  },

  // Javánština
  'jv': {
    code: 'jv',
    name: 'Javanese',
    averageWordLength: 5.5,
    readingSpeed: 170,
    timingMultiplier: 1.25,
    averageSyllablesPerWord: 1.8,
    compactness: 1.15
  },

  // Sundánština
  'su': {
    code: 'su',
    name: 'Sundanese',
    averageWordLength: 5.8,
    readingSpeed: 165,
    timingMultiplier: 1.3,
    averageSyllablesPerWord: 1.9,
    compactness: 1.2
  },

  // Cebuánština
  'ceb': {
    code: 'ceb',
    name: 'Cebuano',
    averageWordLength: 5.9,
    readingSpeed: 170,
    timingMultiplier: 1.25,
    averageSyllablesPerWord: 1.9,
    compactness: 1.2
  },

  // Havajština
  'haw': {
    code: 'haw',
    name: 'Hawaiian',
    averageWordLength: 5.4,
    readingSpeed: 175,
    timingMultiplier: 1.2,
    averageSyllablesPerWord: 1.8,
    compactness: 1.15
  },

  // Malgašština
  'mg': {
    code: 'mg',
    name: 'Malagasy',
    averageWordLength: 6.0,
    readingSpeed: 165,
    timingMultiplier: 1.3,
    averageSyllablesPerWord: 1.9,
    compactness: 1.22
  },

  // Esperanto
  'eo': {
    code: 'eo',
    name: 'Esperanto',
    averageWordLength: 5.5,
    readingSpeed: 185,
    timingMultiplier: 1.1,
    averageSyllablesPerWord: 1.7,
    compactness: 1.08
  },

  // Latina
  'la': {
    code: 'la',
    name: 'Latin',
    averageWordLength: 6.2,
    readingSpeed: 150,
    timingMultiplier: 1.4,
    averageSyllablesPerWord: 2.0,
    compactness: 1.3
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
