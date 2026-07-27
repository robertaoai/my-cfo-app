"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { writeAuditLog } from "./audit";
import type { DecayTrigger } from "@/lib/types";

/**
 * Flag a sleeve for decay/replacement.
 */
export async function flagSleeve(formData: FormData) {
  const sleeveId = formData.get("sleeve_id") as string;
  const trigger = formData.get("trigger") as DecayTrigger;

  if (!sleeveId || !trigger) {
    return { error: "Sleeve ID and trigger reason are required." };
  }

  const supabase = await createClient();

  // Auth guard
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Unauthorized" };

  const { data: sleeve } = await supabase
    .from("sleeves")
    .select("name, status")
    .eq("id", sleeveId)
    .single();

  if (!sleeve) return { error: "Sleeve not found." };
  if (sleeve.status !== "active") return { error: "Only active sleeves can be flagged." };

  const { error } = await supabase
    .from("sleeves")
    .update({ status: "flagged", decay_trigger: trigger })
    .eq("id", sleeveId);

  if (error) return { error: error.message };

  await writeAuditLog("sleeve_flagged", "sleeves", sleeveId, {
    name: sleeve.name,
    trigger,
  });

  revalidatePath("/");
  return { success: true };
}

/**
 * Execute a replacement: mark old sleeve as 'replaced', create new sleeve as 'active'.
 */
export async function executeReplacement(formData: FormData) {
  const flaggedSleeveId = formData.get("flagged_sleeve_id") as string;
  const name = formData.get("name") as string;
  const role = formData.get("role") as string;
  const entryPrice = Number(formData.get("entry_price"));
  const positionSize = Number(formData.get("position_size"));
  const allocationPct = Number(formData.get("allocation_pct"));
  const supportLevel = formData.get("support_level")
    ? Number(formData.get("support_level"))
    : null;
  const resistanceLevel = formData.get("resistance_level")
    ? Number(formData.get("resistance_level"))
    : null;

  if (!flaggedSleeveId || !name || !entryPrice || !positionSize || !allocationPct) {
    return { error: "All replacement sleeve fields are required." };
  }

  const supabase = await createClient();

  // Auth guard
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Unauthorized" };

  // Verify old sleeve is flagged
  const { data: oldSleeve } = await supabase
    .from("sleeves")
    .select("name, status")
    .eq("id", flaggedSleeveId)
    .single();

  if (!oldSleeve) return { error: "Flagged sleeve not found." };
  if (oldSleeve.status !== "flagged") return { error: "Sleeve must be flagged before replacement." };

  // Mark old sleeve as replaced
  const { error: updateErr } = await supabase
    .from("sleeves")
    .update({ status: "replaced" })
    .eq("id", flaggedSleeveId);

  if (updateErr) return { error: updateErr.message };

  // Create new sleeve
  const { data: newSleeve, error: insertErr } = await supabase
    .from("sleeves")
    .insert({
      name,
      role,
      entry_price: entryPrice,
      position_size: positionSize,
      allocation_pct: allocationPct,
      support_level: supportLevel,
      resistance_level: resistanceLevel,
      current_price: entryPrice,
    })
    .select("id")
    .single();

  if (insertErr || !newSleeve) {
    // Rollback old sleeve status
    await supabase
      .from("sleeves")
      .update({ status: "flagged" })
      .eq("id", flaggedSleeveId);
    return { error: insertErr?.message ?? "Failed to create replacement sleeve." };
  }

  // Audit both events
  await writeAuditLog("sleeve_replaced", "sleeves", flaggedSleeveId, {
    old_name: oldSleeve.name,
    new_sleeve_id: newSleeve.id,
    new_name: name,
  });
  await writeAuditLog("sleeve_created", "sleeves", newSleeve.id, {
    name,
    role,
    entry_price: entryPrice,
    replaced_from: oldSleeve.name,
  });

  revalidatePath("/");
  return { success: true, newSleeveId: newSleeve.id };
}
