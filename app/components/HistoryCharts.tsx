"use client";

import {
  LineChart,
  Line,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
} from "recharts";
import type { PrincipalSnapshot, Distribution } from "@/lib/types";
import { TARGET_CUMULATIVE } from "@/lib/types";

function formatSGD(n: number) {
  return `SGD ${n.toLocaleString("en-SG", { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;
}

function formatDate(dateStr: string) {
  const d = new Date(dateStr);
  return d.toLocaleDateString("en-SG", { day: "2-digit", month: "short" });
}

const CustomTooltip = ({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: Array<{ value: number; name: string }>;
  label?: string;
}) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-lg border border-white/10 bg-neutral-900/95 backdrop-blur-sm px-3 py-2 shadow-xl">
      <p className="text-xs text-neutral-400 mb-1">{label}</p>
      {payload.map((p, i) => (
        <p key={i} className="text-sm font-medium text-white">
          {formatSGD(p.value)}
        </p>
      ))}
    </div>
  );
};

export function PrincipalChart({
  snapshots,
}: {
  snapshots: PrincipalSnapshot[];
}) {
  const data = snapshots
    .sort((a, b) => new Date(a.as_of).getTime() - new Date(b.as_of).getTime())
    .map((s) => ({
      date: formatDate(s.as_of),
      balance: Number(s.balance),
    }));

  if (data.length === 0) {
    return (
      <div className="h-64 flex items-center justify-center text-neutral-500 text-sm">
        No principal snapshots yet.
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={280}>
      <LineChart data={data}>
        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
        <XAxis
          dataKey="date"
          tick={{ fill: "#737373", fontSize: 11 }}
          axisLine={{ stroke: "rgba(255,255,255,0.1)" }}
        />
        <YAxis
          tick={{ fill: "#737373", fontSize: 11 }}
          axisLine={{ stroke: "rgba(255,255,255,0.1)" }}
          tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`}
        />
        <Tooltip content={<CustomTooltip />} />
        <Line
          type="monotone"
          dataKey="balance"
          stroke="#3b82f6"
          strokeWidth={2}
          dot={{ fill: "#3b82f6", r: 3 }}
          activeDot={{ r: 5 }}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}

export function CumulativeCashChart({
  distributions,
}: {
  distributions: Distribution[];
}) {
  // Sort by date and compute running cumulative
  const sorted = [...distributions].sort(
    (a, b) => new Date(a.ex_date).getTime() - new Date(b.ex_date).getTime()
  );

  let cumulative = 0;
  const data = sorted.map((d) => {
    cumulative += Number(d.net);
    return {
      date: formatDate(d.ex_date),
      cumulative,
    };
  });

  if (data.length === 0) {
    return (
      <div className="h-64 flex items-center justify-center text-neutral-500 text-sm">
        No distributions yet.
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={280}>
      <AreaChart data={data}>
        <defs>
          <linearGradient id="cumulativeGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3} />
            <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
        <XAxis
          dataKey="date"
          tick={{ fill: "#737373", fontSize: 11 }}
          axisLine={{ stroke: "rgba(255,255,255,0.1)" }}
        />
        <YAxis
          tick={{ fill: "#737373", fontSize: 11 }}
          axisLine={{ stroke: "rgba(255,255,255,0.1)" }}
          tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`}
        />
        <Tooltip content={<CustomTooltip />} />
        <ReferenceLine
          y={TARGET_CUMULATIVE}
          stroke="#f59e0b"
          strokeDasharray="5 5"
          label={{
            value: `Target: ${formatSGD(TARGET_CUMULATIVE)}`,
            position: "insideTopRight",
            fill: "#f59e0b",
            fontSize: 10,
          }}
        />
        <Area
          type="monotone"
          dataKey="cumulative"
          stroke="#8b5cf6"
          strokeWidth={2}
          fill="url(#cumulativeGradient)"
          dot={{ fill: "#8b5cf6", r: 3 }}
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}
