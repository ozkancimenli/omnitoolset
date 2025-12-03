// Content Quality Enhancer - Adds detailed descriptions, FAQs, usage examples
function addToolFAQ(toolId, toolTitle) {
    const faqs = {
        'pdf-merge': [
            { q: 'How many PDF files can I merge?', a: 'You can merge unlimited PDF files. There\'s no limit on the number of files you can combine.' },
            { q: 'Will my files be uploaded to a server?', a: 'No! All processing happens in your browser. Your files never leave your device, ensuring complete privacy.' },
            { q: 'What file size limits apply?', a: 'There are no file size limits. However, very large files may take longer to process depending on your device.' }
        ],
        'pdf-split': [
            { q: 'Can I split a PDF by page ranges?', a: 'Yes! You can specify which pages to extract, or split into equal parts.' },
            { q: 'Is the original PDF modified?', a: 'No, the original PDF remains unchanged. You\'ll download new PDF files with the split pages.' }
        ],
        'image-resize': [
            { q: 'What image formats are supported?', a: 'We support JPG, PNG, WEBP, GIF, and BMP formats.' },
            { q: 'Will image quality be reduced?', a: 'We use high-quality resizing algorithms. For best results, avoid resizing images to much larger sizes.' }
        ]
    };
    
    const toolFAQs = faqs[toolId] || [
        { q: `Is ${toolTitle} really free?`, a: 'Yes! All our tools are 100% free forever. No registration, no watermarks, unlimited use.' },
        { q: 'How does it work?', a: 'All processing happens in your browser. Your files never leave your device, ensuring complete privacy and security.' },
        { q: 'Do I need to install anything?', a: 'No installation required! Just open the tool in your browser and start using it immediately.' }
    ];
    
    if (toolFAQs.length === 0) return '';
    
    return `
        <div class="tool-faq" style="margin: 3rem 0; padding: 2rem; background: var(--bg-card); border-radius: 20px; border: 1px solid var(--border-color);">
            <h3 style="margin-bottom: 1.5rem; color: var(--text-primary); font-size: 1.5rem;">❓ Frequently Asked Questions</h3>
            <div style="display: flex; flex-direction: column; gap: 1.5rem;">
                ${toolFAQs.map((faq, index) => `
                    <div class="faq-item" style="border-bottom: 1px solid var(--border-color); padding-bottom: 1rem;">
                        <h4 style="color: var(--text-primary); margin-bottom: 0.5rem; font-size: 1.1rem;">${faq.q}</h4>
                        <p style="color: var(--text-secondary); line-height: 1.6; margin: 0;">${faq.a}</p>
                    </div>
                `).join('')}
            </div>
        </div>
    `;
}

function addUsageExamples(toolId, toolTitle) {
    const examples = {
        'pdf-merge': [
            'Combine multiple invoices into one document',
            'Merge research papers for easy reading',
            'Join separate chapters into a complete book'
        ],
        'image-resize': [
            'Resize photos for social media profiles',
            'Optimize images for website uploads',
            'Create thumbnails from large images'
        ],
        'json-formatter': [
            'Format API responses for readability',
            'Validate JSON data structure',
            'Minify JSON for production use'
        ]
    };
    
    const toolExamples = examples[toolId] || [
        `Use ${toolTitle} to save time and increase productivity`,
        'Process files instantly without software installation',
        'Work with your files securely in your browser'
    ];
    
    return `
        <div class="usage-examples" style="margin: 3rem 0; padding: 2rem; background: var(--bg-card); border-radius: 20px; border: 1px solid var(--border-color);">
            <h3 style="margin-bottom: 1.5rem; color: var(--text-primary); font-size: 1.5rem;">💡 Common Use Cases</h3>
            <ul style="color: var(--text-secondary); line-height: 1.8; list-style: none; padding: 0; margin: 0;">
                ${toolExamples.map(example => `
                    <li style="padding: 0.75rem 0; padding-left: 2rem; position: relative;">
                        <span style="position: absolute; left: 0; color: var(--primary-color);">✓</span>
                        ${example}
                    </li>
                `).join('')}
            </ul>
        </div>
    `;
}

function enhanceToolPage() {
    const path = window.location.pathname;
    const toolMatch = path.match(/tools\/([^\/]+)\.html/);
    
    if (!toolMatch) return;
    
    const toolSlug = toolMatch[1];
    const toolId = toolSlug.replace(/-/g, '-');
    
    // Get tool info
    let toolTitle = toolSlug.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
    let toolCategory = 'Utility';
    
    if (typeof tools !== 'undefined') {
        const tool = tools.find(t => t.page.includes(toolSlug));
        if (tool) {
            toolTitle = tool.title;
            toolCategory = tool.category;
        }
    }
    
    // Find tool container
    const toolContainer = document.querySelector('.tool-container');
    if (!toolContainer) return;
    
    // Add usage examples
    const examplesHTML = addUsageExamples(toolId, toolTitle);
    if (examplesHTML) {
        toolContainer.insertAdjacentHTML('beforeend', examplesHTML);
    }
    
    // Add FAQ
    const faqHTML = addToolFAQ(toolId, toolTitle);
    if (faqHTML) {
        toolContainer.insertAdjacentHTML('beforeend', faqHTML);
    }
    
    // Add structured data for FAQ
    if (faqHTML) {
        const faqData = {
            "@context": "https://schema.org",
            "@type": "FAQPage",
            "mainEntity": [
                {
                    "@type": "Question",
                    "name": `Is ${toolTitle} really free?`,
                    "acceptedAnswer": {
                        "@type": "Answer",
                        "text": "Yes! All our tools are 100% free forever. No registration, no watermarks, unlimited use."
                    }
                }
            ]
        };
        
        const script = document.createElement('script');
        script.type = 'application/ld+json';
        script.textContent = JSON.stringify(faqData);
        document.head.appendChild(script);
    }
}

document.addEventListener('DOMContentLoaded', enhanceToolPage);

