#!/usr/bin/env node

/**
 * Simple script to wrap logo in link
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
    
    // Skip if already has link
    if (content.includes('<a href="/index.html"') && 
        content.includes('logo-section') && 
        content.includes('class="logo"')) {
        skipped++;
        return;
    }
    
    // Find lines with logo that don't have link
    const lines = content.split('\n');
    let modified = false;
    const newLines = [];
    
    for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        const prevLine = i > 0 ? lines[i - 1] : '';
        const nextLine = i < lines.length - 1 ? lines[i + 1] : '';
        
        // Check if this is a logo line without link
        if (line.includes('<h1 class="logo"') && 
            !prevLine.includes('<a href="/index.html"') &&
            !line.includes('<a href="/index.html"')) {
            
            // Get indentation
            const indent = line.match(/^(\s*)/)?.[1] || '';
            
            // Check if next line is closing div
            const isClosingDiv = nextLine.trim() === '</div>';
            
            // Add link opening before logo
            newLines.push(`${indent}<a href="/index.html" style="text-decoration: none; color: inherit;">`);
            
            // Add logo line with extra indent
            const logoIndent = indent + '  ';
            newLines.push(line.replace(/^(\s*)/, logoIndent));
            
            // Add link closing after logo
            if (isClosingDiv) {
                newLines.push(`${indent}</a>`);
                // Skip next line (closing div) as we'll add it after
                i++;
                newLines.push(nextLine);
            } else {
                // Find where logo closes
                let j = i + 1;
                while (j < lines.length && !lines[j].includes('</h1>')) {
                    newLines.push(lines[j]);
                    j++;
                }
                if (j < lines.length) {
                    newLines.push(lines[j]); // </h1>
                    newLines.push(`${indent}</a>`);
                    i = j;
                } else {
                    newLines.push(`${indent}</a>`);
                }
            }
            modified = true;
        } else {
            newLines.push(line);
        }
    }
    
    if (modified) {
        const newContent = newLines.join('\n');
        if (newContent !== originalContent) {
            try {
                fs.writeFileSync(filePath, newContent, 'utf8');
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
    } else {
        skipped++;
    }
});

console.log(`\n📊 Summary:`);
console.log(`   ✅ Processed: ${processed}`);
console.log(`   ⏭️  Skipped: ${skipped}`);
console.log(`   ❌ Errors: ${errors}`);
console.log(`   📁 Total: ${htmlFiles.length}`);
