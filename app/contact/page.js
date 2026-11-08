import { SITE } from '@/lib/site';

export const metadata = { title: 'Contact', description: 'Contact OmniToolset with feedback, bug reports or tool requests.', alternates: { canonical: '/contact' } };

export default function Contact() {
  return (
    <article className="prose">
      <h1>Contact</h1>
      <p>Found a bug, need a new tool, or have a question about privacy? We read every message.</p>
      {SITE.contactEmail && <p>Email: <a href={`mailto:${SITE.contactEmail}`}>{SITE.contactEmail}</a></p>}
      <p>Bug reports and tool requests: <a href={SITE.contactUrl}>open an issue on GitHub</a>.</p>
    </article>
  );
}
