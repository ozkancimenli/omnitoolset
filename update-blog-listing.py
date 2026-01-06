#!/usr/bin/env python3
"""
Update blog.html to include daily blog posts
Scans the blog directory for daily posts and adds them to the blogPosts array
"""

import re
from pathlib import Path
from datetime import datetime

blog_dir = Path('blog')
blog_html = Path('blog.html')

def extract_blog_info(html_file):
    """Extract title and description from blog post HTML"""
    try:
        content = html_file.read_text(encoding='utf-8')
        
        # Extract title
        title_match = re.search(r'<title>(.*?)\s*\|\s*OmniToolset</title>', content)
        title = title_match.group(1).strip() if title_match else html_file.stem
        
        # Extract description
        desc_match = re.search(r'<meta name="description" content="(.*?)">', content)
        description = desc_match.group(1).strip() if desc_match else "Daily blog post from OmniToolset"
        
        return {
            "title": title,
            "description": description,
            "url": f"/blog/{html_file.name}",
            "date": html_file.stem  # Use filename as date identifier
        }
    except Exception as e:
        print(f"⚠️  Error reading {html_file.name}: {e}")
        return None

def get_daily_posts():
    """Get all daily blog posts"""
    daily_posts = []
    
    if not blog_dir.exists():
        print(f"❌ Blog directory not found: {blog_dir}")
        return daily_posts
    
    # Find all daily posts (format: YYYY-MM-DD-daily.html)
    for html_file in blog_dir.glob("*-daily.html"):
        info = extract_blog_info(html_file)
        if info:
            daily_posts.append(info)
    
    # Sort by date (newest first)
    daily_posts.sort(key=lambda x: x["date"], reverse=True)
    
    return daily_posts

def update_blog_html(daily_posts):
    """Update blog.html with daily posts"""
    if not blog_html.exists():
        print(f"❌ blog.html not found: {blog_html}")
        return False
    
    content = blog_html.read_text(encoding='utf-8')
    
    # Find the blogPosts array
    pattern = r'(const blogPosts = \[)(.*?)(\];)'
    match = re.search(pattern, content, re.DOTALL)
    
    if not match:
        print("❌ Could not find blogPosts array in blog.html")
        return False
    
    # Check if daily posts are already included
    existing_daily = re.search(r'Daily Tool Spotlight|Daily Productivity Tip|New Features & Updates', content)
    
    if existing_daily:
        print("ℹ️  Daily posts already seem to be included in blog.html")
        print("   To update, you may need to manually edit blog.html")
        return True
    
    # Generate new entries
    new_entries = []
    for post in daily_posts[:10]:  # Limit to 10 most recent daily posts
        # Escape quotes in title and description
        title = post["title"].replace('"', '\\"').replace("'", "\\'")
        desc = post["description"].replace('"', '\\"').replace("'", "\\'")
        
        entry = f'                {{ title: \'{title}\', url: \'{post["url"]}\', desc: \'{desc}\' }},'
        new_entries.append(entry)
    
    if not new_entries:
        print("ℹ️  No daily posts found to add")
        return True
    
    # Insert new entries at the beginning of the array
    before = match.group(1)
    existing = match.group(2)
    after = match.group(3)
    
    # Add new entries
    new_content = before + "\n" + "\n".join(new_entries) + "\n" + existing + after
    
    # Replace in content
    new_file_content = content[:match.start()] + new_content + content[match.end():]
    
    # Write updated content
    blog_html.write_text(new_file_content, encoding='utf-8')
    
    print(f"✅ Updated blog.html with {len(new_entries)} daily blog posts")
    return True

def main():
    """Main function"""
    print("📝 Scanning for daily blog posts...")
    daily_posts = get_daily_posts()
    
    if not daily_posts:
        print("ℹ️  No daily blog posts found")
        return
    
    print(f"📊 Found {len(daily_posts)} daily blog post(s)")
    
    # Show found posts
    for post in daily_posts[:5]:  # Show first 5
        print(f"   - {post['date']}: {post['title'][:60]}...")
    
    if len(daily_posts) > 5:
        print(f"   ... and {len(daily_posts) - 5} more")
    
    # Update blog.html
    print("\n🔄 Updating blog.html...")
    update_blog_html(daily_posts)
    
    print("\n💡 Note: This script adds daily posts to the beginning of the blogPosts array.")
    print("   You may want to review blog.html to ensure proper ordering.")

if __name__ == "__main__":
    main()



