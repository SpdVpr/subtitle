'use client'

import { useEffect, useState, useCallback } from 'react'
import { Gamepad2, ExternalLink, RotateCcw } from 'lucide-react'

/**
 * Interactive UltiQuiz teaser: one real "guess the movie" question served by
 * the ultiquiz.com public API (CORS-enabled, answer verified server-side).
 * Renders nothing if the API is unreachable, so the page never breaks.
 */

const API_BASE = 'https://www.ultiquiz.com'
const PLAY_URL = 'https://ultiquiz.com/?utm_source=subtitlebot&utm_medium=teaser&utm_campaign=subtitles-search'

interface Question {
  photoUrl: string
  options: string[]
  roundToken: string
}

interface TeaserTexts {
  badge: string
  title: string
  subtitle: string
  correct: string
  wrong: string
  play: string
  another: string
  live: string
}

const TEXTS: Record<'en' | 'cs', TeaserTexts> = {
  en: {
    badge: 'MOVIE BREAK',
    title: 'Guess the movie from one frame',
    subtitle: 'You are clearly a movie fan — prove it while your subtitles load.',
    correct: 'Correct! Nice eye.',
    wrong: 'Not this time — the right answer was:',
    play: 'Play the full quiz — free',
    another: 'Another one',
    live: 'LIVE 24/7 quiz streams on Twitch, Kick & YouTube',
  },
  cs: {
    badge: 'FILMOVÁ PAUZA',
    title: 'Poznáš film z jediného záběru?',
    subtitle: 'Jsi tu kvůli filmům — dokaž, že je znáš, než se stáhnou titulky.',
    correct: 'Správně! Máš oko.',
    wrong: 'Tentokrát ne — správně bylo:',
    play: 'Zahraj si celý kvíz — zdarma',
    another: 'Další otázka',
    live: 'LIVE 24/7 kvízové streamy na Twitchi, Kicku a YouTube',
  },
}

async function fetchQuestion(): Promise<Question | null> {
  try {
    const params = new URLSearchParams({
      gameMode: 'movie',
      lang: 'en',
      difficulty: 'iconic',
      yearFrom: '1980',
      gameId: crypto.randomUUID(),
    })
    const res = await fetch(`${API_BASE}/api/random-movie?${params}`)
    if (!res.ok) return null
    const data = await res.json()
    if (!data?.photo?.url || !Array.isArray(data.answerOptions) || !data.roundToken) return null
    return { photoUrl: data.photo.url, options: data.answerOptions, roundToken: data.roundToken }
  } catch {
    return null
  }
}

export function UltiQuizTeaser({ locale = 'en' }: { locale?: 'en' | 'cs' }) {
  const t = TEXTS[locale]
  const [question, setQuestion] = useState<Question | null>(null)
  const [failed, setFailed] = useState(false)
  const [picked, setPicked] = useState<string | null>(null)
  const [result, setResult] = useState<{ correct: boolean; correctAnswer: string } | null>(null)

  const load = useCallback(async () => {
    setPicked(null)
    setResult(null)
    const q = await fetchQuestion()
    if (q) setQuestion(q)
    else setFailed(true)
  }, [])

  useEffect(() => {
    load()
  }, [load])

  const answer = async (option: string) => {
    if (!question || picked) return
    setPicked(option)
    try {
      const res = await fetch(`${API_BASE}/api/verify-round`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ roundToken: question.roundToken, answer: option }),
      })
      const data = await res.json()
      if (res.ok && typeof data.correct === 'boolean') {
        setResult({ correct: data.correct, correctAnswer: data.correctAnswer || option })
      } else {
        setResult({ correct: false, correctAnswer: '' })
      }
    } catch {
      setResult({ correct: false, correctAnswer: '' })
    }
  }

  // Never break or clutter the page when the quiz API is unavailable
  if (failed || !question) return null

  return (
    <div className="mt-12 sm:mt-16">
      <div className="relative overflow-hidden rounded-xl border border-amber-200/50 dark:border-amber-800/30 bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50 dark:from-amber-950/20 dark:via-orange-950/20 dark:to-yellow-950/20 p-4 sm:p-6">
        <div className="absolute top-0 right-0 w-40 h-40 bg-gradient-to-bl from-amber-400/10 to-transparent rounded-bl-full" />

        <div className="relative">
          {/* Header */}
          <div className="flex items-center gap-3 mb-4">
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-lg bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center shadow-md shadow-amber-500/20 flex-shrink-0">
              <Gamepad2 className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
            </div>
            <div>
              <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-amber-100 dark:bg-amber-900/50 text-amber-700 dark:text-amber-300 font-medium tracking-wide">
                {t.badge}
              </span>
              <h2 className="font-bold text-base sm:text-lg text-foreground leading-tight mt-0.5">{t.title}</h2>
              <p className="text-xs sm:text-sm text-muted-foreground">{t.subtitle}</p>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-4 items-start">
            {/* Movie still */}
            <div className="rounded-lg overflow-hidden border border-amber-200/60 dark:border-amber-800/40 bg-black">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={question.photoUrl}
                alt="Movie screenshot — guess the title"
                className="w-full aspect-video object-cover"
                loading="lazy"
              />
            </div>

            {/* Options / result */}
            <div className="flex flex-col gap-2">
              {question.options.map((option) => {
                const isPicked = picked === option
                const isCorrectAnswer = result && option === result.correctAnswer
                const showState = result !== null
                return (
                  <button
                    key={option}
                    onClick={() => answer(option)}
                    disabled={picked !== null}
                    className={`text-left text-sm font-medium rounded-lg border px-3 py-2.5 transition-colors ${
                      showState && isCorrectAnswer
                        ? 'border-green-500 bg-green-50 dark:bg-green-950/40 text-green-800 dark:text-green-300'
                        : showState && isPicked
                          ? 'border-red-400 bg-red-50 dark:bg-red-950/40 text-red-700 dark:text-red-300'
                          : showState
                            ? 'border-border bg-background/60 text-muted-foreground opacity-60'
                            : 'border-border bg-background/80 text-foreground hover:border-amber-400 hover:bg-amber-50 dark:hover:bg-amber-950/30'
                    }`}
                  >
                    {option}
                  </button>
                )
              })}

              {result && (
                <div className="mt-1 text-sm font-medium">
                  {result.correct ? (
                    <span className="text-green-700 dark:text-green-400">✅ {t.correct}</span>
                  ) : (
                    <span className="text-red-700 dark:text-red-400">
                      ❌ {t.wrong} <strong>{result.correctAnswer}</strong>
                    </span>
                  )}
                </div>
              )}

              {/* CTA row appears after answering */}
              {result && (
                <div className="flex flex-wrap items-center gap-2 mt-2">
                  <a
                    href={PLAY_URL}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 rounded-lg bg-gradient-to-r from-amber-500 to-orange-500 px-4 py-2 text-sm font-semibold text-white shadow-md shadow-amber-500/20 hover:from-amber-600 hover:to-orange-600 transition-colors"
                  >
                    {t.play}
                    <ExternalLink className="h-3.5 w-3.5" />
                  </a>
                  <button
                    onClick={load}
                    className="inline-flex items-center gap-1.5 rounded-lg border border-border px-3 py-2 text-sm font-medium text-foreground hover:bg-accent transition-colors"
                  >
                    <RotateCcw className="h-3.5 w-3.5" />
                    {t.another}
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Live streams note */}
          <a
            href={PLAY_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="relative mt-4 inline-flex items-center gap-2 text-xs text-muted-foreground hover:text-foreground transition-colors"
          >
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500" />
            </span>
            {t.live}
          </a>
        </div>
      </div>
    </div>
  )
}
