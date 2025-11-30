# Project Structure

## 📁 Directory Organization

```
omnitoolset/
├── apps/
│   └── web/                    # Static web application
│       ├── index.html          # Main homepage
│       ├── app.js              # Tool list & filtering
│       ├── styles.css          # Global styles
│       ├── package.json        # Project config
│       ├── robots.txt          # SEO robots
│       ├── sitemap.xml         # SEO sitemap
│       ├── README.md           # Web app documentation
│       ├── assets/             # Static assets
│       │   └── pdf.worker.mjs  # PDF worker
│       └── tools/              # 126 tool pages
│           ├── pdf-merge.html
│           ├── pdf-split.html
│           └── ... (124 more)
│
├── docs/                       # Documentation
│   ├── DEPLOY.md              # Deployment guide
│   ├── DEVELOPER-GUIDE.md     # Developer guide
│   ├── ROADMAP.md             # Project roadmap
│   ├── SEO-GUIDE.md           # SEO guide
│   ├── deployment/            # Deployment docs
│   │   ├── DEPLOYMENT-READY.md
│   │   ├── FINAL-STATUS.md
│   │   ├── FUNCTIONAL-TOOLS.md
│   │   ├── IMPLEMENTATION-STATUS.md
│   │   └── README-STATIC.md
│   └── strategies/            # Strategy documents
│       ├── AD-MONETIZATION-STRATEGY.md
│       ├── AD-OPTIMIZATION-STRATEGY.md
│       ├── ADSENSE-STRATEGY.md
│       └── ... (10 more)
│
├── packages/                   # Shared packages
│   └── pdf-engine/            # PDF processing engine
│
├── README.md                  # Main project README
├── package.json               # Root package.json
└── COMPARISON.md             # Comparison docs
```

## 🎯 Key Directories

### `apps/web/`
Static HTML/JS/CSS application. This is the deployable directory.

### `docs/`
All documentation organized by category:
- **deployment/**: Deployment and status docs
- **strategies/**: Business and technical strategies

### `packages/`
Shared TypeScript packages (legacy, not used in static site)

## 📦 Deployment

Deploy the contents of `apps/web/` to any static hosting service.

