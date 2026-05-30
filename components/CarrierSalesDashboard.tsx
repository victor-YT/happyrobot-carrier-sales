"use client";

import seedLoads from "@/data/seed-loads.json";
import type { CallLog, Load, MetricsSummary } from "@/lib/types";
import { useEffect, useMemo, useState } from "react";
import type { CSSProperties, ReactNode } from "react";

type IconName =
  | "grid"
  | "phone"
  | "truck"
  | "swap"
  | "bars"
  | "gear"
  | "target"
  | "dollar"
  | "loop"
  | "shield"
  | "clock"
  | "bolt"
  | "arrow"
  | "chev";

type Tone = "green" | "g2" | "amber" | "red" | "gray" | "blue";
type MetricDirection = "up" | "down" | "neutral";
type OutcomeDatum = {
  key: string;
  name: string;
  value: number;
  pct: string;
  color: string;
};
type DashboardCall = {
  id: string;
  carrier: string;
  mc: string;
  elig: Tone;
  eligT: string;
  o: string;
  d: string;
  eq: string;
  out: Tone;
  outT: string;
  outcome: string;
  offer: string;
  agreed: string;
  rounds: number;
  sent: Tone;
};
type DashboardProps = {
  fmcsaConfigured: boolean;
  source: string;
  summary: MetricsSummary;
};

const loads = seedLoads as Load[];
const outcomeColors: Record<string, string> = {
  booked: "#67E08A",
  rejected_carrier: "#E46D5E",
  price_not_agreed: "#F28C38",
  no_matching_load: "#5DA9F6",
  not_interested: "#8B95A7",
};
const fallbackOutcomeColors = [
  "#67E08A",
  "#E46D5E",
  "#F2B84B",
  "#F28C38",
  "#5DA9F6",
  "#8B95A7",
  "#B48CF2",
  "#55D6BE",
];

const icons: Record<IconName, ReactNode> = {
  grid: (
    <g>
      <rect x="3" y="3" width="7" height="7" rx="1.5" />
      <rect x="14" y="3" width="7" height="7" rx="1.5" />
      <rect x="3" y="14" width="7" height="7" rx="1.5" />
      <rect x="14" y="14" width="7" height="7" rx="1.5" />
    </g>
  ),
  phone: <path d="M5 4h3l1.6 4-2 1.4a12 12 0 0 0 5 5l1.4-2 4 1.6V18a2 2 0 0 1-2.2 2A15 15 0 0 1 3 6.2 2 2 0 0 1 5 4Z" />,
  truck: (
    <g>
      <path d="M3 6h11v9H3z" />
      <path d="M14 9h4l3 3v3h-7z" />
      <circle cx="7" cy="18" r="1.6" />
      <circle cx="17" cy="18" r="1.6" />
    </g>
  ),
  swap: <path d="M4 8h13l-3-3M20 16H7l3 3" />,
  bars: <path d="M4 20V10M10 20V4M16 20v-7M22 20H2" />,
  gear: (
    <g>
      <circle cx="12" cy="12" r="3" />
      <path d="M12 2v3M12 19v3M4.2 4.2l2.1 2.1M17.7 17.7l2.1 2.1M2 12h3M19 12h3M4.2 19.8l2.1-2.1M17.7 6.3l2.1-2.1" />
    </g>
  ),
  target: (
    <g>
      <circle cx="12" cy="12" r="8" />
      <circle cx="12" cy="12" r="3.4" />
    </g>
  ),
  dollar: <path d="M12 3v18M16 7.5c0-1.7-1.8-2.5-4-2.5s-4 .9-4 2.7c0 3.8 8 2.1 8 5.8 0 1.9-2 2.7-4 2.7s-4-.9-4-2.6" />,
  loop: (
    <g>
      <path d="M4 9a8 8 0 0 1 14-3l2 2M20 15a8 8 0 0 1-14 3l-2-2" />
      <path d="M20 4v4h-4M4 20v-4h4" />
    </g>
  ),
  shield: (
    <g>
      <path d="M12 3l7 3v5c0 4.5-3 8-7 10-4-2-7-5.5-7-10V6z" />
      <path d="M9 12l2 2 4-4" />
    </g>
  ),
  clock: (
    <g>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7v5l3 2" />
    </g>
  ),
  bolt: <path d="M13 2 4 14h7l-1 8 9-12h-7z" />,
  arrow: <path d="M5 12h13M13 6l6 6-6 6" />,
  chev: <path d="M9 6l6 6-6 6" />,
};

function labelize(value: string) {
  return value
    .replaceAll("_", " ")
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function formatNumber(value: number) {
  return Number.isFinite(value) ? value.toLocaleString() : "0";
}

function formatMoney(value: number | null | undefined) {
  return typeof value === "number" && Number.isFinite(value)
    ? `$${Math.round(value).toLocaleString()}`
    : "—";
}

function formatPercent(value: number) {
  return Number.isFinite(value) ? `${(value * 100).toFixed(1)}%` : "0.0%";
}

function formatOneDecimal(value: number) {
  return Number.isFinite(value) ? value.toFixed(1) : "0.0";
}

function loadForCall(call: CallLog) {
  return call.load_id
    ? loads.find((load) => load.load_id === call.load_id) ?? null
    : null;
}

function laneParts(call: CallLog) {
  const load = loadForCall(call);
  if (!load) {
    return { origin: "—", destination: "—", meta: "No matched load" };
  }

  return {
    origin: load.origin,
    destination: load.destination,
    meta: `${load.equipment_type} · ${load.miles.toLocaleString()} mi`,
  };
}

function outcomeTone(outcome: string): Tone {
  if (outcome === "booked") return "green";
  if (["rate_agreed", "agreed"].includes(outcome)) return "g2";
  if (outcome === "no_matching_load") return "blue";
  if (outcome === "not_interested") return "gray";
  if (outcome === "price_not_agreed") return "amber";
  if (outcome === "rejected_carrier") return "red";
  return "gray";
}

function outcomeColor(outcome: string, index = 0) {
  return outcomeColors[outcome] ?? fallbackOutcomeColors[index % fallbackOutcomeColors.length];
}

function sentimentTone(sentiment: string): Tone {
  if (sentiment === "positive") return "green";
  if (sentiment === "neutral") return "amber";
  if (sentiment === "negative") return "red";
  return "gray";
}

function callToRow(call: CallLog): DashboardCall {
  const lane = laneParts(call);
  const outTone = outcomeTone(call.outcome);
  return {
    id: call.id,
    carrier: call.carrier_name,
    mc: call.mc_number,
    elig: call.eligible ? "green" : "red",
    eligT: call.eligible ? "Eligible" : "Rejected",
    o: lane.origin,
    d: lane.destination,
    eq: lane.meta,
    out: outTone,
    outT: labelize(call.outcome),
    outcome: call.outcome,
    offer: formatMoney(call.initial_offer),
    agreed: formatMoney(call.agreed_rate),
    rounds: call.rounds,
    sent: sentimentTone(call.sentiment),
  };
}

function buildOutcomeData(summary: MetricsSummary): OutcomeDatum[] {
  const total = Object.values(summary.outcome_breakdown).reduce(
    (sum, value) => sum + value,
    0,
  );
  const entries = Object.entries(summary.outcome_breakdown).filter(
    ([, value]) => value > 0,
  );

  if (!entries.length) {
    return [
      {
        key: "none",
        name: "No Calls",
        value: 1,
        pct: "0.0%",
        color: "var(--hr-gray)",
      },
    ];
  }

  return entries
    .sort(([, a], [, b]) => b - a)
    .map(([key, value], index) => ({
      key,
      name: labelize(key),
      value,
      pct: total ? `${((value / total) * 100).toFixed(1)}%` : "0.0%",
      color: outcomeColor(key, index),
    }));
}

function buildSentimentData(summary: MetricsSummary) {
  const keys = ["positive", "neutral", "negative", "unknown"];
  const total = Object.values(summary.sentiment_breakdown).reduce(
    (sum, value) => sum + value,
    0,
  );

  return keys
    .map((key) => {
      const value = summary.sentiment_breakdown[key] ?? 0;
      return {
        key,
        label: labelize(key),
        value,
        pct: total ? Math.round((value / total) * 100) : 0,
        color: toneColor(sentimentTone(key)),
      };
    })
    .filter((item) => item.value > 0 || item.key !== "unknown");
}

function Icon({ name, size = 18, style }: { name: IconName; size?: number; style?: CSSProperties }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
      strokeLinejoin="round"
      style={{ display: "block", ...style }}
      aria-hidden="true"
    >
      {icons[name]}
    </svg>
  );
}

function Sidebar() {
  const [active, setActive] = useState("Dashboard");
  const items: Array<{ name: string; icon: IconName }> = [
    { name: "Dashboard", icon: "grid" },
    { name: "Calls", icon: "phone" },
    { name: "Loads", icon: "truck" },
    { name: "Carriers", icon: "swap" },
    { name: "Reports", icon: "bars" },
    { name: "Settings", icon: "gear" },
  ];

  return (
    <aside className="hr-side">
      <div className="hr-brand">
        <div className="hr-brand-mark">
          <Icon name="bolt" size={18} />
        </div>
        <div>
          <div className="hr-brand-name">HappyRobot</div>
          <div className="hr-brand-sub">Freight OS</div>
        </div>
      </div>

      <nav className="hr-nav" aria-label="Operations">
        <div className="hr-nav-label">Operations</div>
        {items.map((item) => (
          <button
            key={item.name}
            type="button"
            className={`hr-nav-item${active === item.name ? " is-active" : ""}`}
            onClick={() => setActive(item.name)}
          >
            <span className="hr-nav-ic">
              <Icon name={item.icon} />
            </span>
            {item.name}
          </button>
        ))}
      </nav>

      <div className="hr-side-foot">
        <button type="button" className="hr-user">
          <div className="hr-avatar">AM</div>
          <div className="hr-user-copy">
            <div className="hr-user-name">Yutong Li</div>
            <div className="hr-user-role">Operations Team</div>
          </div>
          <span className="hr-user-chev">
            <Icon name="chev" size={16} />
          </span>
        </button>
      </div>
    </aside>
  );
}

function StatusPills({
  fmcsaConfigured,
  source,
}: {
  fmcsaConfigured: boolean;
  source: string;
}) {
  return (
    <div className="hr-head-meta">
      <span className="hr-pill">
        <span className="hr-dot" />
        API Secured
      </span>
      <span className="hr-pill">
        <Icon name="shield" size={14} style={{ color: "var(--hr-g)" }} />
        FMCSA <span className="hr-mono">{fmcsaConfigured ? "Live" : "Demo"}</span>
      </span>
      <span className="hr-pill">
        <Icon name="clock" size={14} />
        Source <span className="hr-mono">{source === "supabase" ? "Live" : "Demo"}</span>
      </span>
    </div>
  );
}

function KpiCard({
  k,
}: {
  k: {
    key: string;
    label: string;
    value: string;
    unit?: string;
    delta: string;
    dir: MetricDirection;
    goodDown?: boolean;
    sub: string;
    icon: IconName;
  };
}) {
  const deltaClass = k.goodDown && k.dir === "down" ? "good-down" : k.dir;

  return (
    <section className="hr-card is-hoverable hr-kpi">
      <div className="hr-kpi-top">
        <span className="hr-kpi-label">{k.label}</span>
        <span className="hr-kpi-ic">
          <Icon name={k.icon} size={16} />
        </span>
      </div>
      <div className="hr-kpi-val">
        {k.value}
        {k.unit ? <span className="hr-kpi-unit">{k.unit}</span> : null}
      </div>
      <div className="hr-kpi-foot">
        <span className={`hr-delta ${deltaClass}`}>
          {k.dir === "neutral" ? null : (
            <Icon
              name="arrow"
              size={13}
              style={{
                transform: k.dir === "up" ? "rotate(-90deg)" : "rotate(90deg)",
              }}
            />
          )}
          {k.delta}
        </span>
        <span className="hr-kpi-sub">{k.sub}</span>
      </div>
    </section>
  );
}

function Donut({
  activeKey,
  data,
  onHover,
}: {
  activeKey: string | null;
  data: OutcomeDatum[];
  onHover: (key: string | null) => void;
}) {
  const size = 184;
  const stroke = 26;
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const total = data.reduce((sum, item) => sum + item.value, 0);

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="hr-donut">
      <g transform={`rotate(-90 ${size / 2} ${size / 2})`}>
        <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke="var(--hr-surface-3)" strokeWidth={stroke} />
        {data.map((item, index) => {
          const fraction = item.value / total;
          const dash = fraction * circumference;
          const offset =
            data
              .slice(0, index)
              .reduce((sum, previous) => sum + previous.value / total, 0) * circumference;
          const dimmed = activeKey && activeKey !== item.key;
          const active = activeKey === item.key;

          return (
            <circle
              key={item.key}
              cx={size / 2}
              cy={size / 2}
              r={radius}
              fill="none"
              stroke={item.color}
              strokeWidth={stroke}
              strokeDasharray={`${dash} ${circumference - dash}`}
              strokeDashoffset={-offset}
              opacity={dimmed ? 0.32 : 1}
              className={`hr-donut-segment${active ? " is-active" : ""}`}
              style={
                active
                  ? {
                      filter: "brightness(1.12)",
                    }
                  : undefined
              }
              onMouseEnter={() => onHover(item.key)}
              onMouseLeave={() => onHover(null)}
            />
          );
        })}
      </g>
    </svg>
  );
}

function OutcomeLegend({
  active,
  data,
  onHover,
}: {
  active: string | null;
  data: OutcomeDatum[];
  onHover: (key: string | null) => void;
}) {
  return (
    <div className="hr-legend">
      {data.map((item) => (
        <div
          key={item.key}
          className={`hr-legend-row${active === item.key ? " is-active" : ""}`}
          onMouseEnter={() => onHover(item.key)}
          onMouseLeave={() => onHover(null)}
        >
          <div className="hr-legend-key">
            <span className="hr-swatch" style={{ background: item.color }} />
            <span className="hr-legend-name">{item.name}</span>
          </div>
          <span className="hr-legend-val">{item.value.toLocaleString()}</span>
          <span className="hr-legend-pct">{item.pct}</span>
        </div>
      ))}
    </div>
  );
}

function SentimentBody({
  rows,
}: {
  rows: Array<{ key: string; label: string; value: number; pct: number; color: string }>;
}) {
  return (
    <div className="hr-mini-bars">
      {rows.map((item) => (
        <div key={item.key}>
          <div className="hr-bar-label">
            <span>{item.label}</span>
            <span className="hr-mono">{item.pct}%</span>
          </div>
          <div className="hr-bar">
            <div className="hr-bar-fill" style={{ width: `${item.pct}%`, background: item.color }} />
          </div>
        </div>
      ))}
    </div>
  );
}

function Badge({ tone, text, dot }: { tone: Tone; text: string; dot?: boolean }) {
  const className = tone === "g2" ? "green" : tone;
  return (
    <span className={`hr-badge ${className}${dot ? " dot" : ""}`} style={tone === "g2" ? { color: "var(--hr-g-2)" } : undefined}>
      {text}
    </span>
  );
}

function toneColor(tone: Tone) {
  return {
    green: "var(--hr-g)",
    g2: "var(--hr-g-2)",
    amber: "var(--hr-amber)",
    red: "var(--hr-red)",
    gray: "var(--hr-gray)",
    blue: "var(--hr-blue)",
  }[tone];
}

function sentimentLabel(tone: Tone) {
  return {
    green: "Positive",
    g2: "Positive",
    amber: "Neutral",
    red: "Negative",
    gray: "Unknown",
  }[tone];
}

function RecentCalls({ rows }: { rows: DashboardCall[] }) {
  return (
    <div className="hr-table-wrap">
      <table className="hr-table">
        <thead>
          <tr>
            <th>Carrier</th>
            <th>Eligibility</th>
            <th>Lane</th>
            <th>Outcome</th>
            <th className="num">Offer</th>
            <th className="num">Agreed</th>
            <th className="num">Rounds</th>
            <th>Sentiment</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((call) => (
            <tr key={call.id} className="hr-row">
              <td>
                <div className="hr-carrier">{call.carrier}</div>
                <div className="hr-sub hr-mono">{call.mc}</div>
              </td>
              <td>
                <Badge tone={call.elig} text={call.eligT} dot />
              </td>
              <td>
                <div className="hr-lane">
                  {call.o}
                  <span className="arr">
                    <Icon name="arrow" size={13} />
                  </span>
                  {call.d}
                </div>
                <div className="hr-sub">{call.eq}</div>
              </td>
              <td>
                <Badge tone={call.out} text={call.outT} />
              </td>
              <td className="num hr-mono hr-muted">{call.offer}</td>
              <td className={`num hr-mono hr-agreed${call.agreed === "—" ? " is-empty" : ""}`}>{call.agreed}</td>
              <td className="num hr-mono hr-muted">{call.rounds}</td>
              <td>
                <span className="hr-sentiment">
                  <span className="hr-sentiment-dot" style={{ background: toneColor(call.sent) }} />
                  {sentimentLabel(call.sent)}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function matchesFilter(call: DashboardCall, filter: string) {
  return filter === "all" || call.outcome === filter;
}

export function CarrierSalesDashboard({
  fmcsaConfigured,
  source,
  summary,
}: DashboardProps) {
  const [filter, setFilter] = useState("all");
  const [displayFilter, setDisplayFilter] = useState("all");
  const [isSwitchingRows, setIsSwitchingRows] = useState(false);
  const [activeOutcome, setActiveOutcome] = useState<string | null>(null);
  const outcomeData = useMemo(() => buildOutcomeData(summary), [summary]);
  const activeOutcomeDatum = activeOutcome
    ? outcomeData.find((item) => item.key === activeOutcome) ?? null
    : null;
  const sentimentData = useMemo(() => buildSentimentData(summary), [summary]);
  const calls = useMemo(
    () => summary.recent_calls.map((call) => callToRow(call)),
    [summary.recent_calls],
  );
  const filters = useMemo(() => {
    const counts = calls.reduce<Map<string, number>>((acc, call) => {
      acc.set(call.outcome, (acc.get(call.outcome) ?? 0) + 1);
      return acc;
    }, new Map());
    const outcomeFilters = Array.from(new Set(calls.map((call) => call.outcome)))
      .map((key) => ({ key, label: labelize(key) }))
      .sort((a, b) => (counts.get(b.key) ?? 0) - (counts.get(a.key) ?? 0));

    return [{ key: "all", label: "All" }, ...outcomeFilters];
  }, [calls]);
  const rows = useMemo(
    () => calls.filter((call) => matchesFilter(call, displayFilter)),
    [calls, displayFilter],
  );
  const sentimentTotal = Object.values(summary.sentiment_breakdown).reduce(
    (sum, value) => sum + value,
    0,
  );
  const kpis = [
    {
      key: "calls",
      label: "Inbound Calls",
      value: formatNumber(summary.total_calls),
      delta: `${formatNumber(summary.eligible_carriers)} eligible`,
      dir: "neutral" as const,
      sub: source === "supabase" ? "from live call logs" : "from demo fallback",
      icon: "phone" as const,
    },
    {
      key: "booking",
      label: "Booking Rate",
      value: formatPercent(summary.booking_rate).replace("%", ""),
      unit: "%",
      delta: `${formatNumber(summary.booked_loads)} booked`,
      dir: "neutral" as const,
      sub: `${formatNumber(summary.booked_loads)} of ${formatNumber(summary.total_calls)} calls`,
      icon: "target" as const,
    },
    {
      key: "margin",
      label: "Avg Savings",
      value: formatMoney(summary.average_savings_vs_initial_offer),
      delta: `${formatNumber(summary.booked_with_savings)} loads`,
      dir: "neutral" as const,
      sub: "vs initial carrier offer",
      icon: "dollar" as const,
    },
    {
      key: "rounds",
      label: "Avg Negotiation",
      value: formatOneDecimal(summary.average_negotiation_rounds),
      unit: "rounds",
      delta: `${formatNumber(summary.negotiated_calls)} calls`,
      dir: "neutral" as const,
      sub: "across negotiated calls",
      icon: "loop" as const,
    },
  ];

  function count(filterKey: string) {
    return calls.filter((call) => matchesFilter(call, filterKey)).length;
  }

  function handleFilterChange(nextFilter: string) {
    if (nextFilter === filter) return;

    setFilter(nextFilter);
    setIsSwitchingRows(true);
  }

  useEffect(() => {
    if (filter === displayFilter) return;

    const fadeOut = window.setTimeout(() => {
      setDisplayFilter(filter);
      window.requestAnimationFrame(() => setIsSwitchingRows(false));
    }, 130);

    return () => window.clearTimeout(fadeOut);
  }, [displayFilter, filter]);

  return (
    <div className="hr">
      <Sidebar />
      <main className="hr-main">
        <header className="hr-head">
          <div>
            <h1 className="hr-title">Inbound Carrier Sales</h1>
            <p className="hr-subtitle">Carrier verification, load matching & automated rate negotiation.</p>
          </div>
          <StatusPills fmcsaConfigured={fmcsaConfigured} source={source} />
        </header>

        <section className="hr-grid hr-kpi-grid" aria-label="Key metrics">
          {kpis.map((kpi) => (
            <KpiCard key={kpi.key} k={kpi} />
          ))}
        </section>

        <section className="hr-insights">
          <div className="hr-card is-hoverable hr-outcome-card">
            <div className="hr-card-head">
              <h2 className="hr-card-title">Outcome Breakdown</h2>
            </div>
            <div className="hr-outcome-body">
              <div className="hr-donut-wrap">
                <Donut
                  activeKey={activeOutcome}
                  data={outcomeData}
                  onHover={setActiveOutcome}
                />
                <div className="hr-donut-center">
                  {activeOutcomeDatum ? (
                    <>
                      <div className="hr-donut-title">{activeOutcomeDatum.name}</div>
                      <div className="hr-donut-num">
                        {formatNumber(activeOutcomeDatum.value)}
                      </div>
                      <div className="hr-donut-cap">{activeOutcomeDatum.pct}</div>
                    </>
                  ) : (
                    <>
                      <div className="hr-donut-num">
                        {formatNumber(summary.total_calls)}
                      </div>
                      <div className="hr-donut-cap">Total Calls</div>
                    </>
                  )}
                </div>
              </div>
              <div className="hr-outcome-legend">
                <OutcomeLegend
                  active={activeOutcome}
                  data={outcomeData}
                  onHover={setActiveOutcome}
                />
              </div>
            </div>
          </div>

          <div className="hr-card is-hoverable hr-sentiment-card">
            <div className="hr-card-head">
              <h2 className="hr-card-title">Carrier Sentiment</h2>
            </div>
            <SentimentBody rows={sentimentData} />
            <p className="hr-sentiment-note">
              Classified from transcript tone across{" "}
              <span className="hr-mono">{formatNumber(sentimentTotal)}</span>{" "}
              completed calls.
            </p>
          </div>
        </section>

        <section className="hr-card is-hoverable">
          <div className="hr-card-head">
            <h2 className="hr-card-title">Recent Calls</h2>
          </div>
          <div className="hr-chips">
            {filters.map((item) => (
              <button
                key={item.key}
                type="button"
                className={`hr-chip${filter === item.key ? " is-on" : ""}`}
                onClick={() => handleFilterChange(item.key)}
              >
                {item.label}
                <span className="hr-chip-count">{count(item.key)}</span>
              </button>
            ))}
          </div>
          <div className={`hr-table-stage${isSwitchingRows ? " is-switching" : ""}`}>
            <RecentCalls rows={rows} />
          </div>
        </section>
      </main>
    </div>
  );
}
