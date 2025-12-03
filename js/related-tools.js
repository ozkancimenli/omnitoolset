// Related Tools System - Shows similar tools on each tool page
function getRelatedTools(currentToolId, currentCategory, limit = 6) {
    if (typeof tools === 'undefined') return [];
    
    const currentTool = tools.find(t => t.id === currentToolId || t.page.includes(currentToolId));
    if (!currentTool) return [];
    
    // Find tools in same category, excluding current tool
    let related = tools.filter(t => 
        t.category === currentCategory && 
        t.id !== currentToolId &&
        t.page !== currentTool.page
    );
    
    // If not enough in same category, add from other categories
    if (related.length < limit) {
        const otherTools = tools.filter(t => 
            t.id !== currentToolId &&
            t.page !== currentTool.page &&
            !related.some(r => r.id === t.id)
        );
        related = [...related, ...otherTools].slice(0, limit);
    }
    
    // Shuffle for variety
    return related.sort(() => Math.random() - 0.5).slice(0, limit);
}

function renderRelatedTools(currentToolId, currentCategory) {
    const relatedTools = getRelatedTools(currentToolId, currentCategory);
    
    if (relatedTools.length === 0) return;
    
    const container = document.createElement('div');
    container.className = 'related-tools-section';
    container.style.cssText = 'margin: 3rem 0; padding: 2rem; background: var(--bg-card); border-radius: 20px; border: 1px solid var(--border-color);';
    
    container.innerHTML = `
        <h3 style="margin-bottom: 1.5rem; color: var(--text-primary); font-size: 1.5rem; text-align: center;">
            🔗 Related Tools
        </h3>
        <div class="tools-grid" style="grid-template-columns: repeat(auto-fill, minmax(200px, 1fr)); gap: 1rem;">
            ${relatedTools.map(tool => `
                <a href="/${tool.page}" class="tool-card" style="text-decoration: none; color: inherit;">
                    <span class="tool-icon">${tool.icon}</span>
                    <h4 style="font-size: 1rem; margin: 0.5rem 0; color: var(--text-primary);">${tool.title}</h4>
                    <span class="tool-category">${tool.category}</span>
                </a>
            `).join('')}
        </div>
    `;
    
    // Insert before footer
    const footer = document.querySelector('footer');
    if (footer) {
        footer.parentNode.insertBefore(container, footer);
    } else {
        document.body.appendChild(container);
    }
}

// Auto-detect current tool and render related tools
document.addEventListener('DOMContentLoaded', function() {
    const path = window.location.pathname;
    const toolMatch = path.match(/tools\/([^\/]+)\.html/);
    
    if (toolMatch) {
        const toolSlug = toolMatch[1];
        const toolId = toolSlug.replace(/-/g, '-');
        
        // Find tool in database
        if (typeof tools !== 'undefined') {
            const currentTool = tools.find(t => 
                t.page.includes(toolSlug) || 
                t.id === toolId ||
                t.id === toolSlug
            );
            
            if (currentTool) {
                renderRelatedTools(currentTool.id, currentTool.category);
            }
        }
    }
});

