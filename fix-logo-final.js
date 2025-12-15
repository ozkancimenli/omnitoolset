#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Find all HTML files with logo but without link
const rootDir = __dirname;
let result;
try {
    result = execSync(
        `find "${rootDir}" -name "*.html" -type f ! -path "*/node_modules/*" | xargs grep -l 'class="logo"' | xargs grep -L 'logo-section.*<a href="/index.html"' || true`,
        { encoding: 'utf8' }
    );
} catch (e) {
    result = e.stdout || '';
}

const files = result.trim().split('\n').filter(f => f && f.includes('.html'));

let processed = 0;
let errors = 0;

files.forEach(filePath => {
    if (!filePath || !fs.existsSync(filePath)) return;
    
    let content = fs.readFileSync(filePath, 'utf8');
    
    // Skip if already has link
    if (content.includes('logo-section') && content.includes('<a href="/index.html"')) {
        return;
    }
    
    // Replace pattern: logo-section div with h1.logo inside
    // Handle different indentation styles
    const patterns = [
        // Pattern 1: Single line
        /(<div class="logo-section"[^>]*>)\s*<h1 class="logo"([^>]*)>([^<]+)<\/h1>\s*<\/div>/g,
        // Pattern 2: Multi-line with spaces
        /(<div class="logo-section"[^>]*>)\s*\n\s*<h1 class="logo"([^>]*)>([^<]+)<\/h1>\s*\n\s*<\/div>/g,
    ];
    
    let modified = false;
    
    for (const pattern of patterns) {
        if (pattern.test(content)) {
            content = content.replace(pattern, (match, div, h1Attrs, text) => {
                // Detect indentation from the match
                const lines = match.split('\n');
                let indent = '        ';
                if (lines.length > 1) {
                    const lastLine = lines[lines.length - 1];
                    const matchIndent = lastLine.match(/^(\s*)/);
                    if (matchIndent) indent = matchIndent[1];
                } else {
                    // Single line - check previous line
                    const beforeMatch = content.substring(0, content.indexOf(match));
                    const prevLine = beforeMatch.split('\n').pop() || '';
                    indent = prevLine.match(/^(\s*)/)?.[1] || '        ';
                }
                
                return `${div}\n${indent}<a href="/index.html" style="text-decoration: none; color: inherit;">\n${indent}  <h1 class="logo"${h1Attrs}>${text}</h1>\n${indent}</a>\n${indent}</div>`;
            });
            modified = true;
            break;
        }
    }
    
    // If still not modified, try line-by-line approach
    if (!modified) {
        const lines = content.split('\n');
        const newLines = [];
        let i = 0;
        
        while (i < lines.length) {
            const line = lines[i];
            
            // Check if this line has logo-section opening
            if (line.includes('class="logo-section"') && !line.includes('<a href="/index.html"')) {
                newLines.push(line);
                i++;
                
                // Get indentation
                const indent = line.match(/^(\s*)/)?.[1] || '';
                
                // Check next lines for logo
                if (i < lines.length && lines[i].includes('<h1 class="logo"')) {
                    // Add link opening
                    newLines.push(`${indent}<a href="/index.html" style="text-decoration: none; color: inherit;">`);
                    
                    // Add logo with extra indent
                    const logoLine = lines[i].replace(/^(\s*)/, indent + '  ');
                    newLines.push(logoLine);
                    i++;
                    
                    // Find closing h1
                    while (i < lines.length && !lines[i].includes('</h1>')) {
                        newLines.push(lines[i]);
                        i++;
                    }
                    if (i < lines.length) {
                        newLines.push(lines[i]); // </h1>
                        i++;
                    }
                    
                    // Add link closing
                    newLines.push(`${indent}</a>`);
                    
                    // Add closing div if next line is it
                    if (i < lines.length && lines[i].trim() === '</div>') {
                        newLines.push(lines[i]);
                        i++;
                    }
                    modified = true;
                } else {
                    newLines.push(line);
                    i++;
                }
            } else {
                newLines.push(line);
                i++;
            }
        }
        
        if (modified) {
            content = newLines.join('\n');
        }
    }
    
    if (modified) {
        try {
            fs.writeFileSync(filePath, content, 'utf8');
            processed++;
            const relPath = path.relative(rootDir, filePath);
            console.log(`✅ ${relPath}`);
        } catch (e) {
            errors++;
            console.error(`❌ ${filePath}: ${e.message}`);
        }
    }
});

console.log(`\n📊 Summary:`);
console.log(`   ✅ Processed: ${processed}`);
console.log(`   ❌ Errors: ${errors}`);
console.log(`   📁 Total: ${files.length}`);
