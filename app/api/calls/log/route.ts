import { apiError, parseJsonBody, serverError } from "@/lib/api";
import { validateApiKey } from "@/lib/auth";
import { logCall, validateCallLogInput, type CallLogInput } from "@/lib/calls";

export async function POST(request: Request) {
  const authError = validateApiKey(request);
  if (authError) return authError;

  try {
    const body = await parseJsonBody<CallLogInput>(request);

    if (!body) {
      return apiError("invalid_request", "Request body must be valid JSON.", 400);
    }

    const validationError = validateCallLogInput(body);

    if (validationError) {
      return apiError("invalid_request", validationError, 400);
    }

    const result = await logCall(body);
    return Response.json(result, { status: result.persisted ? 200 : 202 });
  } catch (error) {
    if (error instanceof Error && error.message === "Call log persistence failed.") {
      return apiError(
        "persistence_failed",
        "Call log could not be persisted. Please retry.",
        500,
      );
    }
    return serverError(error);
  }
}
