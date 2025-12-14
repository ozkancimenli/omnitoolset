// Advanced Analytics and User Behavior Tracking
(function() {
    'use strict';
    
    // Track page views
    function trackPageView() {
        if (typeof gtag !== 'undefined') {
            gtag('config', 'G-1WF6SNHNXN', {
                'page_path': window.location.pathname,
                'page_title': document.title
            });
        }
    }
    
    // Track tool usage
    function trackToolUsage(toolId, toolName, category) {
        if (typeof gtag !== 'undefined') {
            gtag('event', 'tool_used', {
                'tool_id': toolId,
                'tool_name': toolName,
                'tool_category': category,
                'event_category': 'Tool Usage',
                'event_label': toolName
            });
        }
    }
    
    // Track download events
    function trackDownload(fileType, fileName) {
        if (typeof gtag !== 'undefined') {
            gtag('event', 'file_download', {
                'file_type': fileType,
                'file_name': fileName,
                'event_category': 'Downloads'
            });
        }
    }
    
    // Track time on page
    let startTime = Date.now();
    window.addEventListener('beforeunload', () => {
        const timeOnPage = Math.round((Date.now() - startTime) / 1000);
        if (typeof gtag !== 'undefined' && timeOnPage > 5) {
            gtag('event', 'time_on_page', {
                'value': timeOnPage,
                'event_category': 'Engagement',
                'non_interaction': true
            });
        }
    });
    
    // Track scroll depth
    let maxScroll = 0;
    const scrollDepths = [25, 50, 75, 100];
    const trackedDepths = new Set();
    
    window.addEventListener('scroll', () => {
        const scrollPercent = Math.round(
            (window.scrollY / (document.documentElement.scrollHeight - window.innerHeight)) * 100
        );
        
        if (scrollPercent > maxScroll) {
            maxScroll = scrollPercent;
            
            scrollDepths.forEach(depth => {
                if (scrollPercent >= depth && !trackedDepths.has(depth)) {
                    trackedDepths.add(depth);
                    if (typeof gtag !== 'undefined') {
                        gtag('event', 'scroll_depth', {
                            'value': depth,
                            'event_category': 'Engagement',
                            'non_interaction': true
                        });
                    }
                }
            });
        }
    }, { passive: true });
    
    // Track clicks on tool cards
    document.addEventListener('click', (e) => {
        const toolCard = e.target.closest('.tool-card');
        if (toolCard) {
            const toolId = toolCard.dataset.toolId || toolCard.href?.match(/tools\/([^\/]+)\.html/)?.[1];
            const toolTitle = toolCard.querySelector('.tool-title')?.textContent || '';
            const toolCategory = toolCard.querySelector('.tool-category')?.textContent || '';
            
            if (toolId) {
                trackToolUsage(toolId, toolTitle, toolCategory);
            }
        }
    });
    
    // Track external link clicks
    document.addEventListener('click', (e) => {
        const link = e.target.closest('a[href^="http"]');
        if (link && !link.href.includes(window.location.hostname)) {
            if (typeof gtag !== 'undefined') {
                gtag('event', 'click', {
                    'event_category': 'Outbound',
                    'event_label': link.href,
                    'transport_type': 'beacon'
                });
            }
        }
    });
    
    // Initialize
    document.addEventListener('DOMContentLoaded', () => {
        trackPageView();
    });
    
    // Export functions
    window.trackToolUsage = trackToolUsage;
    window.trackDownload = trackDownload;
})();



