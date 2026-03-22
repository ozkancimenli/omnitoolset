CREATE TABLE IF NOT EXISTS businesses (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  twilio_phone TEXT,
  timezone TEXT NOT NULL DEFAULT 'America/New_York',
  forwarding_phone TEXT,
  business_type TEXT,
  services_summary TEXT,
  hours_summary TEXT,
  price_summary TEXT,
  booking_duration_minutes INTEGER NOT NULL DEFAULT 45,
  booking_window_days INTEGER NOT NULL DEFAULT 10,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS contacts (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  business_id INTEGER NOT NULL,
  name TEXT,
  phone TEXT,
  email TEXT,
  source TEXT,
  status TEXT NOT NULL DEFAULT 'active',
  metadata_json TEXT NOT NULL DEFAULT '{}',
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (business_id) REFERENCES businesses (id) ON DELETE CASCADE,
  UNIQUE (business_id, phone),
  UNIQUE (business_id, email)
);

CREATE TABLE IF NOT EXISTS conversations (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  business_id INTEGER NOT NULL,
  contact_id INTEGER NOT NULL,
  channel TEXT NOT NULL DEFAULT 'sms',
  status TEXT NOT NULL DEFAULT 'open',
  current_stage TEXT NOT NULL DEFAULT 'new',
  metadata_json TEXT NOT NULL DEFAULT '{}',
  last_inbound_at TEXT,
  last_outbound_at TEXT,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (business_id) REFERENCES businesses (id) ON DELETE CASCADE,
  FOREIGN KEY (contact_id) REFERENCES contacts (id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS messages (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  business_id INTEGER NOT NULL,
  conversation_id INTEGER NOT NULL,
  direction TEXT NOT NULL,
  channel TEXT NOT NULL DEFAULT 'sms',
  body TEXT NOT NULL,
  provider_sid TEXT UNIQUE,
  from_phone TEXT,
  to_phone TEXT,
  metadata_json TEXT NOT NULL DEFAULT '{}',
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (business_id) REFERENCES businesses (id) ON DELETE CASCADE,
  FOREIGN KEY (conversation_id) REFERENCES conversations (id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS bookings (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  business_id INTEGER NOT NULL,
  conversation_id INTEGER,
  contact_id INTEGER NOT NULL,
  requested_slot TEXT,
  confirmed_slot TEXT,
  status TEXT NOT NULL DEFAULT 'pending',
  notes TEXT,
  metadata_json TEXT NOT NULL DEFAULT '{}',
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (business_id) REFERENCES businesses (id) ON DELETE CASCADE,
  FOREIGN KEY (conversation_id) REFERENCES conversations (id) ON DELETE SET NULL,
  FOREIGN KEY (contact_id) REFERENCES contacts (id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS leads (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  business_id INTEGER,
  contact_id INTEGER,
  source TEXT,
  campaign TEXT,
  status TEXT NOT NULL DEFAULT 'new',
  notes TEXT,
  metadata_json TEXT NOT NULL DEFAULT '{}',
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (business_id) REFERENCES businesses (id) ON DELETE SET NULL,
  FOREIGN KEY (contact_id) REFERENCES contacts (id) ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS review_requests (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  business_id INTEGER,
  contact_id INTEGER,
  conversation_id INTEGER,
  booking_id INTEGER,
  channel TEXT NOT NULL DEFAULT 'sms',
  destination TEXT,
  status TEXT NOT NULL DEFAULT 'queued',
  requested_at TEXT,
  completed_at TEXT,
  rating INTEGER,
  review_text TEXT,
  external_review_id TEXT,
  review_url TEXT,
  notes TEXT,
  metadata_json TEXT NOT NULL DEFAULT '{}',
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (business_id) REFERENCES businesses (id) ON DELETE SET NULL,
  FOREIGN KEY (contact_id) REFERENCES contacts (id) ON DELETE SET NULL,
  FOREIGN KEY (conversation_id) REFERENCES conversations (id) ON DELETE SET NULL,
  FOREIGN KEY (booking_id) REFERENCES bookings (id) ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS waitlist_submissions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  product_slug TEXT NOT NULL,
  request_type TEXT NOT NULL DEFAULT 'waitlist',
  status TEXT NOT NULL DEFAULT 'new',
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  company TEXT,
  notes TEXT,
  source_path TEXT,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_conversations_business_contact_channel
  ON conversations (business_id, contact_id, channel);

CREATE INDEX IF NOT EXISTS idx_contacts_business_status
  ON contacts (business_id, status, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_messages_conversation_created
  ON messages (conversation_id, created_at DESC, id DESC);

CREATE INDEX IF NOT EXISTS idx_bookings_business_status
  ON bookings (business_id, status, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_bookings_conversation_created
  ON bookings (conversation_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_leads_business_status
  ON leads (business_id, status, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_review_requests_business_status
  ON review_requests (business_id, status, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_waitlist_product_created
  ON waitlist_submissions (product_slug, request_type, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_waitlist_email_created
  ON waitlist_submissions (email, created_at DESC);
