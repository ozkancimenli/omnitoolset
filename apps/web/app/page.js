import Link from 'next/link';

const showroomCards = [
  {
    title: 'Beauty & wellness',
    copy:
      'Clean, premium, booking-focused sites for salons, medspas, lashes, brows, and aesthetic brands.',
  },
  {
    title: 'Home services',
    copy:
      'Stronger service pages, clearer calls-to-action, and faster follow-up for HVAC, plumbing, roofing, and contractors.',
  },
  {
    title: 'Professional services',
    copy:
      'Sharper trust signals, better conversion flow, and cleaner lead handling for clinics, legal offices, and local service firms.',
  },
];

const showroomExamples = [
  {
    name: 'Northstar Aesthetics',
    angle: 'Luxury medspa landing experience',
    outcome: 'Cleaner brand, stronger booking CTA, better lead capture.',
  },
  {
    name: 'Harbor Smile Studio',
    angle: 'Modern dental site refresh',
    outcome: 'Clearer service pages, better trust sections, simpler conversion path.',
  },
  {
    name: 'BluePeak Home Services',
    angle: 'Lead-first home services layout',
    outcome: 'Faster quote flow, clearer service structure, stronger local credibility.',
  },
];

export default async function HomePage({ searchParams }) {
  const submissionState = (await searchParams)?.submitted;

  return (
    <div className="page">
      <section className="hero shell">
        <div className="hero-copy">
          <p className="eyebrow">OmniToolset</p>
          <h1>We build websites that help local businesses close more customers.</h1>
          <p className="lede">
            Better websites, better lead capture, and better follow-up systems — without bloated agency
            retainers or gimmicky chatbot sales talk.
          </p>
          <div className="hero-proof">
            <span>Website upgrades</span>
            <span>Lead capture</span>
            <span>Email follow-up</span>
          </div>
          <div className="hero-actions">
            <a className="button button-primary" href="#audit">
              Get a Free Audit
            </a>
            <a className="button button-secondary" href="#showroom">
              View Showroom
            </a>
          </div>
        </div>
        <div className="hero-panel">
          <div className="panel-card hero-pricing-card">
            <p className="eyebrow">What we actually do</p>
            <h2>We fix the parts of your website that lose leads.</h2>
            <p>
              Most local businesses do not have a traffic problem. They have a conversion and follow-up
              problem. We tighten the site, improve the offer, and build a cleaner path from visitor to lead.
            </p>
            <ul className="feature-list">
              <li>Website refreshes that look sharper and convert better</li>
              <li>Lead capture built around calls, forms, and booking intent</li>
              <li>Follow-up systems so fewer leads go cold</li>
            </ul>
          </div>
        </div>
      </section>

      {submissionState === '1' ? (
        <section className="shell">
          <div className="notice-banner">Thanks. Your request was received and we’ll follow up soon.</div>
        </section>
      ) : null}

      {submissionState === '0' ? (
        <section className="shell">
          <div className="notice-banner notice-banner-error">We couldn’t save that request. Please check your form details and try again.</div>
        </section>
      ) : null}

      <section className="shell section">
        <div className="section-heading">
          <p className="eyebrow">What we fix</p>
          <h2>Most local sites are leaving money on the table.</h2>
          <p>
            Weak first impressions, confusing calls-to-action, and no follow-up system quietly kill leads.
            We fix that.
          </p>
        </div>
        <div className="product-grid">
          <div className="product-card">
            <div className="product-card-top">
              <h3>Outdated website</h3>
              <p className="product-copy">
                Slow, cluttered, weak on mobile, and not built to convert attention into action.
              </p>
            </div>
          </div>
          <div className="product-card">
            <div className="product-card-top">
              <h3>Weak lead capture</h3>
              <p className="product-copy">
                Hidden forms, vague offers, and no obvious path to become a real lead.
              </p>
            </div>
          </div>
          <div className="product-card">
            <div className="product-card-top">
              <h3>No follow-up system</h3>
              <p className="product-copy">
                Hot leads cool off because nobody follows up clearly, fast, or consistently.
              </p>
            </div>
          </div>
          <div className="product-card">
            <div className="product-card-top">
              <h3>Messy customer journey</h3>
              <p className="product-copy">
                Visitors do not know what to click, what to do next, or why they should trust you.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section id="showroom" className="shell section">
        <div className="section-heading">
          <p className="eyebrow">Showroom</p>
          <h2>If you work with us, this is the level we’re aiming for.</h2>
          <p>
            Not generic templates. Clean, conversion-minded sites built to make a business look better and close more leads.
          </p>
        </div>
        <div className="product-grid">
          {showroomExamples.map((example) => (
            <div key={example.name} className="product-card showroom-card">
              <div className="showroom-browser">
                <span />
                <span />
                <span />
              </div>
              <div className="product-card-top">
                <h3>{example.name}</h3>
                <p className="product-role">{example.angle}</p>
                <p className="product-copy">{example.outcome}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="shell section duo-section">
        <div className="duo-copy">
          <p className="eyebrow">Best fit</p>
          <h2>Built for local businesses where one extra customer matters.</h2>
          <p>
            We are a strong fit for beauty, wellness, home services, and other local businesses where better positioning and follow-up create real revenue.
          </p>
          <div className="product-grid compact-grid">
            {showroomCards.map((card) => (
              <div key={card.title} className="product-card compact-card">
                <h3>{card.title}</h3>
                <p className="product-copy">{card.copy}</p>
              </div>
            ))}
          </div>
        </div>
        <div id="audit" className="access-panel access-panel-compact">
          <div className="section-copy">
            <p className="eyebrow">Free Audit</p>
            <h3>Get a free website + lead flow audit</h3>
            <p>
              We’ll review your current site, show where leads are slipping away, and outline what would improve conversions.
            </p>
          </div>
          <form className="access-form">
            <label>
              Business name
              <input type="text" name="businessName" placeholder="Northstar Aesthetics" />
            </label>
            <label>
              Website URL
              <input type="url" name="websiteUrl" placeholder="https://yourbusiness.com" />
            </label>
            <label>
              Contact email
              <input type="email" name="email" placeholder="hello@yourbusiness.com" />
            </label>
            <label>
              What do you want more of?
              <textarea name="goal" placeholder="More calls, bookings, qualified leads, or all three." />
            </label>
            <button className="button button-primary" type="button">
              Request Free Audit
            </button>
          </form>
        </div>
      </section>
    </div>
  );
}
