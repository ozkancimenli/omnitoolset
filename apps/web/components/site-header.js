import Link from 'next/link';

export function SiteHeader() {
  return (
    <header className="site-header">
      <div className="shell nav-shell">
        <Link className="brand" href="/">
          OmniToolset
        </Link>
        <div className="nav-group">
          <nav className="nav-links" aria-label="Primary">
            <a href="/#showroom">Showroom</a>
            <a href="/#how-it-works">How It Works</a>
            <a href="/#audit">Free Audit</a>
          </nav>
          <a className="button button-primary button-small" href="/#audit">
            Get Free Audit
          </a>
        </div>
      </div>
    </header>
  );
}
