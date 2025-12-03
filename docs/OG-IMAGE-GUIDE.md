# OG Image Nedir ve Nasıl Oluşturulur?

## OG Image Nedir?

**OG Image (Open Graph Image)**, sosyal medya platformlarında (Facebook, Twitter, LinkedIn, WhatsApp vb.) link paylaşıldığında görünen görseldir.

### Örnek:
- Bir linki Facebook'ta paylaştığınızda, büyük bir görsel + başlık + açıklama görünür
- Bu görsel **OG Image**'dir

## Neden Önemli?

1. **Daha fazla tıklama**: Görsel içerik daha çekici
2. **Profesyonel görünüm**: Marka kimliğinizi yansıtır
3. **Daha iyi engagement**: Görsel içerik daha çok paylaşılır

## OG Image Özellikleri

- **Boyut**: 1200x630 piksel (önerilen)
- **Format**: JPG veya PNG
- **Dosya boyutu**: Maksimum 8MB (ideal: 200KB-1MB)
- **Konum**: Site root'unda (`/og-image.jpg`)

## Nasıl Oluşturulur?

### Seçenek 1: Online Araçlar
1. **Canva** (https://www.canva.com)
   - 1200x630 boyutunda tasarım oluştur
   - "OmniToolset - 270+ Free Online Tools" yazısı ekle
   - Logo ve görsel ekle
   - JPG olarak indir

2. **Figma** (https://www.figma.com)
   - 1200x630 frame oluştur
   - Tasarım yap
   - Export → JPG

### Seçenek 2: Photoshop/GIMP
- 1200x630 yeni dosya oluştur
- Tasarım yap
- JPG olarak kaydet

### Seçenek 3: AI Araçlar
- **DALL-E**, **Midjourney**, **Stable Diffusion** ile oluştur
- 1200x630 boyutuna getir

## Tasarım Önerileri

### İçerik:
- **Başlık**: "OmniToolset"
- **Alt başlık**: "270+ Free Online Tools"
- **Özellikler**: "100% Free • No Registration • No Watermarks"
- **Görsel**: Tool iconları veya gradient arka plan

### Renkler:
- Primary: #6366f1 (Indigo)
- Secondary: #8b5cf6 (Purple)
- Background: Dark theme uyumlu

### Font:
- Bold, okunabilir font
- Minimum 48px başlık

## Dosya Yükleme

1. Görseli oluştur
2. `og-image.jpg` olarak kaydet
3. Site root'una koy: `/og-image.jpg`
4. Vercel'e push et

## Test Etme

### Facebook Debugger:
https://developers.facebook.com/tools/debug/

### Twitter Card Validator:
https://cards-dev.twitter.com/validator

### LinkedIn Post Inspector:
https://www.linkedin.com/post-inspector/

Bu araçlarla linkinizi test edin ve görselin doğru göründüğünü kontrol edin.

## Örnek OG Image İçeriği

```
┌─────────────────────────────────────┐
│  [Gradient Background: Indigo→Purple]│
│                                      │
│         🛠️ OmniToolset              │
│                                      │
│     270+ Free Online Tools           │
│                                      │
│  100% Free • No Registration         │
│  No Watermarks • Unlimited Use      │
│                                      │
│  PDF • Image • Developer • Student   │
└─────────────────────────────────────┘
```

## Hızlı Çözüm

Eğer şimdilik görsel oluşturamazsanız:
1. Basit bir gradient arka plan
2. "OmniToolset" yazısı
3. "270+ Free Tools" alt yazısı

Bu bile yeterli olacaktır. Daha sonra profesyonel bir tasarım yapabilirsiniz.

