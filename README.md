# ReviewGuard - Google Maps İtibar Yönetimi SaaS

ReviewGuard, işletmelerin Google Maps itibarını akıllıca yönetmelerini sağlayan modern bir SaaS uygulamasıdır.

## 🚀 Özellikler

- **QR Kod Sistemi**: Her işletmeye özel QR kodlar
- **Akıllı Yönlendirme**: 
  - 1-3 Yıldız → İç veritabanına kaydet
  - 4-5 Yıldız → Google Maps'e yönlendir
- **Dashboard**: Detaylı istatistikler ve yorum yönetimi
- **Mobil Uyumlu**: Tüm cihazlarda kusursuz deneyim
- **Güvenli**: Supabase Auth + RLS politikaları

## 🛠️ Teknoloji Stack

- **Framework**: Next.js 14+ (App Router)
- **Styling**: Tailwind CSS
- **Database**: Supabase (PostgreSQL)
- **Auth**: Supabase Auth
- **QR Kod**: qrcode.react
- **İkonlar**: Lucide React
- **Dil**: TypeScript

## 📦 Kurulum

### 1. Projeyi Klonlayın

```bash
git clone <repo-url>
cd reviewguard
```

### 2. Bağımlılıkları Yükleyin

```bash
npm install
```

### 3. Supabase Projesi Oluşturun

1. [Supabase](https://supabase.com) adresine gidin
2. Yeni bir proje oluşturun
3. Proje ayarlarından şu bilgileri alın:
   - Project URL
   - Anon Public API Key

### 4. Veritabanını Kurun

1. Supabase Dashboard → SQL Editor'a gidin
2. `supabase-setup.sql` dosyasının içeriğini kopyalayıp yapıştırın
3. Çalıştırın

### 5. Environment Variables

`.env.local` dosyası oluşturun:

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=your-supabase-project-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key

# Opsiyonel - Admin işlemleri için
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

**Bilgileri nereden bulursunuz:**
- Supabase Dashboard → Project Settings → API
- `Project URL` → NEXT_PUBLIC_SUPABASE_URL
- `anon public` → NEXT_PUBLIC_SUPABASE_ANON_KEY
- `service_role secret` → SUPABASE_SERVICE_ROLE_KEY (Settings → API → service_role)

### 6. Google Auth Ayarları (Opsiyonel)

Google ile giriş yapmak isterseniz:

1. Supabase Dashboard → Authentication → Providers
2. Google'ı etkinleştirin
3. Google Cloud Console'dan Client ID ve Secret alın

### 7. Geliştirme Sunucusunu Başlatın

```bash
npm run dev
```

Uygulama `http://localhost:3000` adresinde çalışacaktır.

## 📁 Proje Yapısı

```
reviewguard/
├── app/                      # Next.js App Router
│   ├── page.tsx             # Landing Page
│   ├── layout.tsx           # Root Layout
│   ├── globals.css          # Global Styles
│   ├── login/               # Login/Register Page
│   │   └── page.tsx
│   ├── dashboard/           # Dashboard Page
│   │   └── page.tsx
│   └── r/                   # Review Page (QR Kod hedefi)
│       └── [id]/
│           └── page.tsx
├── components/              # React Components
│   └── ui/                  # UI Components
│       ├── Button.tsx
│       ├── Card.tsx
│       ├── Input.tsx
│       └── StarRating.tsx
├── lib/                     # Utilities
│   ├── utils.ts             # Helper functions
│   └── supabase.ts          # Supabase clients
├── types/                   # TypeScript Types
│   └── supabase.ts          # Database types
├── supabase-setup.sql       # Database setup
├── package.json
├── tailwind.config.ts
├── tsconfig.json
└── README.md
```

## 🌐 Deployment (Vercel)

### Hızlı Deployment

Detaylı deployment rehberi için `DEPLOYMENT.md` dosyasına bakın.

### 1. Veritabanı Kurulumu (İLK KEZ)

**ÖNEMLİ:** İlk deployment'tan önce mutlaka yapılmalı!

1. Supabase Dashboard → SQL Editor
2. `supabase-setup.sql` dosyasını çalıştır
3. `supabase-migration-settings.sql` dosyasını çalıştır

### 2. Vercel'e Deploy Edin

```bash
npm i -g vercel
vercel
```

### 3. Environment Variables Ekleme

Vercel Dashboard → Project Settings → Environment Variables:

```
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

### 4. Supabase Auth Ayarları

Supabase Dashboard → Authentication → URL Configuration:

- **Site URL**: `https://your-app.vercel.app`
- **Redirect URLs**: `https://your-app.vercel.app/**`

### 5. Production Checklist

`PRODUCTION-CHECKLIST.md` dosyasındaki tüm maddeleri kontrol edin!

## 🔐 Güvenlik

### Row Level Security (RLS)

Tüm tablolar RLS ile korunmaktadır:

- **profiles**: Kullanıcılar sadece kendi profillerini görebilir/güncelleyebilir
- **reviews**: Herkes yorum bırakabilir, ancak sadece işletme sahibi kendi yorumlarını görebilir

### Auth Trigger

Yeni kullanıcı kaydı olduğunda otomatik olarak:
- Profil oluşturulur
- Benzersiz QR kod ID atanır

## 📱 Kullanım Akışı

### İşletme Sahibi İçin:

1. Kaydol → Giriş yap
2. Dashboard'da Google Maps linkini ekle
3. QR kodu indir ve yazdır
4. Müşteri yorumlarını takip et

### Müşteri İçin:

1. QR kodu tarar
2. Yıldız seçer (1-5)
3. **1-3 Yıldız**: Form doldurur, işletmeye gönderilir
4. **4-5 Yıldız**: Yorum yazar, Google'a yönlendirilir

## 🎨 Özelleştirme

### Renkler

`tailwind.config.ts` dosyasında renkleri değiştirebilirsiniz:

```typescript
colors: {
  primary: {
    // Kendi marka renkleriniz
  }
}
```

### Metinler

Tüm metinler Türkçe'dir. Başka dillere çevirmek için ilgili dosyalardaki metinleri değiştirin.

## 🐛 Hata Ayıklama

### Yaygın Hatalar

**1. "Invalid login credentials"**
- E-posta veya şifre hatalı
- Supabase Auth ayarlarını kontrol edin

**2. "Error loading profile"**
- RLS politikalarını kontrol edin
- SQL setup dosyasını tekrar çalıştırın

**3. QR kod çalışmıyor**
- NEXT_PUBLIC_SUPABASE_URL doğru mu?
- qr_code_id veritabanında var mı?

### Logları İnceleme

```bash
# Geliştirme modunda	npm run dev

# Console'da Supabase loglarını görün
```

## 📄 Lisans

MIT License

## 🤝 Destek

Sorularınız veya önerileriniz için:
- GitHub Issues
- Email: support@reviewguard.com

---

**ReviewGuard** - İşletmenizin itibarını koruyun, geliştirin! ⭐