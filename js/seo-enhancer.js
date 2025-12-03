// Advanced SEO Enhancements
(function() {
    'use strict';
    
    // Add article structured data for blog posts
    function addArticleStructuredData() {
        const path = window.location.pathname;
        
        if (path.includes('/blog/')) {
            const article = {
                "@context": "https://schema.org",
                "@type": "Article",
                "headline": document.querySelector('h1, h2')?.textContent || document.title,
                "description": document.querySelector('meta[name="description"]')?.content || '',
                "datePublished": document.querySelector('time')?.getAttribute('datetime') || new Date().toISOString(),
                "author": {
                    "@type": "Organization",
                    "name": "OmniToolset"
                },
                "publisher": {
                    "@type": "Organization",
                    "name": "OmniToolset",
                    "logo": {
                        "@type": "ImageObject",
                        "url": "https://www.omnitoolset.com/og-image.jpg"
                    }
                }
            };
            
            const script = document.createElement('script');
            script.type = 'application/ld+json';
            script.textContent = JSON.stringify(article);
            document.head.appendChild(script);
        }
    }
    
    // Add HowTo structured data for tool pages
    function addHowToStructuredData() {
        const path = window.location.pathname;
        
        if (path.includes('/tools/')) {
            const toolName = document.querySelector('h1, h2')?.textContent || document.title;
            const howTo = {
                "@context": "https://schema.org",
                "@type": "HowTo",
                "name": `How to use ${toolName}`,
                "description": document.querySelector('meta[name="description"]')?.content || '',
                "step": [
                    {
                        "@type": "HowToStep",
                        "name": "Select your files",
                        "text": "Choose the files you want to process"
                    },
                    {
                        "@type": "HowToStep",
                        "name": "Process",
                        "text": "Click the process button to start"
                    },
                    {
                        "@type": "HowToStep",
                        "name": "Download",
                        "text": "Download your processed files"
                    }
                ]
            };
            
            const script = document.createElement('script');
            script.type = 'application/ld+json';
            script.textContent = JSON.stringify(howTo);
            document.head.appendChild(script);
        }
    }
    
    // Add Organization structured data
    function addOrganizationStructuredData() {
        const organization = {
            "@context": "https://schema.org",
            "@type": "Organization",
            "name": "OmniToolset",
            "url": "https://www.omnitoolset.com",
            "logo": "https://www.omnitoolset.com/og-image.jpg",
            "description": "270+ free online tools for PDF, Image, Text, Developer, Student, Engineering, and more",
            "sameAs": [
                // Add social media links when available
            ]
        };
        
        const script = document.createElement('script');
        script.type = 'application/ld+json';
        script.textContent = JSON.stringify(organization);
        document.head.appendChild(script);
    }
    
    // Add WebSite structured data with search action
    function addWebSiteStructuredData() {
        const website = {
            "@context": "https://schema.org",
            "@type": "WebSite",
            "name": "OmniToolset",
            "url": "https://www.omnitoolset.com",
            "potentialAction": {
                "@type": "SearchAction",
                "target": {
                    "@type": "EntryPoint",
                    "urlTemplate": "https://www.omnitoolset.com/all-tools.html?search={search_term_string}"
                },
                "query-input": "required name=search_term_string"
            }
        };
        
        const script = document.createElement('script');
        script.type = 'application/ld+json';
        script.textContent = JSON.stringify(website);
        document.head.appendChild(script);
    }
    
    // Initialize on DOM ready
    document.addEventListener('DOMContentLoaded', () => {
        addOrganizationStructuredData();
        addWebSiteStructuredData();
        addArticleStructuredData();
        addHowToStructuredData();
    });
})();

