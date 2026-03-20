export function createWaitlistRepository(db) {
  const insertStatement = db.prepare(`
    INSERT INTO waitlist_submissions (
      product_slug,
      name,
      email,
      phone,
      company,
      notes
    ) VALUES (
      @productSlug,
      @name,
      @email,
      @phone,
      @company,
      @notes
    )
  `);
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
        name: payload.name,
        email: payload.email,
        phone: payload.phone || null,
        company: payload.company || null,
        notes: payload.notes || null
      });

      return db
        .prepare('SELECT * FROM waitlist_submissions WHERE id = ?')
        .get(result.lastInsertRowid);
    },

    listByProduct(productSlug) {
      return listByProductStatement.all(productSlug);
    }
  };
}
