import { createClient } from "@/lib/supabase/server";
import {
  TARGET_MONTHLY_NET,
  TARGET_CUMULATIVE,
} from "@/lib/types";
import { TrendingUp, Wallet, DollarSign, Target } from "lucide-react";

function formatSGD(n: number) {
  return new Intl.NumberFormat("en-SG", {
    style: "currency",
    currency: "SGD",
    minimumFractionDigits: 2,
  }).format(n);
}

export async function KPICards() {
  const supabase = await createClient();

  // Latest principal
  const { data: latestSnap } = await supabase
    .from("principal_snapshots")
    .select("balance")
    .order("as_of", { ascending: false })
    .limit(1)
    .single();
  const principal = latestSnap ? Number(latestSnap.balance) : 0;

  // Monthly cash received (net distributions this month)
  const now = new Date();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1)
    .toISOString()
    .split("T")[0];
  const monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0)
    .toISOString()
    .split("T")[0];

  const { data: monthDists } = await supabase
    .from("distributions")
    .select("net")
    .gte("ex_date", monthStart)
    .lte("ex_date", monthEnd);
  const monthlyCash = (monthDists ?? []).reduce(
    (sum, d) => sum + Number(d.net),
    0
  );

  // Cumulative cash extracted (all-time net)
  const { data: allDists } = await supabase
    .from("distributions")
    .select("net");
  const cumulative = (allDists ?? []).reduce(
    (sum, d) => sum + Number(d.net),
    0
  );

  // Progress toward target
  const progress = TARGET_CUMULATIVE > 0 ? (cumulative / TARGET_CUMULATIVE) * 100 : 0;

  const cards = [
    {
      label: "Principal Balance",
      value: formatSGD(principal),
      icon: Wallet,
      color: "text-blue-400",
      bg: "from-blue-500/10 to-blue-600/5",
    },
    {
      label: "Monthly Cash (Net)",
      value: formatSGD(monthlyCash),
      sub: `Target: ${formatSGD(TARGET_MONTHLY_NET)}`,
      icon: DollarSign,
      color: "text-emerald-400",
      bg: "from-emerald-500/10 to-emerald-600/5",
    },
    {
      label: "Cumulative Extracted",
      value: formatSGD(cumulative),
      icon: TrendingUp,
      color: "text-violet-400",
      bg: "from-violet-500/10 to-violet-600/5",
    },
    {
      label: "Target Progress",
      value: `${progress.toFixed(1)}%`,
      sub: `of ${formatSGD(TARGET_CUMULATIVE)}`,
      icon: Target,
      color: "text-amber-400",
      bg: "from-amber-500/10 to-amber-600/5",
      progress,
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {cards.map((card) => (
        <div
          key={card.label}
          className={`relative overflow-hidden rounded-xl border border-white/10 bg-gradient-to-br ${card.bg} backdrop-blur-sm p-5`}
        >
          <div className="flex items-start justify-between">
            <div className="space-y-1">
              <p className="text-xs font-medium text-neutral-400 uppercase tracking-wider">
                {card.label}
              </p>
              <p className="text-2xl font-bold text-white">{card.value}</p>
              {card.sub && (
                <p className="text-xs text-neutral-500">{card.sub}</p>
              )}
            </div>
            <card.icon className={`h-5 w-5 ${card.color} opacity-80`} />
          </div>
          {card.progress != null && (
            <div className="mt-3">
              <div className="h-1.5 rounded-full bg-white/10 overflow-hidden">
                <div
                  className="h-full rounded-full bg-amber-400 transition-all duration-500"
                  style={{ width: `${Math.min(card.progress, 100)}%` }}
                />
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
