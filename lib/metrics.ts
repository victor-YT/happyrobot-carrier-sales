import seedCallLogs from "@/data/seed-call-logs.json";
import { getSupabaseClient, isSupabaseConfigured } from "./supabase";
import type { CallLog, MetricsSummary } from "./types";

export const demoCalls = seedCallLogs as CallLog[];

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
  const bookedWithSavings = booked.filter(
      (call) =>
        typeof call.initial_offer === "number" &&
        typeof call.agreed_rate === "number",
    );
  const savings = bookedWithSavings.map(
    (call) => (call.initial_offer as number) - (call.agreed_rate as number),
  );
  const negotiatedRounds = calls
    .map((call) => call.rounds)
    .filter((rounds) => Number.isFinite(rounds) && rounds > 0);

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
    average_negotiation_rounds: negotiatedRounds.length
      ? negotiatedRounds.reduce((sum, rounds) => sum + rounds, 0) /
        negotiatedRounds.length
      : 0,
    booked_with_savings: bookedWithSavings.length,
    negotiated_calls: negotiatedRounds.length,
    outcome_breakdown: breakdown(calls, "outcome"),
    sentiment_breakdown: breakdown(calls, "sentiment"),
    recent_calls: [...calls].slice(0, 8),
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
      .order("created_at", { ascending: false });

    if (!error && data) {
      return { summary: buildMetricsSummary(data as CallLog[]), source: "supabase" };
    }
  }

  return { summary: buildMetricsSummary(demoCalls), source: "local_fallback" };
}
