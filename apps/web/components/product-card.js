import Link from 'next/link';

import { StatusBadge } from './status-badge';

export function ProductCard({ product }) {
  const primaryHref = product.accessType === 'live' ? `${product.routePath}#start-now` : product.routePath;
  const primaryLabel = product.accessType === 'live' ? 'Start for $49/month' : product.ctaLabel;

  return (
    <article className="product-card">
      <div className="product-card-top">
        <StatusBadge status={product.status} />
        <p className="product-role">{product.suiteRole}</p>
      </div>
      <h3>{product.name}</h3>
      <p className="product-copy">{product.cardSummary}</p>
      <div className="product-actions">
        <Link className="button button-primary" href={primaryHref}>
          {primaryLabel}
        </Link>
        {product.accessType === 'live' ? (
          <a className="button button-secondary" href="mailto:hello@omnitoolset.com?subject=OmniToolset%20Demo">
            {product.secondaryCtaLabel}
          </a>
        ) : null}
      </div>
    </article>
  );
}
