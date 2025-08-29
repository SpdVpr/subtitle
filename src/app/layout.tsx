import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { Providers } from "@/components/providers/providers"
import { Toaster } from "sonner"
import { CookieBannerWrapper } from "@/components/cookie-banner-wrapper"
import { GoogleAnalytics } from "@/components/analytics/google-analytics"


const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
  display: 'swap',
  preload: true,
});

export const metadata: Metadata = {
  title: {
    default: "SubtitleBot - AI-Powered Subtitle Translation",
    template: "%s | SubtitleBot"
  },
  description: "Translate and retime your subtitles with AI. Fast, accurate, and easy to use. Support for 100+ languages with context-aware translation.",
  keywords: [
    "subtitle translation",
    "AI subtitles",
    "SRT translator",
    "video subtitles",
    "subtitle converter",
    "multilingual subtitles",
    "OpenAI translation",
    "subtitle timing",
    "video localization",
    "subtitle editor"
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
    title: "SubtitleBot - AI-Powered Subtitle Translation",
    description: "Translate and retime your subtitles with AI. Fast, accurate, and easy to use. Support for 100+ languages with context-aware translation.",
    url: '/',
    siteName: "SubtitleBot",
    images: [
      {
        url: '/og-image.jpg',
        width: 1200,
        height: 630,
        alt: "SubtitleBot - AI-Powered Subtitle Translation",
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: "SubtitleBot - AI-Powered Subtitle Translation",
    description: "Translate and retime your subtitles with AI. Fast, accurate, and easy to use.",
    images: ['/twitter-image.jpg'],
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

        {/* Hreflang tags for SEO */}
        <link rel="alternate" hrefLang="en" href={`${baseUrl}`} />
        <link rel="alternate" hrefLang="cs" href={`${baseUrl}/cs`} />
        <link rel="alternate" hrefLang="x-default" href={`${baseUrl}`} />
      </head>
      <body className={`${inter.variable} font-sans antialiased bg-background text-foreground`}>


        <Providers>
          <div className="relative flex min-h-screen flex-col bg-background">
            <Header />
            <main className="flex-1 bg-background">{children}</main>
            <Footer />
          </div>
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
