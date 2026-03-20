import { parseJson, stringifyJson } from './utils.js';

function mapReview(row) {
  if (!row) {
    return null;
  }

  return {
    ...row,
    metadata: parseJson(row.metadata_json, {}),
    metadata_json: undefined
  };
}

export function createReviewsRepository(db) {
  const listStatement = db.prepare('SELECT * FROM reviews ORDER BY created_at DESC');
  const insertStatement = db.prepare(`
    INSERT INTO reviews (
      business_id,
      customer_name,
      rating,
      review_text,
      status,
      external_id,
      metadata_json
    ) VALUES (
      @businessId,
      @customerName,
      @rating,
      @reviewText,
      @status,
      @externalId,
      @metadataJson
    )
  `);

  return {
    create(payload) {
      const result = insertStatement.run({
        businessId: payload.businessId ?? null,
        customerName: payload.customerName ?? null,
        rating: payload.rating ?? null,
        reviewText: payload.reviewText ?? null,
        status: payload.status ?? 'queued',
        externalId: payload.externalId ?? null,
        metadataJson: stringifyJson(payload.metadata ?? {})
      });

      return mapReview(
        db.prepare('SELECT * FROM reviews WHERE id = ?').get(result.lastInsertRowid)
      );
    },

    listAll() {
      return listStatement.all().map(mapReview);
    }
  };
}
