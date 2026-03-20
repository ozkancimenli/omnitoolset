import { mapBusiness } from './utils.js';

export function createBusinessesRepository(db) {
  const getByPhoneStatement = db.prepare(
    'SELECT * FROM businesses WHERE twilio_phone = ? LIMIT 1'
  );
  const getBySlugStatement = db.prepare(
    'SELECT * FROM businesses WHERE slug = ? LIMIT 1'
  );
  const getByIdStatement = db.prepare(
    'SELECT * FROM businesses WHERE id = ? LIMIT 1'
  );
  const listAllStatement = db.prepare(
    'SELECT * FROM businesses ORDER BY created_at ASC'
  );
  const upsertStatement = db.prepare(`
    INSERT INTO businesses (
      name,
      slug,
      twilio_phone,
      timezone,
      forwarding_phone,
      services_summary,
      hours_summary,
      booking_duration_minutes,
      booking_window_days
    ) VALUES (
      @name,
      @slug,
      @twilioPhone,
      @timezone,
      @forwardingPhone,
      @servicesSummary,
      @hoursSummary,
      @bookingDurationMinutes,
      @bookingWindowDays
    )
    ON CONFLICT(slug) DO UPDATE SET
      name = excluded.name,
      twilio_phone = excluded.twilio_phone,
      timezone = excluded.timezone,
      forwarding_phone = excluded.forwarding_phone,
      services_summary = excluded.services_summary,
      hours_summary = excluded.hours_summary,
      booking_duration_minutes = excluded.booking_duration_minutes,
      booking_window_days = excluded.booking_window_days,
      updated_at = CURRENT_TIMESTAMP
  `);

  return {
    ensureBusiness(data) {
      upsertStatement.run(data);
      return mapBusiness(getBySlugStatement.get(data.slug));
    },

    getByTwilioPhone(phone) {
      return mapBusiness(getByPhoneStatement.get(phone));
    },

    getById(id) {
      return mapBusiness(getByIdStatement.get(id));
    },

    listAll() {
      return listAllStatement.all().map(mapBusiness);
    }
  };
}
