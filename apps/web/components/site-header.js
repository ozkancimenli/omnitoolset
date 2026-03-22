import Link from 'next/link';

export function SiteHeader() {
  return (
    <header className="site-header">
      <div className="shell nav-shell">
        <Link className="brand" href="/">
          OmniToolset
        </Link>
        <nav className="nav-links" aria-label="Primary">
          <Link href="/sms">SMS AI Assistant</Link>
          <Link href="/reviews">Reviews</Link>
          <Link href="/follow-up">Follow-up</Link>
          <Link href="/lead-capture">Lead Capture</Link>
          <Link href="/inbox">Inbox / CRM</Link>
        </nav>
      </div>
    </header>
  );
}
