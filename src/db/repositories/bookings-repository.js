import { mapBooking, stringifyJson } from './utils.js';

export function createBookingsRepository(db) {
  const latestByConversationStatement = db.prepare(`
    SELECT *
    FROM bookings
    WHERE conversation_id = ?
    ORDER BY created_at DESC, id DESC
    LIMIT 1
  `);
  const insertStatement = db.prepare(`
    INSERT INTO bookings (
      business_id,
      conversation_id,
      customer_phone,
      customer_name,
      requested_slot,
      confirmed_slot,
      status,
      notes,
      metadata_json
    ) VALUES (
      @businessId,
      @conversationId,
      @customerPhone,
      @customerName,
      @requestedSlot,
      @confirmedSlot,
      @status,
      @notes,
      @metadataJson
    )
  `);
  const updateStatement = db.prepare(`
    UPDATE bookings
    SET
      customer_name = @customerName,
      requested_slot = @requestedSlot,
      confirmed_slot = @confirmedSlot,
      status = @status,
      notes = @notes,
      metadata_json = @metadataJson,
      updated_at = CURRENT_TIMESTAMP
    WHERE id = @id
  `);
  const countConfirmedStatement = db.prepare(`
    SELECT COUNT(*) AS total
    FROM bookings
    WHERE status = 'confirmed'
  `);

  return {
    saveForConversation({
      businessId,
      conversationId,
      customerPhone,
      customerName,
      requestedSlot = null,
      confirmedSlot = null,
      status = 'pending',
      notes = null,
      metadata = {}
    }) {
      const existing = latestByConversationStatement.get(conversationId);

      if (!existing) {
        const result = insertStatement.run({
          businessId,
          conversationId,
          customerPhone,
          customerName,
          requestedSlot,
          confirmedSlot,
          status,
          notes,
          metadataJson: stringifyJson(metadata)
        });

        return mapBooking(
          db.prepare('SELECT * FROM bookings WHERE id = ?').get(result.lastInsertRowid)
        );
      }

      updateStatement.run({
        id: existing.id,
        customerName: customerName ?? existing.customer_name,
        requestedSlot: requestedSlot ?? existing.requested_slot,
        confirmedSlot: confirmedSlot ?? existing.confirmed_slot,
        status: status ?? existing.status,
        notes: notes ?? existing.notes,
        metadataJson: stringifyJson(metadata ?? JSON.parse(existing.metadata_json || '{}'))
      });

      return mapBooking(db.prepare('SELECT * FROM bookings WHERE id = ?').get(existing.id));
    },

    latestByConversation(conversationId) {
      return mapBooking(latestByConversationStatement.get(conversationId));
    },

    countConfirmed() {
      return countConfirmedStatement.get().total;
    }
  };
}
