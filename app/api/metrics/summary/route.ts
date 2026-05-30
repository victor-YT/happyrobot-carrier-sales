import { serverError } from "@/lib/api";
import { validateApiKey } from "@/lib/auth";
import { getMetricsSummary } from "@/lib/metrics";

export async function GET(request: Request) {
  const authError = validateApiKey(request);
  if (authError) return authError;

  try {
    const result = await getMetricsSummary();
    return Response.json(result);
  } catch (error) {
    return serverError(error);
  }
}
