# OmniToolset

OmniToolset is a multi-product SaaS platform for local businesses.

- Frontend: Next.js on Vercel
- Backend API: Express on Render
- Database: PostgreSQL
- Live product: SMS AI Assistant
- Staged products: Review Booster, Follow-up Automation, Lead Capture AI, Inbox / Simple CRM

## Structure

```text
apps/
  api/      Express API, SMS module, Postgres schema, Twilio/OpenAI integrations
  web/      Next.js marketing site and product pages
packages/
  shared/   Shared product catalog and copy metadata
```

## Local setup

1. Start PostgreSQL locally.

```bash
docker run --name omnitoolset-postgres \
  -e POSTGRES_USER=postgres \
  -e POSTGRES_PASSWORD=postgres \
  -e POSTGRES_DB=omnitoolset \
  -p 5432:5432 \
  -d postgres:16
```

2. Copy the workspace env files:

```bash
cp apps/web/.env.example apps/web/.env.local
cp apps/api/.env.example apps/api/.env
```

The root `.env.example` is a consolidated reference for deployment tooling.
3. Install dependencies.

```bash
npm install
```

4. Run DB migrations.

```bash
npm run db:migrate
```

5. Start the backend.

```bash
npm run dev:api
```

6. In another terminal, start the frontend.

```bash
npm run dev:web
```

## Frontend routes

- `/`
- `/sms`
- `/sms/onboarding`
- `/reviews`
- `/follow-up`
- `/lead-capture`
- `/inbox`

## Backend endpoints

- `GET /health`
- `GET /api/products`
- `POST /api/access-requests`
- `POST /api/billing/checkout-sessions`
- `POST /api/billing/webhooks/stripe`
- `POST /access-requests`
- `GET /api/sms-assistant/status`
- `GET /api/sms-assistant/onboarding/session`
- `POST /api/sms-assistant/onboarding`
- `POST /api/sms-assistant/simulate`
- `POST /api/sms-assistant/webhooks/sms`
- `POST /api/sms-assistant/webhooks/voice/incoming`
- `POST /api/sms-assistant/webhooks/voice/dial-result`

## Deploy

### Vercel

- Project root: `apps/web`
- Required env:
  - `NEXT_PUBLIC_APP_URL=https://omnitoolset.com`
  - `NEXT_PUBLIC_API_URL=https://api.omnitoolset.com`

### Render

- Project root: `apps/api`
- Build command: `npm install`
- Start command: `npm start`
- Required env:
  - `APP_URL=https://api.omnitoolset.com`
  - `FRONTEND_APP_URL=https://omnitoolset.com`
  - `DATABASE_URL=...`
  - `OPENAI_API_KEY=...`
  - `STRIPE_SECRET_KEY=...`
  - `STRIPE_WEBHOOK_SECRET=...`
  - `STRIPE_PRICE_ID=...`
  - `TWILIO_ACCOUNT_SID=...`
  - `TWILIO_AUTH_TOKEN=...`
  - `TWILIO_PHONE_NUMBER=...`

Point Twilio at the backend:

- SMS: `https://api.omnitoolset.com/api/sms-assistant/webhooks/sms`
- Voice: `https://api.omnitoolset.com/api/sms-assistant/webhooks/voice/incoming`

After successful Stripe payment, Checkout now redirects to:

- `https://omnitoolset.com/sms/onboarding?session_id=...`

After onboarding submission:

- the business record is marked `active`
- the configured `TWILIO_PHONE_NUMBER` is attached to that business
- SMS and missed-call handling start routing through that business

Current MVP note:

- this is a single-number activation flow
- one live Twilio number maps to one active SMS AI Assistant business at a time

## Additional docs

- [Local development](./docs/LOCAL_DEVELOPMENT.md)
- [Deployment](./docs/DEPLOYMENT.md)
