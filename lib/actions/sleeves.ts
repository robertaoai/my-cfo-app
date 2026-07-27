"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { writeAuditLog } from "./audit";
import { checkWarnings } from "./warnings";

/**
 * Create a new sleeve.
 */
export async function createSleeve(formData: FormData) {
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

  if (!name || !role || !entryPrice || !positionSize || !allocationPct) {
    return { error: "Name, role, entry price, position size, and allocation are required." };
  }

  const supabase = await createClient();

  const { data: sleeve, error } = await supabase
    .from("sleeves")
    .insert({
      name,
      role,
      entry_price: entryPrice,
      position_size: positionSize,
      allocation_pct: allocationPct,
      support_level: supportLevel,
      resistance_level: resistanceLevel,
      current_price: entryPrice, // initialise to entry price
    })
    .select("id")
    .single();

  if (error || !sleeve) {
    return { error: error?.message ?? "Failed to create sleeve." };
  }

  await writeAuditLog("sleeve_created", "sleeves", sleeve.id, {
    name,
    role,
    entry_price: entryPrice,
  });

  revalidatePath("/");
  return { success: true };
}

/**
 * Update an existing sleeve.
 */
export async function updateSleeve(formData: FormData) {
  const id = formData.get("id") as string;
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

  if (!id) return { error: "Sleeve ID is required." };

  const supabase = await createClient();

  const { error } = await supabase
    .from("sleeves")
    .update({
      name,
      role,
      entry_price: entryPrice,
      position_size: positionSize,
      allocation_pct: allocationPct,
      support_level: supportLevel,
      resistance_level: resistanceLevel,
    })
    .eq("id", id);

  if (error) {
    return { error: error.message };
  }

  await writeAuditLog("sleeve_updated", "sleeves", id, {
    name,
    role,
    entry_price: entryPrice,
  });

  revalidatePath("/");
  return { success: true };
}

/**
 * Manually update the current market price of a sleeve (v1 drawdown tracking).
 */
export async function updateSleevePrice(formData: FormData) {
  const id = formData.get("id") as string;
  const currentPrice = Number(formData.get("current_price"));

  if (!id || currentPrice == null || currentPrice < 0) {
    return { error: "Sleeve ID and a valid price are required." };
  }

  const supabase = await createClient();

  // Fetch old price for audit
  const { data: sleeve } = await supabase
    .from("sleeves")
    .select("current_price, entry_price, name")
    .eq("id", id)
    .single();

  const { error } = await supabase
    .from("sleeves")
    .update({ current_price: currentPrice })
    .eq("id", id);

  if (error) {
    return { error: error.message };
  }

  await writeAuditLog("sleeve_price_updated", "sleeves", id, {
    name: sleeve?.name,
    previous_price: sleeve?.current_price,
    new_price: currentPrice,
    entry_price: sleeve?.entry_price,
  });

  // Re-check warnings (drawdown threshold may trigger)
  await checkWarnings();

  revalidatePath("/");
  return { success: true };
}

/**
 * Delete a sleeve (only if no distributions reference it).
 */
export async function deleteSleeve(formData: FormData) {
  const id = formData.get("id") as string;
  if (!id) return { error: "Sleeve ID is required." };

  const supabase = await createClient();

  // Check for existing distributions
  const { count } = await supabase
    .from("distributions")
    .select("id", { count: "exact", head: true })
    .eq("sleeve_id", id);

  if (count && count > 0) {
    return {
      error: `Cannot delete sleeve — it has ${count} distribution(s). Close it instead.`,
    };
  }

  const { data: sleeve } = await supabase
    .from("sleeves")
    .select("name")
    .eq("id", id)
    .single();

  const { error } = await supabase.from("sleeves").delete().eq("id", id);

  if (error) {
    return { error: error.message };
  }

  await writeAuditLog("sleeve_deleted", "sleeves", id, {
    name: sleeve?.name,
  });

  revalidatePath("/");
  return { success: true };
}
