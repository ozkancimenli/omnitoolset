import { mapMessage } from './utils.js';

export function createMessagesRepository(db) {
  return {
    async create({
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
      const result = await db.query(
        `
          INSERT INTO messages (
            business_id,
            conversation_id,
            direction,
            channel,
            body,
            provider_sid,
            from_phone,
            to_phone,
            metadata
          ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9::jsonb)
          RETURNING *
        `,
        [
          businessId,
          conversationId,
          direction,
          channel,
          body,
          providerSid,
          fromPhone,
          toPhone,
          JSON.stringify(metadata)
        ]
      );

      return mapMessage(result.rows[0]);
    },

    async listRecentByConversation(conversationId, limit = 8) {
      const result = await db.query(
        `
          SELECT *
          FROM messages
          WHERE conversation_id = $1
          ORDER BY created_at DESC, id DESC
          LIMIT $2
        `,
        [conversationId, limit]
      );

      return result.rows.reverse().map(mapMessage);
    },

    async existsByProviderSid(providerSid) {
      if (!providerSid) {
        return false;
      }

      const result = await db.query(
        'SELECT 1 FROM messages WHERE provider_sid = $1 LIMIT 1',
        [providerSid]
      );

      return result.rowCount > 0;
    }
  };
}
