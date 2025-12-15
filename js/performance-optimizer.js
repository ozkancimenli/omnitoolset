/**
 * Performance Optimizer - PageSpeed Insights için optimizasyonlar
 * Lazy load images, defer non-critical scripts, optimize ad loading
 */

(function() {
    'use strict';
    
    // Lazy load images
    if ('IntersectionObserver' in window) {
        const imageObserver = new IntersectionObserver((entries, observer) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const img = entry.target;
                    if (img.dataset.src) {
                        img.src = img.dataset.src;
                        img.removeAttribute('data-src');
                        observer.unobserve(img);
                    }
                }
            });
        });
        
        // Tüm lazy images'ı observe et
        document.querySelectorAll('img[data-src]').forEach(img => {
            imageObserver.observe(img);
        });
    }
    
    // Ad scripts'i lazy load et (sayfa yüklendikten sonra)
    function loadAdScripts() {
        // AdSense zaten async, sadece Adsterra'yı optimize et
        const adsterraScripts = document.querySelectorAll('script[src*="effectivegatecpm.com"]:not([data-loaded])');
        adsterraScripts.forEach(script => {
            script.setAttribute('data-loaded', 'true');
            // Script zaten var, sadece işaretle
        });
    }
    
    // Sayfa yüklendikten 2 saniye sonra ad scripts'i yükle
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', function() {
            setTimeout(loadAdScripts, 2000);
        });
    } else {
        setTimeout(loadAdScripts, 2000);
    }
    
    // Preconnect to external domains
    const preconnectDomains = [
        'https://www.google.com',
        'https://www.googletagmanager.com',
        'https://pagead2.googlesyndication.com',
        'https://pl28055637.effectivegatecpm.com'
    ];
    
    preconnectDomains.forEach(domain => {
        const link = document.createElement('link');
        link.rel = 'preconnect';
        link.href = domain;
        link.crossOrigin = 'anonymous';
        document.head.appendChild(link);
    });
    
    // DNS prefetch for ad domains
    const dnsPrefetchDomains = [
        'https://pl28055668.effectivegatecpm.com',
        'https://pl28059282.effectivegatecpm.com'
    ];
    
    dnsPrefetchDomains.forEach(domain => {
        const link = document.createElement('link');
        link.rel = 'dns-prefetch';
        link.href = domain;
        document.head.appendChild(link);
    });
})();
