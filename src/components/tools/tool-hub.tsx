import Link from 'next/link'
import { ArrowRight, Gauge, ScanSearch, TimerReset, FileType2, Binary } from 'lucide-react'
import { getTools, ToolLocale, ToolMode } from '@/content/tools'

const icons: Record<ToolMode, typeof TimerReset> = { sync: TimerReset, validator: ScanSearch, 'reading-speed': Gauge, converter: FileType2, encoding: Binary }

export function ToolHub({ locale }: { locale: ToolLocale }) {
  const isCs = locale === 'cs'
  const prefix = isCs ? '/cs' : ''
  return (
    <main className="py-12 sm:py-16">
      <div className="container mx-auto px-4 max-w-6xl">
        <header className="max-w-3xl mb-12">
          <h1 className="text-4xl sm:text-5xl font-bold tracking-tight mb-5">{isCs ? 'Bezplatné online nástroje pro titulky' : 'Free online subtitle tools'}</h1>
          <p className="text-lg text-muted-foreground leading-relaxed">{isCs ? 'Opravte časování, převeďte FPS a formát, validujte strukturu, změřte čitelnost nebo normalizujte kódování. Soubory se zpracují lokálně.' : 'Repair timing, convert FPS and formats, validate structure, measure readability, or normalize encoding. Files are processed locally.'}</p>
        </header>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {getTools(locale).map((tool) => { const Icon = icons[tool.mode]; return (
            <article key={tool.slug} className="group rounded-2xl border p-6 bg-card hover:border-primary/40 hover:shadow-lg transition-all">
              <div className="w-11 h-11 rounded-xl bg-primary/10 text-primary flex items-center justify-center mb-5"><Icon className="h-6 w-6" /></div>
              <h2 className="text-xl font-bold mb-3"><Link href={`${prefix}/tools/${tool.slug}`}>{tool.title}</Link></h2>
              <p className="text-sm text-muted-foreground leading-relaxed mb-5">{tool.shortDescription}</p>
              <Link href={`${prefix}/tools/${tool.slug}`} className="inline-flex items-center gap-2 text-primary font-semibold">{isCs ? 'Otevřít nástroj' : 'Open tool'} <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" /></Link>
            </article>
          ) })}
        </div>
        <section className="mt-14 rounded-2xl border p-8">
          <h2 className="text-2xl font-bold mb-3">{isCs ? 'Nejste si jistí, jakou opravu použít?' : 'Not sure which repair you need?'}</h2>
          <p className="text-muted-foreground mb-5">{isCs ? 'Praktické návody vysvětlují rozdíl mezi posunem, FPS driftem, jiným střihem a problémy s kódováním.' : 'The practical guides explain constant offsets, FPS drift, different cuts, and encoding problems.'}</p>
          <Link href={`${prefix}/guides`} className="font-semibold text-primary hover:underline">{isCs ? 'Otevřít návody →' : 'Read the guides →'}</Link>
        </section>
      </div>
    </main>
  )
}
