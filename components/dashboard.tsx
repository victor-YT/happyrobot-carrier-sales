import seedLoads from "@/data/seed-loads.json";
import type { ReactNode } from "react";
import type { CallLog, Load } from "@/lib/types";

const loads = seedLoads as Load[];

const badgeStyles = {
  blue: "border-blue-200 bg-blue-50 text-blue-700",
  emerald: "border-emerald-200 bg-emerald-50 text-emerald-700",
  amber: "border-amber-200 bg-amber-50 text-amber-700",
  rose: "border-rose-200 bg-rose-50 text-rose-700",
  slate: "border-slate-200 bg-slate-50 text-slate-700",
} as const;

export type BadgeTone = keyof typeof badgeStyles;

export function formatMoney(value: number | null | undefined) {
  return typeof value === "number" && Number.isFinite(value)
    ? `$${Math.round(value).toLocaleString()}`
    : "-";
}

export function formatPercent(value: number | null | undefined) {
  return typeof value === "number" && Number.isFinite(value)
    ? `${Math.round(value * 100)}%`
    : "-";
}

export function formatNumber(value: number | null | undefined) {
  return typeof value === "number" && Number.isFinite(value)
    ? value.toLocaleString()
    : "-";
}

export function labelize(value: string) {
  return value
    .replaceAll("_", " ")
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}

export function StatusBadge({
  children,
  tone = "slate",
}: {
  children: ReactNode;
  tone?: BadgeTone;
}) {
  return (
    <span
      className={`inline-flex w-fit items-center rounded-md border px-2 py-1 text-xs font-semibold ${badgeStyles[tone]}`}
    >
      {children}
    </span>
  );
}

export function SectionCard({
  title,
  description,
  children,
  className = "",
  compact = false,
}: {
  title: string;
  description?: string;
  children: ReactNode;
  className?: string;
  compact?: boolean;
}) {
  return (
    <section
      className={`rounded-xl border border-slate-200 bg-white shadow-sm ${className}`}
    >
      <div
        className={`border-b border-slate-100 px-5 ${compact ? "py-3" : "py-4"}`}
      >
        <h2 className="text-base font-semibold text-slate-950">{title}</h2>
        {description ? (
          <p
            className={`mt-1 text-sm text-slate-500 ${
              compact ? "leading-5" : "leading-6"
            }`}
          >
            {description}
          </p>
        ) : null}
      </div>
      <div className={compact ? "p-4" : "p-5"}>{children}</div>
    </section>
  );
}

function breakdownTone(label: string): BadgeTone {
  const normalized = label.toLowerCase();
  if (["booked", "positive", "accept"].includes(normalized)) return "emerald";
  if (["follow_up", "neutral", "escalated", "price_not_agreed"].includes(normalized)) {
    return "amber";
  }
  if (["rejected_carrier", "negative", "rate_rejected"].includes(normalized)) {
    return "rose";
  }
  return "blue";
}

export function BreakdownBar({
  label,
  value,
  total,
}: {
  label: string;
  value: number;
  total: number;
}) {
  const percentage = total ? value / total : 0;
  const tone = breakdownTone(label);

  return (
    <div className="py-1">
      <div className="flex items-center justify-between gap-4">
        <StatusBadge tone={tone}>{labelize(label)}</StatusBadge>
        <div className="text-right text-sm">
          <span className="font-semibold text-slate-950">{value}</span>
          <span className="ml-2 text-slate-500">{formatPercent(percentage)}</span>
        </div>
      </div>
      <div className="mt-3.5 h-2 rounded-full bg-slate-100">
        <div
          className={`h-2 rounded-full ${
            tone === "emerald"
              ? "bg-emerald-500"
              : tone === "amber"
                ? "bg-amber-500"
                : tone === "rose"
                  ? "bg-rose-500"
                  : "bg-blue-500"
          }`}
          style={{ width: `${percentage * 100}%` }}
        />
      </div>
    </div>
  );
}

export function getLoadForCall(call: CallLog) {
  return call.load_id
    ? loads.find((load) => load.load_id === call.load_id) ?? null
    : null;
}

export function laneForCall(call: CallLog) {
  const load = getLoadForCall(call);
  if (!load) return call.load_id ?? "-";
  return `${load.origin} -> ${load.destination}`;
}

export function loadMetaForCall(call: CallLog) {
  const load = getLoadForCall(call);
  if (!load) return call.load_id ? "Load details unavailable" : "No matched load";
  return `${load.load_id} - ${load.equipment_type} - ${load.miles.toLocaleString()} mi`;
}

export function outcomeTone(outcome: string): BadgeTone {
  if (outcome === "booked") return "emerald";
  if (["follow_up", "escalated", "price_not_agreed"].includes(outcome)) {
    return "amber";
  }
  if (["rejected_carrier", "rate_rejected"].includes(outcome)) return "rose";
  return "slate";
}

export function sentimentTone(sentiment: string): BadgeTone {
  if (sentiment === "positive") return "emerald";
  if (sentiment === "negative") return "rose";
  if (sentiment === "neutral") return "slate";
  return "blue";
}

export function needsFollowUp(call: CallLog) {
  return (
    call.outcome === "follow_up" ||
    call.outcome === "price_not_agreed" ||
    call.sentiment === "negative" ||
    (call.rounds >= 3 && call.agreed_rate === null)
  );
}

export function suggestedAction(call: CallLog) {
  if (!call.eligible) return "Review carrier eligibility before proceeding.";
  if (call.sentiment === "negative") {
    return "Sales rep should follow up due to negative sentiment.";
  }
  if (call.rounds >= 3 && call.agreed_rate === null) {
    return "Manual review recommended after 3 negotiation rounds.";
  }
  if (call.outcome === "price_not_agreed") {
    return "Broker should decide whether to reopen rate negotiation.";
  }
  return "Broker approval needed for final rate.";
}

export function priorityForCall(call: CallLog): { label: string; tone: BadgeTone } {
  if (!call.eligible || call.sentiment === "negative") {
    return { label: "High priority", tone: "rose" };
  }
  if (call.rounds >= 3 && call.agreed_rate === null) {
    return { label: "Rate review", tone: "amber" };
  }
  return { label: "Broker review", tone: "blue" };
}
