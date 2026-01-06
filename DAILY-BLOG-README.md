# Daily Blog Generator

A Python script that automatically generates a new blog post each day with varied content about tools, tips, and features.

## Features

- **Automatic Daily Posts**: Generates a new blog post each day with unique content
- **Varied Content Types**: Rotates through different post types:
  - Tool Spotlight (features a specific tool)
  - Productivity Tips
  - Tool Comparisons (free vs paid)
  - How-To Guides
  - Feature Updates
- **SEO Optimized**: Includes proper meta tags, structured data, and Open Graph tags
- **Date-Based Filenames**: Uses format `YYYY-MM-DD-daily.html` for easy organization
- **Prevents Duplicates**: Won't overwrite existing posts for the same date

## Usage

### Manual Execution

Run the script manually each day:

```bash
python3 create-daily-blog.py
```

Or make it executable and run directly:

```bash
./create-daily-blog.py
```

### Automated Daily Execution (Cron)

Set up a cron job to run the script automatically every day:

#### On macOS/Linux:

1. Open your crontab:
```bash
crontab -e
```

2. Add this line to run at 9 AM every day:
```bash
0 9 * * * cd /Users/ozkancimenli/Desktop/projects/omnitoolset && /usr/bin/python3 create-daily-blog.py >> /tmp/daily-blog.log 2>&1
```

3. Or run at midnight:
```bash
0 0 * * * cd /Users/ozkancimenli/Desktop/projects/omnitoolset && /usr/bin/python3 create-daily-blog.py >> /tmp/daily-blog.log 2>&1
```

**Note**: Replace the path with your actual project path and Python path.

### Using GitHub Actions (Recommended for Git-based workflows)

Create `.github/workflows/daily-blog.yml`:

```yaml
name: Generate Daily Blog Post

on:
  schedule:
    - cron: '0 9 * * *'  # Run at 9 AM UTC daily
  workflow_dispatch:  # Allow manual trigger

jobs:
  generate-blog:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Set up Python
        uses: actions/setup-python@v4
        with:
          python-version: '3.x'
      - name: Generate daily blog post
        run: python3 create-daily-blog.py
      - name: Commit and push
        run: |
          git config --local user.email "action@github.com"
          git config --local user.name "GitHub Action"
          git add blog/
          git diff --staged --quiet || (git commit -m "Add daily blog post for $(date +%Y-%m-%d)" && git push)
```

## Output

The script generates blog posts in the `blog/` directory with the format:
- Filename: `YYYY-MM-DD-daily.html`
- Example: `2025-01-15-daily.html`

Each post includes:
- SEO-optimized title and meta description
- Structured data (JSON-LD)
- Open Graph tags for social sharing
- AdSense integration
- Affiliate ad sections
- Internal links to tools and other blog posts

## Content Rotation

The script uses the day of the year to cycle through different content types, ensuring variety:
- Day 1, 6, 11... → Tool Spotlight
- Day 2, 7, 12... → Productivity Tip
- Day 3, 8, 13... → Tool Comparison
- Day 4, 9, 14... → How-To Guide
- Day 5, 10, 15... → Feature Update

## Customization

You can customize the content by editing the script:

1. **Add more tools**: Edit the `tools_database` list
2. **Add more tips**: Edit the `productivity_tips` list
3. **Add more topics**: Edit the `comparison_topics` or `how_to_actions` lists
4. **Modify templates**: Edit the `daily_topics` structure

## Updating blog.html

After generating daily blog posts, you may want to update `blog.html` to include them in the listing. The script doesn't automatically update `blog.html`, but you can:

1. Manually add entries to the `blogPosts` array in `blog.html`
2. Create a separate script to scan the blog directory and auto-update `blog.html`
3. Use a dynamic loading system (already partially implemented)

## Troubleshooting

### Script says post already exists
- The script won't overwrite existing posts for the same date
- To regenerate, delete the existing file first
- Or modify the script to use a different naming scheme

### Cron job not running
- Check cron logs: `grep CRON /var/log/syslog` (Linux) or check Console.app (macOS)
- Verify the path to Python: `which python3`
- Ensure the script has execute permissions: `chmod +x create-daily-blog.py`
- Test manually first before setting up cron

### Python path issues
- Use full path to Python in cron: `/usr/bin/python3` or `/usr/local/bin/python3`
- Or use `#!/usr/bin/env python3` shebang and ensure it's in PATH

## Example Output

```
📝 Generating daily blog post for January 15, 2025...
✅ Created: 2025-01-15-daily.html
   Title: Daily Tool Spotlight: PDF Merger - January 15, 2025
   URL: /blog/daily-tool-2025-01-15.html

💡 Tip: Run this script daily to generate fresh blog content!
   You can set up a cron job to run it automatically:
```

## Notes

- Posts are generated with the current date
- Each day gets a unique post based on the day of year
- Content is randomized within each category for variety
- All posts follow the same SEO and structure standards as existing blog posts



