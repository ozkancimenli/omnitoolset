import { schemaSnapshotMigration } from './0001-schema-snapshot.js';
import { legacyNormalizationMigration } from './0002-legacy-normalization.js';
import { accessRequestColumnsMigration } from './0003-access-request-columns.js';

export const migrations = [
  schemaSnapshotMigration,
  legacyNormalizationMigration,
  accessRequestColumnsMigration
];
