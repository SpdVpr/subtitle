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

        <div className="mb-6 sm:mb-8">
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-3 sm:mb-4 text-center">
            Vyhledávání Titulků
          </h1>
          <p className="text-base sm:text-lg text-muted-foreground text-center max-w-3xl mx-auto">
            Vyhledávejte a stahujte titulky z rozsáhlých databází. Podporujeme OpenSubtitles pro filmy a TV seriály, 
            a Jimaku pro anime obsah.
          </p>
        </div>

        {/* Movies & TV Shows Section */}
        <div className="mb-8 sm:mb-12">
          <div className="flex items-center gap-2 sm:gap-3 mb-4 sm:mb-6">
            <div className="flex items-center gap-2">
              <Film className="h-5 w-5 sm:h-6 sm:w-6 text-primary" />
              <Tv className="h-5 w-5 sm:h-6 sm:w-6 text-primary" />
            </div>
            <h2 className="text-xl sm:text-2xl font-semibold">Filmy a TV Seriály</h2>
          </div>
          
          <div className="bg-card rounded-lg border p-4 sm:p-6 mb-4 sm:mb-6">
            <p className="text-sm sm:text-base text-muted-foreground mb-4">
              Vyhledávejte titulky pro filmy a TV seriály z databáze OpenSubtitles. 
              Podporuje více než 60 jazyků a obsahuje miliony titulků.
            </p>
            <HierarchicalSubtitleSearch />
          </div>
        </div>

        <Separator className="my-8 sm:my-12" />

        {/* Anime Section */}
        <div className="mb-8 sm:mb-12">
          <div className="flex items-center gap-2 sm:gap-3 mb-4 sm:mb-6">
            <Play className="h-5 w-5 sm:h-6 sm:w-6 text-primary" />
            <h2 className="text-xl sm:text-2xl font-semibold">Anime</h2>
          </div>
          
          <div className="bg-card rounded-lg border p-4 sm:p-6">
            <p className="text-sm sm:text-base text-muted-foreground mb-4">
              Specializované vyhledávání anime titulků z databáze Jimaku. 
              Najděte titulky pro vaše oblíbené anime seriály a filmy.
            </p>
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
