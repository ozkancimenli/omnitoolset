#!/usr/bin/env python3
"""
Daha fazla SEO odaklı blog yazıları oluşturma scripti - Part 2
"""

import os
from pathlib import Path
from datetime import datetime

blog_dir = Path('blog')
blog_dir.mkdir(exist_ok=True)

# Daha fazla blog yazıları
more_blog_topics = [
    # Text Tools - Advanced
    ("how-to-sort-text-lines", "How to Sort Text Lines - Alphabetical Sorter Tool", "Sort text lines alphabetically or numerically. Perfect for organizing lists and data.", "sort text, text sorter, alphabetize text, sort lines"),
    ("how-to-find-text-differences", "How to Find Text Differences - Text Diff Tool", "Compare two texts and find differences. Useful for code reviews and document comparison.", "text diff, compare text, text difference, diff tool"),
    ("how-to-convert-markdown-to-html", "How to Convert Markdown to HTML - Free Converter", "Convert Markdown text to HTML format. Perfect for documentation and web content.", "markdown to html, convert markdown, markdown converter"),
    ("how-to-escape-html", "How to Escape HTML Characters - HTML Escape Tool", "Escape HTML special characters for safe display. Prevent XSS attacks and format correctly.", "html escape, escape html, html entities"),
    ("how-to-reverse-text", "How to Reverse Text - Text Reverser Tool", "Reverse text characters or lines. Useful for testing and data manipulation.", "reverse text, text reverser, flip text"),
    ("how-to-find-and-replace-text", "How to Find and Replace Text - Text Replacer Tool", "Find and replace text in documents. Batch processing and regex support.", "find replace, text replacer, search replace"),
    ("how-to-convert-text-to-binary", "How to Convert Text to Binary - Binary Converter", "Convert text to binary code and vice versa. Learn binary encoding basics.", "text to binary, binary converter, binary code"),
    ("how-to-convert-text-to-morse", "How to Convert Text to Morse Code - Morse Converter", "Convert text to Morse code and decode Morse code back to text.", "morse code, text to morse, morse converter"),
    ("how-to-generate-slug", "How to Generate URL Slug - Slug Generator Tool", "Generate URL-friendly slugs from text. Perfect for SEO and clean URLs.", "slug generator, url slug, seo slug"),
    ("how-to-convert-to-camel-case", "How to Convert to Camel Case - Case Converter", "Convert text to camelCase format. Useful for programming and coding.", "camel case, camelcase converter, programming case"),
    ("how-to-extract-emails-from-text", "How to Extract Emails from Text - Email Extractor", "Extract email addresses from text documents. Find all emails quickly.", "extract emails, email extractor, find emails"),
    ("how-to-extract-urls-from-text", "How to Extract URLs from Text - URL Extractor", "Extract URLs and links from text. Useful for web scraping and analysis.", "extract urls, url extractor, find links"),
    
    # Developer Tools - Advanced
    ("how-to-minify-css", "How to Minify CSS - CSS Minifier Tool", "Minify CSS code to reduce file size. Improve website loading speed.", "css minifier, minify css, compress css"),
    ("how-to-minify-html", "How to Minify HTML - HTML Minifier Tool", "Minify HTML code to reduce file size. Remove whitespace and comments.", "html minifier, minify html, compress html"),
    ("how-to-minify-javascript", "How to Minify JavaScript - JS Minifier Tool", "Minify JavaScript code for production. Reduce file size and improve performance.", "javascript minifier, minify js, compress javascript"),
    ("how-to-format-css", "How to Format CSS - CSS Formatter Tool", "Format and beautify CSS code. Make CSS readable and organized.", "css formatter, format css, beautify css"),
    ("how-to-validate-xml", "How to Validate XML - XML Validator Tool", "Validate XML syntax and structure. Find errors in XML documents.", "xml validator, validate xml, xml checker"),
    ("how-to-validate-yaml", "How to Validate YAML - YAML Validator Tool", "Validate YAML syntax and format. Essential for configuration files.", "yaml validator, validate yaml, yaml checker"),
    ("how-to-generate-hash", "How to Generate Hash - Hash Generator Tool", "Generate SHA1, SHA256, SHA512 hashes. Secure your data with hashing.", "hash generator, generate hash, sha256 generator"),
    ("how-to-pick-color", "How to Pick Color - Color Picker Tool", "Pick colors and convert between Hex, RGB, HSL formats. Perfect for designers.", "color picker, pick color, color converter"),
    ("how-to-convert-timestamp", "How to Convert Timestamp - Timestamp Converter", "Convert Unix timestamp to date and vice versa. Handle time conversions easily.", "timestamp converter, unix timestamp, date converter"),
    ("how-to-minify-json", "How to Minify JSON - JSON Minifier Tool", "Minify JSON code to reduce file size. Remove unnecessary whitespace.", "json minifier, minify json, compress json"),
    
    # Image Tools - Advanced
    ("how-to-convert-image-to-base64", "How to Convert Image to Base64 - Base64 Image Converter", "Convert images to Base64 format for embedding in HTML or CSS.", "image to base64, base64 image, embed image"),
    ("how-to-convert-base64-to-image", "How to Convert Base64 to Image - Base64 Decoder", "Convert Base64 strings back to images. Decode Base64 image data.", "base64 to image, decode base64 image"),
    ("how-to-convert-image-to-grayscale", "How to Convert Image to Grayscale - Grayscale Converter", "Convert images to grayscale. Remove color and create black and white images.", "grayscale converter, black white image, remove color"),
    ("how-to-invert-image-colors", "How to Invert Image Colors - Color Inverter", "Invert image colors to create negative effects. Reverse color values.", "invert colors, color inverter, negative image"),
    ("how-to-apply-sepia-filter", "How to Apply Sepia Filter - Sepia Effect Tool", "Apply sepia filter to images. Create vintage and retro photo effects.", "sepia filter, sepia effect, vintage photo"),
    
    # PDF Tools - Advanced
    ("how-to-create-pdf-from-images", "How to Create PDF from Images - Image to PDF Converter", "Create PDF documents from multiple images. Combine images into one PDF.", "image to pdf, create pdf from images, combine images pdf"),
    ("how-to-convert-epub-to-pdf", "How to Convert EPUB to PDF - EPUB Converter", "Convert EPUB ebook files to PDF format. Read ebooks as PDF documents.", "epub to pdf, convert epub, ebook converter"),
    ("how-to-convert-pdf-to-jpg", "How to Convert PDF to JPG - PDF to Image Converter", "Convert PDF pages to JPG images. Extract images from PDF documents.", "pdf to jpg, pdf to image, convert pdf pages"),
    ("how-to-convert-pdf-to-png", "How to Convert PDF to PNG - PDF to PNG Converter", "Convert PDF pages to PNG format. High quality image extraction.", "pdf to png, pdf to image, pdf converter"),
    
    # Media Tools - Advanced
    ("how-to-convert-audio-formats", "How to Convert Audio Formats - Audio Converter Tool", "Convert audio files between different formats. MP3, WAV, OGG, and more.", "audio converter, convert audio, audio format converter"),
    ("how-to-convert-video-formats", "How to Convert Video Formats - Video Converter Tool", "Convert video files between different formats. MP4, AVI, MOV, and more.", "video converter, convert video, video format converter"),
    ("how-to-convert-mp3-formats", "How to Convert to MP3 - MP3 Converter Tool", "Convert any audio file to MP3 format. Universal audio compatibility.", "mp3 converter, convert to mp3, audio to mp3"),
    
    # Calculator Tools
    ("how-to-calculate-area", "How to Calculate Area - Area Calculator Tool", "Calculate area of rectangles, circles, triangles, and more shapes.", "area calculator, calculate area, shape area"),
    ("how-to-calculate-volume", "How to Calculate Volume - Volume Calculator Tool", "Calculate volume of 3D shapes. Cubes, spheres, cylinders, and more.", "volume calculator, calculate volume, 3d volume"),
    ("how-to-calculate-perimeter", "How to Calculate Perimeter - Perimeter Calculator", "Calculate perimeter of shapes. Rectangles, circles, polygons, and more.", "perimeter calculator, calculate perimeter, shape perimeter"),
    
    # Utility Tools
    ("how-to-generate-random-password", "How to Generate Random Password - Password Generator", "Generate secure random passwords. Customizable length and character sets.", "password generator, random password, secure password"),
    ("how-to-check-password-strength", "How to Check Password Strength - Password Checker", "Check password strength and security. Test your password security level.", "password strength, password checker, secure password"),
    ("how-to-generate-random-number", "How to Generate Random Number - Random Number Generator", "Generate random numbers within a range. Perfect for games and testing.", "random number generator, generate random number"),
    
    # Advanced Topics
    ("how-to-optimize-pdf-files", "How to Optimize PDF Files - PDF Optimization Guide", "Optimize PDF files for web and email. Reduce file size while maintaining quality.", "optimize pdf, pdf optimization, compress pdf"),
    ("how-to-merge-images-into-pdf", "How to Merge Images into PDF - Image to PDF Guide", "Combine multiple images into a single PDF document. Step-by-step guide.", "merge images pdf, images to pdf, combine images"),
    ("how-to-split-pdf-by-bookmarks", "How to Split PDF by Bookmarks - Advanced PDF Splitter", "Split PDF files using bookmarks. Organize large documents easily.", "split pdf bookmarks, pdf splitter, organize pdf"),
    ("how-to-protect-pdf-with-password", "How to Protect PDF with Password - PDF Security", "Add password protection to PDF files. Secure your sensitive documents.", "protect pdf, pdf password, secure pdf"),
]

def get_tool_link(slug):
    """Slug'a göre tool linki döndür"""
    tool_map = {
        "how-to-sort-text-lines": "/tools/text-sorter.html",
        "how-to-find-text-differences": "/tools/text-diff.html",
        "how-to-convert-markdown-to-html": "/tools/markdown-to-html.html",
        "how-to-escape-html": "/tools/html-escape.html",
        "how-to-reverse-text": "/tools/reverse-text.html",
        "how-to-find-and-replace-text": "/tools/text-replace.html",
        "how-to-convert-text-to-binary": "/tools/text-to-binary.html",
        "how-to-convert-text-to-morse": "/tools/text-to-morse.html",
        "how-to-generate-slug": "/tools/slug-generator.html",
        "how-to-convert-to-camel-case": "/tools/camel-case.html",
        "how-to-extract-emails-from-text": "/tools/extract-emails.html",
        "how-to-extract-urls-from-text": "/tools/extract-urls.html",
        "how-to-minify-css": "/tools/css-minifier.html",
        "how-to-minify-html": "/tools/html-minifier.html",
        "how-to-minify-javascript": "/tools/javascript-minifier.html",
        "how-to-format-css": "/tools/css-formatter.html",
        "how-to-validate-xml": "/tools/xml-validator.html",
        "how-to-validate-yaml": "/tools/yaml-validator.html",
        "how-to-generate-hash": "/tools/hash-generator.html",
        "how-to-pick-color": "/tools/color-picker.html",
        "how-to-convert-timestamp": "/tools/timestamp-converter.html",
        "how-to-minify-json": "/tools/json-minify.html",
        "how-to-convert-image-to-base64": "/tools/image-to-base64.html",
        "how-to-convert-base64-to-image": "/tools/base64-to-image.html",
        "how-to-convert-image-to-grayscale": "/tools/image-grayscale.html",
        "how-to-invert-image-colors": "/tools/image-invert.html",
        "how-to-apply-sepia-filter": "/tools/image-sepia.html",
        "how-to-create-pdf-from-images": "/tools/pdf-merge-images.html",
        "how-to-convert-epub-to-pdf": "/tools/epub-to-pdf.html",
        "how-to-convert-pdf-to-jpg": "/tools/pdf-to-jpg.html",
        "how-to-convert-pdf-to-png": "/tools/pdf-to-png.html",
        "how-to-convert-audio-formats": "/tools/audio-converter.html",
        "how-to-convert-video-formats": "/tools/video-converter.html",
        "how-to-convert-mp3-formats": "/tools/mp3-converter.html",
        "how-to-generate-random-password": "/tools/advanced-password-generator.html",
        "how-to-check-password-strength": "/tools/password-strength-checker.html",
    }
    return tool_map.get(slug, "/all-tools.html")

def create_blog_post(slug, title, description, keywords):
    """Blog yazısı HTML'i oluştur"""
    tool_link = get_tool_link(slug)
    current_date = datetime.now().strftime("%Y-%m-%d")
    
    html = f'''<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>{title} | OmniToolset</title>
    <meta name="description" content="{description}">
    <meta name="robots" content="index, follow">
    <link rel="canonical" href="https://www.omnitoolset.com/blog/{slug}.html">
    <link rel="stylesheet" href="/styles.css">
    
    <!-- Google AdSense -->
    <meta name="google-adsense-account" content="ca-pub-8640955536193345">
    <meta name="keywords" content="{keywords}">
    <meta name="robots" content="index, follow">
    <meta name="author" content="OmniToolset">
    
    <!-- Canonical URL -->
    <link rel="canonical" href="https://www.omnitoolset.com/blog/{slug}.html">
    
    <!-- Open Graph / Facebook -->
    <meta property="og:type" content="article">
    <meta property="og:url" content="https://www.omnitoolset.com/blog/{slug}.html">
    <meta property="og:title" content="{title} | OmniToolset">
    <meta property="og:description" content="{description}">
    <meta property="og:image" content="https://www.omnitoolset.com/og-image.jpg">
    <meta property="og:image:width" content="1200">
    <meta property="og:image:height" content="630">
    <meta property="og:image:alt" content="{title} | OmniToolset">
    <meta property="og:site_name" content="OmniToolset">
    <meta property="article:published_time" content="{current_date}T00:00:00+00:00">
    <meta property="article:modified_time" content="{current_date}T00:00:00+00:00">
    <meta property="article:author" content="OmniToolset">
    <meta property="article:section" content="Tools Guide">
    
    <!-- Twitter -->
    <meta property="twitter:card" content="summary_large_image">
    <meta property="twitter:url" content="https://www.omnitoolset.com/blog/{slug}.html">
    <meta property="twitter:title" content="{title} | OmniToolset">
    <meta property="twitter:description" content="{description}">
    <meta property="twitter:image" content="https://www.omnitoolset.com/og-image.jpg">
    <meta property="twitter:image:alt" content="{title} | OmniToolset">
    
    <!-- Structured Data -->
    <script type="application/ld+json">
    {{
      "@context": "https://schema.org",
      "@type": "BlogPosting",
      "headline": "{title} | OmniToolset",
      "description": "{description}",
      "image": "https://www.omnitoolset.com/og-image.jpg",
      "author": {{
        "@type": "Organization",
        "name": "OmniToolset"
      }},
      "publisher": {{
        "@type": "Organization",
        "name": "OmniToolset",
        "logo": {{
          "@type": "ImageObject",
          "url": "https://www.omnitoolset.com/favicon.svg"
        }}
      }},
      "datePublished": "{current_date}T00:00:00+00:00",
      "dateModified": "{current_date}T00:00:00+00:00",
      "mainEntityOfPage": {{
        "@type": "WebPage",
        "@id": "https://www.omnitoolset.com/blog/{slug}.html"
      }}
    }}
    </script>
    
    <!-- Favicon -->
    <link rel="icon" type="image/svg+xml" href="/favicon.svg">
    <link rel="icon" type="image/x-icon" href="/favicon.ico">
    <link rel="apple-touch-icon" href="/favicon.svg">
    
    <script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-8640955536193345"
     crossorigin="anonymous"></script>
</head>
<body>
    <!-- Adsterra Popunder (Head) - data-cfasync="false" prevents Cloudflare RocketLoader interference -->
    <script data-cfasync="false" type='text/javascript'>
        try {{
            (function() {{
                var script = document.createElement('script');
                script.type = 'text/javascript';
                script.src = 'https://pl28055668.effectivegatecpm.com/5c/e4/ee/5ce4ee5ab685f82c323752c9b8d45ace.js';
                script.onerror = function() {{ /* Silently ignore SSL errors */ }};
                document.head.appendChild(script);
            }})();
        }} catch(e) {{ /* Silently ignore */ }}
    </script>
    
    <header class="main-header">
        <div class="container">
            <div class="header-content">
                <div class="logo-section">
        <a href="/index.html" style="text-decoration: none; color: inherit;">
                    <h1 class="logo">🛠️ OmniToolset</h1>
        </a>
                </div>
                <nav class="main-nav">
                    <a href="/index.html" class="nav-link">Home</a>
                    <a href="/blog.html" class="nav-link">Blog</a>
                    <a href="/categories.html" class="nav-link">Categories</a>
                    <a href="/all-tools.html" class="nav-link">All Tools</a>
                </nav>
            </div>
        </div>
    </header>
    <main class="tool-page">
        <a href="/blog.html" class="back-button">← Back to Blog</a>
        
        <!-- Adsterra Native Banner (Top) - data-cfasync="false" prevents Cloudflare RocketLoader interference -->
        <div style="margin: 2rem 0; text-align: center;">
            <div id="container-612a325632297ecc15cfd2d178f355ec"></div>
            <script data-cfasync="false" type='text/javascript'>
                    try {{
                        (function() {{
                            var script = document.createElement('script');
                            script.type = 'text/javascript';
                            script.src = 'https://pl28055637.effectivegatecpm.com/612a325632297ecc15cfd2d178f355ec/invoke.js';
                            script.onerror = function() {{ /* Silently ignore SSL errors */ }};
                            document.head.appendChild(script);
                        }})();
                    }} catch(e) {{ /* Silently ignore */ }}
                </script>
        </div>
        
        <!-- AdSense Banner Ad (Top) -->
        <div style="margin: 2rem 0; text-align: center; min-height: 100px;">
            <ins class="adsbygoogle"
                 style="display:block"
                 data-ad-client="ca-pub-8640955536193345"
                 data-ad-format="auto"
                 data-full-width-responsive="true"></ins>
            <script>
                 (adsbygoogle = window.adsbygoogle || []).push({{}});
            </script>
        </div>
        
        <article style="max-width: 800px; margin: 2rem auto; padding: 2rem;">
            
            <h1>{title}</h1>
            <p>{description}</p>
            
            <h2>What is This Tool?</h2>
            <p>Our free online tool makes it easy to accomplish this task without installing any software. Simply visit our tool page and get started in seconds.</p>
            
            <h2>How to Use This Tool</h2>
            <ol>
                <li>Visit our <a href="{tool_link}">free online tool</a></li>
                <li>Upload or input your file/data</li>
                <li>Configure settings as needed</li>
                <li>Click the process button</li>
                <li>Download or copy your result</li>
            </ol>
            
            <h2>Key Features</h2>
            <ul>
                <li>✅ 100% free to use</li>
                <li>✅ No registration required</li>
                <li>✅ Works on all devices</li>
                <li>✅ Fast and secure processing</li>
                <li>✅ No file size limits</li>
                <li>✅ Privacy guaranteed - files processed locally</li>
            </ul>
            
            <h2>Why Use Our Tool?</h2>
            <p>Our tool is designed to be simple, fast, and reliable. Whether you're a professional or a casual user, you'll find our tool easy to use and effective for your needs.</p>
            
            <p>Try our <a href="{tool_link}">free online tool</a> today and see how easy it is to get the job done!</p>
        
            
            <!-- AdSense Banner Ad (Middle) -->
            <div style="margin: 2rem 0; text-align: center; min-height: 100px;">
                <ins class="adsbygoogle"
                     style="display:block"
                     data-ad-client="ca-pub-8640955536193345"
                     data-ad-format="auto"
                     data-full-width-responsive="true"></ins>
                <script>
                     (adsbygoogle = window.adsbygoogle || []).push({{}});
                </script>
            </div>
        </article>
        
        <!-- AdSense Banner Ad (Bottom) -->
        <div style="margin: 2rem 0; text-align: center; min-height: 100px;">
            <ins class="adsbygoogle"
                 style="display:block"
                 data-ad-client="ca-pub-8640955536193345"
                 data-ad-format="auto"
                 data-full-width-responsive="true"></ins>
            <script>
                 (adsbygoogle = window.adsbygoogle || []).push({{}});
            </script>
        </div>

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
        </div>
    </main>
    
    <!-- Adsterra Popunder (Body) - data-cfasync="false" prevents Cloudflare RocketLoader interference -->
    <script data-cfasync="false" type='text/javascript'>
        try {{
            (function() {{
                var script = document.createElement('script');
                script.type = 'text/javascript';
                script.src = 'https://pl28059282.effectivegatecpm.com/90/94/fe/9094fe56f6d4377965dfac5145838787.js';
                script.onerror = function() {{ /* Silently ignore SSL errors */ }};
                document.body.appendChild(script);
            }})();
        }} catch(e) {{ /* Silently ignore */ }}
    </script>
    <!-- Power-Up Scripts -->
    <script src="/js/share-powerup.js" defer></script>
    <script src="/js/user-preferences.js" defer></script>
    <script src="/js/usage-statistics.js" defer></script>
    <script src="/js/print-optimizer.js" defer></script>
    <script src="/js/keyboard-shortcuts-powerup.js" defer></script>
    <script src="/js/quick-actions-menu.js" defer></script>
    <script src="/js/copy-enhancements.js" defer></script>
    <script src="/js/pwa-installer.js" defer></script>
    <script src="/js/performance-powerup.js" defer></script>
    <script src="/js/advanced-analytics.js" defer></script>
    <script src="/js/smart-internal-linking.js" defer></script>
</body>
</html>'''
    
    return html

# Blog yazılarını oluştur
created = 0
skipped = 0

for slug, title, desc, keywords in more_blog_topics:
    file_path = blog_dir / f"{slug}.html"
    
    if file_path.exists():
        print(f"⏭️  {slug}.html (already exists)")
        skipped += 1
        continue
    
    html_content = create_blog_post(slug, title, desc, keywords)
    file_path.write_text(html_content, encoding='utf-8')
    print(f"✅ {slug}.html")
    created += 1

print(f"\n📊 Summary:")
print(f"   ✅ Created: {created}")
print(f"   ⏭️  Skipped: {skipped}")
print(f"   📁 Total: {len(more_blog_topics)}")
