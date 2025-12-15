/**
 * SEO Ping Script - Hızlı indexleme için
 * Google, Bing ve diğer arama motorlarına sitemap'i bildirir
 */

(function() {
    'use strict';
    
    // Sadece production'da çalışsın
    if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
        return;
    }
    
    const sitemapUrl = 'https://www.omnitoolset.com/sitemap.xml';
    
    // Google Search Console ping
    function pingGoogle() {
        const googlePingUrl = 'https://www.google.com/ping?sitemap=' + encodeURIComponent(sitemapUrl);
        
        // Image ile ping (non-blocking)
        const img = new Image();
        img.src = googlePingUrl;
        img.style.display = 'none';
        img.onload = function() {
            console.log('✅ Google pinged successfully');
        };
        img.onerror = function() {
            // Silent fail
        };
    }
    
    // Bing Webmaster ping
    function pingBing() {
        const bingPingUrl = 'https://www.bing.com/ping?sitemap=' + encodeURIComponent(sitemapUrl);
        
        const img = new Image();
        img.src = bingPingUrl;
        img.style.display = 'none';
        img.onload = function() {
            console.log('✅ Bing pinged successfully');
        };
        img.onerror = function() {
            // Silent fail
        };
    }
    
    // Yandex ping
    function pingYandex() {
        const yandexPingUrl = 'https://webmaster.yandex.com/ping?sitemap=' + encodeURIComponent(sitemapUrl);
        
        const img = new Image();
        img.src = yandexPingUrl;
        img.style.display = 'none';
        img.onload = function() {
            console.log('✅ Yandex pinged successfully');
        };
        img.onerror = function() {
            // Silent fail
        };
    }
    
    // Sayfa yüklendiğinde ping yap
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', function() {
            setTimeout(function() {
                pingGoogle();
                pingBing();
                pingYandex();
            }, 2000); // 2 saniye bekle
        });
    } else {
        setTimeout(function() {
            pingGoogle();
            pingBing();
            pingYandex();
        }, 2000);
    }
})();
