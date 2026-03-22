# OmniToolset Hybrid Deployment Guide

This guide prepares OmniToolset for the recommended production MVP setup:

- frontend on Vercel
- backend API on Render
- Twilio webhooks pointed at Render
- SQLite stored on a Render persistent disk

This is intentionally simple. The frontend is a static product site, and the backend remains the single Express API for SMS, bookings, waitlist requests, and Twilio integrations.

## Target architecture

### Vercel

Hosts the public OmniToolset frontend:

- homepage
- product pages
- CTA links
- beta and waitlist forms that post to the backend

The static frontend is built from the shared EJS presentation layer with:

```bash
npm run build:frontend
```

### Render

Hosts the Express backend:

- `/health`
- `/api/products`
- `/api/access-requests`
- `/api/sms-assistant/*`
- `/access-requests`
- `/waitlist`

Render is also the public webhook target for Twilio.

## Files added for deployment

- [vercel.json](../vercel.json)
- [render.yaml](../render.yaml)
- [scripts/build-static-frontend.js](../scripts/build-static-frontend.js)

## Environment variable model

Keep secrets in the platform dashboards. Do not commit real values to the repo.

### Vercel frontend variables

Set these in the Vercel project:

- `FRONTEND_APP_URL`
  - your public frontend URL
  - example: `https://www.omnitoolset.com`
- `API_BASE_URL`
  - your public Render backend URL
  - example: `https://omnitoolset-api.onrender.com`

What they do:

- `FRONTEND_APP_URL` is used to build absolute return URLs for form submissions
- `API_BASE_URL` is used to point frontend forms at the Render backend

### Render backend variables

Set these in the Render web service:

- `NODE_ENV=production`
- `PORT=10000`
- `APP_URL`
  - your public backend URL
  - example: `https://omnitoolset-api.onrender.com`
- `FRONTEND_APP_URL`
  - your public Vercel frontend URL
  - example: `https://www.omnitoolset.com`
- `DATABASE_PATH=/var/data/omnitoolset.sqlite`

Core business config:

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

Twilio:

- `TWILIO_ACCOUNT_SID`
- `TWILIO_AUTH_TOKEN`
- `TWILIO_VALIDATE_SIGNATURES=true`
- `TWILIO_PHONE_NUMBER`

OpenAI:

- `OPENAI_API_KEY`
- `OPENAI_MODEL`
- `OPENAI_TEMPERATURE`
- `OPENAI_MAX_TOKENS`
- `OPENAI_TIMEOUT_MS`

Security and abuse control:

- `REQUEST_BODY_LIMIT`
- `SMS_MAX_BODY_CHARS`
- `SMS_RATE_LIMIT_WINDOW_MS`
- `SMS_RATE_LIMIT_MAX`
- `VOICE_RATE_LIMIT_WINDOW_MS`
- `VOICE_RATE_LIMIT_MAX`
- `SMS_DUPLICATE_WINDOW_MS`

### Recommended URL relationships

Use this pattern:

- frontend: `https://www.omnitoolset.com`
- backend: `https://api.omnitoolset.com`

Then set:

- Vercel `FRONTEND_APP_URL=https://www.omnitoolset.com`
- Vercel `API_BASE_URL=https://api.omnitoolset.com`
- Render `APP_URL=https://api.omnitoolset.com`
- Render `FRONTEND_APP_URL=https://www.omnitoolset.com`

## Vercel deployment steps

1. Import the repo into Vercel.
2. Keep the project root at the repository root.
3. Set the frontend environment variables:
   - `FRONTEND_APP_URL`
   - `API_BASE_URL`
4. Deploy.

This repo already tells Vercel to:

- run `npm run build:frontend`
- publish `frontend-dist`
- serve clean URLs without `.html`

### What Vercel is serving

After deploy, Vercel serves:

- `/`
- `/products/sms-ai-assistant`
- `/products/review-booster`
- `/products/follow-up-automation`
- `/products/lead-capture-ai`
- `/products/inbox-simple-crm`

The beta and waitlist forms submit directly to the Render backend.

## Render deployment steps

### Option A: use the included Blueprint

1. In Render, create a new Blueprint from this repo.
2. Review [render.yaml](../render.yaml).
3. Fill in the required `sync: false` environment variables.
4. Create the service.

The Blueprint config already includes:

- `npm install` as build command
- `npm start` as start command
- `/health` as the health check
- a persistent disk mounted at `/var/data`
- `DATABASE_PATH=/var/data/omnitoolset.sqlite`

### Option B: create the service manually

1. Create a new Render Web Service from the repo.
2. Use:
   - Build Command: `npm install`
   - Start Command: `npm start`
3. Add a persistent disk:
   - Mount path: `/var/data`
   - Disk size: `1 GB` is enough for the MVP
4. Set `DATABASE_PATH=/var/data/omnitoolset.sqlite`
5. Add the remaining environment variables listed above.

### Backend runtime notes

- The app runs migrations automatically on boot.
- `npm start` is the correct production start command.
- SQLite is acceptable for a single-instance MVP if the disk is mounted.
- Do not scale this backend to multiple instances while using SQLite on a single attached disk.

## Twilio configuration

Point Twilio at the Render backend, not the Vercel frontend.

Configure your Twilio phone number with:

- Messaging webhook:
  - `POST https://api.omnitoolset.com/api/sms-assistant/webhooks/sms`
- Voice webhook:
  - `POST https://api.omnitoolset.com/api/sms-assistant/webhooks/voice/incoming`

Notes:

- the dial-result callback URL is generated by the app in voice TwiML
- `TWILIO_PHONE_NUMBER` should match `DEFAULT_BUSINESS_PHONE`
- set `BUSINESS_FORWARDING_PHONE` to a real phone number if you want live call forwarding before the missed-call SMS fallback
- leave `BUSINESS_FORWARDING_PHONE` blank if you want inbound calls to go directly into the missed-call text flow

## Deployment checklist

### Before first deploy

- confirm `npm test` passes locally
- confirm `npm run build:frontend` succeeds locally
- decide your public frontend URL
- decide your public backend URL
- confirm your Twilio number is active
- confirm your OpenAI key is active

### Vercel checklist

- `FRONTEND_APP_URL` is set to the Vercel or custom frontend domain
- `API_BASE_URL` is set to the Render backend URL
- deploy succeeds
- homepage loads
- all 5 product pages load
- staged product forms post to the backend successfully

### Render checklist

- persistent disk is attached at `/var/data`
- `DATABASE_PATH=/var/data/omnitoolset.sqlite`
- `APP_URL` matches the public backend domain
- `FRONTEND_APP_URL` matches the public Vercel domain
- `TWILIO_VALIDATE_SIGNATURES=true`
- `TWILIO_PHONE_NUMBER` matches your Twilio number
- `/health` returns `ok: true`
- `/api/sms-assistant/status` returns `implemented: true`

### Twilio checklist

- SMS webhook points to Render
- Voice webhook points to Render
- the webhook method is `POST`
- the Twilio number matches the backend business phone config

## Post-deployment test checklist

### Frontend smoke test

1. Open the Vercel frontend homepage.
2. Open all 5 product pages.
3. Confirm status labels are visible and accurate.
4. Confirm the `SMS AI Assistant` page is the only live product page.

### Access request test

1. Open a `Beta` or `Coming Soon` product page on Vercel.
2. Submit the early access form.
3. Confirm you return to the Vercel frontend with a success banner.
4. Confirm the request is stored in the backend database.

### Backend smoke test

Run these against the Render backend:

```bash
curl https://api.omnitoolset.com/health
curl https://api.omnitoolset.com/api/sms-assistant/status
curl https://api.omnitoolset.com/api/products
```

### SMS flow test

1. Send a real SMS to your Twilio number.
2. Confirm a short reply comes back.
3. Reply with a booking confirmation such as `The first one works`.
4. Confirm the booking is saved as `confirmed`.

### Missed-call test

1. Call the Twilio number.
2. If forwarding is enabled, let the forwarded call ring out.
3. Confirm the missed-call SMS is sent.
4. Confirm the conversation and outbound message are stored.

## Production MVP limitations

- The backend is single-instance while using SQLite.
- This setup is production-ready for an MVP, not for horizontal scale.
- For multi-instance scaling, background jobs, or higher write volume, move the database to Postgres.
- The frontend is static by design; all dynamic workflows live on the backend API.

## Recommended launch sequence

1. Deploy Render first.
2. Set up Twilio against the Render domain.
3. Test `/health` and `/api/sms-assistant/status`.
4. Deploy Vercel with the final `API_BASE_URL`.
5. Submit a staged-product form from the frontend.
6. Test a real SMS booking flow.
7. Test a missed-call flow.
