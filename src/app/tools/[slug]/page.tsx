import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { getTool, getTools } from '@/content/tools'
import { ToolPage } from '@/components/tools/tool-page'
export function generateStaticParams() { return getTools('en').map(({ slug }) => ({ slug })) }
export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> { const { slug } = await params; const tool = getTool(slug, 'en'); if (!tool) return {}; return { title: tool.title, description: tool.description, alternates: { canonical: `/tools/${slug}`, languages: { en: `/tools/${slug}`, cs: `/cs/tools/${slug}`, 'x-default': `/tools/${slug}` } }, openGraph: { title: tool.title, description: tool.description, url: `/tools/${slug}`, images: ['/og-image-en.png'] } } }
export default async function ToolRoute({ params }: { params: Promise<{ slug: string }> }) { const tool = getTool((await params).slug, 'en'); if (!tool) notFound(); return <ToolPage tool={tool} /> }
