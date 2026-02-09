import type { Metadata } from "next";
import Link from "next/link";
import { StructuredData } from "@/components/seo/structured-data";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CzechHomeClient } from "./page-client";
import {
  Sparkles,
  Zap,
  Brain,
  Globe,
  FileText,
  Gift,
  CheckCircle,
  ArrowRight,
  ArrowDown,
  Languages,
  Star,
  MessageSquare
} from "lucide-react";

export const metadata: Metadata = {
  title: "SubtitleBot - AI Překlad Titulků | 100+ Jazyků | Zdarma Kredity",
  description: "Profesionální AI překladač titulků s podporou 100+ jazyků. Rychlé, přesné, kontextové překlady pro filmy, seriály a videa. 100 kreditů zdarma. Žádné předplatné. Vyzkoušejte nyní!",
  keywords: [
    "AI překlad titulků",
    "SRT překladač",
    "video titulky",
    "Google AI překlad",
    "vícejazyčné titulky",
    "převodník titulků",
    "překlad titulků zdarma",
    "profesionální překladač titulků",
    "přeložit titulky do češtiny",
    "přeložit titulky do angličtiny",
    "kontextový překlad",
    "AI titulky",
    "automatický překlad titulků"
  ],
  openGraph: {
    title: "SubtitleBot - AI Překlad Titulků | 100+ Jazyků",
    description: "Profesionální AI překladač titulků s podporou 100+ jazyků. Rychlé, přesné, kontextové překlady. 100 kreditů zdarma při registraci.",
    url: '/cs',
    siteName: "SubtitleBot",
    images: [
      {
        url: '/og-image-cs.png',
        width: 1200,
        height: 630,
        alt: "SubtitleBot - AI Překlad Titulků s podporou 100+ jazyků",
      },
    ],
    locale: 'cs_CZ',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: "SubtitleBot - AI Překlad Titulků | 100+ Jazyků",
    description: "Profesionální AI překladač titulků. Rychlé, přesné, kontextové překlady. 100 kreditů zdarma.",
    images: ['/og-image-cs.png'],
    creator: '@SubtitleBot',
    site: '@SubtitleBot',
  },
  alternates: {
    canonical: '/cs',
    languages: {
      'en': '/',
      'cs': '/cs',
    },
  },
};

export default function CzechHome() {
  return (
    <CzechHomeClient>
      <StructuredData locale="cs" page="home" />
      <div className="flex flex-col min-h-screen">
        {/* Hero Section */}
        <section className="relative overflow-hidden bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-background dark:via-card dark:to-background">
          <div className="absolute inset-0 bg-grid-pattern opacity-5"></div>

          {/* Animated background blobs */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <div className="absolute top-20 left-10 w-96 h-96 bg-blue-400/10 rounded-full blur-3xl animate-blob"></div>
            <div className="absolute top-40 right-20 w-96 h-96 bg-purple-400/10 rounded-full blur-3xl animate-blob animation-delay-2000"></div>
            <div className="absolute -bottom-20 left-1/3 w-96 h-96 bg-green-400/10 rounded-full blur-3xl animate-blob animation-delay-4000"></div>
          </div>

          <div className="container px-4 py-24 mx-auto text-center relative">
            <div className="max-w-5xl mx-auto">
              {/* Free Credits Badge */}
              <Link href="/cs/register" className="inline-block group">
                <div className="inline-flex items-center gap-2 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white px-6 py-3 rounded-full mb-8 shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer transform hover:scale-105 hover:-rotate-1">
                  <Gift className="h-5 w-5 animate-bounce" />
                  <span className="font-semibold">Noví uživatelé získají 100 kreditů ZDARMA pro první překlady</span>
                  <Sparkles className="h-5 w-5 animate-spin-slow" />
                </div>
              </Link>

              <h1 className="text-5xl md:text-7xl font-bold tracking-tight mb-6 bg-gradient-to-r from-blue-600 via-purple-600 to-blue-800 bg-clip-text text-transparent animate-fade-in-up">
                AI Překlad Titulků
              </h1>

              <p className="text-xl md:text-2xl text-gray-600 dark:text-muted-foreground mb-8 max-w-3xl mx-auto leading-relaxed">
                Přeložte své titulky pomocí našeho <span className="font-semibold text-blue-600 dark:text-primary">proprietárního AI enginu</span>, který kombinuje
                <span className="font-semibold text-purple-600 dark:text-primary"> Google Gemini + Kontextové porozumění</span> pro maximální kvalitu překladu.
              </p>

              {/* Key Features Pills */}
              <div className="flex flex-wrap justify-center gap-3 mb-10">
                <Badge variant="secondary" className="px-4 py-2 text-sm">
                  <CheckCircle className="h-4 w-4 mr-2 text-green-500" />
                  100+ jazykových párů
                </Badge>
                <Badge variant="secondary" className="px-4 py-2 text-sm">
                  <CheckCircle className="h-4 w-4 mr-2 text-green-500" />
                  Kontextové AI
                </Badge>
                <Badge variant="secondary" className="px-4 py-2 text-sm">
                  <CheckCircle className="h-4 w-4 mr-2 text-green-500" />
                  Žádné předplatné
                </Badge>
                <Badge variant="secondary" className="px-4 py-2 text-sm">
                  <CheckCircle className="h-4 w-4 mr-2 text-green-500" />
                  Kredity nikdy nevyprší
                </Badge>
              </div>

              {/* Live Translation Demo */}
              <div className="bg-white/80 backdrop-blur-sm border border-blue-200 rounded-2xl p-6 mb-10 max-w-4xl mx-auto shadow-xl dark:bg-card/80 dark:border-border dark:backdrop-blur-sm hover:shadow-2xl transition-shadow duration-300 animate-fade-in-up animation-delay-300">
                <div className="flex items-center justify-center gap-2 mb-6">
                  <Languages className="h-5 w-5 text-blue-600 dark:text-primary" />
                  <span className="font-semibold text-gray-800 dark:text-card-foreground">Podívejte se na překlad v akci</span>
                  <Badge className="ml-2 bg-green-500 text-white animate-pulse">
                    <div className="w-2 h-2 bg-white rounded-full mr-2"></div>
                    LIVE
                  </Badge>
                </div>

                {/* Translation Demo */}
                <div className="flex flex-col lg:flex-row gap-6 items-start">
                  {/* Original English */}
                  <div className="flex-1 space-y-3">
                    <div className="flex items-center gap-2 mb-3">
                      <div className="w-6 h-4 bg-red-500 rounded-sm flex items-center justify-center">
                        <span className="text-white text-xs font-bold">EN</span>
                      </div>
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Originál v angličtině</span>
                    </div>

                    <div className="space-y-2">
                      <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-3 border-l-4 border-red-500">
                        <div className="text-xs text-gray-500 dark:text-gray-400 font-mono mb-1">00:02:15,340 → 00:02:18,720</div>
                        <div className="text-sm text-gray-800 dark:text-gray-200">This algorithm looks impossible to solve.</div>
                      </div>

                      <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-3 border-l-4 border-red-500">
                        <div className="text-xs text-gray-500 dark:text-gray-400 font-mono mb-1">00:02:19,180 → 00:02:22,560</div>
                        <div className="text-sm text-gray-800 dark:text-gray-200">It's a piece of cake for David.</div>
                      </div>

                      <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-3 border-l-4 border-red-500">
                        <div className="text-xs text-gray-500 dark:text-gray-400 font-mono mb-1">00:02:23,890 → 00:02:26,450</div>
                        <div className="text-sm text-gray-800 dark:text-gray-200">He's been coding since he was twelve.</div>
                      </div>
                    </div>
                  </div>

                  {/* Arrow - Desktop */}
                  <div className="hidden lg:flex items-center justify-center px-4">
                    <div className="flex flex-col items-center">
                      <ArrowRight className="h-8 w-8 text-blue-500 dark:text-primary animate-pulse" />
                      <span className="text-xs text-blue-600 dark:text-primary font-medium mt-1">AI Překlad</span>
                    </div>
                  </div>

                  {/* Arrow - Mobile/Tablet */}
                  <div className="lg:hidden flex items-center justify-center py-4 w-full">
                    <div className="flex items-center">
                      <ArrowDown className="h-6 w-6 text-blue-500 dark:text-primary animate-bounce" />
                      <span className="text-xs text-blue-600 dark:text-primary font-medium ml-2">AI Překlad</span>
                    </div>
                  </div>

                  {/* Translated Czech */}
                  <div className="flex-1 space-y-3">
                    <div className="flex items-center gap-2 mb-3">
                      <div className="w-6 h-4 bg-blue-600 rounded-sm flex items-center justify-center">
                        <span className="text-white text-xs font-bold">CZ</span>
                      </div>
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Přeloženo do češtiny</span>
                    </div>

                    <div className="space-y-2">
                      <div className="bg-blue-50 dark:bg-blue-950 rounded-lg p-3 border-l-4 border-blue-600">
                        <div className="text-xs text-gray-500 dark:text-gray-400 font-mono mb-1">00:02:15,340 → 00:02:18,720</div>
                        <div className="text-sm text-gray-800 dark:text-blue-200">Tento algoritmus vypadá neřešitelně.</div>
                      </div>

                      <div className="bg-blue-50 dark:bg-blue-950 rounded-lg p-3 border-l-4 border-blue-600">
                        <div className="text-xs text-gray-500 dark:text-gray-400 font-mono mb-1">00:02:19,180 → 00:02:22,560</div>
                        <div className="text-sm text-gray-800 dark:text-blue-200">Pro Davida je to hračka.</div>
                      </div>

                      <div className="bg-blue-50 dark:bg-blue-950 rounded-lg p-3 border-l-4 border-blue-600">
                        <div className="text-xs text-gray-500 dark:text-gray-400 font-mono mb-1">00:02:23,890 → 00:02:26,450</div>
                        <div className="text-sm text-gray-800 dark:text-blue-200">Programuje už od dvanácti let.</div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Bottom Info */}
                <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
                  <p className="text-center text-sm text-gray-600 dark:text-muted-foreground">
                    <span className="font-medium text-blue-600 dark:text-primary">Perfektní časování zachováno</span> •
                    <span className="font-medium text-green-600 dark:text-green-400"> Přirozené překlady</span> •
                    <span className="font-medium text-purple-600 dark:text-purple-400"> Podpora 40+ jazyků</span>
                  </p>
                </div>
              </div>

              {/* CTA Buttons */}
              <div className="flex flex-col sm:flex-row gap-4 justify-center animate-fade-in-up animation-delay-300">
                <Button size="lg" className="bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 text-primary-foreground shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300" asChild>
                  <Link href="/cs/translate" className="flex items-center gap-2">
                    <Sparkles className="h-5 w-5" />
                    Začít Překládat ZDARMA
                    <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
                  </Link>
                </Button>
                <Button variant="outline" size="lg" className="hover:scale-105 transition-all duration-300" asChild>
                  <Link href="/cs/pricing" className="flex items-center gap-2">
                    <Gift className="h-5 w-5" />
                    Zobrazit Balíčky Kreditů
                  </Link>
                </Button>
              </div>

              {/* Trust Indicators */}
              <div className="mt-12 flex flex-wrap justify-center items-center gap-8 text-gray-600 dark:text-muted-foreground animate-fade-in-up animation-delay-300">
                <div className="flex items-center gap-2 hover:scale-110 transition-transform duration-300">
                  <Star className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                  <span className="text-sm">Prémiová AI kvalita - Gemini Pro model</span>
                </div>
                <div className="flex items-center gap-2 hover:scale-110 transition-transform duration-300">
                  <CheckCircle className="h-5 w-5 text-green-500 dark:text-green-400" />
                  <span className="text-sm">Okamžité zpracování</span>
                </div>
                <div className="flex items-center gap-2 hover:scale-110 transition-transform duration-300">
                  <Globe className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                  <span className="text-sm">Globální jazyková podpora</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* AI Engine Section */}
        <section className="py-20 bg-gradient-to-r from-purple-50 to-blue-50 dark:from-secondary dark:to-card relative overflow-hidden">
          {/* Subtle animated background */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-30">
            <div className="absolute top-20 right-20 w-64 h-64 bg-purple-400/20 rounded-full blur-3xl animate-blob"></div>
            <div className="absolute bottom-20 left-20 w-64 h-64 bg-blue-400/20 rounded-full blur-3xl animate-blob animation-delay-4000"></div>
          </div>

          <div className="container px-4 mx-auto relative z-10">
            <div className="text-center mb-16 animate-fade-in-up">
              <Badge className="mb-4 bg-purple-100 dark:bg-accent text-purple-700 dark:text-primary border-purple-200 dark:border-border hover:scale-105 transition-transform duration-300">
                <Brain className="h-4 w-4 mr-2" />
                Proprietární AI technologie
              </Badge>
              <h2 className="text-4xl md:text-5xl font-bold mb-6 bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent" style={{ lineHeight: '1.4' }}>
                Pokročilý překladový engine
              </h2>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                Náš vlastní AI kombinuje sílu Google Gemini se specializovaným kontextovým výzkumem
                pro překlady, které rozumí nuancím, emocím a kulturnímu kontextu.
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-12 max-w-6xl mx-auto items-center">
              <div className="space-y-8">
                <div className="flex items-start gap-4">
                  <div className="bg-blue-100 dark:bg-accent p-3 rounded-lg">
                    <Brain className="h-6 w-6 text-blue-600 dark:text-primary" />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold mb-2">Google Gemini integrace</h3>
                    <p className="text-gray-600 dark:text-muted-foreground">
                      Využívá Gemini AI modely pro přirozené, lidské překlady, které zachycují původní význam a tón.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="bg-purple-100 dark:bg-accent p-3 rounded-lg">
                    <FileText className="h-6 w-6 text-purple-600 dark:text-primary" />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold mb-2">Kontextové porozumění</h3>
                    <p className="text-gray-600 dark:text-muted-foreground">
                      Analyzuje kontext titulků, vztahy mezi postavami a dynamiku scén pro přesnější překlady.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="bg-green-100 dark:bg-accent p-3 rounded-lg">
                    <Zap className="h-6 w-6 text-green-600 dark:text-primary" />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold mb-2">Zpracování v reálném čase</h3>
                    <p className="text-gray-600 dark:text-muted-foreground">
                      Bleskově rychlý překlad s inteligentním úpravou časování pro perfektní synchronizaci titulků.
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-card rounded-2xl p-8 shadow-2xl border">
                <div className="text-center mb-6">
                  <div className="bg-gradient-to-r from-primary to-primary/80 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Sparkles className="h-8 w-8 text-primary-foreground" />
                  </div>
                  <h3 className="text-2xl font-bold mb-2">Kvalita překladu</h3>
                  <p className="text-muted-foreground">Uvidíte rozdíl, který naše AI dělá</p>
                </div>

                <div className="space-y-4">
                  <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-4">
                    <p className="text-sm text-destructive font-medium mb-1">Základní překlad:</p>
                    <p className="text-sm text-muted-foreground">"I am very happy to see you"</p>
                  </div>
                  <div className="bg-primary/10 border border-primary/20 rounded-lg p-4">
                    <p className="text-sm text-primary font-medium mb-1">Náš AI překlad:</p>
                    <p className="text-sm text-muted-foreground">"Jsem naprosto nadšený, že tě vidím!"</p>
                  </div>
                </div>

                <div className="mt-6 text-center">
                  <Badge className="bg-gradient-to-r from-blue-500 to-purple-500 text-white">
                    <Star className="h-4 w-4 mr-1" />
                    95% míra přesnosti
                  </Badge>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="container px-4 py-20 mx-auto bg-background dark:bg-background">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">Proč si vybrat SubtitleAI?</h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Vše, co potřebujete pro profesionální překlad titulků, poháněno nejmodernější AI technologií.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 max-w-7xl mx-auto">
            <Card className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 group hover:scale-105 animate-fade-in-up">
              <CardHeader className="text-center pb-4">
                <div className="bg-primary/10 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 group-hover:rotate-12 transition-all duration-300">
                  <Zap className="h-8 w-8 text-primary" />
                </div>
                <CardTitle className="text-xl">Bleskově rychlé</CardTitle>
                <CardDescription className="text-base">
                  Přeložte celé soubory s titulky za méně než 30 sekund
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground text-center">
                  Naše optimalizované AI zpracuje vaše titulky rychle při zachování perfektního časování a kontextu.
                </p>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 group hover:scale-105 animate-fade-in-up animation-delay-300">
              <CardHeader className="text-center pb-4">
                <div className="bg-purple-100 dark:bg-accent w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 group-hover:rotate-12 transition-all duration-300">
                  <Brain className="h-8 w-8 text-purple-600 dark:text-primary" />
                </div>
                <CardTitle className="text-xl">Kontextové AI</CardTitle>
                <CardDescription className="text-base">
                  AI rozumí kontextu filmu pro lepší překlady
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground text-center">
                  Pokročilé AI modely zvažují tok dialogu, emoce postav a kulturní nuance.
                </p>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 group hover:scale-105 animate-fade-in-up animation-delay-300">
              <CardHeader className="text-center pb-4">
                <div className="bg-green-100 dark:bg-accent w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 group-hover:rotate-12 transition-all duration-300">
                  <FileText className="h-8 w-8 text-green-600 dark:text-primary" />
                </div>
                <CardTitle className="text-xl">7 formátů souborů</CardTitle>
                <CardDescription className="text-base">
                  Podpora všech hlavních formátů titulků
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap justify-center gap-1 mb-3">
                  <Badge variant="secondary" className="bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-300 text-xs">SRT</Badge>
                  <Badge variant="secondary" className="bg-green-50 text-green-700 dark:bg-green-950 dark:text-green-300 text-xs">VTT</Badge>
                  <Badge variant="secondary" className="bg-purple-50 text-purple-700 dark:bg-purple-950 dark:text-purple-300 text-xs">ASS</Badge>
                  <Badge variant="secondary" className="bg-orange-50 text-orange-700 dark:bg-orange-950 dark:text-orange-300 text-xs">SSA</Badge>
                  <Badge variant="secondary" className="bg-pink-50 text-pink-700 dark:bg-pink-950 dark:text-pink-300 text-xs">SUB</Badge>
                  <Badge variant="secondary" className="bg-indigo-50 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300 text-xs">SBV</Badge>
                  <Badge variant="secondary" className="bg-gray-50 text-gray-700 dark:bg-gray-950 dark:text-gray-300 text-xs">TXT</Badge>
                </div>
                <p className="text-muted-foreground text-center text-sm">
                  Auto-detekce • UTF-8 a starší kódování • Až 10MB
                </p>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 group hover:scale-105 animate-fade-in-up animation-delay-300">
              <CardHeader className="text-center pb-4">
                <div className="bg-primary/10 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 group-hover:rotate-12 transition-all duration-300">
                  <Gift className="h-8 w-8 text-primary" />
                </div>
                <CardTitle className="text-xl">Platba za použití</CardTitle>
                <CardDescription className="text-base">
                  Jednoduchý kreditový systém - žádné předplatné
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground text-center">
                  Kupte kredity jednou, používejte je navždy. Plaťte jen za to, co přeložíte s transparentními cenami.
                </p>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Powerful Features Section */}
        <section className="py-16 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-muted dark:to-accent">
          <div className="container px-4 mx-auto text-center">
            <h2 className="text-3xl font-bold mb-4">🚀 Výkonné funkce</h2>
            <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
              Vše, co potřebujete pro profesionální překlad titulků
            </p>

            <div className="grid md:grid-cols-4 gap-8 max-w-5xl mx-auto mb-8">
              <div className="text-center">
                <div className="w-12 h-12 bg-blue-100 dark:bg-accent rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl">📊</span>
                </div>
                <h3 className="font-semibold mb-2">Dávkové zpracování</h3>
                <p className="text-sm text-muted-foreground">
                  Nahrajte více souborů a přeložte je všechny najednou
                </p>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 bg-green-100 dark:bg-accent rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl">📺</span>
                </div>
                <h3 className="font-semibold mb-2">Titulkový overlay</h3>
                <p className="text-sm text-muted-foreground">
                  Zobrazujte titulky nad jakýmkoli videem s plným přizpůsobením
                </p>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 bg-purple-100 dark:bg-accent rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl">🌍</span>
                </div>
                <h3 className="font-semibold mb-2">100+ jazyků</h3>
                <p className="text-sm text-muted-foreground">
                  Podpora všech hlavních světových jazyků a dialektů
                </p>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 bg-orange-100 dark:bg-accent rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl">⚡</span>
                </div>
                <h3 className="font-semibold mb-2">Okamžitý překlad</h3>
                <p className="text-sm text-muted-foreground">
                  Rychlý AI překlad s kontextovým povědomím
                </p>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" asChild>
                <Link href="/cs/subtitles-search">Vyzkoušet Hledání Titulků</Link>
              </Button>
              <Button size="lg" variant="outline" asChild>
                <Link href="/cs/subtitle-editor">Vyzkoušet Editor Titulků</Link>
              </Button>
              <Button size="lg" variant="outline" asChild>
                <Link href="/cs/video-tools">Vyzkoušet plovoucí titulky</Link>
              </Button>
              <Button size="lg" variant="outline" asChild>
                <Link href="/cs/video-tools">Vyzkoušet video přehrávač</Link>
              </Button>
              <Button size="lg" variant="outline" asChild className="bg-gradient-to-r from-blue-50 to-purple-50 hover:from-blue-100 hover:to-purple-100 border-blue-200 text-blue-700 hover:text-blue-800 dark:from-blue-950 dark:to-purple-950 dark:border-blue-800 dark:text-blue-300 dark:hover:text-blue-200">
                <Link href="/cs/feedback" className="flex items-center gap-2">
                  <MessageSquare className="h-5 w-5" />
                  Sdílet Zpětnou Vazbu
                </Link>
              </Button>
            </div>
          </div>
        </section>

        {/* Subtitle Overlay Feature Section */}
        <section className="py-20 bg-gradient-to-br from-indigo-50 via-white to-cyan-50 dark:from-background dark:via-card dark:to-background">
          <div className="container px-4 mx-auto">
            <div className="max-w-6xl mx-auto">
              <div className="text-center mb-16">
                <Badge className="mb-4 bg-gradient-to-r from-indigo-500 to-cyan-500 text-white">
                  <span className="text-2xl mr-2">📺</span>
                  NOVÁ FUNKCE
                </Badge>
                <h2 className="text-4xl md:text-5xl font-bold mb-6 bg-gradient-to-r from-indigo-600 to-cyan-600 bg-clip-text text-transparent" style={{ lineHeight: '1.4' }}>
                  Titulkový overlay
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
                        <span className="text-2xl">��</span>
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
                        <span className="text-2xl">ÔĆ▒´ŞĆ</span>
                      </div>
                      <div>
                        <h3 className="text-xl font-semibold mb-2">Perfektní synchronizace</h3>
                        <p className="text-muted-foreground">
                          Dolaďte časování pomocí ovládání offsetu a rychlostních multiplikátorů.
                          Získejte perfektní synchronizaci s jakýmkoli video obsahem.
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start space-x-4">
                      <div className="bg-green-100 dark:bg-accent p-3 rounded-full">
                        <span className="text-2xl">🌍</span>
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
                      <img
                        src="/images/gladiator.webp"
                        alt="Gladiator movie scene - Russell Crowe as Maximus"
                        className="w-full h-full object-cover"
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

        {/* Credits System */}
        <section className="bg-muted/50 dark:bg-card py-16">
          <div className="container px-4 mx-auto text-center">
            <h2 className="text-3xl font-bold mb-4">💰 Kredity na Platbu za Použití</h2>
            <p className="text-muted-foreground mb-8">
              žádné měsíční předplatné. Plaťte jen za to, co použijete.
            </p>

            <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center justify-center space-x-2">
                    <span>Uvítací bonus</span>
                  </CardTitle>
                  <CardDescription>Začněte zdarma</CardDescription>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="text-3xl font-bold text-primary">100 Kreditů</div>
                  <div className="text-sm text-muted-foreground">Zdarma při registraci</div>
                </CardContent>
                <CardContent className="space-y-2">
                  <p>Ôťô ~250 řádků překladu</p>
                  <p>Ôťô Prémiový AI překlad</p>
                  <p>Ôťô žádný časový limit</p>
                  <p>Ôťô Přístup ke všem funkcím</p>
                </CardContent>
              </Card>

              <Card className="border-purple-500">
                <CardHeader>
                  <CardTitle className="flex items-center justify-center space-x-2">
                    <span>🎬</span>
                    <span>AI Překlad</span>
                  </CardTitle>
                  <CardDescription>Vyberte si mezi Standard a Premium kvalitou</CardDescription>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Standard (Gemini Flash)</span>
                      <span className="font-bold">0,5 kreditů</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Premium (Gemini Pro)</span>
                      <span className="font-bold">1,5 kreditů</span>
                    </div>
                  </div>
                  <div className="text-xs text-muted-foreground mt-2">za 20 řádků</div>
                </CardContent>
                <CardContent className="space-y-2">
                  <p>Ôťô Kontextový překlad</p>
                  <p>Ôťô Výzkum filmu/seriálu</p>
                  <p>Ôťô Kulturní adaptace</p>
                  <p>Ôťô Profesionální kvalita</p>
                </CardContent>
              </Card>
            </div>

            <div className="mt-8 space-y-4">
              <div className="text-sm text-muted-foreground">
                💵 <strong>1 USD = 100 kreditů</strong> • Kupte kredity podle potřeby • Bez vypršení
              </div>
              <Button size="lg" asChild>
                <Link href="/cs/register">Získat 100 Zdarma Kreditů</Link>
              </Button>
            </div>
          </div>
        </section>

        {/* Popup Window Feature Section */}
        <section className="py-20 bg-gradient-to-br from-green-50 via-white to-emerald-50 dark:from-background dark:via-card dark:to-background">
          <div className="container px-4 mx-auto">
            <div className="max-w-6xl mx-auto">
              <div className="text-center mb-16">
                <Badge className="mb-4 bg-gradient-to-r from-green-500 to-emerald-500 text-white">
                  <span className="text-2xl mr-2">🖥️</span>
                  ŽÁDNÁ INSTALACE POTŘEBA
                </Badge>
                <h2 className="text-4xl md:text-5xl font-bold mb-6 bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent" style={{ lineHeight: '1.4' }}>
                  Plovoucí titulky
                </h2>
                <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
                  Otevřete titulkové okno, které zůstává nad jakýmkoli videem. žádná rozšíření prohlížeče,
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
                        <h3 className="text-xl font-semibold mb-2">Okamžité nastavení</h3>
                        <p className="text-muted-foreground">
                          žádná rozšíření prohlížeče nebo software k instalaci. Funguje okamžitě
                          v jakémkoli moderním webovém prohlížeči.
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start space-x-4">
                      <div className="bg-emerald-100 dark:bg-accent p-3 rounded-full">
                        <span className="text-2xl">��</span>
                      </div>
                      <div>
                        <h3 className="text-xl font-semibold mb-2">Vždy nahoře</h3>
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
                        <h3 className="text-xl font-semibold mb-2">Průhledné pozadí</h3>
                        <p className="text-muted-foreground">
                          Čistý, průhledný overlay, který neruší vaše video.
                          Přizpůsobte barvy, písma a umístění.
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start space-x-4">
                      <div className="bg-cyan-100 dark:bg-accent p-3 rounded-full">
                        <span className="text-2xl">⚡</span>
                      </div>
                      <div>
                        <h3 className="text-xl font-semibold mb-2">Snadné umístění</h3>
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
                        <span className="text-xl">🖥️</span>
                        Vyzkoušet plovoucí titulky nyní
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
                        <img
                          src="/images/SouthPark.webp"
                          alt="South Park episode scene"
                          className="w-full h-full object-cover"
                        />
                      </div>
                    </div>

                    {/* Popup window mockup */}
                    <div className="absolute -top-4 -right-4 bg-black/90 backdrop-blur-sm rounded-lg p-4 shadow-2xl border-2 border-green-400">
                      <div className="text-white text-center text-sm font-medium">
                        Perfektní umístění titulků
                      </div>
                      <div className="text-xs text-green-400 mt-1 text-center">
                        → Popup Okno
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Video Player Feature Section */}
        <section className="py-20 bg-gradient-to-br from-purple-50 via-white to-pink-50 dark:from-background dark:via-card dark:to-background">
          <div className="container px-4 mx-auto">
            <div className="max-w-6xl mx-auto">
              <div className="text-center mb-16">
                <Badge className="mb-4 bg-gradient-to-r from-purple-500 to-pink-500 text-white">
                  <span className="text-2xl mr-2">🎬</span>
                  VŠE-V-JEDNOM ŘEŠENÍ
                </Badge>
                <h2 className="text-4xl md:text-5xl font-bold mb-6 bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent" style={{ lineHeight: '1.4' }}>
                  Integrovaný video přehrávač
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
                        <h3 className="text-xl font-semibold mb-2">Univerzální video podpora</h3>
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
                        <h3 className="text-xl font-semibold mb-2">Perfektní synchronizace</h3>
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
                        <h3 className="text-xl font-semibold mb-2">Kompletní přizpůsobení</h3>
                        <p className="text-muted-foreground">
                          Plná kontrola nad vzhledem titulků - písma, barvy, umístění,
                          průhlednost a efekty. Udělejte si je přesně podle svých představ.
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start space-x-4">
                      <div className="bg-cyan-100 dark:bg-accent p-3 rounded-full">
                        <span className="text-2xl">��</span>
                      </div>
                      <div>
                        <h3 className="text-xl font-semibold mb-2">Vše-v-jednom rozhraní</h3>
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
                      <img
                        src="/images/solo-leveling.jpeg"
                        alt="Solo Leveling anime scene"
                        className="w-full h-full object-cover"
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
      </div>
    </CzechHomeClient>
  );
}
