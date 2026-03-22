import fs from 'fs';

const schemaFile = new URL('../schema.sql', import.meta.url);

function hasExistingPlatformTables(db) {
  const row = db
    .prepare(`
      SELECT 1 AS found
      FROM sqlite_master
      WHERE type = 'table'
        AND name IN (
          'businesses',
          'conversations',
          'messages',
          'bookings',
          'leads',
          'reviews',
          'review_requests',
          'waitlist_submissions'
        )
      LIMIT 1
    `)
    .get();

  return Boolean(row);
}

export const schemaSnapshotMigration = {
  id: '0001_schema_snapshot',
  up(db) {
    if (hasExistingPlatformTables(db)) {
      return;
    }

    db.exec(fs.readFileSync(schemaFile, 'utf8'));
  }
};
