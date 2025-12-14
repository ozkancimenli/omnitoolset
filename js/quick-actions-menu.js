// Quick Actions Menu - Floating action button with quick access
(function() {
    'use strict';
    
    function createQuickActionsMenu() {
        const menu = document.createElement('div');
        menu.id = 'quick-actions-menu';
        menu.style.cssText = `
            position: fixed;
            bottom: 80px;
            right: 20px;
            z-index: 999;
            display: flex;
            flex-direction: column;
            gap: 0.75rem;
            opacity: 0;
            transform: translateY(20px);
            transition: all 0.3s ease;
            pointer-events: none;
        `;
        
        const actions = [
            { icon: '🔍', label: 'Search', action: () => {
                const searchInput = document.getElementById('searchInput');
                if (searchInput) {
                    searchInput.focus();
                    searchInput.select();
                }
            }},
            { icon: '⭐', label: 'Favorites', action: () => {
                const favorites = JSON.parse(localStorage.getItem('omnitoolset_favorites') || '[]');
                if (favorites.length > 0 && typeof tools !== 'undefined') {
                    const favoriteTools = favorites.map(id => tools.find(t => t.id === id)).filter(Boolean);
                    const grid = document.getElementById('toolsGrid') || document.getElementById('allToolsGrid');
                    if (grid && typeof renderTools === 'function') {
                        renderTools(favoriteTools);
                        if (typeof showToast !== 'undefined') {
                            showToast(`Showing ${favoriteTools.length} favorite tools`, 'info', 2000);
                        }
                    }
                } else {
                    if (typeof showToast !== 'undefined') {
                        showToast('No favorite tools yet. Click ⭐ on any tool to favorite it!', 'info', 3000);
                    }
                }
            }},
            { icon: '🕒', label: 'Recent', action: () => {
                const recent = JSON.parse(localStorage.getItem('omnitoolset_recent') || '[]');
                if (recent.length > 0 && typeof tools !== 'undefined') {
                    const recentTools = recent.map(id => tools.find(t => t.id === id)).filter(Boolean);
                    const grid = document.getElementById('toolsGrid') || document.getElementById('allToolsGrid');
                    if (grid && typeof renderTools === 'function') {
                        renderTools(recentTools);
                        if (typeof showToast !== 'undefined') {
                            showToast(`Showing ${recentTools.length} recently used tools`, 'info', 2000);
                        }
                    }
                } else {
                    if (typeof showToast !== 'undefined') {
                        showToast('No recent tools yet', 'info', 2000);
                    }
                }
            }},
            { icon: '📊', label: 'Stats', action: () => {
                if (typeof showUsageStats !== 'undefined') {
                    showUsageStats();
                }
            }},
            { icon: '⚙️', label: 'Settings', action: () => {
                if (typeof showPreferences !== 'undefined') {
                    showPreferences();
                }
            }},
            { icon: '📱', label: 'Install App', action: () => {
                // Trigger PWA install
                if (window.deferredPrompt) {
                    window.deferredPrompt.prompt();
                } else {
                    if (typeof showToast !== 'undefined') {
                        showToast('App installation not available. Use browser menu to install.', 'info', 3000);
                    }
                }
            }},
            { icon: '⌨️', label: 'Shortcuts', action: () => {
                // Trigger shortcuts help
                if (window.showShortcutsHelp) {
                    window.showShortcutsHelp();
                } else {
                    // Fallback: show alert
                    alert('Keyboard Shortcuts:\n\n' +
                          'g + h = Home\n' +
                          'g + b = Blog\n' +
                          'g + c = Categories\n' +
                          'g + a = All Tools\n' +
                          '/ = Search\n' +
                          'Ctrl+K = Command Palette\n' +
                          '? = Show Shortcuts\n' +
                          'Esc = Close');
                }
            }}
        ];
        
        actions.forEach(action => {
            const button = document.createElement('button');
            button.innerHTML = `<span style="font-size: 1.2rem;">${action.icon}</span>`;
            button.title = action.label;
            button.setAttribute('aria-label', action.label);
            button.style.cssText = `
                width: 50px;
                height: 50px;
                border-radius: 50%;
                background: var(--primary-color);
                color: white;
                border: none;
                cursor: pointer;
                display: flex;
                align-items: center;
                justify-content: center;
                box-shadow: 0 4px 12px rgba(99, 102, 241, 0.3);
                transition: all 0.2s;
                font-size: 1.2rem;
            `;
            
            button.addEventListener('mouseenter', () => {
                button.style.transform = 'scale(1.1)';
                button.style.boxShadow = '0 6px 16px rgba(99, 102, 241, 0.4)';
            });
            
            button.addEventListener('mouseleave', () => {
                button.style.transform = 'scale(1)';
                button.style.boxShadow = '0 4px 12px rgba(99, 102, 241, 0.3)';
            });
            
            button.addEventListener('click', () => {
                action.action();
                toggleMenu();
            });
            
            menu.appendChild(button);
        });
        
        return menu;
    }
    
    function createFAB() {
        const fab = document.createElement('button');
        fab.id = 'quick-actions-fab';
        fab.innerHTML = '⚡';
        fab.setAttribute('aria-label', 'Quick Actions');
        fab.style.cssText = `
            position: fixed;
            bottom: 20px;
            right: 20px;
            width: 60px;
            height: 60px;
            border-radius: 50%;
            background: linear-gradient(135deg, var(--primary-color), var(--secondary-color));
            color: white;
            border: none;
            cursor: pointer;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 1.5rem;
            box-shadow: 0 4px 16px rgba(99, 102, 241, 0.4);
            z-index: 998;
            transition: all 0.3s ease;
        `;
        
        fab.addEventListener('mouseenter', () => {
            fab.style.transform = 'scale(1.1) rotate(90deg)';
            fab.style.boxShadow = '0 6px 20px rgba(99, 102, 241, 0.5)';
        });
        
        fab.addEventListener('mouseleave', () => {
            if (!fab.classList.contains('active')) {
                fab.style.transform = 'scale(1) rotate(0deg)';
                fab.style.boxShadow = '0 4px 16px rgba(99, 102, 241, 0.4)';
            }
        });
        
        return fab;
    }
    
    let menuVisible = false;
    const menu = createQuickActionsMenu();
    const fab = createFAB();
    
    function toggleMenu() {
        menuVisible = !menuVisible;
        
        if (menuVisible) {
            menu.style.opacity = '1';
            menu.style.transform = 'translateY(0)';
            menu.style.pointerEvents = 'auto';
            fab.style.transform = 'scale(1.1) rotate(45deg)';
        } else {
            menu.style.opacity = '0';
            menu.style.transform = 'translateY(20px)';
            menu.style.pointerEvents = 'none';
            fab.style.transform = 'scale(1) rotate(0deg)';
        }
        
        fab.classList.toggle('active', menuVisible);
    }
    
    fab.addEventListener('click', toggleMenu);
    
    // Close on outside click
    document.addEventListener('click', (e) => {
        if (menuVisible && !menu.contains(e.target) && !fab.contains(e.target)) {
            toggleMenu();
        }
    });
    
    // Initialize
    document.addEventListener('DOMContentLoaded', () => {
        document.body.appendChild(menu);
        document.body.appendChild(fab);
    });
    
    // Export for keyboard shortcuts
    window.showShortcutsHelp = () => {
        // This will be handled by keyboard-shortcuts-powerup.js
        document.dispatchEvent(new KeyboardEvent('keydown', { key: '?' }));
    };
})();



