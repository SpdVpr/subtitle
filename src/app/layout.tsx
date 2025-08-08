import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
// Build-safe: conditionally import providers only at runtime
const AuthProvider = typeof window !== 'undefined'
  ? require("@/components/providers/auth-provider").AuthProvider
  : ({ children }: { children: React.ReactNode }) => <>{children}</>

const SubscriptionProvider = typeof window !== 'undefined'
  ? require("@/components/providers/subscription-provider").SubscriptionProvider
  : ({ children }: { children: React.ReactNode }) => <>{children}</>

const BatchProvider = typeof window !== 'undefined'
  ? require("@/components/providers/batch-provider").BatchProvider
  : ({ children }: { children: React.ReactNode }) => <>{children}</>

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
});

export const metadata: Metadata = {
  title: "SubtitleAI - AI-Powered Subtitle Translation",
  description: "Translate and retime your subtitles with AI. Fast, accurate, and easy to use.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.variable} font-sans antialiased`}>
        <AuthProvider>
          <SubscriptionProvider>
            <BatchProvider>
              <div className="relative flex min-h-screen flex-col">
                <Header />
                <main className="flex-1">{children}</main>
                <Footer />
              </div>
            </BatchProvider>
          </SubscriptionProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
