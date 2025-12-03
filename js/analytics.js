// Google Analytics 4 Configuration
// GA4 Measurement ID: G-1WF6SNHNXN

(function() {
    // Only load analytics in production
    if (window.location.hostname === 'www.omnitoolset.com' || window.location.hostname === 'omnitoolset.com') {
        // GA4 will be added via gtag.js in HTML
        // This file can be used for custom event tracking
        
        // Track tool usage
        function trackToolUsage(toolName) {
            if (typeof gtag !== 'undefined') {
                gtag('event', 'tool_used', {
                    'tool_name': toolName,
                    'page_path': window.location.pathname
                });
            }
        }
        
        // Track search queries
        function trackSearch(query) {
            if (typeof gtag !== 'undefined') {
                gtag('event', 'search', {
                    'search_term': query,
                    'page_path': window.location.pathname
                });
            }
        }
        
        // Track category filter
        function trackCategoryFilter(category) {
            if (typeof gtag !== 'undefined') {
                gtag('event', 'category_filter', {
                    'category': category,
                    'page_path': window.location.pathname
                });
            }
        }
        
        // Track social shares
        function trackSocialShare(platform, url) {
            if (typeof gtag !== 'undefined') {
                gtag('event', 'share', {
                    'method': platform,
                    'content_type': 'page',
                    'item_id': url
                });
            }
        }
        
        // Expose functions globally
        window.trackToolUsage = trackToolUsage;
        window.trackSearch = trackSearch;
        window.trackCategoryFilter = trackCategoryFilter;
        window.trackSocialShare = trackSocialShare;
        
        // Track page views
        if (typeof gtag !== 'undefined') {
            gtag('event', 'page_view', {
                'page_path': window.location.pathname,
                'page_title': document.title
            });
        }
    }
})();

