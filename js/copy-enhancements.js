// Enhanced Copy to Clipboard with Visual Feedback
(function() {
    'use strict';
    
    // Enhanced copy function with visual feedback
    function enhancedCopy(text, element) {
        if (!navigator.clipboard) {
            // Fallback for older browsers
            const textarea = document.createElement('textarea');
            textarea.value = text;
            textarea.style.position = 'fixed';
            textarea.style.opacity = '0';
            document.body.appendChild(textarea);
            textarea.select();
            try {
                document.execCommand('copy');
                showCopyFeedback(element);
                textarea.remove();
                return true;
            } catch (err) {
                textarea.remove();
                return false;
            }
        }
        
        navigator.clipboard.writeText(text).then(() => {
            showCopyFeedback(element);
            
            // Track copy event
            if (typeof gtag !== 'undefined') {
                gtag('event', 'copy', {
                    'event_category': 'Engagement',
                    'event_label': 'Text Copied'
                });
            }
        }).catch(err => {
            console.error('Failed to copy:', err);
        });
    }
    
    function showCopyFeedback(element) {
        if (!element) return;
        
        const originalText = element.textContent;
        const originalBg = element.style.background;
        
        // Visual feedback
        element.textContent = '✓ Copied!';
        element.style.background = 'var(--success)';
        element.style.color = 'white';
        
        // Reset after 2 seconds
        setTimeout(() => {
            element.textContent = originalText;
            element.style.background = originalBg;
            element.style.color = '';
        }, 2000);
        
        // Show toast if available
        if (typeof showToast !== 'undefined') {
            showToast('Copied to clipboard!', 'success', 2000);
        }
    }
    
    // Auto-detect copy buttons
    document.addEventListener('click', (e) => {
        const copyBtn = e.target.closest('[data-copy], .copy-btn, [onclick*="copy"]');
        if (copyBtn) {
            e.preventDefault();
            
            // Get text to copy
            let textToCopy = copyBtn.dataset.copy || 
                           copyBtn.dataset.value ||
                           copyBtn.textContent.trim();
            
            // Try to get from nearby input/textarea
            if (!textToCopy || textToCopy === 'Copy') {
                const input = copyBtn.parentElement.querySelector('input, textarea');
                if (input) {
                    textToCopy = input.value || input.textContent;
                }
            }
            
            // Try to get from result/output element
            if (!textToCopy || textToCopy === 'Copy') {
                const result = document.querySelector('.result, .output, #result, #output');
                if (result) {
                    textToCopy = result.textContent || result.value;
                }
            }
            
            if (textToCopy && textToCopy !== 'Copy') {
                enhancedCopy(textToCopy, copyBtn);
            }
        }
    });
    
    // Add copy buttons to code blocks and results
    function addCopyButtons() {
        document.querySelectorAll('pre, code, .result, .output, [data-copy-target]').forEach(element => {
            if (element.querySelector('.copy-btn')) return; // Already has copy button
            
            const copyBtn = document.createElement('button');
            copyBtn.className = 'copy-btn';
            copyBtn.innerHTML = '📋 Copy';
            copyBtn.setAttribute('aria-label', 'Copy to clipboard');
            copyBtn.style.cssText = `
                position: absolute;
                top: 0.5rem;
                right: 0.5rem;
                background: var(--primary-color);
                color: white;
                border: none;
                padding: 0.5rem 1rem;
                border-radius: 8px;
                cursor: pointer;
                font-size: 0.85rem;
                transition: all 0.2s;
                z-index: 10;
            `;
            
            copyBtn.addEventListener('mouseenter', () => {
                copyBtn.style.background = 'var(--primary-dark)';
                copyBtn.style.transform = 'scale(1.05)';
            });
            
            copyBtn.addEventListener('mouseleave', () => {
                copyBtn.style.background = 'var(--primary-color)';
                copyBtn.style.transform = 'scale(1)';
            });
            
            // Make parent relative
            if (getComputedStyle(element).position === 'static') {
                element.style.position = 'relative';
            }
            
            element.appendChild(copyBtn);
            
            copyBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                const text = element.textContent || element.value || '';
                enhancedCopy(text, copyBtn);
            });
        });
    }
    
    // Initialize
    document.addEventListener('DOMContentLoaded', () => {
        setTimeout(addCopyButtons, 1000);
    });
    
    // Export
    window.enhancedCopy = enhancedCopy;
})();



