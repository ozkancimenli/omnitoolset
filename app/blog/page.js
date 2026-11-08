import Link from 'next/link';
import { POSTS } from '@/lib/posts';

export const metadata = { title: 'Guides', description: 'Practical guides for working with images, PDFs, QR codes, passwords and web publishing.', alternates: { canonical: '/blog' } };

export default function Blog() {
  return (
    <>
      <h1>Guides</h1>
      <p className="lead">Short, practical answers to everyday file and web questions.</p>
      <div className="grid">{POSTS.map((p) => <Link key={p.slug} href={`/blog/${p.slug}`} className="card"><h3>{p.title}</h3><p>{p.description}</p></Link>)}</div>
    </>
  );
}
