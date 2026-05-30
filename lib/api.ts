import { NextResponse } from "next/server";

export type ApiErrorCode =
  | "api_key_not_configured"
  | "invalid_api_key"
  | "invalid_request"
  | "load_not_found"
  | "method_not_allowed"
  | "missing_api_key"
  | "persistence_failed"
  | "server_error"
  | "supabase_not_configured";

export function apiError(
  code: ApiErrorCode,
  message: string,
  status: number,
  details?: Record<string, unknown>,
) {
  return NextResponse.json(
    {
      success: false,
      error: {
        code,
        message,
        ...(details ? { details } : {}),
      },
    },
    { status },
  );
}

export async function parseJsonBody<T>(request: Request) {
  try {
    return (await request.json()) as T;
  } catch {
    return null;
  }
}

export function serverError(error: unknown) {
  console.error(error);
  return apiError(
    "server_error",
    "Unexpected server error. Please retry or contact operations.",
    500,
  );
}
