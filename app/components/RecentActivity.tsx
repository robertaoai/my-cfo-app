import { createClient } from "@/lib/supabase/server";
import type { AuditLog } from "@/lib/types";
import { Clock, ArrowUpRight, ArrowDownLeft, FileText } from "lucide-react";
import { ExportButton } from "./ExportButton";

const actionIcons: Record<string, typeof ArrowUpRight> = {
  distribution_logged: ArrowUpRight,
  withdrawal_executed: ArrowDownLeft,
  sleeve_created: FileText,
  sleeve_updated: FileText,
  sleeve_deleted: FileText,
  sleeve_price_updated: FileText,
  warning_raised: FileText,
  warning_resolved: FileText,
  sleeve_flagged: FileText,
  principal_seeded: FileText,
};

const actionColors: Record<string, string> = {
  distribution_logged: "text-emerald-400",
  withdrawal_executed: "text-amber-400",
  warning_raised: "text-red-400",
  warning_resolved: "text-emerald-400",
  sleeve_flagged: "text-amber-400",
};

function formatAction(action: string) {
  return action
    .split("_")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}

function timeAgo(dateStr: string) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

export async function RecentActivity() {
  const supabase = await createClient();

  const { data } = await supabase
    .from("audit_logs")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(20);

  const logs = (data ?? []) as AuditLog[];

  if (logs.length === 0) {
    return (
      <div className="rounded-xl border border-white/10 bg-white/[0.02] p-6 text-center">
        <p className="text-sm text-neutral-400">No activity yet.</p>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-white/10 bg-white/[0.02] overflow-hidden">
      <div className="px-4 py-3 border-b border-white/10 flex items-center justify-between">
        <h3 className="text-sm font-medium text-neutral-300 flex items-center gap-2">
          <Clock className="h-4 w-4 text-neutral-500" />
          Recent Activity
        </h3>
        <ExportButton data={logs} filename="audit_log" />
      </div>
      <div className="divide-y divide-white/5 max-h-80 overflow-y-auto">
        {logs.map((log) => {
          const Icon = actionIcons[log.action] ?? FileText;
          const color = actionColors[log.action] ?? "text-neutral-400";
          const meta = log.metadata as any;

          return (
            <div
              key={log.id}
              className="px-4 py-2.5 flex items-start gap-3 hover:bg-white/[0.02] transition-colors"
            >
              <Icon className={`h-3.5 w-3.5 mt-0.5 flex-shrink-0 ${color}`} />
              <div className="flex-1 min-w-0">
                <p className="text-xs font-medium text-neutral-300">
                  {formatAction(log.action)}
                </p>
                {meta && (
                  <p className="text-xs text-neutral-500 truncate">
                    {meta.name && `${meta.name}`}
                    {meta.gross && ` • Gross: SGD ${Number(meta.gross).toFixed(2)}`}
                    {meta.net && ` • Net: SGD ${Number(meta.net).toFixed(2)}`}
                    {meta.amount && ` • SGD ${Number(meta.amount).toFixed(2)}`}
                    {meta.severity && ` • ${meta.severity}`}
                    {meta.sleeve && ` • ${meta.sleeve}`}
                    {meta.new_price && ` • Price: ${meta.new_price}`}
                  </p>
                )}
              </div>
              <span className="text-[10px] text-neutral-600 whitespace-nowrap">
                {timeAgo(log.created_at)}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
