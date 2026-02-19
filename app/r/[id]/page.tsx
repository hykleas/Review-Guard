'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { Input, TextArea } from '@/components/ui/Input'
import { StarRatingInput } from '@/components/ui/StarRating'
import { createClientBrowser } from '@/lib/supabase'
import { Profile } from '@/types/supabase'
import { 
  Star, 
  Building2, 
  CheckCircle2, 
  ExternalLink,
  ArrowRight,
  MessageSquare,
  ThumbsUp,
  AlertCircle
} from 'lucide-react'
import Link from 'next/link'
import { cn, isMobileDevice, getGoogleMapsMobileDeepLink } from '@/lib/utils'
import { checkRateLimit } from '@/lib/rateLimit'

type ReviewStep = 'rating' | 'low-rating-form' | 'high-rating-form' | 'thank-you' | 'google-prompt' | 'redirect'

export default function ReviewPage() {
  const params = useParams()
  const supabase = createClientBrowser()
  const qrCodeId = params.id as string

  const [profile, setProfile] = useState<Profile | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')
  const [step, setStep] = useState<ReviewStep>('rating')
  
  const [rating, setRating] = useState(0)
  const [comment, setComment] = useState('')
  const [customerName, setCustomerName] = useState('')
  const [customerEmail, setCustomerEmail] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Profil bilgilerini yükle
  useEffect(() => {
    if (qrCodeId) {
      loadProfile()
    }
  }, [qrCodeId])


  const loadProfile = async () => {
    try {
      setIsLoading(true)
      setError('')
      
      if (!qrCodeId || qrCodeId.trim() === '') {
        setError('Geçersiz QR kod. Lütfen doğru kodu taradığınızdan emin olun.')
        return
      }

      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('qr_code_id', qrCodeId.trim())
        .single()

      if (error) {
        console.error('Load profile error:', error)
        if (error.code === 'PGRST116') {
          setError('QR kod bulunamadı. Lütfen doğru kodu taradığınızdan emin olun.')
        } else {
          setError('Profil yüklenirken bir hata oluştu: ' + error.message)
        }
        return
      }

      if (!data) {
        setError('Geçersiz QR kod. Lütfen doğru kodu taradığınızdan emin olun.')
        return
      }

      setProfile(data)
    } catch (err) {
      console.error('Load profile error:', err)
      setError('Bir hata oluştu. Lütfen tekrar deneyin.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleRatingSelect = (selectedRating: number) => {
    setRating(selectedRating)
    
    // 1-3 yıldız: Düşük puan formu
    // 4-5 yıldız: Yüksek puan formu
    if (selectedRating <= 3) {
      setStep('low-rating-form')
    } else {
      setStep('high-rating-form')
    }
  }

  const handleLowRatingSubmit = async () => {
    if (!profile) return

    // Rate limiting kontrolü
    const clientId = qrCodeId // QR kod ID'sini kullan
    if (!checkRateLimit(`review_${clientId}`, 3, 60000)) {
      alert('Çok fazla yorum gönderdiniz. Lütfen bir dakika sonra tekrar deneyin.')
      return
    }

    setIsSubmitting(true)
    try {
      const { error } = await supabase.from('reviews').insert({
        profile_id: profile.id,
        rating,
        comment: comment.trim() || null,
        customer_name: customerName.trim() || 'Anonim',
        customer_email: customerEmail.trim() || null,
        is_internal: true,
      })

      if (error) {
        console.error('Submit error:', error)
        alert('Yorum gönderilirken bir hata oluştu.')
        return
      }

      setStep('thank-you')
    } catch (err) {
      console.error('Submit error:', err)
      alert('Bir hata oluştu.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleHighRatingSubmit = async () => {
    if (!profile) return

    // Rate limiting kontrolü
    const clientId = qrCodeId
    if (!checkRateLimit(`review_${clientId}`, 3, 60000)) {
      alert('Çok fazla yorum gönderdiniz. Lütfen bir dakika sonra tekrar deneyin.')
      return
    }

    setIsSubmitting(true)
    try {
      // Önce yorumu veritabanına kaydet
      const { error } = await supabase.from('reviews').insert({
        profile_id: profile.id,
        rating,
        comment: comment.trim() || null,
        customer_name: customerName.trim() || 'Anonim',
        customer_email: customerEmail.trim() || null,
        is_internal: !profile.auto_redirect_to_google, // Eğer otomatik yönlendirme kapalıysa internal olarak işaretle
      })

      if (error) {
        console.error('Submit error:', error)
      }

      // Ayarlara göre yönlendirme yap
      const shouldAutoRedirect = profile.auto_redirect_to_google ?? true
      
      if (shouldAutoRedirect && profile.google_maps_link) {
        // Otomatik yönlendirme açıksa ve Google Maps linki varsa direkt yönlendir
        redirectToGoogleImmediately(profile.google_maps_link)
      } else if (profile.show_google_prompt ?? true) {
        // Google prompt sayfası gösterilsin
        setStep('google-prompt')
      } else {
        // Hiçbiri değilse teşekkür sayfasına git
        setStep('thank-you')
      }
    } catch (err) {
      console.error('Submit error:', err)
    } finally {
      setIsSubmitting(false)
    }
  }

  const redirectToGoogleImmediately = async (googleLink: string) => {
    // Yorumu panoya kopyala (mobil ve desktop için)
    const reviewText = comment.trim()
    
    if (reviewText) {
      const mobile = isMobileDevice()
      
      if (mobile) {
        // Mobil cihazlar için özel yöntem
        try {
          // Modern Clipboard API (iOS 13.4+, Android Chrome 66+)
          if (navigator.clipboard && navigator.clipboard.writeText) {
            await navigator.clipboard.writeText(reviewText)
            console.log('ReviewGuard: Yorum panoya kopyalandı (mobil - Clipboard API)')
          } else {
            // Fallback: Textarea yöntemi (mobil için daha güvenilir)
            const textArea = document.createElement('textarea')
            textArea.value = reviewText
            // Mobil için görünür olmalı (bazı tarayıcılarda)
            textArea.style.position = 'fixed'
            textArea.style.top = '0'
            textArea.style.left = '0'
            textArea.style.width = '2em'
            textArea.style.height = '2em'
            textArea.style.padding = '0'
            textArea.style.border = 'none'
            textArea.style.outline = 'none'
            textArea.style.boxShadow = 'none'
            textArea.style.background = 'transparent'
            textArea.style.opacity = '0'
            textArea.setAttribute('readonly', '')
            document.body.appendChild(textArea)
            
            // Mobil için seçim yap
            if (navigator.userAgent.match(/ipad|iphone/i)) {
              // iOS için
              const range = document.createRange()
              range.selectNodeContents(textArea)
              const selection = window.getSelection()
              selection?.removeAllRanges()
              selection?.addRange(range)
              textArea.setSelectionRange(0, 999999)
            } else {
              // Android için
              textArea.select()
            }
            
            try {
              const successful = document.execCommand('copy')
              if (successful) {
                console.log('ReviewGuard: Yorum panoya kopyalandı (mobil - execCommand)')
              }
            } catch (execErr) {
              console.error('ReviewGuard: execCommand hatası', execErr)
            }
            
            document.body.removeChild(textArea)
          }
        } catch (err) {
          console.error('ReviewGuard: Mobil panoya kopyalama hatası', err)
        }
      } else {
        // Desktop için
        try {
          await navigator.clipboard.writeText(reviewText)
          console.log('ReviewGuard: Yorum panoya kopyalandı (desktop)')
        } catch (err) {
          console.error('ReviewGuard: Panoya kopyalama hatası', err)
          // Fallback: Eski yöntem
          try {
            const textArea = document.createElement('textarea')
            textArea.value = reviewText
            textArea.style.position = 'fixed'
            textArea.style.left = '-999999px'
            document.body.appendChild(textArea)
            textArea.select()
            document.execCommand('copy')
            document.body.removeChild(textArea)
            console.log('ReviewGuard: Yorum panoya kopyalandı (desktop - fallback)')
          } catch (fallbackErr) {
            console.error('ReviewGuard: Fallback kopyalama hatası', fallbackErr)
          }
        }
      }
    }

    // Mobil cihaz kontrolü
    const mobile = isMobileDevice()
    
    if (mobile) {
      // Mobil için Google Maps uygulamasına deep link dene
      const deepLinks = getGoogleMapsMobileDeepLink(googleLink)
      
      // Android için
      if (/Android/i.test(navigator.userAgent)) {
        // Önce uygulamayı açmayı dene
        const iframe = document.createElement('iframe')
        iframe.style.display = 'none'
        iframe.src = deepLinks.android
        document.body.appendChild(iframe)
        
        // 300ms sonra hala buradaysak web'e yönlendir
        setTimeout(() => {
          document.body.removeChild(iframe)
          window.location.href = googleLink
        }, 300)
      } 
      // iOS için
      else if (/iPhone|iPad|iPod/i.test(navigator.userAgent)) {
        window.location.href = deepLinks.ios
        setTimeout(() => {
          window.location.href = googleLink
        }, 300)
      } else {
        window.location.href = googleLink
      }
    } else {
      // Desktop için direkt Google Maps'e yönlendir
      window.location.href = googleLink
    }
  }



  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 flex items-center justify-center p-4">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Yükleniyor...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 flex items-center justify-center p-4">
        <Card className="max-w-md w-full p-8 text-center">
          <AlertCircle className="w-16 h-16 text-danger-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Hata</h1>
          <p className="text-gray-600 mb-6">{error}</p>
          <Button onClick={() => window.location.reload()}>Tekrar Dene</Button>
        </Card>
      </div>
    )
  }

  if (!profile) {
    return null
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 flex items-center justify-center p-4">
      <div className="w-full max-w-lg">
        {/* Business Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-3 px-6 py-3 bg-white rounded-2xl shadow-lg mb-6">
            <div className="w-12 h-12 bg-gradient-to-br from-primary-500 to-primary-600 rounded-xl flex items-center justify-center">
              <Building2 className="w-6 h-6 text-white" />
            </div>
            <div className="text-left">
              <p className="text-xs text-gray-500">Değerlendirme yapıyorsunuz</p>
              <p className="font-bold text-gray-900">{profile.business_name}</p>
            </div>
          </div>
        </div>

        {/* Step 1: Rating Selection */}
        {step === 'rating' && (
          <Card className="p-8 animate-fade-in">
            <div className="text-center mb-8">
              <h1 className="text-2xl font-bold text-gray-900 mb-2">
                Deneyiminiz Nasıldı?
              </h1>
              <p className="text-gray-600">
                {profile.business_name} için bir puan seçin
              </p>
            </div>

            <StarRatingInput
              value={rating}
              onChange={handleRatingSelect}
              label="Yıldız seçin"
            />

            <div className="mt-8 text-center">
              <p className="text-sm text-gray-500">
                Seçiminize göre yönlendirileceksiniz
              </p>
            </div>
          </Card>
        )}

        {/* Step 2A: Low Rating Form (1-3 stars) */}
        {step === 'low-rating-form' && (
          <Card className="p-6 sm:p-8 animate-fade-in">
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-danger-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <MessageSquare className="w-8 h-8 text-danger-500" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                Geri Bildiriminiz Önemli
              </h2>
              <p className="text-gray-600">
                Yaşadığınız sorunu öğrenmemize izin verin. Size daha iyi hizmet verebilmemiz için geri bildiriminizi değerlendireceğiz.
              </p>
            </div>

            <div className="flex justify-center mb-6">
              <StarRatingInput value={rating} onChange={() => {}} size="md" />
            </div>

            <div className="space-y-4">
              <TextArea
                label="Deneyiminizi paylaşın (Opsiyonel)"
                placeholder="Yaşadığınız sorunu kısaca açıklayın..."
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                rows={4}
              />

              <div className="grid sm:grid-cols-2 gap-4">
                <Input
                  label="Adınız (Opsiyonel)"
                  placeholder="Adınız"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                />
                <Input
                  label="E-posta (Opsiyonel)"
                  type="email"
                  placeholder="ornek@email.com"
                  value={customerEmail}
                  onChange={(e) => setCustomerEmail(e.target.value)}
                />
              </div>

              <div className="flex gap-3 pt-4">
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() => setStep('rating')}
                >
                  Geri
                </Button>
                <Button
                  className="flex-1"
                  onClick={handleLowRatingSubmit}
                  isLoading={isSubmitting}
                >
                  Gönder
                </Button>
              </div>
            </div>
          </Card>
        )}

        {/* Step 2B: High Rating Form (4-5 stars) */}
        {step === 'high-rating-form' && (
          <Card className="p-6 sm:p-8 animate-fade-in">
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-success-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <ThumbsUp className="w-8 h-8 text-success-500" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                Harika! Teşekkürler
              </h2>
              <p className="text-gray-600">
                Memnuniyetiniz bizim için çok değerli. Google'da da yorum bırakırsanız çok seviniriz!
              </p>
            </div>

            <div className="flex justify-center mb-6">
              <StarRatingInput value={rating} onChange={() => {}} size="md" />
            </div>

            <div className="space-y-4">
              <TextArea
                label="Yorumunuz (Opsiyonel)"
                placeholder="Olumlu deneyiminizi paylaşın..."
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                rows={4}
              />

              <div className="grid sm:grid-cols-2 gap-4">
                <Input
                  label="Adınız (Opsiyonel)"
                  placeholder="Adınız"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                />
                <Input
                  label="E-posta (Opsiyonel)"
                  type="email"
                  placeholder="ornek@email.com"
                  value={customerEmail}
                  onChange={(e) => setCustomerEmail(e.target.value)}
                />
              </div>

              <div className="flex gap-3 pt-4">
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() => setStep('rating')}
                >
                  Geri
                </Button>
                <Button
                  className="flex-1"
                  variant="secondary"
                  onClick={handleHighRatingSubmit}
                  isLoading={isSubmitting}
                  rightIcon={<ArrowRight className="w-4 h-4" />}
                >
                  Devam Et
                </Button>
              </div>
            </div>
          </Card>
        )}

        {/* Step 3A: Thank You (Low Rating) */}
        {step === 'thank-you' && (
          <Card className="p-8 text-center animate-fade-in">
            <div className="w-20 h-20 bg-success-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle2 className="w-10 h-10 text-success-500" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Teşekkür Ederiz!
            </h2>
            <p className="text-gray-600 mb-6">
              Geri bildiriminiz alındı. Yaşadığınız sorunu değerlendirip size en kısa sürede dönüş yapacağız.
            </p>
            <div className="bg-primary-50 rounded-xl p-4 mb-6">
              <p className="text-primary-700 font-medium">
                {profile.business_name} size daha iyi hizmet vermek için çalışıyor.
              </p>
            </div>
            <Button onClick={() => window.close()} variant="outline">
              Kapat
            </Button>
          </Card>
        )}

        {/* Step 3B: Google Prompt (High Rating) */}
        {step === 'google-prompt' && (
          <Card className="p-8 text-center animate-fade-in">
            <div className="w-20 h-20 bg-gradient-to-br from-primary-500 to-primary-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg shadow-primary-500/30">
              <ExternalLink className="w-10 h-10 text-white" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Teşekkür Ederiz!
            </h2>
            <p className="text-gray-600 mb-6">
              Yorumunuz kaydedildi. Google Maps'te de yorum bırakmak ister misiniz? 
              Bu, {profile.business_name} için çok değerli!
            </p>
            
            {profile.google_maps_link ? (
              <div className="space-y-4">
                <Button
                  className="w-full"
                  size="lg"
                  onClick={() => redirectToGoogleImmediately(profile.google_maps_link!)}
                  rightIcon={<ExternalLink className="w-5 h-5" />}
                >
                  Google Maps'te Yorum Yap
                </Button>
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => window.close()}
                >
                  Hayır, Teşekkürler
                </Button>
                <div className="mt-4 p-4 bg-blue-50 rounded-xl border border-blue-200">
                  <p className="text-sm text-blue-700">
                    💡 <strong>İpucu:</strong> Yorumunuz panoya kopyalandı. Google Maps'te yapıştırabilirsiniz!
                  </p>
                </div>
              </div>
            ) : (
              <div className="bg-gray-50 rounded-xl p-4 mb-6">
                <p className="text-gray-600 text-sm">
                  Google Maps linki henüz ayarlanmamış. İşletme sahibi ile iletişime geçin.
                </p>
              </div>
            )}
          </Card>
        )}


        {/* Footer */}
        <div className="mt-8 text-center">
          <Link href="/" className="inline-flex items-center gap-2 text-gray-500 hover:text-gray-700 transition-colors">
            <Star className="w-4 h-4" />
            <span className="text-sm">ReviewGuard ile güçlendirildi</span>
          </Link>
        </div>
      </div>
    </div>
  )
}