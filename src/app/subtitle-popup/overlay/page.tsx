import { Metadata } from 'next'
import { SubtitlePopupOverlay } from '@/components/popup/subtitle-popup-overlay'

export const metadata: Metadata = {
  title: 'Subtitle Overlay Window',
  description: 'Transparent subtitle overlay window',
}

export default function SubtitleOverlayPage() {
  return <SubtitlePopupOverlay />
}
