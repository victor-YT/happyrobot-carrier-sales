import { FollowUpQueue } from "@/components/FollowUpQueue";
import { IntegrationStatus } from "@/components/IntegrationStatus";
import { MetricCard } from "@/components/MetricCard";
import { RecentCallsTable } from "@/components/RecentCallsTable";
import {
  formatMoney,
  formatNumber,
  formatPercent,
  needsFollowUp,
} from "@/components/dashboard";
import { getMetricsSummary } from "@/lib/metrics";

export const dynamic = "force-dynamic";

function CompactBreakdown({
  title,
  data,
  items,
}: {
  title: string;
  data: Record<string, number>;
  items: Array<{ key: string; label: string }>;
}) {
  const entries = items.map((item) => ({
    ...item,
    value: data[item.key] ?? 0,
  }));
  const total = entries.reduce((sum, entry) => sum + entry.value, 0);

  return (
    <section className="rounded-xl border border-white/10 bg-white/[0.04] p-4 shadow-sm">
      <h2 className="text-sm font-semibold text-white">{title}</h2>
      <div className="mt-3 space-y-2.5">
        {entries.length ? (
          entries.map(({ key, label, value }) => {
            const percentage = total ? value / total : 0;
            return (
              <div key={key}>
                <div className="flex items-center justify-between gap-3 text-xs">
                  <span className="font-medium text-slate-300">
                    {label}
                  </span>
                  <span className="font-semibold text-slate-100">
                    {value} <span className="text-slate-500">{formatPercent(percentage)}</span>
                  </span>
                </div>
                <div className="mt-1.5 h-1.5 rounded-full bg-white/10">
                  <div
                    className="h-1.5 rounded-full bg-emerald-400"
                    style={{ width: `${percentage * 100}%` }}
                  />
                </div>
              </div>
            );
          })
        ) : (
          <p className="text-sm text-slate-500">No breakdown data yet.</p>
        )}
      </div>
    </section>
  );
}

function lastUpdated() {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date());
}

export default async function Home() {
  const { summary, source } = await getMetricsSummary();
  const followUpCalls = summary.recent_calls.filter(needsFollowUp);

  return (
    <main className="min-h-screen bg-[#020403] text-white">
      <section className="border-b border-white/10 bg-[#020403]">
        <div className="grid w-full gap-5 px-5 py-4 lg:grid-cols-[1fr_520px] lg:items-center">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-emerald-300">
              HAPPYROBOT EXTERNAL BUSINESS API
            </p>
            <h1 className="mt-2 text-2xl font-semibold tracking-tight sm:text-3xl">
              Inbound Carrier Sales Automation
            </h1>
            <p className="mt-1.5 text-sm leading-6 text-slate-300">
              Automating carrier verification, load matching, rate negotiation,
              and broker handoff from inbound calls.
            </p>
          </div>
          <div className="rounded-xl border border-white/10 bg-white/[0.04] p-2.5 shadow-sm">
            <div className="grid grid-cols-4 gap-2 text-sm">
              <div className="rounded-lg bg-black/20 p-2">
                <p className="text-xs uppercase tracking-wide text-slate-400">
                  System
                </p>
                <p className="mt-1 font-semibold text-emerald-300">Operational</p>
              </div>
              <div className="rounded-lg bg-black/20 p-2">
                <p className="text-xs uppercase tracking-wide text-slate-400">
                  Data Source
                </p>
                <p className="mt-1 font-semibold text-white">
                  {source === "supabase" ? "Supabase live" : "Demo fallback"}
                </p>
              </div>
              <div className="rounded-lg bg-black/20 p-2">
                <p className="text-xs uppercase tracking-wide text-slate-400">
                  API
                </p>
                <p className="mt-1 font-semibold text-emerald-300">Secured</p>
              </div>
              <div className="rounded-lg bg-black/20 p-2">
                <p className="text-xs uppercase tracking-wide text-slate-400">
                  Last updated
                </p>
                <p className="mt-1 font-semibold text-white">{lastUpdated()}</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="w-full space-y-5 px-5 py-5">
        <section className="grid gap-3 md:grid-cols-3 2xl:grid-cols-6">
          <MetricCard
            label="Total Calls"
            value={formatNumber(summary.total_calls)}
            helper="Inbound calls handled"
            status="Live"
            tone="blue"
          />
          <MetricCard
            label="Eligible Carriers"
            value={formatNumber(summary.eligible_carriers)}
            helper="Cleared for matching"
            status="Verified"
            tone="emerald"
          />
          <MetricCard
            label="Booked Loads"
            value={formatNumber(summary.booked_loads)}
            helper="Converted calls"
            status="Booked"
            tone="emerald"
          />
          <MetricCard
            label="Booking Rate"
            value={formatPercent(summary.booking_rate)}
            helper="Call conversion"
            status="Conversion"
            tone="blue"
          />
          <MetricCard
            label="Avg. Agreed Rate"
            value={formatMoney(summary.average_agreed_rate)}
            helper="Booked load rate"
            status="Rate"
            tone="slate"
          />
          <MetricCard
            label="Avg. Savings"
            value={formatMoney(summary.average_savings_vs_initial_offer)}
            helper="Vs. carrier ask"
            status="Margin"
            tone="amber"
          />
        </section>

        <section>
          <div>
            <div className="mb-4 flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold text-white">
                  Recent Calls
                </h2>
                <p className="mt-1 text-sm text-slate-400">
                  Latest workflow outcomes with rate context for broker review.
                </p>
              </div>
            </div>
            <RecentCallsTable calls={summary.recent_calls} />
          </div>
        </section>

        <section className="grid items-start gap-5 lg:grid-cols-[minmax(0,1fr)_minmax(380px,0.72fr)]">
            <div>
              <h2 className="text-base font-semibold text-white">
                Human Follow-Up Queue
              </h2>
              <p className="mt-1 text-sm text-slate-400">
                Broker approval, compliance review, or manual recovery.
              </p>
              <div className="mt-3 max-h-[430px] overflow-y-auto pr-1">
                <FollowUpQueue calls={followUpCalls} />
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-1">
              <CompactBreakdown
                title="Outcome Summary"
                data={summary.outcome_breakdown}
                items={[
                  { key: "booked", label: "Booked" },
                  { key: "rejected_carrier", label: "Rejected Carrier" },
                  { key: "no_matching_load", label: "No Matching Load" },
                  { key: "price_not_agreed", label: "Price Not Agreed" },
                  { key: "follow_up", label: "Follow Up" },
                  { key: "not_interested", label: "Not Interested" },
                ]}
              />
              <CompactBreakdown
                title="Sentiment Summary"
                data={summary.sentiment_breakdown}
                items={[
                  { key: "positive", label: "Positive" },
                  { key: "neutral", label: "Neutral" },
                  { key: "negative", label: "Negative" },
                ]}
              />
              <div className="md:col-span-2 lg:col-span-1">
                <IntegrationStatus />
              </div>
            </div>
        </section>
      </div>
    </main>
  );
}
