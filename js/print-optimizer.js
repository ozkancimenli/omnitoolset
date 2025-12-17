// Print Optimization - Better print layouts
(function() {
    'use strict';
    
    // Add print styles
    const printStyles = `
        @media print {
            * {
                background: white !important;
                color: black !important;
                box-shadow: none !important;
            }
            
            header, footer, nav, .main-header, .main-footer,
            .adsbygoogle, [id*="container-"], .quick-actions-menu,
            #quick-actions-fab, button, .category-filter {
                display: none !important;
            }
            
            main {
                max-width: 100% !important;
                padding: 0 !important;
            }
            
            a {
                color: black !important;
                text-decoration: underline !important;
            }
            
            a[href^="http"]:after {
                content: " (" attr(href) ")";
                font-size: 0.8em;
            }
            
            .tool-card, article {
                page-break-inside: avoid;
                margin-bottom: 1rem;
            }
            
            h1, h2, h3 {
                page-break-after: avoid;
            }
        }
    `;
    
    // Inject print styles
    const styleSheet = document.createElement('style');
    styleSheet.textContent = printStyles;
    document.head.appendChild(styleSheet);
    
    // Add print button to tool pages
    function addPrintButton() {
        if (window.location.pathname.includes('/tools/') || window.location.pathname.includes('/blog/')) {
            const printBtn = document.createElement('button');
            printBtn.innerHTML = '🖨️ Print';
            printBtn.setAttribute('aria-label', 'Print this page');
            printBtn.style.cssText = `
                margin-left: 1rem;
                padding: 0.5rem 1rem;
                background: var(--bg-hover);
                color: var(--text-primary);
                border: 1px solid var(--border-color);
                border-radius: 8px;
                cursor: pointer;
                font-size: 0.9rem;
                transition: all 0.2s;
            `;
            
            printBtn.addEventListener('mouseenter', () => {
                printBtn.style.background = 'var(--primary-color)';
                printBtn.style.color = 'white';
                printBtn.style.transform = 'scale(1.05)';
            });
            
            printBtn.addEventListener('mouseleave', () => {
                printBtn.style.background = 'var(--bg-hover)';
                printBtn.style.color = 'var(--text-primary)';
                printBtn.style.transform = 'scale(1)';
            });
            
            printBtn.addEventListener('click', () => {
                window.print();
                
                // Track print event
                if (typeof gtag !== 'undefined') {
                    gtag('event', 'print', {
                        'event_category': 'Engagement',
                        'event_label': window.location.pathname
                    });
                }
            });
            
            // Insert after title or at start of main
            const title = document.querySelector('h1');
            if (title && title.parentNode) {
                const shareBtn = document.querySelector('.share-tool-btn, .share-blog-btn');
                if (shareBtn) {
                    shareBtn.parentNode.insertBefore(printBtn, shareBtn.nextSibling);
                } else {
                    title.parentNode.insertBefore(printBtn, title.nextSibling);
                }
            }
        }
    }
    
    // Initialize
    document.addEventListener('DOMContentLoaded', () => {
        setTimeout(addPrintButton, 1000);
    });
})();





