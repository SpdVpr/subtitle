import type { Metadata } from 'next'
import { ToolHub } from '@/components/tools/tool-hub'
export const metadata: Metadata = { title: 'Bezplatné nástroje pro titulky', description: 'Synchronizace, převod FPS a formátů, validace SRT/VTT, analýza čitelnosti a oprava kódování přímo v prohlížeči.', alternates: { canonical: '/cs/tools', languages: { en: '/tools', cs: '/cs/tools', 'x-default': '/tools' } }, openGraph: { title: 'Nástroje pro titulky | SubtitleBot', description: 'Opravte a analyzujte subtitle soubory lokálně.', url: '/cs/tools', images: ['/og-image-cs.png'] } }
export default function CzechToolsPage() { return <ToolHub locale="cs" /> }
