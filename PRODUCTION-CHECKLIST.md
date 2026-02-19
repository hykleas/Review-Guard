# 🚀 ReviewGuard - Production Deployment Checklist

## ✅ Veritabanı Hazırlığı

### 1. Supabase Database Setup
- [ ] Supabase Dashboard → SQL Editor'a git
- [ ] `supabase-setup.sql` dosyasını çalıştır (temel tablolar ve RLS politikaları)
- [ ] `supabase-migration-settings.sql` dosyasını çalıştır (ayarlar alanları için)
- [ ] Tabloların oluşturulduğunu kontrol et:
  - `profiles` tablosu
  - `reviews` tablosu
  - RLS politikaları aktif

### 2. Veritabanı Kontrolleri
```sql
-- Kontrol sorguları
SELECT * FROM public.profiles LIMIT 1;
SELECT * FROM public.reviews LIMIT 1;

-- Ayarlar alanlarının varlığını kontrol et
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'profiles' 
AND column_name IN ('auto_redirect_to_google', 'show_google_prompt');
```

## 🌐 Environment Variables

### Production Ortamı İçin (.env.production veya Vercel Environment Variables)

```env
NEXT_PUBLIC_SUPABASE_URL=your-supabase-project-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
```

**ÖNEMLİ:** `.env.local` dosyasını git'e commit ETMEYİN! (zaten .gitignore'da olmalı)

## 📦 Deployment (Vercel)

### 1. Vercel'e Deploy
```bash
npm i -g vercel
vercel
```

### 2. Environment Variables Ekle
Vercel Dashboard → Project Settings → Environment Variables:
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`

### 3. Build Kontrolü
```bash
npm run build
```
Build başarılı olmalı, hata olmamalı.

## 🔐 Supabase Auth Ayarları

### 1. Site URL Ayarları
Supabase Dashboard → Authentication → URL Configuration:
- **Site URL**: `https://your-app.vercel.app`
- **Redirect URLs**: 
  - `https://your-app.vercel.app/**`
  - `https://your-app.vercel.app/dashboard`
  - `https://your-app.vercel.app/login`

### 2. Email Templates (Opsiyonel)
- Email confirmation template'i özelleştir
- Password reset template'i özelleştir

## ✅ Özellik Kontrolleri

### Test Edilmesi Gerekenler:
- [ ] Kullanıcı kaydı çalışıyor mu?
- [ ] Giriş yapma çalışıyor mu?
- [ ] Dashboard yükleniyor mu?
- [ ] QR kod oluşturuluyor mu?
- [ ] QR kod indirme çalışıyor mu?
- [ ] QR kod yenileme çalışıyor mu?
- [ ] Yorum gönderme çalışıyor mu?
- [ ] Google Maps yönlendirme çalışıyor mu?
- [ ] Panoya kopyalama çalışıyor mu? (mobil ve desktop)
- [ ] Ayarlar kaydediliyor mu?
- [ ] Analytics sekmesi çalışıyor mu?
- [ ] CSV export çalışıyor mu?
- [ ] Yorum yanıtlama çalışıyor mu?
- [ ] Rate limiting çalışıyor mu?

## 🎨 UI/UX Kontrolleri

- [ ] Mobil responsive çalışıyor mu?
- [ ] Tüm sayfalar düzgün görünüyor mu?
- [ ] Animasyonlar sorunsuz çalışıyor mu?
- [ ] Loading states görünüyor mu?
- [ ] Error handling çalışıyor mu?

## 🔒 Güvenlik Kontrolleri

- [ ] RLS (Row Level Security) aktif mi?
- [ ] Environment variables güvenli mi? (public key'ler OK, secret key'ler gizli)
- [ ] Rate limiting çalışıyor mu?
- [ ] XSS koruması var mı? (React otomatik sağlar)

## 📊 Monitoring ve Analytics

### Önerilen Eklemeler:
- [ ] Google Analytics ekle (opsiyonel)
- [ ] Error tracking (Sentry gibi - opsiyonel)
- [ ] Performance monitoring

## 🚀 Go-Live Checklist

### Son Kontroller:
- [ ] Domain ayarlandı mı? (Vercel'de custom domain)
- [ ] SSL sertifikası aktif mi? (Vercel otomatik sağlar)
- [ ] Favicon ve meta tags ayarlandı mı?
- [ ] SEO meta tags eklendi mi?
- [ ] 404 sayfası var mı?
- [ ] Error sayfası var mı?

## 📝 Sonraki Adımlar (Opsiyonel)

### Gelecek Özellikler:
- [ ] Email bildirimleri sistemi
- [ ] Referans sistemi ve promosyon kodları
- [ ] Fiyatlandırma planları
- [ ] Ödeme entegrasyonu (Stripe)
- [ ] Admin paneli
- [ ] Multi-language support

## 🆘 Sorun Giderme

### Yaygın Sorunlar:

1. **Database bağlantı hatası**
   - Environment variables kontrol et
   - Supabase projesi aktif mi kontrol et

2. **RLS hatası**
   - RLS politikaları doğru mu kontrol et
   - Kullanıcı authenticated mi kontrol et

3. **Build hatası**
   - TypeScript hataları var mı kontrol et
   - `npm run build` çalıştır

4. **QR kod çalışmıyor**
   - QR kod URL'si doğru mu kontrol et
   - Domain doğru mu kontrol et

## ✅ HAZIR!

Tüm checklist'i tamamladıktan sonra sistem production'a hazır! 🎉
