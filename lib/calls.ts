import { getSupabaseClient, isSupabaseConfigured } from "./supabase";
import type { CallLog, CallOutcome, CallSentiment } from "./types";

export type CallLogInput = Partial<CallLog>;

const supportedOutcomes: CallOutcome[] = [
  "booked",
  "rejected_carrier",
  "no_matching_load",
  "price_not_agreed",
  "not_interested",
];
const supportedSentiments: CallSentiment[] = ["positive", "neutral", "negative"];

export type LogCallResult =
  | {
      persisted: true;
      call_log: CallLog;
    }
  | {
      persisted: false;
      message: string;
      call_log: CallLog;
    };

export function validateCallLogInput(body: CallLogInput | null) {
  if (!body?.mc_number || typeof body.mc_number !== "string") {
    return "mc_number is required.";
  }
  if (!body.carrier_name || typeof body.carrier_name !== "string") {
    return "carrier_name is required.";
  }
  if (body.eligible !== undefined && typeof body.eligible !== "boolean") {
    return "eligible must be a boolean when provided.";
  }
  if (body.load_id !== undefined && body.load_id !== null && typeof body.load_id !== "string") {
    return "load_id must be a string or null when provided.";
  }
  if (!body.outcome || typeof body.outcome !== "string") {
    return "outcome is required.";
  }
  if (!supportedOutcomes.includes(body.outcome as CallOutcome)) {
    return `outcome must be one of: ${supportedOutcomes.join(", ")}.`;
  }
  if (!body.sentiment || typeof body.sentiment !== "string") {
    return "sentiment is required.";
  }
  if (!supportedSentiments.includes(body.sentiment as CallSentiment)) {
    return `sentiment must be one of: ${supportedSentiments.join(", ")}.`;
  }
  if (body.rounds !== undefined && typeof body.rounds !== "number") {
    return "rounds must be a number when provided.";
  }
  if (
    body.rounds !== undefined &&
    (!Number.isInteger(body.rounds) || body.rounds < 0 || body.rounds > 3)
  ) {
    return "rounds must be an integer from 0 to 3.";
  }
  if (
    body.initial_offer !== undefined &&
    body.initial_offer !== null &&
    (typeof body.initial_offer !== "number" || !Number.isFinite(body.initial_offer))
  ) {
    return "initial_offer must be a finite number or null when provided.";
  }
  if (
    body.agreed_rate !== undefined &&
    body.agreed_rate !== null &&
    (typeof body.agreed_rate !== "number" || !Number.isFinite(body.agreed_rate))
  ) {
    return "agreed_rate must be a finite number or null when provided.";
  }
  if (body.summary !== undefined && typeof body.summary !== "string") {
    return "summary must be a string when provided.";
  }
  return null;
}

export async function logCall(body: CallLogInput): Promise<LogCallResult> {
  const callLog: CallLog = {
    id: crypto.randomUUID(),
    created_at: new Date().toISOString(),
    mc_number: body.mc_number as string,
    carrier_name: body.carrier_name as string,
    eligible: Boolean(body.eligible),
    load_id: body.load_id ?? null,
    outcome: body.outcome as CallOutcome,
    sentiment: body.sentiment as CallSentiment,
    initial_offer: body.initial_offer ?? null,
    agreed_rate: body.agreed_rate ?? null,
    rounds: body.rounds ?? 0,
    summary: body.summary ?? "",
  };

  if (!isSupabaseConfigured()) {
    return {
      persisted: false,
      message:
        "Call log accepted but not persisted. Configure NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY to enable persistence.",
      call_log: callLog,
    };
  }

  const supabase = getSupabaseClient();
  if (!supabase) {
    throw new Error("Supabase client could not be initialized.");
  }

  const { data, error } = await supabase
    .from("call_logs")
    .insert({
      mc_number: callLog.mc_number,
      carrier_name: callLog.carrier_name,
      eligible: callLog.eligible,
      load_id: callLog.load_id,
      outcome: callLog.outcome,
      sentiment: callLog.sentiment,
      initial_offer: callLog.initial_offer,
      agreed_rate: callLog.agreed_rate,
      rounds: callLog.rounds,
      summary: callLog.summary,
    })
    .select("*")
    .single();

  if (error) {
    console.error(error);
    throw new Error("Call log persistence failed.");
  }

  return { persisted: true, call_log: data as CallLog };
}
