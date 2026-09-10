import type { Metadata } from "next";

// Czech section defaults. Titles, canonicals and hreflang are declared per
// page (see src/lib/seo.ts) so nothing here cascades a wrong canonical.
export const metadata: Metadata = {
  description: "Profesionální AI překlad titulků ve 100+ jazycích. První kompletní soubor titulků zdarma, bez platební karty a předplatného.",
  openGraph: {
    siteName: "SubtitleBot",
    locale: 'cs_CZ',
    type: 'website',
    images: [
      {
        url: '/og-image-cs.png',
        width: 1200,
        height: 630,
        alt: "SubtitleBot - AI překlad, vyhledávání a úprava titulků",
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    images: ['/og-image-cs.png'],
  },
};

export default function CsLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
