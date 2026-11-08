import Link from 'next/link';

export const metadata = { title: 'About', description: 'OmniToolset builds free, private online tools that run entirely in your browser.', alternates: { canonical: '/about' } };

export default function About() {
  return (
    <article className="prose">
      <h1>About OmniToolset</h1>
      <p>OmniToolset is a collection of free online tools for everyday tasks — compressing images, merging PDFs, making QR codes, formatting JSON and more.</p>
      <p>We built it around one principle: <strong>your files should not have to leave your computer to be converted</strong>. Many free converters upload documents to their servers. Every OmniToolset tool runs in your browser instead, using modern web technology, so it is private by design and often faster.</p>
      <p>The tools are free, with no accounts, watermarks or daily limits. The site is supported by unobtrusive advertising.</p>
      <p>Missing a tool you need? <Link href="/contact">Tell us</Link> — new tools are added regularly.</p>
    </article>
  );
}
