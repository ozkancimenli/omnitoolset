import Link from 'next/link';
import { notFound } from 'next/navigation';

import { AccessForm } from '../../components/access-form';
import { SmsCheckoutPanel } from '../../components/sms-checkout-panel';
import { StatusBadge } from '../../components/status-badge';
import { getProductPageModel } from '../../lib/site';
import { productCatalog } from '@omnitoolset/shared/products';

function getRoutePath(slug) {
  return `/${slug}`;
}

export function generateStaticParams() {
  return productCatalog.map((product) => ({
    slug: product.routePath.slice(1)
  }));
}

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const model = getProductPageModel(getRoutePath(slug));

  if (!model) {
    return {};
  }

  return {
    title: `${model.product.name} | OmniToolset`,
    description: model.product.headline
  };
}

export default async function ProductPage({ params, searchParams }) {
  const { slug } = await params;
  const resolvedSearchParams = await searchParams;
  const submissionState = resolvedSearchParams?.submitted;
  const checkoutState = resolvedSearchParams?.checkout;
  const model = getProductPageModel(getRoutePath(slug));

  if (!model) {
    notFound();
  }

  const { product, relatedProducts } = model;
  const isLiveProduct = product.accessType === 'live';

  return (
    <div className="page">
      <section className="shell product-hero">
        <div className="product-hero-copy">
          <StatusBadge status={product.status} />
          <h1>{product.name}</h1>
          <p className="lede">{product.headline}</p>
          <p>{product.summary}</p>
          {isLiveProduct ? (
            <div className="hero-proof">
              <span>Live now</span>
              <span>$49/month</span>
              <span>Checkout in under a minute</span>
            </div>
          ) : null}
          <div className="hero-actions">
            {isLiveProduct ? (
              <>
                <a className="button button-primary" href="#start-now">
                  Start for $49/month
                </a>
                <a className="button button-secondary" href="mailto:hello@omnitoolset.com?subject=OmniToolset%20Demo">
                  Request Demo
                </a>
              </>
            ) : (
              <a className="button button-primary" href="#early-access">
                {product.ctaLabel}
              </a>
            )}
          </div>
        </div>
        {isLiveProduct ? (
          <SmsCheckoutPanel compact />
        ) : (
          <div className="product-hero-panel">
            <p className="eyebrow">Platform Role</p>
            <h2>{product.suiteRole}</h2>
            <ul className="feature-list">
              {product.highlights.map((highlight) => (
                <li key={highlight}>{highlight}</li>
              ))}
            </ul>
          </div>
        )}
      </section>

      {submissionState === '1' ? (
        <section className="shell">
          <div className="notice-banner">Thanks. We’ve saved your request and will follow up with access details.</div>
        </section>
      ) : null}

      {checkoutState === 'success' ? (
        <section className="shell">
          <div className="notice-banner">
            Payment complete. Your SMS AI Assistant subscription is active and we’ve created your billing record.
          </div>
        </section>
      ) : null}

      {checkoutState === 'cancel' ? (
        <section className="shell">
          <div className="notice-banner">
            Checkout was canceled. You can come back any time to restart the subscription flow.
          </div>
        </section>
      ) : null}

      {submissionState === '0' ? (
        <section className="shell">
          <div className="notice-banner notice-banner-error">We couldn’t save that request. Please check the form and try again.</div>
        </section>
      ) : null}

      {!isLiveProduct ? (
        <section className="shell section" id="early-access">
          <AccessForm
            description={`Tell us a bit about your business and we’ll reach out when ${product.name} opens up.`}
            product={product}
            products={[]}
            title={product.status}
          />
        </section>
      ) : (
        <section className="shell section">
          <div className="live-product-grid live-product-grid-secondary">
            <div className="live-product-callout">
              <p className="eyebrow">What Happens Next</p>
              <h2>Go from payment to live setup in one short flow.</h2>
              <p>
                After checkout, we send you straight into onboarding so your business details,
                hours, phone, and pricing note are ready before the assistant starts replying.
              </p>
            </div>
            <div className="panel-card onboarding-steps-card">
              <p className="eyebrow">Setup Flow</p>
              <ol className="journey-list">
                <li>Start subscription with Stripe Checkout.</li>
                <li>Complete the onboarding form for your business details.</li>
                <li>Activate SMS handling and manage it from the settings page.</li>
              </ol>
              <div className="hero-actions">
                <a className="button button-primary" href="#start-now">
                  Start Checkout
                </a>
              </div>
            </div>
          </div>
        </section>
      )}

      <section className="shell section">
        <div className="section-heading">
          <p className="eyebrow">Explore More</p>
          <h2>Other OmniToolset products</h2>
        </div>
        <div className="related-links">
          {relatedProducts.map((entry) => (
            <Link key={entry.moduleId} className="related-link" href={entry.routePath}>
              <span>{entry.name}</span>
              <StatusBadge status={entry.status} />
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
