import Link from 'next/link';

import { SmsOnboardingForm } from '../../../components/sms-onboarding-form';

export const metadata = {
  title: 'SMS AI Assistant Onboarding | OmniToolset',
  description: 'Complete your SMS AI Assistant setup after payment.'
};

export default async function SmsOnboardingPage({ searchParams }) {
  const resolvedSearchParams = await searchParams;
  const sessionId = resolvedSearchParams?.session_id || '';
  const completed = resolvedSearchParams?.completed === '1';
  const settingsHref = sessionId
    ? `/sms/settings?session_id=${encodeURIComponent(sessionId)}`
    : '/sms';

  return (
    <section className="shell section">
      {completed ? (
        <div className="setup-complete-card">
          <p className="eyebrow">Setup Complete</p>
          <h1>Your SMS assistant is now active.</h1>
          <p>We&apos;ll start responding to your customers.</p>
          <div className="hero-actions">
            <Link className="button button-primary" href={settingsHref}>
              Open Settings
            </Link>
            <Link className="button button-secondary" href="/sms">
              Back to SMS AI Assistant
            </Link>
            <a
              className="button button-secondary"
              href="mailto:hello@omnitoolset.com?subject=OmniToolset%20Onboarding"
            >
              Contact Support
            </a>
          </div>
        </div>
      ) : sessionId ? (
        <SmsOnboardingForm sessionId={sessionId} />
      ) : (
        <div className="setup-complete-card">
          <p className="eyebrow">Missing Session</p>
          <h1>This onboarding link is incomplete.</h1>
          <p>Return to the SMS page and restart checkout if needed.</p>
          <Link className="button button-primary" href="/sms">
            Back to SMS AI Assistant
          </Link>
        </div>
      )}
    </section>
  );
}
