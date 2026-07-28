# Security

## Secret Handling
- **1Password CLI (`op run`):** All secrets (Supabase URLs, App URLs) are stripped from plaintext `.env` files. The project uses an `.env.op` template, injecting variables strictly at runtime via `op run`.
- **Supabase Service Key:** Stored server-side and accessed only by the pre-build sync script (`sync_moomoo.ts`) to bypass RLS for background syncing.
- **Client Keys:** The client uses the anon key with RLS — no privilege escalation possible.
- **Brokerage API:** We integrate locally via Moomoo OpenD (`127.0.0.1:11111`). Traffic never leaves localhost.

## Permission Model
- **Lock-down (Enabled):** The app enforces Supabase Auth (Magic Link). All Postgres tables use strict Row Level Security (RLS) policies (`auth.uid() = user_id`), ensuring complete data isolation between users. Unauthenticated visitors are redirected to `/login`.

## Approved-Tools Rule
- Only named server-side functions: `log_distribution`, `execute_withdrawal`, `check_warnings`
- No raw SQL execution from client; all writes go through Supabase client with RLS enforced
- No arbitrary code execution endpoint

## Audit Principle
- Every write to distributions, withdrawals, sleeves, or warnings generates an audit_logs row
- Audit rows are append-only (no update/delete without elevated privilege)
- Metadata captures before/after state for traceability