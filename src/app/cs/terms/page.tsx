import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowLeft, FileText, Shield, Users, CreditCard, Globe, AlertTriangle } from "lucide-react"

export default function CzechTermsPage() {
  const lastUpdated = "25. prosince 2024"

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
              <FileText className="h-8 w-8 text-primary" />
              <h1 className="text-4xl font-bold text-foreground">Obchodní Podmínky</h1>
            </div>
            <p className="text-muted-foreground">
              Naposledy aktualizováno: {lastUpdated}
            </p>
          </div>
        </div>

        {/* Introduction */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-primary" />
              Úvod
            </CardTitle>
          </CardHeader>
          <CardContent className="prose prose-sm max-w-none dark:prose-invert">
            <p>
              Vítejte na SubtitleBot ("my", "nás", "naše" nebo "služba"). Tyto Obchodní podmínky 
              ("Podmínky") upravují vaše používání naší webové stránky a služeb pro překlad titulků 
              pomocí umělé inteligence.
            </p>
            <p>
              Přístupem k naší službě nebo jejím používáním souhlasíte s těmito Podmínkami. 
              Pokud s těmito Podmínkami nesouhlasíte, nepoužívejte naši službu.
            </p>
          </CardContent>
        </Card>

        {/* Service Description */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Globe className="h-5 w-5 text-primary" />
              Popis Služby
            </CardTitle>
          </CardHeader>
          <CardContent className="prose prose-sm max-w-none dark:prose-invert">
            <p>
              SubtitleBot poskytuje služby překladu titulků pomocí umělé inteligence. Naše služby zahrnují:
            </p>
            <ul>
              <li>AI překlad SRT souborů s titulky</li>
              <li>Vyhledávání a stahování titulků z veřejných databází</li>
              <li>Video nástroje pro přehrávání s titulky</li>
              <li>Popup overlay pro externí video obsah</li>
              <li>Systém kreditů pro platby za použití</li>
            </ul>
          </CardContent>
        </Card>

        {/* User Accounts */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5 text-primary" />
              Uživatelské Účty
            </CardTitle>
          </CardHeader>
          <CardContent className="prose prose-sm max-w-none dark:prose-invert">
            <p>
              Pro používání některých funkcí naší služby si musíte vytvořit účet. Souhlasíte s tím, že:
            </p>
            <ul>
              <li>Poskytnete přesné a úplné informace při registraci</li>
              <li>Budete udržovat bezpečnost svého hesla</li>
              <li>Budete nás okamžitě informovat o jakémkoli neoprávněném použití</li>
              <li>Jste odpovědní za všechny aktivity pod vaším účtem</li>
            </ul>
          </CardContent>
        </Card>

        {/* Credits and Payments */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CreditCard className="h-5 w-5 text-primary" />
              Kredity a Platby
            </CardTitle>
          </CardHeader>
          <CardContent className="prose prose-sm max-w-none dark:prose-invert">
            <p>
              Naše služba používá systém kreditů:
            </p>
            <ul>
              <li>Kredity se kupují předem a nikdy nevyprší</li>
              <li>Ceny kreditů jsou uvedeny v USD</li>
              <li>Platby jsou zpracovány přes Stripe a OpenNode</li>
              <li>Kredity jsou nevratné po použití</li>
              <li>Nabízíme 30denní záruku vrácení peněz za nepoužité kredity</li>
            </ul>
          </CardContent>
        </Card>

        {/* Acceptable Use */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-primary" />
              Přijatelné Použití
            </CardTitle>
          </CardHeader>
          <CardContent className="prose prose-sm max-w-none dark:prose-invert">
            <p>
              Souhlasíte, že nebudete používat naši službu k:
            </p>
            <ul>
              <li>Porušování autorských práv nebo jiných práv duševního vlastnictví</li>
              <li>Nahrávání škodlivého nebo nezákonného obsahu</li>
              <li>Pokusu o narušení nebo zneužití naší infrastruktury</li>
              <li>Automatizovanému přístupu bez našeho souhlasu</li>
              <li>Jakékoli nezákonné nebo škodlivé činnosti</li>
            </ul>
          </CardContent>
        </Card>

        {/* Intellectual Property */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-primary" />
              Duševní Vlastnictví
            </CardTitle>
          </CardHeader>
          <CardContent className="prose prose-sm max-w-none dark:prose-invert">
            <p>
              Služba a její původní obsah, funkce a funkcionalita jsou a zůstanou 
              výhradním vlastnictvím SubtitleBot a jeho poskytovatelů licencí.
            </p>
            <p>
              Obsah, který nahrajete, zůstává vaším vlastnictvím. Udělujete nám licenci 
              k jeho zpracování za účelem poskytování našich služeb.
            </p>
          </CardContent>
        </Card>

        {/* Disclaimers */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-primary" />
              Vyloučení Odpovědnosti
            </CardTitle>
          </CardHeader>
          <CardContent className="prose prose-sm max-w-none dark:prose-invert">
            <p>
              Služba je poskytována "tak jak je" bez jakýchkoli záruk. Nezaručujeme:
            </p>
            <ul>
              <li>Nepřetržitou dostupnost služby</li>
              <li>100% přesnost překladů</li>
              <li>Kompatibilitu se všemi formáty souborů</li>
              <li>Že služba bude bez chyb</li>
            </ul>
          </CardContent>
        </Card>

        {/* Limitation of Liability */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Omezení Odpovědnosti</CardTitle>
          </CardHeader>
          <CardContent className="prose prose-sm max-w-none dark:prose-invert">
            <p>
              V maximálním rozsahu povoleném zákonem nebudeme odpovědní za žádné 
              nepřímé, náhodné, zvláštní nebo následné škody vyplývající z používání 
              nebo neschopnosti používat naši službu.
            </p>
          </CardContent>
        </Card>

        {/* Termination */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Ukončení</CardTitle>
          </CardHeader>
          <CardContent className="prose prose-sm max-w-none dark:prose-invert">
            <p>
              Můžeme ukončit nebo pozastavit váš účet okamžitě, bez předchozího upozornění, 
              z jakéhokoli důvodu, včetně porušení těchto Podmínek.
            </p>
            <p>
              Po ukončení zůstávají vaše nepoužité kredity k dispozici po dobu 12 měsíců.
            </p>
          </CardContent>
        </Card>

        {/* Changes to Terms */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Změny Podmínek</CardTitle>
          </CardHeader>
          <CardContent className="prose prose-sm max-w-none dark:prose-invert">
            <p>
              Vyhrazujeme si právo kdykoli upravit tyto Podmínky. O významných změnách 
              vás budeme informovat e-mailem nebo prostřednictvím naší služby.
            </p>
            <p>
              Pokračováním v používání služby po změnách vyjadřujete souhlas s novými Podmínkami.
            </p>
          </CardContent>
        </Card>

        {/* Contact */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Kontakt</CardTitle>
          </CardHeader>
          <CardContent className="prose prose-sm max-w-none dark:prose-invert">
            <p>
              Pokud máte otázky k těmto Obchodním podmínkám, kontaktujte nás na:
            </p>
            <p>
              <strong>Email:</strong> legal@subtitlebot.com<br />
              <strong>Adresa:</strong> [Adresa bude doplněna]
            </p>
          </CardContent>
        </Card>

        {/* Footer */}
        <div className="text-center">
          <p className="text-sm text-muted-foreground mb-6">
            Přečtěte si také naše <Link href="/cs/privacy" className="text-primary hover:underline">Zásady ochrany osobních údajů</Link> 
            a <Link href="/cs/cookies" className="text-primary hover:underline">Zásady cookies</Link>.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button asChild>
              <Link href="/cs/translate">Začít Překládat</Link>
            </Button>
            <Button variant="outline" asChild>
              <Link href="/cs/contact">Kontaktujte Nás</Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
