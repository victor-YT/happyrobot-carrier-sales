# Client Build Description: Acme Logistics

## Business Problem

Acme Logistics receives repetitive inbound carrier calls asking for available freight. Brokers spend time checking authority, searching loads, quoting rates, negotiating, and documenting call outcomes. The process is slow, inconsistent, and hard to measure across teams.

## Proposed Solution

This build pairs a HappyRobot voice workflow with a custom Next.js business API and dashboard. HappyRobot handles the live call experience while the API supplies business decisions: carrier verification, load matching, negotiation guidance, call logging, and operational metrics. Demo fallbacks are included so the system remains reliable without live FMCSA or Supabase credentials.

## Workflow

1. Carrier calls the HappyRobot number.
2. The workflow asks for the carrier MC number.
3. The API verifies authority and safety status.
4. Eligible carriers provide lane and equipment preferences.
5. The API searches Acme's load data and returns the best viable load.
6. HappyRobot pitches the load and handles accept or counter-offer responses.
7. The negotiation API evaluates up to three rounds.
8. The workflow logs outcome, sentiment, offers, and summary.
9. Operations leaders review metrics in the custom dashboard.

## Architecture

- Next.js App Router for dashboard and route handlers.
- Supabase Postgres for loads and call logs.
- FMCSA integration when `FMCSA_API_KEY` is configured.
- Deterministic fallback carrier records and seed loads for demos and resilience.
- Vercel deployment for the web app and API.
- Docker for local reproducibility.

## Metrics

The dashboard reports total calls, eligible and rejected carriers, booked loads, booking rate, average agreed rate, average savings versus initial offer, outcome mix, sentiment mix, recent calls, and human follow-up queue.

## Security

All HappyRobot business endpoints require an `x-api-key` header matching `HAPPYROBOT_API_KEY`. Validation and authentication failures return structured JSON errors. The Supabase service role key is used only server-side. Public access is limited to `GET /api/health`.

## Deployment

The app can run locally with Docker Compose, deploy to Vercel, and connect to Supabase via environment variables. In a production rollout, Acme would run the included SQL, seed initial loads, and configure HappyRobot tool calls against the deployed API base URL.

## Limitations

The FMCSA response normalization is intentionally conservative and depends on available API fields. The negotiation policy is rule-based and should be calibrated against Acme's actual margin targets, lane volatility, and customer commitments. The fallback metrics are demo data, not a substitute for persisted call logs.

## Future Improvements

- Add customer-specific margin floors by lane and shipper.
- Add fraud and insurance validation beyond FMCSA authority.
- Add broker override workflows for high-value loads.
- Add webhook retries and idempotency keys for call logging.
- Add role-based dashboard access for operations managers.
