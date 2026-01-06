#!/usr/bin/env python3
"""
Daily Blog Post Generator
Creates a new blog post each day with varied content about tools, tips, and features.
Run this script daily (manually or via cron) to generate fresh blog content.
"""

import os
from pathlib import Path
from datetime import datetime, timedelta
import random

blog_dir = Path('blog')
blog_dir.mkdir(exist_ok=True)

# Daily blog topics - rotates through different themes
daily_topics = [
    {
        "type": "tool_spotlight",
        "templates": [
            {
                "title_template": "Daily Tool Spotlight: {tool_name} - {date}",
                "slug_template": "daily-tool-{date_slug}",
                "description_template": "Today's featured tool: {tool_name}. {tool_description} Learn how to use this free online tool effectively.",
                "keywords_template": "{tool_keywords}, free online tools, daily tool, {date_year}"
            }
        ]
    },
    {
        "type": "productivity_tip",
        "templates": [
            {
                "title_template": "Daily Productivity Tip: {tip_title} - {date}",
                "slug_template": "daily-productivity-tip-{date_slug}",
                "description_template": "Boost your productivity with today's tip: {tip_description} Use our free tools to implement this tip right away.",
                "keywords_template": "productivity tips, free tools, workflow optimization, {date_year}"
            }
        ]
    },
    {
        "type": "tool_comparison",
        "templates": [
            {
                "title_template": "Free vs Paid Tools: {topic} Comparison - {date}",
                "slug_template": "free-vs-paid-{date_slug}",
                "description_template": "Compare free online tools with paid alternatives for {topic}. Discover which solution works best for your needs.",
                "keywords_template": "free tools, paid tools comparison, {topic}, {date_year}"
            }
        ]
    },
    {
        "type": "how_to",
        "templates": [
            {
                "title_template": "How to {action} Using Free Online Tools - {date}",
                "slug_template": "how-to-{action_slug}-{date_slug}",
                "description_template": "Learn how to {action} using our free online tools. Step-by-step guide with no software installation required.",
                "keywords_template": "how to {action}, free tools, online tools, tutorial, {date_year}"
            }
        ]
    },
    {
        "type": "feature_update",
        "templates": [
            {
                "title_template": "New Features & Updates - {date}",
                "slug_template": "updates-{date_slug}",
                "description_template": "Latest updates and new features on OmniToolset. Discover what's new and how to use our enhanced tools.",
                "keywords_template": "tool updates, new features, free tools, {date_year}"
            }
        ]
    }
]

# Tool database for tool spotlight posts
tools_database = [
    {
        "name": "PDF Merger",
        "description": "Combine multiple PDF files into one document quickly and easily.",
        "keywords": "merge pdf, combine pdf, pdf merger",
        "link": "/tools/pdf-merge.html"
    },
    {
        "name": "Image Compressor",
        "description": "Reduce image file size without losing quality. Perfect for web optimization.",
        "keywords": "compress images, image optimizer, reduce image size",
        "link": "/tools/image-compress.html"
    },
    {
        "name": "JSON Formatter",
        "description": "Format and beautify JSON code instantly. Validate syntax and make code readable.",
        "keywords": "json formatter, format json, json beautifier",
        "link": "/tools/json-formatter.html"
    },
    {
        "name": "QR Code Generator",
        "description": "Create QR codes for URLs, text, and more. Customizable colors and sizes.",
        "keywords": "qr code generator, generate qr code, qr maker",
        "link": "/tools/qr-generator.html"
    },
    {
        "name": "Text Case Converter",
        "description": "Convert text between different cases instantly. Uppercase, lowercase, title case, and more.",
        "keywords": "text case converter, uppercase lowercase, case converter",
        "link": "/tools/text-case.html"
    },
    {
        "name": "Base64 Encoder/Decoder",
        "description": "Encode and decode Base64 strings. Useful for data transmission and embedding.",
        "keywords": "base64 encode, base64 decode, base64 converter",
        "link": "/tools/base64-encode.html"
    },
    {
        "name": "Word Counter",
        "description": "Count words, characters, and paragraphs in your text. Perfect for writers and students.",
        "keywords": "word counter, character counter, text counter",
        "link": "/tools/text-counter.html"
    },
    {
        "name": "PDF to Word Converter",
        "description": "Convert PDF documents to editable Word format easily and quickly.",
        "keywords": "pdf to word, convert pdf to word, pdf converter",
        "link": "/tools/pdf-to-word.html"
    },
    {
        "name": "Image Resizer",
        "description": "Resize images to any dimension without losing quality. Perfect for web and social media.",
        "keywords": "resize images, image resizer, resize photos",
        "link": "/tools/image-resize.html"
    },
    {
        "name": "Password Generator",
        "description": "Generate secure, random passwords for your accounts. Customizable length and character sets.",
        "keywords": "password generator, random password, secure password",
        "link": "/tools/password-generator.html"
    }
]

# Productivity tips
productivity_tips = [
    {
        "title": "Batch Process Multiple Files",
        "description": "Save time by processing multiple files at once. Our PDF and image tools support batch operations to handle multiple files simultaneously."
    },
    {
        "title": "Use Keyboard Shortcuts",
        "description": "Speed up your workflow with keyboard shortcuts. Most of our tools support common shortcuts like Ctrl+C, Ctrl+V, and Enter to submit."
    },
    {
        "title": "Bookmark Your Favorite Tools",
        "description": "Create a custom bookmark folder for your most-used tools. Quick access means faster productivity."
    },
    {
        "title": "Combine Multiple Tools",
        "description": "Chain multiple tools together for complex workflows. For example, compress images, then convert to PDF, all in one session."
    },
    {
        "title": "Use Browser Extensions",
        "description": "Install browser extensions that integrate with our tools for even faster access from any webpage."
    }
]

# Action verbs for how-to posts
how_to_actions = [
    {
        "action": "Optimize Your Workflow",
        "action_slug": "optimize-workflow",
        "description": "Streamline your daily tasks with our free online tools. Learn efficient workflows that save time and effort."
    },
    {
        "action": "Convert Files Without Software",
        "action_slug": "convert-files-without-software",
        "description": "Convert between file formats without installing any software. All processing happens in your browser."
    },
    {
        "action": "Process Documents Faster",
        "action_slug": "process-documents-faster",
        "description": "Speed up document processing with our batch tools. Handle multiple files at once with no limits."
    },
    {
        "action": "Secure Your Data",
        "action_slug": "secure-your-data",
        "description": "Protect your sensitive information using our encryption and password tools. All processing is done locally in your browser."
    }
]

# Comparison topics
comparison_topics = [
    {
        "topic": "PDF Editing",
        "description": "Compare free PDF editing tools with paid software like Adobe Acrobat. Discover which features you really need."
    },
    {
        "topic": "Image Editing",
        "description": "Free online image editors vs paid software. Find out when free tools are sufficient and when you need premium features."
    },
    {
        "topic": "File Conversion",
        "description": "Free file converters vs subscription services. See how our tools stack up against paid alternatives."
    }
]

def get_date_strings():
    """Get formatted date strings"""
    now = datetime.now()
    return {
        "date": now.strftime("%B %d, %Y"),
        "date_slug": now.strftime("%Y-%m-%d"),
        "date_iso": now.strftime("%Y-%m-%d"),
        "date_year": str(now.year),
        "date_month": now.strftime("%B %Y")
    }

def get_tool_link(tool_name):
    """Get tool link from tool name"""
    for tool in tools_database:
        if tool["name"].lower() == tool_name.lower():
            return tool["link"]
    return "/all-tools.html"

def generate_daily_content():
    """Generate content for today's blog post"""
    dates = get_date_strings()
    today = datetime.now()
    
    # Use day of year to cycle through topics (ensures variety)
    day_of_year = today.timetuple().tm_yday
    topic_index = day_of_year % len(daily_topics)
    topic = daily_topics[topic_index]
    
    template = random.choice(topic["templates"])
    
    if topic["type"] == "tool_spotlight":
        tool = random.choice(tools_database)
        title = template["title_template"].format(
            tool_name=tool["name"],
            date=dates["date"]
        )
        slug = template["slug_template"].format(date_slug=dates["date_slug"])
        description = template["description_template"].format(
            tool_name=tool["name"],
            tool_description=tool["description"]
        )
        keywords = template["keywords_template"].format(
            tool_keywords=tool["keywords"],
            date_year=dates["date_year"]
        )
        tool_link = tool["link"]
        
    elif topic["type"] == "productivity_tip":
        tip = random.choice(productivity_tips)
        title = template["title_template"].format(
            tip_title=tip["title"],
            date=dates["date"]
        )
        slug = template["slug_template"].format(date_slug=dates["date_slug"])
        description = template["description_template"].format(
            tip_description=tip["description"]
        )
        keywords = template["keywords_template"].format(date_year=dates["date_year"])
        tool_link = "/all-tools.html"
        
    elif topic["type"] == "tool_comparison":
        comp = random.choice(comparison_topics)
        title = template["title_template"].format(
            topic=comp["topic"],
            date=dates["date"]
        )
        slug = template["slug_template"].format(date_slug=dates["date_slug"])
        description = template["description_template"].format(topic=comp["topic"].lower())
        keywords = template["keywords_template"].format(
            topic=comp["topic"].lower(),
            date_year=dates["date_year"]
        )
        tool_link = "/all-tools.html"
        
    elif topic["type"] == "how_to":
        action = random.choice(how_to_actions)
        title = template["title_template"].format(
            action=action["action"],
            date=dates["date"]
        )
        slug = template["slug_template"].format(
            action_slug=action["action_slug"],
            date_slug=dates["date_slug"]
        )
        description = template["description_template"].format(action=action["action"].lower())
        keywords = template["keywords_template"].format(
            action=action["action"].lower(),
            date_year=dates["date_year"]
        )
        tool_link = "/all-tools.html"
        
    else:  # feature_update
        title = template["title_template"].format(date=dates["date"])
        slug = template["slug_template"].format(date_slug=dates["date_slug"])
        description = template["description_template"]
        keywords = template["keywords_template"].format(date_year=dates["date_year"])
        tool_link = "/all-tools.html"
    
    return {
        "slug": slug,
        "title": title,
        "description": description,
        "keywords": keywords,
        "tool_link": tool_link,
        "dates": dates
    }

def create_blog_post(content):
    """Create blog post HTML"""
    html = f'''<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>{content["title"]} | OmniToolset</title>
    <meta name="description" content="{content["description"]}">
    <meta name="robots" content="index, follow">
    <link rel="canonical" href="https://www.omnitoolset.com/blog/{content["slug"]}.html">
    <link rel="stylesheet" href="/styles.css">
    
    <!-- Google AdSense -->
    <meta name="google-adsense-account" content="ca-pub-8640955536193345">
    <meta name="keywords" content="{content["keywords"]}">
    <meta name="author" content="OmniToolset">
    
    <!-- Open Graph / Facebook -->
    <meta property="og:type" content="article">
    <meta property="og:url" content="https://www.omnitoolset.com/blog/{content["slug"]}.html">
    <meta property="og:title" content="{content["title"]} | OmniToolset">
    <meta property="og:description" content="{content["description"]}">
    <meta property="og:image" content="https://www.omnitoolset.com/og-image.jpg">
    <meta property="og:image:width" content="1200">
    <meta property="og:image:height" content="630">
    <meta property="og:image:alt" content="{content["title"]} | OmniToolset">
    <meta property="og:site_name" content="OmniToolset">
    <meta property="article:published_time" content="{content["dates"]["date_iso"]}T00:00:00+00:00">
    <meta property="article:modified_time" content="{content["dates"]["date_iso"]}T00:00:00+00:00">
    <meta property="article:author" content="OmniToolset">
    <meta property="article:section" content="Daily Blog">
    
    <!-- Twitter -->
    <meta property="twitter:card" content="summary_large_image">
    <meta property="twitter:url" content="https://www.omnitoolset.com/blog/{content["slug"]}.html">
    <meta property="twitter:title" content="{content["title"]} | OmniToolset">
    <meta property="twitter:description" content="{content["description"]}">
    <meta property="twitter:image" content="https://www.omnitoolset.com/og-image.jpg">
    <meta property="twitter:image:alt" content="{content["title"]} | OmniToolset">
    
    <!-- Structured Data -->
    <script type="application/ld+json">
    {{
      "@context": "https://schema.org",
      "@type": "BlogPosting",
      "headline": "{content["title"]} | OmniToolset",
      "description": "{content["description"]}",
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
      "datePublished": "{content["dates"]["date_iso"]}T00:00:00+00:00",
      "dateModified": "{content["dates"]["date_iso"]}T00:00:00+00:00",
      "mainEntityOfPage": {{
        "@type": "WebPage",
        "@id": "https://www.omnitoolset.com/blog/{content["slug"]}.html"
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
    <!-- Adsterra Popunder (Head) -->
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
        
        <!-- Adsterra Native Banner (Top) -->
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
            <div style="margin-bottom: 1rem; color: var(--text-secondary); font-size: 0.9rem;">
                📅 Published: {content["dates"]["date"]}
            </div>
            
            <h1>{content["title"]}</h1>
            <p style="font-size: 1.1rem; color: var(--text-secondary); margin-bottom: 2rem;">
                {content["description"]}
            </p>
            
            <h2>What You'll Learn</h2>
            <p>In today's daily blog post, we'll explore practical tips and insights about using free online tools effectively. Whether you're a professional, student, or casual user, you'll find valuable information to improve your workflow.</p>
            
            <h2>Key Takeaways</h2>
            <ul>
                <li>✅ Discover new ways to use our free online tools</li>
                <li>✅ Learn productivity tips and best practices</li>
                <li>✅ Understand when free tools are sufficient vs when you need paid alternatives</li>
                <li>✅ Get step-by-step guidance for common tasks</li>
                <li>✅ Stay updated with the latest features and improvements</li>
            </ul>
            
            <h2>Try Our Tools Today</h2>
            <p>Ready to put these tips into practice? Visit our <a href="{content["tool_link"]}" style="color: var(--primary-color);">featured tool</a> or explore our <a href="/all-tools.html" style="color: var(--primary-color);">complete collection of 270+ free online tools</a>.</p>
            
            <div style="background: var(--bg-card); border: 1px solid var(--border-color); border-radius: 12px; padding: 1.5rem; margin: 2rem 0;">
                <h3 style="margin-top: 0;">💡 Daily Tip</h3>
                <p style="margin-bottom: 0;">Bookmark this page and check back daily for new tips, tool spotlights, and productivity insights. We publish fresh content every day to help you get the most out of our free tools.</p>
            </div>
            
            <h2>Why Free Tools Matter</h2>
            <p>Free online tools democratize access to powerful utilities that were once only available through expensive software. Our mission is to provide high-quality, free tools that anyone can use without restrictions, watermarks, or hidden costs.</p>
            
            <p>All our tools work entirely in your browser, ensuring your files never leave your device. This means maximum privacy and security for your sensitive documents and data.</p>
            
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
            
            <h2>Related Resources</h2>
            <ul>
                <li><a href="/blog.html" style="color: var(--primary-color);">Browse All Blog Posts</a></li>
                <li><a href="/all-tools.html" style="color: var(--primary-color);">Explore All Tools</a></li>
                <li><a href="/categories.html" style="color: var(--primary-color);">Browse by Category</a></li>
            </ul>
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
    
    <!-- Adsterra Popunder (Body) -->
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

def main():
    """Main function to generate daily blog post"""
    dates = get_date_strings()
    file_path = blog_dir / f"{dates['date_slug']}-daily.html"
    
    # Check if today's post already exists
    if file_path.exists():
        print(f"⏭️  Today's blog post already exists: {file_path.name}")
        print(f"   To regenerate, delete the file first.")
        return
    
    # Generate content
    print(f"📝 Generating daily blog post for {dates['date']}...")
    content = generate_daily_content()
    
    # Create HTML
    html_content = create_blog_post(content)
    
    # Write file
    file_path.write_text(html_content, encoding='utf-8')
    print(f"✅ Created: {file_path.name}")
    print(f"   Title: {content['title']}")
    print(f"   URL: /blog/{content['slug']}.html")
    print(f"\n💡 Tip: Run this script daily to generate fresh blog content!")
    print(f"   You can set up a cron job to run it automatically:")

if __name__ == "__main__":
    main()



