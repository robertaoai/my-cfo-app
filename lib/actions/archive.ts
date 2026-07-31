"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { writeAuditLog } from "./audit";

/**
 * Archive the current cycle of distributions.
 */
export async function archiveCurrentCycle() {
  const supabase = await createClient();

  // Auth guard
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Unauthorized" };

  // Generate a random UUID for the batch
  const batchId = crypto.randomUUID();

  // Update all unarchived distributions
  const { error } = await supabase
    .from("distributions")
    .update({ archive_batch_id: batchId })
    .is("archive_batch_id", null);

  if (error) {
    return { error: error.message };
  }

  await writeAuditLog("cycle_archived", "distributions", batchId, { batchId });

  revalidatePath("/");
  return { success: true, batchId };
}

/**
 * Undo the archiving of a specific batch.
 */
export async function undoArchive(batchId: string) {
  const supabase = await createClient();

  // Auth guard
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Unauthorized" };

  // Revert the batch
  const { error } = await supabase
    .from("distributions")
    .update({ archive_batch_id: null })
    .eq("archive_batch_id", batchId);

  if (error) {
    return { error: error.message };
  }

  await writeAuditLog("cycle_unarchived", "distributions", batchId, { batchId });

  revalidatePath("/");
  return { success: true };
}
