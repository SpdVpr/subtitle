import { RegisterForm } from '@/components/forms/register-form'

export default function RegisterPage() {
  return (
    <div className="container flex items-center justify-center min-h-[calc(100vh-200px)] py-8">
      <RegisterForm />
    </div>
  )
}

export const metadata = {
  title: 'Create Account - SubtitleAI',
  description: 'Create your SubtitleAI account to start translating subtitles',
}
