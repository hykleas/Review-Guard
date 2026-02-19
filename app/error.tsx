'use client'

import { useEffect } from 'react'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { AlertCircle, RefreshCw } from 'lucide-react'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error('Error:', error)
  }, [error])

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 flex items-center justify-center p-4">
      <Card className="max-w-md w-full p-8 text-center">
        <AlertCircle className="w-16 h-16 text-danger-500 mx-auto mb-4" />
        <h1 className="text-2xl font-bold text-gray-900 mb-4">
          Bir Hata Oluştu
        </h1>
        <p className="text-gray-600 mb-6">
          Üzgünüz, bir şeyler yanlış gitti. Lütfen tekrar deneyin.
        </p>
        {error.message && (
          <p className="text-sm text-danger-600 bg-danger-50 rounded-lg p-3 mb-6">
            {error.message}
          </p>
        )}
        <Button
          onClick={reset}
          leftIcon={<RefreshCw className="w-4 h-4" />}
        >
          Tekrar Dene
        </Button>
      </Card>
    </div>
  )
}