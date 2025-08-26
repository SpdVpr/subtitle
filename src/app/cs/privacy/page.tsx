import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowLeft, Shield, Eye, Lock, Database, Globe, Mail, Trash2 } from "lucide-react"

export default function CzechPrivacyPage() {
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
              <Shield className="h-8 w-8 text-primary" />
              <h1 className="text-4xl font-bold text-foreground">Zásady Ochrany Osobních Údajů</h1>
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
              <Shield className="h-5 w-5 text-primary" />
              Úvod
            </CardTitle>
          </CardHeader>
          <CardContent className="prose prose-sm max-w-none dark:prose-invert">
            <p>
              SubtitleBot ("my", "nás", "naše") se zavazuje chránit vaše soukromí. 
              Tyto Zásady ochrany osobních údajů vysvětlují, jak shromažďujeme, 
              používáme a chráníme vaše informace při používání naší služby.
            </p>
          </CardContent>
        </Card>

        {/* Information We Collect */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Database className="h-5 w-5 text-primary" />
              Informace, Které Shromažďujeme
            </CardTitle>
          </CardHeader>
          <CardContent className="prose prose-sm max-w-none dark:prose-invert">
            <h4>Informace o účtu:</h4>
            <ul>
              <li>E-mailová adresa</li>
              <li>Heslo (hashované)</li>
              <li>Datum vytvoření účtu</li>
              <li>Stav kreditů</li>
            </ul>
            
            <h4>Informace o používání:</h4>
            <ul>
              <li>Nahrané soubory s titulky (dočasně)</li>
              <li>Historie překladů</li>
              <li>Použité kredity</li>
              <li>Technické logy pro ladění</li>
            </ul>

            <h4>Technické informace:</h4>
            <ul>
              <li>IP adresa</li>
              <li>Typ prohlížeče</li>
              <li>Operační systém</li>
              <li>Cookies a podobné technologie</li>
            </ul>
          </CardContent>
        </Card>

        {/* How We Use Information */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Eye className="h-5 w-5 text-primary" />
              Jak Používáme Informace
            </CardTitle>
          </CardHeader>
          <CardContent className="prose prose-sm max-w-none dark:prose-invert">
            <p>Vaše informace používáme k:</p>
            <ul>
              <li>Poskytování a zlepšování našich služeb</li>
              <li>Zpracování plateb a správě kreditů</li>
              <li>Komunikaci s vámi o vaší službě</li>
              <li>Poskytování technické podpory</li>
              <li>Analýze používání pro zlepšení služby</li>
              <li>Dodržování právních požadavků</li>
            </ul>
          </CardContent>
        </Card>

        {/* Data Security */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Lock className="h-5 w-5 text-primary" />
              Bezpečnost Dat
            </CardTitle>
          </CardHeader>
          <CardContent className="prose prose-sm max-w-none dark:prose-invert">
            <p>
              Implementujeme vhodná technická a organizační opatření k ochraně vašich údajů:
            </p>
            <ul>
              <li>Šifrování dat při přenosu (HTTPS/TLS)</li>
              <li>Bezpečné ukládání hesel (bcrypt hashing)</li>
              <li>Pravidelné bezpečnostní audity</li>
              <li>Omezený přístup k osobním údajům</li>
              <li>Automatické mazání dočasných souborů</li>
            </ul>
          </CardContent>
        </Card>

        {/* Data Retention */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Trash2 className="h-5 w-5 text-primary" />
              Uchovávání Dat
            </CardTitle>
          </CardHeader>
          <CardContent className="prose prose-sm max-w-none dark:prose-invert">
            <ul>
              <li><strong>Nahrané soubory:</strong> Smazány do 24 hodin po zpracování</li>
              <li><strong>Přeložené soubory:</strong> Uchovány 30 dní pro stažení</li>
              <li><strong>Informace o účtu:</strong> Uchovány dokud neodstraníte účet</li>
              <li><strong>Historie překladů:</strong> Uchovány pro analýzy a podporu</li>
              <li><strong>Platební údaje:</strong> Zpracovány Stripe, neukládáme karty</li>
            </ul>
          </CardContent>
        </Card>

        {/* Your Rights */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Vaše Práva</CardTitle>
          </CardHeader>
          <CardContent className="prose prose-sm max-w-none dark:prose-invert">
            <p>Máte právo na:</p>
            <ul>
              <li>Přístup k vašim osobním údajům</li>
              <li>Opravu nesprávných údajů</li>
              <li>Smazání vašich údajů</li>
              <li>Přenositelnost dat</li>
              <li>Námitku proti zpracování</li>
              <li>Stažení souhlasu</li>
            </ul>
            <p>
              Pro uplatnění těchto práv nás kontaktujte na privacy@subtitlebot.com
            </p>
          </CardContent>
        </Card>

        {/* Third Party Services */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Služby Třetích Stran</CardTitle>
          </CardHeader>
          <CardContent className="prose prose-sm max-w-none dark:prose-invert">
            <p>Používáme následující služby třetích stran:</p>
            <ul>
              <li><strong>Firebase:</strong> Autentifikace a databáze</li>
              <li><strong>Stripe:</strong> Zpracování plateb</li>
              <li><strong>OpenNode:</strong> Bitcoin platby</li>
              <li><strong>OpenAI:</strong> AI překlady</li>
              <li><strong>Google Analytics:</strong> Analýzy webu</li>
            </ul>
            <p>
              Každá z těchto služeb má své vlastní zásady ochrany osobních údajů.
            </p>
          </CardContent>
        </Card>

        {/* Contact */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Mail className="h-5 w-5 text-primary" />
              Kontakt
            </CardTitle>
          </CardHeader>
          <CardContent className="prose prose-sm max-w-none dark:prose-invert">
            <p>
              Pokud máte otázky k těmto Zásadám ochrany osobních údajů:
            </p>
            <p>
              <strong>Email:</strong> privacy@subtitlebot.com<br />
              <strong>Obecné dotazy:</strong> support@subtitlebot.com
            </p>
          </CardContent>
        </Card>

        {/* Footer */}
        <div className="text-center">
          <p className="text-sm text-muted-foreground mb-6">
            Přečtěte si také naše <Link href="/cs/terms" className="text-primary hover:underline">Obchodní podmínky</Link> 
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
