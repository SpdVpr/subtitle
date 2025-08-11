import { NextRequest } from 'next/server'
import { ErrorTracker } from './error-tracking'

// Rate limiting store (in production, use Redis)
const rateLimitStore = new Map<string, { count: number; resetTime: number }>()

export interface RateLimitConfig {
  windowMs: number // Time window in milliseconds
  maxRequests: number // Max requests per window
  skipSuccessfulRequests?: boolean
  skipFailedRequests?: boolean
}

export class SecurityService {
  
  /**
   * Rate limiting middleware
   */
  static rateLimit(config: RateLimitConfig) {
    return (identifier: string): { allowed: boolean; remaining: number; resetTime: number } => {
      const now = Date.now()
      const key = `rate_limit:${identifier}`
      
      // Get or create rate limit entry
      let entry = rateLimitStore.get(key)
      
      // Reset if window has expired
      if (!entry || now > entry.resetTime) {
        entry = {
          count: 0,
          resetTime: now + config.windowMs
        }
      }
      
      // Check if limit exceeded
      if (entry.count >= config.maxRequests) {
        return {
          allowed: false,
          remaining: 0,
          resetTime: entry.resetTime
        }
      }
      
      // Increment counter
      entry.count++
      rateLimitStore.set(key, entry)
      
      return {
        allowed: true,
        remaining: config.maxRequests - entry.count,
        resetTime: entry.resetTime
      }
    }
  }
  
  /**
   * Input validation and sanitization
   */
  static validateInput(input: any, rules: ValidationRules): ValidationResult {
    const errors: string[] = []
    
    // Required fields
    if (rules.required) {
      for (const field of rules.required) {
        if (!input[field] || (typeof input[field] === 'string' && input[field].trim() === '')) {
          errors.push(`${field} is required`)
        }
      }
    }
    
    // String length validation
    if (rules.stringLength) {
      for (const [field, limits] of Object.entries(rules.stringLength)) {
        const value = input[field]
        if (typeof value === 'string') {
          if (limits.min && value.length < limits.min) {
            errors.push(`${field} must be at least ${limits.min} characters`)
          }
          if (limits.max && value.length > limits.max) {
            errors.push(`${field} must be no more than ${limits.max} characters`)
          }
        }
      }
    }
    
    // Email validation
    if (rules.email) {
      for (const field of rules.email) {
        const value = input[field]
        if (value && !this.isValidEmail(value)) {
          errors.push(`${field} must be a valid email address`)
        }
      }
    }
    
    // File size validation
    if (rules.fileSize) {
      for (const [field, maxSize] of Object.entries(rules.fileSize)) {
        const file = input[field]
        if (file && file.size > maxSize) {
          errors.push(`${field} must be smaller than ${this.formatFileSize(maxSize)}`)
        }
      }
    }
    
    return {
      isValid: errors.length === 0,
      errors
    }
  }
  
  /**
   * Sanitize HTML content
   */
  static sanitizeHtml(html: string): string {
    // Basic HTML sanitization (in production, use a library like DOMPurify)
    return html
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
      .replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, '')
      .replace(/javascript:/gi, '')
      .replace(/on\w+\s*=/gi, '')
  }
  
  /**
   * Check if request is from allowed origin
   */
  static isAllowedOrigin(request: NextRequest): boolean {
    const origin = request.headers.get('origin')
    const allowedOrigins = [
      'http://localhost:3000',
      'http://localhost:3001',
      'https://subtitle-ai.com',
      'https://www.subtitle-ai.com'
    ]
    
    return !origin || allowedOrigins.includes(origin)
  }
  
  /**
   * Extract client IP address
   */
  static getClientIP(request: NextRequest): string {
    const forwarded = request.headers.get('x-forwarded-for')
    const realIP = request.headers.get('x-real-ip')
    
    if (forwarded) {
      return forwarded.split(',')[0].trim()
    }
    
    if (realIP) {
      return realIP
    }
    
    return request.ip || 'unknown'
  }
  
  /**
   * Log security event
   */
  static async logSecurityEvent(
    event: string,
    request: NextRequest,
    details?: Record<string, any>
  ): Promise<void> {
    const ip = this.getClientIP(request)
    const userAgent = request.headers.get('user-agent') || 'unknown'
    
    await ErrorTracker.logError(
      `Security event: ${event}`,
      {
        component: 'security',
        action: event,
        metadata: {
          ip,
          userAgent,
          url: request.url,
          method: request.method,
          ...details
        }
      },
      'warning'
    )
  }
  
  /**
   * Validate API key format
   */
  static isValidApiKey(key: string): boolean {
    // Basic API key validation
    return /^[a-zA-Z0-9_-]{32,}$/.test(key)
  }
  
  /**
   * Check for suspicious patterns
   */
  static detectSuspiciousActivity(request: NextRequest): string[] {
    const suspiciousPatterns: string[] = []
    const url = request.url.toLowerCase()
    const userAgent = request.headers.get('user-agent')?.toLowerCase() || ''
    
    // SQL injection patterns
    if (url.includes('union') || url.includes('select') || url.includes('drop')) {
      suspiciousPatterns.push('sql_injection_attempt')
    }
    
    // XSS patterns
    if (url.includes('<script>') || url.includes('javascript:')) {
      suspiciousPatterns.push('xss_attempt')
    }
    
    // Bot detection
    if (userAgent.includes('bot') || userAgent.includes('crawler')) {
      suspiciousPatterns.push('bot_detected')
    }
    
    // Path traversal
    if (url.includes('../') || url.includes('..\\')) {
      suspiciousPatterns.push('path_traversal_attempt')
    }
    
    return suspiciousPatterns
  }
  
  private static isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(email)
  }
  
  private static formatFileSize(bytes: number): string {
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    if (bytes === 0) return '0 Bytes'
    const i = Math.floor(Math.log(bytes) / Math.log(1024))
    return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i]
  }
}

export interface ValidationRules {
  required?: string[]
  stringLength?: Record<string, { min?: number; max?: number }>
  email?: string[]
  fileSize?: Record<string, number>
}

export interface ValidationResult {
  isValid: boolean
  errors: string[]
}

// Rate limiting configurations
export const RATE_LIMITS = {
  // API endpoints
  translation: { windowMs: 60 * 1000, maxRequests: 10 }, // 10 per minute
  auth: { windowMs: 15 * 60 * 1000, maxRequests: 5 }, // 5 per 15 minutes
  payment: { windowMs: 60 * 1000, maxRequests: 3 }, // 3 per minute
  
  // General
  general: { windowMs: 60 * 1000, maxRequests: 100 }, // 100 per minute
  strict: { windowMs: 60 * 1000, maxRequests: 20 }, // 20 per minute
} as const
