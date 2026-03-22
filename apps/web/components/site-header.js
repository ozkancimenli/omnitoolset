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
            <Link href="/sms">SMS AI Assistant</Link>
            <Link href="/reviews">Reviews</Link>
            <Link href="/follow-up">Follow-up</Link>
            <Link href="/lead-capture">Lead Capture</Link>
            <Link href="/inbox">Inbox / CRM</Link>
          </nav>
          <Link className="button button-primary button-small" href="/sms#start-now">
            Start for $49/month
          </Link>
        </div>
      </div>
    </header>
  );
}
