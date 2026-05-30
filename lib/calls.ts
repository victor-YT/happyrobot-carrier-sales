import { getSupabaseClient, isSupabaseConfigured } from "./supabase";
import type { CallLog } from "./types";

export type CallLogInput = Partial<CallLog>;

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
  if (!body.outcome || typeof body.outcome !== "string") {
    return "outcome is required.";
  }
  if (!body.sentiment || typeof body.sentiment !== "string") {
    return "sentiment is required.";
  }
  if (body.rounds !== undefined && typeof body.rounds !== "number") {
    return "rounds must be a number when provided.";
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
    outcome: body.outcome as string,
    sentiment: body.sentiment as string,
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
