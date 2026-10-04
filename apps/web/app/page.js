import Link from 'next/link';

import { ProductCard } from '../components/product-card';
import { getHomePageModel } from '../lib/site';

export default function HomePage() {
  const model = getHomePageModel();
  const liveProduct = model.liveProduct;

  return (
    <div className="page">
      <section className="hero shell">
        <div className="hero-copy">
          <p className="eyebrow">{model.platform.name}</p>
          <h1>{model.headline}</h1>
          <p className="lede">
            Start with the live SMS AI Assistant, then add follow-up, reviews, lead capture,
            inbox workflows, and custom automations on the same modular foundation.
          </p>
          <div className="hero-proof">
            <span>Reply to inbound texts</span>
            <span>Recover missed calls</span>
            <span>Move conversations toward booking</span>
          </div>
          <div className="hero-actions">
            <Link className="button button-primary" href={liveProduct.routePath}>
              See {liveProduct.shortName}
            </Link>
            <Link className="button button-secondary" href="/studio">
              Open Workflow Studio
            </Link>
          </div>
        </div>

        <div className="hero-panel">
          <div className="panel-card hero-pricing-card">
            <p className="eyebrow">Live now</p>
            <h2>{liveProduct.headline}</h2>
            <p>{liveProduct.summary}</p>
            <ul className="feature-list">
              {liveProduct.highlights.map((highlight) => (
                <li key={highlight}>{highlight}</li>
              ))}
            </ul>
            <div className="hero-actions">
              <Link className="button button-primary" href={liveProduct.routePath}>
                Get started
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section id="modules" className="shell section">
        <div className="section-heading">
          <p className="eyebrow">Product suite</p>
          <h2>Automate one customer workflow first. Expand only when it earns its place.</h2>
          <p>
            OmniToolset is built as a suite, but it does not pretend every module is finished.
            The SMS AI Assistant is live; beta and coming-soon modules are labeled clearly.
          </p>
        </div>
        <div className="product-grid">
          {model.products.map((product) => (
            <ProductCard key={product.moduleId} product={product} />
          ))}
        </div>
      </section>

      <section id="workflows" className="shell section duo-section">
        <div className="duo-copy">
          <p className="eyebrow">Workflow engine</p>
          <h2>Turn repeatable operator work into reusable workflows.</h2>
          <p>
            Use the same runtime behind the product suite for internal briefs, intake flows,
            integrations, and custom automations without rebuilding the foundation each time.
          </p>
          <div className="product-grid compact-grid">
            {model.workflows.map((workflow) => (
              <article key={workflow.key} className="product-card compact-card">
                <h3>{workflow.name}</h3>
                <p className="product-copy">{workflow.summary}</p>
              </article>
            ))}
          </div>
        </div>

        <div className="panel-card code-panel">
          <p className="eyebrow">Operator mode</p>
          <h3>Build and run workflows in one place.</h3>
          <p>
            The Studio exposes the workflow layer directly so the platform can serve both packaged
            products and custom operator workflows.
          </p>
          <div className="hero-actions">
            <Link className="button button-primary" href="/studio">
              Open Studio
            </Link>
          </div>
        </div>
      </section>

      <section id="platform" className="shell section">
        <div className="section-heading">
          <p className="eyebrow">Why the platform can keep expanding</p>
          <h2>A small shared core instead of five disconnected apps.</h2>
          <p>
            Products, tools, integrations, and workflows share a clear runtime so new modules can
            reuse the same contacts, conversations, automation primitives, and run history.
          </p>
        </div>
        <div className="product-grid">
          {model.capabilities.map((capability) => (
            <article key={capability.key} className="product-card">
              <div className="product-card-top">
                <p className="product-role">Core capability</p>
              </div>
              <h3>{capability.name}</h3>
              <p className="product-copy">{capability.summary}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="shell section">
        <div className="section-heading">
          <p className="eyebrow">Integrations</p>
          <h2>External services stay replaceable instead of becoming the architecture.</h2>
          <p>
            Vendor-specific logic stays behind focused clients so the product layer can evolve
            without spreading credentials and transport code everywhere.
          </p>
        </div>
        <div className="product-grid compact-grid">
          {model.integrations.map((integration) => (
            <article key={integration.key} className="product-card compact-card">
              <h3>{integration.name}</h3>
              <p className="product-copy">{integration.summary}</p>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}
