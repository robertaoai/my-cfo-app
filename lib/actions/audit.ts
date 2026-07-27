"use server";

import { createClient } from "@/lib/supabase/server";

export async function writeAuditLog(
  action: string,
  entityType: string,
  entityId: string,
  metadata?: Record<string, unknown>
) {
  const supabase = await createClient();

  // Auth guard — silently skip if no session (audit is best-effort)
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return;

  const { error } = await supabase.from("audit_logs").insert({
    action,
    entity_type: entityType,
    entity_id: entityId,
    metadata: metadata ?? null,
  });
  if (error) {
    console.error("[audit] Failed to write audit log:", error.message);
  }
}
