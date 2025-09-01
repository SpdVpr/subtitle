import { Metadata } from 'next'
import { SubtitlePopupController } from '@/components/popup/subtitle-popup-controller'

export const metadata: Metadata = {
  title: 'Plovoucí titulky',
  description: 'Otevřete plovoucí titulkové okno, které funguje nad jakýmkoli video obsahem. Perfektní pro streamovací služby jako Netflix, YouTube a online videa. Nevyžaduje instalaci.',
  keywords: [
    'plovoucí titulky',
    'video overlay',
    'streamovací titulky',
    'externí titulky',
    'titulkové okno',
    'Netflix titulky',
    'YouTube overlay',
    'titulkové popup',
    'průhledný overlay',
    'zobrazení titulků'
  ],
  openGraph: {
    title: 'Plovoucí titulky - SubtitleBot',
    description: 'Otevřete plovoucí titulkové okno, které funguje nad jakýmkoli video obsahem. Perfektní pro streamovací služby a online videa.',
    url: '/cs/subtitle-popup',
    type: 'website',
    images: [
      {
        url: '/og-popup.jpg',
        width: 1200,
        height: 630,
        alt: 'SubtitleBot - Plovoucí titulkové okno',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Plovoucí titulky - SubtitleBot',
    description: 'Plovoucí titulkové okno, které funguje nad jakýmkoli video obsahem.',
    images: ['/twitter-popup.jpg'],
  },
  alternates: {
    canonical: '/cs/subtitle-popup',
  },
}

export default function CzechSubtitlePopupPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 dark:from-background dark:to-card">
      <div className="container mx-auto px-4 py-4 sm:py-6 md:py-8">
        <div className="max-w-4xl mx-auto">

          {/* Header */}
          <div className="text-center mb-6 sm:mb-8 md:mb-12">
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-3 sm:mb-4 bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
              Plovoucí titulky
            </h1>
            <p className="text-base sm:text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto">
              Otevřete plovoucí titulkové okno, které zůstává nad všemi ostatními okny.
              Perfektní pro Netflix, YouTube nebo jakékoli video!
            </p>
          </div>

          {/* Popup Controller */}
          <SubtitlePopupController />

          {/* Features */}
          <div className="mt-8 sm:mt-12 md:mt-16 grid md:grid-cols-2 gap-6 sm:gap-8">
            
            {/* Feature 1 */}
            <div className="bg-white/80 dark:bg-card/80 backdrop-blur-sm rounded-xl p-6 border shadow-lg">
              <div className="w-12 h-12 bg-green-100 dark:bg-accent rounded-lg flex items-center justify-center mb-4">
                <span className="text-2xl">⚡</span>
              </div>
              <h3 className="text-xl font-semibold mb-3">Okamžité Nastavení</h3>
              <p className="text-muted-foreground">
                Žádné rozšíření prohlížeče ani software k instalaci. 
                Funguje okamžitě v jakémkoli moderním webovém prohlížeči.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="bg-white/80 dark:bg-card/80 backdrop-blur-sm rounded-xl p-6 border shadow-lg">
              <div className="w-12 h-12 bg-emerald-100 dark:bg-accent rounded-lg flex items-center justify-center mb-4">
                <span className="text-2xl">🎯</span>
              </div>
              <h3 className="text-xl font-semibold mb-3">Vždy Nahoře</h3>
              <p className="text-muted-foreground">
                Titulkové okno zůstává nad všemi ostatními okny, 
                perfektní pro Netflix, YouTube nebo jakýkoli video přehrávač.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="bg-white/80 dark:bg-card/80 backdrop-blur-sm rounded-xl p-6 border shadow-lg">
              <div className="w-12 h-12 bg-teal-100 dark:bg-accent rounded-lg flex items-center justify-center mb-4">
                <span className="text-2xl">🎨</span>
              </div>
              <h3 className="text-xl font-semibold mb-3">Průhledné Pozadí</h3>
              <p className="text-muted-foreground">
                Čistý, průhledný overlay, který neruší vaše video. 
                Přizpůsobte barvy, písma a pozici podle svých potřeb.
              </p>
            </div>

            {/* Feature 4 */}
            <div className="bg-white/80 dark:bg-card/80 backdrop-blur-sm rounded-xl p-6 border shadow-lg">
              <div className="w-12 h-12 bg-cyan-100 dark:bg-accent rounded-lg flex items-center justify-center mb-4">
                <span className="text-2xl">🖱️</span>
              </div>
              <h3 className="text-xl font-semibold mb-3">Snadné Umístění</h3>
              <p className="text-muted-foreground">
                Přetáhněte okno kamkoli na obrazovku. 
                Pozice si pamatuje vaše preference pro příště.
              </p>
            </div>

          </div>

          {/* How to Use */}
          <div className="mt-8 sm:mt-12 md:mt-16 bg-muted/50 rounded-xl p-6 sm:p-8">
            <h3 className="text-xl sm:text-2xl font-semibold mb-4 sm:mb-6 text-center">
              🚀 Jak Používat Plovoucí titulky
            </h3>
            <div className="grid md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-3">
                  <span className="text-xl font-bold text-primary">1</span>
                </div>
                <h4 className="font-semibold mb-2">Nahrajte Titulky</h4>
                <p className="text-sm text-muted-foreground">
                  Nahrajte SRT soubor s titulky nebo použijte náš AI překladač
                </p>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-3">
                  <span className="text-xl font-bold text-primary">2</span>
                </div>
                <h4 className="font-semibold mb-2">Otevřete Plovoucí okno</h4>
                <p className="text-sm text-muted-foreground">
                  Klikněte na tlačítko pro otevření plovoucího titulkového okna
                </p>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-3">
                  <span className="text-xl font-bold text-primary">3</span>
                </div>
                <h4 className="font-semibold mb-2">Sledujte Video</h4>
                <p className="text-sm text-muted-foreground">
                  Spusťte své video a titulky se automaticky synchronizují
                </p>
              </div>
            </div>
          </div>

          {/* Compatibility */}
          <div className="mt-8 sm:mt-12 text-center">
            <h3 className="text-lg font-semibold mb-4">✅ Kompatibilní se všemi platformami</h3>
            <div className="flex flex-wrap justify-center gap-4 text-sm text-muted-foreground">
              <span className="bg-white/50 dark:bg-card/50 px-3 py-1 rounded-full">Netflix</span>
              <span className="bg-white/50 dark:bg-card/50 px-3 py-1 rounded-full">YouTube</span>
              <span className="bg-white/50 dark:bg-card/50 px-3 py-1 rounded-full">Amazon Prime</span>
              <span className="bg-white/50 dark:bg-card/50 px-3 py-1 rounded-full">Disney+</span>
              <span className="bg-white/50 dark:bg-card/50 px-3 py-1 rounded-full">Hulu</span>
              <span className="bg-white/50 dark:bg-card/50 px-3 py-1 rounded-full">Vimeo</span>
              <span className="bg-white/50 dark:bg-card/50 px-3 py-1 rounded-full">Lokální videa</span>
            </div>
          </div>

        </div>
      </div>
    </div>
  )
}
