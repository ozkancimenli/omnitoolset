import Link from 'next/link';
import { TOOLS, CATEGORIES } from '@/lib/tools';
import { POSTS } from '@/lib/posts';
import Ad from '@/components/Ad';

export const metadata = { alternates: { canonical: '/' } };

export default function Home() {
  return (
    <>
      <h1>Free online tools that never upload your files</h1>
      <p className="lead">Compress images, merge PDFs, make QR codes, format JSON and more. Every tool runs inside your browser — fast, private and free, with no sign-up.</p>
      <div id="tools">
        {Object.entries(CATEGORIES).map(([key, label]) => {
          const list = TOOLS.filter((t) => t.category === key); if (!list.length) return null;
          return (
            <section key={key}>
              <h2>{label}</h2>
              <div className="grid">{list.map((t) => <Link key={t.slug} href={`/tools/${t.slug}`} className="card"><h3>{t.name}</h3><p>{t.description.split('. ')[0]}.</p></Link>)}</div>
            </section>
          );
        })}
      </div>
      <Ad />
      <h2>Guides</h2>
      <div className="grid">{POSTS.slice(0, 6).map((p) => <Link key={p.slug} href={`/blog/${p.slug}`} className="card"><h3>{p.title}</h3><p>{p.description}</p></Link>)}</div>
      <section className="prose">
        <h2>Why OmniToolset?</h2>
        <p>Most “free” online converters upload your files to their servers. OmniToolset does the work on your own device using modern browser technology, so contracts, photos and code never leave your computer. There are no accounts, no watermarks and no daily limits.</p>
      </section>
    </>
  );
}
