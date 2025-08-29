'use client'

import { useState, useEffect } from 'react'
import { analytics } from '@/lib/analytics'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Textarea } from '@/components/ui/textarea'
import { Input } from '@/components/ui/input'
import { MessageSquare, Send, Loader2, CheckCircle, ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import { toast } from 'sonner'

export default function CzechFeedbackPage() {
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
    analytics.feedbackPageVisited('cs')
    // Generate initial math question
    generateMathQuestion()
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // Anti-spam checks
    if (honeypot) {
      // Bot detected (filled honeypot field)
      return
    }
    
    if (Date.now() - startTime < 3000) {
      // Submitted too quickly (less than 3 seconds)
      toast.error('Prosím, věnujte chvilku napsání zpětné vazby.')
      return
    }
    
    if (feedback.trim().length < 10) {
      toast.error('Prosím, poskytněte podrobnější zpětnou vazbu (alespoň 10 znaků).')
      return
    }

    // Check CAPTCHA
    if (parseInt(userAnswer) !== mathQuestion.answer) {
      toast.error('Prosím, vyřešte matematický příklad správně.')
      generateMathQuestion() // Generate new question
      return
    }

    setIsSubmitting(true)

    try {
      const response = await fetch('/api/feedback', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          feedback: feedback.trim(),
          timestamp: new Date().toISOString(),
          userAgent: navigator.userAgent,
          url: window.location.href,
          locale: 'cs',
          captchaAnswer: userAnswer // Include CAPTCHA answer for server verification
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to send feedback')
      }

      setIsSubmitted(true)
      toast.success('Děkujeme za vaši zpětnou vazbu!')

      // Track successful feedback submission
      analytics.feedbackSubmitted('cs', feedback.length)

      setFeedback('')
      generateMathQuestion() // Generate new question for next use
    } catch (error) {
      console.error('Feedback error:', error)
      toast.error('Nepodařilo se odeslat zpětnou vazbu. Zkuste to prosím znovu.')
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isSubmitted) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-12 max-w-2xl">
          <Button variant="ghost" asChild className="mb-4">
            <Link href="/cs" className="flex items-center gap-2">
              <ArrowLeft className="h-4 w-4" />
              Zpět na Hlavní Stránku
            </Link>
          </Button>
          
          <Card>
            <CardContent className="pt-6">
              <div className="text-center space-y-4">
                <CheckCircle className="h-16 w-16 text-green-500 mx-auto" />
                <h2 className="text-2xl font-bold text-foreground">Děkujeme!</h2>
                <p className="text-muted-foreground">
                  Vaše zpětná vazba byla přijata. Vážíme si toho, že jste si našli čas pomoci nám vylepšit SubtitleBot!
                </p>
                <Button asChild>
                  <Link href="/cs">Zpět na Hlavní Stránku</Link>
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
          <Link href="/cs" className="flex items-center gap-2">
            <ArrowLeft className="h-4 w-4" />
            Zpět na Hlavní Stránku
          </Link>
        </Button>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MessageSquare className="h-6 w-6 text-primary" />
              Rychlá Zpětná Vazba
            </CardTitle>
            <CardDescription>
              Pomozte nám vylepšit SubtitleBot! Sdílejte své myšlenky, návrhy nebo nahlaste problémy. 
              Vaše zpětná vazba je anonymní a pomáhá nám udělat aplikaci lepší pro všechny.
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
                  Vaše Zpětná Vazba
                </label>
                <Textarea
                  id="feedback"
                  placeholder="Co byste chtěli vidět vylepšené? Nějaké chyby nebo problémy? Nové funkce, které byste milovali? Rádi uslyšíme váš názor!"
                  value={feedback}
                  onChange={(e) => setFeedback(e.target.value)}
                  disabled={isSubmitting}
                  rows={6}
                  className="resize-none"
                />
                <p className="text-xs text-muted-foreground">
                  {feedback.length}/1000 znaků • Anonymní odeslání
                </p>
              </div>

              {/* Math CAPTCHA */}
              <div className="space-y-2">
                <label htmlFor="captcha" className="text-sm font-medium">
                  Bezpečnostní Kontrola
                </label>
                <div className="flex items-center gap-3">
                  <div className="bg-muted/50 px-3 py-2 rounded-lg font-mono text-lg">
                    {mathQuestion.num1} + {mathQuestion.num2} = ?
                  </div>
                  <Input
                    id="captcha"
                    type="number"
                    placeholder="Odpověď"
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
                    Nový Příklad
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground">
                  Prosím, vyřešte tento jednoduchý matematický příklad pro ověření, že jste člověk
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
                    Odesílání Zpětné Vazby...
                  </>
                ) : (
                  <>
                    <Send className="h-4 w-4 mr-2" />
                    Odeslat Anonymní Zpětnou Vazbu
                  </>
                )}
              </Button>
            </form>

            <div className="mt-6 p-4 bg-muted/50 rounded-lg">
              <h4 className="text-sm font-medium mb-2">💡 Jaká zpětná vazba nám nejvíce pomáhá:</h4>
              <ul className="text-xs text-muted-foreground space-y-1">
                <li>• Chyby nebo problémy, se kterými jste se setkali</li>
                <li>• Funkce, které by vám usnadnily práci</li>
                <li>• Jazyky nebo formáty, které byste chtěli vidět podporované</li>
                <li>• Problémy s výkonem nebo pomalé překlady</li>
                <li>• Vylepšení UI/UX, která by vám pomohla</li>
              </ul>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
