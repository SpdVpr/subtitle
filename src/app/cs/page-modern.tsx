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
  Languages,
  Star,
  MessageSquare,
  Play,
  Pause
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

export default function CzechHomeModern() {
  return (
    <CzechHomeClient>
      <StructuredData locale="cs" page="home" />
      <div className="flex flex-col min-h-screen overflow-hidden">

        {/* Hero Section - Modern 2025 Design */}
        <section className="relative min-h-[90vh] flex items-center overflow-hidden bg-gradient-to-br from-amber-50 via-orange-50 to-rose-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
          {/* Animated Background Blobs - Organic Shapes Trend */}
          <div className="absolute inset-0 overflow-hidden">
            <div className="absolute top-20 left-10 w-96 h-96 bg-gradient-to-br from-blue-400/20 to-purple-400/20 rounded-full blur-3xl animate-blob"></div>
            <div className="absolute top-40 right-20 w-96 h-96 bg-gradient-to-br from-pink-400/20 to-orange-400/20 rounded-full blur-3xl animate-blob animation-delay-2000"></div>
            <div className="absolute -bottom-20 left-1/3 w-96 h-96 bg-gradient-to-br from-green-400/20 to-blue-400/20 rounded-full blur-3xl animate-blob animation-delay-4000"></div>
          </div>

          <div className="container px-4 py-12 mx-auto relative z-10">
            <div className="max-w-7xl mx-auto">

              {/* Free Credits Badge - Micro-interaction */}
              <Link href="/cs/register" className="inline-block group mb-8">
                <div className="inline-flex items-center gap-3 bg-gradient-to-r from-emerald-500 via-green-500 to-teal-500 hover:from-emerald-600 hover:via-green-600 hover:to-teal-600 text-white px-8 py-4 rounded-full shadow-2xl hover:shadow-emerald-500/50 transition-all duration-500 cursor-pointer transform hover:scale-105 hover:-rotate-1">
                  <Gift className="h-6 w-6 animate-bounce" />
                  <span className="font-bold text-lg">🎁 100 KREDITŮ ZDARMA pro nové uživatele!</span>
                  <Sparkles className="h-6 w-6 animate-spin-slow" />
                </div>
              </Link>

              <div className="grid lg:grid-cols-2 gap-12 items-center">

                {/* Left Column - Content */}
                <div className="space-y-8 animate-fade-in-up">

                  {/* Supersized Title - 2025 Trend */}
                  <h1 className="text-6xl md:text-8xl font-black tracking-tight leading-none">
                    <span className="block bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent animate-gradient-x">
                      AI Překlad
                    </span>
                    <span className="block text-gray-900 dark:text-white mt-2">
                      Titulků
                    </span>
                    <span className="block text-5xl md:text-6xl mt-4 bg-gradient-to-r from-orange-500 to-red-500 bg-clip-text text-transparent">
                      v reálném čase
                    </span>
                  </h1>

                  <p className="text-xl md:text-2xl text-gray-700 dark:text-gray-300 leading-relaxed max-w-2xl">
                    Proprietární <span className="font-bold text-blue-600 dark:text-blue-400">AI engine</span> kombinující
                    <span className="font-bold text-purple-600 dark:text-purple-400"> Google Gemini + Kontextový výzkum</span> pro maximální kvalitu
                  </p>

                  {/* Key Features Pills - Animated */}
                  <div className="flex flex-wrap gap-3">
                    {[
                      { icon: CheckCircle, text: "100+ jazyků", color: "from-green-500 to-emerald-500" },
                      { icon: Brain, text: "Kontextové AI", color: "from-purple-500 to-pink-500" },
                      { icon: Zap, text: "Bez předplatného", color: "from-orange-500 to-red-500" },
                      { icon: Star, text: "Kredity nevyprší", color: "from-blue-500 to-cyan-500" }
                    ].map((feature, index) => (
                      <Badge
                        key={index}
                        className={`px-5 py-3 text-base font-semibold bg-gradient-to-r ${feature.color} text-white border-0 hover:scale-110 transition-transform duration-300 cursor-default shadow-lg`}
                        style={{ animationDelay: `${index * 100}ms` }}
                      >
                        <feature.icon className="h-5 w-5 mr-2" />
                        {feature.text}
                      </Badge>
                    ))}
                  </div>

                  {/* CTA Buttons - Bold & Modern */}
                  <div className="flex flex-col sm:flex-row gap-4 pt-4">
                    <Button
                      size="lg"
                      className="text-lg px-8 py-7 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-2xl hover:shadow-blue-500/50 transform hover:scale-105 transition-all duration-300 rounded-2xl font-bold"
                      asChild
                    >
                      <Link href="/cs/translate" className="flex items-center gap-3">
                        <Sparkles className="h-6 w-6" />
                        Začít Překládat ZDARMA
                        <ArrowRight className="h-6 w-6 group-hover:translate-x-2 transition-transform" />
                      </Link>
                    </Button>
                    <Button
                      variant="outline"
                      size="lg"
                      className="text-lg px-8 py-7 border-2 border-gray-900 dark:border-white hover:bg-gray-900 hover:text-white dark:hover:bg-white dark:hover:text-gray-900 transition-all duration-300 rounded-2xl font-bold"
                      asChild
                    >
                      <Link href="/cs/pricing" className="flex items-center gap-3">
                        <Gift className="h-6 w-6" />
                        Zobrazit Ceny
                      </Link>
                    </Button>
                  </div>

                  {/* Trust Indicators - Animated */}
                  <div className="flex flex-wrap items-center gap-6 pt-4 text-gray-600 dark:text-gray-400">
                    {[
                      { icon: Star, text: "Gemini Pro model" },
                      { icon: Zap, text: "Okamžité zpracování" },
                      { icon: Globe, text: "Globální podpora" }
                    ].map((item, index) => (
                      <div key={index} className="flex items-center gap-2 hover:text-gray-900 dark:hover:text-white transition-colors duration-300">
                        <item.icon className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                        <span className="text-sm font-medium">{item.text}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Right Column - Interactive Demo */}
                <div className="relative animate-fade-in-up animation-delay-300">

                  {/* 3D Card Effect - Modern Glassmorphism */}
                  <div className="relative group">
                    <div className="absolute -inset-1 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 rounded-3xl blur-xl opacity-75 group-hover:opacity-100 transition duration-1000 group-hover:duration-200 animate-tilt"></div>

                    <div className="relative bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl border border-white/20 rounded-3xl p-8 shadow-2xl">
                      <div className="flex items-center justify-between mb-6">
                        <div className="flex items-center gap-3">
                          <Languages className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                          <span className="font-bold text-lg text-gray-900 dark:text-white">Live Překlad</span>
                        </div>
                        <Badge className="bg-green-500 text-white animate-pulse">
                          <div className="w-2 h-2 bg-white rounded-full mr-2"></div>
                          LIVE
                        </Badge>
                      </div>

                      {/* Translation Demo - Animated */}
                      <div className="space-y-4">
                        {/* Original */}
                        <div className="space-y-2 transform hover:scale-105 transition-transform duration-300">
                          <div className="flex items-center gap-2">
                            <div className="w-8 h-5 bg-gradient-to-r from-red-500 to-red-600 rounded flex items-center justify-center shadow-lg">
                              <span className="text-white text-xs font-bold">EN</span>
                            </div>
                            <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">Originál</span>
                          </div>
                          <div className="bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-700 rounded-xl p-4 border-l-4 border-red-500 shadow-md hover:shadow-xl transition-shadow duration-300">
                            <div className="text-xs text-gray-500 dark:text-gray-400 font-mono mb-2">00:02:15 → 00:02:18</div>
                            <div className="text-base font-medium text-gray-900 dark:text-gray-100">This algorithm looks impossible to solve.</div>
                          </div>
                        </div>

                        {/* Arrow with Animation */}
                        <div className="flex justify-center py-2">
                          <div className="flex flex-col items-center">
                            <ArrowRight className="h-8 w-8 text-blue-500 dark:text-blue-400 animate-pulse rotate-90" />
                            <span className="text-xs text-blue-600 dark:text-blue-400 font-bold mt-1 animate-pulse">AI PŘEKLAD</span>
                          </div>
                        </div>

                        {/* Translated */}
                        <div className="space-y-2 transform hover:scale-105 transition-transform duration-300">
                          <div className="flex items-center gap-2">
                            <div className="w-8 h-5 bg-gradient-to-r from-blue-600 to-blue-700 rounded flex items-center justify-center shadow-lg">
                              <span className="text-white text-xs font-bold">CZ</span>
                            </div>
                            <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">Přeloženo</span>
                          </div>
                          <div className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-950 dark:to-purple-950 rounded-xl p-4 border-l-4 border-blue-600 shadow-md hover:shadow-xl transition-shadow duration-300">
                            <div className="text-xs text-gray-500 dark:text-gray-400 font-mono mb-2">00:02:15 → 00:02:18</div>
                            <div className="text-base font-medium text-gray-900 dark:text-blue-100">Tento algoritmus vypadá neřešitelně.</div>
                          </div>
                        </div>
                      </div>

                      {/* Bottom Stats */}
                      <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
                        <div className="flex items-center justify-between text-sm">
                          <span className="font-semibold text-green-600 dark:text-green-400">✓ Perfektní časování</span>
                          <span className="font-semibold text-purple-600 dark:text-purple-400">✓ Přirozený překlad</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Scroll Indicator - Micro-animation */}
          <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce">
            <div className="w-6 h-10 border-2 border-gray-400 dark:border-gray-600 rounded-full flex justify-center">
              <div className="w-1 h-3 bg-gray-600 dark:bg-gray-400 rounded-full mt-2 animate-scroll"></div>
            </div>
          </div>
        </section>

        {/* AI Engine Section - Brutalism meets Modern */}
        <section className="py-24 bg-white dark:bg-gray-950 relative overflow-hidden">
          {/* Background Pattern */}
          <div className="absolute inset-0 opacity-5">
            <div className="absolute inset-0" style={{
              backgroundImage: `repeating-linear-gradient(45deg, transparent, transparent 35px, rgba(0,0,0,.1) 35px, rgba(0,0,0,.1) 70px)`
            }}></div>
          </div>

          <div className="container px-4 mx-auto relative z-10">
            <div className="text-center mb-16 space-y-6">
              <Badge className="mb-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white text-base px-6 py-3 hover:scale-110 transition-transform duration-300">
                <Brain className="h-5 w-5 mr-2" />
                Proprietární AI Technologie
              </Badge>

              {/* Bold Typography - 2025 Trend */}
              <h2 className="text-5xl md:text-7xl font-black leading-tight">
                <span className="block text-gray-900 dark:text-white">Pokročilý</span>
                <span className="block bg-gradient-to-r from-purple-600 via-pink-600 to-orange-600 bg-clip-text text-transparent">
                  Překladový Engine
                </span>
              </h2>

              <p className="text-xl md:text-2xl text-gray-600 dark:text-gray-400 max-w-3xl mx-auto leading-relaxed">
                Kombinace <span className="font-bold text-purple-600 dark:text-purple-400">Google Gemini</span> se specializovaným
                <span className="font-bold text-pink-600 dark:text-pink-400"> kontextovým výzkumem</span>
              </p>
            </div>

            <div className="grid lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
              {[
                {
                  icon: Brain,
                  title: "Google Gemini Integrace",
                  description: "Gemini AI modely pro přirozené, lidské překlady zachycující původní význam a tón",
                  gradient: "from-blue-500 to-cyan-500",
                  delay: "0"
                },
                {
                  icon: FileText,
                  title: "Kontextový Výzkum",
                  description: "Analýza kontextu titulků, vztahů mezi postavami a dynamiky scén",
                  gradient: "from-purple-500 to-pink-500",
                  delay: "100"
                },
                {
                  icon: Zap,
                  title: "Real-time Zpracování",
                  description: "Bleskově rychlý překlad s inteligentní úpravou časování",
                  gradient: "from-orange-500 to-red-500",
                  delay: "200"
                }
              ].map((feature, index) => (
                <Card
                  key={index}
                  className="group relative overflow-hidden border-2 hover:border-transparent transition-all duration-500 hover:scale-105 hover:-rotate-1 bg-white dark:bg-gray-900"
                  style={{ animationDelay: `${feature.delay}ms` }}
                >
                  {/* Gradient Border Effect */}
                  <div className={`absolute inset-0 bg-gradient-to-br ${feature.gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-500 -z-10`}></div>
                  <div className="absolute inset-[2px] bg-white dark:bg-gray-900 rounded-lg z-0"></div>

                  <CardHeader className="relative z-10">
                    <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${feature.gradient} flex items-center justify-center mb-4 group-hover:scale-110 group-hover:rotate-12 transition-all duration-500 shadow-lg`}>
                      <feature.icon className="h-8 w-8 text-white" />
                    </div>
                    <CardTitle className="text-2xl font-bold text-gray-900 dark:text-white group-hover:text-transparent group-hover:bg-gradient-to-r group-hover:bg-clip-text group-hover:from-purple-600 group-hover:to-pink-600 transition-all duration-300">
                      {feature.title}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="relative z-10">
                    <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                      {feature.description}
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Quality Comparison - Interactive Element */}
            <div className="mt-20 max-w-4xl mx-auto">
              <div className="bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 rounded-3xl p-8 md:p-12 shadow-2xl border border-gray-200 dark:border-gray-700">
                <div className="text-center mb-8">
                  <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-purple-600 to-pink-600 mb-4 shadow-lg">
                    <Sparkles className="h-10 w-10 text-white" />
                  </div>
                  <h3 className="text-3xl font-bold mb-2 text-gray-900 dark:text-white">Kvalita Překladu</h3>
                  <p className="text-gray-600 dark:text-gray-400">Uvidíte rozdíl, který naše AI dělá</p>
                </div>

                <div className="space-y-6">
                  <div className="bg-red-50 dark:bg-red-950/30 border-2 border-red-200 dark:border-red-800 rounded-2xl p-6 transform hover:scale-105 transition-transform duration-300">
                    <p className="text-sm font-bold text-red-600 dark:text-red-400 mb-2 flex items-center gap-2">
                      <span className="text-2xl">❌</span> Základní překlad:
                    </p>
                    <p className="text-gray-700 dark:text-gray-300 text-lg">"I am very happy to see you"</p>
                  </div>

                  <div className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-950/30 dark:to-emerald-950/30 border-2 border-green-200 dark:border-green-800 rounded-2xl p-6 transform hover:scale-105 transition-transform duration-300 shadow-lg">
                    <p className="text-sm font-bold text-green-600 dark:text-green-400 mb-2 flex items-center gap-2">
                      <span className="text-2xl">✨</span> Náš AI překlad:
                    </p>
                    <p className="text-gray-900 dark:text-gray-100 text-lg font-semibold">"Jsem naprosto nadšený, že tě vidím!"</p>
                  </div>
                </div>

                <div className="mt-8 text-center">
                  <Badge className="bg-gradient-to-r from-green-500 to-emerald-500 text-white text-base px-6 py-3 shadow-lg">
                    <Star className="h-5 w-5 mr-2" />
                    95% míra přesnosti
                  </Badge>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section - Card Grid with Hover Effects */}
        <section className="py-24 bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-950">
          <div className="container px-4 mx-auto">
            <div className="text-center mb-16 space-y-6">
              <h2 className="text-5xl md:text-7xl font-black text-gray-900 dark:text-white">
                Proč SubtitleBot?
              </h2>
              <p className="text-xl text-gray-600 dark:text-gray-400 max-w-3xl mx-auto">
                Vše pro profesionální překlad titulků s nejmodernější AI
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-7xl mx-auto">
              {[
                {
                  icon: Zap,
                  title: "Bleskově Rychlé",
                  description: "Celé soubory za méně než 30 sekund",
                  detail: "Optimalizované AI zachovává perfektní časování",
                  gradient: "from-yellow-400 to-orange-500"
                },
                {
                  icon: Brain,
                  title: "Kontextové AI",
                  description: "AI rozumí kontextu filmu",
                  detail: "Zvažuje tok dialogu, emoce a kulturní nuance",
                  gradient: "from-purple-400 to-pink-500"
                },
                {
                  icon: FileText,
                  title: "7 Formátů",
                  description: "Všechny hlavní formáty titulků",
                  detail: "SRT, VTT, ASS, SSA, SUB, SBV, TXT",
                  gradient: "from-green-400 to-emerald-500"
                },
                {
                  icon: Gift,
                  title: "Bez Předplatného",
                  description: "Jednoduchý kreditový systém",
                  detail: "Kupte jednou, používejte navždy",
                  gradient: "from-blue-400 to-cyan-500"
                }
              ].map((feature, index) => (
                <Card
                  key={index}
                  className="group relative overflow-hidden border-0 shadow-xl hover:shadow-2xl transition-all duration-500 hover:scale-105 bg-white dark:bg-gray-900"
                >
                  {/* Animated Gradient Background */}
                  <div className={`absolute inset-0 bg-gradient-to-br ${feature.gradient} opacity-0 group-hover:opacity-10 transition-opacity duration-500`}></div>

                  <CardHeader className="text-center relative z-10">
                    <div className={`w-20 h-20 rounded-full bg-gradient-to-br ${feature.gradient} flex items-center justify-center mx-auto mb-4 group-hover:scale-110 group-hover:rotate-12 transition-all duration-500 shadow-lg`}>
                      <feature.icon className="h-10 w-10 text-white" />
                    </div>
                    <CardTitle className="text-xl font-bold text-gray-900 dark:text-white">
                      {feature.title}
                    </CardTitle>
                    <CardDescription className="text-base font-semibold text-gray-700 dark:text-gray-300">
                      {feature.description}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="text-center relative z-10">
                    <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed">
                      {feature.detail}
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Video Tools Section - Immersive with Video Trend */}
        <section className="py-24 bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 dark:from-gray-950 dark:via-purple-950/20 dark:to-pink-950/20 relative overflow-hidden">
          {/* Animated Background Elements */}
          <div className="absolute inset-0 overflow-hidden opacity-30">
            <div className="absolute top-0 left-1/4 w-64 h-64 bg-purple-400 rounded-full blur-3xl animate-pulse"></div>
            <div className="absolute bottom-0 right-1/4 w-64 h-64 bg-pink-400 rounded-full blur-3xl animate-pulse animation-delay-2000"></div>
          </div>

          <div className="container px-4 mx-auto relative z-10">
            <div className="max-w-6xl mx-auto">

              <div className="text-center mb-16 space-y-6">
                <Badge className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white text-base px-6 py-3 hover:scale-110 transition-transform duration-300">
                  <Play className="h-5 w-5 mr-2" />
                  NOVÉ FUNKCE 2025
                </Badge>

                <h2 className="text-5xl md:text-7xl font-black leading-tight">
                  <span className="block text-gray-900 dark:text-white">Pokročilé</span>
                  <span className="block bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
                    Video Nástroje
                  </span>
                </h2>

                <p className="text-xl text-gray-600 dark:text-gray-400 max-w-3xl mx-auto">
                  Titulkový overlay, plovoucí okna a integrovaný přehrávač
                </p>
              </div>

              <div className="grid lg:grid-cols-3 gap-8">
                {[
                  {
                    icon: "📺",
                    title: "Titulkový Overlay",
                    description: "Zobrazujte titulky nad jakýmkoli videem",
                    features: ["Plné přizpůsobení", "Přetažení & umístění", "Perfektní synchronizace"],
                    link: "/cs/subtitle-editor",
                    gradient: "from-indigo-500 to-purple-500"
                  },
                  {
                    icon: "🖥️",
                    title: "Plovoucí Titulky",
                    description: "Okno které zůstává vždy nahoře",
                    features: ["Žádná instalace", "Průhledné pozadí", "Snadné umístění"],
                    link: "/cs/video-tools",
                    gradient: "from-purple-500 to-pink-500"
                  },
                  {
                    icon: "🎬",
                    title: "Video Přehrávač",
                    description: "Vše-v-jednom řešení",
                    features: ["YouTube & Vimeo", "Perfektní sync", "Kompletní přizpůsobení"],
                    link: "/cs/video-tools",
                    gradient: "from-pink-500 to-red-500"
                  }
                ].map((tool, index) => (
                  <Card
                    key={index}
                    className="group relative overflow-hidden border-0 shadow-2xl hover:shadow-purple-500/50 transition-all duration-500 hover:scale-105 hover:-rotate-1 bg-white dark:bg-gray-900"
                  >
                    {/* Gradient Glow Effect */}
                    <div className={`absolute inset-0 bg-gradient-to-br ${tool.gradient} opacity-0 group-hover:opacity-20 transition-opacity duration-500`}></div>

                    <CardHeader className="relative z-10">
                      <div className="text-6xl mb-4 group-hover:scale-125 group-hover:rotate-12 transition-all duration-500">
                        {tool.icon}
                      </div>
                      <CardTitle className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                        {tool.title}
                      </CardTitle>
                      <CardDescription className="text-base text-gray-600 dark:text-gray-400">
                        {tool.description}
                      </CardDescription>
                    </CardHeader>

                    <CardContent className="relative z-10 space-y-4">
                      <ul className="space-y-2">
                        {tool.features.map((feature, idx) => (
                          <li key={idx} className="flex items-center gap-2 text-gray-700 dark:text-gray-300">
                            <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0" />
                            <span>{feature}</span>
                          </li>
                        ))}
                      </ul>

                      <Button
                        className={`w-full bg-gradient-to-r ${tool.gradient} hover:opacity-90 text-white font-bold py-6 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300`}
                        asChild
                      >
                        <Link href={tool.link} className="flex items-center justify-center gap-2">
                          Vyzkoušet Nyní
                          <ArrowRight className="h-5 w-5 group-hover:translate-x-2 transition-transform" />
                        </Link>
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {/* Additional Tools */}
              <div className="mt-16 text-center space-y-6">
                <h3 className="text-3xl font-bold text-gray-900 dark:text-white">Další Nástroje</h3>
                <div className="flex flex-wrap justify-center gap-4">
                  <Button size="lg" variant="outline" className="border-2 hover:scale-105 transition-transform" asChild>
                    <Link href="/cs/subtitles-search">🔍 Hledání Titulků</Link>
                  </Button>
                  <Button size="lg" variant="outline" className="border-2 hover:scale-105 transition-transform" asChild>
                    <Link href="/cs/subtitle-editor">✏️ Editor Titulků</Link>
                  </Button>
                  <Button size="lg" variant="outline" className="border-2 hover:scale-105 transition-transform bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-950 dark:to-purple-950" asChild>
                    <Link href="/cs/feedback" className="flex items-center gap-2">
                      <MessageSquare className="h-5 w-5" />
                      Sdílet Zpětnou Vazbu
                    </Link>
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Pricing Section - Modern Card Design */}
        <section className="py-24 bg-white dark:bg-gray-950">
          <div className="container px-4 mx-auto">
            <div className="text-center mb-16 space-y-6">
              <h2 className="text-5xl md:text-7xl font-black">
                <span className="block text-gray-900 dark:text-white">Kredity na</span>
                <span className="block bg-gradient-to-r from-green-600 via-emerald-600 to-teal-600 bg-clip-text text-transparent">
                  Platbu za Použití
                </span>
              </h2>
              <p className="text-xl text-gray-600 dark:text-gray-400">
                Žádné předplatné. Plaťte jen za to, co použijete.
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
              {/* Free Credits Card */}
              <Card className="relative overflow-hidden border-2 border-green-200 dark:border-green-800 shadow-2xl hover:shadow-green-500/50 transition-all duration-500 hover:scale-105 bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950/30 dark:to-emerald-950/30">
                <div className="absolute top-0 right-0 w-32 h-32 bg-green-500 rounded-full blur-3xl opacity-20"></div>

                <CardHeader className="relative z-10">
                  <div className="text-5xl mb-4">🎁</div>
                  <CardTitle className="text-3xl font-bold text-gray-900 dark:text-white">
                    Uvítací Bonus
                  </CardTitle>
                  <CardDescription className="text-lg text-gray-700 dark:text-gray-300">
                    Začněte zdarma
                  </CardDescription>
                </CardHeader>

                <CardContent className="relative z-10 space-y-6">
                  <div className="text-center py-6">
                    <div className="text-6xl font-black text-green-600 dark:text-green-400">100</div>
                    <div className="text-xl text-gray-600 dark:text-gray-400 mt-2">Kreditů Zdarma</div>
                  </div>

                  <ul className="space-y-3">
                    {["~250 řádků překladu", "Prémiový AI překlad", "Žádný časový limit", "Přístup ke všem funkcím"].map((feature, idx) => (
                      <li key={idx} className="flex items-center gap-3 text-gray-700 dark:text-gray-300">
                        <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0" />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>

                  <Button className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-bold py-6 rounded-xl shadow-lg text-lg" asChild>
                    <Link href="/cs/register">Získat Zdarma Kredity</Link>
                  </Button>
                </CardContent>
              </Card>

              {/* Premium Translation Card */}
              <Card className="relative overflow-hidden border-2 border-purple-200 dark:border-purple-800 shadow-2xl hover:shadow-purple-500/50 transition-all duration-500 hover:scale-105 bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-950/30 dark:to-pink-950/30">
                <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500 rounded-full blur-3xl opacity-20"></div>

                <CardHeader className="relative z-10">
                  <div className="text-5xl mb-4">🎬</div>
                  <CardTitle className="text-3xl font-bold text-gray-900 dark:text-white">
                    Prémiový Překlad
                  </CardTitle>
                  <CardDescription className="text-lg text-gray-700 dark:text-gray-300">
                    Google Gemini + Kontextový výzkum
                  </CardDescription>
                </CardHeader>

                <CardContent className="relative z-10 space-y-6">
                  <div className="text-center py-6">
                    <div className="text-6xl font-black text-purple-600 dark:text-purple-400">~0,4</div>
                    <div className="text-xl text-gray-600 dark:text-gray-400 mt-2">kreditů za 20 řádků</div>
                  </div>

                  <ul className="space-y-3">
                    {["Kontextový překlad", "Výzkum filmu/seriálu", "Kulturní adaptace", "Profesionální kvalita"].map((feature, idx) => (
                      <li key={idx} className="flex items-center gap-3 text-gray-700 dark:text-gray-300">
                        <CheckCircle className="h-5 w-5 text-purple-500 flex-shrink-0" />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>

                  <Button className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-bold py-6 rounded-xl shadow-lg text-lg" asChild>
                    <Link href="/cs/pricing">Zobrazit Balíčky</Link>
                  </Button>
                </CardContent>
              </Card>
            </div>

            {/* Pricing Info */}
            <div className="mt-12 text-center space-y-4">
              <p className="text-lg text-gray-600 dark:text-gray-400">
                💵 <strong className="text-gray-900 dark:text-white">1 USD = 100 kreditů</strong> • Kupte podle potřeby • Bez vypršení
              </p>
            </div>
          </div>
        </section>

        {/* Final CTA Section - Bold & Eye-catching */}
        <section className="py-24 bg-gradient-to-br from-blue-600 via-purple-600 to-pink-600 relative overflow-hidden">
          {/* Animated Background */}
          <div className="absolute inset-0 overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-full opacity-20">
              <div className="absolute top-20 left-20 w-64 h-64 bg-white rounded-full blur-3xl animate-blob"></div>
              <div className="absolute top-40 right-20 w-64 h-64 bg-white rounded-full blur-3xl animate-blob animation-delay-2000"></div>
              <div className="absolute bottom-20 left-1/2 w-64 h-64 bg-white rounded-full blur-3xl animate-blob animation-delay-4000"></div>
            </div>
          </div>

          <div className="container px-4 mx-auto relative z-10">
            <div className="max-w-4xl mx-auto text-center space-y-8">
              <h2 className="text-5xl md:text-7xl font-black text-white leading-tight">
                Připraveni začít?
              </h2>
              <p className="text-xl md:text-2xl text-white/90 leading-relaxed">
                Získejte <span className="font-bold">100 kreditů zdarma</span> a vyzkoušejte nejlepší AI překladač titulků
              </p>

              <div className="flex flex-col sm:flex-row gap-6 justify-center pt-8">
                <Button
                  size="lg"
                  className="text-xl px-12 py-8 bg-white text-purple-600 hover:bg-gray-100 shadow-2xl hover:shadow-white/50 transform hover:scale-110 transition-all duration-300 rounded-2xl font-black"
                  asChild
                >
                  <Link href="/cs/register" className="flex items-center gap-3">
                    <Gift className="h-7 w-7" />
                    Začít Zdarma
                    <ArrowRight className="h-7 w-7" />
                  </Link>
                </Button>

                <Button
                  size="lg"
                  variant="outline"
                  className="text-xl px-12 py-8 border-4 border-white text-white hover:bg-white hover:text-purple-600 shadow-2xl transform hover:scale-110 transition-all duration-300 rounded-2xl font-black"
                  asChild
                >
                  <Link href="/cs/translate" className="flex items-center gap-3">
                    <Sparkles className="h-7 w-7" />
                    Vyzkoušet Demo
                  </Link>
                </Button>
              </div>

              {/* Trust Badges */}
              <div className="pt-12 flex flex-wrap justify-center items-center gap-8 text-white/80">
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-6 w-6" />
                  <span className="font-semibold">Bez kreditní karty</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-6 w-6" />
                  <span className="font-semibold">100 kreditů zdarma</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-6 w-6" />
                  <span className="font-semibold">Okamžitý přístup</span>
                </div>
              </div>
            </div>
          </div>
        </section>

      </div>
    </CzechHomeClient>
  );
}

