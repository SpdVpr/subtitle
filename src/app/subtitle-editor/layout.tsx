import { pageMetadata } from '@/lib/seo'

export const metadata = pageMetadata({
  locale: 'en',
  path: '/subtitle-editor',
  title: 'Online Subtitle Editor: Edit, Sync and Fix SRT Files',
  description:
    'Free online subtitle editor. Fix timing, shift or stretch subtitles, edit text, find and replace, and export SRT, VTT, ASS and other formats without installing software.',
  keywords: ['subtitle editor', 'online subtitle editor', 'edit SRT online', 'subtitle sync', 'fix subtitle timing', 'SRT editor'],
})

export default function SubtitleEditorLayout({ children }: { children: React.ReactNode }) {
  return children
}
