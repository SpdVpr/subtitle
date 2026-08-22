import { Metadata } from 'next'
import { LiveStreamPlayer } from '@/components/promo/live-stream-player'

const PLAY_URL = 'https://ultiquiz.com/?utm_source=subtitlebot&utm_medium=live-page&utm_campaign=live'

export const metadata: Metadata = {
  title: 'Movie Quiz Live Stream: Watch & Play 24/7',
  description:
    'Watch the UltiQuiz movie quiz live stream right here. Running 24/7 on Twitch, Kick and YouTube: guess movies, TV series and actors from a single frame, vote A-D in chat and climb the global leaderboard.',
  keywords: [
    'movie quiz live',
    'live movie trivia',
    'guess the movie game',
    'movie trivia stream',
    '24/7 quiz stream',
    'play trivia in chat',
  ],
  openGraph: {
    title: 'Movie Quiz LIVE 24/7 – Guess the Movie in Chat',
    description:
      'A movie quiz that never sleeps. Watch live, type A-D in chat to vote and climb the global leaderboard.',
    url: '/live',
  },
  alternates: {
    canonical: '/live',
    languages: {
      en: '/live',
      cs: '/cs/live',
      'x-default': '/live',
    },
  },
}

export default function LivePage() {
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
            Movie Quiz – Live 24/7
          </h1>
          <p className="text-sm sm:text-base md:text-lg text-muted-foreground max-w-2xl mx-auto">
            A movie quiz that never sleeps. Guess movies, TV series and actors from a single
            frame, vote A, B, C or D in chat and climb the global leaderboard.
          </p>
        </div>

        <LiveStreamPlayer locale="en" />

        <section className="mt-10 sm:mt-12 max-w-2xl mx-auto">
          <h2 className="text-xl sm:text-2xl font-semibold mb-4">How to play</h2>
          <ol className="list-decimal pl-6 space-y-2 text-sm sm:text-base text-muted-foreground">
            <li>Watch the stream – every round shows a single frame from a movie or TV series, or a photo of an actor.</li>
            <li>Type A, B, C or D in chat to pick the answer you think is right.</li>
            <li>Earn points for correct and fast answers plus win streaks. The leaderboard carries over across days.</li>
          </ol>
          <p className="mt-4 text-sm sm:text-base text-muted-foreground">
            The stream runs 24 hours a day, 7 days a week on Twitch, Kick and YouTube. No
            sign-up needed – just an account on the platform where you want to chat. Prefer
            playing solo? Try the full quiz at{' '}
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
