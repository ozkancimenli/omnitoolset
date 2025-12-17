// Performance Power-Up: Advanced Optimizations
(function() {
    'use strict';
    
    // Lazy load images
    function lazyLoadImages() {
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
            
            document.querySelectorAll('img[data-src]').forEach(img => {
                imageObserver.observe(img);
            });
        }
    }
    
    // Prefetch next likely pages
    function prefetchNextPages() {
        const links = document.querySelectorAll('a[href^="/"]');
        const prefetchLinks = Array.from(links)
            .slice(0, 5) // Prefetch first 5 internal links
            .map(link => link.href);
        
        prefetchLinks.forEach(url => {
            const link = document.createElement('link');
            link.rel = 'prefetch';
            link.href = url;
            document.head.appendChild(link);
        });
    }
    
    // Debounce function for performance
    function debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }
    
    // Optimize scroll events
    let lastScrollTop = 0;
    const optimizedScroll = debounce(() => {
        const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
        
        // Header visibility on scroll
        const header = document.querySelector('.main-header');
        if (header) {
            if (scrollTop > lastScrollTop && scrollTop > 100) {
                header.style.transform = 'translateY(-100%)';
            } else {
                header.style.transform = 'translateY(0)';
            }
        }
        
        lastScrollTop = scrollTop;
    }, 10);
    
    // Request Animation Frame for smooth animations
    function smoothScroll() {
        window.addEventListener('scroll', () => {
            requestAnimationFrame(optimizedScroll);
        }, { passive: true });
    }
    
    // Critical resource hints
    function addResourceHints() {
        const hints = [
            { rel: 'dns-prefetch', href: 'https://www.google-analytics.com' },
            { rel: 'dns-prefetch', href: 'https://www.googletagmanager.com' },
            { rel: 'preconnect', href: 'https://fonts.googleapis.com' },
            { rel: 'preconnect', href: 'https://fonts.gstatic.com', crossorigin: true }
        ];
        
        hints.forEach(hint => {
            const link = document.createElement('link');
            link.rel = hint.rel;
            link.href = hint.href;
            if (hint.crossorigin) link.crossOrigin = 'anonymous';
            document.head.appendChild(link);
        });
    }
    
    // Initialize on DOM ready
    document.addEventListener('DOMContentLoaded', () => {
        lazyLoadImages();
        smoothScroll();
        addResourceHints();
        
        // Prefetch after page load
        window.addEventListener('load', () => {
            setTimeout(prefetchNextPages, 2000);
        });
    });
    
    // Performance metrics
    if ('PerformanceObserver' in window) {
        const perfObserver = new PerformanceObserver((list) => {
            for (const entry of list.getEntries()) {
                if (entry.entryType === 'navigation') {
                    console.log('Page Load Time:', entry.loadEventEnd - entry.fetchStart, 'ms');
                }
            }
        });
        
        try {
            perfObserver.observe({ entryTypes: ['navigation', 'paint', 'measure'] });
        } catch (e) {
            // Browser doesn't support all entry types
        }
    }
})();





