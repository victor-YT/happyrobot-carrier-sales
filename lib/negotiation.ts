import type { Load, NegotiationResult } from "./types";

export function evaluateNegotiation(
  load: Load,
  carrierOffer: number,
  round: number,
): NegotiationResult {
  const baseRate = load.loadboard_rate;
  const finalRound = round >= 3;

  if (carrierOffer <= baseRate * 1.03) {
    return {
      decision: "accept",
      counter_offer: null,
      final_round: true,
      message: `That works. We can accept $${Math.round(carrierOffer).toLocaleString()} on load ${load.load_id}. I have the agreed rate ready for confirmation.`,
    };
  }

  if (carrierOffer <= baseRate * 1.12 && !finalRound) {
    const gap = carrierOffer - baseRate;
    const counterOffer = Math.round(baseRate + gap * 0.45);

    return {
      decision: "counter",
      counter_offer: counterOffer,
      final_round: false,
      message: `I cannot get to $${Math.round(carrierOffer).toLocaleString()}, but I can offer $${counterOffer.toLocaleString()} based on the lane and current market rate.`,
    };
  }

  return {
    decision: "reject",
    counter_offer: null,
    final_round: true,
    message:
      "Thanks for the offer, but that is above what we can approve for this load today.",
  };
}
