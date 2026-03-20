# OmniToolset

OmniToolset is a modular multi-product SaaS platform for AI-powered small business tools.

This rebuild ships:

- `SMS AI Assistant` as the only fully working MVP
- `Review Booster` as a beta scaffold
- `Follow-up Automation` as a beta scaffold
- `Lead Capture AI` as a coming-soon scaffold
- `Inbox / Simple CRM` as a coming-soon scaffold

The platform is intentionally honest: one live product, four staged modules.

## Architecture

```text
.
├── .env.example
├── package.json
├── public/
│   └── styles.css
├── src/
│   ├── app.js
│   ├── server.js
│   ├── config/
│   │   ├── env.js
│   │   └── products.js
│   ├── core/
│   │   └── http/
│   │       └── async-handler.js
│   ├── db/
│   │   ├── client.js
│   │   ├── index.js
│   │   ├── schema.sql
│   │   └── repositories/
│   ├── integrations/
│   │   ├── openai/
│   │   │   └── openai-client.js
│   │   └── twilio/
│   │       ├── client.js
│   │       └── twiml.js
│   ├── modules/
│   │   ├── platform/
│   │   ├── sms_assistant/
│   │   ├── review_booster/
│   │   ├── follow_up/
│   │   ├── lead_capture/
│   │   ├── inbox/
│   │   └── shared/
│   └── views/
└── test/
    └── app.test.js
```

### Module design

- `config/` holds product definitions and environment parsing.
- `db/` owns the SQLite schema plus repositories for businesses, conversations, messages, bookings, leads, reviews, and waitlist submissions.
- `integrations/` isolates OpenAI and Twilio usage behind reusable helpers.
- `modules/sms_assistant/` contains the live product flow: booking logic, prompt shaping, service orchestration, and webhook routes.
- `modules/review_booster/`, `follow_up/`, `lead_capture/`, and `inbox/` expose scaffold routers and platform metadata for future implementation.
- `modules/platform/` renders the homepage, product pages, and waitlist flow.

## Database model

The schema is designed for future expansion and already includes:

- `businesses`
- `conversations`
- `messages`
- `bookings`
- `leads`
- `reviews`
- `waitlist_submissions`

SQLite is used for the MVP. The repository boundary makes it straightforward to swap to PostgreSQL later.

## SMS AI Assistant MVP

Implemented today:

- Twilio incoming SMS webhook
- OpenAI-generated SMS replies with a safe local fallback
- Booking flow that offers 1 to 2 time slots
- Booking confirmation persistence
- Missed-call auto-SMS via Twilio voice webhooks
- Conversation and message storage in the database

### SMS behavior

- Replies stay short, warm, and human
- The assistant moves toward booking
- It offers one or two time options
- It confirms the selected booking clearly

## Scaffolded modules

The other four products are intentionally not faked.

Each staged module has:

- a product page
- a status badge
- a placeholder API endpoint
- a waitlist flow
- a clean module folder ready for future implementation

## Environment variables

Copy `.env.example` to `.env` and fill in the values you need:

```bash
cp .env.example .env
```

Important variables:

- `PORT`: local server port
- `APP_URL`: public base URL used to render webhook URLs
- `DATABASE_PATH`: SQLite database file
- `DEFAULT_BUSINESS_*`: seed business data
- `BUSINESS_FORWARDING_PHONE`: number to ring before missed-call SMS fallback
- `TWILIO_ACCOUNT_SID`
- `TWILIO_AUTH_TOKEN`
- `TWILIO_PHONE_NUMBER`
- `OPENAI_API_KEY`
- `OPENAI_MODEL`

## Local setup

```bash
npm install
npm run dev
```

Open `http://localhost:3000`.

## Local testing

Run the automated tests:

```bash
npm test
```

Manual checks:

1. Open the homepage and verify all 5 products are visible with honest status labels.
2. Open `/products/sms-ai-assistant` and confirm the live-module copy and webhook URLs render.
3. Submit one of the unfinished product waitlist forms and confirm the success banner.
4. Send a local SMS webhook:

```bash
curl -X POST http://localhost:3000/api/sms-assistant/webhooks/sms \
  -d 'From=+15550000001' \
  -d 'To=+15551234567' \
  -d 'Body=Hi, I need an appointment tomorrow' \
  -d 'MessageSid=SM-local-001'
```

5. Confirm a suggested slot:

```bash
curl -X POST http://localhost:3000/api/sms-assistant/webhooks/sms \
  -d 'From=+15550000001' \
  -d 'To=+15551234567' \
  -d 'Body=The first one works' \
  -d 'MessageSid=SM-local-002'
```

6. Simulate a missed call:

```bash
curl -X POST http://localhost:3000/api/sms-assistant/webhooks/voice/dial-result \
  -d 'From=+15550000001' \
  -d 'To=+15551234567' \
  -d 'CallSid=CA-local-001' \
  -d 'DialCallStatus=no-answer'
```

## Twilio setup

Configure your Twilio phone number with:

- Messaging webhook: `POST /api/sms-assistant/webhooks/sms`
- Voice webhook: `POST /api/sms-assistant/webhooks/voice/incoming`
- Dial result action: already emitted by the voice TwiML to `POST /api/sms-assistant/webhooks/voice/dial-result`

If `BUSINESS_FORWARDING_PHONE` is set, inbound calls dial that number first. If the call is missed, OmniToolset sends the follow-up SMS automatically.

## Deployment

### Railway

1. Create a new Node service from this repo.
2. Set all `.env.example` values in Railway variables.
3. Use `npm start` as the start command.
4. Mount a persistent volume for the SQLite database or switch to PostgreSQL later.

### Render

1. Create a new Web Service.
2. Build command: `npm install`
3. Start command: `npm start`
4. Add the environment variables from `.env.example`.
5. Use a disk mount if you want SQLite persistence across deploys.

### Vercel

The repo now includes a `vercel-build` script and `vercel.json` with the framework forced to `express`, which avoids the incorrect `next build` path.

Important limitation:

- Vercel runs Express as a serverless function
- local SQLite is not persistent there
- the app now falls back to `/tmp/omnitoolset.sqlite` on Vercel so it can boot
- for real conversation and booking persistence, use a hosted database instead of SQLite

## Extending the platform

When you implement the next product:

1. keep the folder in `src/modules/<module_name>/`
2. add real service logic behind the module router
3. reuse `db/repositories/` and `integrations/`
4. update `src/config/products.js`
5. expand the product page from scaffold to live
