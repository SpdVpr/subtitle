import { StructuredData } from "@/components/seo/structured-data";
import { HeroSectionCs } from "@/components/home/hero-section-cs";
import { SubtitleOverlaySectionCs, PopupWindowSectionCs, VideoPlayerSectionCs } from "@/components/home/optimized-image-sections-cs";
import { ClientWrapper } from "@/components/home/client-wrapper";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Sparkles,
  Zap,
  Brain,
  Globe,
  FileText,
  CheckCircle,
  ArrowRight,
  MessageSquare
} from "lucide-react";

export default function CzechHome() {
  return (
    <ClientWrapper loadingText="Načítání...">
      <StructuredData locale="cs" page="home" />
      <div className="flex flex-col min-h-screen">
        <HeroSectionCs />
        <SubtitleOverlaySectionCs />
        <PopupWindowSectionCs />
        <VideoPlayerSectionCs />

        {/* AI Engine Section */}
        <section className="py-20 bg-gradient-to-r from-purple-50 to-blue-50 dark:from-secondary dark:to-card">
          <div className="container px-4 mx-auto">
            <div className="text-center mb-16">
              <Badge className="mb-4 bg-purple-100 dark:bg-accent text-purple-700 dark:text-primary border-purple-200 dark:border-border">
                <Brain className="h-4 w-4 mr-2" />
                PROPRIETÁRNÍ AI ENGINE
              </Badge>
              <h2 className="text-4xl md:text-5xl font-bold mb-6 bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                Jak Funguje Náš AI Engine
              </h2>
              <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
                Kombinujeme nejlepší z obou světů - sílu OpenAI s kontextovým výzkumem pro nepřekonatelnou kvalitu překladu.
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
              <Card className="border-2 border-purple-200 dark:border-border hover:shadow-xl transition-shadow">
                <CardHeader>
                  <div className="w-12 h-12 bg-purple-100 dark:bg-accent rounded-full flex items-center justify-center mb-4">
                    <FileText className="h-6 w-6 text-purple-600 dark:text-primary" />
                  </div>
                  <CardTitle>1. Analýza Kontextu</CardTitle>
                  <CardDescription>
                    Náš AI analyzuje celý soubor titulků, aby pochopil kontext, postavy a děj.
                  </CardDescription>
                </CardHeader>
              </Card>

              <Card className="border-2 border-blue-200 dark:border-border hover:shadow-xl transition-shadow">
                <CardHeader>
                  <div className="w-12 h-12 bg-blue-100 dark:bg-accent rounded-full flex items-center justify-center mb-4">
                    <Brain className="h-6 w-6 text-blue-600 dark:text-primary" />
                  </div>
                  <CardTitle>2. AI Překlad</CardTitle>
                  <CardDescription>
                    OpenAI GPT-4 překládá s plným pochopením kontextu a nuancí jazyka.
                  </CardDescription>
                </CardHeader>
              </Card>

              <Card className="border-2 border-green-200 dark:border-border hover:shadow-xl transition-shadow">
                <CardHeader>
                  <div className="w-12 h-12 bg-green-100 dark:bg-accent rounded-full flex items-center justify-center mb-4">
                    <CheckCircle className="h-6 w-6 text-green-600 dark:text-primary" />
                  </div>
                  <CardTitle>3. Kontrola Kvality</CardTitle>
                  <CardDescription>
                    Automatická kontrola konzistence, gramatiky a přirozenosti překladu.
                  </CardDescription>
                </CardHeader>
              </Card>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-20 bg-white dark:from-background dark:to-card">
          <div className="container px-4 mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-4xl md:text-5xl font-bold mb-6">Proč Zvolit SubtitleBot?</h2>
              <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
                Nejpokročilejší AI překladač titulků na trhu s funkcemi, které jinde nenajdete.
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
              <Card className="hover:shadow-xl transition-shadow">
                <CardHeader>
                  <div className="w-12 h-12 bg-blue-100 dark:bg-accent rounded-full flex items-center justify-center mb-4">
                    <Sparkles className="h-6 w-6 text-blue-600 dark:text-primary" />
                  </div>
                  <CardTitle>Kontextové AI</CardTitle>
                  <CardDescription>
                    Náš AI chápe kontext celého filmu nebo seriálu, ne jen jednotlivé věty.
                  </CardDescription>
                </CardHeader>
              </Card>

              <Card className="hover:shadow-xl transition-shadow">
                <CardHeader>
                  <div className="w-12 h-12 bg-purple-100 dark:bg-accent rounded-full flex items-center justify-center mb-4">
                    <Zap className="h-6 w-6 text-purple-600 dark:text-primary" />
                  </div>
                  <CardTitle>Bleskově Rychlé</CardTitle>
                  <CardDescription>
                    Přeložte celý film za pár minut. Žádné čekání, okamžité výsledky.
                  </CardDescription>
                </CardHeader>
              </Card>

              <Card className="hover:shadow-xl transition-shadow">
                <CardHeader>
                  <div className="w-12 h-12 bg-green-100 dark:bg-accent rounded-full flex items-center justify-center mb-4">
                    <Globe className="h-6 w-6 text-green-600 dark:text-primary" />
                  </div>
                  <CardTitle>100+ Jazyků</CardTitle>
                  <CardDescription>
                    Podporujeme všechny hlavní světové jazyky včetně méně běžných.
                  </CardDescription>
                </CardHeader>
              </Card>

              <Card className="hover:shadow-xl transition-shadow">
                <CardHeader>
                  <div className="w-12 h-12 bg-yellow-100 dark:bg-accent rounded-full flex items-center justify-center mb-4">
                    <CheckCircle className="h-6 w-6 text-yellow-600 dark:text-primary" />
                  </div>
                  <CardTitle>Žádné Předplatné</CardTitle>
                  <CardDescription>
                    Plaťte pouze za to, co použijete. Kredity nikdy nevyprší.
                  </CardDescription>
                </CardHeader>
              </Card>

              <Card className="hover:shadow-xl transition-shadow">
                <CardHeader>
                  <div className="w-12 h-12 bg-red-100 dark:bg-accent rounded-full flex items-center justify-center mb-4">
                    <FileText className="h-6 w-6 text-red-600 dark:text-primary" />
                  </div>
                  <CardTitle>SRT Formát</CardTitle>
                  <CardDescription>
                    Plná podpora SRT formátu s zachováním časování a formátování.
                  </CardDescription>
                </CardHeader>
              </Card>

              <Card className="hover:shadow-xl transition-shadow">
                <CardHeader>
                  <div className="w-12 h-12 bg-indigo-100 dark:bg-accent rounded-full flex items-center justify-center mb-4">
                    <MessageSquare className="h-6 w-6 text-indigo-600 dark:text-primary" />
                  </div>
                  <CardTitle>Přirozené Překlady</CardTitle>
                  <CardDescription>
                    AI vytváří překlady, které znějí přirozeně, ne strojově.
                  </CardDescription>
                </CardHeader>
              </Card>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20 bg-gradient-to-br from-blue-600 via-purple-600 to-blue-800 text-white">
          <div className="container px-4 mx-auto text-center">
            <div className="max-w-3xl mx-auto">
              <h2 className="text-4xl md:text-5xl font-bold mb-6">
                Připraveni Začít?
              </h2>
              <p className="text-xl mb-8 text-blue-100">
                Získejte 100 ZDARMA kreditů při registraci. Žádná kreditní karta není potřeba.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button size="lg" variant="secondary" asChild>
                  <Link href="/cs/translate" className="flex items-center gap-2">
                    <Sparkles className="h-5 w-5" />
                    Začít Překládat ZDARMA
                    <ArrowRight className="h-5 w-5" />
                  </Link>
                </Button>
                <Button size="lg" variant="outline" className="bg-white/10 hover:bg-white/20 border-white/30 text-white" asChild>
                  <Link href="/cs/pricing">
                    Zobrazit Ceny
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        </section>

        {/* FAQ Section */}
        <section className="py-20 bg-gray-50 dark:from-background dark:to-card">
          <div className="container px-4 mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-4xl md:text-5xl font-bold mb-6">Často Kladené Otázky</h2>
              <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
                Máte otázky? Máme odpovědi.
              </p>
            </div>

            <div className="max-w-3xl mx-auto space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Jak funguje kreditový systém?</CardTitle>
                  <CardDescription>
                    Každý řádek titulků stojí 1 kredit. Například film s 500 řádky titulků bude stát 500 kreditů.
                    Kredity nikdy nevyprší a můžete je použít kdykoli.
                  </CardDescription>
                </CardHeader>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Jaké jazyky podporujete?</CardTitle>
                  <CardDescription>
                    Podporujeme více než 100 jazyků včetně češtiny, angličtiny, španělštiny, francouzštiny, němčiny,
                    japonštiny, korejštiny, čínštiny a mnoha dalších.
                  </CardDescription>
                </CardHeader>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Jak kvalitní jsou překlady?</CardTitle>
                  <CardDescription>
                    Naše AI kombinuje OpenAI GPT-4 s kontextovým výzkumem pro maximální kvalitu. Překlady jsou
                    přirozené, kontextově správné a zachovávají původní význam.
                  </CardDescription>
                </CardHeader>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Mohu upravit přeložené titulky?</CardTitle>
                  <CardDescription>
                    Ano! Náš editor titulků vám umožňuje upravit jakýkoli překlad před stažením. Můžete také
                    synchronizovat časování a přizpůsobit formátování.
                  </CardDescription>
                </CardHeader>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Potřebuji předplatné?</CardTitle>
                  <CardDescription>
                    Ne! Fungujeme na kreditovém systému. Kupujete kredity jednou a používáte je, kdykoli chcete.
                    Žádné měsíční poplatky, žádné závazky.
                  </CardDescription>
                </CardHeader>
              </Card>
            </div>
          </div>
        </section>
      </div>
    </ClientWrapper>
  );
}
