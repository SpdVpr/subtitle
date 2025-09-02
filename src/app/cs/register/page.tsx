import { RegisterForm } from '@/components/forms/register-form'

export default function RegisterPage() {
  return (
    <div className="flex items-center justify-center min-h-[calc(100vh-200px)] py-8 px-4">
      <RegisterForm locale="cs" />
    </div>
  )
}

export const metadata = {
  title: 'Vytvořit Účet - SubtitleBot',
  description: 'Vytvořte si účet SubtitleBot a začněte překládat titulky s 200 zdarma kredity',
  keywords: [
    'registrace',
    'vytvořit účet',
    'SubtitleBot',
    'zdarma kredity',
    'překlad titulků',
    'AI překlad',
    'titulky zdarma'
  ],
  openGraph: {
    title: 'Vytvořit Účet - SubtitleBot',
    description: 'Vytvořte si účet SubtitleBot a začněte překládat titulky s 200 zdarma kredity',
    url: '/cs/register',
    siteName: 'SubtitleBot',
    locale: 'cs_CZ',
    type: 'website',
  },
  twitter: {
    card: 'summary',
    title: 'Vytvořit Účet - SubtitleBot',
    description: 'Vytvořte si účet SubtitleBot a začněte překládat titulky s 200 zdarma kredity',
  },
}
