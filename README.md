# OmniToolset

OmniToolset is a modular automation platform built as a production-minded MVP.

The current build combines:

- a shared automation core
- reusable integrations
- a small workflow engine with run history
- a live `SMS AI Assistant` product module
- staged product modules that can plug into the same foundation later

## Product Summary

OmniToolset is not a single workflow script. It is a small platform for running useful operational workflows behind one clean system.

The MVP focuses on a practical foundation:

- one live product module: `SMS AI Assistant`
- one generic automation runtime: `Workflow Studio`
- shared integrations: `OpenAI`, `Twilio`, `Stripe`, `PostgreSQL`
- shared persistence for workflow runs and product data

## Architecture

### Frontend

- `Next.js`
- product-facing pages
- workflow studio page
- simple API-driven UX

### Backend

- `Express`
- product modules
- automation core
- integration clients
- repository layer

### Database

- `PostgreSQL`
- schema migrations
- product data + workflow run history

## Core Design

### 1. Product Modules

Product modules live under `apps/api/src/modules`.

Current modules:

- `sms_assistant` live
- `review_booster` scaffold
- `follow_up` scaffold
- `lead_capture` scaffold
- `inbox` scaffold
- `billing` shared billing/onboarding support

These are product-facing features with their own routing and business logic.

### 2. Automation Core

The reusable platform runtime lives under `apps/api/src/core/automation`.

It provides:

- workflow definitions
- tool registry
- template/value resolution
- run execution
- run persistence

This is the part that makes OmniToolset extensible beyond a single product.

### 3. Integrations

Third-party services live under `apps/api/src/integrations`.

Current integrations:

- `openai`
- `twilio`
- `stripe`

Each integration stays isolated so vendor-specific behavior does not leak across the codebase.

### 4. Persistence

Repositories live under `apps/api/src/db/repositories`.

Current persistence responsibilities include:

- businesses
- contacts
- conversations
- messages
- bookings
- customers
- subscriptions
- access requests
- workflow runs

## Directory Structure

```text
apps/
  api/
    src/
      app.js
      server.js
      config/
      core/
        access-requests/
        automation/
        http/
        logging/
      db/
        client.js
        index.js
        migrations/
        repositories/
      integrations/
        openai/
        stripe/
        twilio/
      modules/
        billing/
        follow_up/
        inbox/
        lead_capture/
        review_booster/
        sms_assistant/
    test/
  web/
    app/
    components/
    lib/
packages/
  shared/
    src/
      index.js
      platform.js
      products.js
legacy/
  previous stack snapshot
```

## Data Flow

### Product request flow

1. frontend calls backend API
2. router hands request to a product module or the automation core
3. module/service uses repositories + integrations
4. state is written to Postgres
5. structured JSON response returns to frontend

### Workflow run flow

1. client posts to `POST /api/automation/workflows/:workflowKey/run`
2. automation service loads a workflow definition
3. step inputs are resolved from workflow context
4. tool handlers run sequentially
5. run status, step trace, and output are stored in `workflow_runs`
6. caller receives structured run output

## Config Strategy

Environment variables are split by app:

- `apps/web/.env.example`
- `apps/api/.env.example`

### Frontend

- `NEXT_PUBLIC_APP_URL`
- `NEXT_PUBLIC_API_URL`

### Backend

- `APP_URL`
- `FRONTEND_APP_URL`
- `DATABASE_URL`
- `OPENAI_API_KEY`
- `TWILIO_*`
- `STRIPE_*`

The backend config is centralized in:

- [env.js](/Users/ozkancimenli/Desktop/projects/omnitoolset/apps/api/src/config/env.js)

## MVP Implementation

The first usable platform version ships these real pieces:

### Live product

- `SMS AI Assistant`
- inbound SMS handling
- missed-call follow-up
- AI-assisted booking replies
- onboarding + settings

### Shared automation runtime

- `GET /api/automation`
- `GET /api/automation/workflows`
- `GET /api/automation/runs`
- `POST /api/automation/workflows/:workflowKey/run`

### Initial workflows

- `text-brief`
- `product-access-intake`

### Workflow Studio

- frontend route: `/studio`
- dynamic form rendering from shared workflow metadata
- live execution against backend
- recent run history

## Setup

### 1. Install dependencies

```bash
npm install
```

### 2. Start PostgreSQL

```bash
docker run --name omnitoolset-postgres \
  -e POSTGRES_USER=postgres \
  -e POSTGRES_PASSWORD=postgres \
  -e POSTGRES_DB=omnitoolset \
  -p 5432:5432 \
  -d postgres:16
```

### 3. Copy env files

```bash
cp apps/api/.env.example apps/api/.env
cp apps/web/.env.example apps/web/.env.local
```

### 4. Run migrations

```bash
npm run db:migrate
```

### 5. Start the API

```bash
npm run dev:api
```

### 6. Start the web app

```bash
npm run dev:web
```

## Usage

### Open the platform

- frontend: `http://localhost:3000`
- studio: `http://localhost:3000/studio`
- API health: `http://localhost:4000/health`

### Run a workflow with curl

```bash
curl -X POST http://localhost:4000/api/automation/workflows/text-brief/run \
  -H "Content-Type: application/json" \
  -d '{
    "text": "Call Alex tomorrow about the invoice. Prepare a short update for the ops team.",
    "instruction": "Focus on next actions."
  }'
```

### Inspect recent workflow runs

```bash
curl http://localhost:4000/api/automation/runs
```

## Extension Pattern

The extension model is intentionally simple.

### Add a new tool

1. Add the tool handler in:
   - [tools.js](/Users/ozkancimenli/Desktop/projects/omnitoolset/apps/api/src/core/automation/tools.js)
2. Keep the handler focused on one job
3. Reuse integrations or repositories from injected services

Example shape:

```js
'custom.tool': async ({ value }) => {
  return {
    processed: value
  };
}
```

### Add a new workflow

1. Add a workflow definition in:
   - [catalog.js](/Users/ozkancimenli/Desktop/projects/omnitoolset/apps/api/src/core/automation/catalog.js)
2. Add matching shared input metadata in:
   - [platform.js](/Users/ozkancimenli/Desktop/projects/omnitoolset/packages/shared/src/platform.js)
3. The studio UI will pick it up automatically

Example shape:

```js
{
  key: 'my-workflow',
  name: 'My Workflow',
  steps: [
    {
      id: 'step-one',
      tool: 'custom.tool',
      input: {
        value: '{{input.value}}'
      }
    }
  ],
  output: {
    result: '{{steps.step-one.processed}}'
  }
}
```

## Commands

```bash
npm run dev:api
npm run dev:web
npm run db:migrate
npm run test:api
npm run build:api
npm run build:web
```

## Verification

Current verification run:

- `npm run test:api`
- `npm run build:api`
- `npm run build:web`

## Next 3 Phases

### Phase 2

- move workflow definitions into a DB-backed registry
- add authenticated operator access
- add richer run filtering and step-level inspection

### Phase 3

- add first-class connection management for external services
- support scheduled triggers and event subscriptions
- expand the workflow tool registry beyond current examples

### Phase 4

- introduce module-level permissions and workspace boundaries
- add retries, dead-letter handling, and workflow recovery
- add richer observability around integrations and workflow health
