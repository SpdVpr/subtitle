import { Metadata } from 'next'
import { HierarchicalSubtitleSearch } from '@/components/subtitles/hierarchical-subtitle-search'
import { AnimeSubtitleSearch } from '@/components/subtitles/anime-subtitle-search'
import { Separator } from '@/components/ui/separator'
import { Film, Tv, Play } from 'lucide-react'
import { StructuredData } from '@/components/seo/structured-data'
import { SubtitleSearchGuide } from '@/components/subtitles/subtitle-search-guide'

export const metadata: Metadata = {
  title: 'Vyhledávač titulků pro filmy, seriály a anime',
  description: 'Najděte filmové, seriálové, anime i anglické titulky podle názvu, roku a jazyka. Prohledejte OpenSubtitles a Jimaku, poté soubor přeložte nebo synchronizujte.',
  keywords: [
    'hledání titulků',
    'stahování titulků',
    'OpenSubtitles',
    'Jimaku titulky',
    'filmové titulky',
    'TV seriálové titulky',
    'anime titulky',
    'SRT stahování',
    'databáze titulků',
    'zdarma titulky'
  ],
  openGraph: {
    title: 'Hledat Titulky - SubtitleBot',
    description: 'Vyhledávejte a stahujte titulky z databází OpenSubtitles a Jimaku. Najděte titulky pro filmy, TV seriály a anime.',
    url: '/cs/subtitles-search',
    images: [
      {
        url: '/og-image-cs.png',
        width: 1200,
        height: 630,
        alt: 'SubtitleBot Vyhledávání - Najděte a Stáhněte Titulky',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Hledat Titulky - SubtitleBot',
    description: 'Vyhledávejte a stahujte titulky z databází OpenSubtitles a Jimaku.',
    images: ['/og-image-cs.png'],
  },
  alternates: {
    canonical: '/cs/subtitles-search',
    languages: {
      'en': '/subtitles-search',
      'cs': '/cs/subtitles-search',
      'x-default': '/subtitles-search',
    },
  },
}

export default function CzechSubtitlesSearchPage() {
  return (
    <div className="py-4 sm:py-6 md:py-8 bg-background">
      <StructuredData locale="cs" page="search" />
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-6xl">

        {/* Header */}
        <div className="mb-8 sm:mb-10 md:mb-12 text-center">
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-3 sm:mb-4 px-2">Najděte titulky pro filmy, seriály a anime</h1>
          <p className="text-sm sm:text-base md:text-lg text-muted-foreground max-w-3xl mx-auto px-4">
            Vyhledávejte filmové, seriálové, anime i anglické titulky podle názvu, roku a jazyka. Vyberte správnou verzi a soubor poté stáhněte, přeložte nebo synchronizujte.
          </p>
        </div>

        {/* OpenSubtitles Section */}
        <div className="mb-12 sm:mb-16">
          <div className="flex items-center gap-2 sm:gap-3 mb-4 sm:mb-6">
            <div className="flex items-center gap-2 text-lg sm:text-xl md:text-2xl font-semibold">
              <Film className="h-5 w-5 sm:h-6 sm:w-6 text-blue-600 dark:text-blue-400" />
              <Tv className="h-5 w-5 sm:h-6 sm:w-6 text-green-600 dark:text-green-400" />
              <span>Filmy a TV Seriály</span>
            </div>
            <div className="flex-1 h-px bg-gradient-to-r from-blue-200 dark:from-blue-800 to-transparent"></div>
          </div>
          <div className="bg-gradient-to-br from-blue-50 to-green-50 dark:from-blue-950/30 dark:to-green-950/30 rounded-xl p-4 sm:p-6 border border-blue-100 dark:border-blue-800/30">
            <div className="mb-4">
              <h2 className="text-lg sm:text-xl font-semibold text-gray-800 dark:text-foreground mb-2">OpenSubtitles Databáze</h2>
              <p className="text-sm sm:text-base text-gray-600 dark:text-muted-foreground">
                Prohledejte filmové a seriálové titulky podle názvu, jazyka, typu, roku a kvality zdroje
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
              NEBO
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
              <h2 className="text-lg sm:text-xl font-semibold text-gray-800 dark:text-foreground mb-2">Jimaku Databáze</h2>
              <p className="text-sm sm:text-base text-gray-600 dark:text-muted-foreground">
                Prohledejte anime titulky přes Jimaku s identifikátory AniList
              </p>
            </div>
            <AnimeSubtitleSearch />
          </div>
        </div>

        <SubtitleSearchGuide locale="cs" />
      </div>
    </div>
  )
}
