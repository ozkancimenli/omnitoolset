// Usage Statistics Dashboard - Show user their tool usage stats
(function() {
    'use strict';
    
    function getUsageStats() {
        const recent = JSON.parse(localStorage.getItem('omnitoolset_recent') || '[]');
        const favorites = JSON.parse(localStorage.getItem('omnitoolset_favorites') || '[]');
        
        // Get tool usage counts
        const usageCounts = {};
        const allKeys = Object.keys(localStorage);
        
        allKeys.forEach(key => {
            if (key.startsWith('tool_usage_')) {
                const toolId = key.replace('tool_usage_', '');
                const data = JSON.parse(localStorage.getItem(key) || '{}');
                usageCounts[toolId] = data.count || 0;
            }
        });
        
        // Calculate totals
        const totalToolsUsed = Object.keys(usageCounts).length;
        const totalUsageCount = Object.values(usageCounts).reduce((a, b) => a + b, 0);
        const mostUsedTool = Object.entries(usageCounts)
            .sort((a, b) => b[1] - a[1])[0];
        
        // Get category usage
        const categoryUsage = {};
        if (typeof tools !== 'undefined') {
            Object.keys(usageCounts).forEach(toolId => {
                const tool = tools.find(t => t.id === toolId);
                if (tool) {
                    categoryUsage[tool.category] = (categoryUsage[tool.category] || 0) + usageCounts[toolId];
                }
            });
        }
        
        return {
            totalToolsUsed,
            totalUsageCount,
            mostUsedTool: mostUsedTool ? {
                id: mostUsedTool[0],
                count: mostUsedTool[1],
                name: typeof tools !== 'undefined' ? tools.find(t => t.id === mostUsedTool[0])?.title : mostUsedTool[0]
            } : null,
            categoryUsage,
            recentCount: recent.length,
            favoritesCount: favorites.length
        };
    }
    
    function showUsageStats() {
        const stats = getUsageStats();
        
        const dashboard = document.createElement('div');
        dashboard.id = 'usage-stats-dashboard';
        dashboard.style.cssText = `
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            background: var(--bg-card);
            border: 2px solid var(--border-color);
            border-radius: 20px;
            padding: 2rem;
            z-index: 10000;
            max-width: 600px;
            max-height: 80vh;
            overflow-y: auto;
            box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
        `;
        
        dashboard.innerHTML = `
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.5rem;">
                <h2 style="margin: 0; color: var(--text-primary);">📊 Your Usage Statistics</h2>
                <button onclick="this.closest('#usage-stats-dashboard').remove()" style="
                    background: transparent;
                    border: none;
                    color: var(--text-secondary);
                    font-size: 1.5rem;
                    cursor: pointer;
                    padding: 0.5rem;
                ">×</button>
            </div>
            <div style="display: grid; gap: 1.5rem;">
                <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 1rem;">
                    <div style="
                        background: var(--bg-hover);
                        padding: 1.5rem;
                        border-radius: 12px;
                        text-align: center;
                    ">
                        <div style="font-size: 2.5rem; margin-bottom: 0.5rem;">🛠️</div>
                        <div style="font-size: 2rem; font-weight: 700; color: var(--primary-color);">${stats.totalToolsUsed}</div>
                        <div style="color: var(--text-secondary); font-size: 0.9rem;">Tools Used</div>
                    </div>
                    <div style="
                        background: var(--bg-hover);
                        padding: 1.5rem;
                        border-radius: 12px;
                        text-align: center;
                    ">
                        <div style="font-size: 2.5rem; margin-bottom: 0.5rem;">📈</div>
                        <div style="font-size: 2rem; font-weight: 700; color: var(--primary-color);">${stats.totalUsageCount}</div>
                        <div style="color: var(--text-secondary); font-size: 0.9rem;">Total Uses</div>
                    </div>
                </div>
                ${stats.mostUsedTool ? `
                    <div style="
                        background: var(--bg-hover);
                        padding: 1.5rem;
                        border-radius: 12px;
                    ">
                        <div style="color: var(--text-secondary); font-size: 0.9rem; margin-bottom: 0.5rem;">Most Used Tool</div>
                        <div style="font-size: 1.2rem; font-weight: 600; color: var(--text-primary);">${stats.mostUsedTool.name}</div>
                        <div style="color: var(--text-secondary); font-size: 0.85rem; margin-top: 0.25rem;">Used ${stats.mostUsedTool.count} times</div>
                    </div>
                ` : ''}
                <div style="
                    background: var(--bg-hover);
                    padding: 1.5rem;
                    border-radius: 12px;
                ">
                    <div style="color: var(--text-secondary); font-size: 0.9rem; margin-bottom: 1rem;">Category Usage</div>
                    <div style="display: grid; gap: 0.75rem;">
                        ${Object.entries(stats.categoryUsage)
                            .sort((a, b) => b[1] - a[1])
                            .slice(0, 5)
                            .map(([category, count]) => `
                                <div style="display: flex; justify-content: space-between; align-items: center;">
                                    <span style="color: var(--text-primary);">${category}</span>
                                    <div style="display: flex; align-items: center; gap: 0.5rem;">
                                        <div style="
                                            width: 100px;
                                            height: 8px;
                                            background: var(--border-color);
                                            border-radius: 4px;
                                            overflow: hidden;
                                        ">
                                            <div style="
                                                width: ${(count / stats.totalUsageCount) * 100}%;
                                                height: 100%;
                                                background: var(--primary-color);
                                                transition: width 0.3s;
                                            "></div>
                                        </div>
                                        <span style="color: var(--text-secondary); font-size: 0.9rem; min-width: 30px; text-align: right;">${count}</span>
                                    </div>
                                </div>
                            `).join('')}
                    </div>
                </div>
                <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 1rem;">
                    <div style="
                        background: var(--bg-hover);
                        padding: 1rem;
                        border-radius: 12px;
                        text-align: center;
                    ">
                        <div style="font-size: 1.5rem; margin-bottom: 0.5rem;">⭐</div>
                        <div style="font-size: 1.5rem; font-weight: 700; color: var(--primary-color);">${stats.favoritesCount}</div>
                        <div style="color: var(--text-secondary); font-size: 0.85rem;">Favorites</div>
                    </div>
                    <div style="
                        background: var(--bg-hover);
                        padding: 1rem;
                        border-radius: 12px;
                        text-align: center;
                    ">
                        <div style="font-size: 1.5rem; margin-bottom: 0.5rem;">🕒</div>
                        <div style="font-size: 1.5rem; font-weight: 700; color: var(--primary-color);">${stats.recentCount}</div>
                        <div style="color: var(--text-secondary); font-size: 0.85rem;">Recent</div>
                    </div>
                </div>
            </div>
        `;
        
        document.body.appendChild(dashboard);
        
        // Close handlers
        const closeHandler = (e) => {
            if (e.key === 'Escape' || (e.type === 'click' && !dashboard.contains(e.target))) {
                dashboard.remove();
                document.removeEventListener('keydown', closeHandler);
                document.removeEventListener('click', closeHandler);
            }
        };
        
        setTimeout(() => {
            document.addEventListener('keydown', closeHandler);
            document.addEventListener('click', closeHandler);
        }, 100);
    }
    
    // Add to quick actions menu
    if (window.addQuickAction) {
        window.addQuickAction({
            icon: '📊',
            label: 'Usage Stats',
            action: showUsageStats
        });
    }
    
    // Export
    window.showUsageStats = showUsageStats;
    window.getUsageStats = getUsageStats;
})();

