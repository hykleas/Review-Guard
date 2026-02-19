'use client'

import { useEffect } from 'react'
import { useSearchParams } from 'next/navigation'

/**
 * Google Maps'e yönlendirme sayfası
 */
export default function GoogleRedirectPage() {
  const searchParams = useSearchParams()
  const googleLink = searchParams.get('link') || ''

  useEffect(() => {
    if (!googleLink) return
    window.location.href = decodeURIComponent(googleLink)
  }, [googleLink])

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 flex items-center justify-center p-4">
      <div className="text-center">
        <div className="w-12 h-12 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin mx-auto mb-4" />
        <p className="text-gray-600">Google Maps'e yönlendiriliyorsunuz...</p>
      </div>
    </div>
  )
}
