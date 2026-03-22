import Link from 'next/link';

import { AccessForm } from '../components/access-form';
import { ProductCard } from '../components/product-card';
import { StatusBadge } from '../components/status-badge';
import { getHomePageModel } from '../lib/site';

export default async function HomePage({ searchParams }) {
  const { headline, products, liveProduct, accessProducts } = getHomePageModel();
  const submissionState = (await searchParams)?.submitted;

  return (
    <div className="page">
      <section className="hero shell">
        <div className="hero-copy">
          <p className="eyebrow">OmniToolset</p>
          <h1>{headline}</h1>
          <p className="lede">
            One live product today, four staged products behind it, and a single platform designed
            for local businesses that need faster customer response.
          </p>
          <div className="hero-actions">
            <Link className="button button-primary" href={liveProduct.routePath}>
              Get Started
            </Link>
            <a className="button button-secondary" href="mailto:hello@omnitoolset.com?subject=OmniToolset%20Demo">
              Request Demo
            </a>
          </div>
        </div>
        <div className="hero-panel">
          <div className="panel-card">
            <StatusBadge status={liveProduct.status} />
            <h2>{liveProduct.name}</h2>
            <p>{liveProduct.summary}</p>
            <ul className="feature-list">
              {liveProduct.highlights.map((highlight) => (
                <li key={highlight}>{highlight}</li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {submissionState === '1' ? (
        <section className="shell">
          <div className="notice-banner">Thanks. Your request was received and we’ll follow up when access opens.</div>
        </section>
      ) : null}

      {submissionState === '0' ? (
        <section className="shell">
          <div className="notice-banner notice-banner-error">We couldn’t save that request. Please check your form details and try again.</div>
        </section>
      ) : null}

      <section className="shell section">
        <div className="section-heading">
          <p className="eyebrow">Product Suite</p>
          <h2>Five products. One platform.</h2>
          <p>
            SMS AI Assistant is live now. The rest of the suite is intentionally staged as beta or
            coming soon modules with real product pages and early access capture.
          </p>
        </div>
        <div className="product-grid">
          {products.map((product) => (
            <ProductCard key={product.moduleId} product={product} />
          ))}
        </div>
      </section>

      <section className="shell section duo-section">
        <div className="duo-copy">
          <p className="eyebrow">Why start with SMS</p>
          <h2>The first live workflow is the one that drives revenue fastest.</h2>
          <p>
            SMS AI Assistant handles the highest-friction moment for a local business: replying
            quickly enough to win the customer and get the booking.
          </p>
        </div>
        <AccessForm
          compact
          description="Join the beta or waitlist for the next OmniToolset modules."
          products={accessProducts}
          title="Early Access"
        />
      </section>
    </div>
  );
}
