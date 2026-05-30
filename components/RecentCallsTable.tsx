import type { CallLog } from "@/lib/types";
import {
  formatMoney,
  labelize,
  laneForCall,
  loadMetaForCall,
  outcomeTone,
  StatusBadge,
} from "./dashboard";

function formatDate(value: string) {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(value));
}

export function RecentCallsTable({ calls }: { calls: CallLog[] }) {
  if (!calls.length) {
    return (
      <div className="rounded-lg border border-dashed border-white/15 bg-white/[0.03] p-8 text-center text-sm text-slate-400">
        No recent calls yet. Calls logged by the HappyRobot workflow will appear
        here.
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-xl border border-white/10 bg-[#0b0f0d] shadow-sm">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[1120px] table-fixed divide-y divide-white/10 text-sm">
          <colgroup>
            <col className="w-[14%]" />
            <col className="w-[9%]" />
            <col className="w-[9%]" />
            <col className="w-[21%]" />
            <col className="w-[10%]" />
            <col className="w-[10%]" />
            <col className="w-[10%]" />
            <col className="w-[6%]" />
            <col className="w-[11%]" />
          </colgroup>
          <thead className="bg-white/[0.03] text-left text-xs font-semibold uppercase text-slate-400">
            <tr>
              <th className="px-4 py-3.5">Carrier</th>
              <th className="px-4 py-3.5">MC Number</th>
              <th className="px-4 py-3.5">Eligibility</th>
              <th className="px-4 py-3.5">Lane / Load</th>
              <th className="px-4 py-3.5">Outcome</th>
              <th className="px-4 py-3.5">Initial Offer</th>
              <th className="px-4 py-3.5">Agreed Rate</th>
              <th className="px-4 py-3.5">Rounds</th>
              <th className="px-4 py-3.5">Summary</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/10">
            {calls.map((call) => (
              <tr key={call.id} className="hover:bg-white/[0.03]">
                <td className="px-4 py-3 align-top">
                  <div className="line-clamp-2 font-medium text-white">
                    {call.carrier_name}
                  </div>
                  <div className="mt-1 text-xs text-slate-500">
                    {formatDate(call.created_at)}
                  </div>
                </td>
                <td className="px-4 py-3 align-top text-slate-300">
                  {call.mc_number}
                </td>
                <td className="px-4 py-3 align-top">
                  <span
                    className={`inline-flex rounded-md border px-2 py-1 text-xs font-semibold ${
                      call.eligible
                        ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-300"
                        : "border-rose-500/30 bg-rose-500/10 text-rose-300"
                    }`}
                  >
                    {call.eligible ? "Eligible" : "Rejected"}
                  </span>
                </td>
                <td className="px-4 py-3 align-top text-slate-300">
                  <div className="truncate font-medium text-white">
                    {laneForCall(call)}
                  </div>
                  <div className="mt-1 truncate text-xs text-slate-500">
                    {loadMetaForCall(call)}
                  </div>
                </td>
                <td className="px-4 py-3 align-top">
                  <StatusBadge tone={outcomeTone(call.outcome)}>
                    {labelize(call.outcome)}
                  </StatusBadge>
                </td>
                <td className="whitespace-nowrap px-4 py-3 align-top font-medium text-slate-200">
                  {formatMoney(call.initial_offer)}
                </td>
                <td className="whitespace-nowrap px-4 py-3 align-top font-medium text-slate-200">
                  {formatMoney(call.agreed_rate)}
                </td>
                <td className="px-4 py-3 align-top text-slate-300">
                  {call.rounds}
                </td>
                <td className="px-4 py-3 align-top text-slate-300">
                  <p className="line-clamp-2 whitespace-normal break-words text-sm leading-5">
                    {call.summary || "-"}
                  </p>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
