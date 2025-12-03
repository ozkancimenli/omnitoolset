// Accessibility Enhancements
(function() {
    'use strict';
    
    // Keyboard navigation improvements
    function enhanceKeyboardNavigation() {
        // Skip to main content link
        const skipLink = document.createElement('a');
        skipLink.href = '#main-content';
        skipLink.textContent = 'Skip to main content';
        skipLink.className = 'skip-link';
        skipLink.style.cssText = `
            position: absolute;
            top: -40px;
            left: 0;
            background: var(--primary-color);
            color: white;
            padding: 0.5rem 1rem;
            text-decoration: none;
            z-index: 1000;
            border-radius: 4px;
        `;
        skipLink.addEventListener('focus', () => {
            skipLink.style.top = '0';
        });
        skipLink.addEventListener('blur', () => {
            skipLink.style.top = '-40px';
        });
        document.body.insertBefore(skipLink, document.body.firstChild);
        
        // Add main content landmark
        const main = document.querySelector('main');
        if (main && !main.id) {
            main.id = 'main-content';
        }
    }
    
    // ARIA labels for interactive elements
    function addAriaLabels() {
        // Tool cards
        document.querySelectorAll('.tool-card').forEach(card => {
            if (!card.getAttribute('aria-label')) {
                const title = card.querySelector('.tool-title')?.textContent || 'Tool';
                const category = card.querySelector('.tool-category')?.textContent || '';
                card.setAttribute('aria-label', `${title} - ${category} tool`);
            }
        });
        
        // Buttons
        document.querySelectorAll('button:not([aria-label]):not([aria-labelledby])').forEach(btn => {
            if (btn.textContent.trim()) {
                btn.setAttribute('aria-label', btn.textContent.trim());
            }
        });
        
        // Search input
        const searchInput = document.getElementById('searchInput');
        if (searchInput && !searchInput.getAttribute('aria-label')) {
            searchInput.setAttribute('aria-label', 'Search tools');
        }
    }
    
    // Focus management
    function manageFocus() {
        // Trap focus in modals (if any)
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Tab') {
                const modals = document.querySelectorAll('[role="dialog"]');
                modals.forEach(modal => {
                    if (modal.style.display !== 'none') {
                        const focusableElements = modal.querySelectorAll(
                            'a[href], button:not([disabled]), textarea, input, select, [tabindex]:not([tabindex="-1"])'
                        );
                        
                        if (focusableElements.length === 0) return;
                        
                        const firstElement = focusableElements[0];
                        const lastElement = focusableElements[focusableElements.length - 1];
                        
                        if (e.shiftKey && document.activeElement === firstElement) {
                            e.preventDefault();
                            lastElement.focus();
                        } else if (!e.shiftKey && document.activeElement === lastElement) {
                            e.preventDefault();
                            firstElement.focus();
                        }
                    }
                });
            }
        });
    }
    
    // Screen reader announcements
    function announceToScreenReader(message) {
        const announcement = document.createElement('div');
        announcement.setAttribute('role', 'status');
        announcement.setAttribute('aria-live', 'polite');
        announcement.setAttribute('aria-atomic', 'true');
        announcement.className = 'sr-only';
        announcement.style.cssText = `
            position: absolute;
            left: -10000px;
            width: 1px;
            height: 1px;
            overflow: hidden;
        `;
        announcement.textContent = message;
        document.body.appendChild(announcement);
        
        setTimeout(() => {
            document.body.removeChild(announcement);
        }, 1000);
    }
    
    // High contrast mode detection
    function detectHighContrast() {
        if (window.matchMedia('(prefers-contrast: high)').matches) {
            document.documentElement.classList.add('high-contrast');
        }
    }
    
    // Reduced motion support
    function respectReducedMotion() {
        if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
            document.documentElement.classList.add('reduced-motion');
            
            // Disable animations
            const style = document.createElement('style');
            style.textContent = `
                .reduced-motion *,
                .reduced-motion *::before,
                .reduced-motion *::after {
                    animation-duration: 0.01ms !important;
                    animation-iteration-count: 1 !important;
                    transition-duration: 0.01ms !important;
                }
            `;
            document.head.appendChild(style);
        }
    }
    
    // Initialize
    document.addEventListener('DOMContentLoaded', () => {
        enhanceKeyboardNavigation();
        addAriaLabels();
        manageFocus();
        detectHighContrast();
        respectReducedMotion();
    });
    
    // Export for use in other scripts
    window.announceToScreenReader = announceToScreenReader;
})();

