/**
 * Utility functions for cleaning subtitle file names to extract clean movie/TV show titles
 * Removes technical formats, release groups, and other metadata
 */

export interface CleanedSubtitleInfo {
  cleanTitle: string
  originalFileName: string
  season?: number
  episode?: number
  year?: number
  isMovie: boolean
  isTvShow: boolean
}

/**
 * Clean subtitle file name by removing technical formats and metadata
 */
export function cleanSubtitleFileName(fileName: string): CleanedSubtitleInfo {
  console.log('🧹 Cleaning subtitle filename:', fileName)
  
  // Remove file extension
  let cleanName = fileName.replace(/\.(srt|vtt|ass|ssa|sub|sbv|txt)$/i, '')
  
  // Store original for reference
  const originalFileName = fileName
  
  // Remove common release tags and technical formats
  const technicalFormats = [
    // Video quality
    '1080p', '720p', '480p', '2160p', '4K', 'UHD', 'HDR', 'HDR10', 'DV',
    // Video codecs
    'x264', 'x265', 'h264', 'h265', 'HEVC', 'AVC', 'VP9', 'AV1',
    // Audio codecs
    'AAC', 'AC3', 'DTS', 'FLAC', 'MP3', 'Atmos', 'TrueHD',
    // Source types
    'WEB', 'WEBRip', 'WEB-DL', 'BluRay', 'BDRip', 'DVDRip', 'HDTV', 'PDTV', 'CAM', 'TS', 'TC',
    // Release types
    'REPACK', 'PROPER', 'INTERNAL', 'LIMITED', 'EXTENDED', 'UNCUT', 'DIRECTORS', 'CUT', 'UNRATED',
    // Other technical terms
    'MULTI', 'DUAL', 'SUBBED', 'DUBBED', 'iNTERNAL', 'FiNAL', 'RETAiL'
  ]
  
  // Remove technical formats (case insensitive)
  const technicalRegex = new RegExp(`\\b(${technicalFormats.join('|')})\\b`, 'gi')
  cleanName = cleanName.replace(technicalRegex, '')
  
  // Remove release group tags [RELEASE_GROUP] and (RELEASE_GROUP)
  cleanName = cleanName.replace(/\[[^\]]+\]/g, '') // Remove [tags]
  cleanName = cleanName.replace(/\([^)]*(?:rip|web|bluray|dvd|hdtv|x264|x265|h264|h265)[^)]*\)/gi, '') // Remove (technical tags)
  
  // Remove year in parentheses temporarily to process it separately
  let year: number | undefined
  const yearMatch = cleanName.match(/\((\d{4})\)/)
  if (yearMatch) {
    year = parseInt(yearMatch[1])
    cleanName = cleanName.replace(/\(\d{4}\)/g, '')
  }
  
  // Try to extract TV show information (season/episode)
  let season: number | undefined
  let episode: number | undefined
  let isTvShow = false
  let isMovie = false
  
  const tvPatterns = [
    /^(.+?)[\s\.]S(\d+)E(\d+)/i,  // Show.Name.S01E01
    /^(.+?)[\s\.](\d+)x(\d+)/i,   // Show.Name.1x01
    /^(.+?)[\s\.]Season[\s\.](\d+)[\s\.]Episode[\s\.](\d+)/i,
    /^(.+?)[\s\.](\d{4})[\s\.]S(\d+)E(\d+)/i,  // Show.Name.2021.S01E01
  ]
  
  for (const pattern of tvPatterns) {
    const match = cleanName.match(pattern)
    if (match) {
      cleanName = match[1]
      isTvShow = true
      
      if (pattern.source.includes('(\\d{4})')) {
        // Pattern with year
        year = parseInt(match[2])
        season = parseInt(match[3])
        episode = parseInt(match[4])
      } else {
        season = parseInt(match[2])
        episode = parseInt(match[3])
      }
      break
    }
  }
  
  // If no TV pattern found, assume it's a movie
  if (!isTvShow) {
    isMovie = true
  }
  
  // Clean up the title
  cleanName = cleanName
    .replace(/[\.\-_]+/g, ' ') // Replace dots, dashes, underscores with spaces
    .replace(/\s+/g, ' ') // Replace multiple spaces with single space
    .trim()
  
  // Remove common prefixes/suffixes
  cleanName = cleanName
    .replace(/^(The\.)?/i, '') // Remove "The." prefix
    .replace(/\s+(Complete|Series|Season|Collection)$/i, '') // Remove common suffixes
    .trim()
  
  // Capitalize first letter of each word
  cleanName = cleanName.replace(/\b\w/g, l => l.toUpperCase())
  
  const result: CleanedSubtitleInfo = {
    cleanTitle: cleanName,
    originalFileName,
    season,
    episode,
    year,
    isMovie,
    isTvShow
  }
  
  console.log('✨ Cleaned result:', result)
  return result
}

/**
 * Group subtitles by clean title for statistics
 */
export function groupSubtitlesByTitle(subtitles: Array<{ originalFileName: string, count?: number }>): Array<{ title: string, count: number, examples: string[] }> {
  const titleGroups = new Map<string, { count: number, examples: string[] }>()
  
  for (const subtitle of subtitles) {
    const cleaned = cleanSubtitleFileName(subtitle.originalFileName)
    const title = cleaned.cleanTitle
    
    if (!titleGroups.has(title)) {
      titleGroups.set(title, { count: 0, examples: [] })
    }
    
    const group = titleGroups.get(title)!
    group.count += subtitle.count || 1
    
    // Keep up to 3 examples of original filenames
    if (group.examples.length < 3) {
      group.examples.push(subtitle.originalFileName)
    }
  }
  
  // Convert to array and sort by count
  return Array.from(titleGroups.entries())
    .map(([title, data]) => ({ title, ...data }))
    .sort((a, b) => b.count - a.count)
}

/**
 * Extract language code from filename if present
 */
export function extractLanguageFromFileName(fileName: string): string | null {
  // Common language patterns in filenames
  const languagePatterns = [
    /\.([a-z]{2})\.srt$/i, // filename.en.srt
    /\.([a-z]{2}-[a-z]{2})\.srt$/i, // filename.en-us.srt
    /[\.\-_]([a-z]{2})[\.\-_]/i, // filename.en.something
    /[\.\-_](english|czech|german|french|spanish|italian|portuguese|russian|chinese|japanese|korean)[\.\-_]/i
  ]
  
  for (const pattern of languagePatterns) {
    const match = fileName.match(pattern)
    if (match) {
      const lang = match[1].toLowerCase()
      
      // Map full language names to codes
      const languageMap: Record<string, string> = {
        'english': 'en',
        'czech': 'cs',
        'german': 'de',
        'french': 'fr',
        'spanish': 'es',
        'italian': 'it',
        'portuguese': 'pt',
        'russian': 'ru',
        'chinese': 'zh',
        'japanese': 'ja',
        'korean': 'ko'
      }
      
      return languageMap[lang] || lang
    }
  }
  
  return null
}
