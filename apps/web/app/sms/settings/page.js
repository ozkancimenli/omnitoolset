import Link from 'next/link';

import { SmsSettingsPanel } from '../../../components/sms-settings-panel';

export const metadata = {
  title: 'SMS AI Assistant Settings | OmniToolset',
  description: 'Manage the minimal live settings for your SMS AI Assistant.'
};

export default async function SmsSettingsPage({ searchParams }) {
  const resolvedSearchParams = await searchParams;
  const sessionId = resolvedSearchParams?.session_id || '';

  return (
    <section className="shell section">
      {sessionId ? (
        <SmsSettingsPanel sessionId={sessionId} />
      ) : (
        <div className="setup-complete-card">
          <p className="eyebrow">Missing Session</p>
          <h1>This settings link is incomplete.</h1>
          <p>Return to onboarding or use the original setup link from your checkout flow.</p>
          <div className="hero-actions">
            <Link className="button button-primary" href="/sms">
              Back to SMS AI Assistant
            </Link>
            <a
              className="button button-secondary"
              href="mailto:hello@omnitoolset.com?subject=OmniToolset%20SMS%20Settings"
            >
              Contact Support
            </a>
          </div>
        </div>
      )}
    </section>
  );
}
