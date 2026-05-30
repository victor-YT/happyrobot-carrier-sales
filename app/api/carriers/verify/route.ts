import { apiError, parseJsonBody, serverError } from "@/lib/api";
import { validateApiKey } from "@/lib/auth";
import { verifyCarrier } from "@/lib/fmcsa";

export async function POST(request: Request) {
  const authError = validateApiKey(request);
  if (authError) return authError;

  try {
    const body = await parseJsonBody<{ mc_number?: unknown }>(request);

    if (!body) {
      return apiError("invalid_request", "Request body must be valid JSON.", 400);
    }

    if (typeof body.mc_number !== "string" || !body.mc_number.trim()) {
      return apiError("invalid_request", "mc_number is required.", 400);
    }

    const result = await verifyCarrier(body.mc_number);
    return Response.json(result);
  } catch (error) {
    return serverError(error);
  }
}
