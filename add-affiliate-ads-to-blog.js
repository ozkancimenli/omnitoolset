#!/usr/bin/env node

/**
 * Script to add affiliate ads (OEDRO, Ravin, King Koil) to all blog pages
 */

const fs = require('fs');
const path = require('path');

const blogDir = path.join(__dirname, 'blog');
const files = fs.readdirSync(blogDir).filter(f => f.endsWith('.html'));

// Affiliate ad blocks
const AFFILIATE_ADS = `
        <!-- Affiliate Ads Section -->
        <div style="margin: 3rem 0;">
            <!-- OEDRO Recommended Products Banner -->
            <div style="margin: 2rem 0; padding: 1.5rem; background: var(--bg-color); border-radius: 12px; border: 1px solid var(--border-color); text-align: center;">
                <h4 style="margin-bottom: 1rem; color: var(--primary-color); font-size: 1rem;">🚗 Need Car Accessories?</h4>
                <a href="https://www.awin1.com/cread.php?awinmid=28349&awinaffid=2682178&clickref=omnitoolset-blog&ued=https%3A%2F%2Fwww.oedro.com%2F" 
                   target="_blank" 
                   rel="nofollow sponsored">
                    <img src="/Oedro Advertiser Directory 300x250.jpg" 
                         alt="OEDRO Auto Parts" 
                         style="max-width: 300px; width: 100%; height: auto; border-radius: 8px; margin: 0 auto; display: block;">
                </a>
                <p style="margin-top: 0.75rem; font-size: 0.85rem; color: var(--text-secondary);">
                    Premium auto parts • Free shipping • 30-day returns
                </p>
            </div>

            <!-- Ravin Crossbows Recommended Products Banner -->
            <div style="margin: 2rem 0; padding: 1.5rem; background: linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%); border-radius: 12px; border: 1px solid var(--border-color); text-align: center;">
                <h4 style="margin-bottom: 1rem; color: white; font-size: 1rem;">🏹 Premium Hunting Crossbows</h4>
                <div style="font-size: 2.5rem; margin: 1rem 0;">🏹</div>
                <p style="color: rgba(255,255,255,0.9); margin-bottom: 1rem; font-size: 0.9rem;">Apex Performance for Elite Hunters</p>
                <a href="https://www.awin1.com/cread.php?awinmid=115809&awinaffid=2682178&clickref=omnitoolset-blog&ued=https%3A%2F%2Fravincrossbows.com%2F" 
                   target="_blank" 
                   rel="nofollow sponsored"
                   style="display: inline-block; padding: 0.75rem 1.5rem; background: white; color: #1a1a1a; text-decoration: none; border-radius: 8px; font-weight: 600;">
                    Shop Ravin Crossbows
                </a>
            </div>

            <!-- King Koil Airbeds Banner -->
            <div style="margin: 2rem 0; padding: 1.5rem; background: linear-gradient(135deg, #1e3a8a 0%, #3b82f6 100%); border-radius: 12px; border: 1px solid var(--border-color); text-align: center; color: white;">
                <h4 style="margin-bottom: 1rem; color: white; font-size: 1rem;">🛏️ Premium Airbeds</h4>
                <p style="color: rgba(255,255,255,0.9); margin-bottom: 1rem; font-size: 0.9rem;">King Koil Luxury Air Mattresses - Built-in Pump, Multiple Sizes</p>
                <a href="https://www.awin1.com/cread.php?awinmid=115216&awinaffid=2682178&clickref=omnitoolset-blog&ued=https%3A%2F%2Fwww.kingkoilairbeds.com%2F" 
                   target="_blank" 
                   rel="nofollow sponsored"
                   style="display: inline-block; padding: 0.75rem 1.5rem; background: white; color: #1e3a8a; text-decoration: none; border-radius: 8px; font-weight: 600;">
                    Shop King Koil Airbeds
                </a>
            </div>
        </div>`;

let processed = 0;
let skipped = 0;
let errors = 0;

files.forEach(file => {
    const filePath = path.join(blogDir, file);
    let content = fs.readFileSync(filePath, 'utf8');
    
    // Skip if already has affiliate ads (check more thoroughly)
    if (content.includes('OEDRO') && content.includes('Ravin') && content.includes('King Koil')) {
        skipped++;
        return;
    }
    
    // Find where to insert - before bottom AdSense or before </main>
    let modified = false;
    
    // Try to insert before bottom AdSense
    const bottomAdPattern = /(\s*)(<!-- AdSense Banner Ad \(Bottom\) -->)/;
    if (bottomAdPattern.test(content)) {
        content = content.replace(bottomAdPattern, AFFILIATE_ADS + '\n$1$2');
        modified = true;
    } else {
        // Insert before </main>
        const mainClosePattern = /(\s*)(<\/main>)/;
        if (mainClosePattern.test(content)) {
            content = content.replace(mainClosePattern, AFFILIATE_ADS + '\n$1$2');
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
    }
});

console.log(`\n📊 Summary:`);
console.log(`   ✅ Processed: ${processed}`);
console.log(`   ⏭️  Skipped: ${skipped}`);
console.log(`   ❌ Errors: ${errors}`);
console.log(`   📁 Total: ${files.length}`);
