// User Engagement Features
(function() {
    'use strict';
    
    // Tool usage counter
    function trackToolUsage(toolId) {
        const key = `tool_usage_${toolId}`;
        const today = new Date().toDateString();
        const stored = localStorage.getItem(key);
        
        if (stored) {
            const data = JSON.parse(stored);
            if (data.date === today) {
                data.count++;
            } else {
                data.date = today;
                data.count = 1;
            }
            localStorage.setItem(key, JSON.stringify(data));
        } else {
            localStorage.setItem(key, JSON.stringify({ date: today, count: 1 }));
        }
        
        // Send to analytics
        if (typeof gtag !== 'undefined') {
            gtag('event', 'tool_used', {
                'event_category': 'Engagement',
                'event_label': toolId,
                'value': 1
            });
        }
    }
    
    // Time on page tracking
    let startTime = Date.now();
    let timeOnPage = 0;
    
    function trackTimeOnPage() {
        timeOnPage = Math.floor((Date.now() - startTime) / 1000);
        
        if (timeOnPage > 30 && timeOnPage % 30 === 0) {
            if (typeof gtag !== 'undefined') {
                gtag('event', 'time_on_page', {
                    'event_category': 'Engagement',
                    'value': timeOnPage
                });
            }
        }
    }
    
    setInterval(trackTimeOnPage, 1000);
    
    // Scroll depth tracking
    let maxScroll = 0;
    const scrollMilestones = [25, 50, 75, 100];
    const reachedMilestones = new Set();
    
    function trackScrollDepth() {
        const scrollPercent = Math.round(
            ((window.scrollY + window.innerHeight) / document.documentElement.scrollHeight) * 100
        );
        
        if (scrollPercent > maxScroll) {
            maxScroll = scrollPercent;
            
            scrollMilestones.forEach(milestone => {
                if (scrollPercent >= milestone && !reachedMilestones.has(milestone)) {
                    reachedMilestones.add(milestone);
                    
                    if (typeof gtag !== 'undefined') {
                        gtag('event', 'scroll_depth', {
                            'event_category': 'Engagement',
                            'event_label': `${milestone}%`,
                            'value': milestone
                        });
                    }
                }
            });
        }
    }
    
    window.addEventListener('scroll', trackScrollDepth, { passive: true });
    
    // Auto-detect tool usage
    document.addEventListener('DOMContentLoaded', () => {
        const path = window.location.pathname;
        const toolMatch = path.match(/tools\/([^\/]+)\.html/);
        
        if (toolMatch) {
            const toolId = toolMatch[1];
            trackToolUsage(toolId);
        }
    });
    
    // Exit intent detection (for newsletter signup)
    let exitIntentShown = false;
    document.addEventListener('mouseout', (e) => {
        if (!exitIntentShown && e.clientY < 0) {
            exitIntentShown = true;
            
            // Could show newsletter signup modal here
            if (typeof gtag !== 'undefined') {
                gtag('event', 'exit_intent', {
                    'event_category': 'Engagement'
                });
            }
        }
    });
    
    // Share button clicks
    document.addEventListener('click', (e) => {
        if (e.target.closest('.share-button') || e.target.closest('[data-share]')) {
            const platform = e.target.dataset.share || e.target.closest('[data-share]')?.dataset.share;
            
            if (typeof gtag !== 'undefined' && platform) {
                gtag('event', 'share', {
                    'method': platform,
                    'content_type': 'tool',
                    'item_id': window.location.pathname
                });
            }
        }
    });
})();

