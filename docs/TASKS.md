# Tasks

## Sprint 1 — Core Engine + Dashboard (v1 functional milestone)
**Goal:** The full income-tracking loop works end-to-end against the database, viewable without login.
- [ ] Create migration: sleeves, distributions, withdrawals, principal_snapshots, warnings, audit_logs tables + RLS + seed data
- [ ] Sleeve CRUD UI: create/edit ARMW & AMDW with entry price, size, allocation, support/resistance
- [ ] Distribution logging form: sleeve select, ex-date, gross → auto-compute withholding & net
- [ ] On distribution submit: insert row, update sleeve last_ex_date, recompute principal snapshot, write audit log
- [ ] Withdrawal simulation: enter amount + date, deduct from principal, log to audit
- [ ] Principal balance display: latest snapshot, cumulative cash extracted
- [ ] Warning engine: check three thresholds after every distribution and withdrawal; display on dashboard
- [ ] Single dashboard screen: monthly cash received (post-tax), cumulative extracted, principal balance, active sleeves table, warning panel
- [ ] Handle empty states (no distributions yet), loading, error toasts
- **Definition of Done:** Open dashboard without login → see seeded SGD 330k principal + ARMW sleeve → log a new distribution → principal updates → simulate monthly withdrawal → warning panel shows green or flagged — all persisted and timestamped.

## Sprint 2 — Replacement Workflow + History
**Goal:** Sleeve decay triggers and replacement approval flow.
- [ ] Sleeve status transitions: active → flagged → replaced → closed
- [ ] Decay trigger detection: close below support 3 sessions or drawdown >15%
- [ ] Replacement proposal form: new entry price, size, allocation for replacement sleeve
- [ ] Approval step: review proposed replacement, confirm to execute
- [ ] Principal history chart (line graph)
- [ ] Cumulative cash chart (progress toward 581,872)
- [ ] Build-up vs distribution window phase indicator
- **Definition of Done:** Flag ARMW sleeve via decay trigger → see replacement proposal → approve → sleeve status becomes 'replaced' → new sleeve active → audit logged.

## Sprint 3 — Lock It Down
**Goal:** Auth + per-user data isolation.
- [ ] Add Supabase auth (email/password)
- [ ] Replace permissive RLS with `auth.uid() = user_id` on all tables
- [ ] Set user_id on all new rows from session
- [ ] Redirect unauthenticated users to /login (but keep a public demo view)
- [ ] Assign seed data to demo account
- **Definition of Done:** New user signs up → sees only their own data → cannot read another user's sleeves or distributions.

## Sprint 4 — Smart Features (Later)
- [ ] AI-assisted distribution classification from pasted brokerage text
- [ ] Sleeve decay prediction from price history
- [ ] Auto-suggested replacement candidates ranked by yield + risk
- [ ] Export audit log as CSV

## Gantt
```
Sprint 1: [====] Core engine + dashboard
Sprint 2:      [====] Replacement + history
Sprint 3:          [====] Lock down
Sprint 4:              [====] Smart features
```