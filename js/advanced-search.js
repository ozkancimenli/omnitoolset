// Advanced Search with Filters
(function() {
    'use strict';
    
    function createAdvancedSearch() {
        const searchInput = document.getElementById('searchInput');
        if (!searchInput || typeof tools === 'undefined') return;
        
        // Create filter panel
        const filterPanel = document.createElement('div');
        filterPanel.id = 'search-filters';
        filterPanel.style.cssText = `
            position: absolute;
            top: 100%;
            left: 0;
            right: 0;
            background: var(--bg-card);
            border: 1px solid var(--border-color);
            border-radius: 12px;
            margin-top: 0.5rem;
            padding: 1rem;
            z-index: 1000;
            display: none;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
        `;
        
        const categories = Array.from(new Set(tools.map(t => t.category))).sort();
        
        filterPanel.innerHTML = `
            <div style="margin-bottom: 1rem;">
                <div style="color: var(--text-secondary); font-size: 0.85rem; margin-bottom: 0.5rem;">Filter by Category:</div>
                <div style="display: flex; flex-wrap: wrap; gap: 0.5rem;">
                    ${categories.map(cat => `
                        <button class="category-filter-btn" data-category="${cat}" style="
                            padding: 0.5rem 1rem;
                            background: var(--bg-hover);
                            border: 1px solid var(--border-color);
                            border-radius: 8px;
                            color: var(--text-primary);
                            cursor: pointer;
                            font-size: 0.85rem;
                            transition: all 0.2s;
                        ">${cat}</button>
                    `).join('')}
                </div>
            </div>
            <div style="display: flex; gap: 0.5rem; align-items: center;">
                <label style="display: flex; align-items: center; gap: 0.5rem; color: var(--text-primary); cursor: pointer; font-size: 0.9rem;">
                    <input type="checkbox" id="filter-favorites" style="width: 18px; height: 18px; cursor: pointer;">
                    <span>Favorites Only</span>
                </label>
                <label style="display: flex; align-items: center; gap: 0.5rem; color: var(--text-primary); cursor: pointer; font-size: 0.9rem; margin-left: 1rem;">
                    <input type="checkbox" id="filter-recent" style="width: 18px; height: 18px; cursor: pointer;">
                    <span>Recent Only</span>
                </label>
            </div>
        `;
        
        searchInput.parentElement.style.position = 'relative';
        searchInput.parentElement.appendChild(filterPanel);
        
        let selectedCategory = null;
        let favoritesOnly = false;
        let recentOnly = false;
        
        // Category filter buttons
        filterPanel.querySelectorAll('.category-filter-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                if (selectedCategory === btn.dataset.category) {
                    selectedCategory = null;
                    btn.style.background = 'var(--bg-hover)';
                    btn.style.borderColor = 'var(--border-color)';
                } else {
                    selectedCategory = btn.dataset.category;
                    filterPanel.querySelectorAll('.category-filter-btn').forEach(b => {
                        b.style.background = 'var(--bg-hover)';
                        b.style.borderColor = 'var(--border-color)';
                    });
                    btn.style.background = 'var(--primary-color)';
                    btn.style.color = 'white';
                    btn.style.borderColor = 'var(--primary-color)';
                }
                performSearch();
            });
        });
        
        // Favorites filter
        document.getElementById('filter-favorites').addEventListener('change', (e) => {
            favoritesOnly = e.target.checked;
            if (favoritesOnly) {
                document.getElementById('filter-recent').checked = false;
                recentOnly = false;
            }
            performSearch();
        });
        
        // Recent filter
        document.getElementById('filter-recent').addEventListener('change', (e) => {
            recentOnly = e.target.checked;
            if (recentOnly) {
                document.getElementById('filter-favorites').checked = false;
                favoritesOnly = false;
            }
            performSearch();
        });
        
        function performSearch() {
            const query = searchInput.value.toLowerCase().trim();
            let filtered = tools;
            
            // Text search
            if (query) {
                filtered = filtered.filter(tool => 
                    tool.title.toLowerCase().includes(query) ||
                    tool.description.toLowerCase().includes(query) ||
                    tool.category.toLowerCase().includes(query)
                );
            }
            
            // Category filter
            if (selectedCategory) {
                filtered = filtered.filter(tool => tool.category === selectedCategory);
            }
            
            // Favorites filter
            if (favoritesOnly) {
                const favorites = JSON.parse(localStorage.getItem('omnitoolset_favorites') || '[]');
                filtered = filtered.filter(tool => favorites.includes(tool.id));
            }
            
            // Recent filter
            if (recentOnly) {
                const recent = JSON.parse(localStorage.getItem('omnitoolset_recent') || '[]');
                filtered = filtered.filter(tool => recent.includes(tool.id));
            }
            
            // Render results
            const grid = document.getElementById('toolsGrid') || document.getElementById('allToolsGrid');
            if (grid && typeof renderTools === 'function') {
                renderTools(filtered);
            }
        }
        
        // Toggle filter panel
        const filterToggle = document.createElement('button');
        filterToggle.innerHTML = '🔍 Filters';
        filterToggle.style.cssText = `
            margin-left: 0.5rem;
            padding: 0.5rem 1rem;
            background: var(--bg-hover);
            border: 1px solid var(--border-color);
            border-radius: 8px;
            color: var(--text-primary);
            cursor: pointer;
            font-size: 0.85rem;
            transition: all 0.2s;
        `;
        
        filterToggle.addEventListener('click', () => {
            const isVisible = filterPanel.style.display !== 'none';
            filterPanel.style.display = isVisible ? 'none' : 'block';
            filterToggle.style.background = isVisible ? 'var(--bg-hover)' : 'var(--primary-color)';
            filterToggle.style.color = isVisible ? 'var(--text-primary)' : 'white';
        });
        
        searchInput.parentElement.insertBefore(filterToggle, searchInput.nextSibling);
        
        // Update search to use filters
        const originalSearch = searchInput.oninput;
        searchInput.addEventListener('input', () => {
            performSearch();
        });
    }
    
    // Initialize
    document.addEventListener('DOMContentLoaded', () => {
        setTimeout(createAdvancedSearch, 1500);
    });
})();




