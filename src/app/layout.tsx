import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { AuthProvider } from "@/components/providers/auth-provider";
import { SubscriptionProvider } from "@/components/providers/subscription-provider";
import { BatchProvider } from "@/components/providers/batch-provider";

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
