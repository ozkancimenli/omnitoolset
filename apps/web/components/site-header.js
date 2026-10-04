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
            <a href="/#modules">Products</a>
            <a href="/#workflows">Workflows</a>
            <a href="/#platform">Platform</a>
            <Link href="/studio">Studio</Link>
          </nav>
          <Link className="button button-primary button-small" href="/sms">
            Try SMS Assistant
          </Link>
        </div>
      </div>
    </header>
  );
}
