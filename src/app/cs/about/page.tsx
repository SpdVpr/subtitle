import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowLeft, Zap, Globe, Users, Target, Heart, Award, Lightbulb } from "lucide-react"

export default function CzechAboutPage() {
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-12 max-w-4xl">
        {/* Header */}
        <div className="mb-8">
          <Button variant="ghost" asChild className="mb-4">
            <Link href="/cs" className="flex items-center gap-2">
              <ArrowLeft className="h-4 w-4" />
              Zpět na Hlavní Stránku
            </Link>
          </Button>
          <div className="text-center">
            <div className="flex items-center justify-center gap-2 mb-4">
              <Zap className="h-8 w-8 text-primary" />
              <h1 className="text-4xl font-bold text-foreground">O SubtitleBot</h1>
            </div>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Posilujeme tvůrce po celém světě pomocí AI nástrojů pro překlad a časování titulků.
            </p>
          </div>
        </div>

        {/* Mission */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5 text-primary" />
              Naše Mise
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground leading-relaxed">
              V SubtitleBot věříme, že jazyk by nikdy neměl být překážkou pro sdílení skvělého obsahu. 
              Naším posláním je učinit překlad titulků rychlým, přesným a dostupným pro tvůrce po celém světě, 
              což jim umožní snadno oslovit globální publikum.
            </p>
          </CardContent>
        </Card>

        {/* Story */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Lightbulb className="h-5 w-5 text-primary" />
              Náš Příběh
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground leading-relaxed mb-4">
              SubtitleBot vznikl z frustrace s pomalými a nepřesnými nástroji pro překlad titulků. 
              Jako tvůrci obsahu jsme sami zažili bolest čekání hodin na překlad titulků, 
              jen abychom dostali výsledky, které vyžadovaly rozsáhlé ruční úpravy.
            </p>
            <p className="text-muted-foreground leading-relaxed">
              Rozhodli jsme se vybudovat něco lepšího. Kombinací nejmodernější AI technologie 
              s hlubokým porozuměním kontextu jsme vytvořili platformu, která poskytuje 
              rychlé, přesné překlady, které skutečně rozumí nuancím lidského jazyka.
            </p>
          </CardContent>
        </Card>

        {/* Values */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold mb-6 text-center">Naše Hodnoty</h2>
          <div className="grid md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Zap className="h-5 w-5 text-primary" />
                  Rychlost & Efektivita
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground text-sm">
                  Váš čas je cenný. Naše AI zpracuje titulky za sekundy, ne hodiny, 
                  takže se můžete soustředit na tvorbu skvělého obsahu.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Award className="h-5 w-5 text-primary" />
                  Kvalita & Přesnost
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground text-sm">
                  Používáme proprietární AI engine, který kombinuje OpenAI s kontextovým výzkumem 
                  pro dosažení překladů profesionální kvality.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Globe className="h-5 w-5 text-primary" />
                  Globální Dostupnost
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground text-sm">
                  Podporujeme více než 100 jazyků a neustále přidáváme další, 
                  abychom pomohli tvůrcům oslovit publikum po celém světě.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Heart className="h-5 w-5 text-primary" />
                  Uživatelsky Zaměřené
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground text-sm">
                  Každá funkce je navržena s ohledem na uživatele. Žádné složité rozhraní, 
                  žádné skryté poplatky - jen jednoduché, výkonné nástroje.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Technology */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Zap className="h-5 w-5 text-primary" />
              Naše Technologie
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <h4 className="font-semibold mb-2">Proprietární AI Engine</h4>
                <p className="text-muted-foreground text-sm">
                  Náš vlastní AI engine kombinuje sílu OpenAI GPT modelů se specializovaným 
                  kontextovým výzkumem pro dosažení překladů, které rozumí nuancím, emocím a kulturnímu kontextu.
                </p>
              </div>
              <div>
                <h4 className="font-semibold mb-2">Kontextové Porozumění</h4>
                <p className="text-muted-foreground text-sm">
                  Na rozdíl od základních překladačů, naše AI analyzuje celý kontext titulků, 
                  vztahy mezi postavami a dynamiku scén pro přesnější překlady.
                </p>
              </div>
              <div>
                <h4 className="font-semibold mb-2">Inteligentní Časování</h4>
                <p className="text-muted-foreground text-sm">
                  Automaticky upravujeme časování titulků pro různé jazyky, 
                  zajišťujeme perfektní synchronizaci s vaším video obsahem.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Team */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5 text-primary" />
              Náš Tým
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground leading-relaxed">
              Jsme malý, ale vášnivý tým vývojářů, lingvistů a tvůrců obsahu, 
              kteří sdílejí vizi světa bez jazykových bariér. Náš rozmanitý tým 
              přináší zkušenosti z technologie, překladatelství a tvorby obsahu, 
              což nám umožňuje vybudovat nástroje, které skutečně rozumí potřebám našich uživatelů.
            </p>
          </CardContent>
        </Card>

        {/* Future */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5 text-primary" />
              Naše Budoucnost
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground leading-relaxed mb-4">
              Teprve začínáme. Naše vize zahrnuje:
            </p>
            <ul className="space-y-2 text-muted-foreground">
              <li>• Rozšíření podpory jazyků na více než 200 jazyků a dialektů</li>
              <li>• Pokročilé AI modely pro ještě přesnější kontextové překlady</li>
              <li>• Integraci s populárními video platformami a editačními nástroji</li>
              <li>• Nástroje pro spolupráci pro týmy a organizace</li>
              <li>• Pokročilé analytiky a insights pro tvůrce obsahu</li>
            </ul>
          </CardContent>
        </Card>

        {/* Contact CTA */}
        <div className="text-center">
          <h3 className="text-xl font-semibold mb-4">Připojte se k naší komunitě</h3>
          <p className="text-muted-foreground mb-6">
            Máte otázky, návrhy nebo jen chcete říct ahoj? Rádi se s vámi spojíme!
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button asChild>
              <Link href="/cs/translate">Začít Překládat</Link>
            </Button>
            <Button variant="outline" asChild>
              <Link href="/contact">Kontaktujte Nás</Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
