'use client'

import { useState } from 'react'
import { Twitch, Youtube, Zap } from 'lucide-react'

/**
 * Embedded 24/7 UltiQuiz movie-quiz stream with a platform switcher.
 * The embeds count as regular platform viewers (Twitch requires the
 * `parent` params to match this site's domains).
 */

const TWITCH_PARENTS = 'parent=subtitlebot.com&parent=www.subtitlebot.com'
const YT_CHANNEL_ID = 'UCqJ-ozo8StBYaU1kaig46Gg'

type PlatformId = 'twitch' | 'youtube' | 'kick'

const PLATFORMS: {
  id: PlatformId
  name: string
  Icon: typeof Twitch
  channelUrl: string
  embedUrl: string
  tabClasses: string
  activeClasses: string
  ctaClasses: string
}[] = [
  {
    id: 'twitch',
    name: 'Twitch',
    Icon: Twitch,
    channelUrl: 'https://twitch.tv/movies_quiz',
    embedUrl: `https://player.twitch.tv/?channel=movies_quiz&${TWITCH_PARENTS}&autoplay=true&muted=true`,
    tabClasses: 'border-purple-400/60 text-purple-700 dark:text-purple-300 hover:bg-purple-500/20',
    activeClasses: 'bg-purple-500/15 border-purple-500',
    ctaClasses:
      'border-purple-400/60 bg-purple-500/10 text-purple-700 dark:text-purple-300 hover:bg-purple-500/20 hover:shadow-purple-500/20',
  },
  {
    id: 'youtube',
    name: 'YouTube',
    Icon: Youtube,
    channelUrl: 'https://youtube.com/@TheUltimateMovieQuiz/live',
    embedUrl: `https://www.youtube.com/embed/live_stream?channel=${YT_CHANNEL_ID}&autoplay=1&mute=1`,
    tabClasses: 'border-red-400/60 text-red-700 dark:text-red-400 hover:bg-red-500/20',
    activeClasses: 'bg-red-500/15 border-red-500',
    ctaClasses:
      'border-red-400/60 bg-red-500/10 text-red-700 dark:text-red-400 hover:bg-red-500/20 hover:shadow-red-500/20',
  },
  {
    id: 'kick',
    name: 'Kick',
    Icon: Zap,
    channelUrl: 'https://kick.com/ultiquiz',
    embedUrl: 'https://player.kick.com/ultiquiz?autoplay=true&muted=true',
    tabClasses: 'border-green-500/60 text-green-700 dark:text-green-400 hover:bg-green-500/20',
    activeClasses: 'bg-green-500/15 border-green-500',
    ctaClasses:
      'border-green-500/60 bg-green-500/10 text-green-700 dark:text-green-400 hover:bg-green-500/20 hover:shadow-green-500/20',
  },
]

const TEXTS = {
  en: {
    cta: (name: string) => `Play in chat on ${name}`,
    hint: 'Voting happens in the platform chat – open the stream and type A, B, C or D.',
  },
  cs: {
    cta: (name: string) => `Hrát v chatu na ${name}`,
    hint: 'Hlasuje se v chatu dané platformy – otevři si stream a napiš A, B, C nebo D.',
  },
}

export function LiveStreamPlayer({ locale }: { locale: 'en' | 'cs' }) {
  const [activeId, setActiveId] = useState<PlatformId>('twitch')
  const platform = PLATFORMS.find((p) => p.id === activeId)!
  const t = TEXTS[locale]

  return (
    <div>
      <div className="flex flex-wrap justify-center gap-3 mb-4" role="tablist">
        {PLATFORMS.map(({ id, name, Icon, tabClasses, activeClasses }) => (
          <button
            key={id}
            role="tab"
            aria-selected={activeId === id}
            onClick={() => setActiveId(id)}
            className={`inline-flex items-center gap-2 rounded-lg border px-4 py-2 text-sm font-semibold transition-all ${tabClasses} ${
              activeId === id ? activeClasses : 'border-border bg-card'
            }`}
          >
            <Icon className="h-4 w-4" />
            {name}
          </button>
        ))}
      </div>

      <div className="relative w-full aspect-video overflow-hidden rounded-xl border border-border bg-black">
        <iframe
          key={platform.id}
          src={platform.embedUrl}
          title={`UltiQuiz movie quiz live stream on ${platform.name}`}
          className="absolute inset-0 h-full w-full border-0"
          allow="autoplay; fullscreen; encrypted-media; picture-in-picture"
          allowFullScreen
        />
      </div>

      <div className="mt-4 text-center">
        <a
          href={platform.channelUrl}
          target="_blank"
          rel="noopener noreferrer"
          className={`inline-flex items-center gap-2 rounded-lg border px-5 py-2.5 font-semibold transition-all hover:shadow-lg ${platform.ctaClasses}`}
        >
          <platform.Icon className="h-5 w-5" />
          {t.cta(platform.name)}
        </a>
        <p className="mt-3 text-sm text-muted-foreground">{t.hint}</p>
      </div>
    </div>
  )
}
