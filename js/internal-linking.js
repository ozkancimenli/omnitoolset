// Internal Linking System - Automatically adds relevant internal links
function addInternalLinks() {
    const content = document.querySelector('.tool-container, main');
    if (!content) return;
    
    // Find text content and add links to related tools
    const textContent = content.textContent || '';
    
    // Common tool mentions that should be linked
    const toolMentions = {
        'PDF merge': '/tools/pdf-merge.html',
        'PDF split': '/tools/pdf-split.html',
        'PDF compress': '/tools/pdf-compress.html',
        'image resize': '/tools/image-resize.html',
        'image compress': '/tools/image-compress.html',
        'JSON formatter': '/tools/json-formatter.html',
        'QR code': '/tools/qr-generator.html',
        'password generator': '/tools/password-generator.html'
    };
    
    // This would be more sophisticated in a real implementation
    // For now, we'll add contextual links in specific sections
}

// Add "You might also like" section with internal links
function addContextualLinks() {
    const path = window.location.pathname;
    
    if (path.includes('/tools/')) {
        const contextualLinks = document.createElement('div');
        contextualLinks.className = 'contextual-links';
        contextualLinks.style.cssText = 'margin: 2rem 0; padding: 1.5rem; background: var(--bg-card); border-radius: 12px; border: 1px solid var(--border-color);';
        
        contextualLinks.innerHTML = `
            <h3 style="color: var(--text-primary); margin-bottom: 1rem; font-size: 1.2rem;">🔗 You Might Also Like</h3>
            <div style="display: flex; flex-wrap: wrap; gap: 0.75rem;">
                <a href="/all-tools.html" style="padding: 0.5rem 1rem; background: rgba(99, 102, 241, 0.1); color: var(--primary-color); border-radius: 8px; text-decoration: none; font-size: 0.9rem; transition: all 0.2s;" onmouseover="this.style.background='rgba(99, 102, 241, 0.2)'" onmouseout="this.style.background='rgba(99, 102, 241, 0.1)'">All Tools</a>
                <a href="/categories.html" style="padding: 0.5rem 1rem; background: rgba(99, 102, 241, 0.1); color: var(--primary-color); border-radius: 8px; text-decoration: none; font-size: 0.9rem; transition: all 0.2s;" onmouseover="this.style.background='rgba(99, 102, 241, 0.2)'" onmouseout="this.style.background='rgba(99, 102, 241, 0.1)'">Categories</a>
                <a href="/blog.html" style="padding: 0.5rem 1rem; background: rgba(99, 102, 241, 0.1); color: var(--primary-color); border-radius: 8px; text-decoration: none; font-size: 0.9rem; transition: all 0.2s;" onmouseover="this.style.background='rgba(99, 102, 241, 0.2)'" onmouseout="this.style.background='rgba(99, 102, 241, 0.1)'">Blog & Guides</a>
            </div>
        `;
        
        const footer = document.querySelector('footer');
        if (footer) {
            footer.parentNode.insertBefore(contextualLinks, footer);
        }
    }
}

document.addEventListener('DOMContentLoaded', function() {
    addInternalLinks();
    addContextualLinks();
});

