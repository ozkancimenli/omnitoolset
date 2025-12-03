// Social Proof & Trust Signals
(function() {
    'use strict';
    
    // Tool usage counter display
    function displayUsageCounters() {
        const toolCards = document.querySelectorAll('.tool-card');
        
        toolCards.forEach(card => {
            const toolLink = card.getAttribute('href') || card.querySelector('a')?.getAttribute('href');
            if (!toolLink) return;
            
            const toolMatch = toolLink.match(/tools\/([^\/]+)\.html/);
            if (!toolMatch) return;
            
            const toolId = toolMatch[1];
            const key = `tool_usage_${toolId}`;
            const stored = localStorage.getItem(key);
            
            if (stored) {
                const data = JSON.parse(stored);
                const count = data.count || 0;
                
                if (count > 0) {
                    const badge = document.createElement('span');
                    badge.className = 'usage-badge';
                    badge.style.cssText = `
                        position: absolute;
                        bottom: 0.5rem;
                        right: 0.5rem;
                        background: rgba(99, 102, 241, 0.9);
                        color: white;
                        padding: 0.25rem 0.5rem;
                        border-radius: 12px;
                        font-size: 0.75rem;
                        font-weight: 600;
                        z-index: 5;
                    `;
                    badge.textContent = `Used ${count.toLocaleString()}x`;
                    card.style.position = 'relative';
                    card.appendChild(badge);
                }
            }
        });
    }
    
    // Add "Recently used by others" section
    function addSocialProofSection() {
        const path = window.location.pathname;
        if (!path.includes('/tools/')) return;
        
        const toolMatch = path.match(/tools\/([^\/]+)\.html/);
        if (!toolMatch) return;
        
        const toolId = toolMatch[1];
        
        // Get usage stats from localStorage (in real app, this would be from API)
        const allToolStats = [];
        for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            if (key && key.startsWith('tool_usage_')) {
                const data = JSON.parse(localStorage.getItem(key));
                if (data && data.count > 0) {
                    allToolStats.push({
                        id: key.replace('tool_usage_', ''),
                        count: data.count
                    });
                }
            }
        }
        
        // Sort by usage
        allToolStats.sort((a, b) => b.count - a.count);
        
        if (allToolStats.length > 0) {
            const section = document.createElement('div');
            section.className = 'social-proof-section';
            section.style.cssText = `
                margin: 2rem 0;
                padding: 1.5rem;
                background: var(--bg-card);
                border-radius: 12px;
                border: 1px solid var(--border-color);
                text-align: center;
            `;
            
            const totalUsage = allToolStats.reduce((sum, stat) => sum + stat.count, 0);
            
            section.innerHTML = `
                <h3 style="color: var(--text-primary); margin-bottom: 0.5rem; font-size: 1.2rem;">
                    ✨ Trusted by Users
                </h3>
                <p style="color: var(--text-secondary); font-size: 1rem; margin: 0;">
                    Our tools have been used <strong style="color: var(--primary-color);">${totalUsage.toLocaleString()}+</strong> times
                </p>
            `;
            
            const footer = document.querySelector('footer');
            if (footer) {
                footer.parentNode.insertBefore(section, footer);
            }
        }
    }
    
    // Add trust badges
    function addTrustBadges() {
        const trustSection = document.createElement('div');
        trustSection.className = 'trust-badges';
        trustSection.style.cssText = `
            display: flex;
            justify-content: center;
            align-items: center;
            gap: 1.5rem;
            margin: 2rem 0;
            flex-wrap: wrap;
        `;
        
        trustSection.innerHTML = `
            <div style="text-align: center;">
                <div style="font-size: 2rem; margin-bottom: 0.25rem;">🔒</div>
                <div style="font-size: 0.85rem; color: var(--text-secondary);">100% Secure</div>
            </div>
            <div style="text-align: center;">
                <div style="font-size: 2rem; margin-bottom: 0.25rem;">⚡</div>
                <div style="font-size: 0.85rem; color: var(--text-secondary);">Instant Processing</div>
            </div>
            <div style="text-align: center;">
                <div style="font-size: 2rem; margin-bottom: 0.25rem;">🚫</div>
                <div style="font-size: 0.85rem; color: var(--text-secondary);">No Watermarks</div>
            </div>
            <div style="text-align: center;">
                <div style="font-size: 2rem; margin-bottom: 0.25rem;">🌐</div>
                <div style="font-size: 0.85rem; color: var(--text-secondary);">Works in Browser</div>
            </div>
        `;
        
        // Add to homepage hero section if exists
        const hero = document.querySelector('.hero-section');
        if (hero) {
            hero.appendChild(trustSection);
        }
    }
    
    // Initialize
    document.addEventListener('DOMContentLoaded', () => {
        displayUsageCounters();
        addSocialProofSection();
        addTrustBadges();
    });
})();

