'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { analytics } from '@/lib/analytics'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Textarea } from '@/components/ui/textarea'
import { Input } from '@/components/ui/input'
import { MessageSquare, Send, Loader2, CheckCircle, ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import { toast } from 'sonner'

export default function FeedbackPage() {
  const { user } = useAuth()
  const [feedback, setFeedback] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [honeypot, setHoneypot] = useState('')
  const [startTime] = useState(Date.now())

  // Math CAPTCHA
  const [mathQuestion, setMathQuestion] = useState({ num1: 0, num2: 0, answer: 0 })
  const [userAnswer, setUserAnswer] = useState('')

  // Generate new math question
  const generateMathQuestion = () => {
    const num1 = Math.floor(Math.random() * 10) + 1
    const num2 = Math.floor(Math.random() * 10) + 1
    const answer = num1 + num2
    setMathQuestion({ num1, num2, answer })
    setUserAnswer('')
  }

  useEffect(() => {
    // Track feedback page visit
    analytics.feedbackPageVisited('en')
    // Generate initial math question
    generateMathQuestion()

    // Debug: Log user info on page load
    console.log('👤 Feedback page loaded - User info:', {
      uid: user?.uid,
      email: user?.email,
      displayName: user?.displayName,
      isLoggedIn: !!user
    })
  }, [user])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // Anti-spam checks
    if (honeypot) {
      // Bot detected (filled honeypot field)
      return
    }
    
    if (Date.now() - startTime < 3000) {
      // Submitted too quickly (less than 3 seconds)
      toast.error('Please take a moment to write your feedback.')
      return
    }
    
    if (feedback.trim().length < 10) {
      toast.error('Please provide more detailed feedback (at least 10 characters).')
      return
    }

    // Check CAPTCHA
    if (parseInt(userAnswer) !== mathQuestion.answer) {
      toast.error('Please solve the math problem correctly.')
      generateMathQuestion() // Generate new question
      return
    }

    setIsSubmitting(true)

    // Debug: Log user info
    console.log('👤 User info when submitting feedback:', {
      uid: user?.uid,
      email: user?.email,
      displayName: user?.displayName,
      isLoggedIn: !!user
    })

    try {
      const payload = {
        feedback: feedback.trim(),
        timestamp: new Date().toISOString(),
        userAgent: navigator.userAgent,
        url: window.location.href,
        locale: 'en',
        captchaAnswer: userAnswer, // Include CAPTCHA answer for server verification
        userId: user?.uid,
        userEmail: user?.email,
        userName: user?.displayName
      }

      console.log('📤 Sending feedback payload:', payload)

      const response = await fetch('/api/feedback', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      })

      if (!response.ok) {
        throw new Error('Failed to send feedback')
      }

      setIsSubmitted(true)
      toast.success('Thank you for your feedback!')

      // Track successful feedback submission
      analytics.feedbackSubmitted('en', feedback.length)

      setFeedback('')
      generateMathQuestion() // Generate new question for next use
    } catch (error) {
      console.error('Feedback error:', error)
      toast.error('Failed to send feedback. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isSubmitted) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-12 max-w-2xl">
          <Button variant="ghost" asChild className="mb-4">
            <Link href="/" className="flex items-center gap-2">
              <ArrowLeft className="h-4 w-4" />
              Back to Home
            </Link>
          </Button>
          
          <Card>
            <CardContent className="pt-6">
              <div className="text-center space-y-4">
                <CheckCircle className="h-16 w-16 text-green-500 mx-auto" />
                <h2 className="text-2xl font-bold text-foreground">Thank You!</h2>
                <p className="text-muted-foreground">
                  Your feedback has been received. We appreciate you taking the time to help us improve SubtitleBot!
                </p>
                <Button asChild>
                  <Link href="/">Return to Home</Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-12 max-w-2xl">
        <Button variant="ghost" asChild className="mb-4">
          <Link href="/" className="flex items-center gap-2">
            <ArrowLeft className="h-4 w-4" />
            Back to Home
          </Link>
        </Button>

        {/* User Status Banner */}
        {user && (
          <div className="bg-green-50 dark:bg-green-950/30 rounded-lg p-4 mb-4 border border-green-200 dark:border-green-800">
            <div className="flex items-center gap-3">
              <div className="bg-green-500 w-10 h-10 rounded-full flex items-center justify-center">
                <span className="text-white text-lg">✓</span>
              </div>
              <div>
                <p className="font-medium text-green-900 dark:text-green-100">
                  Logged in as {user.displayName || user.email}
                </p>
                <p className="text-sm text-green-700 dark:text-green-300">
                  We can respond to your feedback
                </p>
              </div>
            </div>
          </div>
        )}

        {!user && (
          <div className="bg-yellow-50 dark:bg-yellow-950/30 rounded-lg p-4 mb-4 border border-yellow-200 dark:border-yellow-800">
            <div className="flex items-center gap-3">
              <div className="bg-yellow-500 w-10 h-10 rounded-full flex items-center justify-center">
                <span className="text-white text-lg">⚠</span>
              </div>
              <div>
                <p className="font-medium text-yellow-900 dark:text-yellow-100">
                  Not logged in
                </p>
                <p className="text-sm text-yellow-700 dark:text-yellow-300">
                  Log in if you want to receive a response to your feedback
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Motivational Banner */}
        <div className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-950/30 dark:to-purple-950/30 rounded-lg p-6 mb-6 border border-blue-200 dark:border-blue-800">
          <div className="text-center">
            <div className="flex justify-center mb-3">
              <div className="bg-gradient-to-r from-blue-500 to-purple-500 w-12 h-12 rounded-full flex items-center justify-center">
                <MessageSquare className="h-6 w-6 text-white" />
              </div>
            </div>
            <h2 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2">
              Your Voice Matters! 🎯
            </h2>
            <p className="text-muted-foreground text-sm">
              Every piece of feedback helps us build better features. Join thousands of users who've helped shape SubtitleBot!
            </p>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MessageSquare className="h-6 w-6 text-primary" />
              Quick Feedback
            </CardTitle>
            <CardDescription>
              Help us improve SubtitleBot! Share your thoughts, suggestions, or report issues.
              Your feedback is anonymous and helps us make the app better for everyone.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Honeypot field - hidden from users, visible to bots */}
              <input
                type="text"
                name="website"
                value={honeypot}
                onChange={(e) => setHoneypot(e.target.value)}
                style={{ display: 'none' }}
                tabIndex={-1}
                autoComplete="off"
              />

              <div className="space-y-2">
                <label htmlFor="feedback" className="text-sm font-medium">
                  Your Feedback
                </label>
                <Textarea
                  id="feedback"
                  placeholder=""
                  value={feedback}
                  onChange={(e) => setFeedback(e.target.value)}
                  disabled={isSubmitting}
                  rows={6}
                  className="resize-none"
                />
                <p className="text-xs text-muted-foreground">
                  {feedback.length}/1000 characters • Anonymous submission
                </p>
              </div>

              {/* Math CAPTCHA */}
              <div className="space-y-2">
                <label htmlFor="captcha" className="text-sm font-medium">
                  Security Check
                </label>
                <div className="flex items-center gap-3">
                  <div className="bg-muted/50 px-3 py-2 rounded-lg font-mono text-lg">
                    {mathQuestion.num1} + {mathQuestion.num2} = ?
                  </div>
                  <Input
                    id="captcha"
                    type="number"
                    placeholder="Answer"
                    value={userAnswer}
                    onChange={(e) => setUserAnswer(e.target.value)}
                    disabled={isSubmitting}
                    className="w-20"
                    required
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={generateMathQuestion}
                    disabled={isSubmitting}
                  >
                    New Question
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground">
                  Please solve this simple math problem to verify you're human
                </p>
              </div>

              <Button
                type="submit"
                className="w-full"
                disabled={isSubmitting || feedback.trim().length < 10 || !userAnswer}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Sending Feedback...
                  </>
                ) : (
                  <>
                    <Send className="h-4 w-4 mr-2" />
                    Send Anonymous Feedback
                  </>
                )}
              </Button>
            </form>

            <div className="mt-6 p-4 bg-muted/50 rounded-lg">
              <h4 className="text-sm font-medium mb-2">💡 What kind of feedback helps us most:</h4>
              <ul className="text-xs text-muted-foreground space-y-1">
                <li>• Bugs or errors you encountered</li>
                <li>• Features that would make your workflow easier</li>
                <li>• Languages or formats you'd like to see supported</li>
                <li>• Performance issues or slow translations</li>
                <li>• UI/UX improvements that would help you</li>
              </ul>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
