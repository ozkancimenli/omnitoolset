import { mapAccessRequest } from './utils.js';

export function createAccessRequestsRepository(db) {
  return {
    async create(payload) {
      const result = await db.query(
        `
          INSERT INTO access_requests (
            product_slug,
            request_type,
            status,
            name,
            email,
            company_name,
            note,
            source_path
          ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8)
          RETURNING *
        `,
        [
          payload.productSlug,
          payload.requestType,
          payload.status || 'new',
          payload.name,
          payload.email,
          payload.companyName,
          payload.note,
          payload.sourcePath
        ]
      );

      return mapAccessRequest(result.rows[0]);
    }
  };
}
