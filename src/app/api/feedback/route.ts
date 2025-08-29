import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { getServerFirestore } from '@/lib/firebase-admin'

const feedbackSchema = z.object({
  feedback: z.string().min(10, 'Feedback must be at least 10 characters').max(1000, 'Feedback must be less than 1000 characters'),
  timestamp: z.string(),
  userAgent: z.string().optional(),
  url: z.string().optional(),
  locale: z.string().optional()
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
  
  // Common spam patterns
  const spamPatterns = [
    /https?:\/\/[^\s]+/g, // URLs
    /\b(buy|sell|cheap|free|money|casino|poker|viagra|cialis)\b/g, // Spam keywords
    /(.)\1{4,}/g, // Repeated characters (aaaaa)
    /[^\w\s.,!?-]/g, // Unusual characters
  ]

  // Check for spam patterns
  for (const pattern of spamPatterns) {
    if (pattern.test(text)) {
      return true
    }
  }

  // Check for bot user agents
  if (userAgent) {
    const botPatterns = /bot|crawler|spider|scraper|curl|wget/i
    if (botPatterns.test(userAgent)) {
      return true
    }
  }

  // Check for too many repeated words
  const words = text.split(/\s+/)
  const wordCount = new Map<string, number>()
  for (const word of words) {
    if (word.length > 2) {
      wordCount.set(word, (wordCount.get(word) || 0) + 1)
    }
  }
  
  // If any word appears more than 30% of the time, it's likely spam
  const totalWords = words.length
  for (const [, count] of wordCount) {
    if (count / totalWords > 0.3) {
      return true
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
      const db = await getServerFirestore()
      if (db) {
        const feedbackData = {
          feedback: validatedData.feedback,
          timestamp: new Date(),
          submittedAt: validatedData.timestamp,
          locale: validatedData.locale || 'en',
          url: validatedData.url,
          ipHash: clientKey, // Store hashed IP for privacy
          userAgent: validatedData.userAgent,
          status: 'new', // new, read, resolved
          priority: 'normal' // low, normal, high
        }

        // Use Firebase Admin SDK to add document
        await db.collection('feedback').add(feedbackData)
        console.log('📝 Feedback saved to Firestore')
      } else {
        // Fallback: log to console if Firestore unavailable
        console.log('📝 New feedback received (Firestore unavailable):', {
          feedback: validatedData.feedback,
          timestamp: validatedData.timestamp,
          locale: validatedData.locale || 'en',
          url: validatedData.url,
          ip: clientKey,
          userAgent: validatedData.userAgent
        })
      }
    } catch (dbError) {
      console.error('Failed to save feedback to database:', dbError)
      // Continue anyway - don't fail the request
    }

    // Track feedback in analytics
    const { analytics } = await import('@/lib/analytics')
    analytics.feedbackSubmitted(validatedData.locale || 'en', validatedData.feedback.length)

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
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
