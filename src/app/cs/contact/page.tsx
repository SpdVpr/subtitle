import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ContactForm } from "@/components/forms/contact-form"
import { ArrowLeft, Mail, Clock, MapPin, Phone, MessageCircle, Headphones } from "lucide-react"

export default function CzechContactPage() {
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-12 max-w-6xl">
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
              <MessageCircle className="h-8 w-8 text-primary" />
              <h1 className="text-4xl font-bold text-foreground">Kontaktujte Nás</h1>
            </div>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Máte otázku, potřebujete podporu nebo chcete sdílet zpětnou vazbu? Jsme tu, abychom pomohli!
              Pošlete nám zprávu a ozveme se vám co nejdříve.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Contact Form */}
          <div className="lg:col-span-2">
            <ContactForm />
          </div>

          {/* Contact Information */}
          <div className="space-y-6">
            {/* Quick Contact */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Headphones className="h-5 w-5 text-primary" />
                  Rychlý Kontakt
                </CardTitle>
                <CardDescription>
                  Potřebujete okamžitou pomoc? Zde jsou nejrychlejší způsoby, jak nás kontaktovat.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-3">
                  <Mail className="h-5 w-5 text-primary" />
                  <div>
                    <p className="font-medium">Email</p>
                    <p className="text-sm text-muted-foreground">support@subtitlebot.com</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Clock className="h-5 w-5 text-primary" />
                  <div>
                    <p className="font-medium">Doba Odezvy</p>
                    <p className="text-sm text-muted-foreground">Obvykle do 24 hodin</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Support Hours */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="h-5 w-5 text-primary" />
                  Podpora
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>Pondělí - Pátek</span>
                    <span className="text-muted-foreground">9:00 - 18:00 CET</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Víkend</span>
                    <span className="text-muted-foreground">Omezená podpora</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Svátky</span>
                    <span className="text-muted-foreground">Pouze email</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* FAQ Link */}
            <Card>
              <CardHeader>
                <CardTitle>Často Kladené Otázky</CardTitle>
                <CardDescription>
                  Možná najdete odpověď na svou otázku v našich FAQ.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button variant="outline" className="w-full" asChild>
                  <Link href="/faq">Zobrazit FAQ</Link>
                </Button>
              </CardContent>
            </Card>

            {/* Common Issues */}
            <Card>
              <CardHeader>
                <CardTitle>Běžné Problémy</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 text-sm">
                  <div>
                    <p className="font-medium">Problémy s překladem</p>
                    <p className="text-muted-foreground">Zkontrolujte formát SRT souboru</p>
                  </div>
                  <div>
                    <p className="font-medium">Platební problémy</p>
                    <p className="text-muted-foreground">Ověřte údaje o platební kartě</p>
                  </div>
                  <div>
                    <p className="font-medium">Problémy s účtem</p>
                    <p className="text-muted-foreground">Zkuste se odhlásit a znovu přihlásit</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Additional Help */}
        <div className="mt-12 text-center">
          <h3 className="text-xl font-semibold mb-4">Potřebujete Další Pomoc?</h3>
          <p className="text-muted-foreground mb-6 max-w-2xl mx-auto">
            Pokud nemůžete najít odpověď na svou otázku, neváhejte nás kontaktovat. 
            Náš tým je připraven pomoci s jakýmkoli problémem nebo dotazem.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button asChild>
              <Link href="/cs/translate">Začít Překládat</Link>
            </Button>
            <Button variant="outline" asChild>
              <Link href="/cs/about">O Nás</Link>
            </Button>
          </div>
        </div>

        {/* Contact Types */}
        <div className="mt-12 grid md:grid-cols-3 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">🐛 Nahlášení Chyby</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">
                Našli jste chybu? Pomozte nám ji opravit tím, že nám pošlete podrobný popis.
              </p>
              <ul className="text-xs text-muted-foreground space-y-1">
                <li>• Popište kroky k reprodukci</li>
                <li>• Přiložte snímky obrazovky</li>
                <li>• Uveďte prohlížeč a operační systém</li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">💡 Návrh Funkce</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">
                Máte nápad na novou funkci? Rádi si vyslechneme vaše návrhy!
              </p>
              <ul className="text-xs text-muted-foreground space-y-1">
                <li>• Popište požadovanou funkci</li>
                <li>• Vysvětlete, jak by vám pomohla</li>
                <li>• Uveďte případy použití</li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">🤝 Obchodní Dotazy</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">
                Zajímá vás partnerství nebo máte obchodní dotaz?
              </p>
              <ul className="text-xs text-muted-foreground space-y-1">
                <li>• API integrace</li>
                <li>• Podnikové licence</li>
                <li>• Vlastní řešení</li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
