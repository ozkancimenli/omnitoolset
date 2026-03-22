# Deployment

OmniToolset is designed for a hybrid deploy:

- frontend on Vercel
- backend API on Render
- PostgreSQL as the shared production database

## Vercel frontend

Project settings:

- Root Directory: `apps/web`
- Framework Preset: `Next.js`

Environment variables:

- `NEXT_PUBLIC_APP_URL=https://omnitoolset.com`
- `NEXT_PUBLIC_API_URL=https://api.omnitoolset.com`

Deploy result:

- `https://omnitoolset.com/`
- `https://omnitoolset.com/sms`
- `https://omnitoolset.com/sms/onboarding`
- `https://omnitoolset.com/reviews`
- `https://omnitoolset.com/follow-up`
- `https://omnitoolset.com/lead-capture`
- `https://omnitoolset.com/inbox`

## Render backend

Project settings:

- Root Directory: `apps/api`
- Build Command: `npm install`
- Start Command: `npm start`

Environment variables:

- `NODE_ENV=production`
- `PORT=10000`
- `APP_URL=https://api.omnitoolset.com`
- `FRONTEND_APP_URL=https://omnitoolset.com`
- `DATABASE_URL=postgres://...`
- `OPENAI_API_KEY=...`
- `OPENAI_MODEL=gpt-4o-mini`
- `OPENAI_TEMPERATURE=0.7`
- `OPENAI_MAX_TOKENS=90`
- `OPENAI_TIMEOUT_MS=8000`
- `STRIPE_SECRET_KEY=...`
- `STRIPE_WEBHOOK_SECRET=...`
- `STRIPE_PRICE_ID=price_...`
- `TWILIO_ACCOUNT_SID=...`
- `TWILIO_AUTH_TOKEN=...`
- `TWILIO_PHONE_NUMBER=...`
- `TWILIO_VALIDATE_SIGNATURES=true`

Business configuration:

- `DEFAULT_BUSINESS_NAME`
- `DEFAULT_BUSINESS_SLUG`
- `DEFAULT_BUSINESS_PHONE`
- `BUSINESS_TYPE`
- `BUSINESS_TIMEZONE`
- `BUSINESS_FORWARDING_PHONE`
- `BUSINESS_SERVICES`
- `BUSINESS_HOURS`
- `BUSINESS_PRICE_SUMMARY`
- `BOOKING_DURATION_MINUTES`
- `BOOKING_WINDOW_DAYS`

Security controls:

- `REQUEST_BODY_LIMIT`
- `SMS_MAX_BODY_CHARS`
- `SMS_RATE_LIMIT_WINDOW_MS`
- `SMS_RATE_LIMIT_MAX`
- `VOICE_RATE_LIMIT_WINDOW_MS`
- `VOICE_RATE_LIMIT_MAX`
- `SMS_DUPLICATE_WINDOW_MS`

## Database

Use PostgreSQL in production. The API expects `DATABASE_URL` and runs migrations on boot.

Recommended options:

- Render Postgres
- Neon
- Supabase

## Twilio production webhooks

Point the Twilio number at the backend domain:

- SMS: `POST https://api.omnitoolset.com/api/sms-assistant/webhooks/sms`
- Voice: `POST https://api.omnitoolset.com/api/sms-assistant/webhooks/voice/incoming`

Important:

- `APP_URL` must exactly match the public backend URL used by Twilio
- `TWILIO_PHONE_NUMBER` should match `DEFAULT_BUSINESS_PHONE`

## Stripe production webhook

Configure Stripe to send events to:

- `POST https://api.omnitoolset.com/api/billing/webhooks/stripe`

Required events:

- `checkout.session.completed`
- `invoice.paid`
- `customer.subscription.created`

## Post-payment onboarding flow

1. Customer clicks `Start for $49/month` on `/sms`.
2. Frontend creates a hosted Stripe Checkout session through the API.
3. Stripe sends the subscription webhooks to Render.
4. Stripe redirects the customer to `/sms/onboarding?session_id=...`.
5. Customer submits business details.
6. API links the onboarding form to the Stripe customer via the checkout session, stores the business data, assigns the configured `TWILIO_PHONE_NUMBER`, and marks the business as `active`.

Current MVP limitation:

- one Render API instance
- one configured Twilio number
- one active SMS AI Assistant business per live Twilio number

## Post-deploy checklist

1. Load the homepage and all five product pages on `omnitoolset.com`.
2. Submit a beta or waitlist form from the frontend.
3. Check `GET https://api.omnitoolset.com/health`.
4. Check `GET https://api.omnitoolset.com/api/sms-assistant/status`.
5. Send a real SMS to the Twilio number.
6. Confirm the booking flow with a reply like `The first one works`.
7. Place a missed call and confirm the auto-reply SMS fires.
