import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { GuideArticle } from '@/components/guides/guide-article'
import { getGuide, getGuides } from '@/content/guides'

export function generateStaticParams() { return getGuides('cs').map(({ slug }) => ({ slug })) }

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params
  const guide = getGuide(slug, 'cs')
  if (!guide) return {}
  return {
    title: guide.title, description: guide.description,
    alternates: { canonical: `/cs/guides/${slug}`, languages: { en: `/guides/${slug}`, cs: `/cs/guides/${slug}`, 'x-default': `/guides/${slug}` } },
    openGraph: { title: guide.title, description: guide.description, type: 'article', url: `/cs/guides/${slug}`, images: ['/og-image-cs.png'], modifiedTime: guide.updated, publishedTime: guide.updated },
  }
}

export default async function CzechGuidePage({ params }: { params: Promise<{ slug: string }> }) {
  const guide = getGuide((await params).slug, 'cs')
  if (!guide) notFound()
  return <GuideArticle guide={guide} />
}
