// Smart Internal Linking System - Automatically adds contextual links
(function() {
    'use strict';
    
    // Tool mentions that should be linked
    const toolMentions = {
        'PDF merge': { url: '/tools/pdf-merge.html', category: 'PDF' },
        'PDF split': { url: '/tools/pdf-split.html', category: 'PDF' },
        'PDF compress': { url: '/tools/pdf-compress.html', category: 'PDF' },
        'PDF to Word': { url: '/tools/pdf-to-word.html', category: 'PDF' },
        'Word to PDF': { url: '/tools/word-to-pdf.html', category: 'PDF' },
        'image resize': { url: '/tools/image-resize.html', category: 'Image' },
        'image compress': { url: '/tools/image-compress.html', category: 'Image' },
        'JSON formatter': { url: '/tools/json-formatter.html', category: 'Developer' },
        'QR code': { url: '/tools/qr-generator.html', category: 'Utility' },
        'password generator': { url: '/tools/password-generator.html', category: 'Developer' },
        'base64': { url: '/tools/base64-encode.html', category: 'Text' },
        'URL encode': { url: '/tools/url-encode.html', category: 'Text' },
        'hash generator': { url: '/tools/hash-generator.html', category: 'Developer' },
        'UUID generator': { url: '/tools/uuid-generator.html', category: 'Developer' }
    };
    
    // Add internal links to content
    function addInternalLinks() {
        const contentAreas = document.querySelectorAll('article, .tool-content, main p, main li');
        
        contentAreas.forEach(area => {
            let html = area.innerHTML;
            let modified = false;
            
            Object.keys(toolMentions).forEach(mention => {
                const tool = toolMentions[mention];
                const regex = new RegExp(`\\b${mention}\\b`, 'gi');
                
                if (regex.test(html) && !html.includes(`href="${tool.url}"`)) {
                    html = html.replace(regex, (match) => {
                        return `<a href="${tool.url}" style="color: var(--primary-color); text-decoration: none; font-weight: 500;" onmouseover="this.style.textDecoration='underline'" onmouseout="this.style.textDecoration='none'">${match}</a>`;
                    });
                    modified = true;
                }
            });
            
            if (modified) {
                area.innerHTML = html;
            }
        });
    }
    
    // Add "You might also like" section
    function addRelatedToolsSection() {
        const path = window.location.pathname;
        const toolMatch = path.match(/tools\/([^\/]+)\.html/);
        
        if (!toolMatch || typeof tools === 'undefined') return;
        
        const toolSlug = toolMatch[1];
        const currentTool = tools.find(t => t.page.includes(toolSlug));
        
        if (!currentTool) return;
        
        // Find related tools in same category
        const related = tools
            .filter(t => 
                t.category === currentTool.category && 
                t.id !== currentTool.id
            )
            .slice(0, 4);
        
        if (related.length === 0) return;
        
        const section = document.createElement('div');
        section.className = 'related-tools-inline';
        section.style.cssText = `
            margin: 2rem 0;
            padding: 1.5rem;
            background: var(--bg-card);
            border-radius: 12px;
            border: 1px solid var(--border-color);
        `;
        
        section.innerHTML = `
            <h3 style="margin-bottom: 1rem; color: var(--text-primary); font-size: 1.2rem;">
                🔗 You might also like:
            </h3>
            <div style="display: flex; flex-wrap: wrap; gap: 1rem;">
                ${related.map(tool => `
                    <a href="/${tool.page}" style="
                        display: inline-flex;
                        align-items: center;
                        gap: 0.5rem;
                        padding: 0.5rem 1rem;
                        background: var(--bg-hover);
                        border-radius: 8px;
                        text-decoration: none;
                        color: var(--text-primary);
                        transition: all 0.2s;
                        font-size: 0.9rem;
                    " onmouseover="this.style.background='var(--primary-color)'; this.style.color='white';" onmouseout="this.style.background='var(--bg-hover)'; this.style.color='var(--text-primary)';">
                        <span>${tool.icon}</span>
                        <span>${tool.title}</span>
                    </a>
                `).join('')}
            </div>
        `;
        
        // Insert before footer or at end of main content
        const footer = document.querySelector('footer');
        const main = document.querySelector('main');
        
        if (footer) {
            footer.parentNode.insertBefore(section, footer);
        } else if (main) {
            main.appendChild(section);
        }
    }
    
    // Initialize
    document.addEventListener('DOMContentLoaded', () => {
        // Delay to avoid interfering with other scripts
        setTimeout(() => {
            addInternalLinks();
            addRelatedToolsSection();
        }, 1000);
    });
})();




