# Agentic Layer

## Risk Levels

### Low (auto) — v1
- Compute withholding and net on distribution entry
- Recalculate principal after distribution/withdrawal
- Run warning threshold checks after every write
- Write audit log entry for every action

### Medium (light approval) — Next
- Flag a sleeve for replacement when decay trigger fires
- Draft a replacement trade proposal (new entry price, size, allocation)
- Update sleeve status to 'flagged' or 'replaced'

### High (always approval) — Later
- Execute a simulated replacement trade (close current sleeve, open new)
- Execute a withdrawal (move from 'scheduled' to 'executed')

### Critical (human-only) — Always
- Delete a distribution or withdrawal record
- Manually override principal balance
- Delete a sleeve

## Named Tools (v1)
- `log_distribution` — insert distribution + recompute principal + check warnings + audit
- `execute_withdrawal` — deduct from principal + audit
- `check_warnings` — evaluate all three thresholds

## Audit Log Fields
| Field | Value |
|---|---|
| action | string verb |
| entity_type | table name |
| entity_id | uuid |
| metadata | jsonb snapshot of before/after |
| created_at | timestamptz |

## v1 vs Later
- **v1:** All actions are manual user-triggered; system auto-computes derived values and warnings.
- **Later:** Agent drafts replacement proposals; user approves; agent executes and logs.