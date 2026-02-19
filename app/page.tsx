'use client'

import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { StarRating } from '@/components/ui/StarRating'
import { 
  Star, 
  QrCode, 
  Shield, 
  TrendingUp, 
  MessageSquare, 
  ArrowRight,
  CheckCircle2,
  BarChart3,
  Smartphone
} from 'lucide-react'
import Link from 'next/link'

export default function LandingPage() {
  const features = [
    {
      icon: <QrCode className="w-8 h-8" />,
      title: 'QR Kod Sistemi',
      description: 'Her işletmeye özel QR kodlar oluşturun. Müşterileriniz kolayca tarayıp değerlendirme yapabilir.',
    },
    {
      icon: <Shield className="w-8 h-8" />,
      title: 'Akıllı Filtreleme',
      description: 'Düşük puanları içeride tutun, yüksek puanları Google Maps\'e yönlendirin. İtibarınızı koruyun.',
    },
    {
      icon: <MessageSquare className="w-8 h-8" />,
      title: 'Gerçekçi Geri Bildirim',
      description: 'Olumsuz yorumları sadece siz görün. Müşteri şikayetlerini içeride çözün.',
    },
    {
      icon: <BarChart3 className="w-8 h-8" />,
      title: 'Detaylı Analizler',
      description: 'Müşteri memnuniyetini takip edin, trendleri görün, işletmenizi geliştirin.',
    },
    {
      icon: <TrendingUp className="w-8 h-8" />,
      title: 'SEO Güçlendirmesi',
      description: 'Daha fazla 5 yıldızlı yorum, daha yüksek Google sıralaması.',
    },
    {
      icon: <Smartphone className="w-8 h-8" />,
      title: 'Mobil Uyumlu',
      description: 'Müşterileriniz telefonlarından kolayca değerlendirme yapabilir.',
    },
  ]

  const howItWorks = [
    {
      step: '01',
      title: 'Kaydolun',
      description: 'Hemen ücretsiz hesap oluşturun, işletme bilgilerinizi girin.',
    },
    {
      step: '02',
      title: 'QR Kodunuzu Alın',
      description: 'Size özel QR kodunuzu indirin, masalarınıza veya kasanıza yerleştirin.',
    },
    {
      step: '03',
      title: 'Müşterilerinizi Yönlendirin',
      description: 'Müşteriler QR kodu tarayıp değerlendirme yapar. Düşük puanlar size, yüksek puanlar Google\'a gider.',
    },
  ]

  const testimonials = [
    {
      name: 'Ahmet Yılmaz',
      business: 'Lezzet Cafe',
      comment: 'ReviewGuard sayesinde Google Maps puanımız 3.2\'den 4.7\'ye çıktı. Olumsuz yorumları artık içeride çözüyoruz.',
      rating: 5,
    },
    {
      name: 'Ayşe Kaya',
      business: 'Güzellik Merkezi',
      comment: 'Müşterilerimizden gelen geri bildirimleri takip etmek çok kolay. İşletmemizi çok geliştirdik.',
      rating: 5,
    },
    {
      name: 'Mehmet Demir',
      business: 'Oto Servis',
      comment: 'QR kod sistemi mükemmel çalışıyor. Müşterilerimiz kolayca yorum bırakabiliyor.',
      rating: 5,
    },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 via-purple-50 to-pink-50">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 glass border-b border-gray-200/50 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 bg-gradient-to-br from-primary-600 via-purple-600 to-pink-600 rounded-xl flex items-center justify-center shadow-lg shadow-primary-500/30 animate-pulse-glow">
                <Star className="w-6 h-6 text-white fill-white" />
              </div>
              <span className="text-xl font-bold gradient-text">ReviewGuard</span>
            </div>
            <div className="hidden md:flex items-center gap-8">
              <a href="#features" className="text-gray-600 hover:text-primary-600 font-medium transition-colors relative group">
                Özellikler
                <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-primary-600 transition-all group-hover:w-full" />
              </a>
              <a href="#how-it-works" className="text-gray-600 hover:text-primary-600 font-medium transition-colors relative group">
                Nasıl Çalışır?
                <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-primary-600 transition-all group-hover:w-full" />
              </a>
              <a href="#testimonials" className="text-gray-600 hover:text-primary-600 font-medium transition-colors relative group">
                Yorumlar
                <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-primary-600 transition-all group-hover:w-full" />
              </a>
            </div>
            <div className="flex items-center gap-4">
              <Link href="/login">
                <Button variant="ghost" size="sm" className="hover:bg-primary-50">Giriş Yap</Button>
              </Link>
              <Link href="/login" className="hidden sm:block">
                <Button size="sm" className="shadow-md hover:shadow-lg transition-shadow">Ücretsiz Başla</Button>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
        {/* Background decorations */}
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
          <div className="absolute top-20 left-10 w-72 h-72 bg-primary-200/20 rounded-full blur-3xl animate-float" />
          <div className="absolute bottom-20 right-10 w-96 h-96 bg-purple-200/20 rounded-full blur-3xl animate-float" style={{ animationDelay: '1s' }} />
        </div>
        
        <div className="max-w-7xl mx-auto relative z-10">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="text-center lg:text-left animate-fade-in">
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-primary-100 to-purple-100 text-primary-700 rounded-full text-sm font-medium mb-6 shadow-sm">
                <Star className="w-4 h-4 fill-primary-700" />
                Google Maps İtibar Yönetimi
              </div>
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-gray-900 leading-tight mb-6">
                <span className="gradient-text">5 Yıldızı</span>
                <br />
                Garantileyin
              </h1>
              <p className="text-lg sm:text-xl text-gray-600 mb-8 max-w-2xl mx-auto lg:mx-0 leading-relaxed">
                ReviewGuard ile işletmenizin Google Maps itibarını akıllıca yönetin. 
                Olumsuz yorumları içeride tutun, yüksek puanları Google'a yönlendirin.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                <Link href="/login">
                  <Button size="lg" rightIcon={<ArrowRight className="w-5 h-5" />} className="shadow-lg hover:shadow-xl transition-shadow">
                    Ücretsiz Başla
                  </Button>
                </Link>
                <a href="#how-it-works">
                  <Button variant="outline" size="lg" className="border-2">
                    Nasıl Çalışır?
                  </Button>
                </a>
              </div>
              <div className="mt-8 flex items-center justify-center lg:justify-start gap-6 text-sm text-gray-600">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-success-500" />
                  <span className="font-medium">Ücretsiz Kurulum</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-success-500" />
                  <span className="font-medium">Kredi Kartı Gerekmez</span>
                </div>
              </div>
            </div>
            <div className="relative animate-slide-up">
              <div className="relative z-10">
                <Card className="p-8 glass transform rotate-2 hover:rotate-0 transition-all duration-500 hover:scale-105 shadow-2xl">
                  <div className="text-center">
                    <div className="w-20 h-20 bg-gradient-to-br from-primary-500 via-purple-500 to-pink-500 rounded-2xl mx-auto mb-6 flex items-center justify-center shadow-xl shadow-primary-500/40 animate-pulse-glow">
                      <QrCode className="w-10 h-10 text-white" />
                    </div>
                    <h3 className="text-2xl font-bold text-gray-900 mb-2">QR Kodunuzu Tarayın</h3>
                    <p className="text-gray-600 mb-6">Müşterileriniz kolayca değerlendirme yapabilir</p>
                    <div className="flex justify-center mb-6">
                      <StarRating rating={5} size="lg" />
                    </div>
                    <div className="bg-gradient-to-r from-green-50 via-emerald-50 to-teal-50 border-2 border-green-200 rounded-xl p-4 shadow-sm">
                      <p className="text-green-700 font-semibold">5 Yıldız! Google'a yönlendiriliyor...</p>
                    </div>
                  </div>
                </Card>
              </div>
              <div className="absolute -top-10 -right-10 w-40 h-40 bg-primary-400/30 rounded-full blur-3xl animate-pulse" />
              <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-purple-400/30 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { value: '10K+', label: 'Aktif İşletme' },
              { value: '500K+', label: 'Toplanan Yorum' },
              { value: '4.8', label: 'Ortalama Puan Artışı' },
              { value: '98%', label: 'Müşteri Memnuniyeti' },
            ].map((stat, index) => (
              <Card key={index} className="text-center p-6 card-hover" variant="glass">
                <div className="text-3xl sm:text-4xl font-bold gradient-text mb-2">{stat.value}</div>
                <div className="text-gray-600">{stat.label}</div>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
              Neden <span className="gradient-text">ReviewGuard</span>?
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              İşletmenizin online itibarını korumak ve geliştirmek için ihtiyacınız olan tüm özellikler
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <Card key={index} className="p-6 card-hover group" variant="glass">
                <div className="w-14 h-14 bg-gradient-to-br from-primary-100 via-purple-100 to-pink-100 rounded-xl flex items-center justify-center text-primary-600 mb-4 group-hover:scale-110 transition-transform duration-300 shadow-sm">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-primary-600 transition-colors">{feature.title}</h3>
                <p className="text-gray-600 leading-relaxed">{feature.description}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
              Nasıl <span className="gradient-text">Çalışır</span>?
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Sadece 3 adımda işletmenizin itibar yönetimine başlayın
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {howItWorks.map((step, index) => (
              <div key={index} className="relative">
                <Card className="p-8 h-full text-center card-hover" variant="glass">
                  <div className="text-5xl font-bold text-primary-200 mb-4">{step.step}</div>
                  <h3 className="text-xl font-bold text-gray-900 mb-3">{step.title}</h3>
                  <p className="text-gray-600">{step.description}</p>
                </Card>
                {index < howItWorks.length - 1 && (
                  <div className="hidden md:block absolute top-1/2 -right-4 transform -translate-y-1/2 z-10">
                    <ArrowRight className="w-8 h-8 text-primary-400" />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section id="testimonials" className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
              İşletmeler <span className="gradient-text">Ne Diyor</span>?
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              ReviewGuard kullanan işletme sahiplerinin deneyimleri
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <Card key={index} className="p-6 card-hover" variant="glass">
                <div className="flex items-center gap-1 mb-4">
                  <StarRating rating={testimonial.rating} size="sm" />
                </div>
                <p className="text-gray-700 mb-6 italic">"{testimonial.comment}"</p>
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-gradient-to-br from-primary-500 to-primary-600 rounded-full flex items-center justify-center text-white font-bold">
                    {testimonial.name.charAt(0)}
                  </div>
                  <div>
                    <div className="font-semibold text-gray-900">{testimonial.name}</div>
                    <div className="text-sm text-gray-500">{testimonial.business}</div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <Card className="p-8 sm:p-12 text-center relative overflow-hidden" variant="glass">
            <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-primary-600/10 to-purple-600/10" />
            <div className="relative z-10">
              <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
                Hemen <span className="gradient-text">Başlayın</span>
              </h2>
              <p className="text-lg text-gray-600 mb-8 max-w-2xl mx-auto">
                Ücretsiz hesap oluşturun, işletmenizin Google Maps itibarını kontrol altına alın.
                Kredi kartı gerekmez.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link href="/login">
                  <Button size="lg" rightIcon={<ArrowRight className="w-5 h-5" />}>
                    Ücretsiz Kaydol
                  </Button>
                </Link>
              </div>
            </div>
          </Card>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-4 sm:px-6 lg:px-8 border-t border-gray-200">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 bg-gradient-to-br from-primary-600 to-primary-700 rounded-lg flex items-center justify-center">
                  <Star className="w-5 h-5 text-white fill-white" />
                </div>
                <span className="text-lg font-bold gradient-text">ReviewGuard</span>
              </div>
              <p className="text-gray-600 text-sm">
                İşletmenizin Google Maps itibarını akıllıca yönetin.
              </p>
            </div>
            <div>
              <h4 className="font-semibold text-gray-900 mb-4">Ürün</h4>
              <ul className="space-y-2 text-sm text-gray-600">
                <li><a href="#features" className="hover:text-primary-600 transition-colors">Özellikler</a></li>
                <li><a href="#how-it-works" className="hover:text-primary-600 transition-colors">Nasıl Çalışır</a></li>
                <li><a href="#" className="hover:text-primary-600 transition-colors">Fiyatlandırma</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-gray-900 mb-4">Destek</h4>
              <ul className="space-y-2 text-sm text-gray-600">
                <li><a href="#" className="hover:text-primary-600 transition-colors">Yardım Merkezi</a></li>
                <li><a href="#" className="hover:text-primary-600 transition-colors">İletişim</a></li>
                <li><a href="#" className="hover:text-primary-600 transition-colors">SSS</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-gray-900 mb-4">Yasal</h4>
              <ul className="space-y-2 text-sm text-gray-600">
                <li><a href="#" className="hover:text-primary-600 transition-colors">Gizlilik Politikası</a></li>
                <li><a href="#" className="hover:text-primary-600 transition-colors">Kullanım Koşulları</a></li>
              </ul>
            </div>
          </div>
          <div className="pt-8 border-t border-gray-200 text-center text-sm text-gray-500">
            © {new Date().getFullYear()} ReviewGuard. Tüm hakları saklıdır.
          </div>
        </div>
      </footer>
    </div>
  )
}