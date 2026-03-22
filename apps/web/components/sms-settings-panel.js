'use client';

import { useEffect, useState } from 'react';

const initialForm = {
  workingHours: '',
  pricingInfo: '',
  automationEnabled: true
};

function formatTimestamp(value) {
  if (!value) {
    return 'Recent activity';
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return 'Recent activity';
  }

  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit'
  }).format(date);
}

function formatStage(value) {
  if (!value) {
    return 'Open conversation';
  }

  return value.replace(/_/g, ' ');
}

export function SmsSettingsPanel({ sessionId }) {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [business, setBusiness] = useState(null);
  const [logs, setLogs] = useState([]);
  const [form, setForm] = useState(initialForm);

  useEffect(() => {
    let active = true;

    async function loadSettings() {
      try {
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/api/sms-assistant/settings?session_id=${encodeURIComponent(sessionId)}`
        );
        const payload = await response.json();

        if (!response.ok || !payload.ok) {
          throw new Error(payload.error || 'Unable to load settings right now.');
        }

        if (!active) {
          return;
        }

        setBusiness(payload.business);
        setLogs(payload.recentConversations || []);
        setForm({
          workingHours: payload.business.workingHours || '',
          pricingInfo: payload.business.pricingInfo || '',
          automationEnabled: payload.business.automationEnabled !== false
        });
        setLoading(false);
      } catch (loadError) {
        if (!active) {
          return;
        }

        setError(loadError.message);
        setLoading(false);
      }
    }

    loadSettings();

    return () => {
      active = false;
    };
  }, [sessionId]);

  function updateField(event) {
    const { name, value, type, checked } = event.target;

    setForm((current) => ({
      ...current,
      [name]: type === 'checkbox' ? checked : value
    }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setSaving(true);
    setError('');
    setSuccess('');

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/sms-assistant/settings`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          sessionId,
          ...form
        })
      });

      const payload = await response.json();

      if (!response.ok || !payload.ok) {
        throw new Error(payload.error || 'Unable to save your settings.');
      }

      setBusiness(payload.business);
      setForm({
        workingHours: payload.business.workingHours || '',
        pricingInfo: payload.business.pricingInfo || '',
        automationEnabled: payload.business.automationEnabled !== false
      });
      setSuccess('Settings saved.');
      setSaving(false);
    } catch (submitError) {
      setError(submitError.message);
      setSaving(false);
    }
  }

  if (loading) {
    return <div className="checkout-panel">Loading your SMS settings…</div>;
  }

  if (!business) {
    return <div className="checkout-panel">We couldn&apos;t load a business for this session.</div>;
  }

  return (
    <div className="settings-stack">
      <section className="checkout-panel settings-layout">
        <div className="section-copy">
          <p className="eyebrow">SMS Settings</p>
          <h2>Keep the live assistant aligned with your business.</h2>
          <p>
            Update the details that shape booking replies. The business profile stays read-only
            here so this page stays lightweight.
          </p>
          <div className="settings-summary-grid">
            <div className="settings-summary-item">
              <span className="settings-label">Business</span>
              <strong>{business.name || 'Not set'}</strong>
            </div>
            <div className="settings-summary-item">
              <span className="settings-label">Phone</span>
              <strong>{business.phoneNumber || 'Not set yet'}</strong>
            </div>
            <div className="settings-summary-item">
              <span className="settings-label">Type</span>
              <strong>{business.businessType || 'Not set yet'}</strong>
            </div>
          </div>
        </div>

        <form className="access-form" onSubmit={handleSubmit}>
          <label>
            Working Hours
            <input
              maxLength={240}
              name="workingHours"
              onChange={updateField}
              placeholder="Mon-Fri, 9:00 AM to 5:00 PM"
              required
              type="text"
              value={form.workingHours}
            />
          </label>

          <label>
            Pricing Note
            <textarea
              maxLength={240}
              name="pricingInfo"
              onChange={updateField}
              placeholder="Visits start at $75."
              rows={4}
              value={form.pricingInfo}
            />
          </label>

          <label className="toggle-row">
            <span>
              <strong>Automation</strong>
              <small>When disabled, inbound messages are logged but the assistant does not reply.</small>
            </span>
            <input
              checked={form.automationEnabled}
              name="automationEnabled"
              onChange={updateField}
              type="checkbox"
            />
          </label>

          {error ? <p className="form-error">{error}</p> : null}
          {success ? <p className="form-success">{success}</p> : null}

          <button className="button button-primary" disabled={saving} type="submit">
            {saving ? 'Saving…' : 'Save Settings'}
          </button>
        </form>
      </section>

      <section className="setup-complete-card">
        <div className="section-copy">
          <p className="eyebrow">Recent Messages</p>
          <h2>Last 10 conversations</h2>
          <p>Read-only activity so you can quickly confirm the assistant is handling new threads.</p>
        </div>

        {logs.length > 0 ? (
          <div className="conversation-log-list">
            {logs.map((entry) => (
              <article className="conversation-log-item" key={entry.id}>
                <div className="conversation-log-header">
                  <strong>{entry.contactPhone || entry.contactName || 'Unknown contact'}</strong>
                  <span>{formatTimestamp(entry.lastMessageAt || entry.updatedAt)}</span>
                </div>
                <p>{entry.lastMessageText || 'Conversation created.'}</p>
                <p className="form-help">
                  {formatStage(entry.currentStage)} · {entry.status}
                </p>
              </article>
            ))}
          </div>
        ) : (
          <p className="form-help">
            No conversations yet. Once customers text or call, the latest threads will show here.
          </p>
        )}
      </section>
    </div>
  );
}
