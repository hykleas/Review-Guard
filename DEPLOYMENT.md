# 🚀 ReviewGuard - Deployment Rehberi

## Hızlı Başlangıç

### 1. Veritabanı Kurulumu (İLK KEZ)

1. **Supabase Projesi Oluştur**
   - [Supabase.com](https://supabase.com) → New Project
   - Proje adı ve şifre belirle
   - Region seç (en yakın bölge)

2. **Database Setup**
   - Supabase Dashboard → SQL Editor
   - `supabase-setup.sql` dosyasını aç ve içeriğini kopyala
   - SQL Editor'a yapıştır ve **RUN** butonuna tıkla
   - ✅ Başarılı mesajını kontrol et

3. **Settings Migration**
   - Yine SQL Editor'da
   - `supabase-migration-settings.sql` dosyasını aç ve içeriğini kopyala
   - SQL Editor'a yapıştır ve **RUN** butonuna tıkla
   - ✅ Başarılı mesajını kontrol et

### 2. Environment Variables

**Supabase'den Alınacaklar:**
- Supabase Dashboard → Project Settings → API
- **Project URL** → `NEXT_PUBLIC_SUPABASE_URL`
- **anon public key** → `NEXT_PUBLIC_SUPABASE_ANON_KEY`

### 3. Vercel Deployment

#### Yöntem 1: Vercel CLI
```bash
# Vercel CLI yükle
npm i -g vercel

# Projeyi deploy et
vercel

# Production'a deploy et
vercel --prod
```

#### Yöntem 2: Vercel Dashboard
1. [Vercel.com](https://vercel.com) → Sign Up/Login
2. **Add New Project**
3. GitHub repo'yu bağla (veya manuel upload)
4. Environment Variables ekle:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
5. **Deploy** butonuna tıkla

### 4. Supabase Auth Ayarları

Deploy sonrası:
1. Supabase Dashboard → Authentication → URL Configuration
2. **Site URL**: `https://your-app.vercel.app`
3. **Redirect URLs** ekle:
   ```
   https://your-app.vercel.app/**
   https://your-app.vercel.app/dashboard
   https://your-app.vercel.app/login
   ```

### 5. Test Et

1. ✅ Ana sayfa açılıyor mu?
2. ✅ Kayıt ol butonu çalışıyor mu?
3. ✅ Giriş yap çalışıyor mu?
4. ✅ Dashboard yükleniyor mu?
5. ✅ QR kod oluşturuluyor mu?

## 🎯 Production Checklist

- [x] Database migration çalıştırıldı
- [x] Environment variables ayarlandı
- [x] Vercel'e deploy edildi
- [x] Supabase Auth URL'leri ayarlandı
- [x] Test edildi

## 📞 Destek

Sorun yaşarsanız:
1. Browser console'u kontrol edin (F12)
2. Vercel logs kontrol edin
3. Supabase logs kontrol edin

## 🎉 Başarılı!

Artık sisteminiz canlıda ve satışa hazır! 🚀
