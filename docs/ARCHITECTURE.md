# Architecture

## Stack
- **Frontend:** Next.js (App Router) + Tailwind + shadcn/ui
- **Backend:** Supabase (Postgres + RLS)
- **Deploy:** Vercel

## Build Sequencing

### Now (v1)
- Sleeve CRUD + distribution logging + withdrawal simulation + principal tracking + single dashboard with warnings + audit log

### Next
- Replacement-trigger workflow (flag sleeve → pre-execution check → approve replacement trade)
- Build-up vs distribution window phase awareness
- Historical charts (principal curve, cumulative cash)

### Later
- Lock-down: auth + per-user RLS owner policies
- Brokerage API integration (moomoo live data)
- AI-assisted distribution classification and anomaly detection

## Key User Action Flow (Log a weekly distribution)
1. **Capture:** Robert opens dashboard, clicks "Log Distribution" on ARMW sleeve
2. **Structure:** Form captures ex-date, gross amount; system computes withholding (30%) and net
3. **Store:** Row inserted into `distributions`; sleeve's `last_ex_date` updated; `principal_snapshots` recalculated; audit row written
4. **Show:** Dashboard refreshes — principal balance, cumulative cash, monthly total all update
5. **Rank:** Warning engine checks three thresholds; if any breached, warning row created and shown on dashboard
6. **Act:** If monthly withdrawal date (1st) is reached, simulate withdrawal — deduct from principal, log to audit

## Layer Plan
1. **Data:** Postgres tables with constraints (gross ≥ 0, withholding = gross × 0.30, net = gross − withholding)
2. **App Logic:** Server-side functions for principal recalculation, warning detection, withdrawal execution
3. **Smart Features (later):** AI-assisted sleeve decay detection, distribution anomaly flagging

## Why Core Works Without AI
All v1 logic is deterministic: withholding is computed, net is derived, principal is arithmetic, warnings are threshold comparisons. No AI needed for the core loop. AI is additive later for pattern recognition.