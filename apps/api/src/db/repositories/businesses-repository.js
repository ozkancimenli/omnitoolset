import { mapBusiness } from './utils.js';

export function createBusinessesRepository(db) {
  return {
    async ensureBusiness(data) {
      const result = await db.query(
        `
          INSERT INTO businesses (
            name,
            slug,
            owner_customer_id,
            owner_name,
            contact_email,
            contact_phone,
            twilio_phone,
            timezone,
            forwarding_phone,
            business_type,
            services_summary,
            hours_summary,
            price_summary,
            status,
            booking_duration_minutes,
            booking_window_days
          ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16)
          ON CONFLICT (slug) DO UPDATE SET
            name = EXCLUDED.name,
            owner_customer_id = COALESCE(businesses.owner_customer_id, EXCLUDED.owner_customer_id),
            owner_name = COALESCE(EXCLUDED.owner_name, businesses.owner_name),
            contact_email = COALESCE(EXCLUDED.contact_email, businesses.contact_email),
            contact_phone = COALESCE(EXCLUDED.contact_phone, businesses.contact_phone),
            twilio_phone = EXCLUDED.twilio_phone,
            timezone = EXCLUDED.timezone,
            forwarding_phone = EXCLUDED.forwarding_phone,
            business_type = EXCLUDED.business_type,
            services_summary = EXCLUDED.services_summary,
            hours_summary = EXCLUDED.hours_summary,
            price_summary = EXCLUDED.price_summary,
            status = EXCLUDED.status,
            booking_duration_minutes = EXCLUDED.booking_duration_minutes,
            booking_window_days = EXCLUDED.booking_window_days,
            updated_at = NOW()
          RETURNING *
        `,
        [
          data.name,
          data.slug,
          data.ownerCustomerId || null,
          data.ownerName || null,
          data.contactEmail || null,
          data.contactPhone || null,
          data.twilioPhone,
          data.timezone,
          data.forwardingPhone,
          data.businessType,
          data.servicesSummary,
          data.hoursSummary,
          data.priceSummary,
          data.status || 'active',
          data.bookingDurationMinutes,
          data.bookingWindowDays
        ]
      );

      return mapBusiness(result.rows[0]);
    },

    async getByTwilioPhone(phone) {
      const result = await db.query(
        'SELECT * FROM businesses WHERE twilio_phone = $1 LIMIT 1',
        [phone]
      );
      return mapBusiness(result.rows[0]);
    },

    async getBySlug(slug) {
      const result = await db.query('SELECT * FROM businesses WHERE slug = $1 LIMIT 1', [slug]);
      return mapBusiness(result.rows[0]);
    },

    async findByOwnerCustomerId(ownerCustomerId) {
      const result = await db.query(
        'SELECT * FROM businesses WHERE owner_customer_id = $1 ORDER BY created_at ASC LIMIT 1',
        [ownerCustomerId]
      );
      return mapBusiness(result.rows[0]);
    },

    async createOwnedBusiness(data) {
      const result = await db.query(
        `
          INSERT INTO businesses (
            name,
            slug,
            owner_customer_id,
            owner_name,
            contact_email,
            contact_phone,
            twilio_phone,
            timezone,
            forwarding_phone,
            business_type,
            services_summary,
            hours_summary,
            price_summary,
            status,
            booking_duration_minutes,
            booking_window_days
          ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16)
          RETURNING *
        `,
        [
          data.name,
          data.slug,
          data.ownerCustomerId || null,
          data.ownerName || null,
          data.contactEmail || null,
          data.contactPhone || null,
          data.twilioPhone || null,
          data.timezone,
          data.forwardingPhone || null,
          data.businessType || null,
          data.servicesSummary || null,
          data.hoursSummary || null,
          data.priceSummary || null,
          data.status || 'active',
          data.bookingDurationMinutes,
          data.bookingWindowDays
        ]
      );

      return mapBusiness(result.rows[0]);
    },

    async updateOnboardingProfile({
      id,
      name,
      ownerName,
      contactEmail,
      contactPhone,
      twilioPhone,
      businessType,
      hoursSummary,
      priceSummary,
      forwardingPhone,
      status = 'active'
    }) {
      const result = await db.query(
        `
          UPDATE businesses
          SET
            name = COALESCE($2, name),
            owner_name = COALESCE($3, owner_name),
            contact_email = COALESCE($4, contact_email),
            contact_phone = COALESCE($5, contact_phone),
            twilio_phone = COALESCE($6, twilio_phone),
            business_type = COALESCE($7, business_type),
            hours_summary = COALESCE($8, hours_summary),
            price_summary = COALESCE($9, price_summary),
            forwarding_phone = COALESCE($10, forwarding_phone),
            status = COALESCE($11, status),
            onboarding_completed_at = NOW(),
            updated_at = NOW()
          WHERE id = $1
          RETURNING *
        `,
        [
          id,
          name || null,
          ownerName || null,
          contactEmail || null,
          contactPhone || null,
          twilioPhone || null,
          businessType || null,
          hoursSummary || null,
          priceSummary || null,
          forwardingPhone || null,
          status
        ]
      );

      return mapBusiness(result.rows[0]);
    },

    async updateSettings({ id, hoursSummary, priceSummary, automationEnabled }) {
      const result = await db.query(
        `
          UPDATE businesses
          SET
            hours_summary = $2,
            price_summary = $3,
            automation_enabled = $4,
            updated_at = NOW()
          WHERE id = $1
          RETURNING *
        `,
        [id, hoursSummary, priceSummary, automationEnabled]
      );

      return mapBusiness(result.rows[0]);
    },

    async listAll() {
      const result = await db.query('SELECT * FROM businesses ORDER BY created_at ASC');
      return result.rows.map(mapBusiness);
    }
  };
}
