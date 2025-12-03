// UI Enhancements - Toast notifications, Loading states, etc.
(function() {
    'use strict';
    
    // Toast notification system
    function showToast(message, type = 'info', duration = 3000) {
        const toast = document.createElement('div');
        toast.className = `toast toast-${type}`;
        toast.style.cssText = `
            position: fixed;
            bottom: 2rem;
            right: 2rem;
            background: var(--bg-card);
            color: var(--text-primary);
            padding: 1rem 1.5rem;
            border-radius: 12px;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
            z-index: 10000;
            animation: slideIn 0.3s ease-out;
            max-width: 300px;
            border-left: 4px solid;
        `;
        
        // Set border color based on type
        const colors = {
            success: '#10b981',
            error: '#ef4444',
            warning: '#f59e0b',
            info: 'var(--primary-color)'
        };
        toast.style.borderLeftColor = colors[type] || colors.info;
        
        toast.innerHTML = `
            <div style="display: flex; align-items: center; gap: 0.5rem;">
                <span style="font-size: 1.2rem;">${getIcon(type)}</span>
                <span>${message}</span>
            </div>
        `;
        
        document.body.appendChild(toast);
        
        // Auto remove
        setTimeout(() => {
            toast.style.animation = 'slideOut 0.3s ease-out';
            setTimeout(() => {
                if (toast.parentNode) {
                    toast.parentNode.removeChild(toast);
                }
            }, 300);
        }, duration);
        
        // Click to dismiss
        toast.addEventListener('click', () => {
            toast.style.animation = 'slideOut 0.3s ease-out';
            setTimeout(() => {
                if (toast.parentNode) {
                    toast.parentNode.removeChild(toast);
                }
            }, 300);
        });
    }
    
    function getIcon(type) {
        const icons = {
            success: '✅',
            error: '❌',
            warning: '⚠️',
            info: 'ℹ️'
        };
        return icons[type] || icons.info;
    }
    
    // Add toast animations
    const style = document.createElement('style');
    style.textContent = `
        @keyframes slideIn {
            from {
                transform: translateX(100%);
                opacity: 0;
            }
            to {
                transform: translateX(0);
                opacity: 1;
            }
        }
        @keyframes slideOut {
            from {
                transform: translateX(0);
                opacity: 1;
            }
            to {
                transform: translateX(100%);
                opacity: 0;
            }
        }
    `;
    document.head.appendChild(style);
    
    // Loading spinner component
    function createLoadingSpinner(text = 'Loading...') {
        const spinner = document.createElement('div');
        spinner.className = 'loading-spinner';
        spinner.style.cssText = `
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            gap: 1rem;
            padding: 2rem;
        `;
        spinner.innerHTML = `
            <div style="
                width: 40px;
                height: 40px;
                border: 4px solid var(--border-color);
                border-top-color: var(--primary-color);
                border-radius: 50%;
                animation: spin 1s linear infinite;
            "></div>
            <p style="color: var(--text-secondary); margin: 0;">${text}</p>
        `;
        
        const spinStyle = document.createElement('style');
        spinStyle.textContent = `
            @keyframes spin {
                to { transform: rotate(360deg); }
            }
        `;
        if (!document.querySelector('style[data-spinner]')) {
            spinStyle.setAttribute('data-spinner', 'true');
            document.head.appendChild(spinStyle);
        }
        
        return spinner;
    }
    
    // Progress bar component
    function createProgressBar(percentage = 0) {
        const progress = document.createElement('div');
        progress.className = 'progress-bar';
        progress.style.cssText = `
            width: 100%;
            height: 4px;
            background: var(--border-color);
            border-radius: 2px;
            overflow: hidden;
            margin: 1rem 0;
        `;
        
        const fill = document.createElement('div');
        fill.style.cssText = `
            height: 100%;
            width: ${percentage}%;
            background: linear-gradient(90deg, var(--primary-color), var(--secondary-color));
            transition: width 0.3s ease;
            border-radius: 2px;
        `;
        
        progress.appendChild(fill);
        
        progress.update = function(newPercentage) {
            fill.style.width = `${newPercentage}%`;
        };
        
        return progress;
    }
    
    // Copy to clipboard with toast
    function copyToClipboard(text, successMessage = 'Copied to clipboard!') {
        if (navigator.clipboard && navigator.clipboard.writeText) {
            navigator.clipboard.writeText(text).then(() => {
                showToast(successMessage, 'success');
                
                if (typeof gtag !== 'undefined') {
                    gtag('event', 'copy_to_clipboard', {
                        'event_category': 'Engagement'
                    });
                }
            }).catch(() => {
                showToast('Failed to copy', 'error');
            });
        } else {
            // Fallback for older browsers
            const textarea = document.createElement('textarea');
            textarea.value = text;
            textarea.style.position = 'fixed';
            textarea.style.opacity = '0';
            document.body.appendChild(textarea);
            textarea.select();
            try {
                document.execCommand('copy');
                showToast(successMessage, 'success');
            } catch (err) {
                showToast('Failed to copy', 'error');
            }
            document.body.removeChild(textarea);
        }
    }
    
    // Keyboard shortcuts
    function setupKeyboardShortcuts() {
        document.addEventListener('keydown', (e) => {
            // Ctrl/Cmd + K for search
            if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
                e.preventDefault();
                const searchInput = document.getElementById('searchInput');
                if (searchInput) {
                    searchInput.focus();
                    searchInput.select();
                }
            }
            
            // Escape to close modals
            if (e.key === 'Escape') {
                const modals = document.querySelectorAll('[role="dialog"]');
                modals.forEach(modal => {
                    if (modal.style.display !== 'none') {
                        modal.style.display = 'none';
                    }
                });
            }
        });
    }
    
    // Initialize
    document.addEventListener('DOMContentLoaded', () => {
        setupKeyboardShortcuts();
    });
    
    // Export for use in other scripts
    window.showToast = showToast;
    window.createLoadingSpinner = createLoadingSpinner;
    window.createProgressBar = createProgressBar;
    window.copyToClipboard = copyToClipboard;
})();

