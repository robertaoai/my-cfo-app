import { createClient } from "@/lib/supabase/server";
import type { Warning } from "@/lib/types";
import { ShieldCheck, AlertTriangle, ShieldAlert } from "lucide-react";

export async function WarningPanel() {
  const supabase = await createClient();

  const { data: warnings } = await supabase
    .from("warnings")
    .select("*")
    .eq("resolved", false)
    .order("created_at", { ascending: false });

  const activeWarnings = (warnings ?? []) as Warning[];

  if (activeWarnings.length === 0) {
    return (
      <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/5 p-4 flex items-center gap-3">
        <ShieldCheck className="h-5 w-5 text-emerald-400" />
        <div>
          <p className="text-sm font-medium text-emerald-300">
            All thresholds clear
          </p>
          <p className="text-xs text-emerald-500/70">
            No active warnings — income, drawdown, and withdrawal levels are
            within bounds.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {activeWarnings.map((w) => {
        const isRed = w.severity === "red";
        return (
          <div
            key={w.id}
            className={`rounded-xl border p-4 flex items-start gap-3 ${
              isRed
                ? "border-red-500/30 bg-red-500/5"
                : "border-amber-500/30 bg-amber-500/5"
            }`}
          >
            {isRed ? (
              <ShieldAlert className="h-5 w-5 text-red-400 mt-0.5 flex-shrink-0" />
            ) : (
              <AlertTriangle className="h-5 w-5 text-amber-400 mt-0.5 flex-shrink-0" />
            )}
            <div>
              <p
                className={`text-sm font-medium ${
                  isRed ? "text-red-300" : "text-amber-300"
                }`}
              >
                {w.type === "projected_income_lt_90pct"
                  ? "Projected Income Shortfall"
                  : w.type === "weekly_drawdown_gt_15pct"
                  ? "Weekly Drawdown Exceeded"
                  : "Over-Withdrawal Alert"}
              </p>
              <p
                className={`text-xs mt-0.5 ${
                  isRed ? "text-red-400/70" : "text-amber-400/70"
                }`}
              >
                {w.message}
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
}
