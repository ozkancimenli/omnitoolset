# 🎬 Valerion US Affiliate Programme - Setup Guide

## 📋 Program Özeti

**Valerion** - Red Dot Winner 2025
- **Product**: Long-throw home cinema projectors
- **Commission**: 5%-10% Basic + Extra Bonus
- **Average Order Value**: $3,000 (çok yüksek!)
- **Cookie Duration**: 30 days
- **Network**: AWIN

## 🔗 AWIN Link Oluşturma

### Adım 1: AWIN Dashboard'a Giriş
1. https://www.awin.com/ adresine gidin
2. Publisher hesabınıza giriş yapın
3. Sol menüden **"Links & Tools"** → **"Link Builder"** seçin

### Adım 2: Valerion Programını Bulun
- **Advertiser**: "Valerion" arayın
- Program ID'sini not edin (awinmid)

### Adım 3: Link Oluştur
- **Link Type**: Deep Link (önerilir)
- **Destination URL**: `https://www.valerion.com/`
- **Click Reference**: `omnitoolset-shop`

### Adım 4: Link Formatı
```
https://www.awin1.com/cread.php?awinmid=VALERION_MERCHANT_ID&awinaffid=2682178&clickref=omnitoolset-shop&ued=https%3A%2F%2Fwww.valerion.com%2F
```

## ⚠️ ÖNEMLİ: shop.html Güncelleme

Şu anda `shop.html` dosyasında placeholder var:
```html
awinmid=VALERION_MERCHANT_ID
```

**Gerçek merchant ID'yi bulduktan sonra değiştirin:**
1. AWIN Dashboard → "Advertisers" → "My Advertisers"
2. Valerion'u bulun
3. Program ID'sini not edin
4. `shop.html` dosyasında `VALERION_MERCHANT_ID` yerine gerçek ID'yi yazın

## 📝 PPC Guidelines (Önemli!)

Valerion'un strict PPC kuralları var:

### ❌ Yapılamaz:
- Trademark terimlerine bid yapılamaz (Valerion, valerion.com, vb.)
- Domain adında trademark kullanılamaz
- Prohibited keywords'e bid yapılamaz

### ✅ Yapılabilir:
- "Valerion coupon" kombinasyonları (dedicated coupon page gerekli)
- Negative keyword listesi oluşturulmalı (Valerion exact match)

## 💰 Commission Yapısı

- **Base Commission**: 5%-10%
- **Extra Bonus**: Performance-based
- **Commission Increasing Plan**: Var
- **Average Order Value**: $3,000 (çok yüksek değer!)

## 📧 İletişim

- **Email**: Affiliate@valerion.com
- **Website**: https://www.valerion.com

## ✅ Checklist

- [ ] AWIN dashboard'a giriş yaptım
- [ ] Valerion programını buldum
- [ ] Merchant ID'yi not ettim
- [ ] Link Builder ile link oluşturdum
- [ ] shop.html'deki placeholder'ı gerçek ID ile değiştirdim
- [ ] Link'i test ettim
- [ ] PPC guidelines'ı okudum (eğer PPC yapacaksanız)
