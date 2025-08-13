import type { Metadata } from "next";

export const metadata: Metadata = {
  title: 'Translate Subtitles - SubtitleAI',
  description: 'Translate your subtitle files using AI-powered translation services',
}

export default function TranslateLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}
