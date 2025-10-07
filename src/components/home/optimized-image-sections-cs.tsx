'use client'

import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowRight } from "lucide-react";

export function SubtitleOverlaySectionCs() {
  return (
    <section className="py-20 bg-gradient-to-br from-indigo-50 via-white to-cyan-50 dark:from-background dark:via-card dark:to-background">
      <div className="container px-4 mx-auto">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <Badge className="mb-4 bg-gradient-to-r from-indigo-500 to-cyan-500 text-white">
              <span className="text-2xl mr-2">📺</span>
              NOVÁ FUNKCE
            </Badge>
            <h2 className="text-4xl md:text-5xl font-bold mb-6 bg-gradient-to-r from-indigo-600 to-cyan-600 bg-clip-text text-transparent" style={{ lineHeight: '1.4' }}>
              Titulkový Overlay
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Zobrazujte titulky nad jakýmkoli video obsahem s plným přizpůsobením. Perfektní pro streamovací služby,
              video přehrávače a online obsah, kde není možné načíst externí titulky.
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
                    <h3 className="text-xl font-semibold mb-2">Plné Přizpůsobení</h3>
                    <p className="text-muted-foreground">
                      Přizpůsobte písmo, velikost, barvy, pozadí, stíny a umístění.
                      Udělejte titulky přesně tak, jak je chcete.
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <div className="bg-cyan-100 dark:bg-accent p-3 rounded-full">
                    <span className="text-2xl">🎯</span>
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold mb-2">Přetažení & Umístění</h3>
                    <p className="text-muted-foreground">
                      Jednoduše přetáhněte overlay kamkoli na obrazovku. Inteligentní přichycení k okrajům
                      a centrální zarovnání pro perfektní umístění.
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <div className="bg-purple-100 dark:bg-accent p-3 rounded-full">
                    <span className="text-2xl">⏱️</span>
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold mb-2">Perfektní Synchronizace</h3>
                    <p className="text-muted-foreground">
                      Dolaďte časování pomocí ovládání offsetu a rychlostních multiplikátorů.
                      Získejte perfektní synchronizaci s jakýmkoli video obsahem.
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <div className="bg-green-100 dark:bg-accent p-3 rounded-full">
                    <span className="text-2xl">🌐</span>
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold mb-2">Univerzální Kompatibilita</h3>
                    <p className="text-muted-foreground">
                      Funguje s jakýmkoli video přehrávačem, streamovací službou nebo online obsahem.
                      Není potřeba speciální software nebo pluginy.
                    </p>
                  </div>
                </div>
              </div>

              <div className="pt-6">
                <Button size="lg" className="bg-gradient-to-r from-indigo-600 to-cyan-600 hover:from-indigo-700 hover:to-cyan-700 text-white" asChild>
                  <Link href="/cs/subtitle-editor" className="flex items-center gap-2">
                    <span className="text-xl">📺</span>
                    Vyzkoušet Editor Titulků Nyní
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
                    Perfektní umístění titulků kdekoli na obrazovce
                  </div>
                </div>

                <div className="text-white/60 text-xs text-center">
                  Overlay funguje s jakýmkoli video přehrávačem nebo streamovací službou
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export function PopupWindowSectionCs() {
  return (
    <section className="py-20 bg-gradient-to-br from-green-50 via-white to-emerald-50 dark:from-background dark:via-card dark:to-background">
      <div className="container px-4 mx-auto">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <Badge className="mb-4 bg-gradient-to-r from-green-500 to-emerald-500 text-white">
              <span className="text-2xl mr-2">🪟</span>
              ŽÁDNÁ INSTALACE POTŘEBA
            </Badge>
            <h2 className="text-4xl md:text-5xl font-bold mb-6 bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent" style={{ lineHeight: '1.4' }}>
              Plovoucí titulky
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Otevřete titulkové okno, které zůstává nad jakýmkoli videem. Žádná rozšíření prohlížeče,
              žádné instalace - jen klikněte a okamžitě používejte!
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
                    <h3 className="text-xl font-semibold mb-2">Okamžité Nastavení</h3>
                    <p className="text-muted-foreground">
                      Žádná rozšíření prohlížeče nebo software k instalaci. Funguje okamžitě
                      v jakémkoli moderním webovém prohlížeči.
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <div className="bg-emerald-100 dark:bg-accent p-3 rounded-full">
                    <span className="text-2xl">🎯</span>
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold mb-2">Vždy Nahoře</h3>
                    <p className="text-muted-foreground">
                      Titulkové okno zůstává nad všemi ostatními okny, perfektní pro
                      Netflix, YouTube nebo jakýkoli video přehrávač.
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <div className="bg-teal-100 dark:bg-accent p-3 rounded-full">
                    <span className="text-2xl">🎨</span>
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold mb-2">Průhledné Pozadí</h3>
                    <p className="text-muted-foreground">
                      Čistý, průhledný overlay, který neruší vaše video.
                      Přizpůsobte barvy, písma a umístění.
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <div className="bg-cyan-100 dark:bg-accent p-3 rounded-full">
                    <span className="text-2xl">🖱️</span>
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold mb-2">Snadné Umístění</h3>
                    <p className="text-muted-foreground">
                      Přetáhněte okno kamkoli na obrazovku. Pozice si pamatuje
                      vaše preference pro příště.
                    </p>
                  </div>
                </div>
              </div>

              <div className="pt-6">
                <Button size="lg" className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white" asChild>
                  <Link href="/cs/video-tools" className="flex items-center gap-2">
                    <span className="text-xl">🪟</span>
                    Vyzkoušet Plovoucí titulky Nyní
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
                    Perfektní umístění titulků
                  </div>
                  <div className="text-xs text-green-400 mt-1 text-center">
                    ↑ Popup Okno
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

export function VideoPlayerSectionCs() {
  return (
    <section className="py-20 bg-gradient-to-br from-purple-50 via-white to-pink-50 dark:from-background dark:via-card dark:to-background">
      <div className="container px-4 mx-auto">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <Badge className="mb-4 bg-gradient-to-r from-purple-500 to-pink-500 text-white">
              <span className="text-2xl mr-2">🎬</span>
              VŠE-V-JEDNOM ŘEŠENÍ
            </Badge>
            <h2 className="text-4xl md:text-5xl font-bold mb-6 bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent" style={{ lineHeight: '1.4' }}>
              Integrovaný Video Přehrávač
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Sledujte jakékoli video s vlastními titulky na jednom místě. Perfektní synchronizace,
              plné přizpůsobení a podpora všech hlavních video platforem.
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
                    <h3 className="text-xl font-semibold mb-2">Univerzální Video Podpora</h3>
                    <p className="text-muted-foreground">
                      Funguje s YouTube, Vimeo, přímými video odkazy a jakýmkoli vložitelným
                      video obsahem. Stačí vložit URL a začít sledovat.
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <div className="bg-pink-100 dark:bg-accent p-3 rounded-full">
                    <span className="text-2xl">⚡</span>
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold mb-2">Perfektní Synchronizace</h3>
                    <p className="text-muted-foreground">
                      Titulky jsou perfektně synchronizovány s přehráváním videa. Automatické časování
                      s možností ručního doladění pro perfektní zarovnání.
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <div className="bg-indigo-100 dark:bg-accent p-3 rounded-full">
                    <span className="text-2xl">🎨</span>
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold mb-2">Kompletní Přizpůsobení</h3>
                    <p className="text-muted-foreground">
                      Plná kontrola nad vzhledem titulků - písma, barvy, umístění,
                      průhlednost a efekty. Udělejte si je přesně podle svých představ.
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <div className="bg-cyan-100 dark:bg-accent p-3 rounded-full">
                    <span className="text-2xl">🎯</span>
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold mb-2">Vše-v-Jednom Rozhraní</h3>
                    <p className="text-muted-foreground">
                      Vše na jednom místě - video přehrávač, ovládání titulků a
                      možnosti přizpůsobení. Není potřeba žonglovat s více okny.
                    </p>
                  </div>
                </div>
              </div>

              <div className="pt-6">
                <Button size="lg" className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white" asChild>
                  <Link href="/cs/video-tools" className="flex items-center gap-2">
                    <span className="text-xl">🎬</span>
                    Vyzkoušet Video Přehrávač Nyní
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
                    Perfektní integrace titulků
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
                    Integrované video ovládání + přizpůsobení titulků
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

