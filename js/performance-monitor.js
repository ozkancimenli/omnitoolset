// Performance Monitoring & Metrics
(function() {
    'use strict';
    
    // Measure page load performance
    function measurePageLoad() {
        if ('performance' in window && 'timing' in window.performance) {
            const timing = window.performance.timing;
            const navigation = window.performance.navigation;
            
            const metrics = {
                // DNS lookup time
                dnsTime: timing.domainLookupEnd - timing.domainLookupStart,
                
                // TCP connection time
                tcpTime: timing.connectEnd - timing.connectStart,
                
                // Request time
                requestTime: timing.responseStart - timing.requestStart,
                
                // Response time
                responseTime: timing.responseEnd - timing.responseStart,
                
                // DOM processing time
                domProcessingTime: timing.domComplete - timing.domLoading,
                
                // Page load time
                pageLoadTime: timing.loadEventEnd - timing.navigationStart,
                
                // Time to interactive
                timeToInteractive: timing.domInteractive - timing.navigationStart,
                
                // Navigation type
                navigationType: navigation.type === 0 ? 'navigate' : 
                               navigation.type === 1 ? 'reload' : 
                               navigation.type === 2 ? 'back_forward' : 'other'
            };
            
            // Send to analytics
            if (typeof gtag !== 'undefined') {
                gtag('event', 'page_load_time', {
                    'event_category': 'Performance',
                    'value': Math.round(metrics.pageLoadTime),
                    'custom_parameter_1': Math.round(metrics.domProcessingTime),
                    'custom_parameter_2': Math.round(metrics.timeToInteractive)
                });
            }
            
            // Log slow pages (for debugging)
            if (metrics.pageLoadTime > 3000 && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')) {
                console.warn('Slow page load detected:', metrics);
            }
        }
    }
    
    // Measure resource loading
    function measureResourceLoading() {
        if ('performance' in window && 'getEntriesByType' in window.performance) {
            const resources = window.performance.getEntriesByType('resource');
            
            const slowResources = resources.filter(resource => {
                const duration = resource.duration || 0;
                return duration > 1000; // Resources taking more than 1 second
            });
            
            if (slowResources.length > 0 && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')) {
                console.warn('Slow resources detected:', slowResources.map(r => ({
                    name: r.name,
                    duration: Math.round(r.duration)
                })));
            }
            
            // Track largest contentful paint (LCP)
            if ('PerformanceObserver' in window) {
                try {
                    const observer = new PerformanceObserver((list) => {
                        const entries = list.getEntries();
                        const lastEntry = entries[entries.length - 1];
                        
                        if (typeof gtag !== 'undefined') {
                            gtag('event', 'largest_contentful_paint', {
                                'event_category': 'Performance',
                                'value': Math.round(lastEntry.renderTime || lastEntry.loadTime)
                            });
                        }
                    });
                    
                    observer.observe({ entryTypes: ['largest-contentful-paint'] });
                } catch (e) {
                    // PerformanceObserver not supported
                }
            }
        }
    }
    
    // Monitor Core Web Vitals
    function monitorCoreWebVitals() {
        if ('PerformanceObserver' in window) {
            // First Input Delay (FID)
            try {
                const fidObserver = new PerformanceObserver((list) => {
                    const entries = list.getEntries();
                    entries.forEach(entry => {
                        if (typeof gtag !== 'undefined') {
                            gtag('event', 'first_input_delay', {
                                'event_category': 'Performance',
                                'value': Math.round(entry.processingStart - entry.startTime)
                            });
                        }
                    });
                });
                
                fidObserver.observe({ entryTypes: ['first-input'] });
            } catch (e) {
                // Not supported
            }
            
            // Cumulative Layout Shift (CLS)
            try {
                let clsValue = 0;
                const clsObserver = new PerformanceObserver((list) => {
                    const entries = list.getEntries();
                    entries.forEach(entry => {
                        if (!entry.hadRecentInput) {
                            clsValue += entry.value;
                        }
                    });
                    
                    // Send CLS on page unload
                    window.addEventListener('beforeunload', () => {
                        if (typeof gtag !== 'undefined' && clsValue > 0) {
                            gtag('event', 'cumulative_layout_shift', {
                                'event_category': 'Performance',
                                'value': Math.round(clsValue * 1000) / 1000
                            });
                        }
                    });
                });
                
                clsObserver.observe({ entryTypes: ['layout-shift'] });
            } catch (e) {
                // Not supported
            }
        }
    }
    
    // Monitor memory usage (if available)
    function monitorMemoryUsage() {
        if ('memory' in performance) {
            const memory = performance.memory;
            
            // Log if memory usage is high
            const memoryUsageMB = memory.usedJSHeapSize / 1048576;
            const memoryLimitMB = memory.jsHeapSizeLimit / 1048576;
            
            if (memoryUsageMB > memoryLimitMB * 0.8) {
                if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
                    console.warn('High memory usage detected:', {
                        used: Math.round(memoryUsageMB) + ' MB',
                        limit: Math.round(memoryLimitMB) + ' MB'
                    });
                }
            }
        }
    }
    
    // Initialize
    window.addEventListener('load', () => {
        measurePageLoad();
        measureResourceLoading();
        monitorCoreWebVitals();
        
        // Monitor memory periodically
        setInterval(monitorMemoryUsage, 30000); // Every 30 seconds
    });
})();

