import seedLoads from "@/data/seed-loads.json";
import { getSupabaseClient } from "./supabase";
import type { Load, LoadSearchRequest, LoadSearchResponse } from "./types";

const localLoads = seedLoads as Load[];

export function getLocalLoads() {
  return localLoads;
}

export async function getLoadById(loadId: string) {
  const localLoad = localLoads.find((load) => load.load_id === loadId);
  if (localLoad) return localLoad;

  const supabase = getSupabaseClient();
  if (!supabase) return null;

  const { data, error } = await supabase
    .from("loads")
    .select("*")
    .eq("load_id", loadId)
    .single();

  if (error || !data) return null;
  return data as Load;
}

function normalize(value?: string) {
  return value?.trim().toLowerCase() ?? "";
}

function samePickupDate(loadDateTime: string, requestedDate?: string) {
  if (!requestedDate) return true;
  return loadDateTime.slice(0, 10) === requestedDate.slice(0, 10);
}

function scoreLoad(load: Load, request: LoadSearchRequest) {
  let score = 0;
  if (request.origin && normalize(load.origin).includes(normalize(request.origin))) {
    score += 4;
  }
  if (
    request.destination &&
    normalize(load.destination).includes(normalize(request.destination))
  ) {
    score += 4;
  }
  if (
    request.equipment_type &&
    normalize(load.equipment_type) === normalize(request.equipment_type)
  ) {
    score += 3;
  }
  if (samePickupDate(load.pickup_datetime, request.pickup_date)) {
    score += 2;
  }
  return score;
}

export async function searchLoads(
  request: LoadSearchRequest,
): Promise<LoadSearchResponse> {
  const supabase = getSupabaseClient();
  let loads = localLoads;
  let source: LoadSearchResponse["source"] = "local_fallback";

  if (supabase) {
    const { data, error } = await supabase.from("loads").select("*");
    if (!error && data?.length) {
      loads = data as Load[];
      source = "supabase";
    }
  }

  const ranked = loads
    .map((load) => ({ load, score: scoreLoad(load, request) }))
    .sort(
      (a, b) => b.score - a.score || a.load.loadboard_rate - b.load.loadboard_rate,
    );

  const exactMatches = ranked.filter(({ load }) => {
    const originMatch =
      !request.origin || normalize(load.origin).includes(normalize(request.origin));
    const destinationMatch =
      !request.destination ||
      normalize(load.destination).includes(normalize(request.destination));
    const equipmentMatch =
      !request.equipment_type ||
      normalize(load.equipment_type) === normalize(request.equipment_type);
    const dateMatch = samePickupDate(load.pickup_datetime, request.pickup_date);
    return originMatch && destinationMatch && equipmentMatch && dateMatch;
  });

  const best = exactMatches[0]?.load ?? ranked[0]?.load ?? null;
  const alternatives = ranked
    .map(({ load }) => load)
    .filter((load) => load.load_id !== best?.load_id)
    .slice(0, 4);

  return {
    best_match: best,
    alternatives,
    total_matches: exactMatches.length,
    source,
  };
}
