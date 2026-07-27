# Income-First Engine — PRD

## Problem
Solo business owner Robert needs to validate an income-generation strategy via paper trading (moomoo) before committing real capital. Goal: monthly post-tax distributions ≥ SGD 6,094.91 for 24 months (Sep 2026–Sep 2028), cumulative SGD 581,872, starting from SGD 330,000. He needs a single dashboard to log weekly distributions, track principal, execute monthly withdrawals, and flag when thresholds are breached.

## Target User
Self / business owner acting as their own CFO. Replaces weekly manual spreadsheet work with a structured dashboard so focus shifts to income-symbol selection.

## Core Objects
- **Sleeves** — ARMW (primary) & AMDW (secondary); each holds entry price, size, allocation %, support/resistance levels, decay trigger state.
- **Distributions** — per-sleeve weekly receipts: ex-date, gross, withholding (30%), net, timestamp.
- **Withdrawals** — monthly 1st-of-month simulated withdrawals (target SGD 6,094.91).
- **Principal Snapshots** — running market-value balance after each distribution and withdrawal.
- **Warnings** — flag records for the three thresholds.
- **Audit Logs** — timestamped action log for every meaningful event.

## MVP (v1) Checklist
- [ ] Sleeve CRUD with entry/allocation/support/resistance fields
- [ ] Distribution logging (ex-date, gross, withholding, net) per sleeve
- [ ] Monthly withdrawal simulation on 1st
- [ ] Principal balance auto-updates from distributions + withdrawals
- [ ] Dashboard: monthly cash received, cumulative extracted, principal, active sleeves, warning flags
- [ ] Three warning signals: projected income <90% target; weekly drawdown >15%; monthly withdrawal >10% remaining balance
- [ ] Audit log for all writes
- [ ] Seeded demo data (build-up window + first distributions)

## Non-Goals (v1)
No live trading, leverage, exotic instruments, tax optimization, daily rebalancing, AI recommendations, multi-user access, real brokerage API.

## Success Criteria
Robert opens the dashboard, sees seeded SGD 330k principal with ARMW active, logs a weekly distribution of SGD 1,200 gross (SGD 840 net), sees principal update to SGD 330,840, triggers the monthly withdrawal of SGD 6,094.91, and the warning panel shows green or a flagged threshold — all timestamped in the audit log.