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

let processed = 0;
let skipped = 0;
let errors = 0;

htmlFiles.forEach(filePath => {
    let content = fs.readFileSync(filePath, 'utf8');
    const originalContent = content;
    
    // Skip if already has link around logo
    if (content.includes('<a href="/index.html"') && 
        content.includes('logo-section') && 
        content.includes('OmniToolset')) {
        skipped++;
        return;
    }
    
    // Pattern: Find logo-section div with h1.logo inside, but no link
    // Match various indentation styles
    const patterns = [
        // Pattern 1: Standard indentation
        /(<div class="logo-section"[^>]*>)\s*<h1 class="logo"([^>]*)>([^<]+)<\/h1>\s*<\/div>/g,
        // Pattern 2: With newlines
        /(<div class="logo-section"[^>]*>)\s*\n\s*<h1 class="logo"([^>]*)>([^<]+)<\/h1>\s*\n\s*<\/div>/g,
        // Pattern 3: More flexible
        /(<div class="logo-section"[^>]*>)([\s\S]*?)<h1 class="logo"([^>]*)>([^<]+)<\/h1>([\s\S]*?)(<\/div>)/g,
    ];
    
    let modified = false;
    
    // Try first pattern (most common)
    if (content.match(/<div class="logo-section"[^>]*>\s*<h1 class="logo"/)) {
        content = content.replace(
            /(<div class="logo-section"[^>]*>)\s*<h1 class="logo"([^>]*)>([^<]+)<\/h1>\s*<\/div>/g,
            (match, div, h1Attrs, text) => {
                // Detect indentation
                const lines = match.split('\n');
                let indent = '        ';
                if (lines.length > 1) {
                    const lastLine = lines[lines.length - 1];
                    indent = lastLine.match(/^(\s*)/)?.[1] || '        ';
                }
                return `${div}\n${indent}<a href="/index.html" style="text-decoration: none; color: inherit;">\n${indent}  <h1 class="logo"${h1Attrs}>${text}</h1>\n${indent}</a>\n${indent}</div>`;
            }
        );
        modified = true;
    }
    
    // Try pattern with newlines
    if (!modified && content.match(/<div class="logo-section"[^>]*>\s*\n\s*<h1 class="logo"/)) {
        content = content.replace(
            /(<div class="logo-section"[^>]*>)\s*\n(\s*)<h1 class="logo"([^>]*)>([^<]+)<\/h1>\s*\n(\s*)<\/div>/g,
            (match, div, indent1, h1Attrs, text, indent2) => {
                const indent = indent1 || indent2 || '        ';
                return `${div}\n${indent}<a href="/index.html" style="text-decoration: none; color: inherit;">\n${indent}  <h1 class="logo"${h1Attrs}>${text}</h1>\n${indent}</a>\n${indent}</div>`;
            }
        );
        modified = true;
    }
    
    // Try more flexible pattern
    if (!modified) {
        content = content.replace(
            /(<div class="logo-section"[^>]*>)(\s*)(<h1 class="logo"([^>]*)>)([^<]+)(<\/h1>)(\s*)(<\/div>)/g,
            (match, div, space1, h1Open, h1Attrs, text, h1Close, space2, divClose) => {
                // Get indentation from space1 or space2
                const indent = space1.match(/^(\s*)/)?.[1] || space2.match(/^(\s*)/)?.[1] || '        ';
                return `${div}\n${indent}<a href="/index.html" style="text-decoration: none; color: inherit;">\n${indent}  ${h1Open}${text}${h1Close}\n${indent}</a>\n${indent}${divClose}`;
            }
        );
        if (content !== originalContent) {
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
    } else if (!modified) {
        skipped++;
    }
});

console.log(`\n📊 Summary:`);
console.log(`   ✅ Processed: ${processed}`);
console.log(`   ⏭️  Skipped: ${skipped}`);
console.log(`   ❌ Errors: ${errors}`);
console.log(`   📁 Total: ${htmlFiles.length}`);
