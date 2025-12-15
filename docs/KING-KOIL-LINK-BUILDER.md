# 🛏️ King Koil Airbeds - Link Builder Rehberi

## 🎯 Hızlı Başlangıç

### 1. AWIN Dashboard'a Giriş
1. https://www.awin.com/ adresine gidin
2. Publisher hesabınıza giriş yapın
3. Sol menüden **"Links & Tools"** → **"Link Builder"** seçin

---

## 📝 Link Oluşturma Adımları

### Adım 1: Advertiser Seçimi
- **Advertiser**: "King Koil Airbeds" arayın
- Veya program ID'sini biliyorsanız ID ile arayın
- Advertiser'ı seçin

**Not:** Program ID'sini bulmak için:
- AWIN Dashboard → "Advertisers" → "My Advertisers"
- King Koil Airbeds'i bulun
- Program ID'sini not edin

---

### Adım 2: Link Tipi Seçimi

**Önerilen: Deep Link**

**Seçenekler:**
- ✅ **Deep Link** (Önerilir) - Belirli sayfaya yönlendirme
- ✅ **Text Link** - Ana sayfaya yönlendirme

---

### Adım 3: Destination URL (Deep Link için)

**Seçenekler:**

1. **Ana Sayfa:**
   ```
   https://www.kingkoilairbeds.com/
   ```

2. **Tüm Ürünler:**
   ```
   https://www.kingkoilairbeds.com/collections/all
   ```

3. **Belirli Kategori:**
   ```
   https://www.kingkoilairbeds.com/collections/[category-name]
   ```

4. **Belirli Ürün:**
   ```
   https://www.kingkoilairbeds.com/products/[product-name]
   ```

**Öneri:** Ana sayfa veya tüm ürünler sayfası en iyi conversion sağlar.

---

### Adım 4: Campaign Parameters (İsteğe Bağlı)

**Önerilen Ayarlar:**
- **Campaign Name**: `omnitoolset` veya `omnitoolset-airbeds`
- **Medium**: `affiliate`
- **Source**: `omnitoolset`

**Neden?** Analytics'te hangi kampanyadan geldiğini görmek için.

---

### Adım 5: Click References (Önerilir)

**Click Reference Örnekleri:**
- `omnitoolset-airbeds` - Genel shop sayfası için
- `shop-page` - Shop sayfası için
- `homepage` - Ana sayfa için
- `blog-post` - Blog yazısı için

**Neden?** Hangi sayfadan tıklama geldiğini takip etmek için.

---

### Adım 6: Link Oluştur

1. **"Create Link"** butonuna tıklayın
2. Oluşturulan linki kopyalayın
3. Link'i test edin (tarayıcıda açarak)

---

## 🔗 Link Formatı Örnekleri

### Basit Link (Ana Sayfa):
```
https://www.awin1.com/cread.php?awinmid=KING_KOIL_PROGRAM_ID&awinaffid=2682178&clickref=omnitoolset-airbeds&ued=https%3A%2F%2Fwww.kingkoilairbeds.com%2F
```

### Deep Link (Tüm Ürünler):
```
https://www.awin1.com/cread.php?awinmid=KING_KOIL_PROGRAM_ID&awinaffid=2682178&clickref=omnitoolset-airbeds&ued=https%3A%2F%2Fwww.kingkoilairbeds.com%2Fcollections%2Fall
```

### Deep Link (Belirli Ürün):
```
https://www.awin1.com/cread.php?awinmid=KING_KOIL_PROGRAM_ID&awinaffid=2682178&clickref=omnitoolset-airbeds&ued=https%3A%2F%2Fwww.kingkoilairbeds.com%2Fproducts%2Fpremium-airbed
```

---

## 📋 Link Parametreleri Açıklaması

| Parametre | Açıklama | Örnek |
|-----------|----------|-------|
| `awinmid` | Advertiser Program ID | `KING_KOIL_PROGRAM_ID` |
| `awinaffid` | Publisher ID (Sizin ID'niz) | `2682178` |
| `clickref` | Click Reference (Takip için) | `omnitoolset-airbeds` |
| `ued` | Destination URL (URL encoded) | `https%3A%2F%2Fwww.kingkoilairbeds.com%2F` |

---

## ✅ Link Oluşturma Checklist

- [ ] AWIN dashboard'a giriş yaptım
- [ ] Link Builder'a gittim
- [ ] King Koil Airbeds programını buldum
- [ ] Program ID'sini not ettim
- [ ] Deep Link seçtim
- [ ] Destination URL girdim
- [ ] Click reference ekledim (`omnitoolset-airbeds`)
- [ ] Link'i oluşturdum
- [ ] Link'i test ettim
- [ ] `shop.html` dosyasındaki `KING_KOIL_ID` placeholder'ını gerçek ID ile değiştirdim

---

## 🔄 shop.html Dosyasını Güncelleme

Oluşturduğunuz linki `shop.html` dosyasındaki placeholder'larla değiştirin:

### Bulunacak:
```html
awinmid=KING_KOIL_ID
```

### Değiştirilecek:
```html
awinmid=GERÇEK_PROGRAM_ID
```

**Örnek:**
```html
<!-- ÖNCE -->
<a href="https://www.awin1.com/cread.php?awinmid=KING_KOIL_ID&awinaffid=2682178&clickref=omnitoolset-airbeds&ued=https%3A%2F%2Fwww.kingkoilairbeds.com%2F">

<!-- SONRA -->
<a href="https://www.awin1.com/cread.php?awinmid=123456&awinaffid=2682178&clickref=omnitoolset-airbeds&ued=https%3A%2F%2Fwww.kingkoilairbeds.com%2F">
```

---

## 🎯 Farklı Link Türleri

### 1. Ana Sayfa Linki
**Kullanım:** Genel banner'lar, shop sayfası
```
https://www.awin1.com/cread.php?awinmid=PROGRAM_ID&awinaffid=2682178&clickref=omnitoolset-airbeds&ued=https%3A%2F%2Fwww.kingkoilairbeds.com%2F
```

### 2. Tüm Ürünler Linki
**Kullanım:** "Shop All" butonları
```
https://www.awin1.com/cread.php?awinmid=PROGRAM_ID&awinaffid=2682178&clickref=omnitoolset-airbeds&ued=https%3A%2F%2Fwww.kingkoilairbeds.com%2Fcollections%2Fall
```

### 3. Kategori Linki
**Kullanım:** Belirli kategori kartları
```
https://www.awin1.com/cread.php?awinmid=PROGRAM_ID&awinaffid=2682178&clickref=omnitoolset-airbeds&ued=https%3A%2F%2Fwww.kingkoilairbeds.com%2Fcollections%2Fguest-beds
```

---

## ⚠️ Önemli Kurallar (Tekrar)

### ❌ YAPILMAMASI GEREKENLER:
1. **PPC Yapmayın** - Paid search kesinlikle yasak
2. **Yetkisiz Coupon Code** - Sadece AWIN'dan gelen kodları kullanın
3. **Product Scraping** - Site'den ürün çekmeyin, feed kullanın
4. **Expired Coupon Codes** - Süresi dolmuş kodları kaldırın

### ✅ YAPILMASI GEREKENLER:
1. **News Manager'a Subscribe** - Launch bildirimleri için
2. **Product Feed Kullan** - AWIN'dan feed indirin
3. **Click Reference Ekleyin** - Tracking için
4. **Link'leri Test Edin** - Çalıştığından emin olun

---

## 🚀 Hızlı Link Oluşturma

### Terminal Komutu (Program ID'sini biliyorsanız):

```bash
# Program ID'sini değişken olarak ayarlayın
PROGRAM_ID="123456"  # Gerçek program ID'nizi yazın

# shop.html dosyasını güncelleyin
sed -i '' "s/KING_KOIL_ID/$PROGRAM_ID/g" shop.html
```

---

## 📊 Link Tracking

### Click Reference'ları Kullanarak:
- `omnitoolset-airbeds` - Shop sayfası
- `omnitoolset-airbeds-homepage` - Ana sayfa
- `omnitoolset-airbeds-blog` - Blog yazıları
- `omnitoolset-airbeds-category-airbeds` - Airbeds kategorisi

**AWIN Dashboard'da:**
- Reports → Transactions
- Click Reference'a göre filtreleyin
- Hangi sayfadan daha çok conversion geldiğini görün

---

## 🔍 Link Test Etme

1. Oluşturduğunuz linki tarayıcıda açın
2. King Koil Airbeds sitesine yönlendirildiğinden emin olun
3. URL'de AWIN tracking parametrelerinin olduğunu kontrol edin
4. AWIN dashboard'da click'in göründüğünü kontrol edin

---

## 💡 İpuçları

1. **Deep Link Kullanın** - Daha iyi conversion sağlar
2. **Click Reference Ekleyin** - Hangi sayfadan geldiğini takip edin
3. **Ana Sayfa + Kategori Linkleri** - Her ikisini de oluşturun
4. **Link'leri Test Edin** - Çalıştığından emin olun
5. **Program ID'sini Not Edin** - Tekrar kullanmak için

---

*Last Updated: January 2025*
*Publisher ID: 2682178*
*Program ID: 115216* ✅
