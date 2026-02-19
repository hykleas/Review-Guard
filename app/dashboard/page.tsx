'use client'

import { useEffect, useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/Button'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/Card'
import { Input, TextArea } from '@/components/ui/Input'
import { StarRating, StarRatingDisplay } from '@/components/ui/StarRating'
import { createClientBrowser } from '@/lib/supabase'
import { Profile, Review, DashboardStats } from '@/types/supabase'
import { 
  Star, 
  QrCode, 
  LogOut, 
  Link as LinkIcon, 
  Download, 
  Copy, 
  Check,
  MessageSquare,
  TrendingUp,
  AlertCircle,
  ExternalLink,
  Trash2,
  RefreshCw,
  Settings,
  FileText,
  Calendar,
  BarChart3,
  Reply,
  Mail,
  Share2,
  HelpCircle,
  Zap
} from 'lucide-react'
import { QRCodeSVG } from 'qrcode.react'
import { formatDate, getRatingColor, getRatingBgColor, cn } from '@/lib/utils'
import { SimpleBarChart, SimpleLineChart } from '@/components/ui/Chart'
import { Onboarding } from '@/components/ui/Onboarding'

export default function DashboardPage() {
  const router = useRouter()
  const supabase = createClientBrowser()
  const qrRef = useRef<HTMLDivElement>(null)

  const [user, setUser] = useState<any>(null)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [reviews, setReviews] = useState<Review[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [googleMapsLink, setGoogleMapsLink] = useState('')
  const [copied, setCopied] = useState(false)
  const [activeTab, setActiveTab] = useState<'overview' | 'reviews' | 'analytics' | 'settings'>('overview')
  const [timeRange, setTimeRange] = useState<'7d' | '30d' | '90d' | 'all'>('30d')
  const [replyingTo, setReplyingTo] = useState<string | null>(null)
  const [replyText, setReplyText] = useState('')
  const [showOnboarding, setShowOnboarding] = useState(false)
  const [autoRedirectToGoogle, setAutoRedirectToGoogle] = useState(true)
  const [showGooglePrompt, setShowGooglePrompt] = useState(true)
  const [stats, setStats] = useState<DashboardStats>({
    totalReviews: 0,
    averageRating: 0,
    internalReviews: 0,
    googleReviews: 0,
    ratingDistribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 },
  })

  // Kullanıcı ve verileri yükle
  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      setIsLoading(true)

      // Oturum kontrolü
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) {
        router.push('/login')
        return
      }

      setUser(session.user)

      // Profil bilgilerini al
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', session.user.id)
        .single()

      if (profileError) {
        console.error('Profile error:', profileError)
        return
      }

      setProfile(profileData)
      setGoogleMapsLink(profileData.google_maps_link || '')
      setAutoRedirectToGoogle(profileData.auto_redirect_to_google ?? true)
      setShowGooglePrompt(profileData.show_google_prompt ?? true)

      // Yorumları al
      const reviewsResult = await loadReviews(session.user.id)

      // İlk giriş kontrolü - onboarding göster
      const hasSeenOnboarding = localStorage.getItem('reviewguard_onboarding_seen')
      if (!hasSeenOnboarding) {
        // Profil oluşturulma tarihine bak (7 gün içindeyse onboarding göster)
        const createdAt = new Date(profileData.created_at)
        const daysSinceCreation = (Date.now() - createdAt.getTime()) / (1000 * 60 * 60 * 24)
        if (daysSinceCreation < 7) {
          setShowOnboarding(true)
        }
      }
    } catch (error) {
      console.error('Load data error:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const loadReviews = async (userId: string) => {
    const { data: reviewsData, error: reviewsError } = await supabase
      .from('reviews')
      .select('*')
      .eq('profile_id', userId)
      .order('created_at', { ascending: false })

    if (reviewsError) {
      console.error('Reviews error:', reviewsError)
      return []
    }

    setReviews(reviewsData || [])
    calculateStats(reviewsData || [])
    return reviewsData || []
  }

  const calculateStats = (reviewsData: Review[]) => {
    const total = reviewsData.length
    if (total === 0) {
      setStats({
        totalReviews: 0,
        averageRating: 0,
        internalReviews: 0,
        googleReviews: 0,
        ratingDistribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 },
      })
      return
    }

    const sum = reviewsData.reduce((acc, r) => acc + r.rating, 0)
    const internal = reviewsData.filter(r => r.is_internal).length
    const distribution = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 }
    
    reviewsData.forEach(r => {
      distribution[r.rating as keyof typeof distribution]++
    })

    setStats({
      totalReviews: total,
      averageRating: Number((sum / total).toFixed(1)),
      internalReviews: internal,
      googleReviews: total - internal,
      ratingDistribution: distribution,
    })
  }

  // Zaman bazlı filtreleme
  const getFilteredReviews = () => {
    const now = new Date()
    const filterDate = new Date()
    
    switch (timeRange) {
      case '7d':
        filterDate.setDate(now.getDate() - 7)
        break
      case '30d':
        filterDate.setDate(now.getDate() - 30)
        break
      case '90d':
        filterDate.setDate(now.getDate() - 90)
        break
      case 'all':
        return reviews
    }
    
    return reviews.filter(r => new Date(r.created_at) >= filterDate)
  }

  // Zaman bazlı trend verisi
  const getTrendData = () => {
    const filtered = getFilteredReviews()
    const days = timeRange === '7d' ? 7 : timeRange === '30d' ? 30 : timeRange === '90d' ? 90 : 365
    const data: { label: string; value: number }[] = []
    
    for (let i = days - 1; i >= 0; i--) {
      const date = new Date()
      date.setDate(date.getDate() - i)
      const dateStr = date.toLocaleDateString('tr-TR', { day: '2-digit', month: 'short' })
      
      const count = filtered.filter(r => {
        const reviewDate = new Date(r.created_at)
        return reviewDate.toDateString() === date.toDateString()
      }).length
      
      data.push({ label: dateStr, value: count })
    }
    
    return data
  }

  // CSV Export
  const handleExportCSV = () => {
    const headers = ['Tarih', 'Müşteri Adı', 'E-posta', 'Puan', 'Yorum', 'Durum']
    const rows = reviews.map(r => [
      formatDate(r.created_at),
      r.customer_name,
      r.customer_email || '',
      r.rating.toString(),
      (r.comment || '').replace(/"/g, '""'),
      r.is_internal ? 'İç Yorum' : 'Google\'a Gönderildi'
    ])
    
    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n')
    
    const blob = new Blob(['\ufeff' + csvContent], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    link.href = URL.createObjectURL(blob)
    link.download = `reviewguard-yorumlar-${new Date().toISOString().split('T')[0]}.csv`
    link.click()
  }

  // Yorum yanıtlama
  const handleReply = async (reviewId: string) => {
    if (!replyText.trim()) return
    
    // Burada email gönderme veya veritabanına kaydetme yapılabilir
    alert(`Yanıt gönderildi: ${replyText}`)
    setReplyingTo(null)
    setReplyText('')
  }

  const handleSaveGoogleLink = async () => {
    if (!profile) return

    setIsSaving(true)
    try {
      const { data, error } = await supabase
        .from('profiles')
        .update({ google_maps_link: googleMapsLink })
        .eq('id', profile.id)
        .select()
        .single()

      if (error) {
        alert('Kaydetme hatası: ' + error.message)
        return
      }

      // Profili güncelle
      if (data) {
        setProfile(data)
      }

      alert('Google Maps linki kaydedildi!')
    } catch (error) {
      console.error('Save error:', error)
      alert('Bir hata oluştu. Lütfen tekrar deneyin.')
    } finally {
      setIsSaving(false)
    }
  }

  const handleSaveSettings = async (settings: { auto_redirect_to_google?: boolean; show_google_prompt?: boolean }) => {
    if (!profile) return

    try {
      const { data, error } = await supabase
        .from('profiles')
        .update(settings)
        .eq('id', profile.id)
        .select()
        .single()

      if (error) {
        console.error('Settings save error:', error)
        alert('Ayar kaydetme hatası: ' + error.message)
        return
      }

      if (data) {
        setProfile(data)
      }
    } catch (error) {
      console.error('Settings save error:', error)
    }
  }

  const handleRefreshQRCode = async () => {
    if (!profile) return

    if (!confirm('QR kodunuz yenilenecek. Eski QR kod artık çalışmayacak. Devam etmek istiyor musunuz?')) {
      return
    }

    setIsSaving(true)
    try {
      // Yeni QR kod ID oluştur (16 karakter hex string)
      let newQrCodeId = ''
      if (typeof window !== 'undefined' && window.crypto && window.crypto.getRandomValues) {
        const array = new Uint8Array(8)
        window.crypto.getRandomValues(array)
        newQrCodeId = Array.from(array)
          .map(b => b.toString(16).padStart(2, '0'))
          .join('')
      } else {
        // Fallback: basit random string
        newQrCodeId = Math.random().toString(36).substring(2, 18) + Math.random().toString(36).substring(2, 18)
        newQrCodeId = newQrCodeId.substring(0, 16)
      }

      const { data, error } = await supabase
        .from('profiles')
        .update({ qr_code_id: newQrCodeId })
        .eq('id', profile.id)
        .select()
        .single()

      if (error) {
        alert('QR kod yenileme hatası: ' + error.message)
        return
      }

      // Profili güncelle
      if (data) {
        setProfile(data)
        alert('QR kod başarıyla yenilendi! Yeni QR kodunuzu indirmeyi unutmayın.')
      }
    } catch (error) {
      console.error('Refresh QR error:', error)
      alert('Bir hata oluştu. Lütfen tekrar deneyin.')
    } finally {
      setIsSaving(false)
    }
  }

  const handleCopyQRLink = () => {
    if (!profile?.qr_code_id) return
    
    const link = `${window.location.origin}/r/${profile.qr_code_id}`
    navigator.clipboard.writeText(link)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleDownloadQR = () => {
    if (!qrRef.current) return

    const svg = qrRef.current.querySelector('svg')
    if (!svg) return

    const svgData = new XMLSerializer().serializeToString(svg)
    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')
    const img = new Image()

    img.onload = () => {
      canvas.width = img.width
      canvas.height = img.height
      ctx?.drawImage(img, 0, 0)
      
      const pngFile = canvas.toDataURL('image/png')
      const downloadLink = document.createElement('a')
      downloadLink.download = `reviewguard-qr-${profile?.business_name || 'kod'}.png`
      downloadLink.href = pngFile
      downloadLink.click()
    }

    img.src = 'data:image/svg+xml;base64,' + btoa(svgData)
  }

  const handleDeleteReview = async (reviewId: string) => {
    if (!confirm('Bu yorumu silmek istediğinize emin misiniz?')) return

    try {
      const { error } = await supabase
        .from('reviews')
        .delete()
        .eq('id', reviewId)

      if (error) {
        alert('Silme hatası: ' + error.message)
        return
      }

      setReviews(reviews.filter(r => r.id !== reviewId))
      calculateStats(reviews.filter(r => r.id !== reviewId))
    } catch (error) {
      console.error('Delete error:', error)
    }
  }

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/')
    router.refresh()
  }

  const getQRCodeUrl = () => {
    if (!profile?.qr_code_id) return ''
    return `${typeof window !== 'undefined' ? window.location.origin : ''}/r/${profile.qr_code_id}`
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Yükleniyor...</p>
        </div>
      </div>
    )
  }

  if (!user || !profile) {
    return null
  }

  const onboardingSteps = [
    {
      title: 'ReviewGuard\'a Hoş Geldiniz! 🎉',
      description: 'Google Maps itibar yönetiminizi kolaylaştıran güçlü araçlarla tanışın.',
      image: '⭐',
    },
    {
      title: 'QR Kodunuzu Oluşturun',
      description: 'Müşterilerinizin kolayca değerlendirme yapabilmesi için QR kodunuzu indirin ve yerleştirin.',
      image: '📱',
    },
    {
      title: 'Yorumları Yönetin',
      description: 'Gelen yorumları görüntüleyin, analiz edin ve Google Maps\'e yönlendirin.',
      image: '📊',
    },
    {
      title: 'Başarıya Giden Yol',
      description: 'Artık hazırsınız! İşletmenizin itibarını artırmaya başlayın.',
      image: '🚀',
    },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      {showOnboarding && (
        <Onboarding
          steps={onboardingSteps}
          onComplete={() => {
            setShowOnboarding(false)
            localStorage.setItem('reviewguard_onboarding_seen', 'true')
          }}
        />
      )}
      {/* Header */}
      <header className="glass sticky top-0 z-50 border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-4">
              <Link href="/" className="flex items-center gap-2">
                <div className="w-10 h-10 bg-gradient-to-br from-primary-600 to-primary-700 rounded-xl flex items-center justify-center shadow-lg shadow-primary-500/30">
                  <Star className="w-6 h-6 text-white fill-white" />
                </div>
                <span className="text-xl font-bold gradient-text hidden sm:block">ReviewGuard</span>
              </Link>
            </div>
            
            <div className="flex items-center gap-4">
              <div className="hidden sm:flex items-center gap-2 px-4 py-2 bg-white rounded-xl border border-gray-200">
                <div className="w-8 h-8 bg-gradient-to-br from-primary-500 to-primary-600 rounded-full flex items-center justify-center text-white text-sm font-bold">
                  {profile.business_name.charAt(0)}
                </div>
                <span className="text-sm font-medium text-gray-700">{profile.business_name}</span>
              </div>
              <Button variant="ghost" size="sm" onClick={handleLogout} leftIcon={<LogOut className="w-4 h-4" />}>
                <span className="hidden sm:inline">Çıkış</span>
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Navigation Tabs */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="flex gap-6">
            {[
              { id: 'overview', label: 'Genel Bakış', icon: TrendingUp },
              { id: 'reviews', label: 'Yorumlar', icon: MessageSquare },
              { id: 'analytics', label: 'Analitik', icon: BarChart3 },
              { id: 'settings', label: 'Ayarlar', icon: Settings },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={cn(
                  'flex items-center gap-2 py-4 border-b-2 font-medium text-sm transition-colors',
                  activeTab === tab.id
                    ? 'border-primary-600 text-primary-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                )}
              >
                <tab.icon className="w-4 h-4" />
                {tab.label}
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div className="space-y-8 animate-fade-in">
            {/* Stats Cards */}
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-500 mb-1">Toplam Yorum</p>
                    <p className="text-3xl font-bold text-gray-900">{stats.totalReviews}</p>
                  </div>
                  <div className="w-12 h-12 bg-primary-100 rounded-xl flex items-center justify-center">
                    <MessageSquare className="w-6 h-6 text-primary-600" />
                  </div>
                </div>
              </Card>

              <Card className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-500 mb-1">Ortalama Puan</p>
                    <p className="text-3xl font-bold text-gray-900">{stats.averageRating}</p>
                  </div>
                  <div className="w-12 h-12 bg-warning-100 rounded-xl flex items-center justify-center">
                    <Star className="w-6 h-6 text-warning-600 fill-warning-600" />
                  </div>
                </div>
              </Card>

              <Card className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-500 mb-1">İç Yorumlar</p>
                    <p className="text-3xl font-bold text-gray-900">{stats.internalReviews}</p>
                  </div>
                  <div className="w-12 h-12 bg-danger-100 rounded-xl flex items-center justify-center">
                    <AlertCircle className="w-6 h-6 text-danger-600" />
                  </div>
                </div>
              </Card>

              <Card className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-500 mb-1">Google Yorumları</p>
                    <p className="text-3xl font-bold text-gray-900">{stats.googleReviews}</p>
                  </div>
                  <div className="w-12 h-12 bg-success-100 rounded-xl flex items-center justify-center">
                    <ExternalLink className="w-6 h-6 text-success-600" />
                  </div>
                </div>
              </Card>
            </div>

            {/* Rating Distribution */}
            <Card className="p-6">
              <CardHeader className="px-0 pt-0">
                <CardTitle>Puan Dağılımı</CardTitle>
                <CardDescription>Yıldız bazında yorum dağılımı</CardDescription>
              </CardHeader>
              <CardContent className="px-0 pb-0">
                <div className="space-y-3">
                  {[5, 4, 3, 2, 1].map((star) => {
                    const count = stats.ratingDistribution[star as keyof typeof stats.ratingDistribution]
                    const percentage = stats.totalReviews > 0 ? (count / stats.totalReviews) * 100 : 0
                    
                    return (
                      <div key={star} className="flex items-center gap-4">
                        <div className="flex items-center gap-2 w-20">
                          <span className="font-medium text-gray-700">{star}</span>
                          <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                        </div>
                        <div className="flex-1 h-3 bg-gray-100 rounded-full overflow-hidden">
                          <div
                            className={cn(
                              'h-full rounded-full transition-all duration-500',
                              star >= 4 ? 'bg-green-500' : star === 3 ? 'bg-yellow-400' : 'bg-red-500'
                            )}
                            style={{ width: `${percentage}%` }}
                          />
                        </div>
                        <div className="w-16 text-right text-sm text-gray-600">
                          {count} ({percentage.toFixed(0)}%)
                        </div>
                      </div>
                    )
                  })}
                </div>
              </CardContent>
            </Card>

            {/* QR Code Preview */}
            <Card className="p-6">
              <CardHeader className="px-0 pt-0">
                <CardTitle>QR Kodunuz</CardTitle>
                <CardDescription>Müşterileriniz bu kodu tarayarak değerlendirme yapabilir</CardDescription>
              </CardHeader>
              <CardContent className="px-0 pb-0">
                <div className="flex flex-col sm:flex-row items-center gap-8">
                  <div ref={qrRef} className="qr-container">
                    <QRCodeSVG
                      value={getQRCodeUrl()}
                      size={200}
                      level="H"
                      includeMargin={true}
                      imageSettings={{
                        src: '/favicon.ico',
                        height: 30,
                        width: 30,
                        excavate: true,
                      }}
                    />
                  </div>
                  <div className="flex-1 space-y-4">
                    <div>
                      <p className="text-sm text-gray-500 mb-2">QR Kod Linki</p>
                      <div className="flex gap-2">
                        <Input
                          value={getQRCodeUrl()}
                          readOnly
                          className="flex-1"
                        />
                        <Button
                          variant="outline"
                          onClick={handleCopyQRLink}
                          leftIcon={copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                        >
                          {copied ? 'Kopyalandı' : 'Kopyala'}
                        </Button>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button 
                        onClick={handleDownloadQR} 
                        leftIcon={<Download className="w-4 h-4" />}
                        className="flex-1"
                      >
                        QR Kodu İndir
                      </Button>
                      <Button 
                        onClick={handleRefreshQRCode} 
                        variant="outline"
                        leftIcon={<RefreshCw className="w-4 h-4" />}
                        isLoading={isSaving}
                        className="flex-1"
                      >
                        QR Kodu Yenile
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Reviews Tab */}
        {activeTab === 'reviews' && (
          <div className="space-y-6 animate-fade-in">
            <div className="flex items-center justify-between flex-wrap gap-4">
              <h2 className="text-2xl font-bold text-gray-900">Gelen Yorumlar</h2>
              <div className="flex items-center gap-2">
                <Button 
                  variant="outline" 
                  onClick={handleExportCSV} 
                  leftIcon={<FileText className="w-4 h-4" />}
                >
                  CSV İndir
                </Button>
                <Button variant="outline" onClick={() => loadReviews(user.id)} leftIcon={<RefreshCw className="w-4 h-4" />}>
                  Yenile
                </Button>
              </div>
            </div>

            {reviews.length === 0 ? (
              <Card className="p-12 text-center">
                <MessageSquare className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-700 mb-2">Henüz Yorum Yok</h3>
                <p className="text-gray-500">Müşterilerinizden ilk yorumu almak için QR kodunuzu kullanın.</p>
              </Card>
            ) : (
              <div className="space-y-4">
                {reviews.map((review) => (
                  <Card
                    key={review.id}
                    className={cn(
                      'review-card',
                      review.rating <= 2 ? 'low-rating' : review.rating === 3 ? 'medium-rating' : 'high-rating'
                    )}
                  >
                    <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-3">
                          <StarRatingDisplay rating={review.rating} showLabel />
                          <span className="text-sm text-gray-400">•</span>
                          <span className="text-sm text-gray-500">{formatDate(review.created_at)}</span>
                          {!review.is_internal && (
                            <>
                              <span className="text-sm text-gray-400">•</span>
                              <span className="px-2 py-1 bg-green-100 text-green-700 text-xs font-medium rounded-full">
                                Google'a Gönderildi
                              </span>
                            </>
                          )}
                        </div>
                        <p className="text-gray-700 mb-2">{review.comment || 'Yorum bırakılmamış.'}</p>
                        <div className="flex items-center gap-2 text-sm text-gray-500">
                          <span className="font-medium">{review.customer_name}</span>
                          {review.customer_email && (
                            <>
                              <span>•</span>
                              <a href={`mailto:${review.customer_email}`} className="hover:text-primary-600 transition-colors">
                                {review.customer_email}
                              </a>
                            </>
                          )}
                        </div>
                        {replyingTo === review.id && (
                          <div className="mt-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
                            <TextArea
                              placeholder="Yanıtınızı yazın..."
                              value={replyText}
                              onChange={(e) => setReplyText(e.target.value)}
                              rows={3}
                            />
                            <div className="flex gap-2 mt-2">
                              <Button size="sm" onClick={() => handleReply(review.id)}>
                                Gönder
                              </Button>
                              <Button size="sm" variant="outline" onClick={() => {
                                setReplyingTo(null)
                                setReplyText('')
                              }}>
                                İptal
                              </Button>
                            </div>
                          </div>
                        )}
                      </div>
                      <div className="flex flex-col gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setReplyingTo(replyingTo === review.id ? null : review.id)}
                          leftIcon={<Reply className="w-4 h-4" />}
                          className="text-primary-500 hover:text-primary-600 hover:bg-primary-50"
                        >
                          Yanıtla
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteReview(review.id)}
                          leftIcon={<Trash2 className="w-4 h-4" />}
                          className="text-danger-500 hover:text-danger-600 hover:bg-danger-50"
                        >
                          Sil
                        </Button>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Analytics Tab */}
        {activeTab === 'analytics' && (
          <div className="space-y-6 animate-fade-in">
            {/* Time Range Selector */}
            <div className="flex items-center justify-between flex-wrap gap-4">
              <h2 className="text-2xl font-bold text-gray-900">Analitik ve Trendler</h2>
              <div className="flex items-center gap-2">
                {(['7d', '30d', '90d', 'all'] as const).map((range) => (
                  <Button
                    key={range}
                    variant={timeRange === range ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setTimeRange(range)}
                  >
                    {range === '7d' ? '7 Gün' : range === '30d' ? '30 Gün' : range === '90d' ? '90 Gün' : 'Tümü'}
                  </Button>
                ))}
              </div>
            </div>

            {/* Trend Chart */}
            <Card className="p-6">
              <CardHeader className="px-0 pt-0">
                <CardTitle>Yorum Trendi</CardTitle>
                <CardDescription>Zaman içinde yorum sayısı değişimi</CardDescription>
              </CardHeader>
              <CardContent className="px-0 pb-0">
                <div className="h-64">
                  <SimpleLineChart data={getTrendData()} height={256} color="#3b82f6" />
                </div>
              </CardContent>
            </Card>

            {/* Rating Distribution Chart */}
            <Card className="p-6">
              <CardHeader className="px-0 pt-0">
                <CardTitle>Puan Dağılımı Grafiği</CardTitle>
                <CardDescription>Yıldız bazında görsel dağılım</CardDescription>
              </CardHeader>
              <CardContent className="px-0 pb-0">
                <div className="h-64">
                  <SimpleBarChart
                    data={[
                      { label: '5⭐', value: stats.ratingDistribution[5], color: '#22c55e' },
                      { label: '4⭐', value: stats.ratingDistribution[4], color: '#84cc16' },
                      { label: '3⭐', value: stats.ratingDistribution[3], color: '#eab308' },
                      { label: '2⭐', value: stats.ratingDistribution[2], color: '#f97316' },
                      { label: '1⭐', value: stats.ratingDistribution[1], color: '#ef4444' },
                    ]}
                    height={256}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Key Metrics */}
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-500 mb-1">Seçili Dönem</p>
                    <p className="text-2xl font-bold text-gray-900">{getFilteredReviews().length}</p>
                    <p className="text-xs text-gray-500 mt-1">yorum</p>
                  </div>
                  <Calendar className="w-8 h-8 text-primary-500" />
                </div>
              </Card>

              <Card className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-500 mb-1">Ortalama Puan</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {getFilteredReviews().length > 0
                        ? (getFilteredReviews().reduce((acc, r) => acc + r.rating, 0) / getFilteredReviews().length).toFixed(1)
                        : '0'}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">5 üzerinden</p>
                  </div>
                  <TrendingUp className="w-8 h-8 text-success-500" />
                </div>
              </Card>

              <Card className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-500 mb-1">Google'a Gönderilen</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {getFilteredReviews().filter(r => !r.is_internal).length}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">yorum</p>
                  </div>
                  <ExternalLink className="w-8 h-8 text-green-500" />
                </div>
              </Card>

              <Card className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-500 mb-1">İç Yorumlar</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {getFilteredReviews().filter(r => r.is_internal).length}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">yorum</p>
                  </div>
                  <AlertCircle className="w-8 h-8 text-orange-500" />
                </div>
              </Card>
            </div>

            {/* Export Options */}
            <Card className="p-6">
              <CardHeader className="px-0 pt-0">
                <CardTitle>Veri Dışa Aktarma</CardTitle>
                <CardDescription>Yorumlarınızı farklı formatlarda indirin</CardDescription>
              </CardHeader>
              <CardContent className="px-0 pb-0">
                <div className="flex flex-wrap gap-4">
                  <Button
                    variant="outline"
                    onClick={handleExportCSV}
                    leftIcon={<FileText className="w-4 h-4" />}
                  >
                    CSV Formatında İndir
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => {
                      const text = reviews.map(r => 
                        `Tarih: ${formatDate(r.created_at)}\nMüşteri: ${r.customer_name}\nPuan: ${r.rating}/5\nYorum: ${r.comment || 'Yok'}\n\n`
                      ).join('---\n\n')
                      const blob = new Blob([text], { type: 'text/plain' })
                      const link = document.createElement('a')
                      link.href = URL.createObjectURL(blob)
                      link.download = `reviewguard-yorumlar-${new Date().toISOString().split('T')[0]}.txt`
                      link.click()
                    }}
                    leftIcon={<FileText className="w-4 h-4" />}
                  >
                    Metin Formatında İndir
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Settings Tab */}
        {activeTab === 'settings' && (
          <div className="space-y-6 animate-fade-in">
            {/* Google Maps Integration Settings */}
            <Card className="p-6">
              <CardHeader className="px-0 pt-0">
                <CardTitle>Google Maps Entegrasyonu</CardTitle>
                <CardDescription>
                  Yüksek puanlı yorumların Google Maps'e yönlendirme ayarları
                </CardDescription>
              </CardHeader>
              <CardContent className="px-0 pb-0 space-y-6">
                <div>
                  <Input
                    label="Google Maps Yorum Linki"
                    placeholder="https://g.page/r/..."
                    value={googleMapsLink}
                    onChange={(e) => setGoogleMapsLink(e.target.value)}
                    leftIcon={<LinkIcon className="w-5 h-5" />}
                    helperText="Google Maps işletme sayfanızdan 'Yorum Yaz' linkini kopyalayın."
                  />
                  <Button
                    onClick={handleSaveGoogleLink}
                    isLoading={isSaving}
                    leftIcon={<Check className="w-4 h-4" />}
                    className="mt-4"
                  >
                    Linki Kaydet
                  </Button>
                </div>

                <div className="border-t border-gray-200 pt-6 space-y-4">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <h3 className="text-sm font-semibold text-gray-900 mb-1">
                        Otomatik Google'a Yönlendirme
                      </h3>
                      <p className="text-sm text-gray-500">
                        4-5 yıldız veren müşteriler otomatik olarak Google Maps'e yönlendirilsin mi?
                        Kapalıysa sadece yorum sonrası sayfa gösterilir.
                      </p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={autoRedirectToGoogle}
                        onChange={(e) => {
                          setAutoRedirectToGoogle(e.target.checked)
                          handleSaveSettings({ auto_redirect_to_google: e.target.checked })
                        }}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
                    </label>
                  </div>

                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <h3 className="text-sm font-semibold text-gray-900 mb-1">
                        Google Yorum Sayfası Göster
                      </h3>
                      <p className="text-sm text-gray-500">
                        Yorum sonrası "Google'da da yorum yapmak ister misiniz?" sayfası gösterilsin mi?
                      </p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={showGooglePrompt}
                        onChange={(e) => {
                          setShowGooglePrompt(e.target.checked)
                          handleSaveSettings({ show_google_prompt: e.target.checked })
                        }}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
                    </label>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Business Information */}
            <Card className="p-6">
              <CardHeader className="px-0 pt-0">
                <CardTitle>İşletme Bilgileri</CardTitle>
                <CardDescription>Hesap bilgileriniz</CardDescription>
              </CardHeader>
              <CardContent className="px-0 pb-0 space-y-4">
                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">İşletme Adı</label>
                    <Input value={profile.business_name} readOnly />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">E-posta</label>
                    <Input value={profile.email} readOnly />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">QR Kod ID</label>
                  <Input value={profile.qr_code_id || ''} readOnly />
                </div>
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card className="p-6">
              <CardHeader className="px-0 pt-0">
                <CardTitle>Hızlı İşlemler</CardTitle>
                <CardDescription>Yaygın görevler için hızlı erişim</CardDescription>
              </CardHeader>
              <CardContent className="px-0 pb-0">
                <div className="grid sm:grid-cols-2 gap-4">
                  <Button
                    variant="outline"
                    onClick={() => {
                      const qrUrl = getQRCodeUrl()
                      const shareText = `${profile.business_name} için değerlendirme yapın: ${qrUrl}`
                      if (navigator.share) {
                        navigator.share({
                          title: 'ReviewGuard QR Kod',
                          text: shareText,
                          url: qrUrl,
                        })
                      } else {
                        navigator.clipboard.writeText(shareText)
                        alert('QR kod linki panoya kopyalandı!')
                      }
                    }}
                    leftIcon={<Share2 className="w-4 h-4" />}
                    className="w-full"
                  >
                    QR Kodu Paylaş
                  </Button>
                  <Button
                    variant="outline"
                    onClick={handleExportCSV}
                    leftIcon={<FileText className="w-4 h-4" />}
                    className="w-full"
                  >
                    Verileri Dışa Aktar
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Help & Support */}
            <Card className="p-6 bg-gradient-to-br from-primary-50 to-purple-50 border-primary-200">
              <CardHeader className="px-0 pt-0">
                <CardTitle className="flex items-center gap-2">
                  <HelpCircle className="w-5 h-5 text-primary-600" />
                  Yardım ve Destek
                </CardTitle>
                <CardDescription>İhtiyacınız olan bilgilere hızlıca ulaşın</CardDescription>
              </CardHeader>
              <CardContent className="px-0 pb-0">
                <div className="space-y-3">
                  <div className="flex items-start gap-3 p-3 bg-white rounded-lg">
                    <Zap className="w-5 h-5 text-primary-600 mt-0.5" />
                    <div>
                      <p className="font-medium text-gray-900 mb-1">Hızlı Başlangıç</p>
                      <p className="text-sm text-gray-600">
                        QR kodunuzu indirin ve müşterilerinizin görebileceği yerlere yerleştirin.
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3 p-3 bg-white rounded-lg">
                    <BarChart3 className="w-5 h-5 text-primary-600 mt-0.5" />
                    <div>
                      <p className="font-medium text-gray-900 mb-1">Analitik</p>
                      <p className="text-sm text-gray-600">
                        Yorumlarınızı analiz edin ve işletmenizi geliştirin.
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3 p-3 bg-white rounded-lg">
                    <Mail className="w-5 h-5 text-primary-600 mt-0.5" />
                    <div>
                      <p className="font-medium text-gray-900 mb-1">İletişim</p>
                      <p className="text-sm text-gray-600">
                        Sorularınız için destek ekibimizle iletişime geçin.
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </main>
    </div>
  )
}