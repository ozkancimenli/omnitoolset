import { db } from './client.js';

const appliedMigrations = db
  .prepare('SELECT id, applied_at FROM schema_migrations ORDER BY id ASC')
  .all();

console.log(`Applied ${appliedMigrations.length} migrations.`);

for (const migration of appliedMigrations) {
  console.log(`${migration.id} at ${migration.applied_at}`);
}

db.close();
