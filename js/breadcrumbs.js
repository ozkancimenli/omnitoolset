// Breadcrumbs System for SEO and Navigation
function createBreadcrumbs() {
    const path = window.location.pathname;
    const breadcrumbs = [];
    
    // Home
    breadcrumbs.push({ name: 'Home', url: '/' });
    
    // Parse path
    if (path.includes('/tools/')) {
        breadcrumbs.push({ name: 'Tools', url: '/all-tools.html' });
        
        const toolMatch = path.match(/tools\/([^\/]+)\.html/);
        if (toolMatch) {
            const toolSlug = toolMatch[1];
            let toolName = toolSlug.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
            
            // Try to get actual tool name from tools array
            if (typeof tools !== 'undefined') {
                const tool = tools.find(t => t.page.includes(toolSlug));
                if (tool) {
                    toolName = tool.title;
                }
            }
            
            breadcrumbs.push({ name: toolName, url: path });
        }
    } else if (path.includes('/blog/')) {
        breadcrumbs.push({ name: 'Blog', url: '/blog.html' });
        
        const blogMatch = path.match(/blog\/([^\/]+)\.html/);
        if (blogMatch) {
            const blogSlug = blogMatch[1];
            let blogName = blogSlug.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
            breadcrumbs.push({ name: blogName, url: path });
        }
    } else if (path.includes('blog.html')) {
        breadcrumbs.push({ name: 'Blog', url: '/blog.html' });
    } else if (path.includes('about.html')) {
        breadcrumbs.push({ name: 'About', url: '/about.html' });
    } else if (path.includes('contact.html')) {
        breadcrumbs.push({ name: 'Contact', url: '/contact.html' });
    }
    
    // Don't show breadcrumbs on homepage
    if (breadcrumbs.length <= 1) return;
    
    const breadcrumbContainer = document.createElement('nav');
    breadcrumbContainer.setAttribute('aria-label', 'Breadcrumb');
    breadcrumbContainer.style.cssText = 'margin: 1rem 0 2rem 0; padding: 0.75rem 0;';
    
    breadcrumbContainer.innerHTML = `
        <ol style="display: flex; flex-wrap: wrap; align-items: center; list-style: none; padding: 0; margin: 0; gap: 0.5rem; font-size: 0.9rem;">
            ${breadcrumbs.map((crumb, index) => {
                const isLast = index === breadcrumbs.length - 1;
                return `
                    <li style="display: flex; align-items: center; gap: 0.5rem;">
                        ${index > 0 ? '<span style="color: var(--text-secondary);">/</span>' : ''}
                        ${isLast 
                            ? `<span style="color: var(--text-primary); font-weight: 600;">${crumb.name}</span>`
                            : `<a href="${crumb.url}" style="color: var(--text-secondary); text-decoration: none; transition: color 0.2s;" onmouseover="this.style.color='var(--primary-color)'" onmouseout="this.style.color='var(--text-secondary)'">${crumb.name}</a>`
                        }
                    </li>
                `;
            }).join('')}
        </ol>
    `;
    
    // Add structured data
    const structuredData = {
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        "itemListElement": breadcrumbs.map((crumb, index) => ({
            "@type": "ListItem",
            "position": index + 1,
            "name": crumb.name,
            "item": `https://www.omnitoolset.com${crumb.url}`
        }))
    };
    
    const script = document.createElement('script');
    script.type = 'application/ld+json';
    script.textContent = JSON.stringify(structuredData);
    document.head.appendChild(script);
    
    // Insert breadcrumbs after header or at start of main
    const main = document.querySelector('main');
    const backButton = document.querySelector('.back-button');
    
    if (main) {
        if (backButton) {
            backButton.parentNode.insertBefore(breadcrumbContainer, backButton);
        } else {
            main.insertBefore(breadcrumbContainer, main.firstChild);
        }
    }
}

// Auto-create breadcrumbs
document.addEventListener('DOMContentLoaded', createBreadcrumbs);

