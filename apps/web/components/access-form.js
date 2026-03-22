import { buildAccessRequestAction, buildReturnUrl } from '../lib/site';

function renderProductOptions(products) {
  return products.map((product) => (
    <option key={product.slug} value={product.slug}>
      {product.name} ({product.status})
    </option>
  ));
}

export function AccessForm({ products, product = null, title, description, compact = false }) {
  const action = buildAccessRequestAction();
  const selectableProducts = product ? [product] : products;

  return (
    <section className={`access-panel ${compact ? 'access-panel-compact' : ''}`}>
      <div className="section-copy">
        <p className="eyebrow">{title}</p>
        <h3>{product ? `${product.ctaLabel} for ${product.name}` : 'Join early access'}</h3>
        <p>{description}</p>
      </div>
      <form action={action} className="access-form" method="post">
        <input name="returnTo" type="hidden" value={buildReturnUrl(product?.routePath || '/')} />
        {product ? (
          <input name="productSlug" type="hidden" value={product.slug} />
        ) : (
          <label>
            Product
            <select defaultValue={selectableProducts[0]?.slug} name="productSlug" required>
              {renderProductOptions(selectableProducts)}
            </select>
          </label>
        )}
        <label>
          Name
          <input autoComplete="name" maxLength={120} name="name" placeholder="Jordan Lee" required type="text" />
        </label>
        <label>
          Email
          <input
            autoComplete="email"
            maxLength={160}
            name="email"
            placeholder="jordan@company.com"
            required
            type="email"
          />
        </label>
        <label>
          Company Name
          <input autoComplete="organization" maxLength={160} name="companyName" placeholder="Northstar Health" required type="text" />
        </label>
        <label>
          Optional Note
          <textarea maxLength={400} name="note" placeholder="What would you want this product to handle first?" rows={4} />
        </label>
        <button className="button button-primary" type="submit">
          {product ? product.ctaLabel : 'Submit'}
        </button>
      </form>
    </section>
  );
}
