# 🔒 Güvenlik Politikası - OmniToolset

## 🎯 Hedef: XSS ve Diğer Güvenlik Saldırılarına Karşı Tam Koruma

---

## ✅ Uygulanan Güvenlik Önlemleri

### 1. **Content Security Policy (CSP)** 🔒

**Durum**: ✅ **AKTİF**

**Konum**: `vercel.json` - HTTP Header olarak uygulanıyor

**Policy Detayları**:

```http
Content-Security-Policy: default-src 'self'; 
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

**Koruma**:
- ✅ XSS (Cross-Site Scripting) saldırılarına karşı koruma
- ✅ Inline script injection'ları engelleme
- ✅ External resource kontrolü
- ✅ Clickjacking koruması (frame-ancestors 'none')

**Not**: `'unsafe-inline'` ve `'unsafe-eval'` mevcut inline script'ler için gerekli. Gelecekte nonce kullanarak daha güvenli hale getirilebilir.

---

### 2. **Diğer Güvenlik Header'ları** 🛡️

**Durum**: ✅ **AKTİF**

**Konum**: `vercel.json`

#### X-Content-Type-Options: nosniff
- MIME type sniffing'i engeller
- Content-type spoofing saldırılarını önler

#### X-Frame-Options: DENY
- Clickjacking saldırılarını engeller
- Site iframe içinde gösterilemez

#### X-XSS-Protection: 1; mode=block
- Eski tarayıcılarda XSS koruması
- Modern tarayıcılarda CSP yeterli

#### Referrer-Policy: strict-origin-when-cross-origin
- Referrer bilgilerini kontrol eder
- Gizlilik koruması

#### Permissions-Policy
- Geolocation, microphone, camera erişimini engeller
- Gereksiz izinleri kısıtlar

---

### 3. **Client-Side Güvenlik** 🔐

**Durum**: ✅ **AKTİF**

**Konum**: `js/security.js`

#### Input Sanitization
- User input'ları sanitize eder
- XSS injection'ları önler

#### File Type Validation
- Sadece izin verilen dosya tiplerini kabul eder
- Dosya uzantısı kontrolü

#### File Size Validation
- Maksimum dosya boyutu: 100MB
- Büyük dosya upload'larını engeller

#### Clickjacking Protection
- JavaScript ile iframe kontrolü
- Güvenilmeyen origin'lerden iframe'i engeller

---

## 🚀 Gelecek İyileştirmeler

### 1. **CSP Nonce Implementation** (Öncelik: Orta)

**Hedef**: `'unsafe-inline'` ve `'unsafe-eval'` kaldırmak

**Yaklaşım**:
```html
<!-- Her sayfada unique nonce -->
<meta http-equiv="Content-Security-Policy" 
      content="script-src 'self' 'nonce-{random-nonce}' ...">

<!-- Script'lerde nonce kullan -->
<script nonce="{random-nonce}">
  // Inline script
</script>
```

**Fayda**: Daha güvenli CSP, XSS koruması artışı

---

### 2. **Subresource Integrity (SRI)** (Öncelik: Düşük)

**Hedef**: External script'lerin integrity kontrolü

**Yaklaşım**:
```html
<script src="https://cdn.jsdelivr.net/npm/library.js" 
        integrity="sha384-..." 
        crossorigin="anonymous"></script>
```

**Fayda**: CDN'den gelen script'lerin değiştirilmediğini garanti eder

---

### 3. **HTTPS Enforcement** (Öncelik: Yüksek)

**Durum**: ✅ `upgrade-insecure-requests` CSP'de mevcut

**Ek**: HSTS (HTTP Strict Transport Security) header'ı eklenebilir

---

### 4. **Rate Limiting** (Öncelik: Orta)

**Hedef**: Client-side rate limiting (server-side için backend gerekli)

**Yaklaşım**: `js/security.js` içinde rate limiter helper mevcut

---

## 📊 Güvenlik Testleri

### 1. **CSP Test**

**Test URL**: https://csp-evaluator.withgoogle.com/

**Test Adımları**:
1. Site URL'ini gir
2. CSP header'ını analiz et
3. Uyarıları kontrol et
4. İyileştirme önerilerini uygula

---

### 2. **XSS Test**

**Test Araçları**:
- OWASP ZAP
- Burp Suite
- Browser DevTools Console

**Test Senaryoları**:
- Input field'lara script injection
- URL parameter'larına script injection
- File upload'lara script injection

---

### 3. **Security Headers Test**

**Test URL**: https://securityheaders.com/

**Test Adımları**:
1. Site URL'ini gir
2. Header'ları analiz et
3. Skor al (A+ hedef)
4. Eksik header'ları ekle

---

## 🔍 Güvenlik Monitoring

### 1. **Google Search Console**

**Kontrol Edilecekler**:
- Security Issues raporu
- Manual Actions
- Hacked Content uyarıları

**Sıklık**: Haftalık

---

### 2. **Browser Console**

**Kontrol Edilecekler**:
- CSP violation uyarıları
- Mixed content uyarıları
- Security error'ları

**Sıklık**: Her deployment sonrası

---

### 3. **External Tools**

**Araçlar**:
- https://securityheaders.com/
- https://observatory.mozilla.org/
- https://www.ssllabs.com/ssltest/

**Sıklık**: Aylık

---

## ⚠️ Güvenlik Uyarıları

### 1. **'unsafe-inline' ve 'unsafe-eval'**

**Durum**: ⚠️ Mevcut CSP'de kullanılıyor

**Neden**: Inline script'ler (Google Analytics, Adsterra suppression) için gerekli

**Risk**: Orta (inline script injection riski)

**Çözüm**: Nonce implementation (gelecek iyileştirme)

---

### 2. **External CDN Scripts**

**Durum**: ⚠️ cdn.jsdelivr.net, cdnjs.cloudflare.com kullanılıyor

**Risk**: Düşük (güvenilir CDN'ler)

**Çözüm**: SRI (Subresource Integrity) eklenebilir

---

## 📝 Güvenlik Checklist

### Her Deployment Öncesi:
- [ ] CSP header'ı test et
- [ ] Security headers kontrol et
- [ ] Browser console'da hata kontrol et
- [ ] External script'lerin çalıştığını doğrula
- [ ] File upload güvenliğini test et

### Aylık Kontroller:
- [ ] Security headers test (securityheaders.com)
- [ ] CSP evaluator test
- [ ] Google Search Console security issues
- [ ] SSL/TLS certificate kontrolü
- [ ] Dependency güvenlik güncellemeleri

---

## 🎯 Güvenlik Hedefleri

### Kısa Vadeli (1 Ay):
- ✅ CSP implementation (TAMAMLANDI)
- ✅ Security headers (TAMAMLANDI)
- ⏳ CSP nonce implementation (planlandı)

### Orta Vadeli (3 Ay):
- ⏳ SRI implementation
- ⏳ HSTS header
- ⏳ Rate limiting improvements

### Uzun Vadeli (6 Ay):
- ⏳ Security monitoring dashboard
- ⏳ Automated security testing
- ⏳ Penetration testing

---

## 📚 Kaynaklar

- [MDN: Content Security Policy](https://developer.mozilla.org/en-US/docs/Web/HTTP/CSP)
- [OWASP: XSS Prevention](https://cheatsheetseries.owasp.org/cheatsheets/Cross_Site_Scripting_Prevention_Cheat_Sheet.html)
- [Google: CSP Evaluator](https://csp-evaluator.withgoogle.com/)
- [Security Headers](https://securityheaders.com/)

---

*Last Updated: December 4, 2025*
*Next Review: Monthly*

