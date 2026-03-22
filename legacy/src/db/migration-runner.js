import { migrations } from './migrations/index.js';

function ensureMigrationsTable(db) {
  db.exec(`
    CREATE TABLE IF NOT EXISTS schema_migrations (
      id TEXT PRIMARY KEY,
      applied_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
    )
  `);
}

export function runMigrations(db) {
  ensureMigrationsTable(db);

  const appliedIds = new Set(
    db.prepare('SELECT id FROM schema_migrations ORDER BY id ASC').all().map((row) => row.id)
  );
  const markAppliedStatement = db.prepare('INSERT INTO schema_migrations (id) VALUES (?)');

  for (const migration of migrations) {
    if (appliedIds.has(migration.id)) {
      continue;
    }

    migration.up(db);
    markAppliedStatement.run(migration.id);
  }
}
