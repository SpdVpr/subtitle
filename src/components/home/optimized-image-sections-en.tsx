'use client'

import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowRight } from "lucide-react";

export function SubtitleOverlaySectionEn() {
  return (
    <section className="py-20 bg-gradient-to-br from-indigo-50 via-white to-cyan-50 dark:from-background dark:via-card dark:to-background">
      <div className="container px-4 mx-auto">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <Badge className="mb-4 bg-gradient-to-r from-indigo-500 to-cyan-500 text-white">
              <span className="text-2xl mr-2">📺</span>
              NEW FEATURE
            </Badge>
            <h2 className="text-4xl md:text-5xl font-bold mb-6 bg-gradient-to-r from-indigo-600 to-cyan-600 bg-clip-text text-transparent" style={{ lineHeight: '1.4' }}>
              Subtitle Overlay
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Display subtitles over any video content with full customization. Perfect for streaming services,
              video players, and online content where external subtitle loading isn't available.
            </p>
          </div>

          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-8">
              <div className="space-y-6">
                <div className="flex items-start space-x-4">
                  <div className="bg-indigo-100 dark:bg-accent p-3 rounded-full">
                    <span className="text-2xl">🎨</span>
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold mb-2">Full Customization</h3>
                    <p className="text-muted-foreground">
                      Customize font, size, colors, background, shadows, and positioning.
                      Make subtitles look exactly how you want them.
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <div className="bg-cyan-100 dark:bg-accent p-3 rounded-full">
                    <span className="text-2xl">🎯</span>
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold mb-2">Drag & Drop Positioning</h3>
                    <p className="text-muted-foreground">
                      Simply drag the overlay anywhere on your screen. Smart snapping to edges
                      and center alignment for perfect positioning.
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <div className="bg-purple-100 dark:bg-accent p-3 rounded-full">
                    <span className="text-2xl">⏱️</span>
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold mb-2">Perfect Synchronization</h3>
                    <p className="text-muted-foreground">
                      Fine-tune timing with offset controls and speed multipliers.
                      Get perfect sync with any video content.
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <div className="bg-green-100 dark:bg-accent p-3 rounded-full">
                    <span className="text-2xl">🌐</span>
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold mb-2">Universal Compatibility</h3>
                    <p className="text-muted-foreground">
                      Works with any video player, streaming service, or online content.
                      No need for special software or plugins.
                    </p>
                  </div>
                </div>
              </div>

              <div className="pt-6">
                <Button size="lg" className="bg-gradient-to-r from-indigo-600 to-cyan-600 hover:from-indigo-700 hover:to-cyan-700 text-white" asChild>
                  <Link href="/subtitle-editor" className="flex items-center gap-2">
                    <span className="text-xl">📺</span>
                    Try Subtitle Editor Now
                    <ArrowRight className="h-5 w-5" />
                  </Link>
                </Button>
              </div>
            </div>

            <div className="relative">
              <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl p-8 shadow-2xl">
                <div className="bg-black rounded-lg aspect-video flex items-center justify-center mb-4 relative overflow-hidden">
                  <Image
                    src="/images/gladiator.webp"
                    alt="Gladiator movie scene - Russell Crowe as Maximus demonstrating subtitle overlay feature"
                    width={1920}
                    height={1080}
                    className="w-full h-full object-cover"
                    loading="lazy"
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 600px"
                  />
                  <div className="absolute inset-0 bg-gradient-to-br from-blue-900/20 to-purple-900/20"></div>

                  {/* Simulated subtitle overlay */}
                  <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-black/80 text-white px-4 py-2 rounded text-sm font-medium">
                    Perfect subtitle positioning anywhere on screen
                  </div>
                </div>

                <div className="text-white/60 text-xs text-center">
                  Overlay works with any video player or streaming service
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export function PopupWindowSectionEn() {
  return (
    <section className="py-20 bg-gradient-to-br from-green-50 via-white to-emerald-50 dark:from-background dark:via-card dark:to-background">
      <div className="container px-4 mx-auto">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <Badge className="mb-4 bg-gradient-to-r from-green-500 to-emerald-500 text-white">
              <span className="text-2xl mr-2">🪟</span>
              NO INSTALLATION NEEDED
            </Badge>
            <h2 className="text-4xl md:text-5xl font-bold mb-6 bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent" style={{ lineHeight: '1.4' }}>
              Popup Window Solution
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Open a subtitle window that stays on top of any video. No browser extensions,
              no installations - just click and use instantly!
            </p>
          </div>

          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-8">
              <div className="space-y-6">
                <div className="flex items-start space-x-4">
                  <div className="bg-green-100 dark:bg-accent p-3 rounded-full">
                    <span className="text-2xl">⚡</span>
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold mb-2">Instant Setup</h3>
                    <p className="text-muted-foreground">
                      No browser extensions or software to install. Works immediately
                      in any modern web browser.
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <div className="bg-emerald-100 dark:bg-accent p-3 rounded-full">
                    <span className="text-2xl">🎯</span>
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold mb-2">Always On Top</h3>
                    <p className="text-muted-foreground">
                      The subtitle window stays above all other windows, perfect for
                      Netflix, YouTube, or any video player.
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <div className="bg-teal-100 dark:bg-accent p-3 rounded-full">
                    <span className="text-2xl">🎨</span>
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold mb-2">Transparent Background</h3>
                    <p className="text-muted-foreground">
                      Clean, transparent overlay that doesn't interfere with your video.
                      Customize colors, fonts, and positioning.
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <div className="bg-cyan-100 dark:bg-accent p-3 rounded-full">
                    <span className="text-2xl">🖱️</span>
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold mb-2">Easy Positioning</h3>
                    <p className="text-muted-foreground">
                      Drag the window anywhere on your screen. Position remembers
                      your preference for next time.
                    </p>
                  </div>
                </div>
              </div>

              <div className="pt-6">
                <Button size="lg" className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white" asChild>
                  <Link href="/video-tools" className="flex items-center gap-2">
                    <span className="text-xl">🪟</span>
                    Try Picture-in-Picture Now
                    <ArrowRight className="h-5 w-5" />
                  </Link>
                </Button>
              </div>
            </div>

            <div className="relative">
              <div className="bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-900 rounded-2xl p-8 shadow-2xl">
                {/* Main browser window mockup */}
                <div className="bg-white dark:bg-gray-700 rounded-lg shadow-lg mb-4">
                  <div className="flex items-center space-x-2 p-3 border-b border-gray-200 dark:border-gray-600">
                    <div className="w-3 h-3 bg-red-400 rounded-full"></div>
                    <div className="w-3 h-3 bg-yellow-400 rounded-full"></div>
                    <div className="w-3 h-3 bg-green-400 rounded-full"></div>
                    <div className="flex-1 bg-gray-100 dark:bg-gray-600 rounded px-3 py-1 text-xs text-gray-600 dark:text-gray-300">
                      netflix.com/watch/movie
                    </div>
                  </div>
                  <div className="aspect-video bg-black rounded-b-lg flex items-center justify-center relative overflow-hidden">
                    <Image
                      src="/images/SouthPark.webp"
                      alt="South Park episode scene demonstrating floating subtitle window feature"
                      width={1920}
                      height={1080}
                      className="w-full h-full object-cover"
                      loading="lazy"
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 600px"
                    />
                  </div>
                </div>

                {/* Popup window mockup */}
                <div className="absolute -top-4 -right-4 bg-black/90 backdrop-blur-sm rounded-lg p-4 shadow-2xl border-2 border-green-400">
                  <div className="text-white text-center text-sm font-medium">
                    Perfect subtitle positioning
                  </div>
                  <div className="text-xs text-green-400 mt-1 text-center">
                    ↑ Popup Window
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export function VideoPlayerSectionEn() {
  return (
    <section className="py-20 bg-gradient-to-br from-purple-50 via-white to-pink-50 dark:from-background dark:via-card dark:to-background">
      <div className="container px-4 mx-auto">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <Badge className="mb-4 bg-gradient-to-r from-purple-500 to-pink-500 text-white">
              <span className="text-2xl mr-2">🎬</span>
              ALL-IN-ONE SOLUTION
            </Badge>
            <h2 className="text-4xl md:text-5xl font-bold mb-6 bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent" style={{ lineHeight: '1.4' }}>
              Integrated Video Player
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Watch any video with custom subtitles in one place. Perfect synchronization,
              full customization, and support for all major video platforms.
            </p>
          </div>

          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-8">
              <div className="space-y-6">
                <div className="flex items-start space-x-4">
                  <div className="bg-purple-100 dark:bg-accent p-3 rounded-full">
                    <span className="text-2xl">🔗</span>
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold mb-2">Universal Video Support</h3>
                    <p className="text-muted-foreground">
                      Works with YouTube, Vimeo, direct video links, and any embeddable
                      video content. Just paste the URL and start watching.
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <div className="bg-pink-100 dark:bg-accent p-3 rounded-full">
                    <span className="text-2xl">⚡</span>
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold mb-2">Perfect Synchronization</h3>
                    <p className="text-muted-foreground">
                      Subtitles are perfectly synced with video playback. Automatic timing
                      with manual fine-tuning controls for perfect alignment.
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <div className="bg-indigo-100 dark:bg-accent p-3 rounded-full">
                    <span className="text-2xl">🎨</span>
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold mb-2">Complete Customization</h3>
                    <p className="text-muted-foreground">
                      Full control over subtitle appearance - fonts, colors, positioning,
                      opacity, and effects. Make it look exactly how you want.
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <div className="bg-cyan-100 dark:bg-accent p-3 rounded-full">
                    <span className="text-2xl">🎯</span>
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold mb-2">All-in-One Interface</h3>
                    <p className="text-muted-foreground">
                      Everything in one place - video player, subtitle controls, and
                      customization options. No need to juggle multiple windows.
                    </p>
                  </div>
                </div>
              </div>

              <div className="pt-6">
                <Button size="lg" className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white" asChild>
                  <Link href="/video-tools" className="flex items-center gap-2">
                    <span className="text-xl">🎬</span>
                    Try Video Player Now
                    <ArrowRight className="h-5 w-5" />
                  </Link>
                </Button>
              </div>
            </div>

            <div className="relative">
              <div className="bg-gradient-to-br from-gray-900 to-purple-900 rounded-2xl p-6 shadow-2xl">
                {/* Video player mockup */}
                <div className="bg-black rounded-lg aspect-video mb-4 relative overflow-hidden">
                  <Image
                    src="/images/solo-leveling.jpeg"
                    alt="Solo Leveling anime scene demonstrating integrated video player with subtitle customization"
                    width={1920}
                    height={1080}
                    className="w-full h-full object-cover"
                    loading="lazy"
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 600px"
                  />
                  <div className="absolute inset-0 bg-gradient-to-br from-purple-900/30 to-pink-900/30"></div>

                  {/* Subtitle overlay mockup */}
                  <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-black/80 text-white px-4 py-2 rounded text-sm font-medium">
                    Perfect subtitle integration
                  </div>
                </div>

                {/* Controls mockup */}
                <div className="bg-gray-800 rounded p-3">
                  <div className="flex items-center space-x-2 mb-2">
                    <div className="w-6 h-6 bg-purple-500 rounded flex items-center justify-center">
                      <span className="text-white text-xs">▶</span>
                    </div>
                    <div className="flex-1 bg-gray-700 rounded h-1">
                      <div className="bg-purple-500 h-1 rounded w-1/3"></div>
                    </div>
                    <div className="text-white text-xs">2:34</div>
                  </div>
                  <div className="text-gray-400 text-xs text-center">
                    Integrated video controls + subtitle customization
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

