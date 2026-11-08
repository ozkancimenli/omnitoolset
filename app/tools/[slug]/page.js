import Link from 'next/link';
import { notFound } from 'next/navigation';
import { TOOLS, CATEGORIES, toolBySlug } from '@/lib/tools';
import { POSTS } from '@/lib/posts';
import { SITE } from '@/lib/site';
import ToolRenderer from '@/components/ToolRenderer';
import Ad from '@/components/Ad';

export const dynamicParams = false;
export function generateStaticParams() { return TOOLS.map((t) => ({ slug: t.slug })); }

export async function generateMetadata({ params }) {
  const { slug } = await params; const t = toolBySlug(slug); if (!t) return {};
  return { title: { absolute: t.title }, description: t.description, alternates: { canonical: `/tools/${t.slug}` },
    openGraph: { title: t.title, description: t.description, url: `/tools/${t.slug}` } };
}

export default async function ToolPage({ params }) {
  const { slug } = await params; const t = toolBySlug(slug); if (!t) notFound();
  const related = TOOLS.filter((x) => x.category === t.category && x.slug !== t.slug).concat(TOOLS.filter((x) => x.category !== t.category)).slice(0, 4);
  const guides = POSTS.filter((p) => p.tools?.includes(t.slug)).slice(0, 3);
  const ld = [
    { '@context': 'https://schema.org', '@type': 'WebApplication', name: t.name, url: `${SITE.url}/tools/${t.slug}`, applicationCategory: 'UtilitiesApplication', operatingSystem: 'Any (web browser)', description: t.description, offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' } },
    { '@context': 'https://schema.org', '@type': 'FAQPage', mainEntity: t.faq.map(([q, a]) => ({ '@type': 'Question', name: q, acceptedAnswer: { '@type': 'Answer', text: a } })) },
    { '@context': 'https://schema.org', '@type': 'BreadcrumbList', itemListElement: [{ '@type': 'ListItem', position: 1, name: 'Tools', item: SITE.url }, { '@type': 'ListItem', position: 2, name: t.name, item: `${SITE.url}/tools/${t.slug}` }] },
  ];
  return (
    <article>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(ld) }} />
      <div className="crumbs"><Link href="/">Tools</Link> › {CATEGORIES[t.category]} › {t.name}</div>
      <h1>{t.name}</h1>
      <p className="lead">{t.intro}</p>
      <span className="badge">Free · No sign-up · Files stay on your device</span>
      <ToolRenderer slug={t.slug} />
      <Ad />
      <section className="prose">
        <h2>How to use the {t.name.toLowerCase()}</h2>
        <ol className="steps">{t.steps.map((s) => <li key={s}>{s}</li>)}</ol>
        <h2>Frequently asked questions</h2>
        <dl className="faq">{t.faq.map(([q, a]) => <div key={q}><dt>{q}</dt><dd>{a}</dd></div>)}</dl>
        {guides.length > 0 && <><h2>Related guides</h2><ul>{guides.map((p) => <li key={p.slug}><Link href={`/blog/${p.slug}`}>{p.title}</Link></li>)}</ul></>}
      </section>
      <h2>More free tools</h2>
      <div className="grid">{related.map((r) => <Link key={r.slug} href={`/tools/${r.slug}`} className="card"><h3>{r.name}</h3><p>{r.description.split('. ')[0]}.</p></Link>)}</div>
    </article>
  );
}
