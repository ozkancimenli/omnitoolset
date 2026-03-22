export function createAccessRequestsRepository(db) {
  const insertStatement = db.prepare(`
    INSERT INTO waitlist_submissions (
      product_slug,
      request_type,
      status,
      name,
      email,
      company,
      notes,
      source_path
    ) VALUES (
      @productSlug,
      @requestType,
      @status,
      @name,
      @email,
      @company,
      @notes,
      @sourcePath
    )
  `);
  const getByIdStatement = db.prepare('SELECT * FROM waitlist_submissions WHERE id = ?');
  const listByProductStatement = db.prepare(`
    SELECT *
    FROM waitlist_submissions
    WHERE product_slug = ?
    ORDER BY created_at DESC
  `);

  return {
    create(payload) {
      const result = insertStatement.run({
        productSlug: payload.productSlug,
        requestType: payload.requestType,
        status: payload.status ?? 'new',
        name: payload.name,
        email: payload.email,
        company: payload.company,
        notes: payload.note || null,
        sourcePath: payload.sourcePath || null
      });

      return getByIdStatement.get(result.lastInsertRowid);
    },

    listByProduct(productSlug) {
      return listByProductStatement.all(productSlug);
    }
  };
}
