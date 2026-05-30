import { loadEnvConfig } from "@next/env";
import { createClient } from "@supabase/supabase-js";
import loads from "../data/seed-loads.json";
import type { CallLog } from "../lib/types";

loadEnvConfig(process.cwd());

const demoCallLogs: CallLog[] = [
  {
    id: "00000000-0000-4000-8000-000000000001",
    created_at: "2026-05-30T13:45:00.000Z",
    mc_number: "MC100001",
    carrier_name: "Blue Ridge Transport LLC",
    eligible: true,
    load_id: "LD-1001",
    outcome: "booked",
    sentiment: "positive",
    initial_offer: 3350,
    agreed_rate: 3180,
    rounds: 2,
    summary: "Booked Atlanta to Chicago dry van after one counter near target.",
  },
  {
    id: "00000000-0000-4000-8000-000000000002",
    created_at: "2026-05-30T13:05:00.000Z",
    mc_number: "MC100002",
    carrier_name: "Prairie Line Haulers",
    eligible: false,
    load_id: null,
    outcome: "rejected_carrier",
    sentiment: "neutral",
    initial_offer: null,
    agreed_rate: null,
    rounds: 0,
    summary: "Inactive authority found during verification. Carrier advised to update credentials.",
  },
  {
    id: "00000000-0000-4000-8000-000000000003",
    created_at: "2026-05-30T12:40:00.000Z",
    mc_number: "MC100003",
    carrier_name: "Summit Crossdock Express",
    eligible: false,
    load_id: null,
    outcome: "rejected_carrier",
    sentiment: "negative",
    initial_offer: null,
    agreed_rate: null,
    rounds: 0,
    summary: "Unsatisfactory safety rating. Caller requested compliance escalation.",
  },
  {
    id: "00000000-0000-4000-8000-000000000004",
    created_at: "2026-05-30T12:10:00.000Z",
    mc_number: "MC884210",
    carrier_name: "Redwood Freight Partners",
    eligible: true,
    load_id: "LD-1004",
    outcome: "follow_up",
    sentiment: "positive",
    initial_offer: 4200,
    agreed_rate: null,
    rounds: 3,
    summary: "Carrier close on Dallas to Phoenix reefer. Broker approval needed after final round.",
  },
  {
    id: "00000000-0000-4000-8000-000000000005",
    created_at: "2026-05-30T11:35:00.000Z",
    mc_number: "MC552019",
    carrier_name: "Harbor Line Logistics",
    eligible: true,
    load_id: "LD-1008",
    outcome: "booked",
    sentiment: "positive",
    initial_offer: 2900,
    agreed_rate: 2790,
    rounds: 1,
    summary: "Booked Savannah to Nashville flatbed with port pickup note confirmed.",
  },
  {
    id: "00000000-0000-4000-8000-000000000006",
    created_at: "2026-05-30T11:00:00.000Z",
    mc_number: "MC719204",
    carrier_name: "Northstar Reefer Group",
    eligible: true,
    load_id: "LD-1009",
    outcome: "price_not_agreed",
    sentiment: "neutral",
    initial_offer: 5200,
    agreed_rate: null,
    rounds: 3,
    summary: "Fresno to Seattle reefer offer remained above automated threshold after three rounds.",
  },
  {
    id: "00000000-0000-4000-8000-000000000007",
    created_at: "2026-05-30T10:20:00.000Z",
    mc_number: "MC663018",
    carrier_name: "Great Lakes Cartage",
    eligible: true,
    load_id: null,
    outcome: "no_matching_load",
    sentiment: "neutral",
    initial_offer: null,
    agreed_rate: null,
    rounds: 0,
    summary: "Carrier requested Detroit to Miami flatbed. No viable matching load available.",
  },
  {
    id: "00000000-0000-4000-8000-000000000008",
    created_at: "2026-05-30T09:55:00.000Z",
    mc_number: "MC440112",
    carrier_name: "Canyon State Freight",
    eligible: true,
    load_id: "LD-1002",
    outcome: "not_interested",
    sentiment: "negative",
    initial_offer: 2300,
    agreed_rate: null,
    rounds: 1,
    summary: "Carrier declined Los Angeles to Phoenix dry van after learning delivery appointment was strict.",
  },
  {
    id: "00000000-0000-4000-8000-000000000009",
    created_at: "2026-05-30T09:15:00.000Z",
    mc_number: "MC238771",
    carrier_name: "Midwest Prime Carriers",
    eligible: true,
    load_id: "LD-1011",
    outcome: "booked",
    sentiment: "positive",
    initial_offer: 2550,
    agreed_rate: 2475,
    rounds: 1,
    summary: "Booked Minneapolis to St. Louis dry van with lumper terms acknowledged.",
  },
  {
    id: "00000000-0000-4000-8000-000000000010",
    created_at: "2026-05-30T08:40:00.000Z",
    mc_number: "MC901337",
    carrier_name: "Atlantic Fresh Logistics",
    eligible: true,
    load_id: "LD-1012",
    outcome: "follow_up",
    sentiment: "neutral",
    initial_offer: 3700,
    agreed_rate: null,
    rounds: 3,
    summary: "Miami to Atlanta reefer requires broker review due to weekend delivery request.",
  },
];

function decodeJwtPayload(key: string) {
  const [, payload] = key.split(".");
  if (!payload) return null;

  try {
    const normalizedPayload = payload
      .replace(/-/g, "+")
      .replace(/_/g, "/")
      .padEnd(Math.ceil(payload.length / 4) * 4, "=");
    return JSON.parse(Buffer.from(normalizedPayload, "base64").toString("utf8")) as {
      role?: string;
    };
  } catch {
    return null;
  }
}

function assertServerWriteKey(serviceRoleKey: string) {
  if (serviceRoleKey.startsWith("sb_publishable_")) {
    throw new Error(
      "SUPABASE_SERVICE_ROLE_KEY is set to a publishable key. Use the Supabase service_role key or server secret key for seeding.",
    );
  }

  const payload = decodeJwtPayload(serviceRoleKey);
  if (payload?.role && payload.role !== "service_role") {
    throw new Error(
      `SUPABASE_SERVICE_ROLE_KEY has JWT role "${payload.role}". Use the Supabase service_role key for seeding.`,
    );
  }
}

async function main() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !serviceRoleKey) {
    throw new Error(
      "Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY. Copy .env.example to .env.local and fill in Supabase values.",
    );
  }

  assertServerWriteKey(serviceRoleKey);

  const supabase = createClient(supabaseUrl, serviceRoleKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  const { error } = await supabase.from("loads").upsert(loads, {
    onConflict: "load_id",
  });

  if (error) {
    throw new Error(
      `${error.message}. Confirm SUPABASE_SERVICE_ROLE_KEY is the service_role key, not the anon or publishable key, and that the loads table exists.`,
    );
  }

  const demoIds = demoCallLogs.map((callLog) => callLog.id);
  const { error: deleteCallLogsError } = await supabase
    .from("call_logs")
    .delete()
    .in("id", demoIds);

  if (deleteCallLogsError) {
    throw new Error(
      `${deleteCallLogsError.message}. Confirm the call_logs table exists and SUPABASE_SERVICE_ROLE_KEY can delete demo rows.`,
    );
  }

  const { error: insertCallLogsError } = await supabase
    .from("call_logs")
    .insert(demoCallLogs);

  if (insertCallLogsError) {
    throw new Error(
      `${insertCallLogsError.message}. Confirm the call_logs table schema matches README.md and SUPABASE_SERVICE_ROLE_KEY can insert rows.`,
    );
  }

  console.log(`Seeded ${loads.length} loads and ${demoCallLogs.length} demo call logs.`);
}

main().catch((error: unknown) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
