import { createClient } from "@/lib/supabase/server";
import type { Sleeve } from "@/lib/types";
import { LogDistributionButton } from "./LogDistributionDialog";
import { UpdatePriceButton } from "./UpdatePriceDialog";
import { SleeveActions } from "./SleeveDialog";
import { CircleDot } from "lucide-react";

const statusColors: Record<string, string> = {
  active: "bg-emerald-500/20 text-emerald-300 border-emerald-500/30",
  flagged: "bg-amber-500/20 text-amber-300 border-amber-500/30",
  replaced: "bg-neutral-500/20 text-neutral-400 border-neutral-500/30",
  closed: "bg-red-500/20 text-red-400 border-red-500/30",
};

function formatSGD(n: number | null) {
  if (n == null) return "—";
  return new Intl.NumberFormat("en-SG", {
    style: "currency",
    currency: "SGD",
    minimumFractionDigits: 2,
  }).format(n);
}

export async function SleevesTable() {
  const supabase = await createClient();

  const { data } = await supabase
    .from("sleeves")
    .select("*")
    .order("role", { ascending: true })
    .order("created_at", { ascending: true });

  const sleeves = (data ?? []) as Sleeve[];

  if (sleeves.length === 0) {
    return (
      <div className="rounded-xl border border-white/10 bg-white/[0.02] p-8 text-center">
        <p className="text-neutral-400 text-sm">No sleeves yet.</p>
        <SleeveActions mode="create" />
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-white/10 bg-white/[0.02] overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-white/10 text-left">
              <th className="px-4 py-3 text-xs font-medium text-neutral-400 uppercase tracking-wider">
                Sleeve
              </th>
              <th className="px-4 py-3 text-xs font-medium text-neutral-400 uppercase tracking-wider">
                Status
              </th>
              <th className="px-4 py-3 text-xs font-medium text-neutral-400 uppercase tracking-wider text-right">
                Entry Price
              </th>
              <th className="px-4 py-3 text-xs font-medium text-neutral-400 uppercase tracking-wider text-right">
                Current Price
              </th>
              <th className="px-4 py-3 text-xs font-medium text-neutral-400 uppercase tracking-wider text-right">
                Size
              </th>
              <th className="px-4 py-3 text-xs font-medium text-neutral-400 uppercase tracking-wider text-right">
                Alloc %
              </th>
              <th className="px-4 py-3 text-xs font-medium text-neutral-400 uppercase tracking-wider">
                Last Ex-Date
              </th>
              <th className="px-4 py-3 text-xs font-medium text-neutral-400 uppercase tracking-wider text-right">
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            {sleeves.map((s) => {
              const drawdown =
                s.current_price != null && s.entry_price > 0
                  ? ((s.entry_price - s.current_price) / s.entry_price) * 100
                  : null;
              const drawdownClass =
                drawdown != null && drawdown > 15
                  ? "text-red-400"
                  : drawdown != null && drawdown > 5
                  ? "text-amber-400"
                  : "text-neutral-300";

              return (
                <tr
                  key={s.id}
                  className="border-b border-white/5 hover:bg-white/[0.03] transition-colors"
                >
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <CircleDot className="h-3.5 w-3.5 text-neutral-500" />
                      <div>
                        <p className="font-medium text-white">{s.name}</p>
                        <p className="text-xs text-neutral-500">{s.role}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border ${
                        statusColors[s.status] ?? statusColors.active
                      }`}
                    >
                      {s.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right text-neutral-300 tabular-nums">
                    {formatSGD(s.entry_price)}
                  </td>
                  <td className={`px-4 py-3 text-right tabular-nums ${drawdownClass}`}>
                    {formatSGD(s.current_price)}
                    {drawdown != null && (
                      <span className="text-xs ml-1">
                        ({drawdown > 0 ? "−" : "+"}
                        {Math.abs(drawdown).toFixed(1)}%)
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-right text-neutral-300 tabular-nums">
                    {s.position_size.toLocaleString()}
                  </td>
                  <td className="px-4 py-3 text-right text-neutral-300 tabular-nums">
                    {s.allocation_pct}%
                  </td>
                  <td className="px-4 py-3 text-neutral-400 text-xs">
                    {s.last_ex_date ?? "—"}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-1">
                      {s.status === "active" && (
                        <>
                          <LogDistributionButton
                            sleeveId={s.id}
                            sleeveName={s.name}
                          />
                          <UpdatePriceButton
                            sleeveId={s.id}
                            sleeveName={s.name}
                            currentPrice={s.current_price}
                          />
                        </>
                      )}
                      <SleeveActions mode="edit" sleeve={s} />
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      <div className="px-4 py-3 border-t border-white/5">
        <SleeveActions mode="create" />
      </div>
    </div>
  );
}
