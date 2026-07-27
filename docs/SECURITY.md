# Security

## Secret Handling
- Supabase service key stored server-side only (env var, never client)
- Client uses anon key with RLS — no privilege escalation possible
- No brokerage API keys in v1 (paper trading, manual entry)

## Permission Model
- **v1 (demo-first):** No login wall. Permissive RLS on all tables — anonymous can read and write demo data. Seed rows have NULL user_id.
- **Lock-down (later):** Enable auth. Replace permissive policies with `auth.uid() = user_id` on every table. Seed demo rows assigned to a demo user or removed.

## Approved-Tools Rule
- Only named server-side functions: `log_distribution`, `execute_withdrawal`, `check_warnings`
- No raw SQL execution from client; all writes go through Supabase client with RLS enforced
- No arbitrary code execution endpoint

## Audit Principle
- Every write to distributions, withdrawals, sleeves, or warnings generates an audit_logs row
- Audit rows are append-only (no update/delete without elevated privilege)
- Metadata captures before/after state for traceability