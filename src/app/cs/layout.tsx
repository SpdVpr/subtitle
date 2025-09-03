import type { Metadata } from "next";

export const metadata: Metadata = {
  title: {
    default: "SubtitleBot - AI Překlad Titulků",
    template: "%s | SubtitleBot"
  },
  description: "Překládejte a upravujte titulky pomocí AI. Rychlé, přesné a jednoduché použití. Podpora 100+ jazyků s kontextovým překladem.",
  keywords: [
    "překlad titulků",
    "AI překlad",
    "SubtitleBot",
    "SRT překlad", 
    "VTT překlad",
    "automatický překlad",
    "titulky česky",
    "překladač titulků",
    "AI titulky",
    "video titulky",
    "film titulky",
    "YouTube titulky"
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
  return children
}
