#!/usr/bin/env python3
"""
SEO odaklı blog yazıları oluşturma scripti
"""

import os
from pathlib import Path
from datetime import datetime

blog_dir = Path('blog')
blog_dir.mkdir(exist_ok=True)

# Blog yazıları listesi
blog_topics = [
    # PDF Tools - Advanced
    ("how-to-rotate-pdf-pages", "How to Rotate PDF Pages - Free Online Tool Guide", "Learn how to rotate PDF pages 90, 180, or 270 degrees using our free online tool. Perfect for correcting orientation issues.", "rotate pdf, rotate pdf pages, pdf rotation tool, fix pdf orientation"),
    ("how-to-delete-pdf-pages", "How to Delete Pages from PDF - Step by Step Guide", "Remove unwanted pages from PDF files easily. Our guide shows you how to delete specific pages from PDF documents.", "delete pdf pages, remove pdf pages, pdf page remover"),
    ("how-to-extract-text-from-pdf", "How to Extract Text from PDF - Free Online Method", "Extract text content from PDF files without Adobe Acrobat. Learn how to copy text from PDF documents easily.", "extract text from pdf, pdf text extractor, copy text from pdf"),
    ("how-to-count-pdf-pages", "How to Count Pages in PDF - Quick Guide", "Count the number of pages in your PDF file instantly. Useful for document management and printing.", "count pdf pages, pdf page counter, number of pages in pdf"),
    
    # Image Tools - Advanced
    ("how-to-convert-jpg-to-png", "How to Convert JPG to PNG - Free Online Converter", "Convert JPG images to PNG format while preserving quality. Perfect for web design and graphics work.", "jpg to png, convert jpg to png, jpg png converter"),
    ("how-to-convert-png-to-jpg", "How to Convert PNG to JPG - Image Format Converter", "Convert PNG images to JPG format to reduce file size. Ideal for photos and web optimization.", "png to jpg, convert png to jpg, png jpg converter"),
    ("how-to-convert-webp-to-jpg", "How to Convert WEBP to JPG - Free Converter Tool", "Convert WEBP images to JPG format easily. Support for all modern image formats.", "webp to jpg, convert webp to jpg, webp converter"),
    ("how-to-convert-heic-to-jpg", "How to Convert HEIC to JPG - iPhone Photo Converter", "Convert HEIC photos from iPhone to JPG format. Works on any device without iTunes.", "heic to jpg, convert heic to jpg, iphone photo converter"),
    
    # Text Tools
    ("how-to-count-words-online", "How to Count Words Online - Free Word Counter Tool", "Count words, characters, and paragraphs in your text. Perfect for writers, students, and content creators.", "word counter, count words, character counter, text counter"),
    ("how-to-convert-text-case", "How to Convert Text Case - Uppercase, Lowercase, Title Case", "Convert text between different cases instantly. Uppercase, lowercase, title case, and more.", "text case converter, uppercase lowercase, title case converter"),
    ("how-to-generate-lorem-ipsum", "How to Generate Lorem Ipsum Text - Placeholder Generator", "Generate placeholder text for web design and mockups. Customizable length and paragraphs.", "lorem ipsum generator, placeholder text, dummy text generator"),
    ("how-to-remove-duplicate-lines", "How to Remove Duplicate Lines from Text - Free Tool", "Remove duplicate lines from text files easily. Clean up your data quickly.", "remove duplicate lines, duplicate line remover, text cleaner"),
    
    # Developer Tools
    ("how-to-format-json-online", "How to Format JSON Online - Free JSON Formatter", "Format and beautify JSON code instantly. Validate JSON syntax and make it readable.", "json formatter, format json, json beautifier, json validator"),
    ("how-to-validate-json", "How to Validate JSON - JSON Validator Tool", "Validate JSON syntax and find errors quickly. Essential for developers and API testing.", "json validator, validate json, json syntax checker"),
    ("how-to-generate-uuid", "How to Generate UUID - Unique Identifier Generator", "Generate UUIDs (Universally Unique Identifiers) for your applications. Multiple UUID versions supported.", "uuid generator, generate uuid, unique identifier"),
    ("how-to-decode-jwt-token", "How to Decode JWT Token - JWT Decoder Tool", "Decode and view JWT token contents. Understand JWT structure and claims.", "jwt decoder, decode jwt, jwt token decoder"),
    ("how-to-test-regex", "How to Test Regular Expressions - Regex Tester Tool", "Test and debug regular expressions online. Visual feedback and match highlighting.", "regex tester, test regex, regular expression tester"),
    
    # Media Tools
    ("how-to-convert-mp4-to-mp3", "How to Convert MP4 to MP3 - Free Video to Audio Converter", "Extract audio from video files and convert to MP3. Perfect for creating music from videos.", "mp4 to mp3, convert mp4 to mp3, video to audio converter"),
    ("how-to-convert-video-to-gif", "How to Convert Video to GIF - Free Video to GIF Converter", "Convert video clips to animated GIFs. Create GIFs from any video format.", "video to gif, convert video to gif, gif maker"),
    ("how-to-convert-mov-to-mp4", "How to Convert MOV to MP4 - Quick Video Converter", "Convert MOV files to MP4 format. Compatible with all devices and players.", "mov to mp4, convert mov to mp4, mov converter"),
    
    # Utility Tools
    ("how-to-generate-qr-code", "How to Generate QR Code - Free QR Code Generator", "Create QR codes for URLs, text, and more. Customizable colors and sizes.", "qr code generator, generate qr code, qr code maker"),
    ("how-to-encode-base64", "How to Encode Base64 - Base64 Encoder Tool", "Encode text and images to Base64 format. Useful for data transmission and embedding.", "base64 encode, base64 encoder, encode base64"),
    ("how-to-decode-base64", "How to Decode Base64 - Base64 Decoder Tool", "Decode Base64 strings back to original format. Quick and easy conversion.", "base64 decode, base64 decoder, decode base64"),
    ("how-to-encode-url", "How to Encode URL - URL Encoder Tool", "Encode URLs for safe transmission. Handle special characters and spaces.", "url encode, url encoder, encode url"),
    
    # Calculators
    ("how-to-calculate-percentage", "How to Calculate Percentage - Free Percentage Calculator", "Calculate percentages easily. Find percentage of a number, percentage increase, and more.", "percentage calculator, calculate percentage, percent calculator"),
    ("how-to-calculate-age", "How to Calculate Age - Age Calculator Tool", "Calculate exact age from birth date. Get age in years, months, and days.", "age calculator, calculate age, birthday calculator"),
    ("how-to-calculate-discount", "How to Calculate Discount - Discount Calculator", "Calculate discount amounts and final prices. Perfect for shopping and sales.", "discount calculator, calculate discount, sale calculator"),
    ("how-to-calculate-tip", "How to Calculate Tip - Tip Calculator Tool", "Calculate tip amounts for restaurants. Support for different tip percentages.", "tip calculator, calculate tip, restaurant tip calculator"),
    
    # Advanced Topics
    ("best-online-pdf-tools-2024", "Best Online PDF Tools 2024 - Free PDF Utilities", "Discover the best free PDF tools available online. Compare features and find the right tool for your needs.", "best pdf tools, free pdf tools, online pdf tools 2024"),
    ("best-free-image-editors-online", "Best Free Image Editors Online - No Download Required", "Top free online image editors for photo editing, resizing, and format conversion.", "best image editors, free image editor, online photo editor"),
    ("how-to-optimize-images-for-web", "How to Optimize Images for Web - Image Optimization Guide", "Learn how to optimize images for faster website loading. Reduce file size without losing quality.", "optimize images, image optimization, compress images for web"),
    ("how-to-compress-large-files", "How to Compress Large Files - File Compression Guide", "Compress large files to save storage space and reduce upload time. PDF, images, and more.", "compress files, file compression, reduce file size"),
]

def get_tool_link(slug):
    """Slug'a göre tool linki döndür"""
    tool_map = {
        "how-to-rotate-pdf-pages": "/tools/pdf-rotate.html",
        "how-to-delete-pdf-pages": "/tools/pdf-delete-pages.html",
        "how-to-extract-text-from-pdf": "/tools/pdf-extract-text.html",
        "how-to-count-pdf-pages": "/tools/pdf-page-count.html",
        "how-to-convert-jpg-to-png": "/tools/jpg-png-convert.html",
        "how-to-convert-png-to-jpg": "/tools/jpg-png-convert.html",
        "how-to-convert-webp-to-jpg": "/tools/webp-convert.html",
        "how-to-convert-heic-to-jpg": "/tools/heic-to-jpg.html",
        "how-to-count-words-online": "/tools/text-counter.html",
        "how-to-convert-text-case": "/tools/text-case.html",
        "how-to-generate-lorem-ipsum": "/tools/lorem-generator.html",
        "how-to-remove-duplicate-lines": "/tools/remove-duplicates.html",
        "how-to-format-json-online": "/tools/json-formatter.html",
        "how-to-validate-json": "/tools/json-validator.html",
        "how-to-generate-uuid": "/tools/uuid-generator.html",
        "how-to-decode-jwt-token": "/tools/jwt-decoder.html",
        "how-to-test-regex": "/tools/regex-tester.html",
        "how-to-convert-mp4-to-mp3": "/tools/mp4-to-mp3.html",
        "how-to-convert-video-to-gif": "/tools/video-to-gif.html",
        "how-to-convert-mov-to-mp4": "/tools/mov-to-mp4.html",
        "how-to-generate-qr-code": "/tools/qr-generator.html",
        "how-to-encode-base64": "/tools/base64-encode.html",
        "how-to-decode-base64": "/tools/base64-decode.html",
        "how-to-encode-url": "/tools/url-encode.html",
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

for slug, title, desc, keywords in blog_topics:
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
print(f"   📁 Total: {len(blog_topics)}")
