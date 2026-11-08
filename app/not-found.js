import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="prose">
      <h1>Page not found</h1>
      <p>That page doesn’t exist. Browse <Link href="/">all free tools</Link> or the <Link href="/blog">guides</Link>.</p>
    </div>
  );
}
