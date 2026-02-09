import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { Providers } from "@/components/providers/providers"
import { Toaster } from "sonner"
import { CookieBannerWrapper } from "@/components/cookie-banner-wrapper"
import { GoogleAnalytics } from "@/components/analytics/google-analytics"
import { LocaleAwareLayout } from "@/components/layout/locale-aware-layout"
import { StructuredData } from "@/components/seo/structured-data"
import { PerformanceOptimizer, defaultCriticalResources } from "@/components/seo/performance-optimizer"


const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
  display: 'swap',
  preload: true,
});

export const metadata: Metadata = {
  title: {
    default: "SubtitleBot - AI-Powered Subtitle Translation | 100+ Languages",
    template: "%s | SubtitleBot - AI Subtitle Translation"
  },
  description: "Professional AI subtitle translation service supporting 100+ languages. Fast, accurate, context-aware translations for movies, TV shows, and videos. Free credits included. No subscription required.",
  keywords: [
    // Core translation terms
    "subtitle translation",
    "AI subtitle translator",
    "SRT translator",
    "VTT translator",
    "video subtitle translation",
    "subtitle converter",
    "multilingual subtitles",
    "automatic subtitle translation",

    // AI and technology terms
    "Google AI translation",
    "Gemini AI subtitle translation",
    "AI-powered subtitles",
    "machine translation subtitles",
    "contextual translation",
    "neural subtitle translation",

    // File formats and technical
    "SRT file translator",
    "VTT file converter",
    "ASS subtitle translation",
    "SSA subtitle converter",
    "subtitle file formats",
    "subtitle timing adjustment",
    "subtitle synchronization",

    // Video and media terms
    "video localization",
    "movie subtitle translation",
    "TV show subtitles",
    "YouTube subtitle translation",
    "video content translation",
    "media localization",
    "film subtitle converter",

    // Tools and features
    "subtitle editor",
    "batch subtitle translation",
    "subtitle search engine",
    "floating subtitles",
    "subtitle overlay",
    "video player with subtitles",

    // Language specific
    "translate subtitles to English",
    "translate subtitles to Spanish",
    "translate subtitles to French",
    "translate subtitles to German",
    "translate subtitles to Chinese",
    "translate subtitles to Japanese",
    "translate subtitles to Korean",
    "translate subtitles to Arabic",

    // Business terms
    "professional subtitle translation",
    "subtitle translation service",
    "online subtitle translator",
    "free subtitle translation",
    "premium subtitle translation"
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
    canonical: '/',
  },
  openGraph: {
    title: "SubtitleBot - AI-Powered Subtitle Translation | 100+ Languages",
    description: "Professional AI subtitle translation service supporting 100+ languages. Fast, accurate, context-aware translations for movies, TV shows, and videos. Free credits included.",
    url: '/',
    siteName: "SubtitleBot",
    images: [
      {
        url: '/og-image-en.png',
        width: 1200,
        height: 630,
        alt: "SubtitleBot - AI-Powered Subtitle Translation with 100+ Language Support",
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: "SubtitleBot - AI-Powered Subtitle Translation | 100+ Languages",
    description: "Professional AI subtitle translation service. Fast, accurate, context-aware translations for movies, TV shows, and videos. Free credits included.",
    images: ['/og-image-en.png'],
    creator: '@SubtitleBot',
    site: '@SubtitleBot',
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

// Force dynamic rendering to avoid prerender-time side effects
export const dynamic = 'force-dynamic'
export const revalidate = 0
export const fetchCache = 'force-no-store'

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://subtitle-ai.vercel.app'

  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        {/* Preload critical resources */}
        <link rel="preload" href="/logo-sub.png" as="image" type="image/png" />
        <link rel="dns-prefetch" href="https://fonts.googleapis.com" />
        <link rel="dns-prefetch" href="https://fonts.gstatic.com" />
        <link rel="dns-prefetch" href="https://api.openai.com" />
        <link rel="dns-prefetch" href="https://www.googletagmanager.com" />
        <link rel="manifest" href="/manifest.json" />

        {/* Google Analytics */}
        <GoogleAnalytics />

        {/* Structured Data */}
        <StructuredData locale="en" page="home" />

        {/* Performance Optimization */}
        <PerformanceOptimizer
          enablePreloading={true}
          enablePrefetching={true}
          criticalResources={defaultCriticalResources}
        />

        {/* Hreflang tags for SEO */}
        <link rel="alternate" hrefLang="en" href={`${baseUrl}`} />
        <link rel="alternate" hrefLang="cs" href={`${baseUrl}/cs`} />
        <link rel="alternate" hrefLang="x-default" href={`${baseUrl}`} />
      </head>
      <body className={`${inter.variable} font-sans antialiased bg-background text-foreground`}>


        <Providers>
          <LocaleAwareLayout>
            {children}
          </LocaleAwareLayout>
          <Toaster
            theme="system"
            className="toaster group"
            toastOptions={{
              classNames: {
                toast: "group toast group-[.toaster]:bg-background group-[.toaster]:text-foreground group-[.toaster]:border-border group-[.toaster]:shadow-lg",
                description: "group-[.toast]:text-muted-foreground",
                actionButton: "group-[.toast]:bg-primary group-[.toast]:text-primary-foreground",
                cancelButton: "group-[.toast]:bg-muted group-[.toast]:text-muted-foreground",
              },
            }}
          />
          <CookieBannerWrapper />
        </Providers>


      </body>
    </html>
  );
}
