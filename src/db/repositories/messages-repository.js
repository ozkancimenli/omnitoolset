import { mapMessage, stringifyJson } from './utils.js';

export function createMessagesRepository(db) {
  const insertStatement = db.prepare(`
    INSERT INTO messages (
      business_id,
      conversation_id,
      direction,
      channel,
      body,
      provider_sid,
      from_phone,
      to_phone,
      metadata_json
    ) VALUES (
      @businessId,
      @conversationId,
      @direction,
      @channel,
      @body,
      @providerSid,
      @fromPhone,
      @toPhone,
      @metadataJson
    )
  `);
  const getRecentStatement = db.prepare(`
    SELECT *
    FROM messages
    WHERE conversation_id = ?
    ORDER BY created_at DESC, id DESC
    LIMIT ?
  `);
  const existsByProviderSidStatement = db.prepare(`
    SELECT 1 AS found
    FROM messages
    WHERE provider_sid = ?
    LIMIT 1
  `);
  const countStatement = db.prepare('SELECT COUNT(*) AS total FROM messages');

  return {
    create({
      businessId,
      conversationId,
      direction,
      channel = 'sms',
      body,
      providerSid = null,
      fromPhone = null,
      toPhone = null,
      metadata = {}
    }) {
      const result = insertStatement.run({
        businessId,
        conversationId,
        direction,
        channel,
        body,
        providerSid,
        fromPhone,
        toPhone,
        metadataJson: stringifyJson(metadata)
      });

      return mapMessage(
        db.prepare('SELECT * FROM messages WHERE id = ?').get(result.lastInsertRowid)
      );
    },

    listRecentByConversation(conversationId, limit = 8) {
      return getRecentStatement
        .all(conversationId, limit)
        .reverse()
        .map(mapMessage);
    },

    existsByProviderSid(providerSid) {
      if (!providerSid) {
        return false;
      }

      return Boolean(existsByProviderSidStatement.get(providerSid));
    },

    countAll() {
      return countStatement.get().total;
    }
  };
}
