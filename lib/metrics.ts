import { getSupabaseClient, isSupabaseConfigured } from "./supabase";
import type { CallLog, MetricsSummary } from "./types";

export const demoCalls: CallLog[] = [
  {
    id: "demo-call-001",
    created_at: "2026-05-29T14:22:00.000Z",
    mc_number: "MC100001",
    carrier_name: "Blue Ridge Transport LLC",
    eligible: true,
    load_id: "LD-1001",
    outcome: "booked",
    sentiment: "positive",
    initial_offer: 3350,
    agreed_rate: 3180,
    rounds: 2,
    summary: "Carrier accepted Atlanta to Chicago dry van after one counter.",
  },
  {
    id: "demo-call-002",
    created_at: "2026-05-29T13:50:00.000Z",
    mc_number: "MC100002",
    carrier_name: "Prairie Line Haulers",
    eligible: false,
    load_id: null,
    outcome: "rejected_carrier",
    sentiment: "neutral",
    initial_offer: null,
    agreed_rate: null,
    rounds: 0,
    summary: "Carrier authority inactive. Politely declined and advised to update credentials.",
  },
  {
    id: "demo-call-003",
    created_at: "2026-05-29T12:15:00.000Z",
    mc_number: "MC884210",
    carrier_name: "Redwood Freight Partners",
    eligible: true,
    load_id: "LD-1004",
    outcome: "follow_up",
    sentiment: "positive",
    initial_offer: 4200,
    agreed_rate: null,
    rounds: 3,
    summary: "Carrier close on rate for Dallas to Phoenix reefer. Needs broker approval.",
  },
  {
    id: "demo-call-004",
    created_at: "2026-05-29T11:44:00.000Z",
    mc_number: "MC100003",
    carrier_name: "Summit Crossdock Express",
    eligible: false,
    load_id: null,
    outcome: "rejected_carrier",
    sentiment: "negative",
    initial_offer: null,
    agreed_rate: null,
    rounds: 0,
    summary: "Unsatisfactory safety rating. Caller requested follow-up with compliance.",
  },
  {
    id: "demo-call-005",
    created_at: "2026-05-29T10:31:00.000Z",
    mc_number: "MC552019",
    carrier_name: "Harbor Line Logistics",
    eligible: true,
    load_id: "LD-1008",
    outcome: "booked",
    sentiment: "positive",
    initial_offer: 2900,
    agreed_rate: 2790,
    rounds: 1,
    summary: "Booked Savannah to Nashville flatbed at target plus accessorial note.",
  },
];

function breakdown(calls: CallLog[], field: "outcome" | "sentiment") {
  return calls.reduce<Record<string, number>>((acc, call) => {
    acc[call[field]] = (acc[call[field]] ?? 0) + 1;
    return acc;
  }, {});
}

export function buildMetricsSummary(calls: CallLog[]): MetricsSummary {
  const booked = calls.filter((call) => call.outcome === "booked");
  const eligible = calls.filter((call) => call.eligible);
  const agreedRates = booked
    .map((call) => call.agreed_rate)
    .filter((rate): rate is number => typeof rate === "number");
  const savings = booked
    .filter(
      (call) =>
        typeof call.initial_offer === "number" &&
        typeof call.agreed_rate === "number",
    )
    .map((call) => (call.initial_offer as number) - (call.agreed_rate as number));

  return {
    total_calls: calls.length,
    eligible_carriers: eligible.length,
    rejected_carriers: calls.filter((call) => !call.eligible).length,
    booked_loads: booked.length,
    booking_rate: calls.length ? booked.length / calls.length : 0,
    average_agreed_rate: agreedRates.length
      ? agreedRates.reduce((sum, rate) => sum + rate, 0) / agreedRates.length
      : 0,
    average_savings_vs_initial_offer: savings.length
      ? savings.reduce((sum, value) => sum + value, 0) / savings.length
      : 0,
    outcome_breakdown: breakdown(calls, "outcome"),
    sentiment_breakdown: breakdown(calls, "sentiment"),
    recent_calls: [...calls].slice(0, 8),
    follow_up_queue: calls.filter((call) =>
      ["follow_up", "escalated", "transfer"].includes(call.outcome),
    ),
  };
}

export async function getMetricsSummary() {
  if (isSupabaseConfigured()) {
    const supabase = getSupabaseClient();
    if (!supabase) {
      return { summary: buildMetricsSummary(demoCalls), source: "local_fallback" };
    }

    const { data, error } = await supabase
      .from("call_logs")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(100);

    if (!error && data) {
      return { summary: buildMetricsSummary(data as CallLog[]), source: "supabase" };
    }
  }

  return { summary: buildMetricsSummary(demoCalls), source: "local_fallback" };
}
