#!/usr/bin/env python3
"""
Sitemap.xml'e tüm blog yazılarını ekle
"""

from pathlib import Path
from datetime import datetime

blog_dir = Path('blog')
sitemap_file = Path('sitemap.xml')

# Blog dosyalarını al
blog_files = sorted([f.stem for f in blog_dir.glob('*.html')])
current_date = datetime.now().strftime("%Y-%m-%d")

# Sitemap'i oku
sitemap_content = sitemap_file.read_text(encoding='utf-8')

# Mevcut blog entry'lerini bul ve kaldır (eğer varsa)
# Blog section'ı bul
if '<!-- Blog Posts -->' in sitemap_content:
    # Mevcut blog section'ı kaldır
    start_marker = '<!-- Blog Posts -->'
    end_marker = '</urlset>'
    
    start_idx = sitemap_content.find(start_marker)
    end_idx = sitemap_content.find(end_marker)
    
    if start_idx != -1 and end_idx != -1:
        # Blog section'ı bul ve değiştir
        before = sitemap_content[:start_idx]
        after = sitemap_content[end_idx:]
        
        # Yeni blog entries oluştur
        blog_entries = '\n    <!-- Blog Posts -->\n'
        for blog_file in blog_files:
            blog_entries += f'''    <url>
        <loc>https://www.omnitoolset.com/blog/{blog_file}.html</loc>
        <lastmod>{current_date}</lastmod>
        <changefreq>monthly</changefreq>
        <priority>0.8</priority>
    </url>
'''
        
        sitemap_content = before + blog_entries + after
else:
    # Blog section yoksa, </urlset> öncesine ekle
    end_marker = '</urlset>'
    end_idx = sitemap_content.find(end_marker)
    
    if end_idx != -1:
        before = sitemap_content[:end_idx]
        after = sitemap_content[end_idx:]
        
        # Yeni blog entries oluştur
        blog_entries = '\n    <!-- Blog Posts -->\n'
        for blog_file in blog_files:
            blog_entries += f'''    <url>
        <loc>https://www.omnitoolset.com/blog/{blog_file}.html</loc>
        <lastmod>{current_date}</lastmod>
        <changefreq>monthly</changefreq>
        <priority>0.8</priority>
    </url>
'''
        
        sitemap_content = before + blog_entries + after

# Sitemap'i kaydet
sitemap_file.write_text(sitemap_content, encoding='utf-8')
print(f"✅ Sitemap updated with {len(blog_files)} blog posts")
