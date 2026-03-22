import { mapContact, parseJson, stringifyJson } from './utils.js';

export function createContactsRepository(db) {
  const getByIdStatement = db.prepare('SELECT * FROM contacts WHERE id = ? LIMIT 1');
  const getByPhoneStatement = db.prepare(`
    SELECT *
    FROM contacts
    WHERE business_id = ? AND phone = ?
    LIMIT 1
  `);
  const getByEmailStatement = db.prepare(`
    SELECT *
    FROM contacts
    WHERE business_id = ? AND email = ?
    LIMIT 1
  `);
  const insertStatement = db.prepare(`
    INSERT INTO contacts (
      business_id,
      name,
      phone,
      email,
      source,
      status,
      metadata_json
    ) VALUES (
      @businessId,
      @name,
      @phone,
      @email,
      @source,
      @status,
      @metadataJson
    )
  `);
  const updateStatement = db.prepare(`
    UPDATE contacts
    SET
      name = @name,
      phone = @phone,
      email = @email,
      source = @source,
      status = @status,
      metadata_json = @metadataJson,
      updated_at = CURRENT_TIMESTAMP
    WHERE id = @id
  `);

  function findExisting({ businessId, phone, email }) {
    if (phone) {
      return getByPhoneStatement.get(businessId, phone);
    }

    if (email) {
      return getByEmailStatement.get(businessId, email);
    }

    return null;
  }

  return {
    findOrCreate({
      businessId,
      name = null,
      phone = null,
      email = null,
      source = null,
      status = null,
      metadata = {}
    }) {
      const existing = findExisting({ businessId, phone, email });

      if (!existing) {
        const result = insertStatement.run({
          businessId,
          name,
          phone,
          email,
          source,
          status: status ?? 'active',
          metadataJson: stringifyJson(metadata)
        });

        return mapContact(getByIdStatement.get(result.lastInsertRowid));
      }

      const mergedMetadata = {
        ...parseJson(existing.metadata_json, {}),
        ...(metadata || {})
      };

      updateStatement.run({
        id: existing.id,
        name: name ?? existing.name,
        phone: phone ?? existing.phone,
        email: email ?? existing.email,
        source: source ?? existing.source,
        status: status ?? existing.status,
        metadataJson: stringifyJson(mergedMetadata)
      });

      return mapContact(getByIdStatement.get(existing.id));
    },

    getById(id) {
      return mapContact(getByIdStatement.get(id));
    }
  };
}
