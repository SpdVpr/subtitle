import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { getTool, getTools } from '@/content/tools'
import { ToolPage } from '@/components/tools/tool-page'
export function generateStaticParams() { return getTools('cs').map(({ slug }) => ({ slug })) }
export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> { const { slug } = await params; const tool = getTool(slug, 'cs'); if (!tool) return {}; return { title: tool.title, description: tool.description, alternates: { canonical: `/cs/tools/${slug}`, languages: { en: `/tools/${slug}`, cs: `/cs/tools/${slug}`, 'x-default': `/tools/${slug}` } }, openGraph: { title: tool.title, description: tool.description, url: `/cs/tools/${slug}`, images: ['/og-image-cs.png'] } } }
export default async function CzechToolRoute({ params }: { params: Promise<{ slug: string }> }) { const tool = getTool((await params).slug, 'cs'); if (!tool) notFound(); return <ToolPage tool={tool} /> }
