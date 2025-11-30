# OmniToolset - Static Web Application

A collection of 126+ free online tools built with vanilla HTML, CSS, and JavaScript.

## Project Structure

```
apps/web/
├── index.html          # Main homepage
├── app.js              # Tool list and filtering logic
├── styles.css          # Global styles
├── package.json        # Project configuration
├── robots.txt          # SEO robots file
├── sitemap.xml         # SEO sitemap
├── assets/             # Static assets
│   └── pdf.worker.mjs # PDF processing worker
└── tools/              # Individual tool pages
    ├── pdf-merge.html
    ├── pdf-split.html
    └── ... (126 tool pages)
```

## Features

- ✅ 126+ Free Online Tools
- ✅ No Registration Required
- ✅ No Watermarks
- ✅ 100% Client-Side Processing
- ✅ AdSense Integration
- ✅ SEO Optimized
- ✅ Mobile Responsive

## Development

### Local Server

```bash
# Using Python
python3 -m http.server 8000

# Using Node.js (if http-server is installed)
npx http-server -p 8000
```

### Deployment

This is a static site. Deploy to any static hosting service:
- Netlify
- Vercel
- GitHub Pages
- Cloudflare Pages
- AWS S3 + CloudFront

Simply upload the `apps/web/` directory contents.

## Documentation

See `/docs/` directory for:
- Deployment guides
- Implementation status
- Strategy documents

