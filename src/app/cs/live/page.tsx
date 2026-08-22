import { Metadata } from 'next'
import { LiveStreamPlayer } from '@/components/promo/live-stream-player'

const PLAY_URL = 'https://ultiquiz.com/cs?utm_source=subtitlebot&utm_medium=live-page&utm_campaign=live'

export const metadata: Metadata = {
  title: 'Filmový kvíz živě: sleduj a hraj 24/7',
  description:
    'Sleduj živý stream filmového kvízu UltiQuiz přímo tady. Běží 24/7 na Twitchi, Kicku a YouTube: hádej filmy, seriály a herce z jediného záběru, hlasuj v chatu A-D a šplhej v globálním žebříčku.',
  keywords: [
    'filmový kvíz živě',
    'filmový kvíz online',
    'hádej film',
    'filmové trivia',
    'kvíz stream',
    'hraní v chatu',
  ],
  openGraph: {
    title: 'Filmový kvíz LIVE 24/7 – hádej filmy v chatu',
    description:
      'Kvíz, který nikdy nespí. Sleduj živě, hlasuj v chatu písmenem A-D a šplhej v globálním žebříčku.',
    url: '/cs/live',
  },
  alternates: {
    canonical: '/cs/live',
    languages: {
      en: '/live',
      cs: '/cs/live',
      'x-default': '/live',
    },
  },
}

export default function LivePageCs() {
  return (
    <div className="py-6 sm:py-8 md:py-10 bg-background">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-5xl">
        <div className="mb-6 sm:mb-8 text-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-red-400/50 bg-red-500/10 px-3 py-1 mb-3">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500" />
            </span>
            <span className="text-xs font-bold tracking-wide text-red-600 dark:text-red-400">LIVE 24/7</span>
          </div>
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-3">
            Filmový kvíz – živě 24/7
          </h1>
          <p className="text-sm sm:text-base md:text-lg text-muted-foreground max-w-2xl mx-auto">
            Kvíz, který nikdy nespí. Hádej filmy, seriály a herce z jediného záběru, hlasuj
            v chatu písmenem A, B, C nebo D a šplhej v globálním žebříčku.
          </p>
        </div>

        <LiveStreamPlayer locale="cs" />

        <section className="mt-10 sm:mt-12 max-w-2xl mx-auto">
          <h2 className="text-xl sm:text-2xl font-semibold mb-4">Jak se hraje</h2>
          <ol className="list-decimal pl-6 space-y-2 text-sm sm:text-base text-muted-foreground">
            <li>Sleduj stream – každé kolo ukáže jeden záběr z filmu či seriálu, nebo fotku herce.</li>
            <li>Napiš do chatu A, B, C nebo D podle toho, která odpověď je podle tebe správná.</li>
            <li>Sbírej body za správné a rychlé odpovědi a za série výher. Žebříček se počítá napříč dny.</li>
          </ol>
          <p className="mt-4 text-sm sm:text-base text-muted-foreground">
            Stream běží 24 hodin denně, 7 dní v týdnu na Twitchi, Kicku i YouTube. Nepotřebuješ
            registraci – stačí účet na platformě, kde chceš psát do chatu. Chceš si zahrát
            sólo? Zkus celý kvíz na{' '}
            <a
              href={PLAY_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="font-medium text-foreground underline underline-offset-4 hover:text-primary"
            >
              UltiQuiz.com
            </a>
            .
          </p>
        </section>
      </div>
    </div>
  )
}
