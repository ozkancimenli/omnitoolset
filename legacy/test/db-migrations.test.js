import fs from 'fs';
import os from 'os';
import path from 'path';
import test from 'node:test';
import assert from 'node:assert/strict';

import Database from 'better-sqlite3';

import { runMigrations } from '../src/db/migration-runner.js';

function createLegacyDatabase(filePath) {
  const db = new Database(filePath);

  db.exec(`
    PRAGMA foreign_keys = ON;

    CREATE TABLE businesses (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      slug TEXT NOT NULL UNIQUE,
      twilio_phone TEXT,
      timezone TEXT NOT NULL DEFAULT 'America/New_York',
      forwarding_phone TEXT,
      services_summary TEXT,
      hours_summary TEXT,
      booking_duration_minutes INTEGER NOT NULL DEFAULT 45,
      booking_window_days INTEGER NOT NULL DEFAULT 10,
      created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE conversations (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      business_id INTEGER NOT NULL,
      customer_phone TEXT NOT NULL,
      customer_name TEXT,
      channel TEXT NOT NULL DEFAULT 'sms',
      status TEXT NOT NULL DEFAULT 'open',
      current_stage TEXT NOT NULL DEFAULT 'new',
      metadata_json TEXT NOT NULL DEFAULT '{}',
      last_inbound_at TEXT,
      last_outbound_at TEXT,
      created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
      UNIQUE (business_id, customer_phone, channel),
      FOREIGN KEY (business_id) REFERENCES businesses (id) ON DELETE CASCADE
    );

    CREATE TABLE messages (
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

    CREATE TABLE bookings (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      business_id INTEGER NOT NULL,
      conversation_id INTEGER NOT NULL,
      customer_phone TEXT NOT NULL,
      customer_name TEXT,
      requested_slot TEXT,
      confirmed_slot TEXT,
      status TEXT NOT NULL DEFAULT 'pending',
      notes TEXT,
      metadata_json TEXT NOT NULL DEFAULT '{}',
      created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (business_id) REFERENCES businesses (id) ON DELETE CASCADE,
      FOREIGN KEY (conversation_id) REFERENCES conversations (id) ON DELETE CASCADE
    );

    CREATE TABLE leads (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      business_id INTEGER,
      source TEXT,
      name TEXT,
      phone TEXT,
      email TEXT,
      status TEXT NOT NULL DEFAULT 'new',
      metadata_json TEXT NOT NULL DEFAULT '{}',
      created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (business_id) REFERENCES businesses (id) ON DELETE SET NULL
    );

    CREATE TABLE reviews (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      business_id INTEGER,
      customer_name TEXT,
      rating INTEGER,
      review_text TEXT,
      status TEXT NOT NULL DEFAULT 'queued',
      external_id TEXT,
      metadata_json TEXT NOT NULL DEFAULT '{}',
      created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (business_id) REFERENCES businesses (id) ON DELETE SET NULL
    );
  `);

  db.exec(`
    INSERT INTO businesses (
      id,
      name,
      slug,
      twilio_phone,
      timezone,
      services_summary,
      hours_summary
    ) VALUES (
      1,
      'Northstar Health',
      'northstar-health',
      '+15551234567',
      'America/New_York',
      'Consultations and appointment scheduling',
      'Mon-Fri, 9:00 AM to 5:00 PM'
    );

    INSERT INTO conversations (
      id,
      business_id,
      customer_phone,
      customer_name,
      channel,
      status,
      current_stage,
      metadata_json
    ) VALUES (
      1,
      1,
      '+15550000001',
      'Alex Morgan',
      'sms',
      'open',
      'awaiting_confirmation',
      '{"offeredSlots":["2026-03-21T14:00:00.000Z"]}'
    );

    INSERT INTO messages (
      business_id,
      conversation_id,
      direction,
      channel,
      body,
      provider_sid,
      from_phone,
      to_phone,
      metadata_json
    ) VALUES (
      1,
      1,
      'inbound',
      'sms',
      'Can I come in tomorrow afternoon?',
      'SM-legacy-001',
      '+15550000001',
      '+15551234567',
      '{}'
    );

    INSERT INTO bookings (
      id,
      business_id,
      conversation_id,
      customer_phone,
      customer_name,
      requested_slot,
      status,
      notes,
      metadata_json
    ) VALUES (
      1,
      1,
      1,
      '+15550000001',
      'Alex Morgan',
      '2026-03-21T14:00:00.000Z',
      'pending',
      'Awaiting confirmation',
      '{}'
    );

    INSERT INTO leads (
      id,
      business_id,
      source,
      name,
      phone,
      email,
      status,
      metadata_json
    ) VALUES (
      1,
      1,
      'website',
      'Jamie Lee',
      '+15550000002',
      'jamie@example.com',
      'new',
      '{}'
    );

    INSERT INTO reviews (
      business_id,
      customer_name,
      rating,
      review_text,
      status,
      external_id,
      metadata_json
    ) VALUES (
      1,
      'Alex Morgan',
      5,
      'Great visit',
      'queued',
      'google-123',
      '{}'
    );
  `);

  return db;
}

test('legacy schema migrates to the normalized OmniToolset schema', () => {
  const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'omnitoolset-migration-'));
  const databasePath = path.join(tempDir, 'legacy.sqlite');
  const db = createLegacyDatabase(databasePath);

  runMigrations(db);

  const tables = new Set(
    db
      .prepare("SELECT name FROM sqlite_master WHERE type = 'table'")
      .all()
      .map((row) => row.name)
  );

  assert.ok(tables.has('contacts'));
  assert.ok(tables.has('review_requests'));
  assert.ok(!tables.has('reviews'));

  const businessColumns = db.prepare('PRAGMA table_info("businesses")').all();
  assert.ok(businessColumns.some((column) => column.name === 'business_type'));
  assert.ok(businessColumns.some((column) => column.name === 'price_summary'));

  const accessRequestColumns = db.prepare('PRAGMA table_info("waitlist_submissions")').all();
  assert.ok(accessRequestColumns.some((column) => column.name === 'request_type'));
  assert.ok(accessRequestColumns.some((column) => column.name === 'status'));
  assert.ok(accessRequestColumns.some((column) => column.name === 'source_path'));

  const contact = db.prepare('SELECT * FROM contacts WHERE phone = ?').get('+15550000001');
  assert.equal(contact.name, 'Alex Morgan');

  const conversation = db.prepare('SELECT * FROM conversations WHERE id = 1').get();
  assert.equal(conversation.contact_id, contact.id);

  const booking = db.prepare('SELECT * FROM bookings WHERE id = 1').get();
  assert.equal(booking.contact_id, contact.id);

  const lead = db.prepare('SELECT * FROM leads WHERE id = 1').get();
  assert.ok(lead.contact_id);

  const reviewRequest = db.prepare('SELECT * FROM review_requests LIMIT 1').get();
  assert.equal(reviewRequest.status, 'completed');
  assert.equal(reviewRequest.contact_id, contact.id);

  const appliedMigrations = db
    .prepare('SELECT id FROM schema_migrations ORDER BY id ASC')
    .all()
    .map((row) => row.id);
  assert.deepEqual(appliedMigrations, [
    '0001_schema_snapshot',
    '0002_legacy_normalization',
    '0003_access_request_columns'
  ]);

  db.close();
});
