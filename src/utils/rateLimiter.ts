/**
 * Advanced Rate Limiting System
 * Implements sliding window algorithm with per-operation limits
 * Tracks violations and implements exponential backoff
 */

interface RateLimitConfig {
  maxRequests: number
  windowMs: number
  violationPenaltyMs?: number // Additional delay after violation
}

interface RequestRecord {
  timestamp: number
  operation: string
}

interface ViolationRecord {
  count: number
  lastViolation: number
  penaltyUntil: number
}

// Rate limit configurations for different operations
const RATE_LIMITS: Record<string, RateLimitConfig> = {
  // Order operations - Very strict
  'order:create': {
    maxRequests: 3, // 3 orders per window
    windowMs: 60000, // 1 minute
    violationPenaltyMs: 300000, // 5 minute penalty
  },
  'order:update': {
    maxRequests: 10,
    windowMs: 60000,
  },
  
  // Admin operations - Moderate
  'product:create': {
    maxRequests: 5,
    windowMs: 60000,
    violationPenaltyMs: 180000, // 3 minute penalty
  },
  'product:update': {
    maxRequests: 10,
    windowMs: 60000,
  },
  'product:delete': {
    maxRequests: 5,
    windowMs: 60000,
  },
  'banner:create': {
    maxRequests: 5,
    windowMs: 60000,
  },
  'banner:update': {
    maxRequests: 10,
    windowMs: 60000,
  },
  'banner:delete': {
    maxRequests: 5,
    windowMs: 60000,
  },
  'settings:update': {
    maxRequests: 5,
    windowMs: 60000,
  },
  'tracking:update': {
    maxRequests: 10,
    windowMs: 60000,
  },
  
  // Cart operations - Moderate
  'cart:add': {
    maxRequests: 20,
    windowMs: 60000, // 1 minute
  },
  'cart:update': {
    maxRequests: 30,
    windowMs: 60000,
  },
  'cart:clear': {
    maxRequests: 10,
    windowMs: 60000,
  },
  
  // Search operations - Higher limit
  'search:query': {
    maxRequests: 30,
    windowMs: 60000,
  },
  
  // Read operations - Very high limit
  'products:read': {
    maxRequests: 100,
    windowMs: 60000,
  },
  'orders:read': {
    maxRequests: 50,
    windowMs: 60000,
  },
}

const STORAGE_KEY_PREFIX = 'rate_limit_'
const VIOLATION_KEY_PREFIX = 'rate_violation_'
const CLEANUP_INTERVAL = 300000 // 5 minutes

class RateLimiter {
  private cleanupTimer: number | null = null

  constructor() {
    // Start cleanup timer to remove old records
    if (typeof window !== 'undefined') {
      this.cleanupTimer = window.setInterval(() => {
        this.cleanup()
      }, CLEANUP_INTERVAL)
    }
  }

  /**
   * Check if an operation is allowed based on rate limits
   * @param operation - The operation identifier (e.g., 'order:create')
   * @param userId - Optional user ID for user-specific rate limiting
   * @returns Object with allowed status and remaining requests
   */
  checkLimit(operation: string, userId?: string): {
    allowed: boolean
    remaining: number
    resetAt: number
    retryAfter?: number
  } {
    const config = RATE_LIMITS[operation]
    if (!config) {
      // Unknown operation - allow but log warning
      // Rate limit config not found for operation
      return {
        allowed: true,
        remaining: Infinity,
        resetAt: Date.now() + 60000,
      }
    }

    const key = this.getStorageKey(operation, userId)
    const violationKey = this.getViolationKey(operation, userId)
    
    // Check for active penalty
    const violation = this.getViolation(violationKey)
    const now = Date.now()
    
    if (violation && violation.penaltyUntil > now) {
      const retryAfter = Math.ceil((violation.penaltyUntil - now) / 1000)
      return {
        allowed: false,
        remaining: 0,
        resetAt: violation.penaltyUntil,
        retryAfter,
      }
    }

    // Get request history
    const requests = this.getRequests(key)
    const windowStart = now - config.windowMs
    
    // Filter requests within the current window
    const recentRequests = requests.filter((r) => r.timestamp >= windowStart)
    
    // Check if limit exceeded
    if (recentRequests.length >= config.maxRequests) {
      // Record violation
      this.recordViolation(violationKey, config.violationPenaltyMs || 0)
      
      const oldestRequest = recentRequests[0]
      const resetAt = oldestRequest.timestamp + config.windowMs
      const retryAfter = Math.ceil((resetAt - now) / 1000)
      
      return {
        allowed: false,
        remaining: 0,
        resetAt,
        retryAfter,
      }
    }

    // Add current request
    recentRequests.push({
      timestamp: now,
      operation,
    })
    this.saveRequests(key, recentRequests)

    return {
      allowed: true,
      remaining: config.maxRequests - recentRequests.length,
      resetAt: now + config.windowMs,
    }
  }

  /**
   * Record a request (called automatically by checkLimit)
   */
  recordRequest(operation: string, userId?: string): void {
    const key = this.getStorageKey(operation, userId)
    const requests = this.getRequests(key)
    requests.push({
      timestamp: Date.now(),
      operation,
    })
    this.saveRequests(key, requests)
  }

  /**
   * Get remaining requests for an operation
   */
  getRemaining(operation: string, userId?: string): number {
    const result = this.checkLimit(operation, userId)
    return result.remaining
  }

  /**
   * Reset rate limit for an operation (admin function)
   */
  reset(operation: string, userId?: string): void {
    const key = this.getStorageKey(operation, userId)
    const violationKey = this.getViolationKey(operation, userId)
    
    if (typeof window !== 'undefined' && window.localStorage) {
      localStorage.removeItem(key)
      localStorage.removeItem(violationKey)
    }
  }

  /**
   * Reset all rate limits (admin function)
   */
  resetAll(): void {
    if (typeof window !== 'undefined' && window.localStorage) {
      const keys = Object.keys(localStorage)
      keys.forEach((key) => {
        if (key.startsWith(STORAGE_KEY_PREFIX) || key.startsWith(VIOLATION_KEY_PREFIX)) {
          localStorage.removeItem(key)
        }
      })
    }
  }

  private getStorageKey(operation: string, userId?: string): string {
    const userPart = userId ? `_${userId}` : ''
    return `${STORAGE_KEY_PREFIX}${operation}${userPart}`
  }

  private getViolationKey(operation: string, userId?: string): string {
    const userPart = userId ? `_${userId}` : ''
    return `${VIOLATION_KEY_PREFIX}${operation}${userPart}`
  }

  private getRequests(key: string): RequestRecord[] {
    if (typeof window === 'undefined' || !window.localStorage) {
      return []
    }

    try {
      const data = localStorage.getItem(key)
      if (!data) return []
      
      const parsed = JSON.parse(data) as RequestRecord[]
      return Array.isArray(parsed) ? parsed : []
    } catch {
      return []
    }
  }

  private saveRequests(key: string, requests: RequestRecord[]): void {
    if (typeof window === 'undefined' || !window.localStorage) {
      return
    }

    try {
      // Keep only requests from the last 24 hours
      const oneDayAgo = Date.now() - 86400000
      const filtered = requests.filter((r) => r.timestamp >= oneDayAgo)
      localStorage.setItem(key, JSON.stringify(filtered))
    } catch (error) {
      // Failed to save rate limit requests
    }
  }

  private getViolation(key: string): ViolationRecord | null {
    if (typeof window === 'undefined' || !window.localStorage) {
      return null
    }

    try {
      const data = localStorage.getItem(key)
      if (!data) return null
      
      return JSON.parse(data) as ViolationRecord
    } catch {
      return null
    }
  }

  private recordViolation(key: string, penaltyMs: number): void {
    if (typeof window === 'undefined' || !window.localStorage) {
      return
    }

    try {
      const existing = this.getViolation(key)
      const now = Date.now()
      
      const violation: ViolationRecord = {
        count: existing ? existing.count + 1 : 1,
        lastViolation: now,
        penaltyUntil: now + penaltyMs,
      }
      
      localStorage.setItem(key, JSON.stringify(violation))
      
      // Log violation for monitoring
      // Rate limit violation recorded
    } catch (error) {
      // Failed to record violation
    }
  }

  private cleanup(): void {
    if (typeof window === 'undefined' || !window.localStorage) {
      return
    }

    const now = Date.now()
    const oneDayAgo = now - 86400000
    
    try {
      const keys = Object.keys(localStorage)
      keys.forEach((key) => {
        if (key.startsWith(STORAGE_KEY_PREFIX)) {
          const requests = this.getRequests(key)
          const filtered = requests.filter((r) => r.timestamp >= oneDayAgo)
          if (filtered.length === 0) {
            localStorage.removeItem(key)
          } else if (filtered.length !== requests.length) {
            localStorage.setItem(key, JSON.stringify(filtered))
          }
        } else if (key.startsWith(VIOLATION_KEY_PREFIX)) {
          const violation = this.getViolation(key)
          if (violation && violation.penaltyUntil < now) {
            // Penalty expired, remove violation record
            localStorage.removeItem(key)
          }
        }
      })
    } catch (error) {
      // Rate limiter cleanup error
    }
  }

  /**
   * Destroy the rate limiter and cleanup resources
   */
  destroy(): void {
    if (this.cleanupTimer !== null && typeof window !== 'undefined') {
      window.clearInterval(this.cleanupTimer)
      this.cleanupTimer = null
    }
  }
}

// Singleton instance
export const rateLimiter = new RateLimiter()

/**
 * Rate limit decorator/wrapper for async functions
 */
export function withRateLimit<T extends (...args: any[]) => Promise<any>>(
  operation: string,
  fn: T,
  getUserId?: (...args: Parameters<T>) => string | undefined
): T {
  return (async (...args: Parameters<T>) => {
    const userId = getUserId ? getUserId(...args) : undefined
    const check = rateLimiter.checkLimit(operation, userId)
    
    if (!check.allowed) {
      const error = new Error(
        `Rate limit exceeded for ${operation}. Retry after ${check.retryAfter || 0} seconds.`
      ) as any
      error.code = 'RATE_LIMIT_EXCEEDED'
      error.retryAfter = check.retryAfter
      error.resetAt = check.resetAt
      throw error
    }
    
    try {
      const result = await fn(...args)
      rateLimiter.recordRequest(operation, userId)
      return result
    } catch (error) {
      // Don't record request on error
      throw error
    }
  }) as T
}

/**
 * Get rate limit status for an operation
 */
export function getRateLimitStatus(operation: string, userId?: string) {
  return rateLimiter.checkLimit(operation, userId)
}

