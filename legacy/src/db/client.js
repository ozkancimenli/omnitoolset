import fs from 'fs';
import path from 'path';
import Database from 'better-sqlite3';

import { env } from '../config/env.js';
import { runMigrations } from './migration-runner.js';

const databaseFile = path.resolve(process.cwd(), env.databasePath);

fs.mkdirSync(path.dirname(databaseFile), { recursive: true });

export const db = new Database(databaseFile);

db.pragma('journal_mode = WAL');
db.pragma('busy_timeout = 5000');
db.pragma('foreign_keys = ON');
runMigrations(db);
