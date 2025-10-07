'use client'

import Link from "next/link";
import { StructuredData } from "@/components/seo/structured-data";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/hooks/useAuth";
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

export default function CzechHome() {
  const { loading } = useAuth()

  // Show loading state while checking auth
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Na─Ź├şt├ín├ş...</p>
        </div>
      </div>
    )
  }

  return (
    <>
      <StructuredData locale="cs" page="home" />
      <div className="flex flex-col min-h-screen">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-background dark:via-card dark:to-background">
        <div className="absolute inset-0 bg-grid-pattern opacity-5"></div>
        <div className="container px-4 py-24 mx-auto text-center relative">
          <div className="max-w-5xl mx-auto">
            {/* Free Credits Badge */}
            <Link href="/cs/register" className="inline-block">
              <div className="inline-flex items-center gap-2 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white px-6 py-3 rounded-full mb-8 shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer transform hover:scale-105">
                <Gift className="h-5 w-5" />
                <span className="font-semibold">­čÄë Nov├ş u┼żivatel├ę z├şskaj├ş 100 ZDARMA kredit┼» na za─Ź├ítek!</span>
                <Sparkles className="h-5 w-5" />
              </div>
            </Link>

            <h1 className="text-5xl md:text-7xl font-bold tracking-tight mb-6 bg-gradient-to-r from-blue-600 via-purple-600 to-blue-800 bg-clip-text text-transparent">
              AI P┼Öeklad Titulk┼»
            </h1>

            <p className="text-xl md:text-2xl text-gray-600 dark:text-muted-foreground mb-8 max-w-3xl mx-auto leading-relaxed">
              P┼Öelo┼żte sv├ę titulky pomoc├ş na┼íeho <span className="font-semibold text-blue-600 dark:text-primary">propriet├írn├şho AI enginu</span>, kter├Ż kombinuje
              <span className="font-semibold text-purple-600 dark:text-primary"> OpenAI + Kontextov├Ż V├Żzkum</span> pro maxim├íln├ş kvalitu p┼Öekladu.
            </p>

            {/* Key Features Pills */}
            <div className="flex flex-wrap justify-center gap-3 mb-10">
              <Badge variant="secondary" className="px-4 py-2 text-sm">
                <CheckCircle className="h-4 w-4 mr-2 text-green-500" />
                100+ Jazykov├Żch P├ír┼»
              </Badge>
              <Badge variant="secondary" className="px-4 py-2 text-sm">
                <CheckCircle className="h-4 w-4 mr-2 text-green-500" />
                Kontextov├ę AI
              </Badge>
              <Badge variant="secondary" className="px-4 py-2 text-sm">
                <CheckCircle className="h-4 w-4 mr-2 text-green-500" />
                ┼Ż├ídn├ę P┼Öedplatn├ę
              </Badge>
              <Badge variant="secondary" className="px-4 py-2 text-sm">
                <CheckCircle className="h-4 w-4 mr-2 text-green-500" />
                Kredity Nikdy Nevypr┼í├ş
              </Badge>
            </div>

            {/* Live Translation Demo */}
            <div className="bg-white/80 backdrop-blur-sm border border-blue-200 rounded-2xl p-6 mb-10 max-w-4xl mx-auto shadow-xl dark:bg-card/80 dark:border-border dark:backdrop-blur-sm">
              <div className="flex items-center justify-center gap-2 mb-6">
                <Languages className="h-5 w-5 text-blue-600 dark:text-primary" />
                <span className="font-semibold text-gray-800 dark:text-card-foreground">Pod├şvejte se na p┼Öeklad v akci</span>
              </div>

              {/* Translation Demo */}
              <div className="flex flex-col lg:flex-row gap-6 items-start">
                {/* Original English */}
                <div className="flex-1 space-y-3">
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-6 h-4 bg-red-500 rounded-sm flex items-center justify-center">
                      <span className="text-white text-xs font-bold">EN</span>
                    </div>
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Origin├íl v angli─Źtin─Ť</span>
                  </div>

                  <div className="space-y-2">
                    <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-3 border-l-4 border-red-500">
                      <div className="text-xs text-gray-500 dark:text-gray-400 font-mono mb-1">00:02:15,340 Ôćĺ 00:02:18,720</div>
                      <div className="text-sm text-gray-800 dark:text-gray-200">This algorithm looks impossible to solve.</div>
                    </div>

                    <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-3 border-l-4 border-red-500">
                      <div className="text-xs text-gray-500 dark:text-gray-400 font-mono mb-1">00:02:19,180 Ôćĺ 00:02:22,560</div>
                      <div className="text-sm text-gray-800 dark:text-gray-200">It's a piece of cake for David.</div>
                    </div>

                    <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-3 border-l-4 border-red-500">
                      <div className="text-xs text-gray-500 dark:text-gray-400 font-mono mb-1">00:02:23,890 Ôćĺ 00:02:26,450</div>
                      <div className="text-sm text-gray-800 dark:text-gray-200">He's been coding since he was twelve.</div>
                    </div>
                  </div>
                </div>

                {/* Arrow - Desktop */}
                <div className="hidden lg:flex items-center justify-center px-4">
                  <div className="flex flex-col items-center">
                    <ArrowRight className="h-8 w-8 text-blue-500 dark:text-primary animate-pulse" />
                    <span className="text-xs text-blue-600 dark:text-primary font-medium mt-1">AI P┼Öeklad</span>
                  </div>
                </div>

                {/* Arrow - Mobile/Tablet */}
                <div className="lg:hidden flex items-center justify-center py-4 w-full">
                  <div className="flex items-center">
                    <ArrowDown className="h-6 w-6 text-blue-500 dark:text-primary animate-bounce" />
                    <span className="text-xs text-blue-600 dark:text-primary font-medium ml-2">AI P┼Öeklad</span>
                  </div>
                </div>

                {/* Translated Czech */}
                <div className="flex-1 space-y-3">
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-6 h-4 bg-blue-600 rounded-sm flex items-center justify-center">
                      <span className="text-white text-xs font-bold">CZ</span>
                    </div>
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">P┼Öelo┼żeno do ─Źe┼ítiny</span>
                  </div>

                  <div className="space-y-2">
                    <div className="bg-blue-50 dark:bg-blue-950 rounded-lg p-3 border-l-4 border-blue-600">
                      <div className="text-xs text-gray-500 dark:text-gray-400 font-mono mb-1">00:02:15,340 Ôćĺ 00:02:18,720</div>
                      <div className="text-sm text-gray-800 dark:text-blue-200">Tento algoritmus vypad├í ne┼Öe┼íiteln─Ť.</div>
                    </div>

                    <div className="bg-blue-50 dark:bg-blue-950 rounded-lg p-3 border-l-4 border-blue-600">
                      <div className="text-xs text-gray-500 dark:text-gray-400 font-mono mb-1">00:02:19,180 Ôćĺ 00:02:22,560</div>
                      <div className="text-sm text-gray-800 dark:text-blue-200">Pro Davida je to hra─Źka.</div>
                    </div>

                    <div className="bg-blue-50 dark:bg-blue-950 rounded-lg p-3 border-l-4 border-blue-600">
                      <div className="text-xs text-gray-500 dark:text-gray-400 font-mono mb-1">00:02:23,890 Ôćĺ 00:02:26,450</div>
                      <div className="text-sm text-gray-800 dark:text-blue-200">Programuje u┼ż od dvan├ícti let.</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Bottom Info */}
              <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
                <p className="text-center text-sm text-gray-600 dark:text-muted-foreground">
                  <span className="font-medium text-blue-600 dark:text-primary">Perfektn├ş ─Źasov├ín├ş zachov├íno</span> ÔÇó
                  <span className="font-medium text-green-600 dark:text-green-400"> P┼Öirozen├ę p┼Öeklady</span> ÔÇó
                  <span className="font-medium text-purple-600 dark:text-purple-400"> Podpora 40+ jazyk┼»</span>
                </p>
              </div>
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" className="bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 text-primary-foreground shadow-lg" asChild>
                <Link href="/cs/translate" className="flex items-center gap-2">
                  <Sparkles className="h-5 w-5" />
                  Za─Ź├şt P┼Öekl├ídat ZDARMA
                  <ArrowRight className="h-5 w-5" />
                </Link>
              </Button>
              <Button variant="outline" size="lg" asChild>
                <Link href="/cs/pricing" className="flex items-center gap-2">
                  <Gift className="h-5 w-5" />
                  Zobrazit Bal├ş─Źky Kredit┼»
                </Link>
              </Button>
            </div>

            {/* Trust Indicators */}
            <div className="mt-12 flex flex-wrap justify-center items-center gap-8 text-gray-600 dark:text-muted-foreground">
              <div className="flex items-center gap-2">
                <Star className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                <span className="text-sm">Pr├ęmiov├í AI Kvalita</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-green-500 dark:text-green-400" />
                <span className="text-sm">Okam┼żit├ę Zpracov├ín├ş</span>
              </div>
              <div className="flex items-center gap-2">
                <Globe className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                <span className="text-sm">Glob├íln├ş Jazykov├í Podpora</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* AI Engine Section */}
      <section className="py-20 bg-gradient-to-r from-purple-50 to-blue-50 dark:from-secondary dark:to-card">
        <div className="container px-4 mx-auto">
          <div className="text-center mb-16">
            <Badge className="mb-4 bg-purple-100 dark:bg-accent text-purple-700 dark:text-primary border-purple-200 dark:border-border">
              <Brain className="h-4 w-4 mr-2" />
              Propriet├írn├ş AI Technologie
            </Badge>
            <h2 className="text-4xl md:text-5xl font-bold mb-6 bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent" style={{ lineHeight: '1.4' }}>
              Pokro─Źil├Ż P┼Öekladov├Ż Engine
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              N├í┼í vlastn├ş AI kombinuje s├şlu OpenAI se specializovan├Żm kontextov├Żm v├Żzkumem
              pro p┼Öeklady, kter├ę rozum├ş nuanc├şm, emoc├şm a kulturn├şmu kontextu.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-12 max-w-6xl mx-auto items-center">
            <div className="space-y-8">
              <div className="flex items-start gap-4">
                <div className="bg-blue-100 dark:bg-accent p-3 rounded-lg">
                  <Brain className="h-6 w-6 text-blue-600 dark:text-primary" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold mb-2">OpenAI Integrace</h3>
                  <p className="text-gray-600 dark:text-muted-foreground">
                    Vyu┼ż├şv├í GPT modely pro p┼Öirozen├ę, lidsk├ę p┼Öeklady, kter├ę zachycuj├ş p┼»vodn├ş v├Żznam a t├│n.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="bg-purple-100 dark:bg-accent p-3 rounded-lg">
                  <FileText className="h-6 w-6 text-purple-600 dark:text-primary" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold mb-2">Kontextov├Ż V├Żzkum</h3>
                  <p className="text-gray-600 dark:text-muted-foreground">
                    Analyzuje kontext titulk┼», vztahy mezi postavami a dynamiku sc├ęn pro p┼Öesn─Ťj┼í├ş p┼Öeklady.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="bg-green-100 dark:bg-accent p-3 rounded-lg">
                  <Zap className="h-6 w-6 text-green-600 dark:text-primary" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold mb-2">Zpracov├ín├ş v Re├íln├ęm ─îase</h3>
                  <p className="text-gray-600 dark:text-muted-foreground">
                    Bleskov─Ť rychl├Ż p┼Öeklad s inteligentn├şm ├║pravou ─Źasov├ín├ş pro perfektn├ş synchronizaci titulk┼».
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-card rounded-2xl p-8 shadow-2xl border">
              <div className="text-center mb-6">
                <div className="bg-gradient-to-r from-primary to-primary/80 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Sparkles className="h-8 w-8 text-primary-foreground" />
                </div>
                <h3 className="text-2xl font-bold mb-2">Kvalita P┼Öekladu</h3>
                <p className="text-muted-foreground">Uvid├şte rozd├şl, kter├Ż na┼íe AI d─Ťl├í</p>
              </div>

              <div className="space-y-4">
                <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-4">
                  <p className="text-sm text-destructive font-medium mb-1">Z├íkladn├ş P┼Öeklad:</p>
                  <p className="text-sm text-muted-foreground">"I am very happy to see you"</p>
                </div>
                <div className="bg-primary/10 border border-primary/20 rounded-lg p-4">
                  <p className="text-sm text-primary font-medium mb-1">N├í┼í AI P┼Öeklad:</p>
                  <p className="text-sm text-muted-foreground">"Jsem naprosto nad┼íen├Ż, ┼że t─Ť vid├şm!"</p>
                </div>
              </div>

              <div className="mt-6 text-center">
                <Badge className="bg-gradient-to-r from-blue-500 to-purple-500 text-white">
                  <Star className="h-4 w-4 mr-1" />
                  95% M├şra P┼Öesnosti
                </Badge>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="container px-4 py-20 mx-auto bg-background dark:bg-background">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold mb-4">Pro─Ź si vybrat SubtitleAI?</h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            V┼íe, co pot┼Öebujete pro profesion├íln├ş p┼Öeklad titulk┼», poh├ín─Ťno nejmodern─Ťj┼í├ş AI technologi├ş.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 max-w-7xl mx-auto">
          <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow duration-300">
            <CardHeader className="text-center pb-4">
              <div className="bg-primary/10 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Zap className="h-8 w-8 text-primary" />
              </div>
              <CardTitle className="text-xl">Bleskov─Ť Rychl├ę</CardTitle>
              <CardDescription className="text-base">
                P┼Öelo┼żte cel├ę soubory s titulky za m├ęn─Ť ne┼ż 30 sekund
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground text-center">
                Na┼íe optimalizovan├ę AI zpracuje va┼íe titulky rychle p┼Öi zachov├ín├ş perfektn├şho ─Źasov├ín├ş a kontextu.
              </p>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow duration-300">
            <CardHeader className="text-center pb-4">
              <div className="bg-purple-100 dark:bg-accent w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Brain className="h-8 w-8 text-purple-600 dark:text-primary" />
              </div>
              <CardTitle className="text-xl">Kontextov├ę AI</CardTitle>
              <CardDescription className="text-base">
                AI rozum├ş kontextu filmu pro lep┼í├ş p┼Öeklady
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground text-center">
                Pokro─Źil├ę AI modely zva┼żuj├ş tok dialogu, emoce postav a kulturn├ş nuance.
              </p>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow duration-300">
            <CardHeader className="text-center pb-4">
              <div className="bg-green-100 dark:bg-accent w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <FileText className="h-8 w-8 text-green-600 dark:text-primary" />
              </div>
              <CardTitle className="text-xl">7 Form├ít┼» Soubor┼»</CardTitle>
              <CardDescription className="text-base">
                Podpora v┼íech hlavn├şch form├ít┼» titulk┼»
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
                Auto-detekce ÔÇó UTF-8 a star┼í├ş k├│dov├ín├ş ÔÇó A┼ż 10MB
              </p>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow duration-300">
            <CardHeader className="text-center pb-4">
              <div className="bg-primary/10 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Gift className="h-8 w-8 text-primary" />
              </div>
              <CardTitle className="text-xl">Platba za Pou┼żit├ş</CardTitle>
              <CardDescription className="text-base">
                Jednoduch├Ż kreditov├Ż syst├ęm - ┼ż├ídn├ę p┼Öedplatn├ę
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground text-center">
                Kupte kredity jednou, pou┼ż├şvejte je nav┼żdy. Pla┼ąte jen za to, co p┼Öelo┼ż├şte s transparentn├şmi cenami.
              </p>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Powerful Features Section */}
      <section className="py-16 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-muted dark:to-accent">
        <div className="container px-4 mx-auto text-center">
          <h2 className="text-3xl font-bold mb-4">­čÜÇ V├Żkonn├ę Funkce</h2>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            V┼íe, co pot┼Öebujete pro profesion├íln├ş p┼Öeklad titulk┼»
          </p>

          <div className="grid md:grid-cols-4 gap-8 max-w-5xl mx-auto mb-8">
            <div className="text-center">
              <div className="w-12 h-12 bg-blue-100 dark:bg-accent rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">­čôü</span>
              </div>
              <h3 className="font-semibold mb-2">D├ívkov├ę Zpracov├ín├ş</h3>
              <p className="text-sm text-muted-foreground">
                Nahrajte v├şce soubor┼» a p┼Öelo┼żte je v┼íechny najednou
              </p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-green-100 dark:bg-accent rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">­čô║</span>
              </div>
              <h3 className="font-semibold mb-2">Titulkov├Ż Overlay</h3>
              <p className="text-sm text-muted-foreground">
                Zobrazujte titulky nad jak├Żmkoli videem s pln├Żm p┼Öizp┼»soben├şm
              </p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-purple-100 dark:bg-accent rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">­čîÉ</span>
              </div>
              <h3 className="font-semibold mb-2">100+ Jazyk┼»</h3>
              <p className="text-sm text-muted-foreground">
                Podpora v┼íech hlavn├şch sv─Ťtov├Żch jazyk┼» a dialekt┼»
              </p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-orange-100 dark:bg-accent rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">ÔÜí</span>
              </div>
              <h3 className="font-semibold mb-2">Okam┼żit├Ż P┼Öeklad</h3>
              <p className="text-sm text-muted-foreground">
                Rychl├Ż AI p┼Öeklad s kontextov├Żm pov─Ťdom├şm
              </p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" asChild>
              <Link href="/cs/subtitles-search">Vyzkou┼íet Hled├ín├ş Titulk┼»</Link>
            </Button>
            <Button size="lg" variant="outline" asChild>
              <Link href="/cs/subtitle-editor">Vyzkou┼íet Editor Titulk┼»</Link>
            </Button>
            <Button size="lg" variant="outline" asChild>
              <Link href="/cs/video-tools">Vyzkou┼íet Plovouc├ş titulky</Link>
            </Button>
            <Button size="lg" variant="outline" asChild>
              <Link href="/cs/video-tools">Vyzkou┼íet Video P┼Öehr├íva─Ź</Link>
            </Button>
            <Button size="lg" variant="outline" asChild className="bg-gradient-to-r from-blue-50 to-purple-50 hover:from-blue-100 hover:to-purple-100 border-blue-200 text-blue-700 hover:text-blue-800 dark:from-blue-950 dark:to-purple-950 dark:border-blue-800 dark:text-blue-300 dark:hover:text-blue-200">
              <Link href="/cs/feedback" className="flex items-center gap-2">
                <MessageSquare className="h-5 w-5" />
                Sd├şlet Zp─Ťtnou Vazbu
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
                <span className="text-2xl mr-2">­čô║</span>
                NOV├ü FUNKCE
              </Badge>
              <h2 className="text-4xl md:text-5xl font-bold mb-6 bg-gradient-to-r from-indigo-600 to-cyan-600 bg-clip-text text-transparent" style={{ lineHeight: '1.4' }}>
                Titulkov├Ż Overlay
              </h2>
              <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
                Zobrazujte titulky nad jak├Żmkoli video obsahem s pln├Żm p┼Öizp┼»soben├şm. Perfektn├ş pro streamovac├ş slu┼żby,
                video p┼Öehr├íva─Źe a online obsah, kde nen├ş mo┼żn├ę na─Ź├şst extern├ş titulky.
              </p>
            </div>

            <div className="grid lg:grid-cols-2 gap-12 items-center">
              <div className="space-y-8">
                <div className="space-y-6">
                  <div className="flex items-start space-x-4">
                    <div className="bg-indigo-100 dark:bg-accent p-3 rounded-full">
                      <span className="text-2xl">­čÄĘ</span>
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold mb-2">Pln├ę P┼Öizp┼»soben├ş</h3>
                      <p className="text-muted-foreground">
                        P┼Öizp┼»sobte p├şsmo, velikost, barvy, pozad├ş, st├şny a um├şst─Ťn├ş.
                        Ud─Ťlejte titulky p┼Öesn─Ť tak, jak je chcete.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start space-x-4">
                    <div className="bg-cyan-100 dark:bg-accent p-3 rounded-full">
                      <span className="text-2xl">­čÄ»</span>
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold mb-2">P┼Öeta┼żen├ş & Um├şst─Ťn├ş</h3>
                      <p className="text-muted-foreground">
                        Jednodu┼íe p┼Öet├íhn─Ťte overlay kamkoli na obrazovku. Inteligentn├ş p┼Öichycen├ş k okraj┼»m
                        a centr├íln├ş zarovn├ín├ş pro perfektn├ş um├şst─Ťn├ş.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start space-x-4">
                    <div className="bg-purple-100 dark:bg-accent p-3 rounded-full">
                      <span className="text-2xl">ÔĆ▒´ŞĆ</span>
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold mb-2">Perfektn├ş Synchronizace</h3>
                      <p className="text-muted-foreground">
                        Dola─Ćte ─Źasov├ín├ş pomoc├ş ovl├íd├ín├ş offsetu a rychlostn├şch multiplik├ítor┼».
                        Z├şskejte perfektn├ş synchronizaci s jak├Żmkoli video obsahem.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start space-x-4">
                    <div className="bg-green-100 dark:bg-accent p-3 rounded-full">
                      <span className="text-2xl">­čîÉ</span>
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold mb-2">Univerz├íln├ş Kompatibilita</h3>
                      <p className="text-muted-foreground">
                        Funguje s jak├Żmkoli video p┼Öehr├íva─Źem, streamovac├ş slu┼żbou nebo online obsahem.
                        Nen├ş pot┼Öeba speci├íln├ş software nebo pluginy.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="pt-6">
                  <Button size="lg" className="bg-gradient-to-r from-indigo-600 to-cyan-600 hover:from-indigo-700 hover:to-cyan-700 text-white" asChild>
                    <Link href="/cs/subtitle-editor" className="flex items-center gap-2">
                      <span className="text-xl">­čô║</span>
                      Vyzkou┼íet Editor Titulk┼» Nyn├ş
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
                      Perfektn├ş um├şst─Ťn├ş titulk┼» kdekoli na obrazovce
                    </div>
                  </div>

                  <div className="text-white/60 text-xs text-center">
                    Overlay funguje s jak├Żmkoli video p┼Öehr├íva─Źem nebo streamovac├ş slu┼żbou
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
          <h2 className="text-3xl font-bold mb-4">­čĺ░ Kredity na Platbu za Pou┼żit├ş</h2>
          <p className="text-muted-foreground mb-8">
            ┼Ż├ídn├ę m─Ťs├ş─Źn├ş p┼Öedplatn├ę. Pla┼ąte jen za to, co pou┼żijete.
          </p>

          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-center space-x-2">
                  <span>­čÄü</span>
                  <span>Uv├ştac├ş Bonus</span>
                </CardTitle>
                <CardDescription>Za─Źn─Ťte zdarma</CardDescription>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="text-3xl font-bold text-primary">100 Kredit┼»</div>
                <div className="text-sm text-muted-foreground">Zdarma p┼Öi registraci</div>
              </CardContent>
              <CardContent className="space-y-2">
                <p>Ôťô ~250 ┼Ö├ídk┼» p┼Öekladu</p>
                <p>Ôťô Pr├ęmiov├Ż AI p┼Öeklad</p>
                <p>Ôťô ┼Ż├ídn├Ż ─Źasov├Ż limit</p>
                <p>Ôťô P┼Ö├şstup ke v┼íem funkc├şm</p>
              </CardContent>
            </Card>

            <Card className="border-purple-500">
              <CardHeader>
                <CardTitle className="flex items-center justify-center space-x-2">
                  <span>­čÄČ</span>
                  <span>Pr├ęmiov├Ż P┼Öeklad</span>
                </CardTitle>
                <CardDescription>OpenAI GPT-4 s kontextov├Żm v├Żzkumem</CardDescription>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="text-3xl font-bold">~0,4</div>
                <div className="text-sm text-muted-foreground">kredit┼» za 20 ┼Ö├ídk┼»</div>
              </CardContent>
              <CardContent className="space-y-2">
                <p>Ôťô Kontextov├Ż p┼Öeklad</p>
                <p>Ôťô V├Żzkum filmu/seri├ílu</p>
                <p>Ôťô Kulturn├ş adaptace</p>
                <p>Ôťô Profesion├íln├ş kvalita</p>
              </CardContent>
            </Card>
          </div>

          <div className="mt-8 space-y-4">
            <div className="text-sm text-muted-foreground">
              ­čĺí <strong>1 USD = 100 kredit┼»</strong> ÔÇó Kupte kredity podle pot┼Öeby ÔÇó Bez vypr┼íen├ş
            </div>
            <Button size="lg" asChild>
              <Link href="/cs/register">Z├şskat 100 Zdarma Kredit┼»</Link>
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
                <span className="text-2xl mr-2">­č¬č</span>
                ┼Ż├üDN├ü INSTALACE POT┼śEBA
              </Badge>
              <h2 className="text-4xl md:text-5xl font-bold mb-6 bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent" style={{ lineHeight: '1.4' }}>
                Plovouc├ş titulky
              </h2>
              <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
                Otev┼Öete titulkov├ę okno, kter├ę z┼»st├ív├í nad jak├Żmkoli videem. ┼Ż├ídn├í roz┼í├ş┼Öen├ş prohl├ş┼że─Źe,
                ┼ż├ídn├ę instalace - jen klikn─Ťte a okam┼żit─Ť pou┼ż├şvejte!
              </p>
            </div>

            <div className="grid lg:grid-cols-2 gap-12 items-center">
              <div className="space-y-8">
                <div className="space-y-6">
                  <div className="flex items-start space-x-4">
                    <div className="bg-green-100 dark:bg-accent p-3 rounded-full">
                      <span className="text-2xl">ÔÜí</span>
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold mb-2">Okam┼żit├ę Nastaven├ş</h3>
                      <p className="text-muted-foreground">
                        ┼Ż├ídn├í roz┼í├ş┼Öen├ş prohl├ş┼że─Źe nebo software k instalaci. Funguje okam┼żit─Ť
                        v jak├ęmkoli modern├şm webov├ęm prohl├ş┼że─Źi.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start space-x-4">
                    <div className="bg-emerald-100 dark:bg-accent p-3 rounded-full">
                      <span className="text-2xl">­čÄ»</span>
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold mb-2">V┼żdy Naho┼Öe</h3>
                      <p className="text-muted-foreground">
                        Titulkov├ę okno z┼»st├ív├í nad v┼íemi ostatn├şmi okny, perfektn├ş pro
                        Netflix, YouTube nebo jak├Żkoli video p┼Öehr├íva─Ź.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start space-x-4">
                    <div className="bg-teal-100 dark:bg-accent p-3 rounded-full">
                      <span className="text-2xl">­čÄĘ</span>
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold mb-2">Pr┼»hledn├ę Pozad├ş</h3>
                      <p className="text-muted-foreground">
                        ─îist├Ż, pr┼»hledn├Ż overlay, kter├Ż neru┼í├ş va┼íe video.
                        P┼Öizp┼»sobte barvy, p├şsma a um├şst─Ťn├ş.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start space-x-4">
                    <div className="bg-cyan-100 dark:bg-accent p-3 rounded-full">
                      <span className="text-2xl">­čľ▒´ŞĆ</span>
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold mb-2">Snadn├ę Um├şst─Ťn├ş</h3>
                      <p className="text-muted-foreground">
                        P┼Öet├íhn─Ťte okno kamkoli na obrazovku. Pozice si pamatuje
                        va┼íe preference pro p┼Ö├ş┼ít─Ť.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="pt-6">
                  <Button size="lg" className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white" asChild>
                    <Link href="/cs/video-tools" className="flex items-center gap-2">
                      <span className="text-xl">­č¬č</span>
                      Vyzkou┼íet Plovouc├ş titulky Nyn├ş
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
                      Perfektn├ş um├şst─Ťn├ş titulk┼»
                    </div>
                    <div className="text-xs text-green-400 mt-1 text-center">
                      ÔćĹ Popup Okno
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
                <span className="text-2xl mr-2">­čÄČ</span>
                V┼áE-V-JEDNOM ┼śE┼áEN├Ź
              </Badge>
              <h2 className="text-4xl md:text-5xl font-bold mb-6 bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent" style={{ lineHeight: '1.4' }}>
                Integrovan├Ż Video P┼Öehr├íva─Ź
              </h2>
              <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
                Sledujte jak├ękoli video s vlastn├şmi titulky na jednom m├şst─Ť. Perfektn├ş synchronizace,
                pln├ę p┼Öizp┼»soben├ş a podpora v┼íech hlavn├şch video platforem.
              </p>
            </div>

            <div className="grid lg:grid-cols-2 gap-12 items-center">
              <div className="space-y-8">
                <div className="space-y-6">
                  <div className="flex items-start space-x-4">
                    <div className="bg-purple-100 dark:bg-accent p-3 rounded-full">
                      <span className="text-2xl">­čöŚ</span>
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold mb-2">Univerz├íln├ş Video Podpora</h3>
                      <p className="text-muted-foreground">
                        Funguje s YouTube, Vimeo, p┼Ö├şm├Żmi video odkazy a jak├Żmkoli vlo┼żiteln├Żm
                        video obsahem. Sta─Ź├ş vlo┼żit URL a za─Ź├şt sledovat.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start space-x-4">
                    <div className="bg-pink-100 dark:bg-accent p-3 rounded-full">
                      <span className="text-2xl">ÔÜí</span>
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold mb-2">Perfektn├ş Synchronizace</h3>
                      <p className="text-muted-foreground">
                        Titulky jsou perfektn─Ť synchronizov├íny s p┼Öehr├ív├ín├şm videa. Automatick├ę ─Źasov├ín├ş
                        s mo┼żnost├ş ru─Źn├şho dolad─Ťn├ş pro perfektn├ş zarovn├ín├ş.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start space-x-4">
                    <div className="bg-indigo-100 dark:bg-accent p-3 rounded-full">
                      <span className="text-2xl">­čÄĘ</span>
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold mb-2">Kompletn├ş P┼Öizp┼»soben├ş</h3>
                      <p className="text-muted-foreground">
                        Pln├í kontrola nad vzhledem titulk┼» - p├şsma, barvy, um├şst─Ťn├ş,
                        pr┼»hlednost a efekty. Ud─Ťlejte si je p┼Öesn─Ť podle sv├Żch p┼Öedstav.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start space-x-4">
                    <div className="bg-cyan-100 dark:bg-accent p-3 rounded-full">
                      <span className="text-2xl">­čÄ»</span>
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold mb-2">V┼íe-v-Jednom Rozhran├ş</h3>
                      <p className="text-muted-foreground">
                        V┼íe na jednom m├şst─Ť - video p┼Öehr├íva─Ź, ovl├íd├ín├ş titulk┼» a
                        mo┼żnosti p┼Öizp┼»soben├ş. Nen├ş pot┼Öeba ┼żonglovat s v├şce okny.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="pt-6">
                  <Button size="lg" className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white" asChild>
                    <Link href="/cs/video-tools" className="flex items-center gap-2">
                      <span className="text-xl">­čÄČ</span>
                      Vyzkou┼íet Video P┼Öehr├íva─Ź Nyn├ş
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
                      Perfektn├ş integrace titulk┼»
                    </div>
                  </div>

                  {/* Controls mockup */}
                  <div className="bg-gray-800 rounded p-3">
                    <div className="flex items-center space-x-2 mb-2">
                      <div className="w-6 h-6 bg-purple-500 rounded flex items-center justify-center">
                        <span className="text-white text-xs">ÔľÂ</span>
                      </div>
                      <div className="flex-1 bg-gray-700 rounded h-1">
                        <div className="bg-purple-500 h-1 rounded w-1/3"></div>
                      </div>
                      <div className="text-white text-xs">2:34</div>
                    </div>
                    <div className="text-gray-400 text-xs text-center">
                      Integrovan├ę video ovl├íd├ín├ş + p┼Öizp┼»soben├ş titulk┼»
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
    </>
  );
}
