# Inbound Carrier Sales Automation

Production-style take-home project for HappyRobot Forward Deployed Engineering.

This project implements an external business API and custom operations dashboard for an inbound carrier sales workflow. HappyRobot handles the voice conversation and tool orchestration, while this app provides carrier verification, load search, rate negotiation, call logging, and operational metrics.

## Live Demo

* Dashboard: `https://happyrobot-carrier-sales-seven.vercel.app`
* API Base URL: `https://happyrobot-carrier-sales-seven.vercel.app/api`

## Architecture

* HappyRobot owns the inbound voice workflow.
* HappyRobot calls this app through authenticated tool API endpoints.
* Next.js App Router serves both the dashboard and backend API routes.
* Supabase Postgres stores available loads and completed call logs.
* FMCSA integration is used for live MC number verification when `FMCSA_API_KEY` is configured.
* Local deterministic demo data is available as a fallback for review.
* Vercel is used for cloud deployment.
* Docker is provided so reviewers can run the same app locally in a reproducible container.

## Core Workflow

1. Carrier calls into the HappyRobot voice agent.
2. The agent collects the carrier MC number.
3. The workflow calls `POST /api/carriers/verify`.
4. If the carrier is eligible, the agent collects lane and equipment details.
5. The workflow calls `POST /api/loads/search`.
6. If a load is found, the agent negotiates the rate.
7. The workflow calls `POST /api/negotiations/evaluate`.
8. At the end of the call, HappyRobot classifies and extracts the call outcome.
9. The workflow calls `POST /api/calls/log`.
10. The dashboard updates from Supabase call logs.

## Supported Outcomes

* `booked`
* `rejected_carrier`
* `no_matching_load`
* `price_not_agreed`
* `not_interested`

## Supported Sentiments

* `positive`
* `neutral`
* `negative`

## Environment Variables

Create `.env` or `.env.local`:

```bash
HAPPYROBOT_API_KEY=replace-with-a-shared-demo-secret
FMCSA_API_KEY=optional-live-fmcsa-key
NEXT_PUBLIC_SUPABASE_URL=optional-supabase-project-url
SUPABASE_SERVICE_ROLE_KEY=optional-supabase-service-role-key
```

`GET /api/health` is public.

All other API routes require:

```bash
x-api-key: $HAPPYROBOT_API_KEY
```

## Local Setup

```bash
npm install
cp .env.example .env
npm run dev
```

Open:

```bash
http://localhost:3000
```

If port `3000` is already in use, Next.js will print another local URL.

## Supabase Setup

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

Then seed demo data:

```bash
npm run seed
```

The seed script inserts demo loads and demo call logs. It is intended for review/demo setup.

## Docker

Docker is optional. It is provided for reviewers who want to run the project locally without manually managing the Node.js environment.

```bash
cp .env.example .env
docker compose up --build
```

Then open:

```bash
http://localhost:3000
```

Docker runs the same Next.js app locally. It does not replace the Vercel deployment. The Vercel deployment is used by the published HappyRobot workflow, while Docker is for local reproduction.

## Vercel Deployment

1. Import the repository into Vercel.
2. Add the environment variables listed above.
3. Deploy using the default Next.js settings.
4. Configure HappyRobot tool calls to use the deployed `/api/*` endpoints.

## API Endpoints

### Health Check

```bash
GET /api/health
```

Public endpoint for deployment checks.

### Carrier Verification

```bash
POST /api/carriers/verify
```

Example:

```bash
curl -X POST https://happyrobot-carrier-sales-seven.vercel.app/api/carriers/verify \
  -H "content-type: application/json" \
  -H "x-api-key: replace-with-a-shared-demo-secret" \
  -d '{"mc_number":"MC135797"}'
```

Example response:

```json
{
  "eligible": true,
  "carrier_name": "J B HUNT TRANSPORT INC",
  "mc_number": "MC135797",
  "authority_status": "Active",
  "safety_rating": "S"
}
```

### Load Search

```bash
POST /api/loads/search
```

Example:

```bash
curl -X POST https://happyrobot-carrier-sales-seven.vercel.app/api/loads/search \
  -H "content-type: application/json" \
  -H "x-api-key: replace-with-a-shared-demo-secret" \
  -d '{"origin":"New York","destination":"Washington","equipment_type":"Dry Van","pickup_date":"2026-06-07"}'
```

### Negotiation Evaluation

```bash
POST /api/negotiations/evaluate
```

Example:

```bash
curl -X POST https://happyrobot-carrier-sales-seven.vercel.app/api/negotiations/evaluate \
  -H "content-type: application/json" \
  -H "x-api-key: replace-with-a-shared-demo-secret" \
  -d '{"load_id":"LD-1013","carrier_offer":1900,"round":1}'
```

### Call Logging

```bash
POST /api/calls/log
```

HappyRobot calls this endpoint after the call outcome and call details are extracted.

### Metrics Summary

```bash
GET /api/metrics/summary
```

Returns dashboard metrics derived from call logs.

## Dashboard

The dashboard shows:

* inbound call count
* booking rate
* average negotiated savings
* average negotiation rounds
* outcome breakdown
* carrier sentiment
* latest call logs

All KPI cards, charts, and latest calls are derived from the same `call_logs` source. Charts use all loaded call logs. The latest calls table shows the most recent eight.

## Demo Script

A successful booked-call demo can use:

```text
Hi, this is J B Hunt Transport.

My MC number is MC135797.

I am looking for a dry van load from New York to Washington DC.

Can you do nineteen hundred?

If you can do eighteen fifty, that works for me.

Yes, I accept eighteen fifty.

Please book it.

Thank you.
```

Expected result:

* carrier is verified through FMCSA-backed MC lookup
* New York to Washington dry van load is found
* negotiation returns a counter offer
* call outcome is logged as `booked`
* dashboard updates with the new call

## Demo Scenarios Tested

* `booked`: eligible carrier, matching load, final rate accepted
* `rejected_carrier`: carrier verification failed
* `no_matching_load`: eligible carrier, but no matching load found
* `price_not_agreed`: load found, but final rate was not accepted
* `not_interested`: carrier declined the load

## Notes

* FMCSA live verification requires `FMCSA_API_KEY`.
* Supabase persistence requires `NEXT_PUBLIC_SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY`.
* Without Supabase, local fallback data keeps the dashboard reviewable.
* The HappyRobot workflow itself is configured in the HappyRobot platform and calls the deployed API endpoints.
