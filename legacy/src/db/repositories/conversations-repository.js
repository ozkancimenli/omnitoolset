import { mapConversation, stringifyJson } from './utils.js';

export function createConversationsRepository(db) {
  const getStatement = db.prepare(`
    SELECT *
    FROM conversations
    WHERE business_id = ? AND contact_id = ? AND channel = ?
    LIMIT 1
  `);
  const insertStatement = db.prepare(`
    INSERT INTO conversations (
      business_id,
      contact_id,
      channel,
      status,
      current_stage,
      metadata_json,
      last_inbound_at,
      last_outbound_at
    ) VALUES (
      @businessId,
      @contactId,
      @channel,
      @status,
      @currentStage,
      @metadataJson,
      @lastInboundAt,
      @lastOutboundAt
    )
  `);
  const updateStatement = db.prepare(`
    UPDATE conversations
    SET
      status = @status,
      current_stage = @currentStage,
      metadata_json = @metadataJson,
      last_inbound_at = @lastInboundAt,
      last_outbound_at = @lastOutboundAt,
      updated_at = CURRENT_TIMESTAMP
    WHERE id = @id
  `);
  const countOpenStatement = db.prepare(`
    SELECT COUNT(*) AS total
    FROM conversations
    WHERE status = 'open'
  `);

  return {
    findOrCreate({ businessId, contactId, channel = 'sms' }) {
      const existing = getStatement.get(businessId, contactId, channel);

      if (existing) {
        return mapConversation(existing);
      }

      const payload = {
        businessId,
        contactId,
        channel,
        status: 'open',
        currentStage: 'new',
        metadataJson: stringifyJson({}),
        lastInboundAt: null,
        lastOutboundAt: null
      };
      const result = insertStatement.run(payload);
      return mapConversation(
        db.prepare('SELECT * FROM conversations WHERE id = ?').get(result.lastInsertRowid)
      );
    },

    saveState({ id, status, currentStage, metadata, lastInboundAt, lastOutboundAt }) {
      const existing = db.prepare('SELECT * FROM conversations WHERE id = ?').get(id);
      if (!existing) {
        return null;
      }

      updateStatement.run({
        id,
        status: status ?? existing.status,
        currentStage: currentStage ?? existing.current_stage,
        metadataJson: stringifyJson(metadata ?? JSON.parse(existing.metadata_json || '{}')),
        lastInboundAt: lastInboundAt ?? existing.last_inbound_at,
        lastOutboundAt: lastOutboundAt ?? existing.last_outbound_at
      });

      return mapConversation(db.prepare('SELECT * FROM conversations WHERE id = ?').get(id));
    },

    countOpen() {
      return countOpenStatement.get().total;
    }
  };
}
