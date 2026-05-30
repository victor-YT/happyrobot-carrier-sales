export type Load = {
  load_id: string;
  origin: string;
  destination: string;
  pickup_datetime: string;
  delivery_datetime: string;
  equipment_type: string;
  loadboard_rate: number;
  notes: string;
  weight: number;
  commodity_type: string;
  num_of_pieces: number;
  miles: number;
  dimensions: string;
};

export type CarrierVerificationResult = {
  eligible: boolean;
  carrier_name: string;
  mc_number: string;
  authority_status: string;
  safety_rating: string;
  reason?: string;
};

export type LoadSearchRequest = {
  origin?: string;
  destination?: string;
  equipment_type?: string;
  pickup_date?: string;
};

export type LoadSearchResponse = {
  best_match: Load | null;
  alternatives: Load[];
  total_matches: number;
  source: "supabase" | "local_fallback";
};

export type NegotiationRequest = {
  load_id: string;
  carrier_offer: number;
  round: number;
};

export type NegotiationResult = {
  decision: "accept" | "counter" | "reject" | "escalate";
  counter_offer: number | null;
  final_round: boolean;
  message: string;
};

export type CallLog = {
  id: string;
  created_at: string;
  mc_number: string;
  carrier_name: string;
  eligible: boolean;
  load_id: string | null;
  outcome: string;
  sentiment: string;
  initial_offer: number | null;
  agreed_rate: number | null;
  rounds: number;
  summary: string;
};

export type MetricsSummary = {
  total_calls: number;
  eligible_carriers: number;
  rejected_carriers: number;
  booked_loads: number;
  booking_rate: number;
  average_agreed_rate: number;
  average_savings_vs_initial_offer: number;
  average_negotiation_rounds: number;
  outcome_breakdown: Record<string, number>;
  sentiment_breakdown: Record<string, number>;
  recent_calls: CallLog[];
  follow_up_queue: CallLog[];
};
