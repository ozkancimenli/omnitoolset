# Local Development

## Requirements

- Node.js 20
- npm 10+
- PostgreSQL 16

## Start PostgreSQL

If you use Docker:

```bash
docker compose up -d postgres
```

If you already have PostgreSQL locally, create a database named `omnitoolset` and use a connection string like:

```bash
postgres://postgres:postgres@localhost:5432/omnitoolset
```

## Environment

Copy the workspace env files:

```bash
cp apps/web/.env.example apps/web/.env.local
cp apps/api/.env.example apps/api/.env
```

Key frontend variables:

- `NEXT_PUBLIC_APP_URL=http://localhost:3000`
- `NEXT_PUBLIC_API_URL=http://localhost:4000`

Key backend variables:

- `APP_URL=http://localhost:4000`
- `FRONTEND_APP_URL=http://localhost:3000`
- `DATABASE_URL=postgres://postgres:postgres@localhost:5432/omnitoolset`
- `OPENAI_API_KEY=...`
- `STRIPE_SECRET_KEY=...`
- `STRIPE_WEBHOOK_SECRET=...`
- `STRIPE_PRICE_ID=price_...`
- `TWILIO_ACCOUNT_SID=...`
- `TWILIO_AUTH_TOKEN=...`
- `TWILIO_PHONE_NUMBER=...`

## Install and run

```bash
npm install
npm run db:migrate
npm run dev:api
```

In a second terminal:

```bash
npm run dev:web
```

## Local routes

- Frontend: `http://localhost:3000`
- Backend: `http://localhost:4000`
- Homepage: `http://localhost:3000/`
- SMS page: `http://localhost:3000/sms`
- SMS onboarding: `http://localhost:3000/sms/onboarding`
- Reviews page: `http://localhost:3000/reviews`
- Follow-up page: `http://localhost:3000/follow-up`
- Lead Capture page: `http://localhost:3000/lead-capture`
- Inbox page: `http://localhost:3000/inbox`

## Example API calls

Access request:

```bash
curl -X POST http://localhost:4000/api/access-requests \
  -H 'Content-Type: application/json' \
  -d '{
    "productSlug": "review-booster",
    "name": "Jordan Lee",
    "email": "jordan@example.com",
    "companyName": "Northstar Health",
    "note": "Interested in review request campaigns."
  }'
```

SMS simulate:

```bash
curl -X POST http://localhost:4000/api/sms-assistant/simulate \
  -H 'Content-Type: application/json' \
  -d '{
    "from": "+15550000001",
    "to": "+15551234567",
    "body": "Can I book for tomorrow afternoon?"
  }'
```

Booking confirmation:

```bash
curl -X POST http://localhost:4000/api/sms-assistant/simulate \
  -H 'Content-Type: application/json' \
  -d '{
    "from": "+15550000001",
    "to": "+15551234567",
    "body": "The first one works"
  }'
```

Missed call flow:

```bash
curl -X POST http://localhost:4000/api/sms-assistant/webhooks/voice/dial-result \
  -H 'Content-Type: application/x-www-form-urlencoded' \
  --data-urlencode 'From=+15550000001' \
  --data-urlencode 'To=+15551234567' \
  --data-urlencode 'CallSid=CA-demo-001' \
  --data-urlencode 'DialCallStatus=no-answer'
```

## Twilio local testing

Use a public tunnel such as `ngrok` or `Cloudflare Tunnel` and point Twilio to the backend tunnel URL:

- SMS webhook: `POST https://<your-tunnel>/api/sms-assistant/webhooks/sms`
- Voice webhook: `POST https://<your-tunnel>/api/sms-assistant/webhooks/voice/incoming`

For local development you can keep:

- `TWILIO_VALIDATE_SIGNATURES=false`

For production, turn it back on.

## Stripe local testing

1. Add Stripe test values to `apps/api/.env`.
2. Start the API and frontend.
3. Forward Stripe webhooks locally:

```bash
stripe listen --forward-to http://localhost:4000/api/billing/webhooks/stripe
```

4. Copy the signing secret from Stripe CLI into `STRIPE_WEBHOOK_SECRET`.
5. Open `http://localhost:3000/sms`.
6. Fill out the form and click `Start for $49/month`.
7. Use Stripe test card `4242 4242 4242 4242` with any future expiry and any CVC.
8. After payment, Stripe should redirect to `/sms/onboarding?session_id=...`.
9. Submit the onboarding form.
10. Confirm the completion screen appears with the activation message.
11. After onboarding, the backend attaches `TWILIO_PHONE_NUMBER` to that business and starts using its details for live SMS handling.
