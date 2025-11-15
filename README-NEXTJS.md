# 🚀 OmniToolset - Next.js Versiyonu

Modern, SEO-optimized ve performanslı Next.js versiyonu!

## ✨ Özellikler

- ⚡ Next.js 14 (App Router)
- 🎨 Tailwind CSS
- 📱 Responsive Design
- 🔍 SEO Optimized
- 🚀 Server-Side Rendering
- 📦 TypeScript
- 🎯 Component-Based Architecture

## 🛠️ Kurulum

```bash
# Bağımlılıkları yükle
npm install

# Development server'ı başlat
npm run dev

# Production build
npm run build

# Production server'ı başlat
npm start
```

## 📁 Proje Yapısı

```
omnitoolset/
├── app/
│   ├── layout.tsx          # Root layout
│   ├── page.tsx            # Ana sayfa
│   ├── globals.css         # Global styles
│   └── tools/
│       └── [slug]/
│           └── page.tsx    # Dynamic tool pages
├── components/
│   ├── Header.tsx
│   ├── Footer.tsx
│   ├── ToolCard.tsx
│   └── tools/
│       ├── pdf-merge.tsx
│       ├── text-counter.tsx
│       └── password-generator.tsx
├── data/
│   └── tools.ts            # Tools database
└── lib/                    # Utilities
```

## 🎯 Yeni Tool Ekleme

1. `data/tools.ts` dosyasına tool ekle
2. `components/tools/[tool-id].tsx` dosyası oluştur
3. Otomatik olarak `/tools/[slug]` route'unda görünecek!

## 📈 SEO

- Her sayfa için otomatik meta tags
- Structured data (JSON-LD)
- Sitemap generation
- Open Graph tags

## 🚀 Deployment

### Vercel (Önerilen)
```bash
vercel
```

### Netlify
```bash
npm run build
# out/ klasörünü deploy et
```

### Docker
```bash
docker build -t omnitoolset .
docker run -p 3000:3000 omnitoolset
```

## 📝 Notlar

- Tüm işlemler client-side (tarayıcıda)
- Dosyalar sunucuya gönderilmez
- Privacy-first yaklaşım

## 🎉 Başarılar!

Tüm araçlar component-based yapıda ve kolayca genişletilebilir!
