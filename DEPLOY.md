# 🚀 Deployment Guide

## Vercel'e Deploy Etme (Önerilen)

### Yöntem 1: Vercel Web UI (En Kolay)

1. **Vercel'e Git**: https://vercel.com
2. **GitHub ile Giriş Yap**: "Continue with GitHub" butonuna tıkla
3. **Yeni Proje Ekle**: "Add New Project" butonuna tıkla
4. **Repository Seç**: `omnitoolset` repository'sini seç
5. **Deploy**: Vercel otomatik olarak Next.js'i algılar, "Deploy" butonuna tıkla
6. **Hazır!**: Birkaç dakika içinde siten canlıda olacak

### Yöntem 2: Vercel CLI

```bash
# Vercel'e login ol
vercel login

# Production'a deploy et
vercel --prod --yes
```

## Environment Variables (Opsiyonel)

Eğer Google Analytics veya AdSense kullanacaksan, Vercel dashboard'dan şu environment variables'ları ekle:

- `NEXT_PUBLIC_GA_ID`: Google Analytics ID
- `NEXT_PUBLIC_ADSENSE_ID`: Google AdSense ID

## Custom Domain (Opsiyonel)

1. Vercel Dashboard → Project Settings → Domains
2. Domain'ini ekle (örn: omnitoolset.com)
3. DNS ayarlarını yap (Vercel talimatları verir)

## Build Ayarları

Vercel otomatik olarak şunları algılar:
- **Framework**: Next.js
- **Build Command**: `npm run build`
- **Output Directory**: `.next`
- **Install Command**: `npm install`

Herhangi bir ekstra ayar gerekmez!

