import { mapReviewRequest, stringifyJson } from './utils.js';

export function createReviewRequestsRepository(db) {
  const listStatement = db.prepare('SELECT * FROM review_requests ORDER BY created_at DESC');
  const insertStatement = db.prepare(`
    INSERT INTO review_requests (
      business_id,
      contact_id,
      conversation_id,
      booking_id,
      channel,
      destination,
      status,
      requested_at,
      completed_at,
      rating,
      review_text,
      external_review_id,
      review_url,
      notes,
      metadata_json
    ) VALUES (
      @businessId,
      @contactId,
      @conversationId,
      @bookingId,
      @channel,
      @destination,
      @status,
      @requestedAt,
      @completedAt,
      @rating,
      @reviewText,
      @externalReviewId,
      @reviewUrl,
      @notes,
      @metadataJson
    )
  `);

  return {
    create(payload) {
      const result = insertStatement.run({
        businessId: payload.businessId ?? null,
        contactId: payload.contactId ?? null,
        conversationId: payload.conversationId ?? null,
        bookingId: payload.bookingId ?? null,
        channel: payload.channel ?? 'sms',
        destination: payload.destination ?? null,
        status: payload.status ?? 'queued',
        requestedAt: payload.requestedAt ?? null,
        completedAt: payload.completedAt ?? null,
        rating: payload.rating ?? null,
        reviewText: payload.reviewText ?? null,
        externalReviewId: payload.externalReviewId ?? null,
        reviewUrl: payload.reviewUrl ?? null,
        notes: payload.notes ?? null,
        metadataJson: stringifyJson(payload.metadata ?? {})
      });

      return mapReviewRequest(
        db.prepare('SELECT * FROM review_requests WHERE id = ?').get(result.lastInsertRowid)
      );
    },

    listAll() {
      return listStatement.all().map(mapReviewRequest);
    }
  };
}
