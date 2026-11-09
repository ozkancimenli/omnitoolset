import './globals.css';
import Link from 'next/link';
import { Analytics } from '@vercel/analytics/next';
import { SITE } from '@/lib/site';

export const metadata = {
  metadataBase: new URL(SITE.url),
  title: { default: `${SITE.name} – ${SITE.tagline}`, template: `%s | ${SITE.name}` },
  description: SITE.description,
  openGraph: { siteName: SITE.name, type: 'website' },
  twitter: { card: 'summary_large_image' },
  other: SITE.adsenseClient ? { 'google-adsense-account': SITE.adsenseClient } : {},
};

export const viewport = { themeColor: '#0f172a' };

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        {SITE.adsenseClient ? (
          <script
            async
            crossOrigin="anonymous"
            src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${SITE.adsenseClient}`}
          />
        ) : null}
      </head>
      <body>
        <header className="site-header">
          <div className="wrap header-row">
            <Link href="/" className="logo">Omni<span>Toolset</span></Link>
            <nav>
              <Link href="/#tools">Tools</Link>
              <Link href="/blog">Guides</Link>
              <Link href="/about">About</Link>
            </nav>
          </div>
        </header>
        <main className="wrap">{children}</main>
        <footer className="site-footer">
          <div className="wrap footer-row">
            <p>© {new Date().getFullYear()} {SITE.name}. Free tools that run in your browser — your files never leave your device.</p>
            <nav>
              <Link href="/about">About</Link>
              <Link href="/privacy">Privacy</Link>
              <Link href="/terms">Terms</Link>
              <Link href="/contact">Contact</Link>
            </nav>
          </div>
        </footer>
        <Analytics />
      </body>
    </html>
  );
}
