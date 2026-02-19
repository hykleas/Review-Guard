import Link from 'next/link'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { Search, Home } from 'lucide-react'

export default function NotFound() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 flex items-center justify-center p-4">
      <Card className="max-w-md w-full p-8 text-center">
        <div className="text-6xl font-bold gradient-text mb-4">404</div>
        <Search className="w-16 h-16 text-gray-400 mx-auto mb-4" />
        <h1 className="text-2xl font-bold text-gray-900 mb-4">
          Sayfa Bulunamadı
        </h1>
        <p className="text-gray-600 mb-6">
          Aradığınız sayfa mevcut değil veya taşınmış olabilir.
        </p>
        <Link href="/">
          <Button leftIcon={<Home className="w-4 h-4" />}>
            Ana Sayfaya Dön
          </Button>
        </Link>
      </Card>
    </div>
  )
}