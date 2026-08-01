# Test Plan

## v1 Success Scenario (manual)
1. Open app URL — dashboard loads without login, shows seeded data: principal SGD 330,000, ARMW sleeve active, AMDW sleeve active
2. Click "Log Distribution" on ARMW — enter ex-date 2026-09-04, gross SGD 1,200
3. Verify withholding auto-computed as SGD 360, net as SGD 840
4. Submit — verify dashboard updates: principal shows SGD 330,840, monthly cash received shows SGD 840, cumulative updated
5. Verify audit log shows `distribution_logged` entry with timestamp
6. Log another distribution on AMDW — gross SGD 900 → net SGD 630
7. Verify monthly total now SGD 1,470 — warning panel should show amber (projected income < 90% of 6,094.91)
8. Simulate monthly withdrawal: date 2026-10-01, amount SGD 6,094.91
9. Verify principal drops by withdrawal amount, withdrawal logged in audit, principal_after correct
10. Verify warning panel reflects updated state after withdrawal

## Future Acceptance Criteria: Project Cycles

### Existing Principal Preservation
1. An owner can explicitly select an existing principal snapshot as the protected principal baseline.
2. The selected snapshot remains unchanged, and all other snapshots remain historical and unclassified.
3. Cycle creation records the adoption in the audit log.

### Statement Reconciliation
1. Several statement deposits may be assigned to one project cycle and the system calculates their sum.
2. The sum is compared with protected principal and any variance is shown without overwriting the original.
3. Reconciliation and adjustments require owner confirmation and preserve before-and-after values, evidence, actor, and timestamp.

### Distribution and Withdrawal Separation
1. Archiving a distribution batch does not change protected principal or hide historical reporting.
2. Distribution achievement and actual withdrawal extraction are reported separately.
3. An actual withdrawal can be reconciled after its related distribution batch is archived.
4. Simulated withdrawals do not contribute to cumulative extracted.

### Allocation Advisory and Access
1. Values from 0% through 100% remain valid and save successfully.
2. Values below 10% or above 25% create a non-blocking warning identifying the sleeve.
3. Production data remains behind Magic Link authentication with owner-scoped RLS.
4. Any future public demo uses synthetic data and cannot access production owner records.

## Empty State Test
1. Fresh database (no seed) — dashboard shows "No sleeves yet" with create button, principal SGD 0, all panels show empty-state copy, no crashes

## Error State Test
1. Submit distribution with gross = 0 or negative — verify validation error, no row inserted
2. Submit distribution without selecting a sleeve — verify form error
3. Simulate withdrawal greater than principal — verify validation blocks it
4. Network failure mid-submit — verify error toast, no stale optimistic UI

## Loading State Test
1. Dashboard initial load shows skeleton/spinner for principal, sleeve table, warning panel before data renders

## Permission Test (Sprint 3)
1. User A logs distribution → User B cannot see User A's data after RLS lock-down
2. Unauthenticated user redirected to /login (except public demo view)

## Sprint 4: Automation & Data Export
1. **Pre-Build Sync:** Run `npm run sync:moomoo` — verify OpenD connection or mock fallback output is written to `public/build-stamp.json`.
2. **Build-Stamp Indicator:** Verify dashboard header shows 🟢 (success), 🔴 (failed), or 🟡 (mocked) matching the stamp JSON.
3. **Sleeve Dropdown:** Open 'Add Sleeve' dialog — verify ticker input is a dropdown populated from `market_data` instead of free text.
4. **CSV Export:** Click "Export CSV" on Distributions and Audit Log — verify native browser download triggers and CSV is correctly formatted.
5. **Deprecation Warning:** Manually set a ticker `status = 'deprecated'` with a `superseded_by` in Supabase — verify amber warning banner appears in the table. Click "Migrate" and verify sleeve updates to new ticker without data loss.
