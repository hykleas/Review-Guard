/**
 * ReviewGuard Content Script
 * Google Maps sayfasında otomatik yorum doldurma
 */

(function() {
  'use strict';

  console.log('ReviewGuard: Content script yüklendi');

  // localStorage'dan yorum bilgilerini al
  function getPendingReview() {
    try {
      const reviewData = localStorage.getItem('pending_review');
      if (reviewData) {
        const review = JSON.parse(reviewData);
        // 10 dakikadan eski yorumları temizle
        if (Date.now() - review.timestamp < 10 * 60 * 1000) {
          return review;
        } else {
          localStorage.removeItem('pending_review');
        }
      }
    } catch (e) {
      console.error('ReviewGuard: Review data error:', e);
    }
    return null;
  }

  // Google Maps yorum formunu bul ve doldur
  function autoFillGoogleMapsReview(review) {
    if (!review || !review.text) {
      console.log('ReviewGuard: Yorum bulunamadı');
      return false;
    }

    console.log('ReviewGuard: Yorum bulundu, dolduruluyor...', review);

    // Yorum textarea'sını bul
    const textareaSelectors = [
      'textarea[aria-label*="review"]',
      'textarea[aria-label*="yorum"]',
      'textarea[aria-label*="Write a review"]',
      'textarea[placeholder*="review"]',
      'textarea[placeholder*="yorum"]',
      'textarea[name*="review"]',
      'textarea[id*="review"]',
      'textarea[class*="review"]',
      // Son çare: tüm textarea'lar
      'textarea'
    ];

    let textarea = null;
    for (const selector of textareaSelectors) {
      const elements = document.querySelectorAll(selector);
      for (const el of elements) {
        const rect = el.getBoundingClientRect();
        const style = window.getComputedStyle(el);
        // Görünür ve yeterince büyük textarea bul
        if (
          rect.height > 50 &&
          rect.width > 200 &&
          style.display !== 'none' &&
          style.visibility !== 'hidden' &&
          style.opacity !== '0'
        ) {
          textarea = el;
          break;
        }
      }
      if (textarea) break;
    }

    if (!textarea) {
      console.log('ReviewGuard: Textarea bulunamadı');
      // Sayfa yüklenene kadar bekle
      setTimeout(() => autoFillGoogleMapsReview(review), 1000);
      return false;
    }

    console.log('ReviewGuard: Textarea bulundu, dolduruluyor...');

    // Textarea'yı görünür hale getir
    textarea.scrollIntoView({ behavior: 'smooth', block: 'center' });

    setTimeout(() => {
      // Textarea'ya odaklan
      textarea.focus();
      textarea.click();

      // Yorumu yaz
      textarea.value = review.text;

      // Tüm input event'lerini tetikle (React/Vue/Angular için)
      const events = ['input', 'change', 'keyup', 'keydown', 'keypress', 'paste'];
      events.forEach(eventType => {
        const event = new Event(eventType, { bubbles: true, cancelable: true });
        textarea.dispatchEvent(event);
      });

      // React için özel event
      const nativeInputValueSetter = Object.getOwnPropertyDescriptor(
        window.HTMLTextAreaElement.prototype,
        'value'
      )?.set;
      if (nativeInputValueSetter) {
        nativeInputValueSetter.call(textarea, review.text);
        const reactEvent = new Event('input', { bubbles: true });
        textarea.dispatchEvent(reactEvent);
      }

      console.log('ReviewGuard: ✓ Yorum metni dolduruldu');

      // Yıldız puanını seç
      if (review.rating) {
        setTimeout(() => {
          selectRating(review.rating);
        }, 500);
      }

      // Gönder butonunu vurgula
      setTimeout(() => {
        highlightSubmitButton();
      }, 1000);
    }, 500);

    return true;
  }

  // Yıldız puanını seç
  function selectRating(rating) {
    console.log('ReviewGuard: Yıldız seçiliyor:', rating);

    const ratingSelectors = [
      // Yeni format
      `button[aria-label*="${rating} star"]`,
      `button[aria-label*="${rating} yıldız"]`,
      `div[role="button"][aria-label*="${rating} star"]`,
      `span[role="button"][aria-label*="${rating} star"]`,
      // Eski format
      `[data-value="${rating}"]`,
      `[data-rating="${rating}"]`,
      // Genel
      `[aria-label*="${rating}"]`
    ];

    for (const selector of ratingSelectors) {
      const elements = document.querySelectorAll(selector);
      for (const el of elements) {
        const ariaLabel = (el.getAttribute('aria-label') || '').toLowerCase();
        const text = (el.textContent || '').toLowerCase();
        
        if (
          ariaLabel.includes(rating.toString()) ||
          ariaLabel.includes(`${rating} star`) ||
          ariaLabel.includes(`${rating} yıldız`) ||
          text.includes(rating.toString())
        ) {
          el.scrollIntoView({ behavior: 'smooth', block: 'center' });
          setTimeout(() => {
            el.click();
            console.log('ReviewGuard: ✓ Yıldız seçildi:', rating);
          }, 200);
          return true;
        }
      }
    }

    // Alternatif: Tüm yıldız butonlarını bul ve rating'e göre tıkla
    const allRatingButtons = document.querySelectorAll(
      'button[aria-label*="star"], div[role="button"][aria-label*="star"], span[role="button"][aria-label*="star"]'
    );
    
    if (allRatingButtons.length >= rating) {
      const targetButton = allRatingButtons[rating - 1];
      if (targetButton) {
        targetButton.scrollIntoView({ behavior: 'smooth', block: 'center' });
        setTimeout(() => {
          targetButton.click();
          console.log('ReviewGuard: ✓ Yıldız seçildi (alternatif yöntem):', rating);
        }, 200);
        return true;
      }
    }

    console.log('ReviewGuard: Yıldız bulunamadı');
    return false;
  }

  // Gönder butonunu vurgula
  function highlightSubmitButton() {
    const submitSelectors = [
      'button[type="submit"]',
      'button[aria-label*="gönder"]',
      'button[aria-label*="submit"]',
      'button[aria-label*="paylaş"]',
      'button[aria-label*="share"]',
      'button[aria-label*="post"]'
    ];

    for (const selector of submitSelectors) {
      const buttons = document.querySelectorAll(selector);
      for (const btn of buttons) {
        const text = (btn.textContent || '').toLowerCase();
        const ariaLabel = (btn.getAttribute('aria-label') || '').toLowerCase();
        
        if (
          text.includes('gönder') ||
          text.includes('submit') ||
          text.includes('paylaş') ||
          text.includes('share') ||
          text.includes('post') ||
          ariaLabel.includes('gönder') ||
          ariaLabel.includes('submit') ||
          ariaLabel.includes('paylaş') ||
          ariaLabel.includes('share')
        ) {
          btn.style.border = '3px solid #4285f4';
          btn.style.boxShadow = '0 0 15px rgba(66, 133, 244, 0.6)';
          btn.style.transition = 'all 0.3s ease';
          console.log('ReviewGuard: ✓ Gönder butonu vurgulandı');
          return true;
        }
      }
    }

    return false;
  }

  // Ana fonksiyon
  function init() {
    // Google Maps sayfası mı kontrol et
    const isGoogleMaps = 
      window.location.hostname.includes('google.com') ||
      window.location.hostname.includes('maps.google') ||
      window.location.hostname.includes('g.page');

    if (!isGoogleMaps) {
      return;
    }

    console.log('ReviewGuard: Google Maps sayfası tespit edildi');

    // Yorum bilgilerini al
    const review = getPendingReview();
    if (!review) {
      console.log('ReviewGuard: Bekleyen yorum yok');
      return;
    }

    // Sayfa yüklendiğinde formu doldur
    function tryFillForm() {
      if (autoFillGoogleMapsReview(review)) {
        // Başarılı olduysa localStorage'ı temizle
        setTimeout(() => {
          localStorage.removeItem('pending_review');
          console.log('ReviewGuard: Yorum dolduruldu, localStorage temizlendi');
        }, 5000);
      }
    }

    // Sayfa durumuna göre çalıştır
    if (document.readyState === 'complete' || document.readyState === 'interactive') {
      setTimeout(tryFillForm, 1000);
    } else {
      window.addEventListener('load', () => {
        setTimeout(tryFillForm, 1000);
      });
    }

    // DOM değişikliklerini izle (SPA için)
    const observer = new MutationObserver(() => {
      const review = getPendingReview();
      if (review && !document.querySelector(`textarea[value="${review.text}"]`)) {
        setTimeout(() => autoFillGoogleMapsReview(review), 500);
      }
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true
    });

    // Her 2 saniyede bir kontrol et (form geç yüklenirse)
    let attempts = 0;
    const maxAttempts = 10;
    const checkInterval = setInterval(() => {
      attempts++;
      const review = getPendingReview();
      if (review && attempts < maxAttempts) {
        autoFillGoogleMapsReview(review);
      } else {
        clearInterval(checkInterval);
      }
    }, 2000);
  }

  // Script'i çalıştır
  init();
})();
