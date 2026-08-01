# Architecture

## Stack
- **Frontend:** Next.js (App Router) + Tailwind + shadcn/ui
- **Backend:** Supabase (Postgres + RLS)
- **Deploy:** Vercel

## System Components (V1 Complete)

### 1. Data Model & Engine
- Sleeve CRUD + distribution logging + withdrawal simulation + principal tracking
- Replacement-trigger workflow (flag sleeve → pre-execution check → approve replacement trade)
- Warning engine detecting three thresholds in real-time
- Build-up vs distribution window phase awareness
- Historical charts (principal curve, cumulative cash)

### 2. Lock-down (Auth)
- Supabase auth with Magic Link via Resend SMTP
- Strict Row Level Security (RLS) on all tables matching `auth.uid() = user_id`
- Server-side auth guards on all data modification actions

### 3. Brokerage API Integration & Local Dev
- Pre-build automation script (`scripts/sync_moomoo.ts`) connects to a local Moomoo OpenD gateway
- Sync script fetches latest prices and upserts into `market_data` table and active `sleeves`
- Graceful mock-data fallback outputting a `build-stamp.json` file for the dashboard UI
- Hardcoded secrets strictly managed via 1Password CLI (`op run`) for local development

## Key User Action Flow (Log a weekly distribution)
1. **Capture:** Robert opens dashboard, clicks "Log Distribution" on ARMW sleeve
2. **Structure:** Form captures ex-date, gross amount; system computes withholding (30%) and net
3. **Store:** Row inserted into `distributions`; sleeve's `last_ex_date` updated; `principal_snapshots` recalculated; audit row written
4. **Show:** Dashboard refreshes — principal balance, cumulative cash, monthly total all update
5. **Rank:** Warning engine checks three thresholds; if any breached, warning row created and shown on dashboard
6. **Act:** If monthly withdrawal date (1st) is reached, simulate withdrawal — deduct from principal, log to audit

## Planned Project-Cycle Boundaries

The future project-cycle model is additive and must not reinterpret the existing deterministic v1 ledger:

1. An owner explicitly adopts an existing `principal_snapshots` row as a cycle baseline.
2. The referenced snapshot remains unchanged; the cycle stores protected principal and reconciliation state separately.
3. Statement deposits are assigned to the cycle and summed for reconciliation.
4. A variance is surfaced for owner confirmation instead of changing principal automatically.
5. Statement-confirmed actual withdrawals contribute to cumulative extracted; simulations and distributions remain separate measures.

Project cycles and distribution archive batches have different lifetimes. `distributions.archive_batch_id` must not be reused as a project-cycle identifier. Archiving distributions does not change the cycle principal, and actual withdrawals may be reconciled after their related distribution batch is archived.

Authenticated owner data remains protected by RLS. Any future public demo is a separate synthetic-data surface with no path to production owner records. Moomoo OpenD remains a local synchronization dependency; cloud UI must expose freshness rather than imply continuous connectivity.

## Layer Plan
1. **Data:** Postgres tables with constraints (gross ≥ 0, withholding = gross × 0.30, net = gross − withholding)
2. **App Logic:** Server-side functions for principal recalculation, warning detection, withdrawal execution
3. **Smart Features (Planned for Sprint 5):** AI-assisted sleeve decay detection, distribution anomaly flagging via WebLLM

## Why Core Works Without AI
All v1 logic is deterministic: withholding is computed, net is derived, principal is arithmetic, warnings are threshold comparisons. No AI needed for the core loop. AI is additive later for pattern recognition.
