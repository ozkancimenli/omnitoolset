// Smart Tool Recommendations Based on Usage Patterns
(function() {
    'use strict';
    
    function getToolRecommendations(currentToolId) {
        if (typeof tools === 'undefined') return [];
        
        const currentTool = tools.find(t => t.id === currentToolId || t.page.includes(currentToolId));
        if (!currentTool) return [];
        
        // Get user's tool usage history
        const usageHistory = JSON.parse(localStorage.getItem('omnitoolset_recent') || '[]');
        const favoriteIds = JSON.parse(localStorage.getItem('omnitoolset_favorites') || '[]');
        
        // Find tools in same category
        const sameCategory = tools
            .filter(t => 
                t.category === currentTool.category && 
                t.id !== currentToolId
            )
            .slice(0, 3);
        
        // Find tools that are often used together (based on usage patterns)
        const relatedTools = [];
        if (usageHistory.length > 0) {
            // Find tools that appear together in usage history
            const currentIndex = usageHistory.indexOf(currentToolId);
            if (currentIndex > 0) {
                const beforeTool = tools.find(t => t.id === usageHistory[currentIndex - 1]);
                if (beforeTool && beforeTool.category === currentTool.category) {
                    relatedTools.push(beforeTool);
                }
            }
        }
        
        // Combine and deduplicate
        const recommendations = [...sameCategory, ...relatedTools]
            .filter((tool, index, self) => 
                index === self.findIndex(t => t.id === tool.id)
            )
            .slice(0, 6);
        
        // If not enough, add popular tools
        if (recommendations.length < 6) {
            const popular = tools
                .filter(t => 
                    t.id !== currentToolId &&
                    !recommendations.some(r => r.id === t.id) &&
                    favoriteIds.includes(t.id)
                )
                .slice(0, 6 - recommendations.length);
            recommendations.push(...popular);
        }
        
        return recommendations;
    }
    
    function renderRecommendations(currentToolId) {
        const recommendations = getToolRecommendations(currentToolId);
        if (recommendations.length === 0) return;
        
        // Check if already rendered
        if (document.getElementById('smart-recommendations')) return;
        
        const section = document.createElement('div');
        section.id = 'smart-recommendations';
        section.style.cssText = `
            margin: 3rem 0;
            padding: 2rem;
            background: linear-gradient(135deg, var(--bg-card), var(--bg-hover));
            border-radius: 20px;
            border: 1px solid var(--border-color);
        `;
        
        section.innerHTML = `
            <h3 style="margin-bottom: 1.5rem; color: var(--text-primary); font-size: 1.5rem; text-align: center;">
                🎯 Recommended for You
            </h3>
            <div class="tools-grid" style="grid-template-columns: repeat(auto-fill, minmax(200px, 1fr)); gap: 1rem;">
                ${recommendations.map(tool => `
                    <a href="/${tool.page}" class="tool-card" style="
                        text-decoration: none;
                        color: inherit;
                        background: var(--bg-card);
                        border: 1px solid var(--border-color);
                        border-radius: 12px;
                        padding: 1.5rem;
                        transition: all 0.3s;
                        display: flex;
                        flex-direction: column;
                        align-items: center;
                        text-align: center;
                    " onmouseover="this.style.transform='translateY(-5px)'; this.style.borderColor='var(--primary-color)'; this.style.boxShadow='0 8px 20px rgba(99, 102, 241, 0.2)';" onmouseout="this.style.transform='translateY(0)'; this.style.borderColor='var(--border-color)'; this.style.boxShadow='none';">
                        <span style="font-size: 2.5rem; margin-bottom: 0.5rem;">${tool.icon}</span>
                        <h4 style="font-size: 1rem; margin: 0.5rem 0; color: var(--text-primary);">${tool.title}</h4>
                        <span style="font-size: 0.85rem; color: var(--text-secondary);">${tool.category}</span>
                    </a>
                `).join('')}
            </div>
        `;
        
        // Insert before footer
        const footer = document.querySelector('footer');
        if (footer) {
            footer.parentNode.insertBefore(section, footer);
        } else {
            const main = document.querySelector('main');
            if (main) {
                main.appendChild(section);
            }
        }
    }
    
    // Auto-detect current tool and show recommendations
    document.addEventListener('DOMContentLoaded', () => {
        const path = window.location.pathname;
        const toolMatch = path.match(/tools\/([^\/]+)\.html/);
        
        if (toolMatch) {
            const toolSlug = toolMatch[1];
            
            // Wait for tools array
            function tryRender() {
                if (typeof tools !== 'undefined' && tools.length > 0) {
                    const currentTool = tools.find(t => 
                        t.page.includes(toolSlug) || 
                        t.id === toolSlug ||
                        t.id === toolSlug.replace(/-/g, '')
                    );
                    
                    if (currentTool) {
                        setTimeout(() => renderRecommendations(currentTool.id), 1000);
                    }
                } else {
                    setTimeout(tryRender, 100);
                }
            }
            
            tryRender();
        }
    });
})();



