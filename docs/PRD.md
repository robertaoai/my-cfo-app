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
- [x] Sleeve CRUD with entry/allocation/support/resistance fields
- [x] Distribution logging (ex-date, gross, withholding, net) per sleeve
- [x] Monthly withdrawal simulation on 1st
- [x] Principal balance auto-updates from distributions + withdrawals
- [x] Dashboard: monthly cash received, cumulative extracted, principal, active sleeves, warning flags
- [x] Three warning signals: projected income <90% target; weekly drawdown >15%; monthly withdrawal >10% remaining balance
- [x] Audit log for all writes
- [x] Seeded demo data (build-up window + first distributions)

## Non-Goals (v1)
No live trading execution, leverage, exotic instruments, tax optimization, daily rebalancing, AI recommendations (planned for v2), multi-user access (currently isolated solo-user).

## Success Criteria
Robert opens the dashboard, sees seeded SGD 330k principal with ARMW active, logs a weekly distribution of SGD 1,200 gross (SGD 840 net), sees principal update to SGD 330,840, triggers the monthly withdrawal of SGD 6,094.91, and the warning panel shows green or a flagged threshold — all timestamped in the audit log.

## Project-Cycle Principal and Statement Reconciliation (Planned)

The principal entered by the business owner in the UI is the protected principal for a new project cycle. It is authoritative for that cycle and remains separate from earlier Moomoo account history, market values, distribution cycles, and withdrawal simulations.

When a later monthly Moomoo statement contains one or more deposits assigned to the cycle:

`statement deposit total = sum of statement deposits assigned to the project cycle`

`reconciliation variance = statement deposit total - protected cycle principal`

A zero variance confirms the entered principal. A non-zero variance requires owner review and must never silently overwrite it. Any accepted correction preserves the original principal, reconciled amount, variance, statement reference, effective date, decision actor and timestamp, and an explanatory audit record.

Historical market values and deposits may be displayed as context or evidence, but are not added to the new cycle principal. Missing earlier statements do not invalidate the protected principal entered for the new cycle.

The product keeps these concepts distinct:

- Protected cycle principal: owner-entered capital assigned to the new project.
- Distribution cycle: ticker-level gross, withholding, and net distributions measured toward the income goal.
- Withdrawal simulation: a proposal that may be run at any time during the month.
- Reconciled withdrawal: an actual withdrawal confirmed by a later statement.
- Account market value: Moomoo account context and reconciliation evidence.
- Historical values: account activity before the protected project cycle.

Archiving a distribution batch does not close, replace, or reset the protected project cycle. "Cumulative extracted" means the sum of statement-reconciled actual withdrawals, reported separately from distributions and simulations.

Sleeve allocations from 0% through 100% remain valid. The preferred operating range is 10% through 25% per sleeve; values outside it produce a non-blocking, sleeve-specific warning.

Production remains authenticated with owner-scoped data. A future public demo is a separate outreach feature using synthetic data isolated from production records.

During the proof of concept, Moomoo OpenD synchronization remains a local operator task. The dashboard should disclose the last successful synchronization and must not imply that stale cloud data is live.

## Operating Model (Odysseus x GStack)
This project is governed by a strict two-tier development operating model:
- **[Odysseus Sandbox](odysseus/README.md)**: An isolated workspace (`docs/odysseus/`) for unstructured financial ideation and UI exploration.
- **[GStack Factory](GSTACK_PROCESS.md)**: A structured engineering protocol (`docs/GSTACK_PROCESS.md`) using strict slash-commands to promote and validate features into production. All actionable tasks are strictly managed within `docs/TASKS.md`.
