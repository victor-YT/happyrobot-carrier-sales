import type { BadgeTone } from "./dashboard";
import { StatusBadge } from "./dashboard";

type MetricCardProps = {
  label: string;
  value: string;
  helper: string;
  status: string;
  tone?: BadgeTone;
};

const toneClasses = {
  blue: "bg-blue-500",
  emerald: "bg-emerald-500",
  amber: "bg-amber-500",
  rose: "bg-rose-500",
  slate: "bg-slate-400",
};

export function MetricCard({
  label,
  value,
  helper,
  status,
  tone = "slate",
}: MetricCardProps) {
  return (
    <div className="rounded-xl border border-white/10 bg-white/[0.04] p-3.5 shadow-sm transition-colors hover:border-emerald-500/40 2xl:p-4">
      <div className="flex items-center justify-between gap-3">
        <p className="whitespace-nowrap text-sm font-semibold text-slate-300">
          {label}
        </p>
        <div className="flex items-center gap-2">
          <span className={`h-2 w-2 rounded-full ${toneClasses[tone]}`} />
          <span className="hidden sm:inline-flex">
            <StatusBadge tone={tone}>{status}</StatusBadge>
          </span>
        </div>
      </div>
      <p className="mt-3 text-2xl font-semibold tracking-tight text-white 2xl:text-3xl">
        {value}
      </p>
      <p className="mt-1.5 text-xs leading-5 text-slate-400">
        {helper}
      </p>
    </div>
  );
}
