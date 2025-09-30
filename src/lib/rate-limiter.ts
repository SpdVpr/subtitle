/**
 * Simple in-memory rate limiter for API endpoints
 * For production, consider using Redis or a dedicated rate limiting service
 */

interface RateLimitEntry {
  count: number
  resetTime: number
}

class RateLimiter {
  private limits: Map<string, RateLimitEntry> = new Map()
  private cleanupInterval: NodeJS.Timeout | null = null

  constructor() {
    // Clean up expired entries every 5 minutes
    this.cleanupInterval = setInterval(() => {
      this.cleanup()
    }, 5 * 60 * 1000)
  }

  /**
   * Check if a request should be rate limited
   * @param key - Unique identifier (e.g., IP address, user ID)
   * @param maxRequests - Maximum number of requests allowed
   * @param windowMs - Time window in milliseconds
   * @returns true if rate limit exceeded, false otherwise
   */
  isRateLimited(key: string, maxRequests: number, windowMs: number): boolean {
    const now = Date.now()
    const entry = this.limits.get(key)

    if (!entry || now > entry.resetTime) {
      // No entry or expired - create new entry
      this.limits.set(key, {
        count: 1,
        resetTime: now + windowMs
      })
      return false
    }

    // Increment count
    entry.count++

    // Check if limit exceeded
    if (entry.count > maxRequests) {
      return true
    }

    return false
  }

  /**
   * Get remaining requests for a key
   */
  getRemaining(key: string, maxRequests: number): number {
    const entry = this.limits.get(key)
    if (!entry || Date.now() > entry.resetTime) {
      return maxRequests
    }
    return Math.max(0, maxRequests - entry.count)
  }

  /**
   * Get time until reset for a key
   */
  getResetTime(key: string): number | null {
    const entry = this.limits.get(key)
    if (!entry || Date.now() > entry.resetTime) {
      return null
    }
    return entry.resetTime
  }

  /**
   * Clean up expired entries
   */
  private cleanup(): void {
    const now = Date.now()
    for (const [key, entry] of this.limits.entries()) {
      if (now > entry.resetTime) {
        this.limits.delete(key)
      }
    }
  }

  /**
   * Clear all entries (useful for testing)
   */
  clear(): void {
    this.limits.clear()
  }

  /**
   * Destroy the rate limiter and cleanup interval
   */
  destroy(): void {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval)
      this.cleanupInterval = null
    }
    this.clear()
  }
}

// Singleton instance
const rateLimiter = new RateLimiter()

export default rateLimiter

/**
 * Rate limit configurations for different endpoints
 */
export const RATE_LIMITS = {
  // Registration endpoints - very strict
  REGISTRATION: {
    maxRequests: 3, // 3 registrations
    windowMs: 60 * 60 * 1000, // per hour
  },
  
  // Login endpoints - moderate
  LOGIN: {
    maxRequests: 10, // 10 login attempts
    windowMs: 15 * 60 * 1000, // per 15 minutes
  },
  
  // API endpoints - lenient
  API: {
    maxRequests: 100, // 100 requests
    windowMs: 60 * 1000, // per minute
  },
  
  // Translation endpoints - moderate
  TRANSLATION: {
    maxRequests: 20, // 20 translations
    windowMs: 60 * 1000, // per minute
  }
}

/**
 * Helper function to create rate limit response
 */
export function createRateLimitResponse(resetTime: number | null) {
  const retryAfter = resetTime ? Math.ceil((resetTime - Date.now()) / 1000) : 60
  
  return {
    error: 'Too many requests. Please try again later.',
    retryAfter,
    resetTime
  }
}

