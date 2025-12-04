# ⚡ Performans Optimizasyon Planı - OmniToolset

## 🎯 Hedef: 90+ PageSpeed Score (Mobile & Desktop)

### Mevcut Durum Analizi

**PageSpeed Insights Sonuçları:**
- Chrome User Experience Report: Yeterli veri yok (yeni site)
- Lab Data: Analiz edilmeli
- Core Web Vitals: Optimize edilmeli

---

## 🚀 Hemen Uygulanabilir Optimizasyonlar (1-2 Saat)

### 1. **Critical CSS Inline** ⚡ (Yüksek Öncelik)

**Sorun**: CSS dosyası render'ı blokluyor

**Çözüm**:
```html
<!-- index.html head içinde -->
<style>
/* Critical CSS - Above the fold content için */
/* Hero section, header, navigation stilleri buraya */
</style>
<link rel="stylesheet" href="/styles.css" media="print" onload="this.media='all'">
```

**Beklenen İyileştirme**: LCP -20%, FCP -15%

---

### 2. **JavaScript Defer/Async** ⚡ (Yüksek Öncelik)

**Sorun**: Scripts render'ı blokluyor

**Çözüm**:
```html
<!-- Mevcut -->
<script async src="https://www.googletagmanager.com/gtag/js?id=G-1WF6SNHNXN"></script>

<!-- İyileştirme: AdSense lazy load -->
<script>
window.addEventListener('load', function() {
    const adScript = document.createElement('script');
    adScript.src = 'https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-8640955536193345';
    adScript.crossOrigin = 'anonymous';
    adScript.async = true;
    document.head.appendChild(adScript);
});
</script>
```

**Beklenen İyileştirme**: TTI -30%, TBT -25%

---

### 3. **Image Optimization** 🖼️ (Orta Öncelik)

**Sorun**: Görseller optimize edilmemiş

**Çözüm**:
- WebP format kullan
- Lazy loading ekle
- Responsive images (srcset)
- Image CDN kullan (Cloudinary/ImageKit)

**Kod Örneği**:
```html
<picture>
  <source srcset="image.webp" type="image/webp">
  <source srcset="image.jpg" type="image/jpeg">
  <img src="image.jpg" alt="Description" loading="lazy">
</picture>
```

**Beklenen İyileştirme**: LCP -15%, CLS -10%

---

### 4. **Font Optimization** 🔤 (Orta Öncelik)

**Sorun**: Google Fonts render'ı blokluyor

**Mevcut**: ✅ Font display: swap kullanılıyor

**İyileştirme**:
```html
<!-- Preload font files -->
<link rel="preload" href="https://fonts.gstatic.com/s/inter/v12/UcCO3FwrK3iLTeHuS_fvQtMwCp50KnMw2boKoduKmMEVuLyfAZ9hiJ-Ek-_EeA.woff2" as="font" type="font/woff2" crossorigin>

<!-- Font display swap -->
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap" rel="stylesheet">
```

**Beklenen İyileştirme**: FCP -10%, CLS -5%

---

### 5. **Third-Party Scripts Lazy Load** 📦 (Yüksek Öncelik)

**Sorun**: Adsterra, AdSense scripts render'ı blokluyor

**Çözüm**:
```javascript
// Lazy load third-party scripts
window.addEventListener('load', function() {
    setTimeout(function() {
        // Adsterra scripts
        // AdSense scripts
        // Analytics scripts (zaten async)
    }, 2000); // 2 saniye sonra yükle
});
```

**Beklenen İyileştirme**: TTI -40%, TBT -35%

---

### 6. **Service Worker & Caching** 💾 (Orta Öncelik)

**Mevcut**: ✅ Service worker dosyası var

**İyileştirme**: 
- Cache-first strategy
- Offline support
- Background sync

**Beklenen İyileştirme**: Repeat visit'lerde %80+ hız artışı

---

### 7. **Minification & Compression** 📦 (Düşük Öncelik)

**Sorun**: CSS/JS minify edilmemiş olabilir

**Çözüm**:
- CSS minify
- JS minify
- HTML minify (opsiyonel)
- Gzip/Brotli compression (hosting'de)

**Beklenen İyileştirme**: File size -30%

---

### 8. **Remove Unused CSS** 🧹 (Orta Öncelik)

**Sorun**: Kullanılmayan CSS kuralları

**Çözüm**:
- PurgeCSS kullan
- Critical CSS extract
- Unused CSS analizi (Chrome DevTools)

**Beklenen İyileştirme**: CSS file size -40%

---

## 📊 Core Web Vitals Hedefleri

### Largest Contentful Paint (LCP)
- **Hedef**: < 2.5 saniye
- **Mevcut**: Ölçülmeli
- **Optimizasyonlar**: Critical CSS, image optimization, font preload

### First Input Delay (FID)
- **Hedef**: < 100 ms
- **Mevcut**: Ölçülmeli
- **Optimizasyonlar**: JavaScript defer, code splitting

### Cumulative Layout Shift (CLS)
- **Hedef**: < 0.1
- **Mevcut**: Ölçülmeli
- **Optimizasyonlar**: Image dimensions, font display swap, ad placeholders

---

## 🎯 Uygulama Öncelik Sırası

### Hafta 1: Critical Optimizations
1. ✅ Critical CSS inline
2. ✅ JavaScript defer/async
3. ✅ Third-party scripts lazy load
4. ✅ Image optimization

**Beklenen Sonuç**: +20-30 PageSpeed score

### Hafta 2: Advanced Optimizations
5. ✅ Font optimization
6. ✅ Service worker improvements
7. ✅ Remove unused CSS
8. ✅ Minification

**Beklenen Sonuç**: +10-15 PageSpeed score

### Hafta 3: Fine-tuning
9. ✅ Code splitting
10. ✅ Resource hints (preconnect, prefetch)
11. ✅ CDN optimization
12. ✅ Monitoring setup

**Beklenen Sonuç**: 90+ PageSpeed score

---

## 📈 Monitoring & Tracking

### Tools:
1. **PageSpeed Insights** - Haftalık kontrol
2. **Google Search Console** - Core Web Vitals raporu
3. **Chrome DevTools** - Lighthouse audits
4. **WebPageTest** - Detaylı analiz

### Metrics to Track:
- PageSpeed Score (Mobile & Desktop)
- LCP, FID, CLS
- Time to Interactive (TTI)
- Total Blocking Time (TBT)
- First Contentful Paint (FCP)

---

## 🚀 Hemen Başla!

### Bugün Yapılacaklar (2 Saat):
1. Critical CSS extract ve inline (30 dk)
2. JavaScript defer/async (20 dk)
3. Third-party scripts lazy load (30 dk)
4. Image lazy loading (20 dk)
5. Font preload (10 dk)
6. Test ve ölçüm (10 dk)

**Beklenen İyileştirme**: +15-25 PageSpeed score

---

## 💡 Best Practices

1. **Measure First**: Önce mevcut durumu ölç
2. **Optimize Incrementally**: Tek seferde her şeyi değiştirme
3. **Test Thoroughly**: Her değişiklikten sonra test et
4. **Monitor Continuously**: Sürekli takip et
5. **User Experience First**: Performans UX'i bozmamalı

---

*Last Updated: December 4, 2025*
*Next Review: Weekly*

