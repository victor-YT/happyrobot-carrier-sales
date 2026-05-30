import { apiError, parseJsonBody, serverError } from "@/lib/api";
import { validateApiKey } from "@/lib/auth";
import { searchLoads } from "@/lib/loads";
import type { LoadSearchRequest } from "@/lib/types";

export async function POST(request: Request) {
  const authError = validateApiKey(request);
  if (authError) return authError;

  try {
    const body = await parseJsonBody<LoadSearchRequest>(request);

    if (!body || typeof body !== "object") {
      return apiError(
        "invalid_request",
        "Request body must be a valid JSON object. Use an empty object to list closest available loads.",
        400,
      );
    }

    for (const field of [
      "origin",
      "destination",
      "equipment_type",
      "pickup_date",
    ] as const) {
      if (body[field] !== undefined && typeof body[field] !== "string") {
        return apiError("invalid_request", `${field} must be a string.`, 400);
      }
    }

    const result = await searchLoads(body);
    return Response.json(result);
  } catch (error) {
    return serverError(error);
  }
}
