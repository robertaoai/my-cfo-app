import { createClient } from "@/lib/supabase/server";
import { KPICards } from "./components/KPICards";
import { WarningPanel } from "./components/WarningPanel";
import { SleevesTable } from "./components/SleevesTable";
import { RecentActivity } from "./components/RecentActivity";
import { SimulateWithdrawalButton } from "./components/SimulateWithdrawalDialog";
import { PrincipalChart, CumulativeCashChart } from "./components/HistoryCharts";
import { UserMenu } from "./components/UserMenu";
import type { PrincipalSnapshot, Distribution } from "@/lib/types";
import { Landmark } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function Home() {
  const supabase = await createClient();

  // Get authenticated user
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Get latest principal for the withdrawal button
  const { data: latestSnap } = await supabase
    .from("principal_snapshots")
    .select("balance")
    .order("as_of", { ascending: false })
    .limit(1)
    .single();
  const currentPrincipal = latestSnap ? Number(latestSnap.balance) : 0;

  // Get recent distributions for the quick summary
  const { data: recentDists } = await supabase
    .from("distributions")
    .select("id, ex_date, gross, withholding, net, sleeve_id, sleeves(name)")
    .order("ex_date", { ascending: false })
    .limit(8);

  // Get all principal snapshots for the chart
  const { data: allSnapshots } = await supabase
    .from("principal_snapshots")
    .select("*")
    .order("as_of", { ascending: true });

  // Get all distributions for the cumulative chart
  const { data: allDists } = await supabase
    .from("distributions")
    .select("*")
    .order("ex_date", { ascending: true });

  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      {/* Header */}
      <header className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="h-9 w-9 rounded-lg bg-gradient-to-br from-blue-500 to-violet-600 flex items-center justify-center">
            <Landmark className="h-5 w-5 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-white">My CFO</h1>
            <p className="text-xs text-neutral-500">
              Income-First Engine • SGD 6,094.91/mo target
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <SimulateWithdrawalButton currentPrincipal={currentPrincipal} />
          <UserMenu email={user?.email ?? ""} />
        </div>
      </header>

      {/* KPI Cards */}
      <section className="mb-6">
        <KPICards />
      </section>

      {/* Warning Panel */}
      <section className="mb-6">
        <WarningPanel />
      </section>

      {/* Sleeves Table */}
      <section className="mb-6">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-medium text-neutral-300 uppercase tracking-wider">
            Active Sleeves
          </h2>
        </div>
        <SleevesTable />
      </section>

      {/* History Charts */}
      <section className="mb-6">
        <h2 className="text-sm font-medium text-neutral-300 uppercase tracking-wider mb-3">
          History
        </h2>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div className="rounded-xl border border-white/10 bg-white/[0.02] p-4">
            <h3 className="text-xs font-medium text-neutral-400 mb-3">Principal Balance Over Time</h3>
            <PrincipalChart snapshots={(allSnapshots ?? []) as PrincipalSnapshot[]} />
          </div>
          <div className="rounded-xl border border-white/10 bg-white/[0.02] p-4">
            <h3 className="text-xs font-medium text-neutral-400 mb-3">Cumulative Cash Extracted</h3>
            <CumulativeCashChart distributions={(allDists ?? []) as Distribution[]} />
          </div>
        </div>
      </section>

      {/* Two-column: Recent Distributions + Audit Log */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Distributions */}
        <section>
          <h2 className="text-sm font-medium text-neutral-300 uppercase tracking-wider mb-3">
            Recent Distributions
          </h2>
          <div className="rounded-xl border border-white/10 bg-white/[0.02] overflow-hidden">
            {recentDists && recentDists.length > 0 ? (
              <div className="divide-y divide-white/5">
                {recentDists.map((d) => {
                  const sleeve = d.sleeves as unknown as { name: string } | null;
                  return (
                    <div
                      key={d.id}
                      className="px-4 py-3 flex items-center justify-between hover:bg-white/[0.02] transition-colors"
                    >
                      <div>
                        <p className="text-sm text-white font-medium">
                          {sleeve?.name ?? "Unknown"}
                        </p>
                        <p className="text-xs text-neutral-500">{d.ex_date}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-emerald-400 font-medium tabular-nums">
                          +SGD{" "}
                          {Number(d.net).toLocaleString("en-SG", {
                            minimumFractionDigits: 2,
                          })}
                        </p>
                        <p className="text-xs text-neutral-500 tabular-nums">
                          Gross: SGD{" "}
                          {Number(d.gross).toLocaleString("en-SG", {
                            minimumFractionDigits: 2,
                          })}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="p-6 text-center">
                <p className="text-sm text-neutral-400">
                  No distributions yet. Log your first via a sleeve above.
                </p>
              </div>
            )}
          </div>
        </section>

        {/* Audit Log */}
        <section>
          <h2 className="text-sm font-medium text-neutral-300 uppercase tracking-wider mb-3">
            Audit Log
          </h2>
          <RecentActivity />
        </section>
      </div>
    </main>
  );
}
