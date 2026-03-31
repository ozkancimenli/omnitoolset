import Link from 'next/link';
import { notFound } from 'next/navigation';

const demos = {
  'northstar-aesthetics': {
    name: 'Northstar Aesthetics',
    category: 'Luxury medspa concept',
    hero: 'A cleaner, more premium medspa website that pushes visitors toward booking.',
    cta: 'Book a Consultation',
    intro:
      'This concept is built to feel high-end, calm, and conversion-focused. It leads with trust, premium branding, and a stronger path to booking.',
    highlights: [
      'Premium visual hierarchy and cleaner service presentation',
      'Booking-first calls to action across the page',
      'Trust-building sections for reviews, results, and FAQs',
    ],
    sections: [
      {
        title: 'Featured services',
        body: 'Injectables, skin treatments, facials, and personalized treatment plans presented in a cleaner, more premium format.',
      },
      {
        title: 'Why this converts better',
        body: 'The visitor immediately understands the value, sees trust signals, and gets multiple chances to book without friction.',
      },
    ],
  },
  'harbor-smile-studio': {
    name: 'Harbor Smile Studio',
    category: 'Modern dental concept',
    hero: 'A sharper dental website with stronger trust, clearer services, and simpler conversion flow.',
    cta: 'Request an Appointment',
    intro:
      'This concept is designed to make a dental office feel more modern, trustworthy, and easier to contact from the first click.',
    highlights: [
      'Clear service pages for exams, cleanings, cosmetic care, and restorative work',
      'Better trust structure for insurance, reviews, and first-visit reassurance',
      'Cleaner appointment and contact flow',
    ],
    sections: [
      {
        title: 'Patient-first structure',
        body: 'Key details are easier to find: accepted insurance, office information, treatment categories, and appointment actions.',
      },
      {
        title: 'Why this converts better',
        body: 'The site reduces hesitation, answers common objections, and gives visitors a more direct reason to contact the office.',
      },
    ],
  },
  'bluepeak-home-services': {
    name: 'BluePeak Home Services',
    category: 'Home services concept',
    hero: 'A lead-first home services site built to turn more local traffic into booked calls and quote requests.',
    cta: 'Get a Fast Quote',
    intro:
      'This concept is designed for service businesses that need clearer offers, stronger service pages, and a cleaner path to inquiry.',
    highlights: [
      'More direct hero messaging and stronger local credibility',
      'Cleaner service pages and quote request flow',
      'Better positioning for urgent calls and weekday inquiries',
    ],
    sections: [
      {
        title: 'Lead flow focus',
        body: 'The site emphasizes quote actions, local trust, service clarity, and follow-up-friendly contact capture.',
      },
      {
        title: 'Why this converts better',
        body: 'Visitors immediately understand what you do, where you work, and how to take the next step without getting lost.',
      },
    ],
  },
};

export function generateStaticParams() {
  return Object.keys(demos).map((slug) => ({ slug }));
}

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const demo = demos[slug];

  if (!demo) {
    return {};
  }

  return {
    title: `${demo.name} Showroom | OmniToolset`,
    description: demo.hero,
  };
}

export default async function ShowroomPage({ params }) {
  const { slug } = await params;
  const demo = demos[slug];

  if (!demo) {
    notFound();
  }

  return (
    <div className="page">
      <section className="shell product-hero showroom-page-hero">
        <div className="product-hero-copy">
          <p className="eyebrow">Showroom Preview</p>
          <h1>{demo.name}</h1>
          <p className="lede">{demo.hero}</p>
          <p>{demo.intro}</p>
          <div className="hero-actions">
            <a className="button button-primary" href="#preview">
              Preview Concept
            </a>
            <Link className="button button-secondary" href="/#audit">
              Get a Free Audit
            </Link>
          </div>
        </div>
        <div className="panel-card showroom-summary-card">
          <p className="eyebrow">Concept Focus</p>
          <h2>{demo.category}</h2>
          <ul className="feature-list">
            {demo.highlights.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </div>
      </section>

      <section id="preview" className="shell section">
        <div className="showroom-stage">
          <div className="showroom-topbar">
            <span />
            <span />
            <span />
            <div className="showroom-url">{demo.name.toLowerCase().replace(/\s+/g, '')}.omnitoolset.demo</div>
          </div>
          <div className="showroom-canvas">
            <div className="showroom-hero-block">
              <div>
                <p className="eyebrow">{demo.category}</p>
                <h2>{demo.hero}</h2>
                <p>{demo.intro}</p>
                <div className="hero-actions">
                  <button className="button button-primary" type="button">{demo.cta}</button>
                  <button className="button button-secondary" type="button">See Services</button>
                </div>
              </div>
              <div className="showroom-visual-card">
                <div className="showroom-metric">
                  <strong>Cleaner layout</strong>
                  <span>More premium first impression</span>
                </div>
                <div className="showroom-metric">
                  <strong>Stronger CTA</strong>
                  <span>Better path from visitor to lead</span>
                </div>
                <div className="showroom-metric">
                  <strong>Follow-up ready</strong>
                  <span>Built for inquiry capture and better conversion</span>
                </div>
              </div>
            </div>
            <div className="showroom-section-grid">
              {demo.sections.map((section) => (
                <div key={section.title} className="product-card">
                  <h3>{section.title}</h3>
                  <p className="product-copy">{section.body}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
