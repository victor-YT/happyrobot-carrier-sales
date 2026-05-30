import { StatusBadge } from "./dashboard";

const endpoints = [
  { name: "Carrier Verification API", access: "Secured" },
  { name: "Load Search API", access: "Secured" },
  { name: "Negotiation API", access: "Secured" },
  { name: "Call Logging API", access: "Secured" },
  { name: "Metrics API", access: "Secured" },
];

export function IntegrationStatus() {
  return (
    <section className="rounded-xl border border-white/10 bg-white/[0.04] p-4 shadow-sm">
      <h2 className="text-sm font-semibold text-white">Integration Status</h2>
      <div className="mt-3 grid gap-1.5 sm:grid-cols-2 lg:grid-cols-1">
        {endpoints.map((endpoint) => (
          <div
            key={endpoint.name}
            className="flex items-center justify-between gap-3 rounded-md border border-white/10 bg-black/20 px-2.5 py-1.5"
          >
            <span className="text-xs font-medium text-slate-300">
              {endpoint.name}
            </span>
            <StatusBadge tone={endpoint.access === "Public" ? "blue" : "emerald"}>
              {endpoint.access}
            </StatusBadge>
          </div>
        ))}
      </div>
    </section>
  );
}
