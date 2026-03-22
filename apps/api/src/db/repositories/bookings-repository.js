import { mapBooking } from './utils.js';

export function createBookingsRepository(db) {
  async function latestByConversation(conversationId) {
    const result = await db.query(
      `
        SELECT *
        FROM bookings
        WHERE conversation_id = $1
        ORDER BY created_at DESC, id DESC
        LIMIT 1
      `,
      [conversationId]
    );

    return mapBooking(result.rows[0]);
  }

  return {
    latestByConversation,

    async saveForConversation({
      businessId,
      conversationId,
      contactId,
      requestedSlot = null,
      confirmedSlot = null,
      status = 'pending',
      notes = null,
      metadata = {}
    }) {
      const existing = await latestByConversation(conversationId);

      if (!existing) {
        const inserted = await db.query(
          `
            INSERT INTO bookings (
              business_id,
              conversation_id,
              contact_id,
              requested_slot,
              confirmed_slot,
              status,
              notes,
              metadata
            ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8::jsonb)
            RETURNING *
          `,
          [
            businessId,
            conversationId,
            contactId,
            requestedSlot,
            confirmedSlot,
            status,
            notes,
            JSON.stringify(metadata)
          ]
        );

        return mapBooking(inserted.rows[0]);
      }

      const updated = await db.query(
        `
          UPDATE bookings
          SET
            requested_slot = COALESCE($2, requested_slot),
            confirmed_slot = COALESCE($3, confirmed_slot),
            status = COALESCE($4, status),
            notes = COALESCE($5, notes),
            metadata = COALESCE($6::jsonb, metadata),
            updated_at = NOW()
          WHERE id = $1
          RETURNING *
        `,
        [
          existing.id,
          requestedSlot,
          confirmedSlot,
          status,
          notes,
          metadata ? JSON.stringify(metadata) : null
        ]
      );

      return mapBooking(updated.rows[0]);
    }
  };
}
