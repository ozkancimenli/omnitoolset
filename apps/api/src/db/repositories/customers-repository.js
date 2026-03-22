import { mapCustomer } from './utils.js';

export function createCustomersRepository(db) {
  return {
    async getByStripeCustomerId(stripeCustomerId) {
      const result = await db.query(
        'SELECT * FROM customers WHERE stripe_customer_id = $1 LIMIT 1',
        [stripeCustomerId]
      );
      return mapCustomer(result.rows[0]);
    },

    async upsertStripeCustomer({
      stripeCustomerId,
      email = null,
      name = null,
      companyName = null,
      status = 'active',
      metadata = {}
    }) {
      const result = await db.query(
        `
          INSERT INTO customers (
            stripe_customer_id,
            email,
            name,
            company_name,
            status,
            metadata
          ) VALUES ($1,$2,$3,$4,$5,$6::jsonb)
          ON CONFLICT (stripe_customer_id) DO UPDATE SET
            email = COALESCE(EXCLUDED.email, customers.email),
            name = COALESCE(EXCLUDED.name, customers.name),
            company_name = COALESCE(EXCLUDED.company_name, customers.company_name),
            status = COALESCE(EXCLUDED.status, customers.status),
            metadata = customers.metadata || EXCLUDED.metadata,
            updated_at = NOW()
          RETURNING *
        `,
        [stripeCustomerId, email, name, companyName, status, JSON.stringify(metadata)]
      );

      return mapCustomer(result.rows[0]);
    }
  };
}
