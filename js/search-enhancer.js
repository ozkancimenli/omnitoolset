// Enhanced Search Functionality
(function() {
    'use strict';
    
    // Search suggestions/autocomplete
    function initSearchSuggestions() {
        const searchInput = document.getElementById('searchInput');
        if (!searchInput || typeof tools === 'undefined') return;
        
        const suggestionsContainer = document.createElement('div');
        suggestionsContainer.id = 'searchSuggestions';
        suggestionsContainer.style.cssText = `
            position: absolute;
            top: 100%;
            left: 0;
            right: 0;
            background: var(--bg-card);
            border: 1px solid var(--border-color);
            border-radius: 12px;
            margin-top: 0.5rem;
            max-height: 300px;
            overflow-y: auto;
            z-index: 1000;
            display: none;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
        `;
        
        searchInput.parentElement.style.position = 'relative';
        searchInput.parentElement.appendChild(suggestionsContainer);
        
        let selectedIndex = -1;
        
        searchInput.addEventListener('input', (e) => {
            const query = e.target.value.trim().toLowerCase();
            
            if (query.length < 2) {
                suggestionsContainer.style.display = 'none';
                return;
            }
            
            // Find matching tools
            const matches = tools.filter(tool => 
                tool.title.toLowerCase().includes(query) ||
                tool.description.toLowerCase().includes(query) ||
                tool.category.toLowerCase().includes(query)
            ).slice(0, 5);
            
            if (matches.length === 0) {
                suggestionsContainer.style.display = 'none';
                return;
            }
            
            suggestionsContainer.innerHTML = matches.map((tool, index) => `
                <a href="/${tool.page}" class="search-suggestion" 
                   data-index="${index}"
                   style="display: block; padding: 0.75rem 1rem; text-decoration: none; color: var(--text-primary); border-bottom: 1px solid var(--border-color); transition: background 0.2s;"
                   onmouseover="this.style.background='var(--bg-hover)'"
                   onmouseout="this.style.background='transparent'">
                    <div style="display: flex; align-items: center; gap: 0.75rem;">
                        <span style="font-size: 1.5rem;">${tool.icon}</span>
                        <div style="flex: 1;">
                            <div style="font-weight: 600;">${tool.title}</div>
                            <div style="font-size: 0.85rem; color: var(--text-secondary);">${tool.category}</div>
                        </div>
                    </div>
                </a>
            `).join('');
            
            suggestionsContainer.style.display = 'block';
            selectedIndex = -1;
        });
        
        // Keyboard navigation
        searchInput.addEventListener('keydown', (e) => {
            const suggestions = suggestionsContainer.querySelectorAll('.search-suggestion');
            
            if (e.key === 'ArrowDown') {
                e.preventDefault();
                selectedIndex = Math.min(selectedIndex + 1, suggestions.length - 1);
                updateSelection(suggestions);
            } else if (e.key === 'ArrowUp') {
                e.preventDefault();
                selectedIndex = Math.max(selectedIndex - 1, -1);
                updateSelection(suggestions);
            } else if (e.key === 'Enter' && selectedIndex >= 0) {
                e.preventDefault();
                suggestions[selectedIndex].click();
            } else if (e.key === 'Escape') {
                suggestionsContainer.style.display = 'none';
            }
        });
        
        function updateSelection(suggestions) {
            suggestions.forEach((s, i) => {
                if (i === selectedIndex) {
                    s.style.background = 'var(--bg-hover)';
                    s.focus();
                } else {
                    s.style.background = 'transparent';
                }
            });
        }
        
        // Close on outside click
        document.addEventListener('click', (e) => {
            if (!searchInput.contains(e.target) && !suggestionsContainer.contains(e.target)) {
                suggestionsContainer.style.display = 'none';
            }
        });
    }
    
    // Search analytics
    function trackSearch(query) {
        if (typeof gtag !== 'undefined' && query.trim().length > 0) {
            gtag('event', 'search', {
                'search_term': query,
                'event_category': 'Engagement'
            });
        }
    }
    
    // Initialize
    document.addEventListener('DOMContentLoaded', () => {
        initSearchSuggestions();
        
        const searchInput = document.getElementById('searchInput');
        if (searchInput) {
            searchInput.addEventListener('search', (e) => {
                trackSearch(e.target.value);
            });
            
            searchInput.addEventListener('keydown', (e) => {
                if (e.key === 'Enter') {
                    trackSearch(e.target.value);
                }
            });
        }
    });
})();

