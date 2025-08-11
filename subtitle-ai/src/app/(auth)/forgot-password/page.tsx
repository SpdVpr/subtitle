import { ForgotPasswordForm } from '@/components/forms/forgot-password-form'

export default function ForgotPasswordPage() {
  return (
    <div className="container flex items-center justify-center min-h-[calc(100vh-200px)] py-8">
      <ForgotPasswordForm />
    </div>
  )
}

export const metadata = {
  title: 'Reset Password - SubtitleAI',
  description: 'Reset your SubtitleAI account password',
}
