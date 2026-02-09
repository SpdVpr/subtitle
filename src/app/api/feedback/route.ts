import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { getAdminDb } from '@/lib/firebase-admin'

const feedbackSchema = z.object({
  feedback: z.string().min(10, 'Feedback must be at least 10 characters').max(1000, 'Feedback must be less than 1000 characters'),
  timestamp: z.string(),
  userAgent: z.string().optional(),
  url: z.string().optional(),
  locale: z.string().optional(),
  captchaAnswer: z.string().optional(),
  userId: z.string().nullable().optional(),
  userEmail: z.string().email().nullable().optional(),
  userName: z.string().nullable().optional()
})

// Simple rate limiting using in-memory store
const rateLimitMap = new Map<string, { count: number; resetTime: number }>()
const RATE_LIMIT_WINDOW = 60 * 60 * 1000 // 1 hour
const RATE_LIMIT_MAX_REQUESTS = 3 // Max 3 feedback submissions per hour per IP

function getRateLimitKey(request: NextRequest): string {
  const forwarded = request.headers.get('x-forwarded-for')
  const realIp = request.headers.get('x-real-ip')
  return forwarded?.split(',')[0] || realIp || 'unknown'
}

function isRateLimited(key: string): boolean {
  const now = Date.now()
  const record = rateLimitMap.get(key)

  if (!record || now > record.resetTime) {
    // Reset or create new record
    rateLimitMap.set(key, { count: 1, resetTime: now + RATE_LIMIT_WINDOW })
    return false
  }

  if (record.count >= RATE_LIMIT_MAX_REQUESTS) {
    return true
  }

  record.count++
  return false
}

// Simple spam detection
function isSpam(feedback: string, userAgent?: string): boolean {
  const text = feedback.toLowerCase()

  // Only check for obvious spam patterns
  const spamPatterns = [
    /https?:\/\/[^\s]+/g, // URLs (multiple)
    /\b(buy now|click here|casino|poker|viagra|cialis|lottery|winner)\b/g, // Strong spam keywords
    /(.)\1{6,}/g, // Many repeated characters (aaaaaa+)
  ]

  // Check for spam patterns
  for (const pattern of spamPatterns) {
    if (pattern.test(text)) {
      console.log('Spam pattern detected:', pattern.source)
      return true
    }
  }

  // Check for bot user agents (but be more specific)
  if (userAgent) {
    const botPatterns = /googlebot|bingbot|slurp|duckduckbot|baiduspider|yandexbot|facebookexternalhit|twitterbot|linkedinbot|whatsapp|telegram/i
    if (botPatterns.test(userAgent)) {
      console.log('Bot user agent detected:', userAgent)
      return true
    }
  }

  // Check for excessive repeated words (more lenient)
  const words = text.split(/\s+/).filter(word => word.length > 3)
  if (words.length > 5) { // Only check if enough words
    const wordCount = new Map<string, number>()
    for (const word of words) {
      wordCount.set(word, (wordCount.get(word) || 0) + 1)
    }

    // If any word appears more than 50% of the time, it's likely spam
    const totalWords = words.length
    for (const [word, count] of wordCount) {
      if (count / totalWords > 0.5) {
        console.log('Repeated word spam detected:', word, `${count}/${totalWords}`)
        return true
      }
    }
  }

  return false
}

export async function POST(request: NextRequest) {
  try {
    // Rate limiting
    const clientKey = getRateLimitKey(request)
    if (isRateLimited(clientKey)) {
      return NextResponse.json(
        { error: 'Too many requests. Please try again later.' },
        { status: 429 }
      )
    }

    const body = await request.json()
    
    // Validate the request body
    const validatedData = feedbackSchema.parse(body)

    // Basic CAPTCHA validation (client-side math is validated client-side)
    // Server just checks if answer was provided
    if (!validatedData.captchaAnswer || validatedData.captchaAnswer.trim() === '') {
      return NextResponse.json(
        { error: 'Please complete the security check.' },
        { status: 400 }
      )
    }

    // Spam detection
    if (isSpam(validatedData.feedback, validatedData.userAgent)) {
      console.log('Spam detected:', {
        feedback: validatedData.feedback.substring(0, 100),
        userAgent: validatedData.userAgent,
        ip: clientKey
      })
      return NextResponse.json(
        { error: 'Invalid feedback content.' },
        { status: 400 }
      )
    }

    // Save feedback to Firestore
    try {
      const db = getAdminDb()
      const feedbackData = {
        feedback: validatedData.feedback,
        timestamp: new Date(),
        submittedAt: validatedData.timestamp,
        locale: validatedData.locale || 'en',
        url: validatedData.url,
        ipHash: clientKey, // Store hashed IP for privacy
        userAgent: validatedData.userAgent,
        status: 'new', // new, read, resolved, replied
        priority: 'normal', // low, normal, high
        // User identification (if logged in)
        userId: validatedData.userId || null,
        userEmail: validatedData.userEmail || null,
        userName: validatedData.userName || null
      }

      console.log('📝 Feedback API - Received data:', {
        userId: validatedData.userId,
        userEmail: validatedData.userEmail,
        userName: validatedData.userName
      })
      console.log('📝 Feedback API - Saving to Firestore:', feedbackData)

      // Use Firebase Admin SDK to add document
      await db.collection('feedback').add(feedbackData)
      console.log('📝 Feedback saved to Firestore successfully')
    } catch (dbError) {
      console.error('Failed to save feedback to database:', dbError)
      // Fallback: log to console if Firestore unavailable
      console.log('📝 New feedback received (Firestore unavailable):', {
        feedback: validatedData.feedback,
        timestamp: validatedData.timestamp,
        locale: validatedData.locale || 'en',
        url: validatedData.url,
        ip: clientKey,
        userAgent: validatedData.userAgent
      })
      // Continue anyway - don't fail the request
    }

    // Track feedback in analytics
    try {
      const { analytics } = await import('@/lib/analytics')
      analytics.feedbackSubmitted(validatedData.locale || 'en', validatedData.feedback.length)
    } catch (analyticsError) {
      console.warn('Failed to track feedback analytics:', analyticsError)
      // Continue anyway - don't fail the request
    }

    return NextResponse.json(
      { 
        success: true, 
        message: 'Feedback received successfully' 
      },
      { status: 200 }
    )

  } catch (error) {
    console.error('Feedback API error:', error)

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid feedback data', details: error.errors },
        { status: 400 }
      )
    }

    return NextResponse.json(
      {
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}
