import { apiError, parseJsonBody, serverError } from "@/lib/api";
import { validateApiKey } from "@/lib/auth";
import { getLoadById } from "@/lib/loads";
import { evaluateNegotiation } from "@/lib/negotiation";
import type { NegotiationRequest } from "@/lib/types";

export async function POST(request: Request) {
  const authError = validateApiKey(request);
  if (authError) return authError;

  try {
    const body = await parseJsonBody<Partial<NegotiationRequest>>(request);

    if (!body) {
      return apiError("invalid_request", "Request body must be valid JSON.", 400);
    }

    if (
      !body?.load_id ||
      typeof body.load_id !== "string" ||
      typeof body.carrier_offer !== "number" ||
      !Number.isFinite(body.carrier_offer) ||
      typeof body.round !== "number" ||
      !Number.isInteger(body.round) ||
      body.round < 1 ||
      body.round > 3
    ) {
      return apiError(
        "invalid_request",
        "load_id, carrier_offer, and round are required. round must be an integer from 1 to 3.",
        400,
      );
    }

    const load = await getLoadById(body.load_id);

    if (!load) {
      return apiError(
        "load_not_found",
        `No load found for ${body.load_id}.`,
        404,
      );
    }

    return Response.json(
      evaluateNegotiation(load, body.carrier_offer, body.round),
    );
  } catch (error) {
    return serverError(error);
  }
}
