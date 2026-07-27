/**
 * adopt_data.js — One-time script to assign orphaned seed data to a user.
 *
 * Usage:
 *   node scripts/adopt_data.js <user-uuid>
 *
 * Environment:
 *   SUPABASE_SERVICE_ROLE_KEY=<your-service-role-key>
 *   NEXT_PUBLIC_SUPABASE_URL=<your-supabase-url>  (or set in .env.local)
 *
 * This script uses the service role key to bypass RLS and update all rows
 * where user_id IS NULL to belong to the specified user UUID.
 */

const { createClient } = require("@supabase/supabase-js");

// Try loading .env.local for the Supabase URL
try {
  require("dotenv").config({ path: ".env.local" });
} catch {
  // dotenv might not be installed; that's okay if env vars are set directly
}

const userId = process.argv[2];
if (!userId) {
  console.error("Usage: node scripts/adopt_data.js <user-uuid>");
  console.error("Example: node scripts/adopt_data.js 12345678-abcd-1234-abcd-123456789012");
  process.exit(1);
}

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !serviceRoleKey) {
  console.error("Missing environment variables:");
  if (!supabaseUrl) console.error("  - NEXT_PUBLIC_SUPABASE_URL");
  if (!serviceRoleKey) console.error("  - SUPABASE_SERVICE_ROLE_KEY");
  console.error("\nSet them or create a .env.local file with the Supabase URL.");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, serviceRoleKey);

const TABLES = [
  "sleeves",
  "distributions",
  "withdrawals",
  "principal_snapshots",
  "warnings",
  "audit_logs",
];

async function main() {
  console.log(`\nAdopting orphaned data for user: ${userId}\n`);

  for (const table of TABLES) {
    const { data, error } = await supabase
      .from(table)
      .update({ user_id: userId })
      .is("user_id", null)
      .select("id");

    if (error) {
      console.error(`  ✗ ${table}: ${error.message}`);
    } else {
      const count = data?.length ?? 0;
      console.log(`  ✓ ${table}: ${count} row(s) adopted`);
    }
  }

  console.log("\nDone! Refresh your dashboard to see the data.\n");
}

main();
