# OmniToolset

Free online tools that run entirely in the browser (images, PDFs, text, developer and design tools). No uploads, no accounts.

- Next.js 15 App Router, deployed on Vercel
- Tools: `lib/tools.js` (SEO copy) + `components/tools/*` (UI, client-side only)
- Guides: `lib/posts.js`
- Ads: set `NEXT_PUBLIC_ADSENSE_CLIENT=ca-pub-...` in Vercel → AdSense script, ad slots and `/ads.txt` turn on automatically
- Optional `NEXT_PUBLIC_CONTACT_EMAIL` shows an email on /contact

The previous SMS/automation SaaS (v3) lives in git history before this rewrite.
