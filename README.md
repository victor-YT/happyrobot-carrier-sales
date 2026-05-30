# Inbound Carrier Sales Automation

Production-style take-home project for HappyRobot Forward Deployed Engineering. The app provides the external business API and custom dashboard for an inbound carrier sales workflow: verify carriers, search available loads, evaluate rate negotiation, log call outcomes, and report operational metrics.

## Architecture

- HappyRobot owns the voice workflow and calls this app as an authenticated tool API.
- Next.js App Router serves both the dashboard and API route handlers.
- Supabase Postgres stores loads and call logs when configured.
- Deterministic local demo data keeps the app reviewable without external services.
- Docker and Vercel are supported for reproducible deployment.

## Local Setup

```bash
npm install
cp .env.example .env
npm run dev
```

Open `http://localhost:3000`. If that port is already in use, Next.js will print the alternate local URL.

## Environment Variables

```bash
HAPPYROBOT_API_KEY=replace-with-a-shared-demo-secret
FMCSA_API_KEY=optional-live-fmcsa-key
NEXT_PUBLIC_SUPABASE_URL=optional-supabase-project-url
SUPABASE_SERVICE_ROLE_KEY=optional-supabase-service-role-key
```

`GET /api/health` is public. All other endpoints require:

```bash
x-api-key: $HAPPYROBOT_API_KEY
```

Authentication and validation errors return a consistent JSON shape:

```json
{
  "success": false,
  "error": {
    "code": "invalid_request",
    "message": "mc_number is required."
  }
}
```

## Supabase SQL

Run this SQL in Supabase before seeding.

```sql
create table if not exists loads (
  load_id text primary key,
  origin text not null,
  destination text not null,
  pickup_datetime timestamptz not null,
  delivery_datetime timestamptz not null,
  equipment_type text not null,
  loadboard_rate numeric not null,
  notes text not null,
  weight integer not null,
  commodity_type text not null,
  num_of_pieces integer not null,
  miles integer not null,
  dimensions text not null
);

create table if not exists call_logs (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  mc_number text not null,
  carrier_name text not null,
  eligible boolean not null,
  load_id text,
  outcome text not null check (
    outcome in (
      'booked',
      'rejected_carrier',
      'no_matching_load',
      'price_not_agreed',
      'not_interested'
    )
  ),
  sentiment text not null check (sentiment in ('positive', 'neutral', 'negative')),
  initial_offer numeric,
  agreed_rate numeric,
  rounds integer not null default 0,
  summary text not null
);
```

## Seed Instructions

After configuring Supabase:

```bash
npm run seed
```

Without Supabase, the app uses `data/seed-loads.json` and `data/seed-call-logs.json`.

## Docker

```bash
cp .env.example .env
docker compose up --build
```

The app runs on `http://localhost:3000`.

## Vercel Deployment

1. Import the repository into Vercel.
2. Add the environment variables above.
3. Deploy with the default Next.js settings.
4. Configure HappyRobot tool calls to the deployed `/api/*` endpoints.

## HappyRobot Integration Endpoints

- `POST /api/carriers/verify`
- `POST /api/loads/search`
- `POST /api/negotiations/evaluate`
- `POST /api/calls/log`
- `GET /api/metrics/summary`

Example carrier verification:

```bash
curl -X POST http://localhost:3000/api/carriers/verify \
  -H "content-type: application/json" \
  -H "x-api-key: replace-with-a-shared-demo-secret" \
  -d '{"mc_number":"MC100001"}'
```

Example load search:

```bash
curl -X POST http://localhost:3000/api/loads/search \
  -H "content-type: application/json" \
  -H "x-api-key: replace-with-a-shared-demo-secret" \
  -d '{"origin":"Atlanta","destination":"Chicago","equipment_type":"Dry Van","pickup_date":"2026-06-01"}'
```

Example negotiation:

```bash
curl -X POST http://localhost:3000/api/negotiations/evaluate \
  -H "content-type: application/json" \
  -H "x-api-key: replace-with-a-shared-demo-secret" \
  -d '{"load_id":"LD-1001","carrier_offer":3350,"round":1}'
```

Call logging persists to Supabase when configured. Without Supabase, the endpoint returns `202` with the normalized call log and a clear non-persistence message so demos do not fail.

Supported call outcomes are:

- `booked`
- `rejected_carrier`
- `no_matching_load`
- `price_not_agreed`
- `not_interested`

Supported sentiments are `positive`, `neutral`, and `negative`.

The dashboard derives KPI cards, outcome breakdown, carrier sentiment, and recent calls from the same `call_logs` source. KPI cards and charts are calculated from all loaded call logs; the recent calls table shows the latest eight.

## Demo MC Numbers

- `MC100001`: eligible, Blue Ridge Transport LLC
- `MC100002`: not eligible, inactive authority
- `MC100003`: not eligible, unsatisfactory safety rating

## Demo Call Script

Carrier says: "Hi, this is Blue Ridge Transport, MC100001. Looking for a dry van from Atlanta to Chicago next week."

Workflow verifies the carrier, searches loads, pitches `LD-1001`, receives an initial offer of `$3,350`, counters once, and books around `$3,180`. The dashboard then shows the booked outcome, savings versus initial offer, and recent call summary.
