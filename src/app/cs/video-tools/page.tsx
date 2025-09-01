import { Metadata } from 'next'
import { VideoPlayerWithSubtitles } from '@/components/video/video-player-with-subtitles'

export const metadata: Metadata = {
  title: 'Video Nástroje',
  description: 'Pokročilý video přehrávač a nástroje pro titulky. Sledujte videa s vlastními titulky nebo použijte plovoucí titulky pro streamovací služby jako Netflix, YouTube a další.',
  keywords: [
    'video nástroje',
    'video přehrávač',
    'titulkový overlay',
    'plovoucí titulky',
    'streamovací titulky',
    'YouTube titulky',
    'Netflix titulky',
    'video titulkový přehrávač',
    'vlastní titulky',
    'synchronizace titulků'
  ],
  openGraph: {
    title: 'Video Nástroje - SubtitleBot',
    description: 'Pokročilý video přehrávač a nástroje pro titulky. Sledujte videa s vlastními titulky nebo použijte plovoucí titulky.',
    url: '/cs/video-tools',
    type: 'website',
    images: [
      {
        url: '/og-video-tools.jpg',
        width: 1200,
        height: 630,
        alt: 'SubtitleBot Video Nástroje - Video Přehrávač a Titulkový Overlay',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Video Nástroje - SubtitleBot',
    description: 'Pokročilý video přehrávač a nástroje pro titulky pro jakýkoli video obsah.',
    images: ['/twitter-video-tools.jpg'],
  },
  alternates: {
    canonical: '/cs/video-tools',
  },
}

export default function CzechVideoPlayerPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 dark:from-background dark:to-card">
      <div className="container mx-auto px-4 py-4 sm:py-6 md:py-8">
        <div className="max-w-7xl mx-auto">

          {/* Header */}
          <div className="text-center mb-6 sm:mb-8 md:mb-12">
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-3 sm:mb-4 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Video Nástroje
            </h1>
            <p className="text-base sm:text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto">
              Pokročilý video přehrávač s podporou vlastních titulků. Sledujte jakékoli video s perfektně synchronizovanými titulky.
            </p>
          </div>

          {/* Video Player Component */}
          <VideoPlayerWithSubtitles />

          {/* Features Section */}
          <div className="mt-8 sm:mt-12 md:mt-16">
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
              
              {/* Feature 1 */}
              <div className="bg-white/80 dark:bg-card/80 backdrop-blur-sm rounded-xl p-6 border shadow-lg">
                <div className="w-12 h-12 bg-blue-100 dark:bg-accent rounded-lg flex items-center justify-center mb-4">
                  <span className="text-2xl">🎬</span>
                </div>
                <h3 className="text-xl font-semibold mb-3">Univerzální Podpora</h3>
                <p className="text-muted-foreground">
                  Podporuje YouTube, Vimeo, přímé video odkazy a jakýkoli vložitelný video obsah. 
                  Stačí vložit URL a začít sledovat.
                </p>
              </div>

              {/* Feature 2 */}
              <div className="bg-white/80 dark:bg-card/80 backdrop-blur-sm rounded-xl p-6 border shadow-lg">
                <div className="w-12 h-12 bg-green-100 dark:bg-accent rounded-lg flex items-center justify-center mb-4">
                  <span className="text-2xl">⚡</span>
                </div>
                <h3 className="text-xl font-semibold mb-3">Perfektní Synchronizace</h3>
                <p className="text-muted-foreground">
                  Titulky jsou perfektně synchronizovány s přehráváním videa. 
                  Automatické časování s možností ručního doladění.
                </p>
              </div>

              {/* Feature 3 */}
              <div className="bg-white/80 dark:bg-card/80 backdrop-blur-sm rounded-xl p-6 border shadow-lg">
                <div className="w-12 h-12 bg-purple-100 dark:bg-accent rounded-lg flex items-center justify-center mb-4">
                  <span className="text-2xl">🎨</span>
                </div>
                <h3 className="text-xl font-semibold mb-3">Úplné Přizpůsobení</h3>
                <p className="text-muted-foreground">
                  Plná kontrola nad vzhledem titulků - písma, barvy, pozice, 
                  průhlednost a efekty. Vytvořte si je přesně podle svých představ.
                </p>
              </div>

              {/* Feature 4 */}
              <div className="bg-white/80 dark:bg-card/80 backdrop-blur-sm rounded-xl p-6 border shadow-lg">
                <div className="w-12 h-12 bg-orange-100 dark:bg-accent rounded-lg flex items-center justify-center mb-4">
                  <span className="text-2xl">📱</span>
                </div>
                <h3 className="text-xl font-semibold mb-3">Responzivní Design</h3>
                <p className="text-muted-foreground">
                  Funguje perfektně na všech zařízeních - desktop, tablet i mobil. 
                  Optimalizováno pro dotykové ovládání.
                </p>
              </div>

              {/* Feature 5 */}
              <div className="bg-white/80 dark:bg-card/80 backdrop-blur-sm rounded-xl p-6 border shadow-lg">
                <div className="w-12 h-12 bg-red-100 dark:bg-accent rounded-lg flex items-center justify-center mb-4">
                  <span className="text-2xl">🔧</span>
                </div>
                <h3 className="text-xl font-semibold mb-3">Pokročilé Ovládání</h3>
                <p className="text-muted-foreground">
                  Klávesové zkratky, rychlost přehrávání, offset titulků, 
                  a mnoho dalších funkcí pro profesionální použití.
                </p>
              </div>

              {/* Feature 6 */}
              <div className="bg-white/80 dark:bg-card/80 backdrop-blur-sm rounded-xl p-6 border shadow-lg">
                <div className="w-12 h-12 bg-cyan-100 dark:bg-accent rounded-lg flex items-center justify-center mb-4">
                  <span className="text-2xl">💾</span>
                </div>
                <h3 className="text-xl font-semibold mb-3">Lokální Soubory</h3>
                <p className="text-muted-foreground">
                  Nahrajte vlastní video soubory a SRT titulky. 
                  Vše se zpracovává lokálně ve vašem prohlížeči.
                </p>
              </div>

            </div>
          </div>

          {/* Usage Instructions */}
          <div className="mt-8 sm:mt-12 md:mt-16 bg-muted/50 rounded-xl p-6 sm:p-8">
            <h3 className="text-xl sm:text-2xl font-semibold mb-4 sm:mb-6 text-center">
              🚀 Jak Používat Video Nástroje
            </h3>
            <div className="grid md:grid-cols-2 gap-6 sm:gap-8">
              <div>
                <h4 className="font-semibold mb-3">1. Načtěte Video</h4>
                <ul className="space-y-2 text-sm sm:text-base text-muted-foreground">
                  <li>• Vložte YouTube nebo Vimeo URL</li>
                  <li>• Nahrajte lokální video soubor</li>
                  <li>• Použijte přímý odkaz na video</li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold mb-3">2. Přidejte Titulky</h4>
                <ul className="space-y-2 text-sm sm:text-base text-muted-foreground">
                  <li>• Nahrajte SRT soubor s titulky</li>
                  <li>• Nebo použijte náš AI překladač</li>
                  <li>• Dolaďte synchronizaci podle potřeby</li>
                </ul>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  )
}
