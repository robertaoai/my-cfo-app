"use server";

import { createClient } from "@/lib/supabase/server";
import { writeAuditLog } from "./audit";
import {
  TARGET_MONTHLY_NET,
  WARNING_INCOME_THRESHOLD,
  WARNING_DRAWDOWN_THRESHOLD,
  WARNING_WITHDRAWAL_THRESHOLD,
} from "@/lib/types";

/**
 * Evaluates all three warning thresholds and upserts/resolves warnings.
 *
 * Called after every distribution or withdrawal.
 */
export async function checkWarnings() {
  const supabase = await createClient();

  // ── Threshold 1: Projected monthly income < 90% of target ──
  const now = new Date();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1)
    .toISOString()
    .split("T")[0];
  const monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0)
    .toISOString()
    .split("T")[0];

  const { data: monthDists } = await supabase
    .from("distributions")
    .select("net, ex_date")
    .gte("ex_date", monthStart)
    .lte("ex_date", monthEnd);

  const totalNetThisMonth = (monthDists ?? []).reduce(
    (sum, d) => sum + Number(d.net),
    0
  );

  // Project: if we're partway through the month, extrapolate
  const dayOfMonth = now.getDate();
  const daysInMonth = new Date(
    now.getFullYear(),
    now.getMonth() + 1,
    0
  ).getDate();
  const projectedMonthly =
    dayOfMonth > 0
      ? (totalNetThisMonth / dayOfMonth) * daysInMonth
      : totalNetThisMonth;

  const incomeThreshold = TARGET_MONTHLY_NET * WARNING_INCOME_THRESHOLD; // 5,485.42

  if (projectedMonthly < incomeThreshold) {
    await upsertWarning(supabase, {
      type: "projected_income_lt_90pct",
      message: `Projected monthly net SGD ${projectedMonthly.toFixed(
        2
      )} is below 90% of target SGD ${TARGET_MONTHLY_NET.toFixed(
        2
      )} (SGD ${incomeThreshold.toFixed(2)})`,
      severity: "amber",
      value: projectedMonthly,
    });
  } else {
    await resolveWarning(supabase, "projected_income_lt_90pct");
  }

  // ── Threshold 2: Weekly drawdown > 15% on any sleeve ──
  const { data: sleeves } = await supabase
    .from("sleeves")
    .select("id, name, entry_price, current_price, status")
    .eq("status", "active");

  let drawdownFlagged = false;
  for (const sleeve of sleeves ?? []) {
    if (sleeve.current_price != null && sleeve.entry_price > 0) {
      const drawdown =
        (sleeve.entry_price - sleeve.current_price) / sleeve.entry_price;
      if (drawdown > WARNING_DRAWDOWN_THRESHOLD) {
        await upsertWarning(supabase, {
          type: "weekly_drawdown_gt_15pct",
          message: `${sleeve.name} current price dropped ${(
            drawdown * 100
          ).toFixed(1)}% from entry price`,
          severity: "red",
          value: drawdown * 100,
        });
        drawdownFlagged = true;
      }
    }
  }
  if (!drawdownFlagged) {
    await resolveWarning(supabase, "weekly_drawdown_gt_15pct");
  }

  // ── Threshold 3: Last withdrawal > 10% of balance ──
  const { data: lastWithdrawal } = await supabase
    .from("withdrawals")
    .select("amount, principal_before")
    .order("created_at", { ascending: false })
    .limit(1)
    .single();

  if (lastWithdrawal && lastWithdrawal.principal_before > 0) {
    const ratio =
      Number(lastWithdrawal.amount) / Number(lastWithdrawal.principal_before);
    if (ratio > WARNING_WITHDRAWAL_THRESHOLD) {
      await upsertWarning(supabase, {
        type: "withdrawal_gt_10pct_balance",
        message: `Last withdrawal (SGD ${Number(
          lastWithdrawal.amount
        ).toFixed(2)}) is ${(ratio * 100).toFixed(
          1
        )}% of principal — exceeds 10% threshold`,
        severity: "red",
        value: ratio * 100,
      });
    } else {
      await resolveWarning(supabase, "withdrawal_gt_10pct_balance");
    }
  }
}

// ── Helpers ──

async function upsertWarning(
  supabase: Awaited<ReturnType<typeof createClient>>,
  warning: {
    type: string;
    message: string;
    severity: string;
    value: number;
  }
) {
  // Check if an unresolved warning of this type already exists
  const { data: existing } = await supabase
    .from("warnings")
    .select("id")
    .eq("type", warning.type)
    .eq("resolved", false)
    .limit(1)
    .single();

  if (existing) {
    // Update existing warning with latest values
    await supabase
      .from("warnings")
      .update({
        message: warning.message,
        severity: warning.severity,
        value: warning.value,
      })
      .eq("id", existing.id);
  } else {
    // Insert new warning
    const { data: inserted } = await supabase
      .from("warnings")
      .insert({
        type: warning.type,
        message: warning.message,
        severity: warning.severity,
        value: warning.value,
        resolved: false,
      })
      .select("id")
      .single();

    if (inserted) {
      await writeAuditLog("warning_raised", "warnings", inserted.id, {
        type: warning.type,
        severity: warning.severity,
        value: warning.value,
      });
    }
  }
}

async function resolveWarning(
  supabase: Awaited<ReturnType<typeof createClient>>,
  type: string
) {
  const { data: existing } = await supabase
    .from("warnings")
    .select("id")
    .eq("type", type)
    .eq("resolved", false);

  if (existing && existing.length > 0) {
    await supabase
      .from("warnings")
      .update({ resolved: true })
      .eq("type", type)
      .eq("resolved", false);

    for (const w of existing) {
      await writeAuditLog("warning_resolved", "warnings", w.id, { type });
    }
  }
}
