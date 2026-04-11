import Link from 'next/link';

import { ProductCard } from '../components/product-card';
import { getHomePageModel } from '../lib/site';

export default function HomePage() {
  const model = getHomePageModel();

  return (
    <div className="page">
      <section className="hero shell">
        <div className="hero-copy">
          <p className="eyebrow">{model.platform.name}</p>
          <h1>{model.headline}</h1>
          <p className="lede">{model.platform.description}</p>
          <div className="hero-proof">
            <span>Modular tools</span>
            <span>Workflow runtime</span>
            <span>Operator-friendly integrations</span>
          </div>
          <div className="hero-actions">
            <Link className="button button-primary" href="/studio">
              Open Workflow Studio
            </Link>
            <Link className="button button-secondary" href="/sms">
              Explore Live Module
            </Link>
          </div>
        </div>

        <div className="hero-panel">
          <div className="panel-card hero-pricing-card">
            <p className="eyebrow">MVP shape</p>
            <h2>One live product, one generic runtime, one foundation worth extending.</h2>
            <p>
              The current build keeps the platform practical: a live SMS AI Assistant, staged product
              modules, and a reusable automation core that can run shared workflows across the suite.
            </p>
            <ul className="feature-list">
              {model.capabilities.map((capability) => (
                <li key={capability.key}>{capability.name}: {capability.summary}</li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      <section id="platform" className="shell section">
        <div className="section-heading">
          <p className="eyebrow">Architecture</p>
          <h2>Built around a small core with clear extension points.</h2>
          <p>
            Tools, integrations, workflows, and product modules stay separated so the platform can
            grow without rewriting the base runtime.
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

      <section id="modules" className="shell section">
        <div className="section-heading">
          <p className="eyebrow">Product Modules</p>
          <h2>Current suite under the OmniToolset umbrella.</h2>
          <p>
            The platform already supports multiple product modules, but only the SMS AI Assistant is
            live today. The rest stay honest and scaffolded for the next implementation phases.
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
          <p className="eyebrow">Workflow Engine</p>
          <h2>The first generic runtime is already usable.</h2>
          <p>
            OmniToolset now includes a small workflow runner with persisted run history, reusable
            tools, and a clean endpoint layer. It is intentionally small, but it is real and ready to
            extend.
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
          <p className="eyebrow">Example call</p>
          <h3>Run a workflow over HTTP</h3>
          <pre>{`curl -X POST https://api.omnitoolset.com/api/automation/workflows/text-brief/run \\
  -H "Content-Type: application/json" \\
  -d '{"text":"Call Alex tomorrow about the invoice."}'`}</pre>
          <div className="hero-actions">
            <Link className="button button-primary" href="/studio">
              Try in Studio
            </Link>
          </div>
        </div>
      </section>

      <section className="shell section">
        <div className="section-heading">
          <p className="eyebrow">Integrations</p>
          <h2>External services stay isolated behind clean clients.</h2>
          <p>
            Credentials, transport logic, and vendor-specific behavior live in one place so products
            and workflows can reuse them safely.
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
