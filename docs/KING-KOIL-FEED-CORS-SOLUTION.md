# 🛏️ King Koil Feed - CORS Sorunu Çözümü

## ⚠️ Sorun

Feed doğrudan browser'dan yüklenemiyor çünkü:
- AWIN feed URL'i CORS header'ları göndermiyor
- Browser güvenlik politikası feed'i engelliyor

## ✅ Çözüm Seçenekleri

### Seçenek 1: Backend Proxy (Önerilen)

Backend'de bir API endpoint oluşturun:

#### Node.js/Express Örneği:
```javascript
// api/feed/king-koil.js
const express = require('express');
const router = express.Router();
const https = require('https');
const zlib = require('zlib');

router.get('/king-koil', async (req, res) => {
    const feedUrl = 'https://productdata.awin.com/datafeed/download/apikey/7c0f23d9fd3e19cfa84d63cc97da56ac/language/en/fid/101819/rid/0/hasEnhancedFeeds/0/columns/aw_deep_link,product_name,aw_product_id,merchant_product_id,merchant_image_url,description,merchant_category,search_price,merchant_name,merchant_id,category_name,category_id,aw_image_url,currency,store_price,delivery_cost,merchant_deep_link,language,last_updated,display_price,data_feed_id/format/csv/delimiter/%2C/compression/gzip/adultcontent/1/';
    
    https.get(feedUrl, (response) => {
        const gunzip = zlib.createGunzip();
        response.pipe(gunzip);
        
        let data = '';
        gunzip.on('data', (chunk) => {
            data += chunk.toString();
        });
        
        gunzip.on('end', () => {
            // CSV'yi parse et ve JSON'a çevir
            const products = parseCSV(data);
            res.json(products);
        });
    });
});
```

#### Frontend'de Kullanım:
```javascript
// js/king-koil-feed.js içinde
const FEED_URL = '/api/feed/king-koil'; // Backend endpoint
```

---

### Seçenek 2: Vercel Serverless Function

Vercel kullanıyorsanız:

#### `api/king-koil-feed.js`:
```javascript
export default async function handler(req, res) {
    const feedUrl = 'https://productdata.awin.com/datafeed/download/...';
    
    const response = await fetch(feedUrl);
    const compressedData = await response.arrayBuffer();
    
    // Decompress (Node.js'te zlib kullan)
    const zlib = require('zlib');
    const decompressed = zlib.gunzipSync(Buffer.from(compressedData));
    
    // CSV parse et
    const products = parseCSV(decompressed.toString());
    
    res.json(products);
}
```

---

### Seçenek 3: Manuel Feed İndirme (Geçici)

Feed'i manuel olarak indirip statik kullanın:

```bash
# Feed'i indir
curl -H "Accept-Encoding: gzip" \
     "https://productdata.awin.com/datafeed/download/..." \
     --output king-koil-feed.csv.gz

# Decompress
gunzip king-koil-feed.csv.gz

# JSON'a çevir (Python script ile)
python convert-feed-to-json.py king-koil-feed.csv
```

Sonra JSON dosyasını public klasörüne koyun ve JavaScript'ten okuyun.

---

### Seçenek 4: Statik Ürünler (En Basit)

Feed yerine manuel olarak birkaç popüler ürünü statik olarak gösterin:

```javascript
const STATIC_PRODUCTS = [
    {
        product_name: "King Koil Luxury Air Mattress - Black",
        display_price: "USD129.95",
        aw_deep_link: "https://www.awin1.com/pclick.php?p=43317328561&a=2682178&m=115216",
        merchant_image_url: "https://cdn.shopify.com/s/files/1/3097/4354/files/kingkoil_blacktwin_wirecutter.jpg"
    },
    // ... daha fazla ürün
];
```

---

## 🔍 Hata Ayıklama

### Console'da Kontrol Edin:

1. **F12** → Console sekmesi
2. Şu mesajları arayın:
   - "Fetching feed from AWIN..."
   - "Feed response status: ..."
   - "CORS error: ..."

### CORS Hatası Görürseniz:

```
Access to fetch at 'https://productdata.awin.com/...' from origin 'https://omnitoolset.com' 
has been blocked by CORS policy
```

**Çözüm:** Backend proxy kullanın (Seçenek 1 veya 2)

---

## ✅ Önerilen Yaklaşım

**Şimdilik:** Seçenek 4 (Statik ürünler) - Hızlı ve çalışır

**İleride:** Seçenek 1 veya 2 (Backend proxy) - Otomatik güncelleme

---

*Last Updated: January 2025*
