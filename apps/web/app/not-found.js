import Link from 'next/link';

export default function NotFoundPage() {
  return (
    <section className="shell section not-found">
      <p className="eyebrow">Not Found</p>
      <h1>This page does not exist.</h1>
      <p>The OmniToolset product you requested could not be found.</p>
      <Link className="button button-primary" href="/">
        Back to homepage
      </Link>
    </section>
  );
}
