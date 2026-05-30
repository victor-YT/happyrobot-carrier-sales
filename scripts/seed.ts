import { loadEnvConfig } from "@next/env";
import { createClient } from "@supabase/supabase-js";
import demoCallLogs from "../data/seed-call-logs.json";
import loads from "../data/seed-loads.json";
import type { CallLog } from "../lib/types";

loadEnvConfig(process.cwd());

const callLogs = demoCallLogs as CallLog[];

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

  const { error: deleteCallLogsError } = await supabase
    .from("call_logs")
    .delete()
    .not("id", "is", null);

  if (deleteCallLogsError) {
    throw new Error(
      `${deleteCallLogsError.message}. Confirm the call_logs table exists and SUPABASE_SERVICE_ROLE_KEY can delete rows.`,
    );
  }

  const { error: insertCallLogsError } = await supabase
    .from("call_logs")
    .insert(callLogs);

  if (insertCallLogsError) {
    throw new Error(
      `${insertCallLogsError.message}. Confirm the call_logs table schema matches README.md and SUPABASE_SERVICE_ROLE_KEY can insert rows.`,
    );
  }

  console.log(`Seeded ${loads.length} loads and ${callLogs.length} demo call logs.`);
}

main().catch((error: unknown) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
