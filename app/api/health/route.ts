export async function GET() {
  return Response.json({
    ok: true,
    service: "happyrobot-carrier-sales",
    timestamp: new Date().toISOString(),
  });
}
