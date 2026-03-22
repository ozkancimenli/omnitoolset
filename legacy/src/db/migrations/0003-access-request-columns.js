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

export const accessRequestColumnsMigration = {
  id: '0003_access_request_columns',
  up(db) {
    if (!tableExists(db, 'waitlist_submissions')) {
      return;
    }

    if (!columnExists(db, 'waitlist_submissions', 'request_type')) {
      db.exec(
        "ALTER TABLE waitlist_submissions ADD COLUMN request_type TEXT NOT NULL DEFAULT 'waitlist'"
      );
    }

    if (!columnExists(db, 'waitlist_submissions', 'status')) {
      db.exec("ALTER TABLE waitlist_submissions ADD COLUMN status TEXT NOT NULL DEFAULT 'new'");
    }

    if (!columnExists(db, 'waitlist_submissions', 'source_path')) {
      db.exec('ALTER TABLE waitlist_submissions ADD COLUMN source_path TEXT');
    }

    db.exec(`
      DROP INDEX IF EXISTS idx_waitlist_product_created;

      CREATE INDEX IF NOT EXISTS idx_waitlist_product_created
        ON waitlist_submissions (product_slug, request_type, created_at DESC);

      CREATE INDEX IF NOT EXISTS idx_waitlist_email_created
        ON waitlist_submissions (email, created_at DESC);
    `);
  }
};
