import Link from 'next/link';
import { notFound } from 'next/navigation';
import { POSTS, postBySlug } from '@/lib/posts';
import { toolBySlug } from '@/lib/tools';
import { SITE } from '@/lib/site';
import Ad from '@/components/Ad';

export const dynamicParams = false;
export function generateStaticParams() { return POSTS.map((p) => ({ slug: p.slug })); }

export async function generateMetadata({ params }) {
  const { slug } = await params; const p = postBySlug(slug); if (!p) return {};
  return { title: { absolute: `${p.title} | ${SITE.name}` }, description: p.description, alternates: { canonical: `/blog/${p.slug}` },
    openGraph: { type: 'article', title: p.title, description: p.description, url: `/blog/${p.slug}`, publishedTime: p.date } };
}

export default async function Post({ params }) {
  const { slug } = await params; const p = postBySlug(slug); if (!p) notFound();
  const ld = { '@context': 'https://schema.org', '@type': 'Article', headline: p.title, description: p.description, datePublished: p.date, dateModified: p.date,
    author: { '@type': 'Organization', name: SITE.name }, publisher: { '@type': 'Organization', name: SITE.name }, mainEntityOfPage: `${SITE.url}/blog/${p.slug}` };
  const tools = (p.tools || []).map(toolBySlug).filter(Boolean);
  return (
    <article className="prose">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(ld) }} />
      <div className="crumbs"><Link href="/blog">Guides</Link></div>
      <h1>{p.title}</h1>
      <p className="muted">Updated {new Date(p.date + 'T12:00:00Z').toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</p>
      {p.sections.map((s, i) => (
        <section key={i}>
          {s.h && <h2>{s.h}</h2>}
          {(s.p || []).map((t, j) => <p key={j}>{t}</p>)}
          {s.list && <ul>{s.list.map((t, j) => <li key={j}>{t}</li>)}</ul>}
          {i === 1 && <Ad />}
        </section>
      ))}
      {tools.length > 0 && <>
        <h2>Try it free</h2>
        <div className="grid">{tools.map((t) => <Link key={t.slug} href={`/tools/${t.slug}`} className="card"><h3>{t.name}</h3><p>{t.description.split('. ')[0]}.</p></Link>)}</div>
      </>}
    </article>
  );
}
