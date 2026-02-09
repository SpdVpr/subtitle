import type { Metadata } from "next";
import { StructuredData } from "@/components/seo/structured-data";

export const metadata: Metadata = {
  title: {
    default: "SubtitleBot - AI Překlad Titulků",
    template: "%s | SubtitleBot"
  },
  description: "Profesionální AI služba pro překlad titulků s podporou 100+ jazyků. Rychlé, přesné, kontextové překlady pro filmy, seriály a videa. Zdarma kredity v ceně. Bez předplatného.",
  keywords: [
    // Základní překladové termíny
    "překlad titulků",
    "AI překladač titulků",
    "SRT překladač",
    "VTT překladač",
    "překlad video titulků",
    "konvertor titulků",
    "vícejazyčné titulky",
    "automatický překlad titulků",

    // AI a technologie
    "Google AI překlad",
    "Gemini AI překlad titulků",
    "AI titulky",
    "strojový překlad titulků",
    "kontextový překlad",
    "neuronový překlad titulků",

    // Formáty souborů
    "SRT soubor překladač",
    "VTT konvertor",
    "ASS překlad titulků",
    "SSA konvertor titulků",
    "formáty titulků",
    "úprava časování titulků",
    "synchronizace titulků",

    // Video a média
    "lokalizace videa",
    "překlad filmových titulků",
    "TV seriálové titulky",
    "YouTube překlad titulků",
    "překlad video obsahu",
    "lokalizace médií",

    // Nástroje a funkce
    "editor titulků",
    "dávkový překlad titulků",
    "vyhledávač titulků",
    "plovoucí titulky",
    "overlay titulků",
    "video přehrávač s titulky",

    // Jazykově specifické
    "přeložit titulky do češtiny",
    "přeložit titulky do angličtiny",
    "přeložit titulky do němčiny",
    "přeložit titulky do francouzštiny",
    "přeložit titulky do španělštiny",

    // Obchodní termíny
    "profesionální překlad titulků",
    "služba překladu titulků",
    "online překladač titulků",
    "zdarma překlad titulků",
    "prémiový překlad titulků"
  ],
  authors: [{ name: "SubtitleBot Team" }],
  creator: "SubtitleBot",
  publisher: "SubtitleBot",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || 'https://subtitle-ai.vercel.app'),
  alternates: {
    canonical: '/cs',
    languages: {
      'en': '/',
      'cs': '/cs',
    },
  },
  openGraph: {
    title: "SubtitleBot - AI Překlad Titulků",
    description: "Překládejte a upravujte titulky pomocí AI. Rychlé, přesné a jednoduché použití. Podpora 100+ jazyků s kontextovým překladem.",
    url: '/cs',
    siteName: "SubtitleBot",
    images: [
      {
        url: '/og-image-cs.png',
        width: 1200,
        height: 630,
        alt: "SubtitleBot - AI Překlad Titulků",
      },
    ],
    locale: 'cs_CZ',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: "SubtitleBot - AI Překlad Titulků",
    description: "Překládejte a upravujte titulky pomocí AI. Rychlé, přesné a jednoduché použití.",
    images: ['/og-image-cs.png'],
    creator: '@SubtitleBot',
  },
  robots: {
    index: true,
    follow: true,
    nocache: false,
    googleBot: {
      index: true,
      follow: true,
      noimageindex: false,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  icons: {
    icon: '/logo-sub.png',
    shortcut: '/logo-sub.png',
    apple: '/logo-sub.png',
  },
  manifest: '/manifest.json',
};

export default function CsLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <>
      <StructuredData locale="cs" page="home" />
      {children}
    </>
  )
}
