function tableExists(db, tableName) {
  return Boolean(
    db
      .prepare(
        `
          SELECT 1 AS found
          FROM sqlite_master
          WHERE type = 'table' AND name = ?
          LIMIT 1
        `
      )
      .get(tableName)
  );
}

function columnExists(db, tableName, columnName) {
  if (!tableExists(db, tableName)) {
    return false;
  }

  const tableInfo = db.prepare(`PRAGMA table_info("${tableName}")`).all();
  return tableInfo.some((column) => column.name === columnName);
}

function tableHasForeignKeyParent(db, tableName, parentName) {
  if (!tableExists(db, tableName)) {
    return false;
  }

  const foreignKeys = db.prepare(`PRAGMA foreign_key_list("${tableName}")`).all();
  return foreignKeys.some((foreignKey) => foreignKey.table === parentName);
}

function ensureBusinessColumns(db) {
  if (!tableExists(db, 'businesses')) {
    db.exec(`
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
      )
    `);
    return;
  }

  if (!columnExists(db, 'businesses', 'business_type')) {
    db.exec('ALTER TABLE businesses ADD COLUMN business_type TEXT');
  }

  if (!columnExists(db, 'businesses', 'price_summary')) {
    db.exec('ALTER TABLE businesses ADD COLUMN price_summary TEXT');
  }
}

function ensureContactsTable(db) {
  db.exec(`
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

    CREATE INDEX IF NOT EXISTS idx_contacts_business_status
      ON contacts (business_id, status, created_at DESC);
  `);
}

function ensureConversationsTable(db) {
  if (tableExists(db, 'conversations') && columnExists(db, 'conversations', 'contact_id')) {
    db.exec(`
      CREATE UNIQUE INDEX IF NOT EXISTS idx_conversations_business_contact_channel
        ON conversations (business_id, contact_id, channel)
    `);
    return;
  }

  if (tableExists(db, 'conversations')) {
    db.exec(`
      INSERT INTO contacts (business_id, name, phone, source, status, metadata_json)
      SELECT
        business_id,
        NULLIF(TRIM(customer_name), ''),
        customer_phone,
        'legacy-conversation',
        'active',
        '{}'
      FROM conversations
      WHERE customer_phone IS NOT NULL AND TRIM(customer_phone) != ''
      ON CONFLICT(business_id, phone) DO UPDATE SET
        name = COALESCE(excluded.name, contacts.name),
        updated_at = CURRENT_TIMESTAMP
    `);

    db.exec('ALTER TABLE conversations RENAME TO conversations_legacy');
  }

  db.exec(`
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
    )
  `);

  if (tableExists(db, 'conversations_legacy')) {
    db.exec(`
      INSERT INTO conversations (
        id,
        business_id,
        contact_id,
        channel,
        status,
        current_stage,
        metadata_json,
        last_inbound_at,
        last_outbound_at,
        created_at,
        updated_at
      )
      SELECT
        legacy.id,
        legacy.business_id,
        contacts.id,
        legacy.channel,
        legacy.status,
        legacy.current_stage,
        legacy.metadata_json,
        legacy.last_inbound_at,
        legacy.last_outbound_at,
        legacy.created_at,
        legacy.updated_at
      FROM conversations_legacy AS legacy
      JOIN contacts
        ON contacts.business_id = legacy.business_id
       AND contacts.phone = legacy.customer_phone
    `);

    db.exec('DROP TABLE conversations_legacy');
  }

  db.exec(`
    CREATE UNIQUE INDEX IF NOT EXISTS idx_conversations_business_contact_channel
      ON conversations (business_id, contact_id, channel)
  `);
}

function ensureMessagesTable(db) {
  const needsRebuild =
    tableExists(db, 'messages') && !tableHasForeignKeyParent(db, 'messages', 'conversations');

  if (needsRebuild) {
    db.exec('ALTER TABLE messages RENAME TO messages_legacy');
  }

  db.exec(`
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

    CREATE INDEX IF NOT EXISTS idx_messages_conversation_created
      ON messages (conversation_id, created_at DESC, id DESC);
  `);

  if (tableExists(db, 'messages_legacy')) {
    db.exec(`
      INSERT INTO messages (
        id,
        business_id,
        conversation_id,
        direction,
        channel,
        body,
        provider_sid,
        from_phone,
        to_phone,
        metadata_json,
        created_at
      )
      SELECT
        id,
        business_id,
        conversation_id,
        direction,
        channel,
        body,
        provider_sid,
        from_phone,
        to_phone,
        metadata_json,
        created_at
      FROM messages_legacy
    `);

    db.exec('DROP TABLE messages_legacy');
  }
}

function ensureBookingsTable(db) {
  if (tableExists(db, 'bookings') && columnExists(db, 'bookings', 'contact_id')) {
    db.exec(`
      CREATE INDEX IF NOT EXISTS idx_bookings_business_status
        ON bookings (business_id, status, created_at DESC);

      CREATE INDEX IF NOT EXISTS idx_bookings_conversation_created
        ON bookings (conversation_id, created_at DESC);
    `);
    return;
  }

  if (tableExists(db, 'bookings')) {
    db.exec(`
      INSERT INTO contacts (business_id, name, phone, source, status, metadata_json)
      SELECT
        business_id,
        NULLIF(TRIM(customer_name), ''),
        customer_phone,
        'legacy-booking',
        'active',
        '{}'
      FROM bookings
      WHERE customer_phone IS NOT NULL AND TRIM(customer_phone) != ''
      ON CONFLICT(business_id, phone) DO UPDATE SET
        name = COALESCE(excluded.name, contacts.name),
        updated_at = CURRENT_TIMESTAMP
    `);

    db.exec('ALTER TABLE bookings RENAME TO bookings_legacy');
  }

  db.exec(`
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
    )
  `);

  if (tableExists(db, 'bookings_legacy')) {
    db.exec(`
      INSERT INTO bookings (
        id,
        business_id,
        conversation_id,
        contact_id,
        requested_slot,
        confirmed_slot,
        status,
        notes,
        metadata_json,
        created_at,
        updated_at
      )
      SELECT
        legacy.id,
        legacy.business_id,
        legacy.conversation_id,
        contacts.id,
        legacy.requested_slot,
        legacy.confirmed_slot,
        legacy.status,
        legacy.notes,
        legacy.metadata_json,
        legacy.created_at,
        legacy.updated_at
      FROM bookings_legacy AS legacy
      JOIN contacts
        ON contacts.business_id = legacy.business_id
       AND contacts.phone = legacy.customer_phone
    `);

    db.exec('DROP TABLE bookings_legacy');
  }

  db.exec(`
    CREATE INDEX IF NOT EXISTS idx_bookings_business_status
      ON bookings (business_id, status, created_at DESC);

    CREATE INDEX IF NOT EXISTS idx_bookings_conversation_created
      ON bookings (conversation_id, created_at DESC);
  `);
}

function ensureLeadsTable(db) {
  const needsRebuild =
    tableExists(db, 'leads') &&
    (!columnExists(db, 'leads', 'contact_id') ||
      columnExists(db, 'leads', 'name') ||
      columnExists(db, 'leads', 'phone') ||
      columnExists(db, 'leads', 'email'));

  if (needsRebuild) {
    db.exec(`
      INSERT INTO contacts (business_id, name, phone, email, source, status, metadata_json)
      SELECT
        business_id,
        NULLIF(TRIM(name), ''),
        NULLIF(TRIM(phone), ''),
        NULLIF(TRIM(email), ''),
        COALESCE(NULLIF(TRIM(source), ''), 'legacy-lead'),
        'active',
        '{}'
      FROM leads
      WHERE business_id IS NOT NULL
        AND (
          (phone IS NOT NULL AND TRIM(phone) != '')
          OR (email IS NOT NULL AND TRIM(email) != '')
        )
      ON CONFLICT DO NOTHING
    `);

    db.exec('ALTER TABLE leads RENAME TO leads_legacy');
  }

  db.exec(`
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
    )
  `);

  if (tableExists(db, 'leads_legacy')) {
    db.exec(`
      INSERT INTO leads (
        id,
        business_id,
        contact_id,
        source,
        campaign,
        status,
        notes,
        metadata_json,
        created_at,
        updated_at
      )
      SELECT
        legacy.id,
        legacy.business_id,
        contacts.id,
        legacy.source,
        NULL,
        legacy.status,
        NULL,
        legacy.metadata_json,
        legacy.created_at,
        legacy.updated_at
      FROM leads_legacy AS legacy
      LEFT JOIN contacts
        ON contacts.business_id = legacy.business_id
       AND (
         (legacy.phone IS NOT NULL AND legacy.phone = contacts.phone)
         OR (legacy.email IS NOT NULL AND legacy.email = contacts.email)
       )
    `);

    db.exec('DROP TABLE leads_legacy');
  }

  db.exec(`
    CREATE INDEX IF NOT EXISTS idx_leads_business_status
      ON leads (business_id, status, created_at DESC);
  `);
}

function ensureReviewRequestsTable(db) {
  db.exec(`
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

    CREATE INDEX IF NOT EXISTS idx_review_requests_business_status
      ON review_requests (business_id, status, created_at DESC);
  `);

  if (!tableExists(db, 'reviews')) {
    return;
  }

  db.exec(`
    INSERT INTO review_requests (
      business_id,
      contact_id,
      status,
      requested_at,
      completed_at,
      rating,
      review_text,
      external_review_id,
      metadata_json,
      created_at,
      updated_at
    )
    SELECT
      reviews.business_id,
      contacts.id,
      CASE
        WHEN reviews.rating IS NOT NULL OR reviews.review_text IS NOT NULL THEN 'completed'
        ELSE reviews.status
      END,
      reviews.created_at,
      CASE
        WHEN reviews.rating IS NOT NULL OR reviews.review_text IS NOT NULL THEN reviews.updated_at
        ELSE NULL
      END,
      reviews.rating,
      reviews.review_text,
      reviews.external_id,
      reviews.metadata_json,
      reviews.created_at,
      reviews.updated_at
    FROM reviews
    LEFT JOIN contacts
      ON contacts.business_id = reviews.business_id
     AND contacts.name = reviews.customer_name
  `);

  db.exec('DROP TABLE reviews');
}

function ensureWaitlistTable(db) {
  db.exec(`
    CREATE TABLE IF NOT EXISTS waitlist_submissions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      product_slug TEXT NOT NULL,
      name TEXT NOT NULL,
      email TEXT NOT NULL,
      phone TEXT,
      company TEXT,
      notes TEXT,
      created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
    );

    CREATE INDEX IF NOT EXISTS idx_waitlist_product_created
      ON waitlist_submissions (product_slug, created_at DESC);
  `);
}

export const legacyNormalizationMigration = {
  id: '0002_legacy_normalization',
  up(db) {
    const foreignKeysWereEnabled = db.pragma('foreign_keys', { simple: true });

    db.pragma('foreign_keys = OFF');

    try {
      db.transaction(() => {
        ensureBusinessColumns(db);
        ensureContactsTable(db);
        ensureConversationsTable(db);
        ensureMessagesTable(db);
        ensureBookingsTable(db);
        ensureLeadsTable(db);
        ensureReviewRequestsTable(db);
        ensureWaitlistTable(db);
        const foreignKeyIssues = db.prepare('PRAGMA foreign_key_check').all();

        if (foreignKeyIssues.length > 0) {
          throw new Error(JSON.stringify(foreignKeyIssues));
        }
      })();
    } catch (error) {
      throw new Error(
        `Legacy normalization left foreign key issues in the database: ${error.message}`
      );
    } finally {
      db.pragma(`foreign_keys = ${foreignKeysWereEnabled ? 'ON' : 'OFF'}`);
    }
  }
};
