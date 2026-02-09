import { Metadata } from 'next'
import { HierarchicalSubtitleSearch } from '@/components/subtitles/hierarchical-subtitle-search'
import { AnimeSubtitleSearch } from '@/components/subtitles/anime-subtitle-search'
import { Separator } from '@/components/ui/separator'
import { Film, Tv, Play } from 'lucide-react'

export const metadata: Metadata = {
  title: 'Hledat Titulky',
  description: 'Vyhledávejte a stahujte titulky z databází OpenSubtitles a Jimaku. Najděte titulky pro filmy, TV seriály a anime ve více jazycích.',
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
        url: '/og-search.jpg',
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
    images: ['/twitter-search.jpg'],
  },
  alternates: {
    canonical: '/cs/subtitles-search',
  },
}

export default function CzechSubtitlesSearchPage() {
  return (
    <div className="py-4 sm:py-6 md:py-8 bg-background">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-6xl">

        {/* Header */}
        <div className="mb-8 sm:mb-10 md:mb-12 text-center">
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-3 sm:mb-4 px-2">Vyhledávání Titulků</h1>
          <p className="text-sm sm:text-base md:text-lg text-muted-foreground max-w-3xl mx-auto px-4">
            Najděte titulky pro váš oblíbený obsah ve dvou největších databázích titulků
            a poté je přeložte pomocí našeho AI překladače
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
                Největší databáze titulků pro filmy a TV seriály s miliony souborů ve všech jazycích
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
                Specializovaná databáze japonských titulků pro anime s integrací AniList
              </p>
            </div>
            <AnimeSubtitleSearch />
          </div>
        </div>

        {/* Tips Section */}
        <div className="bg-muted/50 rounded-lg p-4 sm:p-6">
          <h3 className="text-lg font-semibold mb-3">💡 Tipy pro vyhledávání</h3>
          <ul className="space-y-2 text-sm sm:text-base text-muted-foreground">
            <li>• Použijte originální název filmu/seriálu pro nejlepší výsledky</li>
            <li>• Zkuste různé varianty názvu, pokud nenajdete výsledky</li>
            <li>• Rok vydání pomáhá zpřesnit vyhledávání</li>
            <li>• Pro anime zkuste jak japonský, tak anglický název</li>
            <li>• Stažené titulky můžete přímo přeložit pomocí našeho AI překladače</li>
          </ul>
        </div>

        {/* Translation CTA */}
        <div className="mt-8 sm:mt-12 text-center">
          <div className="bg-gradient-to-r from-primary/10 to-secondary/10 rounded-lg p-6 sm:p-8">
            <h3 className="text-xl sm:text-2xl font-semibold mb-3">
              Našli jste titulky? Přeložte je nyní!
            </h3>
            <p className="text-muted-foreground mb-4 sm:mb-6">
              Použijte náš AI překladač k překladu stažených titulků do jakéhokoli jazyka
            </p>
            <a 
              href="/cs/translate" 
              className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2"
            >
              Přeložit Titulky
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}
