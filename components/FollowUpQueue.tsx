import type { CallLog } from "@/lib/types";
import {
  formatMoney,
  labelize,
  laneForCall,
  loadMetaForCall,
  outcomeTone,
  priorityForCall,
  StatusBadge,
  suggestedAction,
} from "./dashboard";

export function FollowUpQueue({ calls }: { calls: CallLog[] }) {
  if (!calls.length) {
    return (
      <div className="rounded-lg border border-dashed border-white/15 bg-white/[0.03] p-4 text-sm text-slate-400">
        No human follow-up required.
      </div>
    );
  }

  return (
    <div className="space-y-2.5">
      {calls.map((call) => (
        <div
          key={call.id}
          className="rounded-xl border border-white/10 bg-white/[0.04] p-3 shadow-sm"
        >
          <div className="mb-2.5 flex items-center justify-between gap-3">
            <StatusBadge tone={priorityForCall(call).tone}>
              {priorityForCall(call).label}
            </StatusBadge>
            <StatusBadge tone={outcomeTone(call.outcome)}>
              {labelize(call.outcome)}
            </StatusBadge>
          </div>
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="font-semibold text-white">{call.carrier_name}</p>
              <p className="mt-0.5 text-sm text-slate-400">{call.mc_number}</p>
            </div>
          </div>
          <div className="mt-3 rounded-lg border border-white/10 bg-black/20 p-2.5">
            <p className="truncate text-sm font-medium text-white">
              {laneForCall(call)}
            </p>
            <p className="mt-1 truncate text-xs text-slate-500">
              {loadMetaForCall(call)}
            </p>
          </div>
          <div className="mt-3 space-y-1.5 text-sm leading-5">
            <p className="line-clamp-1">
              <span className="font-medium text-slate-200">Reason: </span>
              <span className="text-slate-400">
                {call.summary || "Manual review requested by workflow."}
              </span>
            </p>
            <p className="line-clamp-1">
              <span className="font-medium text-slate-200">Suggested action: </span>
              <span className="text-slate-400">{suggestedAction(call)}</span>
            </p>
          </div>
          <dl className="mt-3 grid grid-cols-3 gap-2 rounded-lg bg-black/20 p-2.5 text-xs">
            <div>
              <dt className="font-medium uppercase tracking-wide text-slate-500">
                Initial
              </dt>
              <dd className="mt-1 font-semibold text-slate-100">
                {formatMoney(call.initial_offer)}
              </dd>
            </div>
            <div>
              <dt className="font-medium uppercase tracking-wide text-slate-500">
                Agreed
              </dt>
              <dd className="mt-1 font-semibold text-slate-100">
                {formatMoney(call.agreed_rate)}
              </dd>
            </div>
            <div>
              <dt className="font-medium uppercase tracking-wide text-slate-500">
                Rounds
              </dt>
              <dd className="mt-1 font-semibold text-slate-100">{call.rounds}</dd>
            </div>
          </dl>
        </div>
      ))}
    </div>
  );
}
