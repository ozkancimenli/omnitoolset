// Enhanced Share Functionality Power-Up
(function() {
    'use strict';
    
    function createShareMenu() {
        const shareData = {
            title: document.title,
            text: document.querySelector('meta[name="description"]')?.content || '',
            url: window.location.href
        };
        
        const platforms = [
            {
                name: 'Twitter',
                icon: '🐦',
                action: () => {
                    const url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareData.title)}&url=${encodeURIComponent(shareData.url)}`;
                    window.open(url, '_blank', 'width=600,height=400');
                    trackShare('twitter');
                }
            },
            {
                name: 'Facebook',
                icon: '📘',
                action: () => {
                    const url = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareData.url)}`;
                    window.open(url, '_blank', 'width=600,height=400');
                    trackShare('facebook');
                }
            },
            {
                name: 'LinkedIn',
                icon: '💼',
                action: () => {
                    const url = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareData.url)}`;
                    window.open(url, '_blank', 'width=600,height=400');
                    trackShare('linkedin');
                }
            },
            {
                name: 'WhatsApp',
                icon: '💬',
                action: () => {
                    const url = `https://wa.me/?text=${encodeURIComponent(shareData.title + ' ' + shareData.url)}`;
                    window.open(url, '_blank');
                    trackShare('whatsapp');
                }
            },
            {
                name: 'Email',
                icon: '📧',
                action: () => {
                    const url = `mailto:?subject=${encodeURIComponent(shareData.title)}&body=${encodeURIComponent(shareData.text + '\n\n' + shareData.url)}`;
                    window.location.href = url;
                    trackShare('email');
                }
            },
            {
                name: 'Copy Link',
                icon: '🔗',
                action: () => {
                    if (navigator.clipboard) {
                        navigator.clipboard.writeText(shareData.url).then(() => {
                            if (typeof showToast !== 'undefined') {
                                showToast('Link copied to clipboard!', 'success', 2000);
                            }
                            trackShare('copy');
                        });
                    }
                }
            }
        ];
        
        const menu = document.createElement('div');
        menu.id = 'share-menu';
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
            min-width: 300px;
            box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
        `;
        
        menu.innerHTML = `
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.5rem;">
                <h2 style="margin: 0; color: var(--text-primary);">Share</h2>
                <button class="close-share-menu" style="
                    background: transparent;
                    border: none;
                    color: var(--text-secondary);
                    font-size: 1.5rem;
                    cursor: pointer;
                    padding: 0.5rem;
                ">×</button>
            </div>
            <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 1rem;">
                ${platforms.map((platform, index) => `
                    <button class="share-platform-btn" data-platform-index="${index}" style="
                        display: flex;
                        flex-direction: column;
                        align-items: center;
                        gap: 0.5rem;
                        padding: 1rem;
                        background: var(--bg-hover);
                        border: 1px solid var(--border-color);
                        border-radius: 12px;
                        cursor: pointer;
                        transition: all 0.2s;
                        color: var(--text-primary);
                    " onmouseover="this.style.background='var(--primary-color)'; this.style.color='white'; this.style.transform='scale(1.05)';" onmouseout="this.style.background='var(--bg-hover)'; this.style.color='var(--text-primary)'; this.style.transform='scale(1)';">
                        <span style="font-size: 2rem;">${platform.icon}</span>
                        <span style="font-size: 0.85rem;">${platform.name}</span>
                    </button>
                `).join('')}
            </div>
        `;
        
        // Close button
        menu.querySelector('.close-share-menu').addEventListener('click', () => {
            menu.remove();
        });
        
        // Platform buttons
        menu.querySelectorAll('.share-platform-btn').forEach((btn, index) => {
            btn.addEventListener('click', () => {
                platforms[index].action();
                menu.remove();
            });
        });
        
        document.body.appendChild(menu);
        
        // Close on Escape
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
    
    function trackShare(platform) {
        if (typeof gtag !== 'undefined') {
            gtag('event', 'share', {
                'method': platform,
                'content_type': 'page',
                'item_id': window.location.pathname
            });
        }
    }
    
    // Add share button to pages
    function addShareButtons() {
        // Add to tool pages
        const toolTitle = document.querySelector('h1');
        if (toolTitle && window.location.pathname.includes('/tools/')) {
            const shareBtn = document.createElement('button');
            shareBtn.innerHTML = '📤 Share';
            shareBtn.className = 'share-tool-btn';
            shareBtn.setAttribute('aria-label', 'Share this tool');
            shareBtn.style.cssText = `
                margin-left: 1rem;
                padding: 0.5rem 1rem;
                background: var(--primary-color);
                color: white;
                border: none;
                border-radius: 8px;
                cursor: pointer;
                font-size: 0.9rem;
                transition: all 0.2s;
            `;
            
            shareBtn.addEventListener('mouseenter', () => {
                shareBtn.style.background = 'var(--primary-dark)';
                shareBtn.style.transform = 'scale(1.05)';
            });
            
            shareBtn.addEventListener('mouseleave', () => {
                shareBtn.style.background = 'var(--primary-color)';
                shareBtn.style.transform = 'scale(1)';
            });
            
            shareBtn.addEventListener('click', createShareMenu);
            
            // Insert after title
            if (toolTitle.parentNode) {
                toolTitle.parentNode.insertBefore(shareBtn, toolTitle.nextSibling);
            }
        }
        
        // Add to blog posts
        const blogTitle = document.querySelector('article h1');
        if (blogTitle && window.location.pathname.includes('/blog/')) {
            const shareBtn = document.createElement('button');
            shareBtn.innerHTML = '📤 Share Article';
            shareBtn.className = 'share-blog-btn';
            shareBtn.setAttribute('aria-label', 'Share this article');
            shareBtn.style.cssText = `
                margin-top: 1rem;
                padding: 0.75rem 1.5rem;
                background: var(--primary-color);
                color: white;
                border: none;
                border-radius: 12px;
                cursor: pointer;
                font-size: 1rem;
                transition: all 0.2s;
            `;
            
            shareBtn.addEventListener('mouseenter', () => {
                shareBtn.style.background = 'var(--primary-dark)';
                shareBtn.style.transform = 'scale(1.05)';
            });
            
            shareBtn.addEventListener('mouseleave', () => {
                shareBtn.style.background = 'var(--primary-color)';
                shareBtn.style.transform = 'scale(1)';
            });
            
            shareBtn.addEventListener('click', createShareMenu);
            
            if (blogTitle.parentNode) {
                blogTitle.parentNode.insertBefore(shareBtn, blogTitle.nextSibling);
            }
        }
    }
    
    // Use Web Share API if available
    function nativeShare() {
        if (navigator.share) {
            navigator.share({
                title: document.title,
                text: document.querySelector('meta[name="description"]')?.content || '',
                url: window.location.href
            }).then(() => {
                trackShare('native');
            }).catch(() => {
                // Fallback to custom menu
                createShareMenu();
            });
        } else {
            createShareMenu();
        }
    }
    
    // Initialize
    document.addEventListener('DOMContentLoaded', () => {
        setTimeout(addShareButtons, 1000);
    });
    
    // Export
    window.showShareMenu = createShareMenu;
    window.nativeShare = nativeShare;
})();

