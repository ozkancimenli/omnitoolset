#!/usr/bin/env node

/**
 * Script to wrap Adsterra scripts with try-catch and onerror handlers
 * to properly handle ERR_SSL_PROTOCOL_ERROR as per Adsterra recommendations
 */

const fs = require('fs');
const path = require('path');

// Find all HTML files
const rootDir = __dirname;
const htmlFiles = [];

function findHtmlFiles(dir) {
    const files = fs.readdirSync(dir);
    files.forEach(file => {
        const filePath = path.join(dir, file);
        const stat = fs.statSync(filePath);
        if (stat.isDirectory() && !file.startsWith('.') && file !== 'node_modules') {
            findHtmlFiles(filePath);
        } else if (file.endsWith('.html')) {
            htmlFiles.push(filePath);
        }
    });
}

findHtmlFiles(rootDir);

// Patterns to replace
const patterns = [
    {
        // Pattern 1: Direct script src
        find: /<script data-cfasync="false" type=['"]text\/javascript['"] src=['"](https:\/\/pl28055668\.effectivegatecpm\.com\/[^'"]+)['"]><\/script>/g,
        replace: (match, url) => {
            return `<script data-cfasync="false" type='text/javascript'>
        try {
            (function() {
                var script = document.createElement('script');
                script.type = 'text/javascript';
                script.src = '${url}';
                script.onerror = function() { /* Silently ignore SSL errors */ };
                document.head.appendChild(script);
            })();
        } catch(e) { /* Silently ignore */ }
    </script>`;
        }
    },
    {
        // Pattern 2: Native banner invoke.js
        find: /<script data-cfasync="false" type=['"]text\/javascript['"] src=['"](https:\/\/pl28055637\.effectivegatecpm\.com\/[^'"]+)['"]><\/script>/g,
        replace: (match, url) => {
            return `<script data-cfasync="false" type='text/javascript'>
                    try {
                        (function() {
                            var script = document.createElement('script');
                            script.type = 'text/javascript';
                            script.src = '${url}';
                            script.onerror = function() { /* Silently ignore SSL errors */ };
                            document.head.appendChild(script);
                        })();
                    } catch(e) { /* Silently ignore */ }
                </script>`;
        }
    },
    {
        // Pattern 3: Body popunder
        find: /<script data-cfasync="false" type=['"]text\/javascript['"] src=['"](https:\/\/pl28059282\.effectivegatecpm\.com\/[^'"]+)['"]><\/script>/g,
        replace: (match, url) => {
            return `<script data-cfasync="false" type='text/javascript'>
        try {
            (function() {
                var script = document.createElement('script');
                script.type = 'text/javascript';
                script.src = '${url}';
                script.onerror = function() { /* Silently ignore SSL errors */ };
                document.body.appendChild(script);
            })();
        } catch(e) { /* Silently ignore */ }
    </script>`;
        }
    }
];

let processed = 0;
let skipped = 0;
let errors = 0;

htmlFiles.forEach(filePath => {
    let content = fs.readFileSync(filePath, 'utf8');
    const originalContent = content;
    let modified = false;
    
    // Skip if already has try-catch wrapper
    if (content.includes('script.onerror = function()') && content.includes('effectivegatecpm.com')) {
        skipped++;
        return;
    }
    
    // Apply all patterns
    patterns.forEach(pattern => {
        if (pattern.find.test(content)) {
            content = content.replace(pattern.find, pattern.replace);
            modified = true;
        }
    });
    
    if (modified && content !== originalContent) {
        try {
            fs.writeFileSync(filePath, content, 'utf8');
            processed++;
            const relPath = path.relative(rootDir, filePath);
            console.log(`✅ ${relPath}`);
        } catch (e) {
            errors++;
            const relPath = path.relative(rootDir, filePath);
            console.error(`❌ ${relPath}: ${e.message}`);
        }
    } else {
        skipped++;
    }
});

console.log(`\n📊 Summary:`);
console.log(`   ✅ Processed: ${processed}`);
console.log(`   ⏭️  Skipped: ${skipped}`);
console.log(`   ❌ Errors: ${errors}`);
console.log(`   📁 Total: ${htmlFiles.length}`);
