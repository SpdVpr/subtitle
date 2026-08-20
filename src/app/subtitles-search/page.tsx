import { Metadata } from 'next'
import { HierarchicalSubtitleSearch } from '@/components/subtitles/hierarchical-subtitle-search'
import { AnimeSubtitleSearch } from '@/components/subtitles/anime-subtitle-search'
import { Separator } from '@/components/ui/separator'
import { Film, Tv, Play } from 'lucide-react'
import { StructuredData } from '@/components/seo/structured-data'
import { SubtitleSearchGuide } from '@/components/subtitles/subtitle-search-guide'
import { UltiQuizTeaser } from '@/components/promo/ultiquiz-teaser'
import { TranslatePromo } from '@/components/promo/translate-promo'


export const metadata: Metadata = {
  title: 'Subtitle Finder: Movie, TV & English Subtitles',
  description: 'Find movie, TV series, anime and English subtitles by title, year and language. Search OpenSubtitles and Jimaku, then translate or sync your file.',
  keywords: [
    'subtitle search',
    'download subtitles',
    'OpenSubtitles',
    'Jimaku subtitles',
    'movie subtitles',
    'TV show subtitles',
    'anime subtitles',
    'SRT download',
    'subtitle database',
    'free subtitles'
  ],
  openGraph: {
    title: 'Subtitle Finder for Movies, TV Shows & Anime | SubtitleBot',
    description: 'Search movie, TV, anime and English subtitles by title, year and language, then translate or sync the file.',
    url: '/subtitles-search',
    images: [
      {
        url: '/og-image-en.png',
        width: 1200,
        height: 630,
        alt: 'SubtitleBot Search - Find and Download Subtitles',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Subtitle Finder for Movies, TV Shows & Anime | SubtitleBot',
    description: 'Search movie, TV, anime and English subtitles by title, year and language.',
    images: ['/og-image-en.png'],
  },
  alternates: {
    canonical: '/subtitles-search',
    languages: {
      'en': '/subtitles-search',
      'cs': '/cs/subtitles-search',
      'x-default': '/subtitles-search',
    },
  },
}

export default function SubtitlesSearchPage() {
  return (
    <div className="py-4 sm:py-6 md:py-8 bg-background">
      <StructuredData locale="en" page="search" />
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-6xl">

        {/* Header */}
        <div className="mb-8 sm:mb-10 md:mb-12 text-center">
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-3 sm:mb-4 px-2">Find Subtitles for Movies, TV Shows & Anime</h1>
          <p className="text-sm sm:text-base md:text-lg text-muted-foreground max-w-3xl mx-auto px-4">
            Search movie, TV, anime and English subtitles by title, year and language. Match the right release, then download, translate or sync your subtitle file.
          </p>
        </div>

        {/* OpenSubtitles Section */}
        <div className="mb-12 sm:mb-16">
          <div className="flex items-center gap-2 sm:gap-3 mb-4 sm:mb-6">
            <div className="flex items-center gap-2 text-lg sm:text-xl md:text-2xl font-semibold">
              <Film className="h-5 w-5 sm:h-6 sm:w-6 text-blue-600 dark:text-blue-400" />
              <Tv className="h-5 w-5 sm:h-6 sm:w-6 text-green-600 dark:text-green-400" />
              <span>Movies & TV Series</span>
            </div>
            <div className="flex-1 h-px bg-gradient-to-r from-blue-200 dark:from-blue-800 to-transparent"></div>
          </div>
          <div className="bg-gradient-to-br from-blue-50 to-green-50 dark:from-blue-950/30 dark:to-green-950/30 rounded-xl p-4 sm:p-6 border border-blue-100 dark:border-blue-800/30">
            <div className="mb-4">
              <h2 className="text-lg sm:text-xl font-semibold text-gray-800 dark:text-foreground mb-2">OpenSubtitles Database</h2>
              <p className="text-sm sm:text-base text-gray-600 dark:text-muted-foreground">
                Search movie and TV subtitle listings by title, language, content type, year and source quality
              </p>
            </div>
            <HierarchicalSubtitleSearch />
          </div>
        </div>

        {/* Separator */}
        <div className="relative mb-12 sm:mb-16">
          <Separator className="bg-gray-200 dark:bg-border" />
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="bg-white dark:bg-background px-3 sm:px-4 text-xs sm:text-sm text-gray-500 dark:text-muted-foreground font-medium">
              OR
            </div>
          </div>
        </div>

        {/* Jimaku Section */}
        <div>
          <div className="flex items-center gap-2 sm:gap-3 mb-4 sm:mb-6">
            <div className="flex items-center gap-2 text-lg sm:text-xl md:text-2xl font-semibold">
              <Play className="h-5 w-5 sm:h-6 sm:w-6 text-purple-600 dark:text-purple-400" />
              <span>Anime</span>
            </div>
            <div className="flex-1 h-px bg-gradient-to-r from-purple-200 dark:from-purple-800 to-transparent"></div>
          </div>
          <div className="bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-950/30 dark:to-pink-950/30 rounded-xl p-4 sm:p-6 border border-purple-100 dark:border-purple-800/30">
            <div className="mb-4">
              <h2 className="text-lg sm:text-xl font-semibold text-gray-800 dark:text-foreground mb-2">Jimaku Database</h2>
              <p className="text-sm sm:text-base text-gray-600 dark:text-muted-foreground">
                Search anime subtitle listings through Jimaku with AniList identifiers
              </p>
            </div>
            <AnimeSubtitleSearch />
          </div>
        </div>
        <UltiQuizTeaser locale="en" />
        <TranslatePromo locale="en" />
        <SubtitleSearchGuide locale="en" />
      </div>
    </div>
  )
}
