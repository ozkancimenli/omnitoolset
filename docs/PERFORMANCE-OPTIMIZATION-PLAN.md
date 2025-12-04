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

### 9. **Content Security Policy (CSP)** 🔒 (Yüksek Öncelik - Güvenlik)

**Sorun**: XSS saldırılarına karşı koruma eksik

**Çözüm**: ✅ **TAMAMLANDI**
- CSP header'ı `vercel.json`'a eklendi
- Tüm external kaynaklar allowlist'e eklendi
- XSS saldırılarına karşı koruma aktif

**CSP Policy**:
```
default-src 'self';
script-src 'self' 'unsafe-inline' 'unsafe-eval' 
  https://www.googletagmanager.com 
  https://www.google-analytics.com 
  https://pagead2.googlesyndication.com 
  https://pl28055668.effectivegatecpm.com 
  https://pl28055637.effectivegatecpm.com 
  https://pl28059282.effectivegatecpm.com 
  https://cdn.jsdelivr.net 
  https://cdnjs.cloudflare.com;
style-src 'self' 'unsafe-inline' https://fonts.googleapis.com;
font-src 'self' https://fonts.gstatic.com data:;
img-src 'self' data: https: blob:;
connect-src 'self' 
  https://www.google-analytics.com 
  https://www.googletagmanager.com 
  https://pagead2.googlesyndication.com 
  https://pl28055668.effectivegatecpm.com 
  https://pl28055637.effectivegatecpm.com 
  https://pl28059282.effectivegatecpm.com 
  https://www.effectivegatecpm.com;
frame-src 'self' 
  https://pagead2.googlesyndication.com 
  https://www.effectivegatecpm.com;
object-src 'none';
base-uri 'self';
form-action 'self';
frame-ancestors 'none';
upgrade-insecure-requests;
```

**Not**: `'unsafe-inline'` ve `'unsafe-eval'` mevcut inline script'ler için gerekli. Gelecekte nonce kullanarak daha güvenli hale getirilebilir.

**Beklenen İyileştirme**: 
- XSS koruması: %100
- Güvenlik skoru: +20-30 puan
- PageSpeed güvenlik uyarısı: Çözüldü

---

### 10. **Reduce JavaScript Execution Time** ⚡ (Yüksek Öncelik)

**Sorun**: JavaScript çok uzun süre çalışıyor, main thread'i blokluyor

**Çözüm**:
- Code splitting (route-based, component-based)
- Tree shaking (kullanılmayan kod'u kaldır)
- Web Workers kullan (ağır işlemler için)
- Debounce/throttle event handlers
- RequestIdleCallback kullan

**Kod Örneği**:
```javascript
// Web Worker kullan (PDF işlemleri için)
const worker = new Worker('/js/pdf-worker.js');
worker.postMessage({ file: fileData });
worker.onmessage = (e) => { /* handle result */ };

// RequestIdleCallback
if ('requestIdleCallback' in window) {
    requestIdleCallback(() => {
        // Non-critical code
    });
}
```

**Beklenen İyileştirme**: TTI -25%, TBT -30%

---

### 11. **Reduce Unused JavaScript** 🧹 (Yüksek Öncelik)

**Sorun**: Kullanılmayan JavaScript yükleniyor

**Çözüm**:
- Dynamic imports kullan
- Lazy load tool-specific scripts
- Remove unused libraries
- Bundle analysis (webpack-bundle-analyzer)

**Kod Örneği**:
```javascript
// Dynamic import
const loadTool = async (toolName) => {
    const module = await import(`/tools/${toolName}.js`);
    return module;
};

// Lazy load tool scripts
if (document.getElementById('pdf-merge-tool')) {
    import('/js/pdf-merge.js');
}
```

**Beklenen İyileştirme**: JavaScript size -40%, Load time -20%

---

### 12. **Properly Size Images** 🖼️ (Yüksek Öncelik)

**Sorun**: Görseller optimize edilmemiş boyutta

**Çözüm**:
- Responsive images (srcset, sizes)
- Image dimensions belirt (width, height)
- WebP/AVIF format kullan
- Image compression (TinyPNG, Squoosh)

**Kod Örneği**:
```html
<img src="image.jpg" 
     srcset="image-400w.jpg 400w, image-800w.jpg 800w, image-1200w.jpg 1200w"
     sizes="(max-width: 600px) 400px, (max-width: 1200px) 800px, 1200px"
     width="1200" 
     height="630"
     alt="Description"
     loading="lazy">
```

**Beklenen İyileştirme**: Image size -60%, LCP -20%

---

### 13. **Defer Offscreen Images** 🖼️ (Orta Öncelik)

**Sorun**: Ekran dışı görseller hemen yükleniyor

**Çözüm**: ✅ **Kısmen uygulanmış** (`loading="lazy"`)

**İyileştirme**:
- Tüm görsellere `loading="lazy"` ekle
- Intersection Observer kullan
- Placeholder images kullan

**Beklenen İyileştirme**: Initial load -30%, Bandwidth -40%

---

### 14. **Minimize Main-Thread Work** ⚡ (Yüksek Öncelik)

**Sorun**: Main thread çok meşgul

**Çözüm**:
- Long tasks'i böl (chunking)
- Web Workers kullan
- CSS animations (GPU accelerated)
- Will-change property kullan

**Kod Örneği**:
```css
/* GPU accelerated animations */
.animated {
    will-change: transform;
    transform: translateZ(0);
}

/* CSS animations instead of JS */
@keyframes fadeIn {
    from { opacity: 0; }
    to { opacity: 1; }
}
```

**Beklenen İyileştirme**: TBT -35%, FID -20%

---

### 15. **Use Efficient Cache Policies** 💾 (Orta Öncelik)

**Sorun**: Cache headers optimize edilmemiş

**Çözüm**: ✅ **Kısmen uygulanmış** (`vercel.json`'da var)

**İyileştirme**:
- Static assets: `max-age=31536000, immutable`
- HTML: `max-age=3600, must-revalidate`
- API responses: `max-age=300` (5 dakika)

**Beklenen İyileştirme**: Repeat visits: +80% hız

---

### 16. **Serve Images in Next-Gen Formats** 🖼️ (Orta Öncelik)

**Sorun**: Eski format görseller (JPEG, PNG)

**Çözüm**:
- WebP format (Chrome, Firefox, Edge)
- AVIF format (modern browsers)
- Fallback için JPEG/PNG

**Kod Örneği**:
```html
<picture>
  <source srcset="image.avif" type="image/avif">
  <source srcset="image.webp" type="image/webp">
  <img src="image.jpg" alt="Description">
</picture>
```

**Beklenen İyileştirme**: Image size -30-50%

---

### 17. **Enable Text Compression** 📦 (Yüksek Öncelik)

**Sorun**: Text dosyaları sıkıştırılmamış

**Çözüm**: ✅ **Vercel otomatik yapıyor** (Gzip/Brotli)

**Kontrol**:
- Gzip compression aktif mi?
- Brotli compression aktif mi?
- Compression level optimize mi?

**Beklenen İyileştirme**: File size -70% (text files)

---

### 18. **Preload Key Requests** 🔗 (Orta Öncelik)

**Sorun**: Kritik kaynaklar geç yükleniyor

**Çözüm**: ✅ **Kısmen uygulanmış**

**İyileştirme**:
```html
<!-- Critical CSS -->
<link rel="preload" href="/styles.css" as="style">

<!-- Critical JS -->
<link rel="preload" href="/app.js" as="script">

<!-- Critical fonts -->
<link rel="preload" href="/fonts/inter.woff2" as="font" type="font/woff2" crossorigin>

<!-- Critical images -->
<link rel="preload" href="/hero-image.webp" as="image">
```

**Beklenen İyileştirme**: FCP -15%, LCP -10%

---

### 19. **Preconnect to Required Origins** 🔗 (Orta Öncelik)

**Sorun**: Third-party bağlantılar geç kuruluyor

**Çözüm**: ✅ **Kısmen uygulanmış**

**İyileştirme**:
```html
<!-- Google Fonts -->
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>

<!-- Google Analytics -->
<link rel="preconnect" href="https://www.googletagmanager.com">
<link rel="dns-prefetch" href="https://www.google-analytics.com">

<!-- AdSense -->
<link rel="preconnect" href="https://pagead2.googlesyndication.com">
```

**Beklenen İyileştirme**: Connection time -200ms

---

### 20. **Reduce DOM Size** 🏗️ (Düşük Öncelik)

**Sorun**: DOM çok büyük (1500+ elements)

**Çözüm**:
- Unnecessary elements kaldır
- Virtual scrolling (büyük listeler için)
- Lazy render (viewport dışı content)

**Beklenen İyileştirme**: Parse time -20%

---

### 21. **Minimize Third-Party Usage** 📦 (Orta Öncelik)

**Sorun**: Çok fazla third-party script

**Mevcut Third-Party Scripts**:
- Google Analytics
- Google AdSense
- Adsterra (3 scripts)
- Google Fonts

**Çözüm**:
- Lazy load tüm third-party scripts
- Self-host fonts (opsiyonel)
- Use privacy-friendly analytics (opsiyonel)

**Beklenen İyileştirme**: TTI -30%, TBT -25%

---

### 22. **Avoid Document.write()** 📝 (Düşük Öncelik)

**Sorun**: `document.write()` kullanımı (eski kod)

**Çözüm**:
- `document.write()` kullanımını bul
- Modern DOM manipulation'a çevir
- Async script loading kullan

**Beklenen İyileştirme**: Parse blocking -100%

---

### 23. **Avoid Large Layout Shifts** 📐 (Yüksek Öncelik)

**Sorun**: CLS (Cumulative Layout Shift) yüksek

**Çözüm**:
- Image dimensions belirt (width, height)
- Ad placeholders (reserved space)
- Font display: swap
- Skeleton loaders

**Kod Örneği**:
```html
<!-- Image with dimensions -->
<img src="image.jpg" width="1200" height="630" alt="Description">

<!-- Ad placeholder -->
<div class="ad-placeholder" style="min-height: 250px;">
  <!-- Ad will load here -->
</div>
```

**Beklenen İyileştirme**: CLS < 0.1

---

### 24. **Use Passive Event Listeners** 👆 (Düşük Öncelik)

**Sorun**: Scroll/touch event'leri main thread'i blokluyor

**Çözüm**:
```javascript
// Passive event listener
window.addEventListener('scroll', handleScroll, { passive: true });
window.addEventListener('touchstart', handleTouch, { passive: true });
```

**Beklenen İyileştirme**: Scroll performance +30%

---

### 25. **Avoid Chaining Critical Requests** 🔗 (Orta Öncelik)

**Sorun**: Kritik kaynaklar sıralı yükleniyor

**Çözüm**:
- Parallel loading
- Preload kritik kaynaklar
- HTTP/2 multiplexing kullan

**Beklenen İyileştirme**: Load time -15%

---

### 26. **Use HTTP/2** 🌐 (Orta Öncelik)

**Sorun**: HTTP/1.1 kullanılıyor olabilir

**Çözüm**: ✅ **Vercel otomatik HTTP/2 kullanıyor**

**Kontrol**: HTTP/2 aktif mi? (DevTools Network tab)

---

### 27. **Keep Request Counts Low** 📊 (Düşük Öncelik)

**Sorun**: Çok fazla HTTP request

**Çözüm**:
- CSS/JS bundle'la
- Image sprites (eski yöntem, artık gerekli değil)
- Icon fonts yerine SVG sprites
- HTTP/2 ile paralel yükleme

**Beklenen İyileştirme**: Request count -20%

---

### 28. **Keep Transfer Sizes Small** 📦 (Orta Öncelik)

**Sorun**: Dosya boyutları büyük

**Çözüm**:
- Minification (CSS, JS, HTML)
- Compression (Gzip/Brotli)
- Tree shaking
- Code splitting

**Beklenen İyileştirme**: Transfer size -40%

---

### 29. **Use Video Formats for Animated Content** 🎬 (Düşük Öncelik)

**Sorun**: GIF'ler çok büyük

**Çözüm**:
- GIF yerine MP4/WebM video
- Autoplay, loop, muted
- Poster image

**Kod Örneği**:
```html
<video autoplay loop muted playsinline poster="poster.jpg">
  <source src="animation.webm" type="video/webm">
  <source src="animation.mp4" type="video/mp4">
</video>
```

**Beklenen İyileştirme**: File size -80% (animations için)

---

### 30. **Prefer Composited Animations** 🎨 (Düşük Öncelik)

**Sorun**: Animations main thread'i kullanıyor

**Çözüm**:
- CSS transforms/opacity kullan
- GPU accelerated properties
- Will-change property

**Kod Örneği**:
```css
.animated {
    will-change: transform, opacity;
    transform: translateZ(0); /* GPU acceleration */
}
```

**Beklenen İyileştirme**: Animation performance +50%

---

### 31. **Reduce Initial Server Response Time** ⚡ (Yüksek Öncelik)

**Sorun**: Server response yavaş

**Çözüm**: ✅ **Static site, CDN'den servis ediliyor**

**İyileştirme**:
- CDN edge locations (Vercel global)
- Static generation
- No server-side processing

**Beklenen**: TTFB < 200ms (CDN'den)

---

### 32. **Avoid Excessive DOM Size** 🏗️ (Düşük Öncelik)

**Sorun**: DOM çok büyük (1500+ elements)

**Hedef**: < 1500 elements

**Çözüm**:
- Unnecessary elements kaldır
- Virtual scrolling
- Lazy render

**Beklenen İyileştirme**: Parse time -25%

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

### Hafta 1: Critical Optimizations (Must Fix)
1. ✅ Critical CSS inline
2. ✅ JavaScript defer/async
3. ✅ Third-party scripts lazy load
4. ✅ Image optimization (proper sizing, next-gen formats)
5. ✅ Reduce JavaScript execution time
6. ✅ Reduce unused JavaScript
7. ✅ Minimize main-thread work
8. ✅ Avoid large layout shifts (CLS)

**Beklenen Sonuç**: +25-35 PageSpeed score

### Hafta 2: Advanced Optimizations (Should Fix)
9. ✅ Font optimization
10. ✅ Service worker improvements
11. ✅ Remove unused CSS
12. ✅ Minification & compression
13. ✅ Preload key requests
14. ✅ Preconnect to required origins
15. ✅ Efficient cache policies
16. ✅ Enable text compression

**Beklenen Sonuç**: +15-20 PageSpeed score

### Hafta 3: Fine-tuning (Nice to Have)
17. ✅ Code splitting
18. ✅ Reduce DOM size
19. ✅ Minimize third-party usage
20. ✅ Use passive event listeners
21. ✅ Avoid chaining critical requests
22. ✅ Keep request counts low
23. ✅ Keep transfer sizes small
24. ✅ Monitoring setup

**Beklenen Sonuç**: 90+ PageSpeed score

### Hafta 4: Optional Optimizations
25. ✅ Use video formats for animated content
26. ✅ Prefer composited animations
27. ✅ Avoid document.write()
28. ✅ Reduce initial server response time
29. ✅ Avoid excessive DOM size

**Beklenen Sonuç**: 95+ PageSpeed score

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

### Bugün Yapılacaklar (3-4 Saat) - Critical Priority:
1. Critical CSS extract ve inline (30 dk)
2. JavaScript defer/async (20 dk)
3. Third-party scripts lazy load (30 dk)
4. Image optimization - proper sizing, next-gen formats (45 dk)
5. Reduce unused JavaScript - dynamic imports (30 dk)
6. Minimize main-thread work - Web Workers (30 dk)
7. Avoid large layout shifts - image dimensions, ad placeholders (20 dk)
8. Font preload (10 dk)
9. Test ve ölçüm (15 dk)

**Beklenen İyileştirme**: +25-35 PageSpeed score

### Bu Hafta Yapılacaklar - Should Fix:
10. Preload key requests (20 dk)
11. Preconnect to required origins (15 dk)
12. Efficient cache policies kontrol (10 dk)
13. Enable text compression kontrol (10 dk)
14. Remove unused CSS (30 dk)
15. Minification (20 dk)

**Beklenen İyileştirme**: +15-20 PageSpeed score (ek)

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

