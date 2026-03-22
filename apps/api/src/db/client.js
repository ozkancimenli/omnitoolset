import pg from 'pg';

import { env } from '../config/env.js';

const { Pool } = pg;

function useSsl(databaseUrl) {
  return env.nodeEnv === 'production' && !/localhost|127\.0\.0\.1/.test(databaseUrl)
    ? { rejectUnauthorized: false }
    : false;
}

export const db = new Pool({
  connectionString: env.databaseUrl,
  ssl: useSsl(env.databaseUrl)
});

export async function query(text, params = []) {
  return db.query(text, params);
}

export async function closeDatabase() {
  await db.end();
}
