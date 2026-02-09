import { RegisterForm } from '@/components/forms/register-form'

export default function RegisterPage() {
  return (
    <div className="flex items-center justify-center min-h-[calc(100vh-200px)] py-8 px-4">
      <RegisterForm />
    </div>
  )
}

export const metadata = {
  title: 'Create Account - SubtitleAI',
  description: 'Create your SubtitleAI account to start translating subtitles',
}
