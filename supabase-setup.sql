-- ============================================
-- ReviewGuard - Supabase Database Setup
-- ============================================
-- Bu SQL dosyasını Supabase SQL Editor'a yapıştırarak
-- tüm tabloları ve güvenlik politikalarını oluşturun.
-- ============================================

-- ============================================
-- 1. PROFILES TABLOSU (Kullanıcı Profilleri)
-- ============================================
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
    business_name TEXT NOT NULL,
    email TEXT NOT NULL,
    google_maps_link TEXT,
    qr_code_id TEXT UNIQUE DEFAULT encode(gen_random_bytes(8), 'hex'),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Profile tablosu için yorum açıklaması
COMMENT ON TABLE public.profiles IS 'İşletme sahiplerinin profil bilgileri';
COMMENT ON COLUMN public.profiles.google_maps_link IS 'İşletmenin Google Maps yorum linki';
COMMENT ON COLUMN public.profiles.qr_code_id IS 'QR kod için benzersiz kimlik';

-- ============================================
-- 2. REVIEWS TABLOSU (Yorumlar/Değerlendirmeler)
-- ============================================
CREATE TABLE IF NOT EXISTS public.reviews (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    profile_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
    comment TEXT,
    customer_name TEXT DEFAULT 'Anonim',
    customer_email TEXT,
    is_internal BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Reviews tablosu için yorum açıklaması
COMMENT ON TABLE public.reviews IS 'Müşteri yorumları ve değerlendirmeleri';
COMMENT ON COLUMN public.reviews.is_internal IS 'true: Sadece iç veritabanında, false: Googlea da gönderildi';
COMMENT ON COLUMN public.reviews.rating IS '1-5 arası yıldız derecesi';

-- ============================================
-- 3. INDEXLER (Performans Optimizasyonu)
-- ============================================
CREATE INDEX IF NOT EXISTS idx_reviews_profile_id ON public.reviews(profile_id);
CREATE INDEX IF NOT EXISTS idx_reviews_rating ON public.reviews(rating);
CREATE INDEX IF NOT EXISTS idx_reviews_created_at ON public.reviews(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_profiles_qr_code_id ON public.profiles(qr_code_id);

-- ============================================
-- 4. ROW LEVEL SECURITY (RLS) AKTİF ET
-- ============================================
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;

-- ============================================
-- 5. PROFILES TABLOSU RLS POLİTİKALARI
-- ============================================

-- 5.1: Kullanıcı kendi profilini görebilir
CREATE POLICY "Kullanıcı kendi profilini görebilir"
    ON public.profiles
    FOR SELECT
    USING (auth.uid() = id);

-- 5.2: Kullanıcı kendi profilini güncelleyebilir
CREATE POLICY "Kullanıcı kendi profilini güncelleyebilir"
    ON public.profiles
    FOR UPDATE
    USING (auth.uid() = id);

-- 5.3: Yeni kullanıcı profil oluşturabilir (signup sırasında)
CREATE POLICY "Yeni kullanıcı profil oluşturabilir"
    ON public.profiles
    FOR INSERT
    WITH CHECK (auth.uid() = id);

-- 5.4: QR kod ile herkes profil bilgilerini görebilir (review sayfası için)
CREATE POLICY "QR kod ile profil görüntülenebilir"
    ON public.profiles
    FOR SELECT
    USING (true);

-- ============================================
-- 6. REVIEWS TABLOSU RLS POLİTİKALARI
-- ============================================

-- 6.1: İşletme sahibi kendi yorumlarını görebilir
CREATE POLICY "İşletme sahibi yorumlarını görebilir"
    ON public.reviews
    FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE profiles.id = reviews.profile_id
            AND profiles.id = auth.uid()
        )
    );

-- 6.2: Herkes yorum bırakabilir (anonim müşteriler)
CREATE POLICY "Herkes yorum bırakabilir"
    ON public.reviews
    FOR INSERT
    WITH CHECK (true);

-- 6.3: İşletme sahibi yorumları silebilir
CREATE POLICY "İşletme sahibi yorumları silebilir"
    ON public.reviews
    FOR DELETE
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE profiles.id = reviews.profile_id
            AND profiles.id = auth.uid()
        )
    );

-- ============================================
-- 7. TRIGGER FONKSİYONLARI
-- ============================================

-- 7.1: updated_at otomatik güncelleme fonksiyonu
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 7.2: Profiles için updated_at trigger
DROP TRIGGER IF EXISTS update_profiles_updated_at ON public.profiles;
CREATE TRIGGER update_profiles_updated_at
    BEFORE UPDATE ON public.profiles
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

-- 7.3: Reviews için updated_at trigger
DROP TRIGGER IF EXISTS update_reviews_updated_at ON public.reviews;
CREATE TRIGGER update_reviews_updated_at
    BEFORE UPDATE ON public.reviews
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

-- ============================================
-- 8. YENI KULLANICI OLUŞTURMA TRIGGER'I
-- ============================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (id, business_name, email, qr_code_id)
    VALUES (
        NEW.id,
        COALESCE(NEW.raw_user_meta_data->>'business_name', 'İşletmem'),
        NEW.email,
        encode(gen_random_bytes(8), 'hex')
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Auth users trigger
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_new_user();

-- ============================================
-- 9. ÖRNEK VERİLER (Opsiyonel - Test için)
-- ============================================
-- NOT: Gerçek production ortamında bu bölümü çalıştırmayın

-- Örnek verileri eklemek için:
-- INSERT INTO public.profiles (id, business_name, email, google_maps_link)
-- VALUES (
--     'your-user-uuid-here',
--     'Örnek İşletme',
--     'ornek@email.com',
--     'https://g.page/r/...'
-- );

-- ============================================
-- KURULUM TAMAMLANDI
-- ============================================
-- Artık Supabase üzerinden:
-- 1. Authentication ile kullanıcı yönetimi
-- 2. Profiles tablosu ile işletme bilgileri
-- 3. Reviews tablosu ile yorum yönetimi
-- yapabilirsiniz.
-- ============================================