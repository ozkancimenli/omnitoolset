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
            <a href="/#platform">Platform</a>
            <a href="/#modules">Modules</a>
            <a href="/#workflows">Workflows</a>
            <Link href="/studio">Studio</Link>
          </nav>
          <Link className="button button-primary button-small" href="/studio">
            Open Studio
          </Link>
        </div>
      </div>
    </header>
  );
}
