"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { writeAuditLog } from "./audit";
import { checkWarnings } from "./warnings";

/**
 * Simulate a monthly withdrawal.
 *
 * 1. Fetch latest principal snapshot.
 * 2. Validate amount ≤ current balance.
 * 3. Insert withdrawal row.
 * 4. Insert new principal snapshot (balance − amount).
 * 5. Check warning thresholds.
 * 6. Write audit log.
 */
export async function simulateWithdrawal(formData: FormData) {
  const withdrawalDate = formData.get("withdrawal_date") as string;
  const amount = Number(formData.get("amount"));

  if (!withdrawalDate || !amount || amount <= 0) {
    return { error: "A valid date and positive amount are required." };
  }

  const supabase = await createClient();

  // Auth guard
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Unauthorized" };

  // 1. Latest principal
  const { data: latestSnap } = await supabase
    .from("principal_snapshots")
    .select("balance")
    .order("as_of", { ascending: false })
    .limit(1)
    .single();

  const currentBalance = latestSnap ? Number(latestSnap.balance) : 0;

  // 2. Validate
  if (amount > currentBalance) {
    return {
      error: `Withdrawal SGD ${amount.toFixed(
        2
      )} exceeds current principal SGD ${currentBalance.toFixed(2)}.`,
    };
  }

  const newBalance = currentBalance - amount;

  // 3. Insert withdrawal
  const { data: wd, error: wdErr } = await supabase
    .from("withdrawals")
    .insert({
      withdrawal_date: withdrawalDate,
      amount,
      principal_before: currentBalance,
      principal_after: newBalance,
      status: "executed",
    })
    .select("id")
    .single();

  if (wdErr || !wd) {
    console.error("[withdrawal] Insert failed:", wdErr?.message);
    return { error: wdErr?.message ?? "Failed to execute withdrawal." };
  }

  // 4. New principal snapshot
  await supabase.from("principal_snapshots").insert({
    balance: newBalance,
    as_of: new Date().toISOString(),
    note: `Withdrawal executed: −SGD ${amount.toFixed(2)}`,
  });

  // 5. Check warnings
  await checkWarnings();

  // 6. Audit log
  await writeAuditLog("withdrawal_executed", "withdrawals", wd.id, {
    withdrawal_date: withdrawalDate,
    amount,
    principal_before: currentBalance,
    principal_after: newBalance,
  });

  revalidatePath("/");
  return { success: true, newBalance };
}
