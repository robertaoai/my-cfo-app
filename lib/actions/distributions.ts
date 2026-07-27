"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { writeAuditLog } from "./audit";
import { checkWarnings } from "./warnings";

/**
 * Log a weekly distribution receipt.
 *
 * 1. Insert into distributions (withholding/net are DB-generated columns).
 * 2. Fetch latest principal snapshot.
 * 3. Insert new principal snapshot (balance + net).
 * 4. Update sleeve's last_ex_date.
 * 5. Check warning thresholds.
 * 6. Write audit log.
 */
export async function logDistribution(formData: FormData) {
  const sleeveId = formData.get("sleeve_id") as string;
  const exDate = formData.get("ex_date") as string;
  const gross = Number(formData.get("gross"));

  if (!sleeveId || !exDate || !gross || gross <= 0) {
    return { error: "Sleeve, ex-date, and a positive gross amount are required." };
  }

  const supabase = await createClient();

  // Auth guard
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Unauthorized" };

  // 1. Insert distribution
  const { data: dist, error: distErr } = await supabase
    .from("distributions")
    .insert({ sleeve_id: sleeveId, ex_date: exDate, gross })
    .select("id, net")
    .single();

  if (distErr || !dist) {
    console.error("[distribution] Insert failed:", distErr?.message);
    return { error: distErr?.message ?? "Failed to log distribution." };
  }

  const net = Number(dist.net);

  // 2. Latest principal
  const { data: latestSnap } = await supabase
    .from("principal_snapshots")
    .select("balance")
    .order("as_of", { ascending: false })
    .limit(1)
    .single();

  const currentBalance = latestSnap ? Number(latestSnap.balance) : 0;
  const newBalance = currentBalance + net;

  // 3. New principal snapshot
  await supabase.from("principal_snapshots").insert({
    balance: newBalance,
    as_of: new Date().toISOString(),
    note: `Distribution logged: +SGD ${net.toFixed(2)} net (gross ${gross.toFixed(2)})`,
  });

  // 4. Update sleeve last_ex_date
  await supabase
    .from("sleeves")
    .update({ last_ex_date: exDate })
    .eq("id", sleeveId);

  // 5. Check warnings
  await checkWarnings();

  // 6. Audit log
  await writeAuditLog("distribution_logged", "distributions", dist.id, {
    sleeve_id: sleeveId,
    ex_date: exDate,
    gross,
    net,
    principal_before: currentBalance,
    principal_after: newBalance,
  });

  revalidatePath("/");
  return { success: true, net, newBalance };
}
