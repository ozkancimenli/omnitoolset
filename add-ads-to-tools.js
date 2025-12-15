#!/usr/bin/env node

/**
 * Script to add standard ad blocks to all tool pages
 * Adds: Adsterra Native Banner (top) + AdSense Banner (top + bottom)
 */

const fs = require('fs');
const path = require('path');

const toolsDir = path.join(__dirname, 'tools');
const files = fs.readdirSync(toolsDir).filter(f => f.endsWith('.html'));

// Standard ad blocks
const ADSTERRA_TOP = `        <!-- Adsterra Native Banner (Top) - data-cfasync="false" prevents Cloudflare RocketLoader interference -->
        <div style="margin: 1rem 0; text-align: center;">
            <div id="container-612a325632297ecc15cfd2d178f355ec"></div>
            <script data-cfasync="false" type='text/javascript' src='https://pl28055637.effectivegatecpm.com/612a325632297ecc15cfd2d178f355ec/invoke.js'></script>
        </div>

        <!-- AdSense Banner Ad (Top) -->
        <div style="margin: 1rem 0; text-align: center; max-width: 100%;">
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
        <div style="margin: 2rem 0; text-align: center; max-width: 100%;">
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
let skipped = 0;
let errors = 0;

files.forEach(file => {
    const filePath = path.join(toolsDir, file);
    let content = fs.readFileSync(filePath, 'utf8');
    let modified = false;

    // Check if ads already exist (more specific check)
    const hasAdsterraBanner = content.includes('container-612a325632297ecc15cfd2d178f355ec') && content.includes('Adsterra Native Banner');
    const hasAdSenseBanner = content.includes('AdSense Banner Ad') && content.includes('adsbygoogle') && content.includes('ca-pub-8640955536193345');
    const hasBothBanners = hasAdsterraBanner && hasAdSenseBanner;

    // Find main tag and back-button
    const backButtonPattern = /<a href="[^"]*" class="back-button"[^>]*>.*?<\/a>/s;
    const backButtonMatch = content.match(backButtonPattern);

    if (backButtonMatch) {
        // Add ads after back button
        const afterBackButton = backButtonMatch[0] + '\n        \n        ' + ADSTERRA_TOP;
        
        if (!hasBothBanners) {
            content = content.replace(backButtonPattern, afterBackButton);
            modified = true;
        }
    } else {
        // Try to find tool-container or main content
        const toolContainerPattern = /<div class="tool-container"[^>]*>/;
        const toolContainerMatch = content.match(toolContainerPattern);
        
        if (toolContainerMatch && !hasBothBanners) {
            content = content.replace(toolContainerPattern, ADSTERRA_TOP + '\n        ' + toolContainerMatch[0]);
            modified = true;
        }
    }

    // Add bottom AdSense before </main>
    if (!content.includes('AdSense Banner Ad (Bottom)')) {
        const mainClosePattern = /(\s*)<\/main>/;
        const mainCloseMatch = content.match(mainClosePattern);
        
        if (mainCloseMatch) {
            const indent = mainCloseMatch[1] || '        ';
            content = content.replace(mainClosePattern, indent + ADSENSE_BOTTOM.trim() + '\n' + mainCloseMatch[0]);
            modified = true;
        }
    }

    // Ensure AdSense script is in head
    if (!content.includes('pagead/js/adsbygoogle.js')) {
        const headClosePattern = /(<\/head>)/;
        const adSenseScript = `    <meta name="google-adsense-account" content="ca-pub-8640955536193345">
    <script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-8640955536193345"
     crossorigin="anonymous"></script>
`;
        
        if (content.includes('</head>')) {
            content = content.replace('</head>', adSenseScript + '</head>');
            modified = true;
        }
    }

    // Ensure Adsterra Popunder scripts
    if (!content.includes('pl28055668.effectivegatecpm.com')) {
        const headClosePattern = /(<\/head>)/;
        const adsterraHead = `    <!-- Adsterra Popunder (Head) - data-cfasync="false" prevents Cloudflare RocketLoader interference -->
    <script data-cfasync="false" type='text/javascript' src='https://pl28055668.effectivegatecpm.com/5c/e4/ee/5ce4ee5ab685f82c323752c9b8d45ace.js'></script>
`;
        
        if (content.includes('</head>')) {
            content = content.replace('</head>', adsterraHead + '</head>');
            modified = true;
        }
    }

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
    } else {
        skipped++;
        console.log(`⏭️  ${file} (already has ads)`);
    }
});

console.log(`\n📊 Summary:`);
console.log(`   ✅ Processed: ${processed}`);
console.log(`   ⏭️  Skipped: ${skipped}`);
console.log(`   ❌ Errors: ${errors}`);
console.log(`   📁 Total: ${files.length}`);
