// Enhanced Social Sharing with Analytics
(function() {
    'use strict';
    
    // Share functionality
    async function shareContent(title, text, url) {
        const shareData = {
            title: title,
            text: text,
            url: url || window.location.href
        };
        
        // Use Web Share API if available (mobile)
        if (navigator.share) {
            try {
                await navigator.share(shareData);
                
                // Track share
                if (typeof gtag !== 'undefined') {
                    gtag('event', 'share', {
                        'method': 'native',
                        'content_type': 'tool',
                        'item_id': url || window.location.pathname
                    });
                }
                
                if (typeof showToast !== 'undefined') {
                    showToast('Shared successfully!', 'success');
                }
            } catch (error) {
                // User cancelled or error occurred
                if (error.name !== 'AbortError') {
                    console.error('Share failed:', error);
                }
            }
        } else {
            // Fallback: copy to clipboard
            if (typeof copyToClipboard !== 'undefined') {
                copyToClipboard(url || window.location.href, 'Link copied! Share it anywhere.');
            }
        }
    }
    
    // Platform-specific sharing
    function shareToPlatform(platform, url, title, text) {
        const encodedUrl = encodeURIComponent(url || window.location.href);
        const encodedTitle = encodeURIComponent(title || document.title);
        const encodedText = encodeURIComponent(text || document.querySelector('meta[name="description"]')?.content || '');
        
        const shareUrls = {
            twitter: `https://twitter.com/intent/tweet?url=${encodedUrl}&text=${encodedTitle}`,
            facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`,
            linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`,
            reddit: `https://reddit.com/submit?url=${encodedUrl}&title=${encodedTitle}`,
            whatsapp: `https://wa.me/?text=${encodedTitle}%20${encodedUrl}`,
            telegram: `https://t.me/share/url?url=${encodedUrl}&text=${encodedTitle}`,
            email: `mailto:?subject=${encodedTitle}&body=${encodedText}%20${encodedUrl}`
        };
        
        const shareUrl = shareUrls[platform];
        if (shareUrl) {
            window.open(shareUrl, '_blank', 'width=600,height=400');
            
            // Track share
            if (typeof gtag !== 'undefined') {
                gtag('event', 'share', {
                    'method': platform,
                    'content_type': 'tool',
                    'item_id': url || window.location.pathname
                });
            }
        }
    }
    
    // Create share buttons
    function createShareButtons() {
        const shareButtons = document.querySelectorAll('[data-share], .share-button');
        
        shareButtons.forEach(button => {
            button.addEventListener('click', (e) => {
                e.preventDefault();
                
                const platform = button.dataset.share || button.getAttribute('data-share');
                const url = button.dataset.url || window.location.href;
                const title = button.dataset.title || document.title;
                const text = button.dataset.text || document.querySelector('meta[name="description"]')?.content || '';
                
                if (platform === 'native' || !platform) {
                    shareContent(title, text, url);
                } else {
                    shareToPlatform(platform, url, title, text);
                }
            });
        });
    }
    
    // Add share buttons to tool pages
    function addShareButtonsToToolPages() {
        const path = window.location.pathname;
        if (!path.includes('/tools/')) return;
        
        const toolContainer = document.querySelector('.tool-container, main');
        if (!toolContainer) return;
        
        const shareSection = document.createElement('div');
        shareSection.className = 'share-section';
        shareSection.style.cssText = `
            margin: 2rem 0;
            padding: 1.5rem;
            background: var(--bg-card);
            border-radius: 12px;
            border: 1px solid var(--border-color);
            text-align: center;
        `;
        
        shareSection.innerHTML = `
            <h3 style="margin-bottom: 1rem; color: var(--text-primary); font-size: 1.2rem;">
                🔗 Share This Tool
            </h3>
            <div style="display: flex; justify-content: center; gap: 0.75rem; flex-wrap: wrap;">
                <button data-share="native" class="share-button" 
                        style="padding: 0.5rem 1rem; background: var(--primary-color); color: white; border: none; border-radius: 8px; cursor: pointer; font-weight: 600;">
                    📱 Share
                </button>
                <button data-share="twitter" class="share-button"
                        style="padding: 0.5rem 1rem; background: #1DA1F2; color: white; border: none; border-radius: 8px; cursor: pointer; font-weight: 600;">
                    🐦 Twitter
                </button>
                <button data-share="facebook" class="share-button"
                        style="padding: 0.5rem 1rem; background: #1877F2; color: white; border: none; border-radius: 8px; cursor: pointer; font-weight: 600;">
                    📘 Facebook
                </button>
                <button data-share="linkedin" class="share-button"
                        style="padding: 0.5rem 1rem; background: #0077B5; color: white; border: none; border-radius: 8px; cursor: pointer; font-weight: 600;">
                    💼 LinkedIn
                </button>
                <button data-share="reddit" class="share-button"
                        style="padding: 0.5rem 1rem; background: #FF4500; color: white; border: none; border-radius: 8px; cursor: pointer; font-weight: 600;">
                    🤖 Reddit
                </button>
                <button data-share="whatsapp" class="share-button"
                        style="padding: 0.5rem 1rem; background: #25D366; color: white; border: none; border-radius: 8px; cursor: pointer; font-weight: 600;">
                    💬 WhatsApp
                </button>
            </div>
        `;
        
        // Insert before footer or at end of tool container
        const footer = document.querySelector('footer');
        if (footer) {
            footer.parentNode.insertBefore(shareSection, footer);
        } else {
            toolContainer.appendChild(shareSection);
        }
    }
    
    // Initialize
    document.addEventListener('DOMContentLoaded', () => {
        createShareButtons();
        addShareButtonsToToolPages();
    });
    
    // Export functions
    window.shareContent = shareContent;
    window.shareToPlatform = shareToPlatform;
})();

