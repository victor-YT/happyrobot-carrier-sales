# 5-Minute Demo Video Script

## 0:00-0:45 Use Case Setup

"This project automates inbound carrier sales for a freight broker. Carriers call asking for available loads. HappyRobot handles the voice conversation, while this Next.js app provides the external business API and custom operations dashboard."

Show the dashboard title, KPIs, outcome breakdown, sentiment breakdown, and recent calls.

## 0:45-1:45 Architecture

"The system has five main API capabilities: carrier verification, load search, negotiation evaluation, call logging, and metrics. Supabase stores loads and call logs when configured. For demo reliability, the app also includes deterministic MC numbers and seed loads."

Mention that all business API endpoints use `x-api-key` authentication.

## 1:45-3:15 Short Web Call Demo

Use this carrier scenario:

"Hi, this is Blue Ridge Transport. My MC is MC100001. I am looking for a dry van from Atlanta to Chicago around June 1."

Expected flow:

1. HappyRobot asks for MC number.
2. API returns eligible carrier "Blue Ridge Transport LLC".
3. HappyRobot asks for lane preference.
4. API finds `LD-1001`, Atlanta to Chicago, dry van.
5. Carrier offers `$3,350`.
6. Negotiation API counters because the offer is above the base rate but within range.
7. Carrier accepts around `$3,180`.
8. HappyRobot logs the booked call.

## 3:15-4:20 Dashboard

"The custom dashboard is built by us rather than relying on HappyRobot analytics. It shows total calls, booking rate, average margin versus initial offer, average negotiation rounds, outcome mix, sentiment mix, and recent calls."

Refresh the dashboard and point to the recent booked load and savings metric.

## 4:20-5:00 Closing Value Proposition

"The business value is faster carrier response, consistent compliance checks, controlled negotiation logic, and measurable sales operations. Brokers stay in the loop for exceptions while routine calls are handled automatically."
