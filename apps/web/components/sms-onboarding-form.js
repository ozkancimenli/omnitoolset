'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { apiFetchJson } from '../lib/api-client';

const emptyForm = {
  businessName: '',
  ownerName: '',
  email: '',
  phoneNumber: '',
  businessType: '',
  workingHours: '',
  pricingInfo: ''
};

export function SmsOnboardingForm({ sessionId }) {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [form, setForm] = useState(emptyForm);

  useEffect(() => {
    let active = true;

    async function loadContext() {
      try {
        const { response, payload } = await apiFetchJson(
          `/api/sms-assistant/onboarding/session?session_id=${encodeURIComponent(sessionId)}`
        );

        if (!response.ok || !payload.ok) {
          throw new Error(payload.error || 'Unable to load your onboarding session.');
        }

        if (!active) {
          return;
        }

        setForm({
          businessName: payload.business.name || '',
          ownerName: payload.business.ownerName || '',
          email: payload.business.email || '',
          phoneNumber: payload.business.phoneNumber || '',
          businessType: payload.business.businessType || '',
          workingHours: payload.business.workingHours || '',
          pricingInfo: payload.business.pricingInfo || ''
        });

        if (payload.business.status === 'active' && payload.business.onboardingCompletedAt) {
          router.replace(`/sms/onboarding?session_id=${encodeURIComponent(sessionId)}&completed=1`);
          return;
        }

        setLoading(false);
      } catch (loadError) {
        if (!active) {
          return;
        }

        setError(loadError.message);
        setLoading(false);
      }
    }

    loadContext();

    return () => {
      active = false;
    };
  }, [router, sessionId]);

  function updateField(event) {
    const { name, value } = event.target;
    setForm((current) => ({
      ...current,
      [name]: value
    }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setSubmitting(true);
    setError('');

    try {
      const { response, payload } = await apiFetchJson('/api/sms-assistant/onboarding', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          sessionId,
          ...form
        })
      });

      if (!response.ok || !payload.ok) {
        throw new Error(payload.error || 'Unable to save onboarding.');
      }

      router.replace(`/sms/onboarding?session_id=${encodeURIComponent(sessionId)}&completed=1`);
    } catch (submitError) {
      setError(submitError.message);
      setSubmitting(false);
    }
  }

  if (loading) {
    return <div className="checkout-panel">Loading your onboarding details…</div>;
  }

  return (
    <section className="checkout-panel">
      <div className="section-copy">
        <p className="eyebrow">SMS Onboarding</p>
        <h2>Finish setup in one step</h2>
        <p>
          Add the business details we need to activate your SMS assistant and prepare your account
          for message handling.
        </p>
      </div>
      <form className="access-form" onSubmit={handleSubmit}>
        <label>
          Business Name
          <input name="businessName" onChange={updateField} required type="text" value={form.businessName} />
        </label>
        <label>
          Owner Name
          <input name="ownerName" onChange={updateField} required type="text" value={form.ownerName} />
        </label>
        <label>
          Email
          <input name="email" onChange={updateField} required type="email" value={form.email} />
        </label>
        <label>
          Phone Number
          <input
            name="phoneNumber"
            onChange={updateField}
            placeholder="+15551234567"
            required
            type="tel"
            value={form.phoneNumber}
          />
        </label>
        <label>
          Business Type
          <input name="businessType" onChange={updateField} required type="text" value={form.businessType} />
        </label>
        <label>
          Working Hours
          <input
            name="workingHours"
            onChange={updateField}
            placeholder="Mon-Fri, 9:00 AM to 5:00 PM"
            required
            type="text"
            value={form.workingHours}
          />
        </label>
        <label>
          Optional Pricing Info
          <textarea name="pricingInfo" onChange={updateField} rows={4} value={form.pricingInfo} />
        </label>
        {error ? <p className="form-error">{error}</p> : null}
        <button className="button button-primary" disabled={submitting} type="submit">
          {submitting ? 'Saving…' : 'Complete Setup'}
        </button>
      </form>
    </section>
  );
}
