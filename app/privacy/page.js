export const metadata = { title: 'Privacy Policy', description: 'How OmniToolset handles your data: files are processed in your browser and never uploaded.', alternates: { canonical: '/privacy' } };

export default function Privacy() {
  return (
    <article className="prose">
      <h1>Privacy Policy</h1>
      <p className="muted">Last updated: November 7, 2026</p>
      <h2>Your files never leave your device</h2>
      <p>Every OmniToolset tool runs inside your web browser. Images, PDFs, text and other content you open in a tool are processed locally on your device. We do not upload, store, view or share them.</p>
      <h2>Information collected automatically</h2>
      <p>We use Vercel Web Analytics to count page views and understand which tools are popular. It collects aggregated, anonymous data (such as page visited, referrer, country and device type) and does not use cookies to track you across websites.</p>
      <h2>Advertising</h2>
      <p>We may show ads served by Google AdSense to keep the tools free. Google and its partners may use cookies or similar technologies to serve ads based on your visits to this and other websites. You can opt out of personalized advertising at <a href="https://www.google.com/settings/ads">Google Ads Settings</a> or <a href="https://www.aboutads.info/choices/">aboutads.info</a>. Learn how Google uses data at <a href="https://policies.google.com/technologies/partner-sites">policies.google.com/technologies/partner-sites</a>. Visitors in the European Economic Area, the UK and Switzerland are asked for consent before personalized ads are shown.</p>
      <h2>Your rights</h2>
      <p>Because we do not collect personal information through the tools, there is usually nothing to access or delete. If you have questions, see our <a href="/contact">contact page</a>.</p>
      <h2>Children</h2>
      <p>OmniToolset is not directed at children under 13 and does not knowingly collect their information.</p>
      <h2>Changes</h2>
      <p>We may update this policy; the date above shows the latest revision.</p>
    </article>
  );
}
