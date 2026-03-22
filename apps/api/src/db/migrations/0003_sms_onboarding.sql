ALTER TABLE businesses
  ADD COLUMN IF NOT EXISTS owner_name TEXT;

ALTER TABLE businesses
  ADD COLUMN IF NOT EXISTS contact_email TEXT;

ALTER TABLE businesses
  ADD COLUMN IF NOT EXISTS contact_phone TEXT;

ALTER TABLE businesses
  ADD COLUMN IF NOT EXISTS onboarding_completed_at TIMESTAMPTZ;
