import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowLeft, Cookie, Settings, BarChart3, Shield, Globe } from "lucide-react"

export default function CzechCookiesPage() {
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
              <Cookie className="h-8 w-8 text-primary" />
              <h1 className="text-4xl font-bold text-foreground">Zásady Cookies</h1>
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
              <Cookie className="h-5 w-5 text-primary" />
              Co Jsou Cookies
            </CardTitle>
          </CardHeader>
          <CardContent className="prose prose-sm max-w-none dark:prose-invert">
            <p>
              Cookies jsou malé textové soubory, které se ukládají ve vašem prohlížeči 
              při návštěvě webových stránek. Pomáhají nám poskytovat lepší uživatelský 
              zážitek a analyzovat, jak naše služba funguje.
            </p>
          </CardContent>
        </Card>

        {/* Types of Cookies */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5 text-primary" />
              Typy Cookies, Které Používáme
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            
            {/* Essential Cookies */}
            <div className="border rounded-lg p-4">
              <div className="flex items-center gap-2 mb-3">
                <Shield className="h-5 w-5 text-green-600" />
                <h4 className="font-semibold">Nezbytné Cookies</h4>
                <span className="text-xs bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 px-2 py-1 rounded">
                  Vždy aktivní
                </span>
              </div>
              <p className="text-sm text-muted-foreground mb-2">
                Tyto cookies jsou nezbytné pro základní fungování webu.
              </p>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Autentifikační tokeny</li>
                <li>• Nastavení relace</li>
                <li>• Bezpečnostní cookies</li>
                <li>• Jazykové preference</li>
              </ul>
            </div>

            {/* Functional Cookies */}
            <div className="border rounded-lg p-4">
              <div className="flex items-center gap-2 mb-3">
                <Settings className="h-5 w-5 text-blue-600" />
                <h4 className="font-semibold">Funkční Cookies</h4>
                <span className="text-xs bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 px-2 py-1 rounded">
                  Volitelné
                </span>
              </div>
              <p className="text-sm text-muted-foreground mb-2">
                Zlepšují funkcionalitu a personalizaci.
              </p>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Uživatelské preference</li>
                <li>• Nastavení rozhraní</li>
                <li>• Uložené formuláře</li>
                <li>• Téma (světlé/tmavé)</li>
              </ul>
            </div>

            {/* Analytics Cookies */}
            <div className="border rounded-lg p-4">
              <div className="flex items-center gap-2 mb-3">
                <BarChart3 className="h-5 w-5 text-purple-600" />
                <h4 className="font-semibold">Analytické Cookies</h4>
                <span className="text-xs bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 px-2 py-1 rounded">
                  Volitelné
                </span>
              </div>
              <p className="text-sm text-muted-foreground mb-2">
                Pomáhají nám pochopit, jak používáte naši službu.
              </p>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Google Analytics</li>
                <li>• Statistiky používání</li>
                <li>• Výkonnostní metriky</li>
                <li>• Chybové hlášení</li>
              </ul>
            </div>

          </CardContent>
        </Card>

        {/* Third Party Cookies */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Globe className="h-5 w-5 text-primary" />
              Cookies Třetích Stran
            </CardTitle>
          </CardHeader>
          <CardContent className="prose prose-sm max-w-none dark:prose-invert">
            <p>Některé cookies pocházejí od služeb třetích stran:</p>
            
            <h4>Google Analytics:</h4>
            <ul>
              <li>Sleduje návštěvnost a používání webu</li>
              <li>Pomáhá nám zlepšovat naše služby</li>
              <li>Data jsou anonymizována</li>
            </ul>

            <h4>Stripe:</h4>
            <ul>
              <li>Zpracování plateb</li>
              <li>Prevence podvodů</li>
              <li>Bezpečnostní ověření</li>
            </ul>

            <h4>Firebase:</h4>
            <ul>
              <li>Autentifikace uživatelů</li>
              <li>Správa relací</li>
              <li>Výkonnostní monitoring</li>
            </ul>
          </CardContent>
        </Card>

        {/* Managing Cookies */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5 text-primary" />
              Správa Cookies
            </CardTitle>
          </CardHeader>
          <CardContent className="prose prose-sm max-w-none dark:prose-invert">
            <p>Můžete kontrolovat cookies několika způsoby:</p>
            
            <h4>Nastavení prohlížeče:</h4>
            <ul>
              <li>Blokování všech cookies</li>
              <li>Blokování cookies třetích stran</li>
              <li>Smazání existujících cookies</li>
              <li>Upozornění před uložením cookies</li>
            </ul>

            <h4>Naše nástroje:</h4>
            <ul>
              <li>Centrum preferencí cookies (v patičce)</li>
              <li>Opt-out z analytických cookies</li>
              <li>Správa funkčních cookies</li>
            </ul>

            <p className="text-sm bg-yellow-50 dark:bg-yellow-900/20 p-3 rounded border-l-4 border-yellow-400">
              <strong>Upozornění:</strong> Blokování nezbytných cookies může ovlivnit 
              funkcionalitu webu, včetně přihlašování a používání našich služeb.
            </p>
          </CardContent>
        </Card>

        {/* Legal Basis */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Právní Základ</CardTitle>
          </CardHeader>
          <CardContent className="prose prose-sm max-w-none dark:prose-invert">
            <p>Cookies používáme na základě:</p>
            <ul>
              <li><strong>Nezbytné cookies:</strong> Oprávněný zájem (fungování služby)</li>
              <li><strong>Funkční cookies:</strong> Váš souhlas</li>
              <li><strong>Analytické cookies:</strong> Váš souhlas</li>
            </ul>
          </CardContent>
        </Card>

        {/* Updates */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Aktualizace Zásad</CardTitle>
          </CardHeader>
          <CardContent className="prose prose-sm max-w-none dark:prose-invert">
            <p>
              Tyto Zásady cookies můžeme čas od času aktualizovat. 
              O významných změnách vás budeme informovat prostřednictvím 
              naší služby nebo e-mailem.
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
              Pokud máte otázky k našim Zásadám cookies:
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
            Přečtěte si také naše <Link href="/cs/privacy" className="text-primary hover:underline">Zásady ochrany osobních údajů</Link> 
            a <Link href="/cs/terms" className="text-primary hover:underline">Obchodní podmínky</Link>.
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
