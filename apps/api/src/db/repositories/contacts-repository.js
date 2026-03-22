import { mapContact } from './utils.js';

export function createContactsRepository(db) {
  return {
    async findOrCreate({
      businessId,
      name = null,
      phone = null,
      email = null,
      source = null,
      status = 'active',
      metadata = {}
    }) {
      if (phone) {
        const result = await db.query(
          `
            INSERT INTO contacts (
              business_id,
              name,
              phone,
              email,
              source,
              status,
              metadata
            ) VALUES ($1,$2,$3,$4,$5,$6,$7::jsonb)
            ON CONFLICT (business_id, phone) DO UPDATE SET
              name = COALESCE(contacts.name, EXCLUDED.name),
              email = COALESCE(contacts.email, EXCLUDED.email),
              source = COALESCE(EXCLUDED.source, contacts.source),
              status = COALESCE(EXCLUDED.status, contacts.status),
              metadata = contacts.metadata || EXCLUDED.metadata,
              updated_at = NOW()
            RETURNING *
          `,
          [businessId, name, phone, email, source, status, JSON.stringify(metadata)]
        );

        return mapContact(result.rows[0]);
      }

      const result = await db.query(
        `
          INSERT INTO contacts (
            business_id,
            name,
            phone,
            email,
            source,
            status,
            metadata
          ) VALUES ($1,$2,$3,$4,$5,$6,$7::jsonb)
          ON CONFLICT (business_id, email) DO UPDATE SET
            name = COALESCE(contacts.name, EXCLUDED.name),
            phone = COALESCE(contacts.phone, EXCLUDED.phone),
            source = COALESCE(EXCLUDED.source, contacts.source),
            status = COALESCE(EXCLUDED.status, contacts.status),
            metadata = contacts.metadata || EXCLUDED.metadata,
            updated_at = NOW()
          RETURNING *
        `,
        [businessId, name, phone, email, source, status, JSON.stringify(metadata)]
      );

      return mapContact(result.rows[0]);
    }
  };
}
