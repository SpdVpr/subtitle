import type { Metadata } from 'next'
import { ToolHub } from '@/components/tools/tool-hub'
export const metadata: Metadata = { title: 'Free Subtitle Tools: Sync, Validate, Convert and Analyze', description: 'Free browser-based tools to sync subtitles, convert FPS and formats, validate SRT or VTT, analyze reading speed, and normalize encoding.', alternates: { canonical: '/tools', languages: { en: '/tools', cs: '/cs/tools', 'x-default': '/tools' } }, openGraph: { title: 'Free Subtitle Tools | SubtitleBot', description: 'Repair and analyze subtitle files locally in your browser.', url: '/tools', images: ['/og-image-en.png'] } }
export default function ToolsPage() { return <ToolHub locale="en" /> }
