# Tasks

## Sprint 1 — Core Engine + Dashboard ✅ COMPLETE
**Goal:** The full income-tracking loop works end-to-end.
- [x] Migration: sleeves, distributions, withdrawals, principal_snapshots, warnings, audit_logs + RLS + seed data
- [x] Sleeve CRUD UI: create/edit with entry price, size, allocation, support/resistance
- [x] Distribution logging form: sleeve select, ex-date, gross → auto-compute withholding & net
- [x] On distribution submit: insert row, update sleeve, recompute principal, write audit log
- [x] Withdrawal simulation: enter amount + date, deduct from principal, log to audit
- [x] Principal balance display: latest snapshot, cumulative cash extracted
- [x] Warning engine: check three thresholds after every distribution and withdrawal
- [x] Single dashboard screen: KPI cards, sleeves table, warning panel, history charts, recent activity
- [x] Handle empty states, loading, error toasts

## Sprint 2 — Replacement Workflow + History ✅ COMPLETE
**Goal:** Sleeve decay triggers and replacement approval flow.
- [x] Sleeve status transitions: active → flagged → replaced → closed
- [x] Decay trigger detection: close below support 3 sessions or drawdown >15%
- [x] Replacement proposal form: new entry price, size, allocation
- [x] Approval step: review proposed replacement, confirm to execute
- [x] Principal history chart (line graph)
- [x] Cumulative cash chart (progress toward 581,872)
- [x] Build-up vs distribution window phase indicator

## Sprint 3 — Lock It Down ✅ COMPLETE
**Goal:** Auth + per-user data isolation (solo-user, Magic Link).
- [x] Add Supabase auth (Magic Link via Resend SMTP)
- [x] Replace permissive RLS with `auth.uid() = user_id` on all tables
- [x] Set user_id default to `auth.uid()` on all new rows
- [x] Redirect unauthenticated users to /login
- [x] Auth guards on all 11 Server Action functions
- [x] UserMenu component (email display + sign out)
- [x] PKCE callback route (/auth/callback)
- [x] Data adoption script (scripts/adopt_data.js)
- **Manual Steps (Verified):**
  - [x] Apply 0002 migration (current_price) in Supabase SQL Editor
  - [x] Apply 0003 migration (RLS lock-down) in Supabase SQL Editor
  - [x] Add Vercel callback URL to Supabase Redirect URLs
  - [x] Update Supabase Site URL to production domain
  - [x] First Magic Link login + run adopt_data.js

## Sprint 4 — Automation & Data Export ✅ COMPLETE
**Goal:** Secure local dev, Moomoo API automation, ticker management, CSV export.
### Phase 0: First-Time Setup ✅
- [x] Install & configure 1Password CLI
- [x] Store all 4 keys in 1Password vault
- [x] Create `.env.op` template, remove `.env.local`
- [x] Install & configure Moomoo OpenD
- [x] Verify with `test_moomoo.ts`
### Phase 1: Database Migration ✅
- [x] Create `market_data` table with ticker lifecycle columns
- [x] Add `ticker` column to `sleeves` table
### Phase 2: Pre-Build Sync Script ✅
- [x] Write `scripts/sync_moomoo.ts` to hit OpenD API
- [x] Upsert into `market_data` and update `sleeves.current_price`
- [x] Output `build-stamp.json` 
- [x] Add `prebuild` hook to `package.json`
### Phase 3: Dashboard UI Updates ✅
- [x] Create `build-stamp.default.json` fallback
- [x] Add `public/build-stamp.json` to `.gitignore`
- [x] Parse stamp in `app/page.tsx` and render 🟢/🔴/⚪ indicator in Header
- [x] Fetch active `market_data` tickers
- [x] Refactor Sleeve Creation/Edit dialogs to use Dropdown instead of input
### Phase 4: Frontend CSV Export ✅
- [x] Create generic `<ExportButton>` using zero-dependency Blob APIs
- [x] Inject `<ExportButton>` into Distributions header
- [x] Inject `<ExportButton>` into Audit Log header
### Phase 5: Deprecation Notice & Ticker Migration ✅
- [x] Add `migrateSleeveTicker(id, newTicker)` to Server Actions
- [x] Add `deprecated` visual warning banner in `app/page.tsx` mapping
- [x] Add migration flow to deprecation banner Server Action
### Phase 6: Documentation Update ✅
- [x] Update SECURITY.md, DATA_MODEL.md, ARCHITECTURE.md, PRD.md, TEST_PLAN.md

## Sprint 4.1 — Gap Closures & Polish 🚧 IN PROGRESS
**Goal:** Address bugs and missing data fields discovered during final Sprint 4 verification.
- [ ] UI Gap: Recent Distributions list is missing the stock symbols (tickers) next to the sleeve names.
- [ ] UI Gap: Ensure any other historical data views display full ticker information where appropriate.

## Sprint 5 — Intelligence (WebLLM) 📋 PLANNED
**Goal:** In-browser AI capabilities.
- [ ] AI-assisted distribution classification from pasted brokerage text via WebLLMs
- [ ] Sleeve decay prediction from price history
- [ ] Auto-suggested replacement candidates ranked by yield + risk

## Gantt
Sprint 1:   [xxxx] Core engine + dashboard        ✅
Sprint 2:        [xxxx] Replacement + history      ✅
Sprint 3:            [xxxx] Lock down              ✅
Sprint 4:                [xxxx] Automation & Export ✅
Sprint 4.1:                   [x   ] Gap Closures   🚧
Sprint 5:                          [    ] Intelligence   📋