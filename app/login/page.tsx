'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { Input } from '@/components/ui/Input'
import { createClientBrowser } from '@/lib/supabase'
import { Star, Mail, Lock, Eye, EyeOff, ArrowLeft, Loader2 } from 'lucide-react'

type AuthMode = 'login' | 'register'

export default function LoginPage() {
  const router = useRouter()
  const [mode, setMode] = useState<AuthMode>('login')
  const [isLoading, setIsLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [successMessage, setSuccessMessage] = useState('')

  const [formData, setFormData] = useState({
    email: '',
    password: '',
    businessName: '',
  })

  const supabase = createClientBrowser()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')
    setSuccessMessage('')

    try {
      if (mode === 'login') {
        const { error } = await supabase.auth.signInWithPassword({
          email: formData.email,
          password: formData.password,
        })

        if (error) {
          if (error.message.includes('Invalid login')) {
            setError('E-posta veya şifre hatalı.')
          } else {
            setError(error.message)
          }
          return
        }

        router.push('/dashboard')
        router.refresh()
      } else {
        // Register
        if (!formData.businessName.trim()) {
          setError('İşletme adı gereklidir.')
          setIsLoading(false)
          return
        }

        const { error } = await supabase.auth.signUp({
          email: formData.email,
          password: formData.password,
          options: {
            data: {
              business_name: formData.businessName,
            },
          },
        })

        if (error) {
          if (error.message.includes('already registered')) {
            setError('Bu e-posta adresi zaten kayıtlı.')
          } else {
            setError(error.message)
          }
          return
        }

        setSuccessMessage('Kayıt başarılı! Giriş yapabilirsiniz.')
        setMode('login')
        setFormData({ ...formData, businessName: '' })
      }
    } catch (err) {
      setError('Bir hata oluştu. Lütfen tekrar deneyin.')
      console.error('Auth error:', err)
    } finally {
      setIsLoading(false)
    }
  }

  const toggleMode = () => {
    setMode(mode === 'login' ? 'register' : 'login')
    setError('')
    setSuccessMessage('')
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 via-purple-50 to-pink-50 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background decorations */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-72 h-72 bg-primary-200/20 rounded-full blur-3xl animate-float" />
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-purple-200/20 rounded-full blur-3xl animate-float" style={{ animationDelay: '1s' }} />
      </div>

      <div className="w-full max-w-md relative z-10">
        {/* Back Button */}
        <Link href="/">
          <Button variant="ghost" size="sm" leftIcon={<ArrowLeft className="w-4 h-4" />} className="mb-6 hover:bg-white/50">
            Ana Sayfa
          </Button>
        </Link>

        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 mb-4">
            <div className="w-12 h-12 bg-gradient-to-br from-primary-600 via-purple-600 to-pink-600 rounded-xl flex items-center justify-center shadow-lg shadow-primary-500/30 animate-pulse-glow">
              <Star className="w-7 h-7 text-white fill-white" />
            </div>
            <span className="text-2xl font-bold gradient-text">ReviewGuard</span>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            {mode === 'login' ? 'Hoş Geldiniz' : 'Hesap Oluşturun'}
          </h1>
          <p className="text-gray-600 text-lg">
            {mode === 'login' 
              ? 'Hesabınıza giriş yaparak devam edin' 
              : 'Ücretsiz hesap oluşturarak başlayın'}
          </p>
        </div>

        {/* Auth Card */}
        <Card className="p-6 sm:p-8 glass shadow-2xl border-0">
          {error && (
            <div className="mb-6 p-4 bg-danger-50 border border-danger-200 rounded-xl text-danger-700 text-sm">
              {error}
            </div>
          )}

          {successMessage && (
            <div className="mb-6 p-4 bg-success-50 border border-success-200 rounded-xl text-success-700 text-sm">
              {successMessage}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            {mode === 'register' && (
              <Input
                label="İşletme Adı"
                placeholder="İşletmenizin adı"
                value={formData.businessName}
                onChange={(e) => setFormData({ ...formData, businessName: e.target.value })}
                leftIcon={<Star className="w-5 h-5" />}
                required
              />
            )}

            <Input
              label="E-posta Adresi"
              type="email"
              placeholder="ornek@email.com"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              leftIcon={<Mail className="w-5 h-5" />}
              required
            />

            <div className="relative">
              <Input
                label="Şifre"
                type={showPassword ? 'text' : 'password'}
                placeholder="••••••••"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                leftIcon={<Lock className="w-5 h-5" />}
                rightIcon={
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="focus:outline-none"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                }
                required
              />
            </div>

            {mode === 'login' && (
              <div className="flex items-center justify-between text-sm">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" className="w-4 h-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500" />
                  <span className="text-gray-600">Beni hatırla</span>
                </label>
                <a href="#" className="text-primary-600 hover:text-primary-700 font-medium">
                  Şifremi unuttum
                </a>
              </div>
            )}

            <Button
              type="submit"
              className="w-full"
              size="lg"
              isLoading={isLoading}
            >
              {mode === 'login' ? 'Giriş Yap' : 'Hesap Oluştur'}
            </Button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-gray-600">
              {mode === 'login' ? 'Hesabınız yok mu?' : 'Zaten hesabınız var mı?'}{' '}
              <button
                type="button"
                onClick={toggleMode}
                className="text-primary-600 hover:text-primary-700 font-medium"
              >
                {mode === 'login' ? 'Kaydolun' : 'Giriş Yapın'}
              </button>
            </p>
          </div>
        </Card>

        {/* Trust Badges */}
        <div className="mt-8 text-center">
          <p className="text-sm text-gray-600 mb-4 font-medium">Güvenli ve şifreli bağlantı</p>
          <div className="flex items-center justify-center gap-6 text-primary-500">
            <div className="flex flex-col items-center gap-1">
              <svg className="w-10 h-10" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
              </svg>
              <span className="text-xs text-gray-500">Güvenli</span>
            </div>
            <div className="flex flex-col items-center gap-1">
              <svg className="w-10 h-10" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
              </svg>
              <span className="text-xs text-gray-500">Şifreli</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}