'use client';

import { useState } from 'react';

const initialForm = {
  name: '',
  email: '',
  companyName: ''
};

export function SmsCheckoutPanel() {
  const [form, setForm] = useState(initialForm);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  function updateField(event) {
    const { name, value } = event.target;
    setForm((current) => ({
      ...current,
      [name]: value
    }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/billing/checkout-sessions`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(form)
        }
      );

      const payload = await response.json();

      if (!response.ok || !payload.checkoutUrl) {
        throw new Error(payload.error || 'Unable to start checkout right now.');
      }

      window.location.assign(payload.checkoutUrl);
    } catch (submissionError) {
      setError(submissionError.message);
      setLoading(false);
    }
  }

  return (
    <section className="checkout-panel" id="start-now">
      <div className="section-copy">
        <p className="eyebrow">Start Now</p>
        <h2>Start for $49/month</h2>
        <p>
          Launch SMS AI Assistant with hosted Stripe Checkout. No dashboard setup required yet. We
          activate the subscription first, then use the billing record as the foundation for
          onboarding.
        </p>
      </div>
      <form className="access-form" onSubmit={handleSubmit}>
        <label>
          Your Name
          <input
            autoComplete="name"
            maxLength={120}
            name="name"
            onChange={updateField}
            placeholder="Jordan Lee"
            required
            type="text"
            value={form.name}
          />
        </label>
        <label>
          Work Email
          <input
            autoComplete="email"
            maxLength={160}
            name="email"
            onChange={updateField}
            placeholder="jordan@company.com"
            required
            type="email"
            value={form.email}
          />
        </label>
        <label>
          Business Name
          <input
            autoComplete="organization"
            maxLength={160}
            name="companyName"
            onChange={updateField}
            placeholder="Northstar Health"
            required
            type="text"
            value={form.companyName}
          />
        </label>
        {error ? <p className="form-error">{error}</p> : null}
        <button className="button button-primary" disabled={loading} type="submit">
          {loading ? 'Redirecting…' : 'Start for $49/month'}
        </button>
        <p className="form-help">Hosted checkout by Stripe. Cancel any time from Stripe billing.</p>
      </form>
    </section>
  );
}
