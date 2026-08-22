import Link from "next/link"
import Image from "next/image"
import { Mail, Heart, Globe, Gamepad2, ExternalLink, Twitch, Youtube, Zap } from "lucide-react"

const liveStreams = [
  { name: 'Twitch', href: 'https://twitch.tv/movies_quiz', Icon: Twitch, color: 'text-purple-500 hover:text-purple-400' },
  { name: 'Kick', href: 'https://kick.com/ultiquiz', Icon: Zap, color: 'text-green-500 hover:text-green-400' },
  { name: 'YouTube', href: 'https://youtube.com/@TheUltimateMovieQuiz', Icon: Youtube, color: 'text-red-500 hover:text-red-400' },
]

interface FooterProps {
  locale?: 'en' | 'cs'
}

export function Footer({ locale = 'en' }: FooterProps) {
  const currentYear = new Date().getFullYear()
  const langPrefix = locale === 'cs' ? '/cs' : ''

  return (
    <footer className="border-t bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4 py-8 sm:py-12">
        {/* Main Footer Content */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8 mb-6 sm:mb-8">
          {/* Brand Section */}
          <div className="sm:col-span-2 lg:col-span-1">
            <div className="flex items-center space-x-2 mb-4">
              <Image
                src="/logo-sub.png"
                alt="SubtitleBot"
                width={32}
                height={32}
                className="h-8 w-auto"
              />
              <span className="text-lg sm:text-xl font-bold text-foreground">SubtitleBot</span>
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed mb-4">
              {locale === 'cs'
                ? 'AI překladač titulků s úpravou časování. Rychlý, přesný a snadný na použití pro tvůrce po celém světě.'
                : 'AI-powered subtitle translation and timing adjustment. Fast, accurate, and easy to use for creators worldwide.'
              }
            </p>
            <div className="flex items-center space-x-4">
              <Link
                href={`${langPrefix}/contact`}
                className="text-muted-foreground hover:text-foreground transition-colors"
                aria-label="Contact"
              >
                <Mail className="h-5 w-5" />
              </Link>
            </div>

            {/* Live movie quiz streams */}
            <div className="mt-5">
              <div className="flex items-center gap-2 mb-2.5">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75" />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500" />
                </span>
                <Link
                  href={`${langPrefix}/live`}
                  className="text-xs font-semibold tracking-wide text-foreground hover:text-primary transition-colors"
                >
                  {locale === 'cs' ? 'FILMOVÝ KVÍZ LIVE 24/7' : 'MOVIE QUIZ LIVE 24/7'}
                </Link>
              </div>
              <div className="flex items-center gap-3">
                {liveStreams.map(({ name, href, Icon, color }) => (
                  <a
                    key={name}
                    href={href}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={`${name} — movie quiz live stream`}
                    className={`transition-colors ${color}`}
                  >
                    <Icon className="h-5 w-5" />
                  </a>
                ))}
              </div>
            </div>
          </div>

          {/* Product Links */}
          <div>
            <h3 className="font-semibold text-foreground mb-4">
              {locale === 'cs' ? 'Produkt' : 'Product'}
            </h3>
            <ul className="space-y-3">
              <li>
                <Link
                  href={`${langPrefix}/translate`}
                  className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  {locale === 'cs' ? 'Přeložit Titulky' : 'Translate Subtitles'}
                </Link>
              </li>
              <li>
                <Link
                  href={`${langPrefix}/subtitles-search`}
                  className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  {locale === 'cs' ? 'Najít Titulky' : 'Find Subtitles'}
                </Link>
              </li>
              <li>
                <Link
                  href={`${langPrefix}/subtitles/movies`}
                  className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  {locale === 'cs' ? 'Katalog Titulků' : 'Subtitle Catalog'}
                </Link>
              </li>
              <li>
                <Link
                  href={`${langPrefix}/tools`}
                  className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  {locale === 'cs' ? 'Opravit Titulky' : 'Subtitle Tools'}
                </Link>
              </li>
              <li>
                <Link
                  href={`${langPrefix}/guides`}
                  className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  {locale === 'cs' ? 'Návody' : 'Guides'}
                </Link>
              </li>
              <li>
                <Link
                  href={`${langPrefix}/video-tools`}
                  className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  {locale === 'cs' ? 'Video Nástroje' : 'Video Tools'}
                </Link>
              </li>
              <li>
                <Link
                  href={`${langPrefix}/buy-credits`}
                  className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  {locale === 'cs' ? 'Koupit Kredity' : 'Buy Credits'}
                </Link>
              </li>
              <li>
                <Link
                  href="https://ultiquiz.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-muted-foreground hover:text-foreground transition-colors inline-flex items-center gap-1.5 group"
                >
                  <Gamepad2 className="h-3.5 w-3.5 text-amber-500" />
                  {locale === 'cs' ? 'UltiQuiz – Filmový Kvíz' : 'UltiQuiz – Movie Quiz'}
                  <ExternalLink className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                </Link>
              </li>
            </ul>
          </div>

          {/* Company Links */}
          <div>
            <h3 className="font-semibold text-foreground mb-4">
              {locale === 'cs' ? 'Společnost' : 'Company'}
            </h3>
            <ul className="space-y-3">
              <li>
                <Link
                  href={`${langPrefix}/about`}
                  className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  {locale === 'cs' ? 'O Nás' : 'About Us'}
                </Link>
              </li>
              <li>
                <Link
                  href={`${langPrefix}/contact`}
                  className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  {locale === 'cs' ? 'Kontakt' : 'Contact'}
                </Link>
              </li>
              <li>
                <Link
                  href={`${langPrefix}/feedback`}
                  className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  {locale === 'cs' ? 'Zpětná Vazba' : 'Feedback'}
                </Link>
              </li>
            </ul>
          </div>

          {/* Legal Links */}
          <div>
            <h3 className="font-semibold text-foreground mb-4">
              {locale === 'cs' ? 'Právní' : 'Legal'}
            </h3>
            <ul className="space-y-3">
              <li>
                <Link
                  href={`${langPrefix}/privacy`}
                  className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  {locale === 'cs' ? 'Zásady Ochrany Soukromí' : 'Privacy Policy'}
                </Link>
              </li>
              <li>
                <Link
                  href={`${langPrefix}/terms`}
                  className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  {locale === 'cs' ? 'Podmínky Služby' : 'Terms of Service'}
                </Link>
              </li>
              <li>
                <Link
                  href={`${langPrefix}/cookies`}
                  className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  {locale === 'cs' ? 'Zásady Cookies' : 'Cookie Policy'}
                </Link>
              </li>
              <li>
                <Link
                  href={`${langPrefix}/cookie-settings`}
                  className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  {locale === 'cs' ? 'Nastavení Cookies' : 'Cookie Settings'}
                </Link>
              </li>
              <li>
                <Link
                  href={`${langPrefix}/gdpr`}
                  className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  {locale === 'cs' ? 'GDPR Compliance' : 'GDPR Compliance'}
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="border-t border-border pt-6 sm:pt-8">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left">
            <div className="flex items-center space-x-2 text-xs sm:text-sm text-muted-foreground">
              <span>© {currentYear} SubtitleBot. All rights reserved.</span>
            </div>
            <div className="flex items-center space-x-2 text-xs sm:text-sm text-muted-foreground">
              <span>{locale === 'cs' ? 'Vytvořeno s' : 'Built with'}</span>
              <Heart className="h-3 w-3 sm:h-4 sm:w-4 text-red-500" />
              <span>{locale === 'cs' ? 'pro tvůrce titulků' : 'for subtitle creators'}</span>
              <Globe className="h-3 w-3 sm:h-4 sm:w-4 text-primary" />
              <span>{locale === 'cs' ? 'po celém světě' : 'worldwide'}</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}
