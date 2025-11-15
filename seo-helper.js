// SEO Helper - Her tool sayfasına eklenebilir
function addSEO(head, title, description, keywords, url) {
    // Primary Meta Tags
    const metaTitle = document.createElement('meta');
    metaTitle.name = 'title';
    metaTitle.content = title;
    head.appendChild(metaTitle);
    
    const metaDesc = document.createElement('meta');
    metaDesc.name = 'description';
    metaDesc.content = description;
    head.appendChild(metaDesc);
    
    const metaKeywords = document.createElement('meta');
    metaKeywords.name = 'keywords';
    metaKeywords.content = keywords;
    head.appendChild(metaKeywords);
    
    // Open Graph
    const ogTitle = document.createElement('meta');
    ogTitle.property = 'og:title';
    ogTitle.content = title;
    head.appendChild(ogTitle);
    
    const ogDesc = document.createElement('meta');
    ogDesc.property = 'og:description';
    ogDesc.content = description;
    head.appendChild(ogDesc);
    
    const ogUrl = document.createElement('meta');
    ogUrl.property = 'og:url';
    ogUrl.content = `https://omnitoolset.com${url}`;
    head.appendChild(ogUrl);
    
    const ogType = document.createElement('meta');
    ogType.property = 'og:type';
    ogType.content = 'website';
    head.appendChild(ogType);
    
    // Twitter
    const twitterCard = document.createElement('meta');
    twitterCard.property = 'twitter:card';
    twitterCard.content = 'summary_large_image';
    head.appendChild(twitterCard);
    
    const twitterTitle = document.createElement('meta');
    twitterTitle.property = 'twitter:title';
    twitterTitle.content = title;
    head.appendChild(twitterTitle);
    
    const twitterDesc = document.createElement('meta');
    twitterDesc.property = 'twitter:description';
    twitterDesc.content = description;
    head.appendChild(twitterDesc);
    
    // Canonical
    const canonical = document.createElement('link');
    canonical.rel = 'canonical';
    canonical.href = `https://omnitoolset.com${url}`;
    head.appendChild(canonical);
    
    // Structured Data
    const structuredData = {
        "@context": "https://schema.org",
        "@type": "WebApplication",
        "name": title,
        "description": description,
        "url": `https://omnitoolset.com${url}`,
        "applicationCategory": "UtilityApplication",
        "operatingSystem": "Any",
        "offers": {
            "@type": "Offer",
            "price": "0",
            "priceCurrency": "TRY"
        }
    };
    
    const script = document.createElement('script');
    script.type = 'application/ld+json';
    script.textContent = JSON.stringify(structuredData);
    head.appendChild(script);
}
