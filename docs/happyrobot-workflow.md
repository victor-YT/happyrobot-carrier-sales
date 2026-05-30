# HappyRobot Workflow Configuration

## 1. Web Call Trigger

Create a HappyRobot web call trigger for inbound carrier sales. Set the opening prompt to identify the brokerage and explain that the assistant can check available loads.

## 2. Ask for MC Number

Ask: "What is your MC number?"

Normalize the spoken value into a string such as `MC100001`.

## 3. Verify Carrier

Call:

```http
POST /api/carriers/verify
x-api-key: {{HAPPYROBOT_API_KEY}}
content-type: application/json
```

```json
{ "mc_number": "{{mc_number}}" }
```

If `eligible` is false, explain the `reason`, classify outcome as `rejected_carrier`, classify sentiment, and call `/api/calls/log`.

If the API returns `success: false`, read the `error.message` internally for workflow handling and transfer to a broker if the call cannot continue.

## 4. Ask for Lane Preference

For eligible carriers, ask for origin, destination, pickup date, and equipment type. Confirm the values before searching.

## 5. Search Loads

Call:

```http
POST /api/loads/search
x-api-key: {{HAPPYROBOT_API_KEY}}
content-type: application/json
```

```json
{
  "origin": "{{origin}}",
  "destination": "{{destination}}",
  "equipment_type": "{{equipment_type}}",
  "pickup_date": "{{pickup_date}}"
}
```

If `best_match` is null, offer the closest alternatives or classify outcome as `no_load_match`.

Malformed request bodies or missing API keys return structured JSON errors. These should be treated as workflow configuration issues, not carrier-facing failures.

## 6. Pitch Load

Pitch the best load with lane, pickup, delivery, commodity, equipment, weight, miles, and target rate. Ask whether the carrier accepts or has a counter offer.

## 7. Handle Accept or Counter Offer

If the carrier accepts the presented rate, classify outcome as `booked`, set `agreed_rate`, mock transfer to a broker, and log the call.

If the carrier counters, extract the numeric offer and current round.

## 8. Evaluate Negotiation

Call:

```http
POST /api/negotiations/evaluate
x-api-key: {{HAPPYROBOT_API_KEY}}
content-type: application/json
```

```json
{
  "load_id": "{{load_id}}",
  "carrier_offer": {{carrier_offer}},
  "round": {{round}}
}
```

## 9. Max 3 Rounds

Use the returned `decision`:

- `accept`: confirm booking and mock transfer.
- `counter`: present `counter_offer` and continue.
- `escalate`: mock transfer to a human broker and classify as `follow_up`.
- `reject`: politely decline and classify as `rate_rejected`.

Stop automated negotiation after three rounds.

## 10. Mock Transfer After Agreement

After agreement, say: "Great, I have that noted. I am transferring you to a broker to finalize the rate confirmation." The demo does not need a real transfer target.

## 11. Extract Offer Data

Capture `initial_offer`, `agreed_rate`, `rounds`, and `load_id` as structured variables.

## 12. Classify Outcome and Sentiment

Outcome examples: `booked`, `rejected_carrier`, `rate_rejected`, `no_load_match`, `follow_up`.

Sentiment examples: `positive`, `neutral`, `negative`.

## 13. Log Call

Call:

```http
POST /api/calls/log
x-api-key: {{HAPPYROBOT_API_KEY}}
content-type: application/json
```

```json
{
  "mc_number": "{{mc_number}}",
  "carrier_name": "{{carrier_name}}",
  "eligible": {{eligible}},
  "load_id": "{{load_id}}",
  "outcome": "{{outcome}}",
  "sentiment": "{{sentiment}}",
  "initial_offer": {{initial_offer}},
  "agreed_rate": {{agreed_rate}},
  "rounds": {{rounds}},
  "summary": "{{call_summary}}"
}
```
