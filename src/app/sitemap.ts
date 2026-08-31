import { MetadataRoute } from 'next'
import { getGuides } from '@/content/guides'
import { getTools } from '@/content/tools'
import { catalogLanguages, catalogSeeds } from '@/lib/subtitle-catalog'

const baseUrl = (process.env.NEXT_PUBLIC_APP_URL || 'https://www.subtitlebot.com').replace(/\/$/, '')
const contentLastModified = new Date('2026-08-31')

type Frequency = NonNullable<MetadataRoute.Sitemap[number]['changeFrequency']>

interface LocalizedPage {
  path: string
  changeFrequency: Frequency
  priority: number
}

const localizedPages: LocalizedPage[] = [
  { path: '', changeFrequency: 'weekly', priority: 1 },
  { path: '/translate', changeFrequency: 'weekly', priority: 0.9 },
  { path: '/subtitles-search', changeFrequency: 'weekly', priority: 1 },
  { path: '/live', changeFrequency: 'daily', priority: 0.8 },
  { path: '/subtitle-editor', changeFrequency: 'monthly', priority: 0.8 },
  { path: '/video-tools', changeFrequency: 'monthly', priority: 0.8 },
  { path: '/subtitle-popup', changeFrequency: 'monthly', priority: 0.7 },
  { path: '/pricing', changeFrequency: 'monthly', priority: 0.7 },
  { path: '/about', changeFrequency: 'monthly', priority: 0.6 },
  { path: '/contact', changeFrequency: 'monthly', priority: 0.5 },
  { path: '/guides', changeFrequency: 'weekly', priority: 0.8 },
  { path: '/tools', changeFrequency: 'monthly', priority: 0.9 },
  { path: '/subtitles/movies', changeFrequency: 'daily', priority: 0.9 },
  { path: '/subtitles/tv', changeFrequency: 'daily', priority: 0.9 },
  { path: '/subtitles/popular', changeFrequency: 'daily', priority: 0.8 },
  { path: '/subtitles/latest', changeFrequency: 'daily', priority: 0.8 },
  { path: '/privacy', changeFrequency: 'yearly', priority: 0.2 },
  { path: '/terms', changeFrequency: 'yearly', priority: 0.2 },
  { path: '/cookies', changeFrequency: 'yearly', priority: 0.2 },
  { path: '/gdpr', changeFrequency: 'yearly', priority: 0.2 },
]

const generatedPages: LocalizedPage[] = [
  ...getGuides('en').map((guide) => ({ path: `/guides/${guide.slug}`, changeFrequency: 'monthly' as const, priority: 0.75 })),
  ...getTools('en').map((tool) => ({ path: `/tools/${tool.slug}`, changeFrequency: 'monthly' as const, priority: 0.8 })),
  ...catalogLanguages.filter((language) => language.code !== 'tl').map((language) => ({ path: `/subtitles/${language.slug}`, changeFrequency: 'daily' as const, priority: 0.75 })),
  ...catalogSeeds.map((media) => ({ path: `/subtitles/${media.type}/${media.slug}`, changeFrequency: 'daily' as const, priority: 0.7 })),
]

export default function sitemap(): MetadataRoute.Sitemap {
  return [...localizedPages, ...generatedPages].flatMap(({ path, changeFrequency, priority }) => {
    const englishUrl = `${baseUrl}${path}` || baseUrl
    const czechUrl = `${baseUrl}/cs${path}`
    const alternates = {
      languages: {
        en: englishUrl,
        cs: czechUrl,
        'x-default': englishUrl,
      },
    }

    return [
      { url: englishUrl, lastModified: contentLastModified, changeFrequency, priority, alternates },
      { url: czechUrl, lastModified: contentLastModified, changeFrequency, priority, alternates },
    ]
  })
}
