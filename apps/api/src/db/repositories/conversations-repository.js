import { mapConversation, mapConversationLog } from './utils.js';

export function createConversationsRepository(db) {
  return {
    async findOrCreate({ businessId, contactId, channel = 'sms' }) {
      const result = await db.query(
        `
          INSERT INTO conversations (
            business_id,
            contact_id,
            channel,
            status,
            current_stage,
            metadata
          ) VALUES ($1,$2,$3,'open','new','{}'::jsonb)
          ON CONFLICT (business_id, contact_id, channel) DO UPDATE SET
            updated_at = NOW()
          RETURNING *
        `,
        [businessId, contactId, channel]
      );

      return mapConversation(result.rows[0]);
    },

    async saveState({ id, status, currentStage, metadata, lastInboundAt, lastOutboundAt }) {
      const result = await db.query(
        `
          UPDATE conversations
          SET
            status = COALESCE($2, status),
            current_stage = COALESCE($3, current_stage),
            metadata = COALESCE($4::jsonb, metadata),
            last_inbound_at = COALESCE($5, last_inbound_at),
            last_outbound_at = COALESCE($6, last_outbound_at),
            updated_at = NOW()
          WHERE id = $1
          RETURNING *
        `,
        [
          id,
          status || null,
          currentStage || null,
          metadata ? JSON.stringify(metadata) : null,
          lastInboundAt || null,
          lastOutboundAt || null
        ]
      );

      return mapConversation(result.rows[0]);
    },

    async listRecentByBusiness(businessId, limit = 10) {
      const result = await db.query(
        `
          SELECT
            conversations.*,
            contacts.name AS contact_name,
            contacts.phone AS contact_phone,
            latest_message.body AS last_message_text,
            latest_message.direction AS last_message_direction,
            latest_message.created_at AS last_message_at
          FROM conversations
          LEFT JOIN contacts
            ON contacts.id = conversations.contact_id
          LEFT JOIN LATERAL (
            SELECT body, direction, created_at
            FROM messages
            WHERE conversation_id = conversations.id
            ORDER BY created_at DESC, id DESC
            LIMIT 1
          ) latest_message ON TRUE
          WHERE conversations.business_id = $1
          ORDER BY COALESCE(latest_message.created_at, conversations.updated_at) DESC
          LIMIT $2
        `,
        [businessId, limit]
      );

      return result.rows.map(mapConversationLog);
    }
  };
}
