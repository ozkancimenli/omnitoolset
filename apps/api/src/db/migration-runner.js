import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

import { db } from './client.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const migrationsDirectory = path.join(__dirname, 'migrations');

async function ensureMigrationTable(client) {
  await client.query(`
    CREATE TABLE IF NOT EXISTS schema_migrations (
      version TEXT PRIMARY KEY,
      applied_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `);
}

export async function runMigrations() {
  const client = await db.connect();

  try {
    await ensureMigrationTable(client);
    const files = (await fs.readdir(migrationsDirectory))
      .filter((file) => file.endsWith('.sql'))
      .sort();

    for (const file of files) {
      const existing = await client.query(
        'SELECT 1 FROM schema_migrations WHERE version = $1 LIMIT 1',
        [file]
      );

      if (existing.rowCount > 0) {
        continue;
      }

      const sql = await fs.readFile(path.join(migrationsDirectory, file), 'utf8');

      await client.query('BEGIN');
      await client.query(sql);
      await client.query('INSERT INTO schema_migrations (version) VALUES ($1)', [file]);
      await client.query('COMMIT');
    }
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
}
