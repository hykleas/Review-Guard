import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

/**
 * Tailwind CSS class'larını birleştirir
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Tarihi Türkçe formatında gösterir
 */
export function formatDate(date: string | Date): string {
  const d = new Date(date)
  return d.toLocaleDateString('tr-TR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

/**
 * Metni kısaltır
 */
export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text
  return text.slice(0, maxLength) + '...'
}

/**
 * Yıldız sayısına göre renk döndürür
 */
export function getRatingColor(rating: number): string {
  if (rating <= 2) return 'text-red-500'
  if (rating === 3) return 'text-yellow-500'
  return 'text-green-500'
}

/**
 * Yıldız sayısına göre border rengi döndürür
 */
export function getRatingBorderColor(rating: number): string {
  if (rating <= 2) return 'border-red-500'
  if (rating === 3) return 'border-yellow-500'
  return 'border-green-500'
}

/**
 * Yıldız sayısına göre arka plan rengi döndürür
 */
export function getRatingBgColor(rating: number): string {
  if (rating <= 2) return 'bg-red-50'
  if (rating === 3) return 'bg-yellow-50'
  return 'bg-green-50'
}

/**
 * QR kod URL'si oluşturur
 */
export function getQRCodeUrl(qrCodeId: string, baseUrl: string): string {
  return `${baseUrl}/r/${qrCodeId}`
}

/**
 * Google Maps linkini doğrular
 */
export function isValidGoogleMapsLink(url: string): boolean {
  return url.includes('google.com') || url.includes('g.page') || url.includes('maps.app.goo.gl')
}

/**
 * Google Maps URL'ine yorum parametresi ekler (mümkünse)
 */
export function addReviewToGoogleMapsUrl(googleMapsUrl: string, reviewText: string, rating: number): string {
  try {
    const url = new URL(googleMapsUrl)
    // Yorumu URL parametresi olarak ekle (Google desteklemiyor ama deneyelim)
    // Bazı özel formatlar için çalışabilir
    url.searchParams.set('review_text', reviewText)
    url.searchParams.set('rating', rating.toString())
    return url.toString()
  } catch {
    // URL parse edilemezse orijinal URL'i döndür
    return googleMapsUrl
  }
}

/**
 * Mobil cihaz kontrolü
 */
export function isMobileDevice(): boolean {
  if (typeof window === 'undefined') return false
  return /iPhone|iPad|iPod|Android/i.test(navigator.userAgent)
}

/**
 * Google Maps mobil deep link oluşturur
 */
export function getGoogleMapsMobileDeepLink(googleMapsUrl: string): { android: string; ios: string } {
  // URL'den place ID veya koordinatları çıkar
  const urlObj = new URL(googleMapsUrl)
  const placeId = urlObj.searchParams.get('cid') || urlObj.pathname.split('/').pop()
  
  return {
    android: `comgooglemaps://?q=${encodeURIComponent(googleMapsUrl)}`,
    ios: `maps://?q=${encodeURIComponent(googleMapsUrl)}`
  }
}

/**
 * Email doğrulama
 */
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

/**
 * LocalStorage'dan veri okur
 */
export function getLocalStorage<T>(key: string, defaultValue: T): T {
  if (typeof window === 'undefined') return defaultValue
  try {
    const item = window.localStorage.getItem(key)
    return item ? JSON.parse(item) : defaultValue
  } catch {
    return defaultValue
  }
}

/**
 * LocalStorage'a veri yazar
 */
export function setLocalStorage<T>(key: string, value: T): void {
  if (typeof window === 'undefined') return
  try {
    window.localStorage.setItem(key, JSON.stringify(value))
  } catch (error) {
    console.error('LocalStorage error:', error)
  }
}