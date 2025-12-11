// Advanced Keyboard Shortcuts Power-Up
(function() {
    'use strict';
    
    const shortcuts = {
        // Navigation
        'g h': () => window.location.href = '/index.html',
        'g b': () => window.location.href = '/blog.html',
        'g c': () => window.location.href = '/categories.html',
        'g a': () => window.location.href = '/all-tools.html',
        
        // Search
        '/': (e) => {
            e.preventDefault();
            const searchInput = document.getElementById('searchInput');
            if (searchInput) {
                searchInput.focus();
                searchInput.select();
            }
        },
        
        // Escape
        'Escape': () => {
            // Close modals, dropdowns, etc.
            document.querySelectorAll('[role="dialog"], .modal, .dropdown-menu').forEach(el => {
                el.style.display = 'none';
            });
            // Clear search
            const searchInput = document.getElementById('searchInput');
            if (searchInput && document.activeElement === searchInput) {
                searchInput.value = '';
                searchInput.blur();
            }
        },
        
        // Quick actions
        '?': () => showShortcutsHelp(),
        'ctrl+k': (e) => {
            e.preventDefault();
            openCommandPalette();
        }
    };
    
    let keySequence = '';
    let sequenceTimeout;
    
    function showShortcutsHelp() {
        const help = document.createElement('div');
        help.id = 'shortcuts-help';
        help.style.cssText = `
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
        
        help.innerHTML = `
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.5rem;">
                <h2 style="margin: 0; color: var(--text-primary);">⌨️ Keyboard Shortcuts</h2>
                <button onclick="this.closest('#shortcuts-help').remove()" style="
                    background: transparent;
                    border: none;
                    color: var(--text-secondary);
                    font-size: 1.5rem;
                    cursor: pointer;
                    padding: 0.5rem;
                ">×</button>
            </div>
            <div style="display: grid; gap: 1rem;">
                <div>
                    <h3 style="color: var(--text-primary); margin-bottom: 0.5rem;">Navigation</h3>
                    <div style="display: grid; gap: 0.5rem; font-size: 0.9rem;">
                        <div style="display: flex; justify-content: space-between;">
                            <span style="color: var(--text-secondary);">Go to Home</span>
                            <kbd style="background: var(--bg-hover); padding: 0.25rem 0.5rem; border-radius: 4px; font-family: monospace;">g</kbd> then <kbd style="background: var(--bg-hover); padding: 0.25rem 0.5rem; border-radius: 4px; font-family: monospace;">h</kbd>
                        </div>
                        <div style="display: flex; justify-content: space-between;">
                            <span style="color: var(--text-secondary);">Go to Blog</span>
                            <kbd style="background: var(--bg-hover); padding: 0.25rem 0.5rem; border-radius: 4px; font-family: monospace;">g</kbd> then <kbd style="background: var(--bg-hover); padding: 0.25rem 0.5rem; border-radius: 4px; font-family: monospace;">b</kbd>
                        </div>
                        <div style="display: flex; justify-content: space-between;">
                            <span style="color: var(--text-secondary);">Go to Categories</span>
                            <kbd style="background: var(--bg-hover); padding: 0.25rem 0.5rem; border-radius: 4px; font-family: monospace;">g</kbd> then <kbd style="background: var(--bg-hover); padding: 0.25rem 0.5rem; border-radius: 4px; font-family: monospace;">c</kbd>
                        </div>
                        <div style="display: flex; justify-content: space-between;">
                            <span style="color: var(--text-secondary);">Go to All Tools</span>
                            <kbd style="background: var(--bg-hover); padding: 0.25rem 0.5rem; border-radius: 4px; font-family: monospace;">g</kbd> then <kbd style="background: var(--bg-hover); padding: 0.25rem 0.5rem; border-radius: 4px; font-family: monospace;">a</kbd>
                        </div>
                    </div>
                </div>
                <div>
                    <h3 style="color: var(--text-primary); margin-bottom: 0.5rem;">Actions</h3>
                    <div style="display: grid; gap: 0.5rem; font-size: 0.9rem;">
                        <div style="display: flex; justify-content: space-between;">
                            <span style="color: var(--text-secondary);">Search</span>
                            <kbd style="background: var(--bg-hover); padding: 0.25rem 0.5rem; border-radius: 4px; font-family: monospace;">/</kbd>
                        </div>
                        <div style="display: flex; justify-content: space-between;">
                            <span style="color: var(--text-secondary);">Command Palette</span>
                            <kbd style="background: var(--bg-hover); padding: 0.25rem 0.5rem; border-radius: 4px; font-family: monospace;">Ctrl</kbd> + <kbd style="background: var(--bg-hover); padding: 0.25rem 0.5rem; border-radius: 4px; font-family: monospace;">K</kbd>
                        </div>
                        <div style="display: flex; justify-content: space-between;">
                            <span style="color: var(--text-secondary);">Close / Escape</span>
                            <kbd style="background: var(--bg-hover); padding: 0.25rem 0.5rem; border-radius: 4px; font-family: monospace;">Esc</kbd>
                        </div>
                        <div style="display: flex; justify-content: space-between;">
                            <span style="color: var(--text-secondary);">Show Shortcuts</span>
                            <kbd style="background: var(--bg-hover); padding: 0.25rem 0.5rem; border-radius: 4px; font-family: monospace;">?</kbd>
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        document.body.appendChild(help);
        
        // Close on Escape or click outside
        const closeHelp = (e) => {
            if (e.key === 'Escape' || (e.type === 'click' && !help.contains(e.target))) {
                help.remove();
                document.removeEventListener('keydown', closeHelp);
                document.removeEventListener('click', closeHelp);
            }
        };
        
        setTimeout(() => {
            document.addEventListener('keydown', closeHelp);
            document.addEventListener('click', closeHelp);
        }, 100);
    }
    
    function openCommandPalette() {
        if (document.getElementById('command-palette')) return;
        
        const palette = document.createElement('div');
        palette.id = 'command-palette';
        palette.style.cssText = `
            position: fixed;
            top: 20%;
            left: 50%;
            transform: translateX(-50%);
            background: var(--bg-card);
            border: 2px solid var(--border-color);
            border-radius: 12px;
            padding: 1rem;
            z-index: 10000;
            width: 90%;
            max-width: 500px;
            box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
        `;
        
        const input = document.createElement('input');
        input.type = 'text';
        input.placeholder = 'Search tools, navigate, or type a command...';
        input.style.cssText = `
            width: 100%;
            padding: 0.75rem;
            background: var(--bg-hover);
            border: 1px solid var(--border-color);
            border-radius: 8px;
            color: var(--text-primary);
            font-size: 1rem;
            margin-bottom: 1rem;
        `;
        
        const results = document.createElement('div');
        results.id = 'command-results';
        results.style.cssText = 'max-height: 300px; overflow-y: auto;';
        
        palette.appendChild(input);
        palette.appendChild(results);
        document.body.appendChild(palette);
        
        input.focus();
        
        // Search tools
        input.addEventListener('input', (e) => {
            const query = e.target.value.toLowerCase().trim();
            if (!query) {
                results.innerHTML = '';
                return;
            }
            
            if (typeof tools !== 'undefined') {
                const matches = tools
                    .filter(tool => 
                        tool.title.toLowerCase().includes(query) ||
                        tool.description.toLowerCase().includes(query) ||
                        tool.category.toLowerCase().includes(query)
                    )
                    .slice(0, 8);
                
                results.innerHTML = matches.map(tool => `
                    <a href="/${tool.page}" style="
                        display: block;
                        padding: 0.75rem;
                        margin-bottom: 0.5rem;
                        background: var(--bg-hover);
                        border-radius: 8px;
                        text-decoration: none;
                        color: var(--text-primary);
                        transition: all 0.2s;
                    " onmouseover="this.style.background='var(--primary-color)'; this.style.color='white';" onmouseout="this.style.background='var(--bg-hover)'; this.style.color='var(--text-primary)';">
                        <div style="display: flex; align-items: center; gap: 0.75rem;">
                            <span style="font-size: 1.5rem;">${tool.icon}</span>
                            <div>
                                <div style="font-weight: 600;">${tool.title}</div>
                                <div style="font-size: 0.85rem; color: var(--text-secondary);">${tool.category}</div>
                            </div>
                        </div>
                    </a>
                `).join('');
            }
        });
        
        // Close on Escape
        input.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                palette.remove();
            } else if (e.key === 'Enter' && results.querySelector('a')) {
                results.querySelector('a').click();
            }
        });
        
        // Close on outside click
        setTimeout(() => {
            document.addEventListener('click', (e) => {
                if (!palette.contains(e.target)) {
                    palette.remove();
                }
            }, { once: true });
        }, 100);
    }
    
    // Handle keyboard shortcuts
    document.addEventListener('keydown', (e) => {
        // Ignore if typing in input/textarea
        if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') {
            // Allow Escape and / even in inputs
            if (e.key === 'Escape' || (e.key === '/' && !e.ctrlKey && !e.metaKey)) {
                // Continue processing
            } else {
                return;
            }
        }
        
        // Handle Ctrl/Cmd + K
        if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
            e.preventDefault();
            openCommandPalette();
            return;
        }
        
        // Handle single key shortcuts
        if (shortcuts[e.key]) {
            shortcuts[e.key](e);
            return;
        }
        
        // Handle sequence shortcuts (g + h, g + b, etc.)
        if (e.key === 'g' && !e.ctrlKey && !e.metaKey) {
            keySequence = 'g';
            clearTimeout(sequenceTimeout);
            sequenceTimeout = setTimeout(() => {
                keySequence = '';
            }, 1000);
            return;
        }
        
        if (keySequence === 'g' && shortcuts[`g ${e.key}`]) {
            e.preventDefault();
            shortcuts[`g ${e.key}`]();
            keySequence = '';
            clearTimeout(sequenceTimeout);
        }
    });
    
    // Show shortcut hint on first visit
    if (!localStorage.getItem('shortcuts_hint_shown')) {
        setTimeout(() => {
            if (typeof showToast !== 'undefined') {
                showToast('💡 Tip: Press ? to see keyboard shortcuts', 'info', 5000);
                localStorage.setItem('shortcuts_hint_shown', 'true');
            }
        }, 3000);
    }
})();

