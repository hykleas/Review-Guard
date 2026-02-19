/**
 * Basit rate limiting için client-side kontrol
 * Gerçek rate limiting backend'de yapılmalı
 */

interface RateLimitStore {
  [key: string]: {
    count: number
    resetTime: number
  }
}

const store: RateLimitStore = {}

export function checkRateLimit(key: string, maxRequests: number = 5, windowMs: number = 60000): boolean {
  const now = Date.now()
  const record = store[key]

  if (!record || now > record.resetTime) {
    // Yeni pencere başlat
    store[key] = {
      count: 1,
      resetTime: now + windowMs,
    }
    return true
  }

  if (record.count >= maxRequests) {
    return false // Rate limit aşıldı
  }

  record.count++
  return true
}

export function getRemainingTime(key: string): number {
  const record = store[key]
  if (!record) return 0
  
  const remaining = record.resetTime - Date.now()
  return Math.max(0, Math.ceil(remaining / 1000))
}
