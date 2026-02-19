-- ============================================
-- ReviewGuard - Settings Migration
-- ============================================
-- Bu migration dosyasını Supabase SQL Editor'a yapıştırarak
-- ayarlar özelliklerini ekleyin.
-- ============================================

-- Profiles tablosuna ayar alanları ekle
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS auto_redirect_to_google BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS show_google_prompt BOOLEAN DEFAULT true;

-- Yorum açıklamaları
COMMENT ON COLUMN public.profiles.auto_redirect_to_google IS 'Yüksek puanlı yorumlarda otomatik Google Maps yönlendirmesi (true: otomatik yönlendir, false: sadece prompt göster)';
COMMENT ON COLUMN public.profiles.show_google_prompt IS 'Yorum sonrası Google yorum yapmak ister misiniz sayfası göster (true: göster, false: gösterme)';

-- ============================================
-- MIGRATION TAMAMLANDI
-- ============================================
