import { parseJson, stringifyJson } from './utils.js';

function mapLead(row) {
  if (!row) {
    return null;
  }

  return {
    ...row,
    metadata: parseJson(row.metadata_json, {}),
    metadata_json: undefined
  };
}

export function createLeadsRepository(db) {
  const listStatement = db.prepare('SELECT * FROM leads ORDER BY created_at DESC');
  const insertStatement = db.prepare(`
    INSERT INTO leads (
      business_id,
      source,
      name,
      phone,
      email,
      status,
      metadata_json
    ) VALUES (
      @businessId,
      @source,
      @name,
      @phone,
      @email,
      @status,
      @metadataJson
    )
  `);

  return {
    create(payload) {
      const result = insertStatement.run({
        businessId: payload.businessId ?? null,
        source: payload.source ?? null,
        name: payload.name ?? null,
        phone: payload.phone ?? null,
        email: payload.email ?? null,
        status: payload.status ?? 'new',
        metadataJson: stringifyJson(payload.metadata ?? {})
      });

      return mapLead(db.prepare('SELECT * FROM leads WHERE id = ?').get(result.lastInsertRowid));
    },

    listAll() {
      return listStatement.all().map(mapLead);
    }
  };
}
