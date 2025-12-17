/**
 * WordPress-style Sidebar with Ads
 * Automatically adds sidebar to pages that need it
 */

(function() {
    'use strict';
    
    // Sidebar HTML template
    const sidebarHTML = `
        <aside class="sidebar">
            <div class="sidebar-widget">
                <h3>📢 AdSense</h3>
                <div style="min-height: 250px; text-align: center;">
                    <ins class="adsbygoogle"
                         style="display:block"
                         data-ad-client="ca-pub-8640955536193345"
                         data-ad-slot="SIDEBAR_AD_SLOT"
                         data-ad-format="rectangle"
                         data-full-width-responsive="false"></ins>
                    <script>
                        (adsbygoogle = window.adsbygoogle || []).push({});
                    </script>
                </div>
            </div>
            
            <div class="sidebar-widget">
                <h3>🛍️ Recommended Products</h3>
                <div style="margin-bottom: 1rem;">
                    <a href="https://www.awin1.com/cread.php?awinmid=28349&awinaffid=2682178&clickref=omnitoolset-sidebar&ued=https%3A%2F%2Fwww.oedro.com%2F" 
                       target="_blank" 
                       rel="nofollow sponsored"
                       style="display: block; margin-bottom: 1rem;">
                        <img src="/Oedro Advertiser Directory 300x250.jpg" 
                             alt="OEDRO Auto Parts" 
                             style="width: 100%; height: auto; border-radius: 8px;">
                    </a>
                </div>
            </div>
            
            <div class="sidebar-widget">
                <h3>🎬 Premium Projectors</h3>
                <div style="padding: 1rem; background: linear-gradient(135deg, #1e40af 0%, #3b82f6 100%); border-radius: 8px; text-align: center; color: white; margin-bottom: 1rem;">
                    <div style="font-size: 2rem; margin-bottom: 0.5rem;">🎬</div>
                    <p style="font-size: 0.9rem; margin-bottom: 0.75rem; color: rgba(255,255,255,0.9);">Valerion - Red Dot Winner 2025</p>
                    <a href="https://www.awin1.com/cread.php?awinmid=113200&awinaffid=2682178&clickref=omnitoolset-sidebar&ued=https%3A%2F%2Fwww.valerion.com%2F" 
                       target="_blank" 
                       rel="nofollow sponsored"
                       style="display: inline-block; padding: 0.5rem 1rem; background: white; color: #1e40af; text-decoration: none; border-radius: 6px; font-weight: 600; font-size: 0.85rem;">
                        Shop Now
                    </a>
                </div>
            </div>
            
            <div class="sidebar-widget">
                <h3>🛏️ Premium Airbeds</h3>
                <div style="padding: 1rem; background: linear-gradient(135deg, #1e3a8a 0%, #3b82f6 100%); border-radius: 8px; text-align: center; color: white; margin-bottom: 1rem;">
                    <div style="font-size: 2rem; margin-bottom: 0.5rem;">🛏️</div>
                    <p style="font-size: 0.9rem; margin-bottom: 0.75rem; color: rgba(255,255,255,0.9);">King Koil Airbeds</p>
                    <a href="https://www.awin1.com/cread.php?awinmid=115216&awinaffid=2682178&clickref=omnitoolset-sidebar&ued=https%3A%2F%2Fwww.kingkoilairbeds.com%2F" 
                       target="_blank" 
                       rel="nofollow sponsored"
                       style="display: inline-block; padding: 0.5rem 1rem; background: white; color: #1e3a8a; text-decoration: none; border-radius: 6px; font-weight: 600; font-size: 0.85rem;">
                        Shop Now
                    </a>
                </div>
            </div>
            
            <div class="sidebar-widget">
                <h3>🏹 Premium Crossbows</h3>
                <div style="padding: 1rem; background: linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%); border-radius: 8px; text-align: center; color: white;">
                    <div style="font-size: 2rem; margin-bottom: 0.5rem;">🏹</div>
                    <p style="font-size: 0.9rem; margin-bottom: 0.75rem; color: rgba(255,255,255,0.9);">Ravin Crossbows</p>
                    <a href="https://www.awin1.com/cread.php?awinmid=115809&awinaffid=2682178&clickref=omnitoolset-sidebar&ued=https%3A%2F%2Fravincrossbows.com%2F" 
                       target="_blank" 
                       rel="nofollow sponsored"
                       style="display: inline-block; padding: 0.5rem 1rem; background: white; color: #1a1a1a; text-decoration: none; border-radius: 6px; font-weight: 600; font-size: 0.85rem;">
                        Shop Now
                    </a>
                </div>
            </div>
        </aside>
    `;
    
    function addSidebar() {
        // Check if sidebar already exists
        if (document.querySelector('.sidebar')) {
            return;
        }
        
        // Find main content container
        const mainContent = document.querySelector('main .container') || 
                           document.querySelector('main .tool-container') ||
                           document.querySelector('main');
        
        if (!mainContent) {
            return;
        }
        
        // Check if page should have sidebar (tool pages, blog pages)
        const isToolPage = document.querySelector('.tool-page') || 
                          window.location.pathname.includes('/tools/');
        const isBlogPage = document.querySelector('.blog-page') || 
                          window.location.pathname.includes('/blog/');
        
        if (!isToolPage && !isBlogPage && !window.location.pathname.includes('/blog.html')) {
            return; // Don't add sidebar to homepage, etc.
        }
        
        // Wrap main content and add sidebar
        const parent = mainContent.parentElement;
        const wrapper = document.createElement('div');
        wrapper.className = 'content-with-sidebar';
        
        // Move main content into wrapper
        const mainContentWrapper = document.createElement('div');
        mainContentWrapper.className = 'main-content';
        mainContentWrapper.appendChild(mainContent.cloneNode(true));
        wrapper.appendChild(mainContentWrapper);
        
        // Add sidebar
        wrapper.insertAdjacentHTML('beforeend', sidebarHTML);
        
        // Replace original with wrapper
        parent.replaceChild(wrapper, mainContent);
        
        // Initialize AdSense in sidebar
        if (window.adsbygoogle) {
            window.adsbygoogle.push({});
        }
    }
    
    // Run when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', addSidebar);
    } else {
        addSidebar();
    }
})();
