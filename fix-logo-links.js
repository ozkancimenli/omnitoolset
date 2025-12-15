#!/usr/bin/env node

/**
 * Script to add links to logo in all HTML files
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

// Pattern to match logo without link
const logoPatterns = [
    // Pattern 1: <div class="logo-section">\n                    <h1 class="logo"
    /(<div class="logo-section">\s*)\n(\s*)<h1 class="logo"[^>]*>([^<]+)<\/h1>/g,
    // Pattern 2: <div class="logo-section">\n        <h1 class="logo"
    /(<div class="logo-section">\s*)\n(\s*)<h1 class="logo"[^>]*>([^<]+)<\/h1>/g,
    // Pattern 3: logo-section with different spacing
    /(<div class="logo-section">[^>]*>\s*)\n?(\s*)<h1 class="logo"[^>]*>([^<]+)<\/h1>/g,
];

// Replacement template
const replacement = `$1
$2<a href="/index.html" style="text-decoration: none; color: inherit;">
$2    <h1 class="logo" aria-label="OmniToolset - Free Online Tools">$3</h1>
$2</a>`;

let processed = 0;
let skipped = 0;
let errors = 0;

htmlFiles.forEach(filePath => {
    let content = fs.readFileSync(filePath, 'utf8');
    const originalContent = content;
    
    // Skip if already has link
    if (content.includes('<a href="/index.html"') && content.includes('logo-section')) {
        skipped++;
        return;
    }
    
    // Try different patterns
    let modified = false;
    for (const pattern of logoPatterns) {
        if (pattern.test(content)) {
            content = content.replace(pattern, replacement);
            modified = true;
            break;
        }
    }
    
    // Also handle simpler case: <h1 class="logo"> directly after logo-section
    if (!modified) {
        const simplePattern = /(<div class="logo-section"[^>]*>)\s*<h1 class="logo"([^>]*)>([^<]+)<\/h1>/g;
        if (simplePattern.test(content)) {
            content = content.replace(simplePattern, (match, div, h1Attrs, text) => {
                // Check indentation
                const lines = match.split('\n');
                const indent = lines[lines.length - 1].match(/^(\s*)/)?.[1] || '                    ';
                return `${div}\n${indent}<a href="/index.html" style="text-decoration: none; color: inherit;">\n${indent}    <h1 class="logo"${h1Attrs}>${text}</h1>\n${indent}</a>`;
            });
            modified = true;
        }
    }
    
    // Handle case where h1 is on same line or different line
    if (!modified) {
        const flexiblePattern = /(<div class="logo-section"[^>]*>\s*)(\s*)(<h1 class="logo"[^>]*>)([^<]+)(<\/h1>)/g;
        if (flexiblePattern.test(content)) {
            content = content.replace(flexiblePattern, (match, div, spacing, h1Open, text, h1Close) => {
                const indent = spacing || '                    ';
                return `${div}\n${indent}<a href="/index.html" style="text-decoration: none; color: inherit;">\n${indent}    ${h1Open}${text}${h1Close}\n${indent}</a>`;
            });
            modified = true;
        }
    }
    
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
