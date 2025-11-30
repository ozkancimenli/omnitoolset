# OmniToolset - Static HTML/JS/CSS Version

This is a pure static website built with vanilla JavaScript, HTML, and CSS. No build process required!

## File Structure

```
apps/web/
├── index.html          # Main homepage
├── app.js              # Tool list and search functionality
├── styles.css          # All styles
├── tools/              # 124 tool HTML pages
│   ├── pdf-merge.html
│   ├── pdf-split.html
│   └── ...
└── README-STATIC.md    # This file
```

## Deployment

### Option 1: Static Hosting (Recommended)
- **Netlify**: Drag and drop the `apps/web` folder
- **Vercel**: Deploy as static site (no build needed)
- **GitHub Pages**: Push to repo, enable Pages
- **Cloudflare Pages**: Connect repo, set build command to empty
- **Any web server**: Just upload the files!

### Option 2: Local Testing
```bash
cd apps/web
# Use any static server:
python -m http.server 8000
# or
npx serve .
# or
php -S localhost:8000
```

Then open http://localhost:8000

## Features

- ✅ 124+ free online tools
- ✅ No build process required
- ✅ Pure HTML/CSS/JS
- ✅ Fast and lightweight
- ✅ SEO optimized
- ✅ Mobile responsive
- ✅ No dependencies (except CDN libraries for specific tools)

## Tool Categories

- PDF Tools (merge, split, compress, convert, etc.)
- Image Tools (resize, compress, convert, filters)
- Text Tools (case converter, counter, encoder/decoder)
- Developer Tools (JSON formatter, hash generator, etc.)
- Media Tools (video/audio converters)
- Other Tools (calculators, converters, generators)

## Notes

- All tools work client-side (in browser)
- No server-side processing required
- Some tools use CDN libraries (pdf-lib, jsPDF, etc.)
- Fully static - can be deployed anywhere

