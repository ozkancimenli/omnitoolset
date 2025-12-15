#!/usr/bin/env node

/**
 * Script to add standard ad blocks to blog pages that are missing them
 */

const fs = require('fs');
const path = require('path');

const blogDir = path.join(__dirname, 'blog');
const files = fs.readdirSync(blogDir).filter(f => f.endsWith('.html'));

// Blog pages without ads
const missingAds = [
    'how-to-merge-pdf-files.html',
    'how-to-split-pdf-files.html',
    'how-to-compress-pdf-files.html',
    'how-to-resize-images-online.html',
    'how-to-convert-pdf-to-word.html',
    'best-free-pdf-tools-online.html'
];

// Standard ad blocks for blog
const ADSTERRA_TOP = `            <!-- Adsterra Native Banner (Top) - data-cfasync="false" prevents Cloudflare RocketLoader interference -->
            <div style="margin: 2rem 0; text-align: center;">
                <div id="container-612a325632297ecc15cfd2d178f355ec"></div>
                <script data-cfasync="false" type='text/javascript' src='https://pl28055637.effectivegatecpm.com/612a325632297ecc15cfd2d178f355ec/invoke.js'></script>
            </div>

            <!-- AdSense Banner Ad (Top) -->
            <div style="margin: 2rem 0; text-align: center; min-height: 100px;">
                <ins class="adsbygoogle"
                     style="display:block"
                     data-ad-client="ca-pub-8640955536193345"
                     data-ad-format="auto"
                     data-full-width-responsive="true"></ins>
                <script>
                     (adsbygoogle = window.adsbygoogle || []).push({});
                </script>
            </div>`;

const ADSENSE_MIDDLE = `
            <!-- AdSense Banner Ad (Middle) -->
            <div style="margin: 2rem 0; text-align: center; min-height: 100px;">
                <ins class="adsbygoogle"
                     style="display:block"
                     data-ad-client="ca-pub-8640955536193345"
                     data-ad-format="auto"
                     data-full-width-responsive="true"></ins>
                <script>
                     (adsbygoogle = window.adsbygoogle || []).push({});
                </script>
            </div>`;

const ADSENSE_BOTTOM = `
        <!-- AdSense Banner Ad (Bottom) -->
        <div style="margin: 2rem 0; text-align: center; min-height: 100px;">
            <ins class="adsbygoogle"
                 style="display:block"
                 data-ad-client="ca-pub-8640955536193345"
                 data-ad-format="auto"
                 data-full-width-responsive="true"></ins>
            <script>
                 (adsbygoogle = window.adsbygoogle || []).push({});
            </script>
        </div>`;

let processed = 0;
let errors = 0;

missingAds.forEach(file => {
    const filePath = path.join(blogDir, file);
    if (!fs.existsSync(filePath)) {
        console.log(`⚠️  ${file} not found`);
        return;
    }

    let content = fs.readFileSync(filePath, 'utf8');
    let modified = false;

    // Check if ads already exist
    const hasAds = content.includes('AdSense Banner Ad') || content.includes('Adsterra Native Banner');
    
    if (hasAds) {
        console.log(`⏭️  ${file} (already has ads)`);
        return;
    }

    // Add AdSense script to head if missing
    if (!content.includes('pagead/js/adsbygoogle.js')) {
        const headClosePattern = /(<\/head>)/;
        const adSenseScript = `    <meta name="google-adsense-account" content="ca-pub-8640955536193345">
    <script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-8640955536193345"
     crossorigin="anonymous"></script>
    <!-- Adsterra Popunder (Head) - data-cfasync="false" prevents Cloudflare RocketLoader interference -->
    <script data-cfasync="false" type='text/javascript' src='https://pl28055668.effectivegatecpm.com/5c/e4/ee/5ce4ee5ab685f82c323752c9b8d45ace.js'></script>
`;
        if (content.includes('</head>')) {
            content = content.replace('</head>', adSenseScript + '</head>');
            modified = true;
        }
    }

    // Find main tag
    const mainPattern = /<main[^>]*>/;
    const mainMatch = content.match(mainPattern);
    
    if (mainMatch) {
        // Add ads after main opening tag
        const afterMain = mainMatch[0] + '\n' + ADSTERRA_TOP;
        content = content.replace(mainPattern, afterMain);
        modified = true;
    }

    // Add middle ad before </article> or in middle of content
    const articleClosePattern = /(\s*)<\/article>/;
    if (content.includes('<article')) {
        const articleMatch = content.match(articleClosePattern);
        if (articleMatch) {
            const indent = articleMatch[1] || '            ';
            content = content.replace(articleClosePattern, indent + ADSENSE_MIDDLE.trim() + '\n' + articleMatch[0]);
            modified = true;
        }
    }

    // Add bottom ad before </main>
    const mainClosePattern = /(\s*)<\/main>/;
    const mainCloseMatch = content.match(mainClosePattern);
    if (mainCloseMatch) {
        const indent = mainCloseMatch[1] || '        ';
        content = content.replace(mainClosePattern, indent + ADSENSE_BOTTOM.trim() + '\n' + mainCloseMatch[0]);
        modified = true;
    }

    // Add Adsterra Popunder before </body>
    if (!content.includes('pl28059282.effectivegatecpm.com')) {
        const bodyClosePattern = /(<\/body>)/;
        const adsterraBody = `    <!-- Adsterra Popunder (Body) - data-cfasync="false" prevents Cloudflare RocketLoader interference -->
    <script data-cfasync="false" type='text/javascript' src='https://pl28059282.effectivegatecpm.com/90/94/fe/9094fe56f6d4377965dfac5145838787.js'></script>
`;
        if (content.includes('</body>')) {
            content = content.replace('</body>', adsterraBody + '</body>');
            modified = true;
        }
    }

    if (modified) {
        try {
            fs.writeFileSync(filePath, content, 'utf8');
            processed++;
            console.log(`✅ ${file}`);
        } catch (e) {
            errors++;
            console.error(`❌ ${file}: ${e.message}`);
        }
    }
});

console.log(`\n📊 Summary:`);
console.log(`   ✅ Processed: ${processed}`);
console.log(`   ❌ Errors: ${errors}`);
console.log(`   📁 Total: ${missingAds.length}`);
