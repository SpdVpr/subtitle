import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowLeft, Shield, Download, Trash2, Edit, Eye, Mail, AlertCircle } from "lucide-react"

export default function CzechGDPRPage() {
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
              <h1 className="text-4xl font-bold text-foreground">GDPR a Vaše Práva</h1>
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
              Obecné Nařízení o Ochraně Údajů (GDPR)
            </CardTitle>
          </CardHeader>
          <CardContent className="prose prose-sm max-w-none dark:prose-invert">
            <p>
              Obecné nařízení o ochraně údajů (GDPR) je evropský zákon, který vám dává
              kontrolu nad vašimi osobními údaji. SubtitleBot plně dodržuje GDPR
              a zavazuje se chránit vaše soukromí.
            </p>
          </CardContent>
        </Card>

        {/* Your Rights */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold mb-6 text-center">Vaše Práva Podle GDPR</h2>
          <div className="grid md:grid-cols-2 gap-6">

            {/* Right to Access */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Eye className="h-5 w-5 text-primary" />
                  Právo na Přístup
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-3">
                  Máte právo vědět, jaké osobní údaje o vás zpracováváme.
                </p>
                <ul className="text-xs text-muted-foreground space-y-1">
                  <li>• Jaké údaje máme</li>
                  <li>• Proč je zpracováváme</li>
                  <li>• Jak dlouho je uchováváme</li>
                  <li>• S kým je sdílíme</li>
                </ul>
              </CardContent>
            </Card>

            {/* Right to Rectification */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Edit className="h-5 w-5 text-primary" />
                  Právo na Opravu
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-3">
                  Můžete požádat o opravu nesprávných nebo neúplných údajů.
                </p>
                <ul className="text-xs text-muted-foreground space-y-1">
                  <li>• Aktualizace e-mailu</li>
                  <li>• Oprava profilových údajů</li>
                  <li>• Doplnění chybějících informací</li>
                </ul>
              </CardContent>
            </Card>

            {/* Right to Erasure */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Trash2 className="h-5 w-5 text-primary" />
                  Právo na Výmaz
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-3">
                  Můžete požádat o smazání vašich osobních údajů.
                </p>
                <ul className="text-xs text-muted-foreground space-y-1">
                  <li>• Smazání účtu</li>
                  <li>• Odstranění historie</li>
                  <li>• Vymazání nahraných souborů</li>
                </ul>
              </CardContent>
            </Card>

            {/* Right to Data Portability */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Download className="h-5 w-5 text-primary" />
                  Právo na Přenositelnost
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-3">
                  Můžete získat kopii vašich údajů ve strukturovaném formátu.
                </p>
                <ul className="text-xs text-muted-foreground space-y-1">
                  <li>• Export dat v JSON formátu</li>
                  <li>• Historie překladů</li>
                  <li>• Informace o účtu</li>
                </ul>
              </CardContent>
            </Card>

          </div>
        </div>

        {/* How to Exercise Rights */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Mail className="h-5 w-5 text-primary" />
              Jak Uplatnit Vaše Práva
            </CardTitle>
          </CardHeader>
          <CardContent className="prose prose-sm max-w-none dark:prose-invert">
            <p>
              Pro uplatnění jakéhokoli z vašich práv podle GDPR:
            </p>

            <h4>1. Kontaktujte nás:</h4>
            <ul>
              <li><strong>Email:</strong> privacy@subtitlebot.com</li>
              <li><strong>Předmět:</strong> "GDPR Request - [typ požadavku]"</li>
            </ul>

            <h4>2. Uveďte následující informace:</h4>
            <ul>
              <li>Vaše jméno a e-mailová adresa</li>
              <li>Typ požadavku (přístup, oprava, výmaz, atd.)</li>
              <li>Konkrétní údaje, kterých se požadavek týká</li>
              <li>Důvod požadavku (pokud je relevantní)</li>
            </ul>

            <h4>3. Doba zpracování:</h4>
            <ul>
              <li>Odpovíme do 72 hodin</li>
              <li>Požadavek zpracujeme do 30 dnů</li>
              <li>Složité případy mohou trvat až 60 dnů</li>
            </ul>
          </CardContent>
        </Card>

        {/* Data Processing */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Právní Základ Zpracování</CardTitle>
          </CardHeader>
          <CardContent className="prose prose-sm max-w-none dark:prose-invert">
            <p>Vaše údaje zpracováváme na základě:</p>

            <h4>Smlouva:</h4>
            <ul>
              <li>Poskytování služeb překladu</li>
              <li>Správa účtu a kreditů</li>
              <li>Zpracování plateb</li>
            </ul>

            <h4>Oprávněný zájem:</h4>
            <ul>
              <li>Zlepšování našich služeb</li>
              <li>Bezpečnost a prevence podvodů</li>
              <li>Technická podpora</li>
            </ul>

            <h4>Souhlas:</h4>
            <ul>
              <li>Marketingové komunikace</li>
              <li>Analytické cookies</li>
              <li>Volitelné funkce</li>
            </ul>
          </CardContent>
        </Card>

        {/* Data Transfers */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Mezinárodní Přenosy</CardTitle>
          </CardHeader>
          <CardContent className="prose prose-sm max-w-none dark:prose-invert">
            <p>
              Některé naše služby třetích stran mohou zpracovávat data mimo EU:
            </p>
            <ul>
              <li><strong>Google (USA):</strong> Standardní smluvní doložky</li>
              <li><strong>Google Analytics (USA):</strong> Adequacy decision</li>
              <li><strong>Stripe (USA):</strong> Standardní smluvní doložky</li>
            </ul>
            <p>
              Všechny přenosy jsou chráněny vhodnými zárukami podle GDPR.
            </p>
          </CardContent>
        </Card>

        {/* Complaints */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-primary" />
              Stížnosti
            </CardTitle>
          </CardHeader>
          <CardContent className="prose prose-sm max-w-none dark:prose-invert">
            <p>
              Pokud se domníváte, že zpracováváme vaše údaje nezákonně,
              máte právo podat stížnost u dozorového úřadu:
            </p>
            <ul>
              <li><strong>Česká republika:</strong> Úřad pro ochranu osobních údajů</li>
              <li><strong>Slovensko:</strong> Úrad na ochranu osobných údajov</li>
              <li><strong>Ostatní EU:</strong> Místní dozorový úřad</li>
            </ul>
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
              <Link href="mailto:privacy@subtitlebot.com">Kontaktovat o GDPR</Link>
            </Button>
            <Button variant="outline" asChild>
              <Link href="/cs/contact">Obecné Dotazy</Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
