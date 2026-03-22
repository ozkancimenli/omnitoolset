import { mapLead, stringifyJson } from './utils.js';

export function createLeadsRepository(db) {
  const listStatement = db.prepare('SELECT * FROM leads ORDER BY created_at DESC');
  const insertStatement = db.prepare(`
    INSERT INTO leads (
      business_id,
      contact_id,
      source,
      campaign,
      status,
      notes,
      metadata_json
    ) VALUES (
      @businessId,
      @contactId,
      @source,
      @campaign,
      @status,
      @notes,
      @metadataJson
    )
  `);

  return {
    create(payload) {
      const result = insertStatement.run({
        businessId: payload.businessId ?? null,
        contactId: payload.contactId ?? null,
        source: payload.source ?? null,
        campaign: payload.campaign ?? null,
        status: payload.status ?? 'new',
        notes: payload.notes ?? null,
        metadataJson: stringifyJson(payload.metadata ?? {})
      });

      return mapLead(db.prepare('SELECT * FROM leads WHERE id = ?').get(result.lastInsertRowid));
    },

    listAll() {
      return listStatement.all().map(mapLead);
    }
  };
}
