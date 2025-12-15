# 🛏️ King Koil Airbeds - Product Feed Kullanım Rehberi

## 📊 Product Feed Bilgileri

### Feed URL:
```
https://productdata.awin.com/datafeed/download/apikey/7c0f23d9fd3e19cfa84d63cc97da56ac/language/en/fid/101819/rid/0/hasEnhancedFeeds/0/columns/aw_deep_link,product_name,aw_product_id,merchant_product_id,merchant_image_url,description,merchant_category,search_price,merchant_name,merchant_id,category_name,category_id,aw_image_url,currency,store_price,delivery_cost,merchant_deep_link,language,last_updated,display_price,data_feed_id/format/csv/delimiter/%2C/compression/gzip/adultcontent/1/
```

### Feed Özellikleri:
- **Format:** CSV
- **Compression:** GZIP
- **Language:** English (en)
- **Feed ID:** 101819
- **Delimiter:** Comma (,)

---

## 📋 Feed Kolonları

Feed'de şu kolonlar mevcut:

1. `aw_deep_link` - AWIN deep link
2. `product_name` - Ürün adı
3. `aw_product_id` - AWIN ürün ID
4. `merchant_product_id` - Merchant ürün ID
5. `merchant_image_url` - Ürün görsel URL'i
6. `description` - Ürün açıklaması
7. `merchant_category` - Merchant kategori
8. `search_price` - Arama fiyatı
9. `merchant_name` - Merchant adı
10. `merchant_id` - Merchant ID
11. `category_name` - Kategori adı
12. `category_id` - Kategori ID
13. `aw_image_url` - AWIN görsel URL'i
14. `currency` - Para birimi
15. `store_price` - Mağaza fiyatı
16. `delivery_cost` - Teslimat maliyeti
17. `merchant_deep_link` - Merchant deep link
18. `language` - Dil
19. `last_updated` - Son güncelleme tarihi
20. `display_price` - Görüntüleme fiyatı
21. `data_feed_id` - Feed ID

---

## 🔧 Feed Kullanımı

### ⚠️ ÖNEMLİ KURAL:
**Product Scraping YASAK** - Site'den ürün çekmek yasak. Sadece bu feed'i kullanmalısınız.

---

## 💻 JavaScript ile Feed Kullanımı

### 1. Feed'i İndirme ve Parse Etme

```javascript
async function loadKingKoilFeed() {
    try {
        // Feed URL'i
        const feedUrl = 'https://productdata.awin.com/datafeed/download/apikey/7c0f23d9fd3e19cfa84d63cc97da56ac/language/en/fid/101819/rid/0/hasEnhancedFeeds/0/columns/aw_deep_link,product_name,aw_product_id,merchant_product_id,merchant_image_url,description,merchant_category,search_price,merchant_name,merchant_id,category_name,category_id,aw_image_url,currency,store_price,delivery_cost,merchant_deep_link,language,last_updated,display_price,data_feed_id/format/csv/delimiter/%2C/compression/gzip/adultcontent/1/';
        
        // Feed'i indir (gzip compressed)
        const response = await fetch(feedUrl);
        const compressedData = await response.arrayBuffer();
        
        // GZIP decompress (pako library gerekli)
        const decompressedData = pako.inflate(compressedData, { to: 'string' });
        
        // CSV parse et
        const products = parseCSV(decompressedData);
        
        return products;
    } catch (error) {
        console.error('Feed yükleme hatası:', error);
        return [];
    }
}
```

### 2. CSV Parse Fonksiyonu

```javascript
function parseCSV(csvText) {
    const lines = csvText.split('\n');
    const headers = lines[0].split(',');
    const products = [];
    
    for (let i = 1; i < lines.length; i++) {
        if (lines[i].trim()) {
            const values = lines[i].split(',');
            const product = {};
            
            headers.forEach((header, index) => {
                product[header.trim()] = values[index]?.trim() || '';
            });
            
            products.push(product);
        }
    }
    
    return products;
}
```

### 3. Ürünleri Gösterme

```javascript
function displayKingKoilProducts(products) {
    const container = document.getElementById('king-koil-products');
    if (!container) return;
    
    container.innerHTML = products.slice(0, 6).map(product => `
        <div class="product-card">
            <img src="${product.merchant_image_url || product.aw_image_url}" 
                 alt="${product.product_name}"
                 onerror="this.src='/placeholder.jpg'">
            <h4>${product.product_name}</h4>
            <p class="price">${product.display_price || product.store_price}</p>
            <a href="${product.aw_deep_link}" 
               target="_blank" 
               rel="nofollow sponsored"
               class="product-link">
                Shop Now →
            </a>
        </div>
    `).join('');
}
```

---

## 📦 GZIP Decompression için Library

### Option 1: Pako.js (Önerilen)

```html
<script src="https://cdn.jsdelivr.net/npm/pako@2.1.0/dist/pako.min.js"></script>
```

### Option 2: fflate

```html
<script src="https://cdn.jsdelivr.net/npm/fflate@0.8.2/lib/browser.min.js"></script>
```

---

## 🎯 Basit Kullanım Örneği

### HTML:
```html
<div id="king-koil-products" class="products-grid">
    <!-- Ürünler buraya yüklenecek -->
</div>
```

### JavaScript:
```javascript
// Feed'i yükle ve göster
loadKingKoilFeed().then(products => {
    displayKingKoilProducts(products);
});
```

---

## 🔄 Feed Güncelleme

### Feed Ne Zaman Güncellenir?
- Feed genellikle günlük olarak güncellenir
- `last_updated` kolonundan son güncelleme tarihini görebilirsiniz
- Feed'i cache'leyebilirsiniz (24 saat)

### Cache Stratejisi:
```javascript
const CACHE_KEY = 'king_koil_feed';
const CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 saat

async function getCachedFeed() {
    const cached = localStorage.getItem(CACHE_KEY);
    if (cached) {
        const { data, timestamp } = JSON.parse(cached);
        if (Date.now() - timestamp < CACHE_DURATION) {
            return data;
        }
    }
    
    const products = await loadKingKoilFeed();
    localStorage.setItem(CACHE_KEY, JSON.stringify({
        data: products,
        timestamp: Date.now()
    }));
    
    return products;
}
```

---

## 📊 Feed Filtreleme

### Kategoriye Göre Filtreleme:
```javascript
function filterByCategory(products, categoryName) {
    return products.filter(product => 
        product.category_name === categoryName ||
        product.merchant_category === categoryName
    );
}

// Örnek: Sadece "Airbeds" kategorisindeki ürünleri göster
const airbeds = filterByCategory(products, 'Airbeds');
```

### Fiyata Göre Filtreleme:
```javascript
function filterByPrice(products, minPrice, maxPrice) {
    return products.filter(product => {
        const price = parseFloat(product.store_price || product.search_price || 0);
        return price >= minPrice && price <= maxPrice;
    });
}

// Örnek: $100-$300 arası ürünler
const midRange = filterByPrice(products, 100, 300);
```

---

## ⚠️ Önemli Notlar

1. **Feed GZIP Compressed** - Decompress etmeniz gerekiyor
2. **CORS** - Feed'i doğrudan browser'dan fetch edemeyebilirsiniz
3. **Backend Proxy** - Gerekirse backend'de proxy kullanın
4. **Rate Limiting** - Feed'i çok sık çekmeyin (cache kullanın)
5. **Error Handling** - Feed yüklenemezse fallback gösterin

---

## 🚀 Önerilen Yaklaşım

### Şimdilik:
1. ✅ Feed URL'ini not edin
2. ✅ Feed'i manuel olarak indirip inceleyin
3. ✅ Ürün bilgilerini statik olarak gösterin (feed yerine)

### İleride:
1. Backend API oluşturun (feed'i parse edip JSON döndürsün)
2. Frontend'den API'yi çağırın
3. Ürünleri dinamik olarak gösterin

---

## 📝 Feed İndirme (Manuel)

### Terminal Komutu:
```bash
curl -H "Accept-Encoding: gzip" \
     "https://productdata.awin.com/datafeed/download/apikey/7c0f23d9fd3e19cfa84d63cc97da56ac/language/en/fid/101819/rid/0/hasEnhancedFeeds/0/columns/aw_deep_link,product_name,aw_product_id,merchant_product_id,merchant_image_url,description,merchant_category,search_price,merchant_name,merchant_id,category_name,category_id,aw_image_url,currency,store_price,delivery_cost,merchant_deep_link,language,last_updated,display_price,data_feed_id/format/csv/delimiter/%2C/compression/gzip/adultcontent/1/" \
     --output king-koil-feed.csv.gz

# Decompress
gunzip king-koil-feed.csv.gz
```

### Python Script:
```python
import gzip
import csv
import requests

url = "https://productdata.awin.com/datafeed/download/apikey/7c0f23d9fd3e19cfa84d63cc97da56ac/language/en/fid/101819/rid/0/hasEnhancedFeeds/0/columns/aw_deep_link,product_name,aw_product_id,merchant_product_id,merchant_image_url,description,merchant_category,search_price,merchant_name,merchant_id,category_name,category_id,aw_image_url,currency,store_price,delivery_cost,merchant_deep_link,language,last_updated,display_price,data_feed_id/format/csv/delimiter/%2C/compression/gzip/adultcontent/1/"

response = requests.get(url)
decompressed = gzip.decompress(response.content)
csv_data = decompressed.decode('utf-8')

# CSV'yi parse et
reader = csv.DictReader(csv_data.splitlines())
products = list(reader)

print(f"Toplam {len(products)} ürün bulundu")
```

---

## ✅ Checklist

- [ ] Feed URL'ini kaydettim
- [ ] Feed'i manuel olarak indirip inceledim
- [ ] Feed formatını anladım (CSV, GZIP)
- [ ] Gerekli library'leri ekledim (pako.js veya fflate)
- [ ] Feed parse fonksiyonunu yazdım
- [ ] Ürünleri gösterme fonksiyonunu yazdım
- [ ] Cache mekanizması ekledim
- [ ] Error handling ekledim
- [ ] Feed'i test ettim

---

*Last Updated: January 2025*
*Feed ID: 101819*
*Format: CSV (GZIP Compressed)*
*Program ID: 115216* ✅
*Merchant ID: 115216*
