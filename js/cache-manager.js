// Cache Management & Offline Support
(function() {
    'use strict';
    
    // Cache API for offline support
    const CACHE_NAME = 'omnitoolset-v1';
    const CACHE_URLS = [
        '/',
        '/index.html',
        '/styles.css',
        '/app.js',
        '/all-tools.html',
        '/categories.html',
        '/blog.html'
    ];
    
    // Install service worker cache
    if ('serviceWorker' in navigator && 'caches' in window) {
        window.addEventListener('load', () => {
            navigator.serviceWorker.register('/sw.js').catch(() => {
                // Service worker not available, that's okay
            });
        });
    }
    
    // Cache management
    function clearOldCaches() {
        if ('caches' in window) {
            caches.keys().then(cacheNames => {
                cacheNames.forEach(cacheName => {
                    if (cacheName !== CACHE_NAME && cacheName.startsWith('omnitoolset-')) {
                        caches.delete(cacheName);
                    }
                });
            });
        }
    }
    
    // Prefetch critical resources
    function prefetchResources() {
        if ('requestIdleCallback' in window) {
            requestIdleCallback(() => {
                const links = document.querySelectorAll('a[href^="/tools/"]');
                const prefetchUrls = Array.from(links)
                    .slice(0, 5)
                    .map(link => link.getAttribute('href'));
                
                prefetchUrls.forEach(url => {
                    const link = document.createElement('link');
                    link.rel = 'prefetch';
                    link.href = url;
                    document.head.appendChild(link);
                });
            });
        }
    }
    
    // LocalStorage cache for tool data
    function cacheToolData() {
        if (typeof tools !== 'undefined' && tools.length > 0) {
            try {
                localStorage.setItem('tools_cache', JSON.stringify({
                    data: tools,
                    timestamp: Date.now(),
                    version: '1.0'
                }));
            } catch (e) {
                // Storage quota exceeded
                console.warn('Cache storage quota exceeded');
            }
        }
    }
    
    // Get cached tool data
    function getCachedToolData() {
        try {
            const cached = localStorage.getItem('tools_cache');
            if (cached) {
                const parsed = JSON.parse(cached);
                const age = Date.now() - parsed.timestamp;
                
                // Use cache if less than 24 hours old
                if (age < 24 * 60 * 60 * 1000) {
                    return parsed.data;
                }
            }
        } catch (e) {
            // Cache invalid or corrupted
        }
        return null;
    }
    
    // Initialize
    document.addEventListener('DOMContentLoaded', () => {
        clearOldCaches();
        cacheToolData();
        
        // Prefetch on idle
        if ('requestIdleCallback' in window) {
            requestIdleCallback(prefetchResources);
        } else {
            setTimeout(prefetchResources, 2000);
        }
    });
    
    // Export functions
    window.getCachedToolData = getCachedToolData;
})();

