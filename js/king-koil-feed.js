// King Koil Airbeds Product Feed Loader
// Loads products from AWIN feed and displays them dynamically

(function() {
    'use strict';

    const FEED_URL = 'https://productdata.awin.com/datafeed/download/apikey/7c0f23d9fd3e19cfa84d63cc97da56ac/language/en/fid/101819/rid/0/hasEnhancedFeeds/0/columns/aw_deep_link,product_name,aw_product_id,merchant_product_id,merchant_image_url,description,merchant_category,search_price,merchant_name,merchant_id,category_name,category_id,aw_image_url,currency,store_price,delivery_cost,merchant_deep_link,language,last_updated,display_price,data_feed_id/format/csv/delimiter/%2C/compression/gzip/adultcontent/1/';
    
    const CACHE_KEY = 'king_koil_feed_cache';
    const CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 hours
    const MAX_PRODUCTS = 12; // Maximum products to display

    // Fallback static products (if feed fails to load)
    const FALLBACK_PRODUCTS = [
        {
            product_name: "King Koil Luxury Air Mattress with High Speed Built-in Pump",
            display_price: "USD129.95",
            aw_deep_link: "https://www.awin1.com/pclick.php?p=43317328561&a=2682178&m=115216",
            merchant_image_url: "https://cdn.shopify.com/s/files/1/3097/4354/files/kingkoil_blacktwin_wirecutter.jpg?v=1751990151",
            description: "Coil Beam - King Koil Airbeds were designed with you in mind. Enhanced Coil Technology provides the support you and your guests need for a sound night's sleep."
        },
        {
            product_name: "King Koil Luxury Air Mattress - Black (California King)",
            display_price: "USD179.95",
            aw_deep_link: "https://www.awin1.com/pclick.php?p=42890768720&a=2682178&m=115216",
            merchant_image_url: "https://cdn.shopify.com/s/files/1/3097/4354/files/Black_Cal_wirecutter.jpg?v=1751990274",
            description: "Premium air mattress with built-in high-speed pump. Fully inflate or deflate in just 90 seconds."
        },
        {
            product_name: "King Koil Air Mattress - Beige",
            display_price: "USD149.95",
            aw_deep_link: "https://www.awin1.com/pclick.php?p=43317328565&a=2682178&m=115216",
            merchant_image_url: "https://cdn.shopify.com/s/files/1/3097/4354/files/beige_Queen_20_1.jpg?v=1747757703",
            description: "Durable PVC combined with soft flocked top create a waterproof, extremely durable airbed."
        },
        {
            product_name: "King Koil Luxury Air Mattress - Blue",
            display_price: "USD149.95",
            aw_deep_link: "https://www.awin1.com/pclick.php?p=41333549314&a=2682178&m=115216",
            merchant_image_url: "https://cdn.shopify.com/s/files/1/3097/4354/files/Blue_Queen_20_1.jpg?v=1747766149",
            description: "Air-filled coils and internal layering naturally support the body, keeping the spine aligned as you sleep."
        }
    ];

    // CSV Parse Fonksiyonu
    function parseCSV(csvText) {
        const lines = csvText.split('\n').filter(line => line.trim());
        if (lines.length < 2) return [];

        const headers = lines[0].split(',').map(h => h.trim());
        const products = [];

        for (let i = 1; i < lines.length; i++) {
            if (!lines[i].trim()) continue;

            // CSV parsing - quotes içindeki virgülleri handle et
            const values = [];
            let current = '';
            let inQuotes = false;

            for (let j = 0; j < lines[i].length; j++) {
                const char = lines[i][j];
                
                if (char === '"') {
                    inQuotes = !inQuotes;
                } else if (char === ',' && !inQuotes) {
                    values.push(current.trim());
                    current = '';
                } else {
                    current += char;
                }
            }
            values.push(current.trim()); // Son değer

            if (values.length >= headers.length) {
                const product = {};
                headers.forEach((header, index) => {
                    product[header] = values[index] || '';
                });
                products.push(product);
            }
        }

        return products;
    }

    // Cache'den ürünleri al
    function getCachedProducts() {
        try {
            const cached = localStorage.getItem(CACHE_KEY);
            if (cached) {
                const { data, timestamp } = JSON.parse(cached);
                if (Date.now() - timestamp < CACHE_DURATION) {
                    return data;
                }
            }
        } catch (e) {
            console.error('Cache read error:', e);
        }
        return null;
    }

    // Cache'e ürünleri kaydet
    function setCachedProducts(products) {
        try {
            localStorage.setItem(CACHE_KEY, JSON.stringify({
                data: products,
                timestamp: Date.now()
            }));
        } catch (e) {
            console.error('Cache write error:', e);
        }
    }

    // Feed'i yükle
    async function loadFeed() {
        try {
            // Önce cache'i kontrol et
            const cached = getCachedProducts();
            if (cached) {
                console.log('Using cached products:', cached.length);
                return cached;
            }

            console.log('Fetching feed from AWIN...');

            // Feed'i indir - CORS sorunu olabilir, no-cors deneyelim
            let response;
            try {
                response = await fetch(FEED_URL, {
                    method: 'GET',
                    mode: 'cors',
                    cache: 'default'
                });
            } catch (corsError) {
                console.warn('CORS error, trying alternative method:', corsError);
                // CORS sorunu varsa, feed'i backend'den çekmek gerekebilir
                // Şimdilik hata fırlat
                throw new Error('CORS error: Feed cannot be loaded directly from browser. Please use a backend proxy or load feed manually.');
            }

            console.log('Feed response status:', response.status, response.statusText);

            if (!response.ok) {
                throw new Error(`Feed loading error: ${response.status} ${response.statusText}`);
            }

            // GZIP compressed data'yı al
            const compressedData = await response.arrayBuffer();
            console.log('Compressed data size:', compressedData.byteLength, 'bytes');

            // Pako.js ile decompress et
            if (typeof pako === 'undefined') {
                throw new Error('Pako.js not loaded. Please check if the script is included.');
            }

            const decompressedData = pako.inflate(compressedData, { to: 'string' });
            console.log('Decompressed data length:', decompressedData.length, 'characters');

            // CSV parse et
            const products = parseCSV(decompressedData);
            console.log('Parsed products:', products.length);

            // Cache'e kaydet
            if (products.length > 0) {
                setCachedProducts(products);
                console.log('Products cached successfully');
            }

            return products;
        } catch (error) {
            console.error('Feed loading error:', error);
            console.error('Error details:', {
                message: error.message,
                stack: error.stack,
                feedUrl: FEED_URL
            });
            
            // Cache'den eski veriyi dene
            const cached = getCachedProducts();
            if (cached && cached.length > 0) {
                console.log('Using stale cache due to error');
                return cached;
            }
            
            // Feed yüklenemezse fallback ürünleri döndür
            console.warn('Feed loading failed, using fallback products');
            return FALLBACK_PRODUCTS;
        }
    }

    // Ürün kartı HTML'i oluştur
    function createProductCard(product) {
        const imageUrl = product.merchant_image_url || product.aw_image_url || '/placeholder.jpg';
        const price = product.display_price || product.store_price || product.search_price || 'N/A';
        const link = product.aw_deep_link || `https://www.awin1.com/cread.php?awinmid=115216&awinaffid=2682178&clickref=omnitoolset-airbeds&ued=${encodeURIComponent(product.merchant_deep_link || 'https://www.kingkoilairbeds.com/')}`;
        const title = product.product_name || 'King Koil Airbed';
        const description = (product.description || '').substring(0, 100) + '...';

        return `
            <div class="king-koil-product-card" style="background: var(--bg-card); border: 1px solid var(--border-color); border-radius: 12px; padding: 1rem; display: flex; flex-direction: column;">
                <a href="${link}" 
                   target="_blank" 
                   rel="nofollow sponsored"
                   style="text-decoration: none; color: inherit; display: flex; flex-direction: column; height: 100%;">
                    <div style="width: 100%; height: 200px; overflow: hidden; border-radius: 8px; margin-bottom: 1rem; background: var(--bg-color);">
                        <img src="${imageUrl}" 
                             alt="${title}"
                             style="width: 100%; height: 100%; object-fit: cover;"
                             onerror="this.src='/placeholder.jpg'; this.onerror=null;">
                    </div>
                    <h4 style="font-size: 1rem; font-weight: 600; margin-bottom: 0.5rem; color: var(--text-primary); line-height: 1.3;">
                        ${title}
                    </h4>
                    <p style="font-size: 0.85rem; color: var(--text-secondary); margin-bottom: 1rem; flex-grow: 1; line-height: 1.4;">
                        ${description}
                    </p>
                    <div style="display: flex; justify-content: space-between; align-items: center; margin-top: auto;">
                        <span style="font-size: 1.25rem; font-weight: 700; color: var(--primary-color);">
                            ${price}
                        </span>
                        <span style="font-size: 0.9rem; color: var(--text-secondary);">
                            Shop Now →
                        </span>
                    </div>
                </a>
            </div>
        `;
    }

    // Ürünleri göster
    function displayProducts(products) {
        const container = document.getElementById('king-koil-products');
        if (!container) return;

        if (products.length === 0) {
            container.innerHTML = '<p style="color: var(--text-secondary); text-align: center; grid-column: 1 / -1;">Products could not be loaded. Please try again later.</p>';
            return;
        }

        // Ürünleri sırala (fiyata göre veya rastgele)
        const sortedProducts = products
            .filter(p => p.product_name && p.aw_deep_link)
            .slice(0, MAX_PRODUCTS);

        if (sortedProducts.length === 0) {
            container.innerHTML = '<p style="color: var(--text-secondary); text-align: center; grid-column: 1 / -1;">No products found.</p>';
            return;
        }

        // Ürün kartlarını oluştur
        container.innerHTML = sortedProducts.map(createProductCard).join('');
    }

    // Ana fonksiyon
    async function init() {
        const container = document.getElementById('king-koil-products');
        if (!container) return;

        // Loading message
        container.innerHTML = '<p style="color: var(--text-secondary); text-align: center; grid-column: 1 / -1;">Loading products...</p>';

        try {
            // Feed'i yükle
            const products = await loadFeed();
            
            // Ürünleri göster
            displayProducts(products);
        } catch (error) {
            console.error('King Koil feed loading error:', error);
            container.innerHTML = '<p style="color: var(--text-secondary); text-align: center; grid-column: 1 / -1;">An error occurred while loading products. Please refresh the page.</p>';
        }
    }

    // DOM yüklendiğinde çalıştır
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
