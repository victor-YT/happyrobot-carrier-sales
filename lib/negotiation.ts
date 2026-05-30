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
      message: `That works. We can accept $${Math.round(carrierOffer).toLocaleString()} on load ${load.load_id}. I will connect you with a broker to finalize the rate confirmation.`,
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

  if (carrierOffer <= baseRate * 1.12 && finalRound) {
    return {
      decision: "escalate",
      counter_offer: null,
      final_round: true,
      message:
        "Your offer is close to our target, but I need a broker to approve it. I will transfer you now.",
    };
  }

  return {
    decision: finalRound ? "reject" : "escalate",
    counter_offer: null,
    final_round: true,
    message:
      finalRound || carrierOffer > baseRate * 1.2
        ? "Thanks for the offer, but that is above what we can approve for this load today."
        : "That offer is above my automated approval range, so I will transfer you to a broker for review.",
  };
}
