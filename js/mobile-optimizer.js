// Mobile Optimization & PWA Enhancements
(function() {
    'use strict';
    
    // Touch gesture support
    let touchStartX = 0;
    let touchStartY = 0;
    
    document.addEventListener('touchstart', (e) => {
        touchStartX = e.touches[0].clientX;
        touchStartY = e.touches[0].clientY;
    }, { passive: true });
    
    document.addEventListener('touchend', (e) => {
        if (!touchStartX || !touchStartY) return;
        
        const touchEndX = e.changedTouches[0].clientX;
        const touchEndY = e.changedTouches[0].clientY;
        
        const diffX = touchStartX - touchEndX;
        const diffY = touchStartY - touchEndY;
        
        // Swipe left/right detection (could be used for navigation)
        if (Math.abs(diffX) > Math.abs(diffY) && Math.abs(diffX) > 50) {
            // Swipe detected
        }
        
        touchStartX = 0;
        touchStartY = 0;
    }, { passive: true });
    
    // Optimize viewport for mobile
    function optimizeViewport() {
        const viewport = document.querySelector('meta[name="viewport"]');
        if (viewport) {
            viewport.setAttribute('content', 
                'width=device-width, initial-scale=1.0, maximum-scale=5.0, user-scalable=yes, viewport-fit=cover'
            );
        }
    }
    
    // Add mobile-specific classes
    function detectMobile() {
        const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
        const isTouch = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
        
        if (isMobile || isTouch) {
            document.documentElement.classList.add('mobile-device');
        }
        
        if (isMobile) {
            document.documentElement.classList.add('mobile-browser');
        }
    }
    
    // Optimize images for mobile
    function optimizeImagesForMobile() {
        if (window.innerWidth < 768) {
            document.querySelectorAll('img').forEach(img => {
                if (!img.hasAttribute('loading')) {
                    img.setAttribute('loading', 'lazy');
                }
            });
        }
    }
    
    // PWA install prompt
    let deferredPrompt;
    
    window.addEventListener('beforeinstallprompt', (e) => {
        e.preventDefault();
        deferredPrompt = e;
        
        // Show install button (if you have one)
        const installButton = document.getElementById('pwa-install-button');
        if (installButton) {
            installButton.style.display = 'block';
            installButton.addEventListener('click', async () => {
                if (deferredPrompt) {
                    deferredPrompt.prompt();
                    const { outcome } = await deferredPrompt.userChoice;
                    
                    if (outcome === 'accepted') {
                        if (typeof gtag !== 'undefined') {
                            gtag('event', 'pwa_install', {
                                'event_category': 'Engagement'
                            });
                        }
                    }
                    
                    deferredPrompt = null;
                    installButton.style.display = 'none';
                }
            });
        }
    });
    
    // Service Worker registration (if available)
    if ('serviceWorker' in navigator) {
        window.addEventListener('load', () => {
            navigator.serviceWorker.register('/sw.js').catch(() => {
                // Service worker not available, that's okay
            });
        });
    }
    
    // Initialize
    document.addEventListener('DOMContentLoaded', () => {
        optimizeViewport();
        detectMobile();
        optimizeImagesForMobile();
    });
    
    // Handle orientation change
    window.addEventListener('orientationchange', () => {
        setTimeout(optimizeImagesForMobile, 100);
    });
})();

