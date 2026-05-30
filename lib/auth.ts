import { NextResponse } from "next/server";
import { apiError } from "./api";

export function validateApiKey(request: Request): NextResponse | null {
  const expected = process.env.HAPPYROBOT_API_KEY;
  const provided = request.headers.get("x-api-key");

  if (!provided) {
    return apiError("missing_api_key", "Missing required x-api-key header.", 401);
  }

  if (!expected) {
    return apiError(
      "api_key_not_configured",
      "Server is missing HAPPYROBOT_API_KEY.",
      500,
    );
  }

  if (provided !== expected) {
    return apiError("invalid_api_key", "Invalid x-api-key header.", 403);
  }

  return null;
}
