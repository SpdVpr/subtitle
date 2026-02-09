import { Metadata } from 'next'
import { HierarchicalSubtitleSearch } from '@/components/subtitles/hierarchical-subtitle-search'
import { AnimeSubtitleSearch } from '@/components/subtitles/anime-subtitle-search'
import { Separator } from '@/components/ui/separator'
import { Film, Tv, Play } from 'lucide-react'


export const metadata: Metadata = {
  title: 'Search Subtitles',
  description: 'Search and download subtitles from OpenSubtitles and Jimaku databases. Find subtitles for movies, TV series, and anime in multiple languages.',
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
    title: 'Search Subtitles - SubtitleBot',
    description: 'Search and download subtitles from OpenSubtitles and Jimaku databases. Find subtitles for movies, TV series, and anime.',
    url: '/subtitles-search',
    images: [
      {
        url: '/og-search.jpg',
        width: 1200,
        height: 630,
        alt: 'SubtitleBot Search - Find and Download Subtitles',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Search Subtitles - SubtitleBot',
    description: 'Search and download subtitles from OpenSubtitles and Jimaku databases.',
    images: ['/twitter-search.jpg'],
  },
  alternates: {
    canonical: '/subtitles-search',
  },
}

export default function SubtitlesSearchPage() {
  return (
    <div className="py-4 sm:py-6 md:py-8 bg-background">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-6xl">

        {/* Header */}
        <div className="mb-8 sm:mb-10 md:mb-12 text-center">
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-3 sm:mb-4 px-2">Search Subtitles</h1>
          <p className="text-sm sm:text-base md:text-lg text-muted-foreground max-w-3xl mx-auto px-4">
            Find subtitles for your favorite content in the two largest subtitle databases
            and then translate them using our AI translator
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
                The largest subtitle database for movies and TV series with millions of files in all languages
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
                Specialized database of Japanese subtitles for anime with AniList integration
              </p>
            </div>
            <AnimeSubtitleSearch />
          </div>
        </div>
      </div>
    </div>
  )
}