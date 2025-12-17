// User Preferences System - Save user settings
(function() {
    'use strict';
    
    const defaultPreferences = {
        theme: 'auto', // auto, light, dark
        fontSize: 'medium', // small, medium, large
        animations: true,
        compactMode: false,
        showTooltips: true,
        autoSave: true
    };
    
    function getPreferences() {
        const stored = localStorage.getItem('omnitoolset_preferences');
        return stored ? { ...defaultPreferences, ...JSON.parse(stored) } : defaultPreferences;
    }
    
    function savePreferences(prefs) {
        localStorage.setItem('omnitoolset_preferences', JSON.stringify(prefs));
        applyPreferences(prefs);
    }
    
    function applyPreferences(prefs) {
        // Apply theme
        if (prefs.theme === 'dark') {
            document.documentElement.setAttribute('data-theme', 'dark');
        } else if (prefs.theme === 'light') {
            document.documentElement.setAttribute('data-theme', 'light');
        } else {
            document.documentElement.removeAttribute('data-theme');
        }
        
        // Apply font size
        document.documentElement.style.fontSize = {
            small: '14px',
            medium: '16px',
            large: '18px'
        }[prefs.fontSize] || '16px';
        
        // Apply animations
        if (!prefs.animations) {
            document.documentElement.style.setProperty('--animation-duration', '0s');
        }
        
        // Apply compact mode
        if (prefs.compactMode) {
            document.body.classList.add('compact-mode');
        } else {
            document.body.classList.remove('compact-mode');
        }
    }
    
    function createPreferencesMenu() {
        const prefs = getPreferences();
        
        const menu = document.createElement('div');
        menu.id = 'preferences-menu';
        menu.style.cssText = `
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            background: var(--bg-card);
            border: 2px solid var(--border-color);
            border-radius: 20px;
            padding: 2rem;
            z-index: 10000;
            max-width: 500px;
            max-height: 80vh;
            overflow-y: auto;
            box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
        `;
        
        menu.innerHTML = `
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.5rem;">
                <h2 style="margin: 0; color: var(--text-primary);">⚙️ Preferences</h2>
                <button onclick="this.closest('#preferences-menu').remove()" style="
                    background: transparent;
                    border: none;
                    color: var(--text-secondary);
                    font-size: 1.5rem;
                    cursor: pointer;
                    padding: 0.5rem;
                ">×</button>
            </div>
            <div style="display: grid; gap: 1.5rem;">
                <div>
                    <label style="display: block; margin-bottom: 0.5rem; color: var(--text-primary); font-weight: 600;">Theme</label>
                    <select id="pref-theme" style="
                        width: 100%;
                        padding: 0.75rem;
                        background: var(--bg-hover);
                        border: 1px solid var(--border-color);
                        border-radius: 8px;
                        color: var(--text-primary);
                        font-size: 1rem;
                    ">
                        <option value="auto" ${prefs.theme === 'auto' ? 'selected' : ''}>Auto (System)</option>
                        <option value="light" ${prefs.theme === 'light' ? 'selected' : ''}>Light</option>
                        <option value="dark" ${prefs.theme === 'dark' ? 'selected' : ''}>Dark</option>
                    </select>
                </div>
                <div>
                    <label style="display: block; margin-bottom: 0.5rem; color: var(--text-primary); font-weight: 600;">Font Size</label>
                    <select id="pref-fontsize" style="
                        width: 100%;
                        padding: 0.75rem;
                        background: var(--bg-hover);
                        border: 1px solid var(--border-color);
                        border-radius: 8px;
                        color: var(--text-primary);
                        font-size: 1rem;
                    ">
                        <option value="small" ${prefs.fontSize === 'small' ? 'selected' : ''}>Small</option>
                        <option value="medium" ${prefs.fontSize === 'medium' ? 'selected' : ''}>Medium</option>
                        <option value="large" ${prefs.fontSize === 'large' ? 'selected' : ''}>Large</option>
                    </select>
                </div>
                <div>
                    <label style="display: flex; align-items: center; gap: 0.75rem; color: var(--text-primary); cursor: pointer;">
                        <input type="checkbox" id="pref-animations" ${prefs.animations ? 'checked' : ''} style="
                            width: 20px;
                            height: 20px;
                            cursor: pointer;
                        ">
                        <span>Enable Animations</span>
                    </label>
                </div>
                <div>
                    <label style="display: flex; align-items: center; gap: 0.75rem; color: var(--text-primary); cursor: pointer;">
                        <input type="checkbox" id="pref-compact" ${prefs.compactMode ? 'checked' : ''} style="
                            width: 20px;
                            height: 20px;
                            cursor: pointer;
                        ">
                        <span>Compact Mode</span>
                    </label>
                </div>
                <div>
                    <label style="display: flex; align-items: center; gap: 0.75rem; color: var(--text-primary); cursor: pointer;">
                        <input type="checkbox" id="pref-tooltips" ${prefs.showTooltips ? 'checked' : ''} style="
                            width: 20px;
                            height: 20px;
                            cursor: pointer;
                        ">
                        <span>Show Tooltips</span>
                    </label>
                </div>
                <button onclick="saveUserPreferences()" style="
                    padding: 0.75rem 1.5rem;
                    background: var(--primary-color);
                    color: white;
                    border: none;
                    border-radius: 8px;
                    cursor: pointer;
                    font-size: 1rem;
                    font-weight: 600;
                    transition: all 0.2s;
                " onmouseover="this.style.background='var(--primary-dark)'; this.style.transform='scale(1.05)';" onmouseout="this.style.background='var(--primary-color)'; this.style.transform='scale(1)';">
                    Save Preferences
                </button>
            </div>
        `;
        
        document.body.appendChild(menu);
        
        // Close handlers
        const closeHandler = (e) => {
            if (e.key === 'Escape' || (e.type === 'click' && !menu.contains(e.target))) {
                menu.remove();
                document.removeEventListener('keydown', closeHandler);
                document.removeEventListener('click', closeHandler);
            }
        };
        
        setTimeout(() => {
            document.addEventListener('keydown', closeHandler);
            document.addEventListener('click', closeHandler);
        }, 100);
    }
    
    window.saveUserPreferences = function() {
        const prefs = {
            theme: document.getElementById('pref-theme').value,
            fontSize: document.getElementById('pref-fontsize').value,
            animations: document.getElementById('pref-animations').checked,
            compactMode: document.getElementById('pref-compact').checked,
            showTooltips: document.getElementById('pref-tooltips').checked,
            autoSave: true
        };
        
        savePreferences(prefs);
        document.getElementById('preferences-menu').remove();
        
        if (typeof showToast !== 'undefined') {
            showToast('Preferences saved!', 'success', 2000);
        }
    };
    
    // Initialize
    document.addEventListener('DOMContentLoaded', () => {
        const prefs = getPreferences();
        applyPreferences(prefs);
    });
    
    // Export
    window.showPreferences = createPreferencesMenu;
    window.getUserPreferences = getPreferences;
})();





