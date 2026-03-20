import fs from 'fs';
import path from 'path';
import Database from 'better-sqlite3';

import { env } from '../config/env.js';

const databaseFile = path.resolve(process.cwd(), env.databasePath);
const schemaFile = new URL('./schema.sql', import.meta.url);

fs.mkdirSync(path.dirname(databaseFile), { recursive: true });

export const db = new Database(databaseFile);

db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');
db.exec(fs.readFileSync(schemaFile, 'utf8'));
