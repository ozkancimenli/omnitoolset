// Loading States and Skeleton Screens
(function() {
    'use strict';
    
    // Create skeleton loader for tools grid
    function createSkeletonLoader() {
        const skeleton = document.createElement('div');
        skeleton.className = 'skeleton-loader';
        skeleton.innerHTML = `
            <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(250px, 1fr)); gap: 1.5rem; margin: 2rem 0;">
                ${Array(12).fill(0).map(() => `
                    <div class="skeleton-card" style="
                        background: var(--bg-card);
                        border-radius: 20px;
                        padding: 1.5rem;
                        border: 1px solid var(--border-color);
                        animation: pulse 1.5s ease-in-out infinite;
                    ">
                        <div style="
                            width: 60px;
                            height: 60px;
                            background: var(--bg-hover);
                            border-radius: 12px;
                            margin-bottom: 1rem;
                        "></div>
                        <div style="
                            width: 80%;
                            height: 20px;
                            background: var(--bg-hover);
                            border-radius: 4px;
                            margin-bottom: 0.5rem;
                        "></div>
                        <div style="
                            width: 60%;
                            height: 16px;
                            background: var(--bg-hover);
                            border-radius: 4px;
                        "></div>
                    </div>
                `).join('')}
            </div>
        `;
        return skeleton;
    }
    
    // Show loading state
    function showLoading(element) {
        if (!element) return;
        const skeleton = createSkeletonLoader();
        element.innerHTML = '';
        element.appendChild(skeleton);
    }
    
    // Hide loading state
    function hideLoading(element) {
        if (!element) return;
        const skeleton = element.querySelector('.skeleton-loader');
        if (skeleton) {
            skeleton.remove();
        }
    }
    
    // Add CSS animation
    if (!document.getElementById('skeleton-styles')) {
        const style = document.createElement('style');
        style.id = 'skeleton-styles';
        style.textContent = `
            @keyframes pulse {
                0%, 100% {
                    opacity: 1;
                }
                50% {
                    opacity: 0.5;
                }
            }
        `;
        document.head.appendChild(style);
    }
    
    // Show loading on tools grid
    document.addEventListener('DOMContentLoaded', () => {
        const toolsGrid = document.getElementById('toolsGrid') || document.getElementById('allToolsGrid');
        if (toolsGrid && toolsGrid.children.length === 0) {
            showLoading(toolsGrid);
            
            // Hide after tools are loaded
            const observer = new MutationObserver(() => {
                if (toolsGrid.children.length > 0) {
                    hideLoading(toolsGrid);
                    observer.disconnect();
                }
            });
            observer.observe(toolsGrid, { childList: true });
        }
    });
    
    // Export functions
    window.showLoading = showLoading;
    window.hideLoading = hideLoading;
})();




