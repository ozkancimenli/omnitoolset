# OmniToolset Local Testing Guide

This guide covers the full local MVP workflow for OmniToolset:

- homepage and product pages
- SMS webhook handling
- AI-generated SMS replies
- booking flow
- missed call flow
- beta and waitlist form submissions

## Prerequisites

- Node.js 20 or newer
- npm
- An OpenAI API key if you want real AI-generated replies
- A Twilio account, a Twilio phone number, and a public tunnel if you want real inbound SMS or voice webhook testing

You can still test most of the MVP locally without OpenAI or Twilio credentials.

## 1. Create your local environment

Copy the example file:

```bash
cp .env.example .env
```

Use this as a practical starting point:

```dotenv
PORT=3000
APP_URL=http://localhost:3000
DATABASE_PATH=./data/omnitoolset.sqlite

DEFAULT_BUSINESS_NAME=Northstar Health
DEFAULT_BUSINESS_SLUG=northstar-health
DEFAULT_BUSINESS_PHONE=+15551234567
BUSINESS_TYPE=local health clinic
BUSINESS_TIMEZONE=America/New_York
BUSINESS_FORWARDING_PHONE=
BUSINESS_SERVICES=Consultations, follow-ups, and appointment scheduling
BUSINESS_HOURS=Mon-Fri, 9:00 AM to 5:00 PM
BUSINESS_PRICE_SUMMARY=Most visits start at $75, and exact pricing depends on the service.
BOOKING_DURATION_MINUTES=45
BOOKING_WINDOW_DAYS=10

TWILIO_ACCOUNT_SID=
TWILIO_AUTH_TOKEN=
TWILIO_PHONE_NUMBER=+15551234567

OPENAI_API_KEY=
OPENAI_MODEL=gpt-4o-mini
OPENAI_TEMPERATURE=0.7
```

### What each variable is for

Required to boot locally:

- `PORT`
- `APP_URL`
- `DATABASE_PATH`
- `DEFAULT_BUSINESS_NAME`
- `DEFAULT_BUSINESS_SLUG`
- `DEFAULT_BUSINESS_PHONE`
- `BUSINESS_TYPE`
- `BUSINESS_TIMEZONE`
- `BUSINESS_HOURS`
- `BUSINESS_PRICE_SUMMARY`

Required for real OpenAI replies:

- `OPENAI_API_KEY`

Required for real Twilio outbound delivery:

- `TWILIO_ACCOUNT_SID`
- `TWILIO_AUTH_TOKEN`
- `TWILIO_PHONE_NUMBER`

Recommended for real voice testing:

- `BUSINESS_FORWARDING_PHONE`

Notes:

- If `OPENAI_API_KEY` is empty, the SMS assistant still works using local fallback replies.
- If Twilio credentials are empty, inbound webhook logic still works locally, but missed-call SMS delivery is simulated instead of actually sent.
- `TWILIO_PHONE_NUMBER` and `DEFAULT_BUSINESS_PHONE` should usually be the same value for real Twilio testing.
- Leave `BUSINESS_FORWARDING_PHONE` blank if you want inbound calls to go straight into the missed-call SMS path.

## 2. Install and run

Install dependencies:

```bash
npm install
```

Apply database migrations:

```bash
npm run db:migrate
```

Optional: seed example records for local inspection:

```bash
npm run db:seed:example
```

Start the app:

```bash
npm run dev
```

Open:

- `http://localhost:3000`

## 3. Quick smoke test

Browser checks:

1. Open `http://localhost:3000/`
2. Confirm the homepage headline is `AI tools that help your business grow automatically.`
3. Confirm you see 5 product cards with these status labels:
   - `SMS AI Assistant` -> `Live`
   - `Review Booster` -> `Beta`
   - `Follow-up Automation` -> `Beta`
   - `Lead Capture AI` -> `Coming Soon`
   - `Inbox / Simple CRM` -> `Coming Soon`
4. Open each product page:
   - `http://localhost:3000/products/sms-ai-assistant`
   - `http://localhost:3000/products/review-booster`
   - `http://localhost:3000/products/follow-up-automation`
   - `http://localhost:3000/products/lead-capture-ai`
   - `http://localhost:3000/products/inbox-simple-crm`

Optional HTTP smoke checks:

```bash
curl -I http://localhost:3000/
curl -I http://localhost:3000/products/sms-ai-assistant
curl -I http://localhost:3000/products/review-booster
curl -I http://localhost:3000/products/follow-up-automation
curl -I http://localhost:3000/products/lead-capture-ai
curl -I http://localhost:3000/products/inbox-simple-crm
```

## 4. Test beta and waitlist submissions

### Browser flow

1. Open a staged product page such as `http://localhost:3000/products/review-booster`
2. Submit the form with:
   - name
   - email
   - company
   - optional note
3. Confirm you are redirected back with a success banner

### JSON API flow

This is useful for direct testing and automation:

```bash
curl -X POST http://localhost:3000/api/access-requests \
  -H 'Content-Type: application/json' \
  -d '{
    "productSlug": "review-booster",
    "name": "Alex Morgan",
    "email": "alex@example.com",
    "company": "Northstar Health",
    "note": "Please add us to the beta.",
    "sourcePath": "/products/review-booster"
  }'
```

Expected result:

- HTTP `201`
- JSON response with `ok: true`

Validation test:

```bash
curl -X POST http://localhost:3000/api/access-requests \
  -H 'Content-Type: application/json' \
  -d '{
    "productSlug": "sms-ai-assistant",
    "name": "",
    "email": "bad-email",
    "company": ""
  }'
```

Expected result:

- HTTP `400`
- field validation errors in the response body

## 5. Test the SMS assistant without Twilio

For local developer testing, the easiest endpoint is:

- `POST /api/sms-assistant/simulate`

It accepts JSON and returns JSON, so it is easier to inspect than raw TwiML.

### Basic booking request

```bash
curl -X POST http://localhost:3000/api/sms-assistant/simulate \
  -H 'Content-Type: application/json' \
  -d '{
    "from": "+15550000001",
    "to": "+15551234567",
    "body": "Hi, can I book for tomorrow afternoon?"
  }'
```

Expected result:

- `ok: true`
- `planType: "offer_slots"` or a short clarifying step if timing is ambiguous
- `replyText` with a short booking-oriented reply

### Pricing question

```bash
curl -X POST http://localhost:3000/api/sms-assistant/simulate \
  -H 'Content-Type: application/json' \
  -d '{
    "from": "+15550000002",
    "to": "+15551234567",
    "body": "How much is it?"
  }'
```

Expected result:

- short pricing reply
- gentle redirect toward booking

### Unclear opener

```bash
curl -X POST http://localhost:3000/api/sms-assistant/simulate \
  -H 'Content-Type: application/json' \
  -d '{
    "from": "+15550000003",
    "to": "+15551234567",
    "body": "Hi"
  }'
```

Expected result:

- one short clarifying question

### Not now

```bash
curl -X POST http://localhost:3000/api/sms-assistant/simulate \
  -H 'Content-Type: application/json' \
  -d '{
    "from": "+15550000004",
    "to": "+15551234567",
    "body": "Not now, maybe later"
  }'
```

Expected result:

- a short polite close
- no aggressive push

## 6. Test the SMS webhook path directly

Use the real webhook route if you want to exercise Twilio-style form payloads:

- `POST /api/sms-assistant/webhooks/sms`

```bash
curl -X POST http://localhost:3000/api/sms-assistant/webhooks/sms \
  --data-urlencode 'From=+15550000001' \
  --data-urlencode 'To=+15551234567' \
  --data-urlencode 'Body=Hi, can I book for tomorrow afternoon?' \
  --data-urlencode 'MessageSid=SM-local-001'
```

Expected result:

- HTTP `200`
- XML TwiML response containing a short SMS reply

Duplicate protection test:

```bash
curl -X POST http://localhost:3000/api/sms-assistant/webhooks/sms \
  --data-urlencode 'From=+15550000001' \
  --data-urlencode 'To=+15551234567' \
  --data-urlencode 'Body=Hi, can I book for tomorrow afternoon?' \
  --data-urlencode 'MessageSid=SM-local-001'
```

Expected result:

- HTTP `200`
- empty TwiML because the message SID was already processed

## 7. Test the booking flow end to end

Start with a booking request:

```bash
curl -X POST http://localhost:3000/api/sms-assistant/webhooks/sms \
  --data-urlencode 'From=+15550000005' \
  --data-urlencode 'To=+15551234567' \
  --data-urlencode 'Body=Do you have anything Tuesday morning?' \
  --data-urlencode 'MessageSid=SM-booking-001'
```

Then confirm one of the offered options using the same `From` and `To` numbers:

```bash
curl -X POST http://localhost:3000/api/sms-assistant/webhooks/sms \
  --data-urlencode 'From=+15550000005' \
  --data-urlencode 'To=+15551234567' \
  --data-urlencode 'Body=The first one works' \
  --data-urlencode 'MessageSid=SM-booking-002'
```

Expected result:

- second response confirms the booking
- a booking row is stored with status `confirmed`

## 8. Test the missed-call flow

### Local missed-call simulation

You can trigger the missed-call path directly:

```bash
curl -X POST http://localhost:3000/api/sms-assistant/webhooks/voice/dial-result \
  --data-urlencode 'From=+15550000006' \
  --data-urlencode 'To=+15551234567' \
  --data-urlencode 'CallSid=CA-local-001' \
  --data-urlencode 'DialCallStatus=no-answer'
```

Expected result:

- HTTP `200`
- voice TwiML response
- a missed-call follow-up SMS is generated

If Twilio credentials are missing, the follow-up delivery is simulated. The conversation and outbound message record are still stored.

### Incoming call webhook

You can also inspect the voice webhook response directly:

```bash
curl -X POST http://localhost:3000/api/sms-assistant/webhooks/voice/incoming \
  --data-urlencode 'From=+15550000006' \
  --data-urlencode 'To=+15551234567' \
  --data-urlencode 'CallSid=CA-local-002'
```

Expected result:

- if `BUSINESS_FORWARDING_PHONE` is set, TwiML includes a `<Dial>` step
- if `BUSINESS_FORWARDING_PHONE` is blank, TwiML says the caller will be texted shortly

## 9. Test real OpenAI-generated replies

Set:

```dotenv
OPENAI_API_KEY=your_key_here
```

Restart the app after changing `.env`.

Then use either:

- `POST /api/sms-assistant/simulate`
- `POST /api/sms-assistant/webhooks/sms`

Example:

```bash
curl -X POST http://localhost:3000/api/sms-assistant/simulate \
  -H 'Content-Type: application/json' \
  -d '{
    "from": "+15550000007",
    "to": "+15551234567",
    "body": "How much is a visit, and do you have anything Friday?"
  }'
```

What to look for:

- reply is short and human
- reply answers pricing simply
- reply still moves toward booking
- reply stays within 1 to 2 short sentences

If `OPENAI_API_KEY` is missing or the OpenAI call fails, OmniToolset falls back to local rule-based reply text.

## 10. Test with a real Twilio number and webhook forwarding

Twilio cannot call `localhost` directly. Use a public tunnel and point your Twilio number at that URL.

### Option A: ngrok

```bash
ngrok http 3000
```

### Option B: Cloudflare Tunnel

```bash
cloudflared tunnel --url http://localhost:3000
```

Take the public HTTPS URL and set:

```dotenv
APP_URL=https://your-public-url.example
```

Restart the app.

In the Twilio console, configure your phone number with:

- Messaging webhook:
  - `POST https://your-public-url.example/api/sms-assistant/webhooks/sms`
- Voice webhook:
  - `POST https://your-public-url.example/api/sms-assistant/webhooks/voice/incoming`

Notes:

- The voice dial-result callback URL is generated by the app in TwiML. You do not set that manually in Twilio.
- Real inbound SMS replies work through TwiML even if your app does not have Twilio API credentials.
- Real missed-call auto-reply SMS uses the Twilio REST API, so that flow needs valid `TWILIO_ACCOUNT_SID`, `TWILIO_AUTH_TOKEN`, and `TWILIO_PHONE_NUMBER`.

### Suggested real-device tests

1. Send an SMS to your Twilio number asking to book.
2. Reply with `The first one works`.
3. Call the Twilio number:
   - if `BUSINESS_FORWARDING_PHONE` is your cell, let it ring out to test the missed-call path
   - if `BUSINESS_FORWARDING_PHONE` is blank, the missed-call text should trigger immediately

## 11. Verify database writes

If you want to confirm data was stored, use Node with the existing `better-sqlite3` dependency.

Recent messages:

```bash
node --input-type=module -e "import Database from 'better-sqlite3'; const db = new Database('./data/omnitoolset.sqlite'); console.log(db.prepare('SELECT id, direction, channel, body, provider_sid, created_at FROM messages ORDER BY id DESC LIMIT 10').all());"
```

Recent bookings:

```bash
node --input-type=module -e "import Database from 'better-sqlite3'; const db = new Database('./data/omnitoolset.sqlite'); console.log(db.prepare('SELECT id, status, requested_slot, confirmed_slot, created_at FROM bookings ORDER BY id DESC LIMIT 10').all());"
```

Recent beta and waitlist requests:

```bash
node --input-type=module -e "import Database from 'better-sqlite3'; const db = new Database('./data/omnitoolset.sqlite'); console.log(db.prepare('SELECT id, product_slug, request_type, name, email, company, created_at FROM waitlist_submissions ORDER BY id DESC LIMIT 10').all());"
```

If you changed `DATABASE_PATH`, replace `./data/omnitoolset.sqlite` with your actual path.

## 12. Useful local commands

Run automated tests:

```bash
npm test
```

Re-apply migrations and inspect applied migrations:

```bash
npm run db:migrate
```

Seed example data:

```bash
npm run db:seed:example
```

## 13. Common troubleshooting

### The app boots but AI replies do not look dynamic

- Check `OPENAI_API_KEY`
- Restart the server after updating `.env`
- If OpenAI is unavailable, fallback replies are expected behavior

### Twilio webhook tests work locally with `curl`, but not from Twilio

- Twilio cannot reach `http://localhost:3000`
- start a public tunnel
- update `APP_URL`
- restart the app
- make sure Twilio is calling the public HTTPS URL, not localhost

### Inbound SMS works, but missed-call auto-SMS is not actually delivered

- real missed-call SMS delivery needs:
  - `TWILIO_ACCOUNT_SID`
  - `TWILIO_AUTH_TOKEN`
  - `TWILIO_PHONE_NUMBER`
- without those values, delivery is intentionally simulated

### Voice calls do not forward anywhere

- set `BUSINESS_FORWARDING_PHONE` to a real phone number
- or leave it blank intentionally if you want to test the immediate missed-call text flow

### Booking replies keep starting a new conversation

- use the same `From` and `To` values across the first and second SMS requests
- use a new `MessageSid` for each new inbound SMS webhook call

### Duplicate webhook calls look empty

- this is expected if you reuse the same `MessageSid`
- duplicate protection returns empty TwiML instead of processing the same message twice

### Database seems stale or inconsistent during local testing

Start from a clean DB:

```bash
rm -f ./data/omnitoolset.sqlite
npm run db:migrate
```

Then restart the app.

### The access request form says the product is invalid

- only staged products accept beta or waitlist submissions
- `SMS AI Assistant` is the live product and is intentionally not accepted by `/api/access-requests`
